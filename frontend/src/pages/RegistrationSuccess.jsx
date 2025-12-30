import React from 'react';
import { useNavigate } from 'react-router-dom';

const RegistrationSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#faf9f7]">
      <div className="w-full max-w-md py-12 px-6 bg-[#EFEEEB] rounded-lg text-center shadow-md">
        <div className="w-16 h-16 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-10 w-10 text-white" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={3} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold mb-10 text-gray-800">Registration success</h2>
        
        <button
          onClick={() => navigate('/login')}
          className="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default RegistrationSuccess; 