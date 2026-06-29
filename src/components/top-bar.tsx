import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Phone, LogOut, User } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.tsx";
import "./component.css";

const TopBar = () => {
  const [open, setOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="sticky top-0 z-50 bg-[#003366] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between h-14">
        {/* Left: Contact Icons (Phone & WhatsApp) */}
        <div className="flex items-center gap-6">
          {/* Phone Icon */}
          <a
            href="tel:+918861919000"
            className="inline-flex items-center gap-2 hover:text-[#FFD600] transition"
            title="Call us"
          >
            <Phone className="h-6 w-6" />
            <span className="text-sm font-medium hidden md:inline">+91 886 191 9000</span>
          </a>

          {/* WhatsApp Icon */}
          <a
            href="https://wa.me/918073982848"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition"
            title="WhatsApp us"
          >
            <FaWhatsapp className="h-6 w-6" />
            <span className="text-sm font-medium hidden md:inline">+91 807 398 2848</span>
          </a>
        </div>

        {/* Center/Right: Navigation & Actions (hidden on small screens) */}
        <div className="hidden md:flex items-center gap-4 flex-1 justify-end">
          <Link
            to="/running-classes"
            className="bg-[#FFD600] text-gray-900 px-3 py-1 rounded-lg text-xs font-bold hover:bg-yellow-400 transition flex items-center gap-1.5"
          >
            Running Classes
          </Link>
          <Link to="/testimonials" className="text-xs font-medium hover:text-[#FFD600] transition">
            Testimonials
          </Link>
          <Link to="/contact" className="text-xs font-medium hover:text-[#FFD600] transition">
            Contact Us
          </Link>
          <Link
            to="/fee-payment"
            className="text-xs font-medium hover:text-[#FFD600] transition flex items-center gap-1"
          >
            Pay Fees
          </Link>
          <Link
            to="/demoform"
            className="bg-[#0056b3] text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-[#007bff] transition shadow-lg shadow-blue-900/20"
          >
            Schedule Demo
          </Link>
          {isAuthenticated && user ? (
            <div className="relative ml-2">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                onBlur={() => setTimeout(() => setShowUserMenu(false), 150)}
                className="flex items-center gap-1.5 text-xs text-[#FFD600] font-bold hover:text-white transition"
              >
                <User className="h-3.5 w-3.5" />
                <span className="max-w-[100px] truncate">{user.fullName?.split(' ')[0]}</span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-xl border border-gray-100 py-1.5 z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-red-50 transition"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs text-[#FFD600] font-bold hover:text-white transition ml-2"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden inline-flex items-center justify-center p-2 rounded hover:bg-white hover:bg-opacity-10"
          onClick={() => setOpen(!open)}
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="md:hidden bg-[#003366] border-t border-[#002244] px-4 py-3">
          <div className="space-y-3 max-w-md">
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#002244] text-xs">
              <a href="tel:+918861919000" onClick={() => setOpen(false)} className="flex flex-col items-center justify-center rounded-lg bg-white/10 px-3 py-2 text-[#FFD600] font-bold">
                <span>📞 Call</span>
                <span className="mt-1 text-[11px] font-medium">+91 886 191 9000</span>
              </a>
              <a href="https://wa.me/918073982848" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="flex flex-col items-center justify-center rounded-lg bg-white/10 px-3 py-2 text-[#FFD600] font-bold">
                <span>💬 WhatsApp</span>
                <span className="mt-1 text-[11px] font-medium">+91 807 398 2848</span>
              </a>
            </div>
            <Link to="/demoform" onClick={() => setOpen(false)} className="block bg-[#0056b3] text-white px-3 py-2 rounded text-xs font-semibold text-center">Schedule Demo</Link>
            <Link to="/fee-payment" onClick={() => setOpen(false)} className="block bg-[#d5a928] text-white px-3 py-2 rounded text-xs font-semibold text-center">Pay Fees</Link>
            <Link to="/testimonials" onClick={() => setOpen(false)} className="block text-white text-xs hover:text-[#FFD600]">Testimonials</Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="block text-white text-xs hover:text-[#FFD600]">Contact Us</Link>
            <Link to="/running-classes" onClick={() => setOpen(false)} className="block text-white text-xs hover:text-[#FFD600]">Running Classes</Link>
            <Link to="/blog" onClick={() => setOpen(false)} className="block text-white text-xs hover:text-[#FFD600]">Blogs</Link>
            {isAuthenticated && user ? (
              <>
                <Link to={isAdmin ? '/admin-dashboard' : '/'} onClick={() => setOpen(false)} className="block text-[#FFD600] text-xs font-semibold">{user.fullName}</Link>
                <button onClick={() => { handleLogout(); setOpen(false); }} className="block text-white text-xs hover:text-[#FFD600] w-full text-left">Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="block text-[#FFD600] text-xs font-semibold">Login</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBar;
