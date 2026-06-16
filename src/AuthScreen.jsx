import React, { useState, useRef, useEffect } from 'react';
import { Phone, ArrowRight, ShieldCheck, ChevronLeft, Loader } from 'lucide-react';
import { auth } from './firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

export default function AuthScreen({ onAuthSuccess, lang }) {
  const [step, setStep] = useState('phone'); // phone | otp
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const recaptchaRef = useRef(null);
  const otpRefs = useRef([]);

  const t = {
    en: {
      welcome: 'Welcome to VIVAKART',
      tagline: 'Enter your mobile number to get started',
      mobile: 'Mobile Number',
      mobilePlaceholder: '10-digit mobile number',
      sendOtp: 'Send OTP',
      verifyOtp: 'Verify OTP',
      otpSent: 'OTP sent to',
      enterOtp: 'Enter the 6-digit OTP',
      verify: 'Verify & Continue',
      resend: 'Resend OTP',
      resendIn: 'Resend in',
      back: 'Change number',
      invalidPhone: 'Enter a valid 10-digit mobile number',
      invalidOtp: 'Enter the complete 6-digit OTP',
      otpError: 'Invalid OTP. Please try again.',
      sending: 'Sending OTP...',
      verifying: 'Verifying...',
    },
    hi: {
      welcome: 'विवाकार्ट में आपका स्वागत है',
      tagline: 'शुरू करने के लिए मोबाइल नंबर दर्ज करें',
      mobile: 'मोबाइल नंबर',
      mobilePlaceholder: '10 अंकों का मोबाइल नंबर',
      sendOtp: 'OTP भेजें',
      verifyOtp: 'OTP सत्यापित करें',
      otpSent: 'OTP भेजा गया',
      enterOtp: '6 अंकों का OTP दर्ज करें',
      verify: 'सत्यापित करें और जारी रखें',
      resend: 'OTP फिर भेजें',
      resendIn: 'दोबारा भेजें',
      back: 'नंबर बदलें',
      invalidPhone: 'वैध 10 अंकों का मोबाइल नंबर दर्ज करें',
      invalidOtp: 'पूरा 6 अंकों का OTP दर्ज करें',
      otpError: 'गलत OTP। दोबारा कोशिश करें।',
      sending: 'OTP भेजा जा रहा है...',
      verifying: 'सत्यापित हो रहा है...',
    },
  }[lang] || {};

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const setupRecaptcha = () => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      });
    }
    return recaptchaRef.current;
  };

  const handleSendOtp = async () => {
    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      setError(t.invalidPhone);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const verifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, '+91' + phone, verifier);
      setConfirmationResult(result);
      setStep('otp');
      setResendTimer(30);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
      recaptchaRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError(t.invalidOtp);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(code);
      onAuthSuccess(result.user);
    } catch {
      setError(t.otpError);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setOtp(['', '', '', '', '', '']);
    setError('');
    recaptchaRef.current = null;
    await handleSendOtp();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center p-4">
      <div id="recaptcha-container" />

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-xl mb-4">
            <span className="text-4xl">🛒</span>
          </div>
          <h1 className="text-3xl font-bold text-white">{t.welcome}</h1>
          <p className="text-orange-100 mt-1 text-sm">{t.tagline}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-6">
          {step === 'phone' ? (
            <>
              <div className="flex items-center gap-2 mb-5">
                <Phone className="w-5 h-5 text-orange-500" />
                <h2 className="font-bold text-stone-800 text-lg">{t.mobile}</h2>
              </div>

              <div className="flex items-center border-2 border-stone-200 rounded-2xl overflow-hidden focus-within:border-orange-400 transition mb-4">
                <div className="bg-stone-50 px-4 py-3.5 text-stone-600 font-semibold border-r border-stone-200 text-sm">
                  🇮🇳 +91
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                  placeholder={t.mobilePlaceholder}
                  className="flex-1 px-4 py-3.5 outline-none text-stone-800 font-medium text-base bg-transparent"
                />
              </div>

              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-rose-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-60"
              >
                {loading ? <><Loader className="w-4 h-4 animate-spin" /> {t.sending}</> : <>{t.sendOtp} <ArrowRight className="w-4 h-4" /></>}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setStep('phone'); setError(''); setOtp(['','','','','','']); }} className="flex items-center gap-1 text-orange-500 text-sm font-semibold mb-5">
                <ChevronLeft className="w-4 h-4" /> {t.back}
              </button>

              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-orange-500" />
                <h2 className="font-bold text-stone-800 text-lg">{t.verifyOtp}</h2>
              </div>
              <p className="text-stone-500 text-sm mb-5">{t.otpSent} +91 {phone}</p>

              <div className="flex gap-2 justify-between mb-4">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="tel"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-stone-200 rounded-xl outline-none focus:border-orange-400 text-stone-800 transition"
                  />
                ))}
              </div>

              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-rose-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-60 mb-3"
              >
                {loading ? <><Loader className="w-4 h-4 animate-spin" /> {t.verifying}</> : <>{t.verify} <ArrowRight className="w-4 h-4" /></>}
              </button>

              <button
                onClick={handleResend}
                disabled={resendTimer > 0}
                className="w-full text-center text-sm text-orange-500 font-semibold py-2 disabled:text-stone-400"
              >
                {resendTimer > 0 ? `${t.resendIn} ${resendTimer}s` : t.resend}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
