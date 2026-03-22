import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
      </div>
    </div>
  );
}
