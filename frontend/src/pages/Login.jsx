import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ShoppingCart, ArrowRight, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import loginHero from '../assets/login-hero.png';

export default function Login() {
  const { login, signup } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      let result;
      if (isSignUp) {
        if (data.password !== data.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        result = await signup(data.name, data.email, data.password, data.role);
      } else {
        result = await login(data.email, data.password);
      }

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    reset();
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-dark-bg">
      {/* Left Panel — Brand with Hero Image */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-3xl rotate-12 backdrop-blur-sm" />
          <div className="absolute bottom-32 right-8 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-brand-400/20 rounded-2xl -rotate-6" />
          <div className="absolute bottom-20 left-20 w-20 h-20 border-2 border-white/10 rounded-xl rotate-45" />
          <div className="absolute top-40 right-20 w-16 h-16 border-2 border-white/10 rounded-full" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }} />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">VendorBridge</span>
          </div>

          <h2 className="text-5xl font-bold text-white leading-tight mb-4">
            Procurement.
            <br />
            <span className="text-brand-200">Simplified.</span>
          </h2>

          <p className="text-brand-200 text-lg max-w-sm leading-relaxed mb-8">
            Streamline your procurement workflow from RFQ to Invoice. Manage vendors, compare quotations, and track approvals — all in one place.
          </p>

          {/* Hero Image */}
          <div className="relative max-w-md">
            <div className="absolute -inset-2 bg-white/10 rounded-2xl backdrop-blur-sm" />
            <img
              src={loginHero}
              alt="VendorBridge Platform"
              className="relative rounded-xl shadow-2xl w-full object-cover"
            />
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-3">
              {['AM', 'PK', 'SR'].map((init, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-white text-xs font-bold">
                  {init}
                </div>
              ))}
            </div>
            <p className="text-sm text-brand-200">
              Trusted by <strong className="text-white">500+</strong> procurement teams
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-2 rounded-xl bg-gray-100 dark:bg-dark-card hover:bg-gray-200 dark:hover:bg-dark-border text-gray-600 dark:text-gray-400 transition-all"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">VendorBridge</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isSignUp ? 'Create Account' : 'Welcome back'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            {isSignUp
              ? 'Enter your details to get started'
              : 'Enter your credentials to access your account'}
          </p>

          {/* Error banner */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-medium flex items-center gap-2" style={{ animation: 'slideUp 0.3s ease' }}>
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {isSignUp && (
              <div>
                <label className="label">Full Name</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="input"
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' }
                })}
                type="email"
                className="input"
                placeholder="admin@vendorbridge.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {isSignUp && (
              <div>
                <label className="label">Role</label>
                <select
                  {...register('role', { required: 'Role is required' })}
                  className="input"
                >
                  <option value="">Select a role</option>
                  <option value="admin">Admin</option>
                  <option value="procurement_officer">Procurement Officer</option>
                  <option value="manager">Manager</option>
                  <option value="vendor">Vendor</option>
                </select>
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
              </div>
            )}

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {isSignUp && (
              <div>
                <label className="label">Confirm Password</label>
                <input
                  {...register('confirmPassword', { required: 'Please confirm your password' })}
                  type="password"
                  className="input"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>
            )}

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset feature coming soon!')}
                  className="text-sm text-brand-500 hover:text-brand-600 font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={toggleMode}
              className="text-brand-500 hover:text-brand-600 font-semibold"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

          {!isSignUp && (
            <div className="mt-6 px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                <strong>Demo:</strong> admin@vendorbridge.com / admin123
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
