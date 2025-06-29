import { useEffect, useState } from "react";
import { Search, ShoppingCart, Heart, ClipboardList, LogIn } from "lucide-react";

const navItems = ["Home", "Shop", "Blog", "Hot Deal"];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <header
      className={`sticky top-0 z-50 w-screen h-20 px-6 py-5 flex items-center justify-between backdrop-blur-md bg-white/70`}
    >
      {/* Logo */}
      <div className="text-[42px] font-connerstone font-bold cursor-pointer">
        <span className="text-green-600 hover:text-gray-600 transition-colors duration-300">Shop</span>
        <span className="text-gray-600 hover:text-green-600 transition-colors duration-300">In</span>
      </div>

      {/* Nav Items */}
      <nav className="flex gap-8 text-lg font-medium">
        {navItems.map((item) => (
          <div key={item} className="relative group cursor-pointer">
            <span className="text-gray-700 hover:text-green-600 transition-colors duration-300">
              {item}
            </span>
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-green-600 group-hover:w-full transition-all duration-300"></span>
          </div>
        ))}
      </nav>

      {/* Action Buttons */}
      <div className="flex gap-4 items-center">
        <button title="Search">
          <Search className="w-6 h-6 text-gray-700 hover:text-green-600 transition-colors" />
        </button>
        <button title="Cart">
          <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-green-600 transition-colors" />
        </button>
        <button title="Favorite">
          <Heart className="w-6 h-6 text-gray-700 hover:text-green-600 transition-colors" />
        </button>
        <button title="Order">
          <ClipboardList className="w-6 h-6 text-gray-700 hover:text-green-600 transition-colors" />
        </button>
        <button className="px-3 py-1 text-sm font-semibold border border-gray-300 rounded hover:bg-green-600 hover:text-white transition-colors">
          <LogIn className="inline-block w-4 h-4 mr-1" />
          Login
        </button>
      </div>
    </header>
  );
};

export default Header;
