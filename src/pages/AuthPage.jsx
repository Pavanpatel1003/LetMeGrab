import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const AuthPage = ({ mode }) => {
    const isRegister = mode === 'register';
    const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', remember: true });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);
    const { login, register } = useAuth();
    const { notify } = useToast();
    const navigate = useNavigate();

    const change = event => {
        const { name, value, checked, type } = event.target;
        setForm(previous => ({ ...previous, [name]: type === 'checkbox' ? checked : value }));
        setErrors(previous => ({ ...previous, [name]: '' }));
    };

    const submit = async event => {
        event.preventDefault();
        const nextErrors = {};
        if (isRegister && !form.fullName.trim()) nextErrors.fullName = 'Enter your full name.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.';
        if (!form.password) nextErrors.password = 'Enter your password.';
        if (isRegister && form.password.length < 8) nextErrors.password = 'Use at least 8 characters.';
        if (isRegister && form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';
        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            return;
        }

        setBusy(true);
        try {
            if (isRegister) await register({ fullName: form.fullName, email: form.email, password: form.password });
            else await login({ email: form.email, password: form.password, remember: form.remember });
            notify(isRegister ? 'Your workspace is ready.' : 'You are signed in.');
            navigate('/dashboard', { replace: true });
        } catch (error) {
            setErrors({ form: error.message || 'Something went wrong. Please try again.' });
        } finally {
            setBusy(false);
        }
    };

    const forgotPassword = event => {
        event.preventDefault();
        notify('Password reset needs a secure email service. It is not available in this local demo.', 'info');
    };

    return (
        <main className="auth-page">
            <section className="auth-intro-panel">
                <Link to="/" className="auth-back-link"><ArrowLeft size={15} /> Back to home</Link>
                <div className="auth-intro-content"><span className="auth-sparkle">LM</span><p className="section-kicker">A CLEAR SPACE FOR YOUR STORE</p><h1>{isRegister ? 'Make room to grow.' : 'Welcome back.'}</h1><p>{isRegister ? 'Create an account and bring your product details into one calm, organized workspace.' : 'Sign in to pick up where you left off with your product catalog.'}</p><div className="auth-promise"><span>01</span><span>Products, categories and prices.<br />Together in one place.</span></div></div>
                <span className="auth-panel-foot">LETMEGRAB · PRODUCT CATALOG</span>
            </section>
            <section className="auth-form-panel">
                <div className="auth-form-wrap">
                    <p className="section-kicker">{isRegister ? 'CREATE YOUR WORKSPACE' : 'YOUR WORKSPACE IS WAITING'}</p>
                    <h2>{isRegister ? 'Create account' : 'Sign in'}</h2>
                    <p className="auth-form-subtitle">{isRegister ? 'A few details and you’re ready to go.' : 'Use the email address connected to your account.'}</p>
                    <form className="auth-form" onSubmit={submit} noValidate>
                        {isRegister && <label className="field-wrap"><span>Full name</span><div className="field-control"><UserRound size={17} /><input autoComplete="name" name="fullName" value={form.fullName} onChange={change} placeholder="Your name" /></div>{errors.fullName && <small className="field-error">{errors.fullName}</small>}</label>}
                        <label className="field-wrap"><span>Email address</span><div className="field-control"><Mail size={17} /><input autoComplete="email" name="email" type="email" value={form.email} onChange={change} placeholder="you@example.com" /></div>{errors.email && <small className="field-error">{errors.email}</small>}</label>
                        <label className="field-wrap"><span>Password</span><div className="field-control"><LockKeyhole size={17} /><input autoComplete={isRegister ? 'new-password' : 'current-password'} name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={change} placeholder={isRegister ? 'At least 8 characters' : 'Your password'} /><button className="password-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{errors.password && <small className="field-error">{errors.password}</small>}</label>
                        {isRegister && <label className="field-wrap"><span>Confirm password</span><div className="field-control"><LockKeyhole size={17} /><input autoComplete="new-password" name="confirmPassword" type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={change} placeholder="Enter your password again" /></div>{errors.confirmPassword && <small className="field-error">{errors.confirmPassword}</small>}</label>}
                        {!isRegister && <div className="auth-options"><label className="checkbox-field"><input type="checkbox" name="remember" checked={form.remember} onChange={change} /><span>Remember me</span></label><button type="button" className="inline-link" onClick={forgotPassword}>Forgot password?</button></div>}
                        {errors.form && <p className="form-error" role="alert">{errors.form}</p>}
                        <button className="button button-primary auth-submit" type="submit" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}<ArrowRight size={17} /></button>
                    </form>
                    <p className="auth-switch">{isRegister ? 'Already have an account?' : 'New to LetMeGrab?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create account'}</Link></p>
                    <p className="auth-demo-note">Local demo only. Passwords are hashed in this browser; use a secure backend before handling real accounts.</p>
                </div>
            </section>
        </main>
    );
};

export default AuthPage;