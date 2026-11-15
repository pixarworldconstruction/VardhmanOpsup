import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AppUser, UserRole } from '../../types';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Lock,
  Eye,
  EyeOff,
  Save,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Store,
  Search,
  UserCheck,
  Ban,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

interface AdminProfileViewProps {
  onOpenStoreModal: () => void;
}

export const AdminProfileView: React.FC<AdminProfileViewProps> = ({ onOpenStoreModal }) => {
  const {
    activeUser,
    users,
    storeProfile,
    updateCurrentProfile,
    addUser,
    updateUser,
    deleteUser,
  } = useApp();

  const isAdmin = activeUser?.role === 'admin';

  // ---- Personal Profile Form State ----
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileDesignation, setProfileDesignation] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showProfilePass, setShowProfilePass] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (activeUser) {
      setProfileName(activeUser.name || '');
      setProfilePhone(activeUser.phone || '');
      setProfileDesignation(activeUser.designation || '');
    }
  }, [activeUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileFeedback(null);

    if (!profileName.trim()) {
      setProfileFeedback({ type: 'error', text: 'Full Name is required.' });
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setProfileFeedback({ type: 'error', text: 'New password must be at least 6 characters long.' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setProfileFeedback({ type: 'error', text: 'Password confirmation does not match.' });
        return;
      }
    }

    setProfileSaving(true);
    const res = await updateCurrentProfile({
      name: profileName.trim(),
      phone: profilePhone.trim(),
      designation: profileDesignation.trim(),
      newPassword: newPassword ? newPassword.trim() : undefined,
    });
    setProfileSaving(false);

    if (res.success) {
      setProfileFeedback({
        type: 'success',
        text: newPassword
          ? 'Profile & new private password saved to Firebase!'
          : 'Your profile details have been updated.',
      });
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setProfileFeedback({ type: 'error', text: res.error || 'Could not update profile.' });
    }
  };

  // ---- Admin Team User Management State ----
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddMode, setIsAddMode] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);

  const [uName, setUName] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uRole, setURole] = useState<UserRole>('staff');
  const [uPhone, setUPhone] = useState('');
  const [uDesignation, setUDesignation] = useState('');
  const [uTempPass, setUTempPass] = useState('');
  const [uIsActive, setUIsActive] = useState(true);

  const [userSaving, setUserSaving] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [userSuccess, setUserSuccess] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const resetUserForm = () => {
    setUName('');
    setUEmail('');
    setURole('staff');
    setUPhone('');
    setUDesignation('');
    setUTempPass('');
    setUIsActive(true);
    setUserError(null);
    setIsAddMode(false);
    setEditingUser(null);
  };

  const handleOpenAddUser = () => {
    resetUserForm();
    setUserSuccess(null);
    setUTempPass(`VO#${Math.floor(100000 + Math.random() * 900000)}`);
    setIsAddMode(true);
  };

  const handleOpenEditUser = (u: AppUser) => {
    resetUserForm();
    setUserSuccess(null);
    setEditingUser(u);
    setUName(u.name);
    setUEmail(u.email);
    setURole(u.role);
    setUPhone(u.phone || '');
    setUDesignation(u.designation || '');
    setUTempPass(u.temporaryPassword || '');
    setUIsActive(u.isActive);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(null);
    setUserSuccess(null);

    if (!uName.trim() || !uEmail.trim()) {
      setUserError('Full name and email address are required.');
      return;
    }

    if (isAddMode && (!uTempPass || uTempPass.trim().length < 6)) {
      setUserError('First-time temporary password must be at least 6 characters.');
      return;
    }

    setUserSaving(true);
    if (isAddMode) {
      const res = await addUser({
        name: uName.trim(),
        email: uEmail.trim().toLowerCase(),
        role: uRole,
        phone: uPhone.trim(),
        designation: uDesignation.trim() || 'Team Member',
        temporaryPassword: uTempPass.trim(),
        isFirstLogin: true,
        isActive: true,
      });
      setUserSaving(false);

      if (res.success) {
        setUserSuccess(`User "${uName.trim()}" created in Firebase Auth with first-time password "${uTempPass.trim()}".`);
        resetUserForm();
      } else {
        setUserError(res.error || 'Failed to create user.');
      }
    } else if (editingUser) {
      const isSuperAdmin = editingUser.email.toLowerCase() === 'arcline02@gmail.com';
      updateUser({
        ...editingUser,
        name: uName.trim(),
        role: isSuperAdmin ? 'admin' : uRole,
        phone: uPhone.trim(),
        designation: uDesignation.trim(),
        temporaryPassword: uTempPass.trim() ? uTempPass.trim() : editingUser.temporaryPassword,
        isActive: isSuperAdmin ? true : uIsActive,
      });
      setUserSaving(false);
      setUserSuccess(`Updated profile & access settings for "${uName.trim()}".`);
      resetUserForm();
    }
  };

  const handleToggleUserStatus = (u: AppUser) => {
    if (u.email.toLowerCase() === 'arcline02@gmail.com') return;
    updateUser({ ...u, isActive: !u.isActive });
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.designation || '').toLowerCase().includes(q)
    );
  });

  if (!activeUser) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-teal-600" />
            <span>{isAdmin ? 'Admin Profile & User Management' : 'My Account Profile'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin
              ? 'Manage your administrator profile, change password, and add/edit/delete team users with first-time passwords.'
              : 'Update your personal contact details and replace your first-time password with a private password.'}
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={onOpenStoreModal}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition self-start sm:self-auto"
          >
            <Store className="w-4 h-4 text-teal-600" />
            <span>Edit Store Profile ({storeProfile.name})</span>
          </button>
        )}
      </div>

      {/* First-Time Login Password Update Notice */}
      {activeUser.isFirstLogin && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 flex items-start gap-3 shadow-2xs">
          <KeyRound className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-950">
              First-Time Login Detected — Set Your Personal Password
            </p>
            <p className="text-[11px] text-amber-800 mt-0.5">
              You signed in using an administrator-issued temporary password. Please enter a new private password below and click "Save My Profile" to secure your account.
            </p>
          </div>
        </div>
      )}

      {/* Section 1: My Profile & Credentials (All Authenticated Users) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Identity Summary Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3.5">
              <div className="h-14 w-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-extrabold text-xl shadow-sm shrink-0">
                {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900 truncate">{activeUser.name}</h3>
                <p className="text-xs text-slate-500 font-mono truncate">{activeUser.email}</p>
                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      activeUser.role === 'admin'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : activeUser.role === 'manager'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : activeUser.role === 'billing'
                        ? 'bg-teal-50 text-teal-700 border-teal-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {activeUser.role.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Designation</span>
                <span className="font-semibold text-slate-800 text-right">{activeUser.designation || '—'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Phone</span>
                <span className="font-semibold text-slate-800">{activeUser.phone || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Password State</span>
                <span className="font-semibold text-slate-800">
                  {activeUser.isFirstLogin ? 'Temporary Password' : 'Private Password Set'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-[11px] text-slate-500">
            Changes to your profile and password sync immediately with Firebase Authentication & Cloud Firestore.
          </div>
        </div>

        {/* Editable Personal Profile Form */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span>Edit My Profile & Login Password</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Self-Service Editor</span>
          </div>

          {profileFeedback && (
            <div
              className={`mb-4 p-3 rounded-xl border text-xs flex items-center gap-2 animate-fade-in ${
                profileFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {profileFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{profileFeedback.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                    placeholder="Your full name"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Email / Login ID</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={activeUser.email}
                    disabled
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-xs font-mono text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Designation / Role Title</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profileDesignation}
                    onChange={(e) => setProfileDesignation(e.target.value)}
                    placeholder="e.g. Operations Head"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="+91 98250 88412"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <KeyRound className="w-4 h-4 text-teal-600" />
                <h4 className="text-xs font-bold text-slate-800">Change Login Password (Optional)</h4>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Leave blank to keep your current password. Minimum 6 characters.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">New Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showProfilePass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-8 pr-8 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowProfilePass(!showProfilePass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showProfilePass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showProfilePass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={profileSaving}
                className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 text-xs font-bold shadow-xs hover:shadow-md disabled:opacity-60 transition"
              >
                <Save className="w-4 h-4" />
                <span>{profileSaving ? 'Saving Profile...' : 'Save My Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Section 2: Admin-Only Team User Management */}
      {isAdmin && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Team & User Accounts (Admin Control)
                </h3>
                <p className="text-xs text-slate-500">
                  Add users with first-time temporary passwords, edit profiles/roles, suspend or delete accounts.
                </p>
              </div>
            </div>

            {!isAddMode && !editingUser && (
              <button
                type="button"
                onClick={handleOpenAddUser}
                className="flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-xs font-bold shadow-xs transition self-start sm:self-auto"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add User with Temp Password</span>
              </button>
            )}
          </div>

          <div className="p-6 space-y-5">
            {/* Summary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Accounts</span>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">{users.length}</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Active Users</span>
                <p className="text-lg font-extrabold text-emerald-800 mt-0.5">
                  {users.filter((u) => u.isActive).length}
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Pending 1st Login</span>
                <p className="text-lg font-extrabold text-amber-800 mt-0.5">
                  {users.filter((u) => u.isFirstLogin).length}
                </p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Suspended</span>
                <p className="text-lg font-extrabold text-rose-800 mt-0.5">
                  {users.filter((u) => !u.isActive).length}
                </p>
              </div>
            </div>

            {userError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{userError}</span>
              </div>
            )}

            {userSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{userSuccess}</span>
              </div>
            )}

            {/* Add / Edit User Form */}
            {(isAddMode || editingUser) && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-teal-600" />
                    <span>{isAddMode ? 'Create New User & First-Time Password' : `Edit User: ${editingUser?.name}`}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={resetUserForm}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleUserSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Full Name *</label>
                      <input
                        type="text"
                        value={uName}
                        onChange={(e) => setUName(e.target.value)}
                        required
                        placeholder="e.g. Ramesh Sharma"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">User Email ID *</label>
                      <input
                        type="email"
                        value={uEmail}
                        onChange={(e) => setUEmail(e.target.value)}
                        required
                        disabled={!isAddMode}
                        placeholder="staff@vardhmanopsup.com"
                        className={`w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-600 ${
                          !isAddMode ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Access Role</label>
                      <select
                        value={uRole}
                        onChange={(e) => setURole(e.target.value as UserRole)}
                        disabled={editingUser?.email.toLowerCase() === 'arcline02@gmail.com'}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-600"
                      >
                        <option value="staff">Staff (Standard)</option>
                        <option value="manager">Manager (Inventory & Dispatch)</option>
                        <option value="billing">Billing Officer (Invoices)</option>
                        <option value="admin">Administrator (Full Access)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Designation</label>
                      <input
                        type="text"
                        value={uDesignation}
                        onChange={(e) => setUDesignation(e.target.value)}
                        placeholder="e.g. OT Dispatch Executive"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Phone</label>
                      <input
                        type="tel"
                        value={uPhone}
                        onChange={(e) => setUPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>

                  {/* First-Time Temporary Password */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-teal-600" />
                        <span>{isAddMode ? 'First-Time Password *' : 'Displayed / Temporary Password Reference'}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setUTempPass(`VO#${Math.floor(100000 + Math.random() * 900000)}`)}
                        className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Auto-Generate</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={uTempPass}
                        onChange={(e) => setUTempPass(e.target.value)}
                        required={isAddMode}
                        placeholder="Min 6 characters (e.g. VO#842910)"
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-600"
                      />
                      {uTempPass && (
                        <button
                          type="button"
                          onClick={() => copyText(uTempPass, 'inline-temp-pass')}
                          className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1"
                        >
                          {copiedId === 'inline-temp-pass' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedId === 'inline-temp-pass' ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {isAddMode
                        ? 'This registers the user in Firebase Authentication without signing you out. Share this password so the user can log in and change it in their profile.'
                        : 'Users can change their active login password from their own Profile page anytime.'}
                    </p>
                  </div>

                  {editingUser && editingUser.email.toLowerCase() !== 'arcline02@gmail.com' && (
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-700">Account Access:</span>
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="radio"
                          checked={uIsActive}
                          onChange={() => setUIsActive(true)}
                          className="text-teal-600"
                        />
                        <span className="font-semibold text-emerald-700">Active</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="radio"
                          checked={!uIsActive}
                          onChange={() => setUIsActive(false)}
                          className="text-rose-600"
                        />
                        <span className="font-semibold text-rose-700">Suspended</span>
                      </label>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={resetUserForm}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={userSaving}
                      className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 text-xs font-bold shadow-xs disabled:opacity-60 transition"
                    >
                      {userSaving ? 'Creating Account...' : isAddMode ? 'Create User Account' : 'Save User Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Search Bar */}
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name, email, role..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-teal-600"
              />
            </div>

            {/* Users Table */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-3 py-3">Role & Designation</th>
                      <th className="px-3 py-3">Phone</th>
                      <th className="px-3 py-3">First-Time Password</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => {
                      const isSuperAdmin = u.email.toLowerCase() === 'arcline02@gmail.com';
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs shrink-0">
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {isSuperAdmin && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                      Primary Admin
                                    </span>
                                  )}
                                </p>
                                <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                              </div>
                            </div>
                          </td>
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
                            <p className="text-[11px] text-slate-600">{u.designation || 'Team Member'}</p>
                          </td>
                          <td className="px-3 py-3.5 text-slate-600 font-medium">{u.phone || '—'}</td>
                          <td className="px-3 py-3.5">
                            {u.temporaryPassword ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-semibold border border-slate-200">
                                  {u.temporaryPassword}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copyText(u.temporaryPassword!, u.id)}
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
                                  title="Copy first-time password"
                                >
                                  {copiedId === u.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Private Password Active</span>
                            )}
                          </td>
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
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditUser(u)}
                                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                                title="Edit User Profile"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {!isSuperAdmin && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleUserStatus(u)}
                                    className={`rounded-lg p-1.5 transition ${
                                      u.isActive
                                        ? 'text-slate-400 hover:bg-amber-50 hover:text-amber-600'
                                        : 'text-emerald-600 hover:bg-emerald-50'
                                    }`}
                                    title={u.isActive ? 'Suspend User' : 'Activate User'}
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setUserToDelete(u)}
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
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
        </div>
      )}

      <ConfirmModal
        isOpen={!!userToDelete}
        title="Delete User Account"
        message={`Are you sure you want to delete user "${userToDelete?.name}" (${userToDelete?.email})?`}
        subMessage="They will immediately lose access to Vardhman Opsup."
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
