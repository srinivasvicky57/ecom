import React, { useState } from 'react';
import { Paisley, Lotus, Peacock, Mango, Mandala, SmallFlower, TinyPaisley, TinyLotus, DiamondIcon, WaveDivider, CloseIcon } from '../assets/svgs';
import { loginText } from '../data/siteContent';
import { API_URL } from '../constants/api';
import { useToast } from './Toast';

const LEFT_MOTIFS = [Paisley, Lotus, Peacock, Mango, Mandala, SmallFlower, TinyPaisley, TinyLotus];
const RIGHT_MOTIFS = [Paisley, Lotus, SmallFlower, TinyLotus, TinyPaisley, Mango];

const INITIAL_LOGIN = { emailOrPhone: '', password: '' };
const INITIAL_SIGNUP = { name: '', phone: '', email: '', password: '', confirmPassword: '', dateOfBirth: '', gender: '' };
const INITIAL_FORGOT = { email: '', otp: '', newPassword: '', confirmPassword: '' };

const validators = {
  name: (val) => {
    if (!val.trim()) return 'Name is required';
    if (!/^[a-zA-Z\s]+$/.test(val)) return 'Name should contain only alphabets';
    return '';
  },
  phone: (val) => {
    if (!val.trim()) return 'Phone number is required';
    if (!/^\d{10}$/.test(val)) return 'Phone number must be exactly 10 digits';
    return '';
  },
  email: (val) => {
    if (!val.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Please enter a valid email address';
    return '';
  },
  password: (val) => {
    if (!val) return 'Password is required';
    if (val.length < 8) return 'Password must be at least 8 characters';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val)) return 'Password must contain at least 1 special character';
    return '';
  },
  confirmPassword: (val, password) => {
    if (!val) return 'Please confirm your password';
    if (val !== password) return 'Passwords do not match';
    return '';
  },
};

const inputFilters = {
  name: (val) => val.replace(/[^a-zA-Z\s]/g, ''),
  phone: (val) => val.replace(/\D/g, '').slice(0, 10),
};

const SIGNUP_FIELDS = [
  { field: 'name', type: 'text', labelKey: 'nameLabel', placeholderKey: 'namePlaceholder', autoFocus: true },
  { field: 'phone', type: 'tel', labelKey: 'phoneLabel', placeholderKey: 'phonePlaceholder', maxLength: 10 },
  { field: 'email', type: 'email', labelKey: 'emailLabel', placeholderKey: 'emailPlaceholder' },
  { field: 'password', type: 'password', labelKey: 'passwordLabel', placeholderKey: 'passwordPlaceholder' },
  { field: 'confirmPassword', type: 'password', labelKey: 'confirmPasswordLabel', placeholderKey: 'confirmPasswordPlaceholder' },
];

