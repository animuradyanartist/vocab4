import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../config/supabase';

// Get environment info
const appEnv = import.meta.env.VITE_APP_ENV || 'production';
const isStaging = appEnv === 'staging';

const AuthScreen = () => {
  const { signIn, signUp, resetPassword, loading, error } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Signup form state
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Forgot password form state
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Show configuration notice if Supabase is not configured
  const supabaseConfigured = isSupabaseConfigured;
  
  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Setup Required {isStaging && <span className="text-sm bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full ml-2">STAGING</span>}
          </h2>
          <p className="text-gray-600 mb-6">
            Please click "Connect to Supabase" in the top right corner of Bolt to set up your database.
          </p>
          <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-indigo-700">
              <strong>For {isStaging ? 'Staging' : 'Production'} Deployment:</strong> Make sure your environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are properly set in your deployment platform.
              {isStaging && (
                <div className="mt-2 text-xs">
                  <strong>Note:</strong> This is the staging environment. Use your staging Supabase project credentials.
                </div>
              )}
            </p>
            <div className="mt-3 p-2 bg-white rounded border text-xs font-mono">
              <strong>Debug Info:</strong>
              <div>URL Present: {!!import.meta.env.VITE_SUPABASE_URL ? '✅' : '❌'}</div>
              <div>Key Present: {!!import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅' : '❌'}</div>
              <div>URL Valid: {import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('YOUR-PROJECT') ? '✅' : '❌'}</div>
              <div>Key Valid: {import.meta.env.VITE_SUPABASE_ANON_KEY && !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('YOUR_ANON') ? '✅' : '❌'}</div>
              <div>Environment: {import.meta.env.VITE_APP_ENV || 'production'}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};
    
    if (!loginData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!loginData.password) {
      newErrors.password = 'Password is required';
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors: Record<string, string> = {};
    
    if (!signupData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!signupData.password) {
      newErrors.password = 'Password is required';
    } else if (signupData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!signupData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateLogin()) {
      const result = await signIn(loginData.email, loginData.password);
      if (!result.success) {
        console.error('Login failed:', result.error);
      }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateSignup()) {
      const result = await signUp(signupData.email, signupData.password);
      if (!result.success) {
        console.error('Signup failed:', result.error);
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail.trim()) {
      setFormErrors({ email: 'Email is required' });
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      setFormErrors({ email: 'Email is invalid' });
      return;
    }
    
    setFormErrors({});
    const result = await resetPassword(forgotPasswordEmail);
    
    if (result.success) {
      setResetEmailSent(true);
    }
  };

  const switchToSignup = () => {
    setIsLogin(false);
    setShowForgotPassword(false);
    setResetEmailSent(false);
    setFormErrors({});
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setShowForgotPassword(false);
    setResetEmailSent(false);
    setFormErrors({});
  };

  const showForgotPasswordForm = () => {
    setShowForgotPassword(true);
    setResetEmailSent(false);
    setFormErrors({});
  };

  const backToLogin = () => {
    setShowForgotPassword(false);
    setResetEmailSent(false);
    setForgotPasswordEmail('');
    setFormErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 flex items-center justify-center p-3 md:p-4">
      <div className="w-full max-w-sm md:max-w-md">
        {/* Card Container */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="px-6 md:px-8 pt-6 md:pt-8 pb-4 md:pb-6 text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <User className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
              {showForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              {showForgotPassword 
                ? 'Enter your email to reset your password' 
                : isLogin 
                  ? 'Sign in to your account' 
                  : 'Join us today'}
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-4 md:mx-8 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Forms Container */}
          <div className="px-4 md:px-8 pb-6 md:pb-8">
            {showForgotPassword ? (
              /* Forgot Password Form */
              resetEmailSent ? (
                /* Success Message */
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Check Your Email</h2>
                    <p className="text-gray-600 mb-4">
                      We've sent a password reset link to <strong>{forgotPasswordEmail}</strong>
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Click the link in the email to reset your password. The link will expire in 1 hour.
                    </p>
                  </div>
                  <button
                    onClick={backToLogin}
                    className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white py-2.5 md:py-3 px-4 rounded-lg font-medium hover:from-indigo-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Back to Login</span>
                  </button>
                </div>
              ) : (
                /* Forgot Password Form */
                <form onSubmit={handleForgotPassword} className="space-y-4 md:space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="forgot-email" className="block text-sm md:text-base font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                      </div>
                      <input
                        id="forgot-email"
                        type="email"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        className={`w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm md:text-base ${
                          formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                        }`}
                        placeholder="Enter your email address"
                        disabled={loading}
                        style={{ color: '#111827' }}
                      />
                    </div>
                    {formErrors.email && <p className="text-sm text-red-600">{formErrors.email}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white py-2.5 md:py-3 px-4 rounded-lg font-medium hover:from-indigo-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                        Sending Reset Link...
                      </>
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={backToLogin}
                      disabled={loading}
                      className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-colors duration-200 disabled:opacity-50 text-sm md:text-base flex items-center justify-center space-x-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Login</span>
                    </button>
                  </div>
                </form>
              )
            ) : isLogin ? (
              /* Login Form */
              <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="login-email" className="block text-sm md:text-base font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    </div>
                    <input
                      id="login-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className={`w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm md:text-base ${
                        formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Enter your email"
                      disabled={loading}
                     style={{ color: '#111827' }}
                    />
                  </div>
                  {formErrors.email && <p className="text-sm text-red-600">{formErrors.email}</p>}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="login-password" className="block text-sm md:text-base font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    </div>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className={`w-full pl-8 md:pl-10 pr-10 md:pr-12 py-2.5 md:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm md:text-base ${
                        formErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Enter your password"
                      disabled={loading}
                     style={{ color: '#111827' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 md:w-5 md:h-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="w-4 h-4 md:w-5 md:h-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {formErrors.password && <p className="text-sm text-red-600">{formErrors.password}</p>}
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white py-2.5 md:py-3 px-4 rounded-lg font-medium hover:from-indigo-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </button>

                {/* Switch to Signup */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm md:text-base text-gray-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={switchToSignup}
                      disabled={loading}
                      className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-colors duration-200 disabled:opacity-50 text-sm md:text-base"
                    >
                      Sign up
                    </button>
                  </p>
                  <p className="text-sm md:text-base text-gray-600 mt-2">
                    <button
                      type="button"
                      onClick={showForgotPasswordForm}
                      disabled={loading}
                      className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-colors duration-200 disabled:opacity-50 text-sm md:text-base"
                    >
                      Forgot your password?
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              /* Signup Form */
              <form onSubmit={handleSignup} className="space-y-4 md:space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="signup-email" className="block text-sm md:text-base font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    </div>
                    <input
                      id="signup-email"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className={`w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm md:text-base ${
                        formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Enter your email"
                      disabled={loading}
                     style={{ color: '#111827' }}
                    />
                  </div>
                  {formErrors.email && <p className="text-sm text-red-600">{formErrors.email}</p>}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="signup-password" className="block text-sm md:text-base font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    </div>
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className={`w-full pl-8 md:pl-10 pr-10 md:pr-12 py-2.5 md:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm md:text-base ${
                        formErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Create a password"
                      disabled={loading}
                     style={{ color: '#111827' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 md:w-5 md:h-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="w-4 h-4 md:w-5 md:h-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {formErrors.password && <p className="text-sm text-red-600">{formErrors.password}</p>}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="block text-sm md:text-base font-medium text-gray-700">
                    Repeat Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    </div>
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      className={`w-full pl-8 md:pl-10 pr-10 md:pr-12 py-2.5 md:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm md:text-base ${
                        formErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Repeat your password"
                      disabled={loading}
                     style={{ color: '#111827' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 md:w-5 md:h-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="w-4 h-4 md:w-5 md:h-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {formErrors.confirmPassword && <p className="text-sm text-red-600">{formErrors.confirmPassword}</p>}
                </div>

                {/* Signup Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white py-2.5 md:py-3 px-4 rounded-lg font-medium hover:from-indigo-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </button>

                {/* Switch to Login */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm md:text-base text-gray-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={switchToLogin}
                      disabled={loading}
                      className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-colors duration-200 disabled:opacity-50 text-sm md:text-base"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
        {/* Footer */}
        <div className="text-center mt-6 md:mt-8">
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            Secure authentication powered by Firebase
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;