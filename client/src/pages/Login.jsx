import React, { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Crest from '../components/ui/Crest';
import Icon from '../components/ui/Icon';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const success = await login(username, password);
    setSubmitting(false);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary-container to-secondary bg-[length:200%_200%] p-4 animate-gradient">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-secondary-container/30 blur-3xl animate-float" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-primary-fixed/20 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

      <div className="relative w-full max-w-md animate-scale-in rounded-2xl border border-white/30 bg-surface-container-lowest/95 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 text-center">
          <Crest className="mx-auto mb-4 h-16 w-16 transition-transform duration-500 hover:rotate-6 hover:scale-110" />
          <h2 className="text-headline-lg font-bold tracking-tight text-on-surface">Welcome to SIMS</h2>
          <p className="mt-1 text-body-md text-on-surface-variant">Wycherley International School · Gampaha</p>
        </div>

        {error && (
          <div role="alert" className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-error-container p-3 text-center text-body-sm text-on-error-container animate-fade-in">
            <Icon name="error" size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-label-lg text-on-surface-variant">Username</label>
            <div className="relative mt-1">
              <Icon name="person" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input
                id="username"
                type="text"
                required
                autoComplete="username"
                className="block w-full rounded-lg border border-outline-variant bg-surface-container-low/50 py-2.5 pl-10 pr-3 text-body-md transition-all focus:border-primary-container focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-label-lg text-on-surface-variant">Password</label>
            <div className="relative mt-1">
              <Icon name="lock" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                className="block w-full rounded-lg border border-outline-variant bg-surface-container-low/50 py-2.5 pl-10 pr-10 text-body-md transition-all focus:border-primary-container focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-outline transition-colors hover:text-primary">
                <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={18} />
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="group flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container px-4 py-2.5 text-label-lg font-semibold text-on-primary shadow-md transition-all hover:-translate-y-0.5 hover:bg-primary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-2 active:translate-y-0 disabled:cursor-wait disabled:opacity-70"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
            <Icon name={submitting ? 'progress_activity' : 'arrow_forward'} size={18} className={submitting ? 'animate-spin' : 'transition-transform group-hover:translate-x-1'} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
