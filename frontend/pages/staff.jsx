import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { login } from '../lib/api';

export default function StaffLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const role = sessionStorage.getItem('adminRole');
    if (role) router.replace('/staff/dashboard');
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(password);
      sessionStorage.setItem('adminRole', result.role);
      router.push('/staff/dashboard');
    } catch {
      setError('Invalid password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-24 text-center">
      <div className="text-4xl mb-4">✝</div>
      <h1 className="text-2xl font-bold text-navy mb-6">Staff Access</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 text-left">
        <label className="label">Password</label>
        <input
          type="password"
          className="input mb-4"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoFocus
          required
        />
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
