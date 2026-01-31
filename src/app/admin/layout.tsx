"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  Ticket,
  ShoppingCart,
  Tags,
  Settings,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  LogOut,
  Store,
  History,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  children?: { name: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    name: "Đơn hàng",
    href: "/admin/orders",
    icon: <ShoppingCart className="w-5 h-5" />,
  },
  {
    name: "Sản phẩm",
    href: "/admin/products",
    icon: <Package className="w-5 h-5" />,
  },
  {
    name: "Người dùng",
    href: "/admin/users",
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: "Bài viết",
    href: "/admin/articles",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    name: "API Settings",
    href: "/admin/api-settings",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    name: "Mã giảm giá",
    href: "/admin/coupons",
    icon: <Ticket className="w-5 h-5" />,
  },
  {
    name: "Danh mục & Thương hiệu",
    href: "/admin/categories",
    icon: <Tags className="w-5 h-5" />,
  },
  {
    name: "Hỗ trợ khách hàng",
    href: "/admin/chat",
    icon: <MessageSquare className="w-5 h-5" />,
  },
  {
    name: "Cài đặt",
    href: "/admin/settings",
    icon: <Settings className="w-5 h-5" />,
    children: [
      { name: "Thông tin cửa hàng", href: "/admin/settings/shop-info" },
      { name: "Vận chuyển", href: "/admin/settings/shipping" },
      { name: "Đơn hàng", href: "/admin/settings/order" },
      { name: "SEO mặc định", href: "/admin/settings/seo" },
    ],
  },
  {
    name: "Nhật ký hoạt động",
    href: "/admin/logs",
    icon: <History className="w-5 h-5" />,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, loading, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Check admin access
  useEffect(() => {
    if (loading) return; // Skip if still loading
    
    if (!profile) {
      router.push("/403");
      return;
    }
    
    if (profile.role !== "admin") {
      router.push("/403");
      return;
    }
    
    if (profile.blocked === true) {
      logout();
      router.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, loading]); // Remove router and logout from deps to prevent loops

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile || profile.role !== "admin") {
    return null;
  }

  // Calculate sidebar width for smooth transitions
  const sidebarWidth = sidebarCollapsed ? 80 : 256;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header - Standalone Admin Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4 shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">Admin</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="p-2">
          <LogOut className="w-5 h-5 text-gray-600" />
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{ width: `${sidebarWidth}px` }}
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
          transition-all duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo Section */}
        <div className="h-14 flex items-center border-b border-gray-200 overflow-hidden">
          <Link 
            href="/admin" 
            className="flex items-center w-full h-full px-4"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div
              className={`ml-3 overflow-hidden transition-all duration-300 ease-in-out ${
                sidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
              }`}
            >
              <span className="font-bold text-lg text-gray-900 whitespace-nowrap">
                ShopIn Admin
              </span>
            </div>
          </Link>
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex absolute -right-3 top-16 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 transition-colors shadow-sm z-10"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-3 h-3 text-gray-600" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-gray-600" />
          )}
        </button>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-8rem)] scrollbar-thin">
          {navItems.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpanded(item.name)}
                    className={`
                      w-full flex items-center h-10 px-3 rounded-lg
                      transition-all duration-200 ease-in-out cursor-pointer
                      ${isActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 hover:bg-gray-100"
                      }
                    `}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <div className="flex-shrink-0">{item.icon}</div>
                    <div
                      className={`flex-1 flex items-center justify-between ml-3 overflow-hidden transition-all duration-300 ease-in-out ${
                        sidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                      }`}
                    >
                      <span className="text-sm font-medium whitespace-nowrap">
                        {item.name}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          expandedItems.includes(item.name) ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>
                  {/* Submenu */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      !sidebarCollapsed && expandedItems.includes(item.name)
                        ? "max-h-48 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`
                            block px-3 py-2 rounded-lg text-sm transition-colors
                            ${pathname === child.href
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            }
                          `}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`
                    flex items-center h-10 px-3 rounded-lg
                    transition-all duration-200 ease-in-out
                    ${isActive(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100"
                    }
                  `}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <div className="flex-shrink-0">{item.icon}</div>
                  <div
                    className={`ml-3 overflow-hidden transition-all duration-300 ease-in-out ${
                      sidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                    }`}
                  >
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.name}
                    </span>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 bg-white">
          <div className="flex items-center h-12 px-2 rounded-lg bg-gray-50">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || "Admin"}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-primary" />
              </div>
            )}
            <div
              className={`flex-1 ml-3 overflow-hidden transition-all duration-300 ease-in-out ${
                sidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
              }`}
            >
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile.full_name || "Admin"}
              </p>
              <p className="text-xs text-gray-500 truncate">{profile.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className={`flex-shrink-0 p-1.5 transition-all duration-300 ${
                sidebarCollapsed ? "hidden" : "block"
              }`}
            >
              <LogOut className="w-4 h-4 text-gray-500" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content - Standalone admin area without header/footer */}
      <main
        style={{ marginLeft: `${sidebarWidth}px` }}
        className="min-h-screen transition-all duration-300 ease-in-out pt-14 lg:pt-0 ml-0 lg:ml-auto"
      >
        <div className="p-6">{children}</div>
      </main>

      {/* Responsive override for mobile */}
      <style jsx global>{`
        @media (max-width: 1023px) {
          main {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
