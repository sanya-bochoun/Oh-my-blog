import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import defaultLogo from "../assets/default-logo.png";
import { STYLES } from "../constants/styles";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-(--background-color) border-b border-[#DAD6D1] z-10">
      <div className="md:w-full sm:container mx-auto w-[375px]">
        <div className="flex items-center justify-between h-[48px] sm:h-[80px] px-[24px] sm:px-8 lg:px-[120px]">
          {/* Logo Section */}
          <Link to="/" className="flex items-center cursor-pointer">
            <img
              src={logo}
              alt="logo"
              className="w-[90px] h-[40px] sm:w-[150px] sm:h-[150px]"
            />
          </Link>
          {/* Mobile Menu Button */}
          <div className="block sm:hidden focus:outline-none">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="mobile-menu-button cursor-pointer"
            >
              {isMenuOpen ? (
                <svg
                  className="mobile-menu-close"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg
                  className="mobile-menu-open"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
          {/* Desktop Menu Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 focus:outline-none cursor-pointer"
                  >
                    <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-200">
                      <img
                        src={user?.avatar_url || defaultLogo}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-medium text-[#26231E]">
                      {user?.username || user?.full_name || "ผู้ใช้"}
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                      <Link
                        to="/article-management"
                        className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-100 whitespace-nowrap cursor-pointer"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg
                          className="mr-3 w-5 h-5 shrink-0"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
                        </svg>
                        <span className="truncate">Article Management</span>
                      </Link>
                      {(user?.role === "admin" || user?.role === "editor") && (
                        <Link
                          to="/admin/article-management"
                          className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-100 cursor-pointer"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg
                            className="mr-3 w-5 h-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              x="3"
                              y="3"
                              width="18"
                              height="18"
                              rx="2"
                              ry="2"
                            />
                            <line x1="3" y1="9" x2="21" y2="9" />
                            <line x1="9" y1="21" x2="9" y2="9" />
                          </svg>
                          Admin Panel
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg
                          className="mr-3 w-5 h-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Profile
                      </Link>

                      <Link
                        to="/reset-password"
                        className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg
                          className="mr-3 w-5 h-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Reset password
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        <svg
                          className="mr-3 w-5 h-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className={STYLES.components.navbar.buttons.login.desktop}
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className={STYLES.components.navbar.buttons.signup.desktop}
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="block sm:hidden bg-(--background-color) border-b border-[#DAD6D1] px-[24px] py-4 absolute w-full">
          <div className="flex flex-col gap-3">
          {isAuthenticated ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-200 mr-3">
                      <img 
                        src={user?.avatar_url || defaultLogo} 
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-medium text-[#26231E]">
                      {user?.username || user?.full_name || 'ผู้ใช้'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <NotificationBell />
                  </div>
                </div>
                <Link
                  to="/article-management"
                  className="w-full text-left flex items-center py-2 text-gray-700 cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="mr-3 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
                  </svg>
                  Article Management
                </Link>
                <Link
                  to="/profile"
                  className="w-full text-left flex items-center py-2 text-gray-700 cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="mr-3 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Profile
                </Link>
                <Link
                  to="/reset-password"
                  className="w-full text-left flex items-center py-2 text-gray-700 cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="mr-3 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Reset Password
                </Link>
                <button 
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left flex items-center py-2 text-gray-700 cursor-pointer"
                >
                  <svg className="mr-3 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  type="button"
                  onClick={() => handleNavigation('/login')}
                  className={STYLES.components.navbar.buttons.login.mobile}
                >
                  Log in
                </button>
                <button 
                  onClick={() => handleNavigation('/signup')}
                  className={STYLES.components.navbar.buttons.signup.mobile}
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
