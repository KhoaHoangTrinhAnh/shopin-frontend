// D:\shopin-frontend\src\components\Header.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Heart, ClipboardList, LogIn, Search as SearchIcon, Globe, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import ForgotModal from "./ForgotModal";
import UserMenu from "./UserMenu";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/all-products" },
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/about" },
];

const languages = [
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
];

const Header = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  // Check for login query parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('login') === 'true') {
        setShowLoginModal(true);
        // Clean URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShowLogin = () => {
    setShowLoginModal(true);
    setShowRegisterModal(false);
  };

  const handleCloseModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
    setShowForgotModal(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/all-products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLanguageChange = (language: typeof languages[0]) => {
    setSelectedLanguage(language);
    setShowLanguageDropdown(false);
    // TODO: Implement actual language change logic
    console.log("Language changed to:", language.code);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 box-border w-screen mx-auto h-14 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-3 flex items-center justify-between backdrop-blur-md bg-white/70 border-b border-gray-200`}
      >
        {/* Logo */}
        <Link href="/" passHref>
          <div className="text-[28px] leading-none font-connerstone font-bold cursor-pointer group">
            <span className="text-green-600 group-hover:text-gray-600 transition-colors duration-300">Shop</span>
            <span className="text-gray-600 group-hover:text-green-600 transition-colors duration-300">In</span>
          </div>
        </Link>

        {/* Nav Items */}
        <nav className="flex gap-8 text-base font-medium">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} passHref>
              <div className="relative group cursor-pointer">
                <span className="text-gray-700 hover:text-green-600 transition-colors duration-300">
                  {item.label}
                </span>
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-green-600 group-hover:w-full transition-all duration-300"></span>
              </div>
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex gap-4 items-center">
          {/* Search Input */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-64 h-10 px-4 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600 transition-colors"
            >
              <SearchIcon className="w-5 h-5" />
            </button>
          </form>

          {/* Language Selector */}
          <div className="relative" ref={languageDropdownRef}>
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center gap-2 h-10 px-4 text-sm leading-none text-gray-700 hover:text-green-600 border border-gray-300 rounded-lg hover:border-green-600 transition-colors"
            >
              <span className="text-lg">{selectedLanguage.flag}</span>
              <span className="hidden md:inline">{selectedLanguage.code.toUpperCase()}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Language Dropdown */}
            {showLanguageDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      selectedLanguage.code === lang.code ? 'bg-green-50 text-green-600' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={() => {
              if (isAuthenticated) {
                router.push('/cart');
              } else {
                setShowLoginModal(true);
              }
            }}
            title="Giỏ hàng"
          >
            <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-green-600 transition-colors" />
          </button>
          <button 
            onClick={() => {
              if (isAuthenticated) {
                router.push('/favorites');
              } else {
                setShowLoginModal(true);
              }
            }}
            title="Yêu thích"
          >
            <Heart className="w-6 h-6 text-gray-700 hover:text-green-600 transition-colors" />
          </button>
          <button 
            onClick={() => {
              if (isAuthenticated) {
                router.push('/orders');
              } else {
                setShowLoginModal(true);
              }
            }}
            title="Đơn hàng"
          >
            <ClipboardList className="w-6 h-6 text-gray-700 hover:text-green-600 transition-colors" />
          </button>
          
          {/* Auth Buttons */}
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <button 
              onClick={handleShowLogin}
              className="px-3 py-1 text-sm text-gray-600 font-semibold border border-gray-300 rounded hover:bg-green-600 hover:text-white transition-colors flex items-center gap-1"
            >
              <LogIn className="w-4 h-4" />
              Log in
            </button>
          )}
        </div>
      </header>

      {/* Auth Modals */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={handleCloseModals}
        onSwitchToRegister={() => { setShowRegisterModal(true); setShowLoginModal(false); setShowForgotModal(false); }}
        onSwitchToForgot={() => { setShowForgotModal(true); setShowLoginModal(false); setShowRegisterModal(false); }}
      />
      
      <RegisterModal 
        isOpen={showRegisterModal}
        onClose={handleCloseModals}
        onSwitchToLogin={handleShowLogin}
      />

      <ForgotModal
        isOpen={showForgotModal}
        onClose={handleCloseModals}
        onSwitchToLogin={handleShowLogin}
      />
    </>
  );
};

export default Header;
