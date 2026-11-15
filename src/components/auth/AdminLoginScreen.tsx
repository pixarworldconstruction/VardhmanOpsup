import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Activity,
} from 'lucide-react';

export const AdminLoginScreen: React.FC = () => {
  const { loginAdmin, registerAdmin } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showRegisterOption, setShowRegisterOption] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both admin email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await loginAdmin(email, password);
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage('Authentication successful. Loading Admin Dashboard...');
    } else {
      setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
      // If error indicates user does not exist or credentials rejected in fresh project, show registration shortcut
      if (
        result.error?.toLowerCase().includes('not found') ||
        result.error?.toLowerCase().includes('credential') ||
        result.error?.toLowerCase().includes('register')
      ) {
        setShowRegisterOption(true);
      }
    }
  };

  const handleRegisterAdmin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await registerAdmin(email, password);
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage('Admin account created and authenticated in Firebase! Entering dashboard...');
    } else {
      setErrorMessage(result.error || 'Failed to create admin user in Firebase.');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-teal-50/40 to-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Brand identity header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-teal-600 text-white shadow-lg mb-3">
            <span className="font-extrabold text-2xl tracking-tight">VO</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Vardhman Opsup
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Operation Material Suppliers • Secure Admin Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
          {/* Card Top Banner */}
          <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Firebase Authentication
                </h2>
                <p className="text-[11px] text-slate-400">
                  Protected System Access
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Auth v11
            </span>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-medium leading-relaxed">{errorMessage}</p>
                  {showRegisterOption && (
                    <div className="pt-2">
                      <p className="text-[11px] text-rose-800">
                        Is this user not registered in Firebase Auth yet?
                      </p>
                      <button
                        type="button"
                        onClick={handleRegisterAdmin}
                        disabled={isLoading}
                        className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 text-xs font-semibold shadow-2xs transition"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Register & Initialize Admin in Firebase</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{successMessage}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                User ID / Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@vardhmanopsup.com"
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold py-3 text-sm shadow-md hover:shadow-lg disabled:opacity-60 transition"
            >
              {isLoading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Footer information */}
          <div className="border-t border-slate-100 bg-slate-50 p-4 text-center">
            <p className="text-[11px] font-medium text-slate-600">
              Website development by: <strong className="font-bold text-slate-800">Pixar World Info Tech</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
