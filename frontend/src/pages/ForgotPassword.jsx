import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || data.details || 'Error sending email';
        throw new Error(errorMessage);
      }

      setEmailSent(true);
      toast.success('Password reset link has been sent to your email');
    } catch (err) {
      console.error('Error sending reset email:', err);
      toast.error(err.message || 'Error sending email');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#faf9f7] px-4 sm:px-0">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>
        
        {!emailSent ? (
          <>
            <p className="text-gray-600 text-center mb-8">
              Please enter your registered email address. We will send you a link to reset your password.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="text-green-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">
              We have sent a password reset link to your email. Please check your inbox.
            </p>
            <p className="text-gray-500 text-sm">
              If you don't receive the email, please check your spam folder.
            </p>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <Link to="/login" className="text-gray-600 hover:text-gray-900">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 