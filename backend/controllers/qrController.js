import jwt from 'jsonwebtoken';
import { User, Donor, BloodBag, Inventory } from '../models/index.js';

/**
 * QR identity: every user gets a signed, tamper-proof code that only resolves to their profile
 * for logged-in organization members (staff, org admins) and the master admin.
 */
const QR_PREFIX = 'lifevault:qr:';
const QR_TTL = '365d';
const secret = () =>
  process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'super-secret-lifevault-access-key-2026';

const maskPhone = (p) => (p ? `${'•'.repeat(Math.max(0, String(p).length - 4))}${String(p).slice(-4)}` : null);

/** GET /api/v1/qr/me — the signed QR payload for the logged-in user */
export async function getMyQr(req, res) {
  const user = await User.findById(req.user.sub).select('_id').lean();
  if (!user) {
    // Master admins have no citizen profile, hence no QR
    return res.status(404).json({ success: false, error: 'No donor profile is linked to this account.' });
  }
  const token = jwt.sign({ sub: String(user._id), typ: 'qr' }, secret(), { expiresIn: QR_TTL });
  return res.status(200).json({ success: true, payload: `${QR_PREFIX}${token}` });
}

/** POST /api/v1/qr/resolve { payload } — member details for a scanned code (org members & master admin) */
export async function resolveQr(req, res) {
  try {
    const raw = String(req.body?.payload || '').trim();
    if (!raw.startsWith(QR_PREFIX)) {
      return res.status(400).json({ success: false, error: 'This is not a LifeVault QR code.' });
    }
    let decoded;
    try {
      decoded = jwt.verify(raw.slice(QR_PREFIX.length), secret());
    } catch {
      return res.status(400).json({ success: false, error: 'This QR code is invalid or has expired. Ask the user to open their profile again.' });
    }
    if (decoded.typ !== 'qr') {
      return res.status(400).json({ success: false, error: 'This is not a LifeVault QR code.' });
    }

    const user = await User.findById(decoded.sub).lean();
    if (!user) {
      return res.status(404).json({ success: false, error: 'This account no longer exists.' });
    }

    const donations = await Donor.find({ u_id: user._id }).populate('bag_id', 'I_ID').sort({ date_of_donation: -1 }).lean();
    let atThisOrg = null;
    if (!req.scope.all) {
      const invIds = (await Inventory.find({ hos_or_bank_id: req.scope.id, hos_or_bank_type: req.scope.type }).select('_id').lean())
        .map((i) => String(i._id));
      atThisOrg = donations.filter((d) => d.bag_id && invIds.includes(String(d.bag_id.I_ID))).length;
    }
    const last = donations[0]?.date_of_donation || null;
    const daysSince = last ? Math.floor((Date.now() - new Date(last).getTime()) / 86400000) : null;

    return res.status(200).json({
      success: true,
      member: {
        id: user._id,
        name: user.name || user.username,
        email: user.email,
        phone: user.privacyMaskPhone ? maskPhone(user.phone) : user.phone,
        bloodgroup: user.bloodgroup,
        gender: user.gender,
        DOB: user.DOB,
        pincode: user.pincode,
        role: user.role,
        status: user.status,
        isAvailableForDonation: user.isAvailableForDonation !== false,
        medicalConditions: user.medicalConditions || null,
        donationPrecautions: user.donationPrecautions || null,
        emergencyContactName: user.emergencyContactName || null,
        emergencyContactPhone: user.emergencyContactPhone || null,
        emergencyContactRelation: user.emergencyContactRelation || null,
        totalDonations: donations.length,
        donationsAtThisOrg: atThisOrg,
        lastDonation: last,
        eligibleToDonate: daysSince === null || daysSince >= 56,
        daysUntilEligible: daysSince !== null && daysSince < 56 ? 56 - daysSince : 0,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
