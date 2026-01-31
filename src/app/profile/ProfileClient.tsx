"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, CreditCard, MapPin, Lock, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileSection from "./sections/ProfileSection";
import BankSection from "./sections/BankSection";
import AddressSection from "./sections/AddressSection";
import PasswordSection from "./sections/PasswordSection";
import DeleteAccountSection from "./sections/DeleteAccountSection";

type Section = "profile" | "bank" | "address" | "password" | "delete";

interface NavItem {
  id: Section;
  label: string;
  icon: React.ReactNode;
}

export default function ProfileClient() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>("profile");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/?login=true");
    }
  }, [loading, isAuthenticated, router]);

  const navItems: NavItem[] = [
    { id: "profile", label: "Hồ sơ", icon: <User className="w-5 h-5" /> },
    { id: "bank", label: "Ngân hàng", icon: <CreditCard className="w-5 h-5" /> },
    { id: "address", label: "Địa chỉ", icon: <MapPin className="w-5 h-5" /> },
    { id: "password", label: "Đổi mật khẩu", icon: <Lock className="w-5 h-5" /> },
    { id: "delete", label: "Xóa tài khoản", icon: <Trash2 className="w-5 h-5" /> },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSection />;
      case "bank":
        return <BankSection />;
      case "address":
        return <AddressSection />;
      case "password":
        return <PasswordSection />;
      case "delete":
        return <DeleteAccountSection />;
      default:
        return <ProfileSection />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">Tài khoản của tôi</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <Card className="lg:col-span-1 h-fit">
            <CardContent className="p-4">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                      ${activeSection === item.id 
                        ? "bg-green-600 text-white" 
                        : "text-gray-700 hover:bg-gray-100"
                      }
                      ${item.id === "delete" && activeSection !== "delete" ? "text-red-600 hover:bg-red-50" : ""}
                    `}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
