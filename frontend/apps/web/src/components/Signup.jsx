import { useLoginMutation, useRegisterMutation } from '../features/api/auth.api';
import { encryptJson, packPasswordB64 } from '../lib/crypto';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for navigation
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faEnvelope, faPhone, faLock, faCheckCircle, faSpinner, faExclamationCircle, faChevronDown, faUserPlus
} from '@fortawesome/free-solid-svg-icons';

// Input Component (forwardRef is important for react-hook-form)
const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm
                focus:ring-2 focus:ring-primary focus:border-transparent outline-none
                bg-white/70 backdrop-blur-sm transition-all duration-200 hover:bg-white/90
                ${className}`}
    {...props}
  />
));

// Button Component (for consistency, though you might have a global Button component)
const Button = ({ children, className, ...props }) => (
  <button 
    className={`w-full py-4 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-lg shadow-md
                hover:from-primary-dark hover:to-primary transition-all duration-300
                flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                transform hover:scale-[1.02] disabled:transform-none
                ${className}`} 
    {...props}
  >
    {children}
  </button>
);

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const [registerUser, { isLoading: registerLoading }] = useRegisterMutation();
  const [login, { isLoading: loginLoading }] = useLoginMutation();

  const isLoading = registerLoading || loginLoading; // Combined loading state

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setServerError(''); // Clear previous server errors

    try {
      const encPwd = await encryptJson({ secret: formData.password });
      const packedPassword = packPasswordB64(encPwd.nonce, encPwd.ciphertext);
      const encFp = await encryptJson({ fp_check: 'TEST' });
      const packedFp = packPasswordB64(encFp.nonce, encFp.ciphertext);
      const registerPayload = {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        password: packedPassword,
        fp_check: packedFp,
      };
      const res = await registerUser(registerPayload).unwrap();
      if (res) {
        const enc = await encryptJson({ secret: formData.password });
        const packed = packPasswordB64(enc.nonce, enc.ciphertext);
        await login({ phone_number: formData.phone_number, password: packed }).unwrap();
        navigate('/'); // Navigate to home or dashboard
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.data?.detail || 'Signup failed. Please try again.';
      setServerError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-primary-light rounded-full mb-4 shadow-md">
            <FontAwesomeIcon icon={faUserPlus} className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-primary-dark to-primary bg-clip-text text-transparent mb-2">
            Join Our Platform
          </h1>
          <p className="text-gray-600 text-lg">Create your account and start monitoring</p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
          {serverError && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-3">
              <FontAwesomeIcon icon={faExclamationCircle} className="text-xl flex-shrink-0" />
              <p className="text-sm">{serverError}</p>
            </div>
          )}

          <div className="space-y-8"> {/* Increased space between sections */}
            {/* Personal Information Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label htmlFor="full_name" className="text-sm font-medium text-gray-700">Full Name *</label>
                  <div className="relative">
                    <Input
                      id="full_name"
                      placeholder="Enter your full name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.full_name && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <FontAwesomeIcon icon={faExclamationCircle} className="w-4 h-4" />
                      {errors.full_name}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label htmlFor="phone_number" className="text-sm font-medium text-gray-700">Phone Number *</label>
                  <div className="relative">
                    <Input
                      id="phone_number"
                      type="tel"
                      placeholder="Enter your 10-digit phone number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faPhone} className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.phone_number && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <FontAwesomeIcon icon={faExclamationCircle} className="w-4 h-4" />
                      {errors.phone_number}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Security
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">Password *</label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <FontAwesomeIcon icon={faExclamationCircle} className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password *</label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <FontAwesomeIcon icon={faExclamationCircle} className="w-4 h-4" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="h-5 w-5 text-white" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faUserPlus} className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login" // Use Link component for navigation
                className="text-primary hover:text-primary-dark font-semibold transition-colors duration-200 hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;