import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const switchMode = (m) => { setMode(m); setError(''); setMessage(''); };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate('/');
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else setMessage('Account created! Check your email to confirm before logging in.');
    setLoading(false);
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) setError(error.message);
    else setMessage('Password reset link sent — check your email.');
    setLoading(false);
  };

  const handleOAuth = async (provider) => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) setError(error.message);
  };

  const submitHandler = mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleForgot;

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4" style={{ fontFamily: 'Georgia, serif' }}>
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-8 w-full max-w-md">

        {/* Login / Sign Up tabs */}
        {mode !== 'forgot' && (
          <div className="flex gap-1 mb-8 bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-2 text-sm rounded-lg transition-all ${mode === 'login' ? 'bg-white shadow-sm text-stone-800 font-medium' : 'text-stone-400 hover:text-stone-600'}`}
            >
              Login
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2 text-sm rounded-lg transition-all ${mode === 'signup' ? 'bg-white shadow-sm text-stone-800 font-medium' : 'text-stone-400 hover:text-stone-600'}`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl font-bold text-stone-800 mb-1">
          {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset password'}
        </h1>
        <p className="text-stone-400 text-sm mb-6">
          {mode === 'login' ? 'Sign in to your account' : mode === 'signup' ? 'Start saving smarter today' : 'Enter your email to receive a reset link'}
        </p>

        {/* Error / Success */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl px-4 py-3 mb-4">
            {message}
          </div>
        )}

        <form onSubmit={submitHandler} className="flex flex-col gap-4">
          {/* Email */}
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full pl-9 pr-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400 text-stone-700"
            />
          </div>

          {/* Password */}
          {mode !== 'forgot' && (
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full pl-9 pr-10 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400 text-stone-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          )}

          {/* Confirm Password (signup only) */}
          {mode === 'signup' && (
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                className="w-full pl-9 pr-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-stone-400 text-stone-700"
              />
            </div>
          )}

          {/* Forgot password link */}
          {mode === 'login' && (
            <button
              type="button"
              onClick={() => switchMode('forgot')}
              className="text-xs text-stone-400 hover:text-stone-600 text-right -mt-2"
            >
              Forgot password?
            </button>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="bg-stone-800 hover:bg-stone-700 text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : mode === 'login' ? (
              <><LogIn size={15} /> Sign in</>
            ) : mode === 'signup' ? (
              <><UserPlus size={15} /> Create account</>
            ) : (
              'Send reset email'
            )}
          </button>

          {/* Back link for forgot */}
          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-xs text-stone-400 hover:text-stone-600 text-center"
            >
              Back to login
            </button>
          )}
        </form>

        {/* OAuth — only on login/signup */}
        {mode !== 'forgot' && (
          <>
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-xs text-stone-400">or continue with</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleOAuth('google')}
                className="flex items-center justify-center gap-3 w-full py-3 border border-stone-200 rounded-xl text-sm text-stone-700 hover:bg-stone-50 transition-all"
              >
                <GoogleIcon />
                Continue with Google
              </button>
              <button
                disabled
                className="flex items-center justify-center gap-3 w-full py-3 border border-stone-200 rounded-xl text-sm text-stone-300 bg-stone-50 cursor-not-allowed"
              >
                <AppleIcon />
                Continue with Apple
                <span className="text-xs bg-stone-200 text-stone-400 px-2 py-0.5 rounded-full ml-1">Coming soon</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
