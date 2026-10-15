import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { ScanLine, Camera, CameraOff, Upload, Loader2, AlertTriangle, CheckCircle2, XCircle, User } from 'lucide-react';
import { resolveQr } from '../../services/qrService.js';

const fmt = (d) => (d ? new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—');

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-4 py-2 border-b border-white/5 text-xs">
    <span className="text-neutral-500">{label}</span>
    <span className="text-white text-right font-medium">{value || '—'}</span>
  </div>
);

/** QR scanner for organization members and the master admin: shows the scanned user's details. */
export const ScannerPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(0);
  const busyRef = useRef(false);

  const [scanning, setScanning] = useState(false);
  const [manual, setManual] = useState('');
  const [member, setMember] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  const lookup = useCallback(async (payload) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setLoading(true);
    setError('');
    try {
      setMember(await resolveQr(payload));
      stopCamera();
    } catch (e) {
      setMember(null);
      setError(e.message);
    } finally {
      setLoading(false);
      busyRef.current = false;
    }
  }, [stopCamera]);

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(img.data, img.width, img.height);
      if (code?.data && !busyRef.current) lookup(code.data);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [lookup]);

  const startCamera = async () => {
    setError('');
    setMember(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setScanning(true);
      // The <video> mounts once `scanning` is true
      requestAnimationFrame(async () => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        rafRef.current = requestAnimationFrame(tick);
      });
    } catch {
      setError('Camera unavailable. Allow camera access, or paste the code / upload a QR image below.');
    }
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height);
      const code = jsQR(data.data, data.width, data.height);
      URL.revokeObjectURL(img.src);
      if (code?.data) lookup(code.data);
      else setError('No QR code found in that image.');
    };
    img.src = URL.createObjectURL(file);
  };

  const reset = () => { setMember(null); setError(''); setManual(''); };

  return (
    <section className="w-full max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
          <ScanLine className="w-6 h-6 text-teal-400" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Member <span className="font-serif italic font-normal text-teal-400">Scanner</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">Scan a donor's or patient's LifeVault QR code to view their details.</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-neutral-950/80 border border-white/10 p-5 space-y-4">
          <div className="aspect-square rounded-xl bg-black border border-white/10 overflow-hidden flex items-center justify-center relative">
            {scanning ? (
              <>
                <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-8 border-2 border-teal-400/70 rounded-xl pointer-events-none" />
              </>
            ) : (
              <div className="text-center text-neutral-500 text-xs px-6">
                {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : <><Camera className="w-8 h-8 mx-auto mb-2 text-neutral-600" />Camera is off</>}
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex gap-2">
            {scanning ? (
              <button onClick={stopCamera} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer">
                <CameraOff className="w-4 h-4" /> Stop camera
              </button>
            ) : (
              <button onClick={startCamera} className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer">
                <Camera className="w-4 h-4" /> Start scanning
              </button>
            )}
            <label className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" /> Image
              <input type="file" accept="image/*" onChange={onFile} className="hidden" />
            </label>
          </div>
          <div className="flex gap-2">
            <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Or paste the QR code text…"
              className="flex-1 px-3 py-2 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-teal-500/40" />
            <button onClick={() => manual.trim() && lookup(manual.trim())} disabled={loading}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white cursor-pointer disabled:opacity-50">Look up</button>
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-950/80 border border-white/10 p-5">
          {!member ? (
            <div className="h-full min-h-48 flex flex-col items-center justify-center text-center text-neutral-500 text-xs gap-2">
              <User className="w-8 h-8 text-neutral-700" />
              Scanned member details will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-white truncate">{member.name}</h2>
                  <p className="text-[11px] text-neutral-500 font-mono truncate">{member.email}</p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 font-bold font-mono text-sm shrink-0">{member.bloodgroup}</span>
              </div>

              <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border ${member.eligibleToDonate && member.isAvailableForDonation
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}>
                {member.eligibleToDonate && member.isAvailableForDonation ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {!member.isAvailableForDonation
                  ? 'Marked as not available to donate'
                  : member.eligibleToDonate
                  ? 'Eligible to donate now'
                  : `Not eligible – ${member.daysUntilEligible} day(s) left in the 56-day gap`}
              </div>

              <div>
                <Row label="Phone" value={member.phone} />
                <Row label="Gender" value={member.gender} />
                <Row label="Date of birth" value={fmt(member.DOB)} />
                <Row label="Pincode" value={member.pincode} />
                <Row label="Total donations" value={member.totalDonations} />
                {member.donationsAtThisOrg !== null && <Row label="Donations at this organization" value={member.donationsAtThisOrg} />}
                <Row label="Last donation" value={fmt(member.lastDonation)} />
                <Row label="Medical conditions" value={member.medicalConditions} />
                <Row label="Precautions" value={member.donationPrecautions} />
                <Row
                  label="Emergency contact"
                  value={member.emergencyContactName ? `${member.emergencyContactName}${member.emergencyContactRelation ? ` (${member.emergencyContactRelation})` : ''} – ${member.emergencyContactPhone || '—'}` : null}
                />
              </div>
              <button onClick={() => { reset(); startCamera(); }} className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold cursor-pointer">Scan another</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ScannerPage;
