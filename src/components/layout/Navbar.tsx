import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useLogout } from '../../hooks/useAuth';
import { NotificationBell } from '../notifications/NotificationBell';
import { Button } from '../ui/Button';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/board', label: 'Board' },
  { to: '/analytics', label: 'Analytics' },
];

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3" aria-label="Main navigation">
        <div className="flex items-center gap-6">
          <span className="text-lg font-bold text-primary-600">SprintDesk</span>
          <ul className="hidden sm:flex items-center gap-1">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-1.5 text-sm font-medium ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <span aria-hidden="true">{theme === 'light' ? '🌙' : '☀️'}</span>
          </button>
          <NotificationBell />
          {user && (
            <img
              src={user.image}
              alt={`${user.firstName} ${user.lastName}`}
              className="h-8 w-8 rounded-full object-cover"
            />
          )}
          <Button variant="ghost" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </nav>
      <ul className="flex sm:hidden gap-1 px-4 pb-2">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `rounded-md px-2 py-1 text-xs font-medium ${
                  isActive ? 'bg-primary-100 text-primary-700' : 'text-gray-600 dark:text-gray-300'
                }`
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </header>
  );
}