function Login({ isOpen, onClose, onLogin }) {
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState(INITIAL_LOGIN);
  const [signupForm, setSignupForm] = useState(INITIAL_SIGNUP);
  const [forgotForm, setForgotForm] = useState(INITIAL_FORGOT);
  const [forgotStep, setForgotStep] = useState(1); // 1=email, 2=otp, 3=reset
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const resetForms = () => {
    setLoginForm(INITIAL_LOGIN);
    setSignupForm(INITIAL_SIGNUP);
    setForgotForm(INITIAL_FORGOT);
    setForgotStep(1);
    setError('');
    setFieldErrors({});
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setFieldErrors({});
    if (newMode === 'forgot') setForgotStep(1);
  };

  const handleClose = () => {
    resetForms();
    setMode('login');
    onClose();
  };

  const handleFieldBlur = (field) => {
    const validate = validators[field];
    const err = field === 'confirmPassword'
      ? validate(signupForm.confirmPassword, signupForm.password)
      : validate(signupForm[field]);
    setFieldErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleSignupChange = (field, rawValue) => {
    const val = inputFilters[field] ? inputFilters[field](rawValue) : rawValue;
    setSignupForm((prev) => ({ ...prev, [field]: val }));
    if (fieldErrors[field]) {
      const err = field === 'confirmPassword'
        ? validators.confirmPassword(val, signupForm.password)
        : validators[field](val);
      setFieldErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const submitForm = async (url, body, successMsg) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { addToast(data.message || 'Request failed', 'error'); return; }
      resetForms();
      onLogin(data.user, data.token);
      onClose();
    } catch (err) {
      if (err?.name === 'TypeError') {
        addToast('Unable to reach server. Please ensure backend is running.', 'error');
      } else {
        addToast('Something went wrong. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginForm.emailOrPhone || !loginForm.password) {
      setError(loginText.errors.allFields);
      return;
    }
    submitForm(`${API_URL}/login`, loginForm);
  };

  // --- Forgot Password handlers ---
  const handleForgotEmail = async (e) => {
    e.preventDefault();
    const emailErr = validators.email(forgotForm.email);
    if (emailErr) { setError(emailErr); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotForm.email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      addToast(data.message, 'success');
      setForgotStep(2);
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!forgotForm.otp || forgotForm.otp.length !== 6) { setError('Please enter the 6-digit OTP'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotForm.email, otp: forgotForm.otp }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      addToast('OTP verified!', 'success');
      setForgotStep(3);
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const pwErr = validators.password(forgotForm.newPassword);
    if (pwErr) { setError(pwErr); return; }
    if (forgotForm.newPassword !== forgotForm.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotForm.email, otp: forgotForm.otp, newPassword: forgotForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      addToast(loginText.forgotPassword.successMessage, 'success');
      resetForms();
      setMode('login');
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotForm.email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      addToast('New OTP sent to your email', 'success');
      setForgotForm(prev => ({ ...prev, otp: '' }));
    } catch { setError('Failed to resend OTP'); }
    finally { setLoading(false); }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    const errors = {};
    for (const field of Object.keys(validators)) {
      errors[field] = field === 'confirmPassword'
        ? validators.confirmPassword(signupForm.confirmPassword, signupForm.password)
        : validators[field](signupForm[field]);
    }
    setFieldErrors(errors);
    if (Object.values(errors).some((e) => e !== '')) {
      setError('Please fix the errors below');
      return;
    }
    const { confirmPassword, ...payload } = signupForm;
    if (!payload.dateOfBirth) delete payload.dateOfBirth;
    if (!payload.gender) delete payload.gender;
    submitForm(`${API_URL}/signup`, payload);
  };

  if (!isOpen) return null;

  return (
    <div className="login-page">
      {/* Left decorative panel */}
      <div className="login-left">
        <div className="login-left-overlay"></div>
        <div className="login-left-motifs">
          {LEFT_MOTIFS.map((Motif, i) => (
            <Motif key={i} className={`login-bg-motif login-bg-motif-${i + 1}`} />
          ))}
        </div>
        <div className="login-left-content">
          <div className="login-left-icon">
            <DiamondIcon />
          </div>
          <h1 className="login-left-brand">{loginText.left.brandName}</h1>
          <p className="login-left-tagline">{loginText.left.tagline}</p>
          <div className="login-left-divider">
            <WaveDivider />
          </div>
          <p className="login-left-desc">{loginText.left.description}</p>
          <div className="login-left-stats">
            {loginText.left.stats.map((stat, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div className="login-left-stat-sep"></div>}
                <div className="login-left-stat">
                  <span className="login-left-stat-num">{stat.value}</span>
                  <span className="login-left-stat-label">{stat.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-right">
        <div className="login-right-motifs">
          {RIGHT_MOTIFS.map((Motif, i) => (
            <Motif key={i} className={`login-right-motif login-right-motif-${i + 1}`} />
          ))}
        </div>

        <button className="login-close-btn" onClick={handleClose} aria-label="Close">
          <CloseIcon />
        </button>

        <div className="login-right-inner">
          <div className="login-header">
            <h2 className="login-title">{loginText.right.welcomeText}</h2>
            <h1 className="login-brand-name">{loginText.right.brandName}</h1>
            <p className="login-subtitle">
              {mode === 'forgot'
                ? (forgotStep === 1 ? loginText.forgotPassword.emailStep.subtitle
                  : forgotStep === 2 ? loginText.forgotPassword.otpStep.subtitle
                    : loginText.forgotPassword.resetStep.subtitle)
                : mode === 'login' ? loginText.right.loginSubtitle : loginText.right.signupSubtitle
              }
            </p>
          </div>

          {/* Step indicator for forgot password */}
          {mode === 'forgot' && (
            <div className="forgot-steps">
              {[1, 2, 3].map(step => (
                <React.Fragment key={step}>
                  <div className={`forgot-step-dot${forgotStep >= step ? ' active' : ''}${forgotStep === step ? ' current' : ''}`}>
                    {forgotStep > step ? '✓' : step}
                  </div>
                  {step < 3 && <div className={`forgot-step-line${forgotStep > step ? ' active' : ''}`} />}
                </React.Fragment>
              ))}
            </div>
          )}

          <div className="login-divider">
            <span className="login-divider-line"></span>
            <span className="login-divider-ornament">
              <WaveDivider width={24} height={12} strokeColor="var(--kk-mustard)" dotColor="var(--kk-deep-red)" dotRadius={2} />
            </span>
            <span className="login-divider-line"></span>
          </div>

          {error && <div className="login-error">{error}</div>}

          {mode === 'login' && (
            <form className="login-form" onSubmit={handleLogin}>
              <div className="login-field">
                <label className="login-label">{loginText.loginForm.emailOrPhoneLabel}</label>
                <input
                  type="text"
                  className="login-input"
                  placeholder={loginText.loginForm.emailOrPhonePlaceholder}
                  value={loginForm.emailOrPhone}
                  onChange={(e) => setLoginForm({ ...loginForm, emailOrPhone: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="login-field">
                <label className="login-label">{loginText.loginForm.passwordLabel}</label>
                <input
                  type="password"
                  className="login-input"
                  placeholder={loginText.loginForm.passwordPlaceholder}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>
              <div className="login-forgot">
                <a href="#" onClick={(e) => { e.preventDefault(); switchMode('forgot'); }}>{loginText.loginForm.forgotPassword}</a>
              </div>
              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? 'Signing in...' : loginText.loginForm.submitButton}
              </button>
              <div className="login-switch">
                {loginText.loginForm.switchText}{' '}
                <button type="button" className="login-switch-btn" onClick={() => switchMode('signup')}>
                  {loginText.loginForm.switchButton}
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot' && (
            <form className="login-form" onSubmit={
              forgotStep === 1 ? handleForgotEmail :
                forgotStep === 2 ? handleVerifyOtp :
                  handleResetPassword
            }>
              {/* Step 1: Email */}
              {forgotStep === 1 && (
                <div className="login-field">
                  <label className="login-label">{loginText.forgotPassword.emailStep.label}</label>
                  <input
                    type="email"
                    className="login-input"
                    placeholder={loginText.forgotPassword.emailStep.placeholder}
                    value={forgotForm.email}
                    onChange={(e) => setForgotForm(prev => ({ ...prev, email: e.target.value }))}
                    autoFocus
                  />
                </div>
              )}

              {/* Step 2: OTP */}
              {forgotStep === 2 && (
                <>
                  <p className="forgot-email-hint">OTP sent to <strong>{forgotForm.email}</strong></p>
                  <div className="login-field">
                    <label className="login-label">{loginText.forgotPassword.otpStep.label}</label>
                    <input
                      type="text"
                      className="login-input forgot-otp-input"
                      placeholder={loginText.forgotPassword.otpStep.placeholder}
                      value={forgotForm.otp}
                      maxLength={6}
                      onChange={(e) => setForgotForm(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                      autoFocus
                    />
                  </div>
                  <div className="forgot-resend">
                    {loginText.forgotPassword.otpStep.resendText}{' '}
                    <button type="button" className="login-switch-btn" onClick={handleResendOtp} disabled={loading}>
                      {loginText.forgotPassword.otpStep.resendButton}
                    </button>
                  </div>
                </>
              )}

              {/* Step 3: New Password */}
              {forgotStep === 3 && (
                <>
                  <div className="login-field">
                    <label className="login-label">{loginText.forgotPassword.resetStep.passwordLabel}</label>
                    <input
                      type="password"
                      className="login-input"
                      placeholder={loginText.forgotPassword.resetStep.passwordPlaceholder}
                      value={forgotForm.newPassword}
                      onChange={(e) => setForgotForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      autoFocus
                    />
                  </div>
                  <div className="login-field">
                    <label className="login-label">{loginText.forgotPassword.resetStep.confirmLabel}</label>
                    <input
                      type="password"
                      className="login-input"
                      placeholder={loginText.forgotPassword.resetStep.confirmPlaceholder}
                      value={forgotForm.confirmPassword}
                      onChange={(e) => setForgotForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </div>
                </>
              )}

              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading
                  ? (forgotStep === 1 ? loginText.forgotPassword.emailStep.loadingButton
                    : forgotStep === 2 ? loginText.forgotPassword.otpStep.loadingButton
                      : loginText.forgotPassword.resetStep.loadingButton)
                  : (forgotStep === 1 ? loginText.forgotPassword.emailStep.submitButton
                    : forgotStep === 2 ? loginText.forgotPassword.otpStep.submitButton
                      : loginText.forgotPassword.resetStep.submitButton)
                }
              </button>

              <div className="login-switch">
                <button type="button" className="login-switch-btn" onClick={() => { resetForms(); switchMode('login'); }}>
                  {loginText.forgotPassword.emailStep.backButton}
                </button>
              </div>
            </form>
          )}

          {mode === 'signup' && (
            <form className="login-form" onSubmit={handleSignup}>
              {SIGNUP_FIELDS.map(({ field, type, labelKey, placeholderKey, autoFocus, maxLength }) => (
                <div className="login-field" key={field}>
                  <label className="login-label">{loginText.signupForm[labelKey]} <span className="login-required">*</span></label>
                  <input
                    type={type}
                    className={`login-input${fieldErrors[field] ? ' login-input-error' : ''}`}
                    placeholder={loginText.signupForm[placeholderKey]}
                    value={signupForm[field]}
                    maxLength={maxLength}
                    onChange={(e) => handleSignupChange(field, e.target.value)}
                    onBlur={() => handleFieldBlur(field)}
                    autoFocus={autoFocus}
                  />
                  {fieldErrors[field] && <span className="login-field-error">{fieldErrors[field]}</span>}
                </div>
              ))}
              
              <div className="login-field-row">
                <div className="login-field">
                  <label className="login-label">Date of Birth</label>
                  <input
                    type="date"
                    className="login-input"
                    value={signupForm.dateOfBirth}
                    onChange={(e) => handleSignupChange('dateOfBirth', e.target.value)}
                  />
                </div>
                <div className="login-field">
                  <label className="login-label">Gender</label>
                  <select
                    className="login-input"
                    value={signupForm.gender}
                    onChange={(e) => handleSignupChange('gender', e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? 'Creating account...' : loginText.signupForm.submitButton}
              </button>
              <div className="login-switch">
                {loginText.signupForm.switchText}{' '}
                <button type="button" className="login-switch-btn" onClick={() => switchMode('login')}>
                  {loginText.signupForm.switchButton}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
