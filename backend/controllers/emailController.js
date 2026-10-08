import nodemailer from 'nodemailer';

/**
 * =======================================================================================
 * EMAIL CONTROLLER
 * =======================================================================================
 * Single place for every outgoing email. Controllers call the functions exported here
 * instead of talking to nodemailer themselves:
 *   - sendVerificationOtpEmail -> signup OTP
 *   - sendRequestEmail         -> donor / seeker request submitted + admin/hospital replies
 * Email is best-effort: a failure is logged and never breaks the request that triggered it.
 * =======================================================================================
 */

let transporter;

function getTransporter() {
  if (transporter === undefined) {
    transporter = !process.env.SMTP_USER || !process.env.SMTP_PASS
      ? null
      : nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_PORT === '465',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
  }
  return transporter;
}

/** Sends one email. Resolves true on success, false when SMTP is missing or sending fails. */
export async function sendEmail({ to, subject, text, html }) {
  const smtp = getTransporter();
  if (!smtp || !to) return false;
  try {
    await smtp.sendMail({
      from: `"LifeVault BBMS" <${process.env.SMTP_USER || 'no-reply@lifevault.org'}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`[SMTP] "${subject}" sent to ${to}`);
    return true;
  } catch (err) {
    console.warn(`[SMTP Warning] Failed to send "${subject}" to ${to}:`, err.message);
    return false;
  }
}

const escapeHtml = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Shared LifeVault-branded email shell. `body` must already be safe HTML. */
const layout = (title, body) => `
  <div style="background-color: #0a0a0a; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(239, 68, 68, 0.2);">
    <div style="margin-bottom: 24px;">
      <span style="font-size: 28px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
        Life<span style="font-style: italic; color: #a855f7;">Vault</span>
      </span>
    </div>
    <div style="background-color: #121212; border: 1px solid #262626; border-radius: 20px; padding: 32px; margin-bottom: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 12px; color: #ffffff;">${escapeHtml(title)}</h2>
      ${body}
    </div>
    <div style="font-size: 11px; color: #525252;">
      &copy; 2026 LifeVault Emergency Response Network. All rights reserved.
    </div>
  </div>
`;

const paragraph = (text) => `<p style="font-size: 14px; color: #a3a3a3; line-height: 1.5; margin: 0 0 16px;">${escapeHtml(text)}</p>`;

/** Signup verification code. In development (no SMTP / send failure) the OTP is printed to the console. */
export async function sendVerificationOtpEmail(email, otp) {
  const sent = await sendEmail({
    to: email,
    subject: 'LifeVault Email Verification Code',
    text: `Your LifeVault verification code is: ${otp}. It will expire in 5 minutes.`,
    html: layout(
      'Verify Your Email Address',
      `${paragraph('Thank you for registering with LifeVault. Use the verification code below to complete your sign-up process. This code is valid for 5 minutes.')}
       <div style="background-color: #171717; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 12px; padding: 16px 24px; display: inline-block; margin-bottom: 32px;">
         <span style="font-size: 36px; font-weight: 800; font-family: monospace; letter-spacing: 6px; color: #ef4444; text-shadow: 0 0 10px rgba(239, 68, 68, 0.2);">${escapeHtml(otp)}</span>
       </div>
       <p style="font-size: 12px; color: #737373; margin: 0; line-height: 1.5;">If you did not request this code, you can safely ignore this email.</p>`
    ),
  });

  if (!sent) {
    console.log(`\n--------------------------------------------------`);
    console.log(`🔑  [DEVELOPMENT MODE] Verification OTP for ${email}: ${otp}`);
    console.log(`--------------------------------------------------\n`);
  }
  return sent;
}

// ── Donor / seeker request lifecycle ──────────────────────────────────────────

const REQUEST_EVENTS = {
  SUBMITTED: {
    subject: (r) => `We received your ${r.noun} request`,
    title: 'Request Received',
    lead: (r) => `Your ${r.noun} request${r.target} has been submitted and is awaiting admin verification. We'll email you as soon as there is an update.`,
  },
  VERIFIED: {
    subject: (r) => `Your ${r.noun} request was verified`,
    title: 'Request Verified',
    lead: (r) => `Good news — an admin verified your ${r.noun} request${r.target}. It is now with the facility for review and scheduling.`,
  },
  REJECTED: {
    subject: (r) => `Update on your ${r.noun} request`,
    title: 'Request Not Approved',
    lead: (r) => `Unfortunately your ${r.noun} request${r.target} could not be approved.`,
  },
  ACCEPTED: {
    subject: (r) => `Your ${r.noun} request was accepted`,
    title: 'Request Accepted & Scheduled',
    lead: (r) => `${r.target ? r.target.replace(/^ at /, '') : 'The facility'} accepted your ${r.noun} request. Please see the schedule below.`,
  },
  DENIED: {
    subject: (r) => `Update on your ${r.noun} request`,
    title: 'Request Declined',
    lead: (r) => `Unfortunately your ${r.noun} request${r.target} was declined.`,
  },
  ALLOCATED: {
    subject: () => 'Blood units reserved for your request',
    title: 'Blood Reserved',
    lead: (r) => `Blood units have been reserved for your request${r.target}. The facility will dispatch them shortly.`,
  },
  COMPLETED: {
    subject: (r) => (r.isDonor ? 'Thank you for donating blood' : 'Your blood request has been fulfilled'),
    title: (r) => (r.isDonor ? 'Donation Completed' : 'Request Fulfilled'),
    lead: (r) => (r.isDonor
      ? `Thank you! Your donation${r.target} has been received. You are helping save lives.`
      : `Your blood request${r.target} has been fulfilled and the units have been released.`),
  },
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' }) : null);

/**
 * Emails the donor or seeker who owns `request` (a request populated with u_id,
 * hospital_id / bloodbank_id) about a lifecycle event.
 *
 * @param {'DONOR'|'SEEKER'} kind
 * @param {'SUBMITTED'|'VERIFIED'|'REJECTED'|'ACCEPTED'|'ALLOCATED'|'DENIED'|'COMPLETED'} event
 * @param {object} request populated GiverRequest / SeekerRequest
 */
export async function sendRequestEmail(kind, event, request) {
  try {
    const template = REQUEST_EVENTS[event];
    const to = request?.u_id?.email;
    if (!template || !to) return false;

    const isDonor = kind === 'DONOR';
    const facility = request.hospital_id?.hos_name || request.bloodbank_id?.bank_name;
    const ctx = { isDonor, noun: isDonor ? 'donation' : 'blood', target: facility ? ` at ${facility}` : '' };

    const date = request.appointment_date || request.schedule_date;
    const time = request.appointment_time || request.schedule_time;
    const venue = request.appointment_venue || request.pickup_venue;
    const reason = event === 'REJECTED' || event === 'DENIED' ? request.rejection_reason : null;
    const note = event === 'VERIFIED' ? request.verification_notes : event === 'ACCEPTED' ? request.scheduling_notes : null;

    const details = [
      ['Name', request.u_id.name || request.u_id.username],
      !isDonor && request.patient_name ? ['Patient', request.patient_name] : null,
      ['Blood group', isDonor ? request.u_id.bloodgroup : request.bloodgroup],
      !isDonor && request.units ? ['Units', request.units] : null,
      facility ? ['Facility', facility] : null,
      event === 'ACCEPTED' && date ? ['Date', `${fmtDate(date)}${time ? ` at ${time}` : ''}`] : null,
      event === 'ACCEPTED' && venue ? ['Venue', venue] : null,
      reason ? ['Reason', reason] : null,
      note ? ['Note', note] : null,
      ['Reference', String(request._id).slice(-6).toUpperCase()],
    ].filter((row) => row && row[1]);

    const title = typeof template.title === 'function' ? template.title(ctx) : template.title;
    const lead = template.lead(ctx);
    const rows = details
      .map(([k, v]) => `<tr><td style="padding: 6px 12px 6px 0; color: #737373; font-size: 12px; text-align: left;">${escapeHtml(k)}</td><td style="padding: 6px 0; color: #ffffff; font-size: 13px; text-align: left;">${escapeHtml(v)}</td></tr>`)
      .join('');

    return await sendEmail({
      to,
      subject: `${template.subject(ctx)} – LifeVault`,
      text: `${lead}\n\n${details.map(([k, v]) => `${k}: ${v}`).join('\n')}`,
      html: layout(title, `${paragraph(lead)}<table style="margin: 0 auto; border-collapse: collapse;">${rows}</table>`),
    });
  } catch (err) {
    console.warn('[SMTP Warning] Could not build request email:', err.message);
    return false;
  }
}
