import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const provider = new GoogleAuthProvider();

export default function AuthScreen({ onAuthSuccess, lang }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, provider);
      onAuthSuccess(result.user);
    } catch (err) {
      setError('Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-xl mb-4">
            <span className="text-4xl">🛒</span>
          </div>
          <h1 className="text-3xl font-bold text-white">VIVAKART</h1>
          <p className="text-orange-100 mt-1 text-sm">
            {lang === 'hi' ? 'आपके उत्सव के लिए डोरस्टेप डिलीवरी' : 'Doorstep delivery for your celebrations'}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-6 text-center">
          <h2 className="font-bold text-stone-800 text-lg mb-1">
            {lang === 'hi' ? 'स्वागत है' : 'Welcome'}
          </h2>
          <p className="text-stone-500 text-sm mb-6">
            {lang === 'hi' ? 'जारी रखने के लिए साइन इन करें' : 'Sign in to continue'}
          </p>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border-2 border-stone-200 rounded-2xl py-3.5 px-4 font-semibold text-stone-700 hover:border-orange-300 hover:bg-orange-50 active:scale-95 transition disabled:opacity-60"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin text-orange-500" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

          <p className="text-xs text-stone-400 mt-5">
            {lang === 'hi'
              ? 'साइन इन करके आप हमारी सेवा की शर्तों से सहमत हैं'
              : 'By signing in you agree to our Terms of Service'}
          </p>
        </div>
      </div>
    </div>
  );
}
