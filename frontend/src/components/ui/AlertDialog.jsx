import React from 'react';
import { Link } from 'react-router-dom';

function AlertDialog({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="bg-white rounded-2xl p-6 max-w-md w-[380px] relative shadow-lg border border-gray-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black hover:text-gray-700 text-2xl font-light"
        >
          ×
        </button>
        
        <div className="flex flex-col items-center text-center pt-4">
          <h2 className="text-[22px] font-bold mb-6">
            Create an account to continue
          </h2>
          
          <button 
            onClick={() => window.location.href = '/register'} 
            className="w-full bg-black text-white rounded-full py-3 px-6 mb-4 text-center font-medium hover:bg-gray-800"
          >
            Create account
          </button>

          <div className="text-sm text-gray-500 mt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-black font-medium">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlertDialog; 