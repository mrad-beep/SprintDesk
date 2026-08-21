import { useMemo, useState, type FormEvent } from 'react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useLogin } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';

function passwordStrength(pw: string): { label: string; score: number } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return { label: labels[score], score };
}

export function LoginPage() {
  const [username, setUsername] = useState('emilys');
  const [password, setPassword] = useState('emilyspass');
  const login = useLogin();
  const setRememberMe = useAuthStore((s) => s.setRememberMe);
  const rememberMe = useAuthStore((s) => s.rememberMe);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate({ username, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-800 p-8 shadow-lg">
        <h1 className="text-xl font-bold text-center text-primary-600 mb-1">SprintDesk</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Sign in to your sprint workspace</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
          <div>
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            {password && (
              <div className="mt-1.5" aria-live="polite">
                <div className="h-1.5 w-full rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      strength.score <= 1 ? 'bg-red-500' : strength.score <= 2 ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(strength.score / 4) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{strength.label} password</span>
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-gray-300"
            />
            Remember me for 30 days
          </label>

          <Button type="submit" isLoading={login.isPending} className="w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-4 text-xs text-center text-gray-400">
          Demo credentials: <code>emilys</code> / <code>emilyspass</code> (DummyJSON test account)
        </p>
      </div>
    </div>
  );
}
