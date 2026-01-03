import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Verification token is missing');
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-email/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Email verification failed');
        }

        // Success - show success state
        setIsVerifying(false);
        setIsSuccess(true);
        toast.success('Email verified successfully!');
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } catch (err) {
        console.error('Error verifying email:', err);
        setError(err.message || 'An error occurred while verifying your email');
        setIsVerifying(false);
        toast.error(err.message || 'Email verification failed');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#faf9f7] px-4 sm:px-0">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8">
        {isVerifying ? (
          <>
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Verifying Email</h2>
              <p className="text-gray-600">Please wait while we verify your email address...</p>
            </div>
          </>
        ) : isSuccess ? (
          <>
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-2 text-green-600">Email Verified</h2>
              <p className="text-gray-600 mb-6">Your email has been successfully verified. Redirecting to login...</p>
            </div>
          </>
        ) : error ? (
          <>
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold mb-2 text-red-600">Verification Failed</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
              >
                Go to Login
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default VerifyEmail;

