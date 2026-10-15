import bcrypt from 'bcrypt';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { Staff, User, Hospital, BloodBank } from '../models/index.js';
import { STAFF_ROLES } from '../models/Staff.js';

/**
 * ORGANIZATION ACCOUNTS (no public sign-up):
 *   master admin  -> creates / manages the ORG_ADMIN of each hospital & blood bank
 *   org admin     -> creates / manages the staff of its own organization
 *   staff         -> cannot create or manage accounts
 * Accounts are managed by whoever created them (master admin can manage every account).
 */

const SALT_ROUNDS = 12;
const ASSIGNABLE_STAFF_ROLES = STAFF_ROLES.filter((r) => r !== 'ORG_ADMIN');
const FACILITY_MODELS = { Hospital, BloodBank };

const generatePassword = () => `Lv-${crypto.randomBytes(9).toString('base64url')}`;

const publicAccount = (s) => ({
  id: s._id,
  userId: s.u_id?._id,
  name: s.u_id?.name || s.u_id?.username,
  email: s.u_id?.email,
  phone: s.u_id?.phone,
  role: s.role,
  department: s.department,
  facilityId: s.hos_or_bank_id?._id || s.hos_or_bank_id,
  facilityType: s.hos_or_bank_type,
  facilityName: s.hos_or_bank_id?.hos_name || s.hos_or_bank_id?.bank_name || null,
  createdAt: s.createdAt,
});

const populateAccount = (query) =>
  query
    .populate('u_id', 'name username email phone')
    .populate({ path: 'hos_or_bank_id', select: 'hos_name bank_name' });

/** Can the requester manage this staff account? (master admin: any; org admin: staff it created in its org) */
const canManage = (req, staff) =>
  req.scope.all
  || (staff.role !== 'ORG_ADMIN'
    && String(staff.hos_or_bank_id?._id || staff.hos_or_bank_id) === String(req.scope.id)
    && String(staff.created_by) === String(req.user.sub));

/** GET /accounts — master admin: every account; org admin: staff of its own organization */
export async function listAccounts(req, res) {
  try {
    const filter = req.scope.all
      ? {}
      : { hos_or_bank_id: req.scope.id, hos_or_bank_type: req.scope.type, _id: { $ne: req.scope.staffId } };
    const staff = await populateAccount(Staff.find(filter).sort({ hos_or_bank_type: 1, role: 1, createdAt: 1 })).lean();
    const data = staff.map((s) => ({ ...publicAccount(s), manageable: canManage(req, s) }));
    return res.status(200).json({ success: true, count: data.length, accounts: data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/** POST /accounts — master admin creates an ORG_ADMIN; org admin creates staff in its org */
export async function createAccount(req, res) {
  try {
    const { name, email, phone, department, password } = req.body || {};
    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ success: false, error: 'Name and email are required.' });
    }
    if (password && password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters.' });
    }

    let facilityType;
    let facilityId;
    let role;
    if (req.scope.all) {
      facilityType = req.body.facility_type;
      facilityId = req.body.facility_id;
      role = 'ORG_ADMIN';
      if (!FACILITY_MODELS[facilityType] || !mongoose.isValidObjectId(facilityId)) {
        return res.status(400).json({ success: false, error: 'facility_type (Hospital | BloodBank) and facility_id are required.' });
      }
    } else {
      facilityType = req.scope.type;
      facilityId = req.scope.id;
      role = req.body.role || 'STAFF';
      if (!ASSIGNABLE_STAFF_ROLES.includes(role)) {
        return res.status(400).json({ success: false, error: `Role must be one of: ${ASSIGNABLE_STAFF_ROLES.join(', ')}.` });
      }
    }

    const facility = await FACILITY_MODELS[facilityType].findById(facilityId).lean();
    if (!facility) {
      return res.status(404).json({ success: false, error: 'Organization not found.' });
    }
    if (role === 'ORG_ADMIN' && await Staff.exists({ hos_or_bank_id: facilityId, role: 'ORG_ADMIN' })) {
      return res.status(409).json({ success: false, error: 'This organization already has an admin.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (await User.exists({ email: cleanEmail })) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    const plainPassword = password || generatePassword();
    let username = cleanEmail.split('@')[0];
    if (await User.exists({ username })) username = `${username}.${crypto.randomBytes(2).toString('hex')}`;

    const user = await User.create({
      username,
      email: cleanEmail,
      password: await bcrypt.hash(plainPassword, SALT_ROUNDS),
      DOB: new Date('1990-01-01'),
      pincode: facility.pincode || '000000',
      bloodgroup: 'O+',
      gender: 'OTHER',
      name: name.trim(),
      phone: phone || undefined,
      role,
      status: 'ACTIVE',
    });
    let staff;
    try {
      staff = await Staff.create({
        u_id: user._id,
        role,
        department: department || (role === 'ORG_ADMIN' ? 'Administration' : 'Blood Services'),
        licence_id: `ORG-${crypto.randomBytes(5).toString('hex').toUpperCase()}`,
        hos_or_bank_id: facilityId,
        hos_or_bank_type: facilityType,
        created_by: req.user.sub,
      });
    } catch (err) {
      await User.deleteOne({ _id: user._id });
      throw err;
    }

    const created = await populateAccount(Staff.findById(staff._id)).lean();
    return res.status(201).json({
      success: true,
      message: `${role === 'ORG_ADMIN' ? 'Organization admin' : 'Staff'} account created.`,
      account: publicAccount(created),
      // Shown once so the creator can hand the credentials over
      temporaryPassword: password ? undefined : plainPassword,
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

async function loadManageable(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ success: false, error: 'Account not found.' });
    return null;
  }
  const staff = await Staff.findById(req.params.id);
  if (!staff || !canManage(req, staff)) {
    res.status(staff ? 403 : 404).json({
      success: false,
      error: staff ? 'You can only manage accounts you created.' : 'Account not found.',
    });
    return null;
  }
  return staff;
}

/** PUT /accounts/:id — edit name / phone / department / role, or reset the password */
export async function updateAccount(req, res) {
  try {
    const staff = await loadManageable(req, res);
    if (!staff) return;
    const { name, phone, department, role, password } = req.body || {};

    if (role !== undefined && role !== staff.role) {
      if (staff.role === 'ORG_ADMIN' || !ASSIGNABLE_STAFF_ROLES.includes(role)) {
        return res.status(400).json({ success: false, error: `Role must be one of: ${ASSIGNABLE_STAFF_ROLES.join(', ')}.` });
      }
      staff.role = role;
    }
    if (department !== undefined) staff.department = department;
    await staff.save();

    const user = await User.findById(staff.u_id).select('+password');
    if (user) {
      if (name !== undefined && name.trim()) user.name = name.trim();
      if (phone !== undefined) user.phone = phone;
      user.role = staff.role;
      if (password) {
        if (password.length < 8) {
          return res.status(400).json({ success: false, error: 'Password must be at least 8 characters.' });
        }
        user.password = await bcrypt.hash(password, SALT_ROUNDS);
      }
      await user.save();
    }

    const updated = await populateAccount(Staff.findById(staff._id)).lean();
    return res.status(200).json({ success: true, message: 'Account updated.', account: publicAccount(updated) });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

/** DELETE /accounts/:id */
export async function deleteAccount(req, res) {
  try {
    const staff = await loadManageable(req, res);
    if (!staff) return;
    await User.deleteOne({ _id: staff.u_id });
    await staff.deleteOne();
    return res.status(200).json({ success: true, message: 'Account deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
