import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppUser, UserRole } from '../../types';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  X,
  Phone,
  Briefcase,
  Lock,
  Mail,
  User,
  Sparkles,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({ isOpen, onClose }) => {
  const { users, addUser, updateUser, deleteUser, activeUser } = useApp();

  const [isAddMode, setIsAddMode] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Feedback states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('staff');
    setPhone('');
    setDesignation('');
    setTemporaryPassword('');
    setIsActive(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsAddMode(false);
    setEditingUser(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    // Generate a secure first-time temporary password
    const autoPass = `VO#${Math.floor(100000 + Math.random() * 900000)}`;
    setTemporaryPassword(autoPass);
    setIsAddMode(true);
  };

  const handleOpenEdit = (u: AppUser) => {
    resetForm();
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setPhone(u.phone || '');
    setDesignation(u.designation || '');
    setTemporaryPassword(u.temporaryPassword || '');
    setIsActive(u.isActive);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim() || !email.trim()) {
      setErrorMessage('Full name and email are required.');
      return;
    }

    if (isAddMode && (!temporaryPassword || temporaryPassword.length < 6)) {
      setErrorMessage('Please provide a first-time password with at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    if (isAddMode) {
      const res = await addUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        phone: phone.trim(),
        designation: designation.trim(),
        temporaryPassword: temporaryPassword.trim(),
        isFirstLogin: true,
        isActive: true,
      });

      setIsSubmitting(false);

      if (res.success) {
        setSuccessMessage(`User "${name}" created successfully with temporary password.`);
        setTimeout(() => {
          resetForm();
        }, 1200);
      } else {
        setErrorMessage(res.error || 'Failed to create user.');
      }
    } else if (editingUser) {
      updateUser({
        ...editingUser,
        name: name.trim(),
        role,
        phone: phone.trim(),
        designation: designation.trim(),
        temporaryPassword: temporaryPassword ? temporaryPassword.trim() : editingUser.temporaryPassword,
        isActive,
      });

      setIsSubmitting(false);
      setSuccessMessage(`User "${name}" updated successfully.`);
      setTimeout(() => {
        resetForm();
      }, 1000);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Staff & User Management (Admin Only)
              </h2>
              <p className="text-xs text-slate-500">
                Create user accounts, set initial first-time passwords, and manage team access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* Notification Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form (Add or Edit) */}
          {(isAddMode || editingUser) ? (
            <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-teal-600" />
                  <span>{isAddMode ? 'Add New Team User' : `Edit User: ${editingUser?.name}`}</span>
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Full Name *</label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Sharma"
                        required
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">User Email ID *</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="staff@vardhmanopsup.com"
                        required
                        disabled={!isAddMode}
                        className={`w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-600 ${
                          !isAddMode ? 'bg-slate-100 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Role */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Access Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-600"
                    >
                      <option value="staff">Staff (Standard)</option>
                      <option value="manager">Manager (Dispatch & Inventory)</option>
                      <option value="billing">Billing Officer (Invoices)</option>
                      <option value="admin">Administrator (Full Access)</option>
                    </select>
                  </div>

                  {/* Designation */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Designation / Title</label>
                    <div className="relative">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Store Executive"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Phone</label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>
                </div>

                {/* First-time Password Section */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-teal-600" />
                      <span>{isAddMode ? 'First-Time Temporary Password *' : 'Reset Temporary Password (Optional)'}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setTemporaryPassword(`VO#${Math.floor(100000 + Math.random() * 900000)}`)}
                      className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 px-2 py-0.5 rounded-md flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Auto-Generate</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={temporaryPassword}
                        onChange={(e) => setTemporaryPassword(e.target.value)}
                        placeholder="Min 6 characters (e.g. VO#928410)"
                        required={isAddMode}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-600"
                      />
                    </div>
                    {temporaryPassword && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(temporaryPassword, 'form-pass')}
                        className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1"
                        title="Copy temporary password to share with employee"
                      >
                        {copiedId === 'form-pass' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === 'form-pass' ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Provide this temporary password to the user. They can update it to their own private password anytime under "My Profile".
                  </p>
                </div>

                {/* Status Toggle (on Edit) */}
                {editingUser && (
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-700">Account Status:</label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        checked={isActive}
                        onChange={() => setIsActive(true)}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <span className="font-semibold text-emerald-700">Active</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        checked={!isActive}
                        onChange={() => setIsActive(false)}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span className="font-semibold text-rose-700">Suspended</span>
                    </label>
                  </div>
                )}

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 text-xs font-bold shadow-xs hover:shadow-md disabled:opacity-60 transition"
                  >
                    {isSubmitting ? 'Saving...' : isAddMode ? 'Create User with Password' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-slate-500 font-medium">
                Total Team Users: <strong>{users.length}</strong>
              </p>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add New User</span>
              </button>
            </div>
          )}

          {/* Users Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Team Member</th>
                    <th className="px-3 py-3">Role & Title</th>
                    <th className="px-3 py-3">Contact</th>
                    <th className="px-3 py-3">First-Time / Temp Password</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const isSuperAdmin = u.email.toLowerCase() === 'arcline02@gmail.com';
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition">
                        {/* Member */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs shrink-0">
                              {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 flex items-center gap-1">
                                <span>{u.name}</span>
                                {isSuperAdmin && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                    Primary Admin
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role & Title */}
                        <td className="px-3 py-3.5">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mb-0.5 ${
                              u.role === 'admin'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : u.role === 'manager'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : u.role === 'billing'
                                ? 'bg-teal-50 text-teal-700 border-teal-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {u.role.toUpperCase()}
                          </span>
                          <p className="text-[11px] text-slate-600 truncate max-w-[140px]">
                            {u.designation || 'Staff Member'}
                          </p>
                        </td>

                        {/* Contact */}
                        <td className="px-3 py-3.5 text-slate-600 font-medium">
                          {u.phone || '—'}
                        </td>

                        {/* Temporary Password */}
                        <td className="px-3 py-3.5">
                          {u.temporaryPassword ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-semibold border border-slate-200">
                                {u.temporaryPassword}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(u.temporaryPassword!, u.id)}
                                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
                                title="Copy password to send to employee"
                              >
                                {copiedId === u.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">User Set Private Password</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                              u.isActive ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                u.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            <span>{u.isActive ? 'Active' : 'Suspended'}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(u)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                              title="Edit User and Credentials"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {!isSuperAdmin && (
                              <button
                                type="button"
                                onClick={() => setUserToDelete(u)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                                title="Delete User Profile"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3.5 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Admin-authoritative user management synced with Firebase</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>

      {/* Confirmation Modal for User Deletion */}
      <ConfirmModal
        isOpen={!!userToDelete}
        title="Delete Team Member"
        message={`Are you sure you want to delete user "${userToDelete?.name}" (${userToDelete?.email})?`}
        subMessage="This user will lose access to the portal immediately."
        confirmLabel="Delete User"
        onConfirm={() => {
          if (userToDelete) {
            deleteUser(userToDelete.id);
            setUserToDelete(null);
          }
        }}
        onClose={() => setUserToDelete(null)}
      />
    </div>
  );
};
