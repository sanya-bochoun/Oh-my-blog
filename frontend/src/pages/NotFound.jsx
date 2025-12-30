import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F7F6] px-4">
      {/* Icon */}
      <div className="mb-6">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#26231E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 8V12" stroke="#26231E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 16H12.01" stroke="#26231E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Text */}
      <h1 className="text-3xl font-bold text-center mb-4">Page Not Found</h1>

      {/* Button */}
      <Link 
        to="/"
        className="px-6 py-3 rounded-full bg-[#26231E] text-white text-sm font-medium transition-all duration-200 ease-in-out hover:bg-[#464440]"
      >
        Go To Homepage
      </Link>
    </div>
  );
};

export default NotFound; 