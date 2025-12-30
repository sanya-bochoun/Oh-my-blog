import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FiFileText,
  FiGrid,
  FiUser,
  FiBell,
  FiKey,
  FiUsers,
  FiHome,
  FiLogOut,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("accessToken");
    toast.success("ออกจากระบบสำเร็จ");
    navigate("/");
  };

  const menuGroups = [
    {
      title: "Content Management",
      items: [
        {
          path: "/admin/article-management",
          label: "Article Management",
          icon: FiFileText,
        },
        {
          path: "/admin/category-management",
          label: "Category Management",
          icon: FiGrid,
        },
      ],
    },
    {
      title: "User & Settings",
      items: [
        {
          path: "/admin/user-management",
          label: "User Management",
          icon: FiUsers,
        },
        {
          path: "/admin/profile",
          label: "Profile",
          icon: FiUser,
        },
        {
          path: "/admin/notification",
          label: "Notification",
          icon: FiBell,
        },
        {
          path: "/admin/reset-password",
          label: "Reset Password",
          icon: FiKey,
        },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F9F9F9]">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900">hh.</h2>
          <p className="text-orange-400 mt-1">Admin panel</p>
        </div>

        <nav className="mt-6">
          {menuGroups.map((group, index) => (
            <div key={index} className="mb-6">
              <h3 className="px-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {group.title}
              </h3>
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-6 py-3 text-sm ${
                    isActiveRoute(item.path)
                      ? "text-gray-900 bg-gray-100"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="mt-auto p-6 border-t">
          <Link
            to="/"
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <FiHome className="w-5 h-5 mr-3" />
            hh. website
          </Link>
          <button
            onClick={handleLogout}
            className="cursor-pointer flex items-center mt-4 text-sm text-gray-600 hover:text-gray-900"
          >
            <FiLogOut className="w-5 h-5 mr-3" />
            Log out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
