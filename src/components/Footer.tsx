// D:\shopin-frontend\src\components\Footer.tsx
import React from 'react';
import Link from 'next/link';
import { Youtube, Github, Linkedin, Facebook, Slack } from 'lucide-react';

const socialIcons = [
  { icon: Youtube, href: "https://youtube.com" },
  { icon: Github, href: "https://github.com" },
  { icon: Linkedin, href: "https://linkedin.com" },
  { icon: Facebook, href: "https://facebook.com" },
  { icon: Slack, href: "https://slack.com" },
];

const Footer: React.FC = () => {
  return (
    <footer className="box-border w-screen bg-white border-t mx-auto px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 border-b">
          {/* Visit Us */}
          <div className="flex items-center gap-3 group hover:bg-gray-50 p-4 transition-colors">
            <svg className="lucide lucide-map-pin h-6 w-6 text-gray-600 group-hover:text-primary transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">Visit Us</h3>
              <p className="text-gray-600 text-sm mt-1 group-hover:text-gray-900 transition-colors">Ho Chi Minh City, Vietnam</p>
            </div>
          </div>

          {/* Call Us */}
          <div className="flex items-center gap-3 group hover:bg-gray-50 p-4 transition-colors">
            <svg className="lucide lucide-phone h-6 w-6 text-gray-600 group-hover:text-primary transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">Call Us</h3>
              <p className="text-gray-600 text-sm mt-1 group-hover:text-gray-900 transition-colors">+84 869 276 119</p>
            </div>
          </div>

          {/* Working Hours */}
          <div className="flex items-center gap-3 group hover:bg-gray-50 p-4 transition-colors">
            <svg className="lucide lucide-clock h-6 w-6 text-gray-600 group-hover:text-primary transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">Working Hours</h3>
              <p className="text-gray-600 text-sm mt-1 group-hover:text-gray-900 transition-colors">Mon - Sat: 10:00 AM - 7:00 PM</p>
            </div>
          </div>

          {/* Email Us */}
          <div className="flex items-center gap-3 group hover:bg-gray-50 p-4 transition-colors">
            <svg className="lucide lucide-mail h-6 w-6 text-gray-600 group-hover:text-primary transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect width="20" height="16" x="2" y="4" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </svg>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">Email Us</h3>
              <p className="text-gray-600 text-sm mt-1 group-hover:text-gray-900 transition-colors">ShopIn@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="group">
            <div className="text-[28px] leading-none font-connerstone font-bold cursor-pointer">
                <span className="text-green-600 group-hover:text-gray-600 transition-colors duration-300">Shop</span>
                <span className="text-gray-600 group-hover:text-green-600 transition-colors duration-300">In</span>
            </div>
            </Link>
            <p className="text-gray-600 text-sm">
              Discover curated furniture collections at Shopcart, blending style and comfort to elevate your living spaces.
            </p>
            <div className="flex items-center gap-3.5 text-gray-500">
            {socialIcons.map(({ icon: Icon, href }, idx) => (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border rounded-full border-darkColor/60 text-gray-500 hover:border-gray-700 hover:text-gray-700 transition-colors duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
            ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><a className="text-gray-600 hover:text-shop_dark_green text-sm font-medium hoverEffect hover:text-gray-900 transition-colors duration-300" href="/about">About us</a></li>
              <li><a className="text-gray-600 hover:text-shop_dark_green text-sm font-medium hoverEffect hover:text-gray-900 transition-colors duration-300" href="/contact">Contact us</a></li>
              <li><a className="text-gray-600 hover:text-shop_dark_green text-sm font-medium hoverEffect hover:text-gray-900 transition-colors duration-300" href="/faq">Terms & Conditions</a></li>
              <li><a className="text-gray-600 hover:text-shop_dark_green text-sm font-medium hoverEffect hover:text-gray-900 transition-colors duration-300" href="/about">Privacy Policy</a></li>
              <li><a className="text-gray-600 hover:text-shop_dark_green text-sm font-medium hoverEffect hover:text-gray-900 transition-colors duration-300" href="/contact">FAQs</a></li>
              <li><a className="text-gray-600 hover:text-shop_dark_green text-sm font-medium hoverEffect hover:text-gray-900 transition-colors duration-300" href="/faq">Help</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-3">
              <li><a className="text-gray-600 hover:text-shop_dark_green text-sm font-medium hoverEffect hover:text-gray-900 transition-colors duration-300" href="/terms">Terms & Conditions</a></li>
              <li><a className="text-gray-600 hover:text-shop_dark_green text-sm font-medium hoverEffect hover:text-gray-900 transition-colors duration-300" href="/privacy">Privacy Policy</a></li>
              <li><a className="text-gray-600 hover:text-shop_dark_green text-sm font-medium hoverEffect hover:text-gray-900 transition-colors duration-300" href="/careers">Careers</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-3">
              <li><a className="text-gray-600 hover:text-shop_dark_green text-sm font-medium hoverEffect hover:text-gray-900 transition-colors duration-300" href="/shipping">Shipping & Returns</a></li>
              <li><a className="text-gray-600 hover:text-shop_dark_green text-sm font-medium hoverEffect hover:text-gray-900 transition-colors duration-300" href="/track-order">Track Order</a></li>
              <li><a className="text-gray-600 hover:text-shop_dark_green text-sm font-medium hoverEffect hover:text-gray-900 transition-colors duration-300" href="/help-center">Help Center</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t py-2 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} <span className="font-bold">ShopIn</span>. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
