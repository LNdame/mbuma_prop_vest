'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import s from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Login failed');
        return;
      }
      // Store token (in a real app use httpOnly cookies)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Redirect based on role
      if (data.user.role === 'admin' || data.user.role === 'super_admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/investor/dashboard');
      }
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={s.root}>
      {/* Left panel — branding */}
      <div className={s.brand}>
        <div className={s.brandInner}>
          <a href="/" className={s.logo}>
            <div className={s.logoMark}>M</div>
            <span className={s.logoText}>
              Mbuma <span>PropVest</span>
            </span>
          </a>
          <div className={s.brandBody}>
            <h1 className={s.brandH1}>
              Your property<br />
              portfolio awaits.
            </h1>
            <p className={s.brandSub}>
              Fractionalised South African property investments with monthly
              distributions — starting from R1&nbsp;000.
            </p>
          </div>
          <div className={s.brandStats}>
            <div className={s.stat}>
              <div className={s.statVal}>9.4%</div>
              <div className={s.statLbl}>Avg net yield</div>
            </div>
            <div className={s.statDivider} />
            <div className={s.stat}>
              <div className={s.statVal}>R42M+</div>
              <div className={s.statLbl}>Capital raised</div>
            </div>
            <div className={s.statDivider} />
            <div className={s.stat}>
              <div className={s.statVal}>840+</div>
              <div className={s.statLbl}>Investors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className={s.panel}>
        <div className={s.formWrap}>
          <h2 className={s.heading}>Sign in to your account</h2>
          <p className={s.subheading}>
            Don&apos;t have an account?{' '}
            <a href="/#about" className={s.link}>
              Request an invitation →
            </a>
          </p>

          <form onSubmit={handleSubmit} className={s.form} noValidate>
            <div className={s.field}>
              <label htmlFor="email" className={s.label}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={s.input}
                placeholder="you@example.com"
              />
            </div>

            <div className={s.field}>
              <div className={s.labelRow}>
                <label htmlFor="password" className={s.label}>
                  Password
                </label>
                <a href="#" className={s.forgotLink}>
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={s.input}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className={s.errorBanner} role="alert">
                {error}
              </div>
            )}

            <button type="submit" className={s.submitBtn} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          {/* Dev hint */}
          <div className={s.devHint}>
            <span className={s.devHintTitle}>Test accounts</span>
            <div className={s.devHintRow}>
              <span>investor@propvest.dev</span>
              <span className={s.devHintPw}>Investor@123</span>
            </div>
            <div className={s.devHintRow}>
              <span>admin@propvest.dev</span>
              <span className={s.devHintPw}>Admin@123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
