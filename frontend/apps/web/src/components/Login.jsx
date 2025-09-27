// src/pages/Login.jsx
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useLoginMutation } from '../features/api/auth.api';
import { encryptJson, packPasswordB64 } from '../lib/crypto';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials, logout} from '../features/auth/authSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useHCaptcha } from '../hooks/useHCaptcha';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch(); 
  const [serverError, setServerError] = useState('');
  const location = useLocation();
  const { siteKey, loading: hcaptchaLoading } = useHCaptcha();
  const hcaptchaRef = useRef(null);
  const [hcaptchaToken, setHcaptchaToken] = useState(null);
  
  console.log("Login page `from` state:", location.state);

  const from = location.state?.from || '/login';

  const onSubmit = async (data) => {
    setServerError(''); // Clear previous errors
    
    // Check if hCaptcha is verified
    if (!hcaptchaToken) {
      setServerError('Please complete the hCaptcha verification');
      return;
    }
    
    try {
      // Encrypt both password and phone number
      const encPassword = await encryptJson({ secret: data.password });
      const packedPassword = packPasswordB64(encPassword.nonce, encPassword.ciphertext);
      
      const encPhone = await encryptJson({ secret: data.username });
      const packedPhone = packPasswordB64(encPhone.nonce, encPhone.ciphertext);
      
      const payload = { 
        phone_number: packedPhone, 
        password: packedPassword,
        hcaptcha_token: hcaptchaToken
      };
      const response = await login(payload).unwrap();
      // Backend returns { access_token, refresh_token, token_type }
      dispatch(setCredentials(response));
      
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err?.data?.detail || 'Login failed. Please check your credentials.');
      dispatch(logout()); // Ensure user is logged out on failed login
      // Reset hCaptcha on error
      if (hcaptchaRef.current) {
        hcaptchaRef.current.resetCaptcha();
        setHcaptchaToken(null);
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
        <h2 className="text-4xl font-display font-bold text-center mb-8 text-gray-800">
          Welcome Back to <span className="text-primary">NagarSevak</span>
        </h2>

        {serverError && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-6 flex items-center gap-3">
            <FontAwesomeIcon icon={faExclamationCircle} className="text-xl flex-shrink-0" />
            <p className="text-sm">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Phone Number"
              {...register('username', { 
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Please enter a valid 10-digit phone number'
                }
              })}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm
                         focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 text-gray-800"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-2">{errors.username.message}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm
                         focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 text-gray-800"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-2">{errors.password.message}</p>
            )}
          </div>

          {/* hCaptcha */}
          {siteKey && !hcaptchaLoading && (
            <div className="flex justify-center">
              <HCaptcha
                ref={hcaptchaRef}
                sitekey={siteKey}
                onVerify={setHcaptchaToken}
                onError={() => setHcaptchaToken(null)}
                onExpire={() => setHcaptchaToken(null)}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-primary-light text-white font-semibold py-3 px-4 rounded-lg shadow-md
                       hover:from-primary-dark hover:to-primary transition-all duration-300
                       flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="text-lg" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-primary hover:text-primary-dark hover:underline transition-colors duration-200">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;