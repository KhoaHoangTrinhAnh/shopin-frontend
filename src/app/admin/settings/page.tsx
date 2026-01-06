"use client";

import Link from "next/link";
import { Settings, Store, Truck, ShoppingCart, Search } from "lucide-react";

const settingsSections = [
  {
    title: "Thông tin cửa hàng",
    description: "Tên cửa hàng, email liên hệ, số hotline",
    icon: Store,
    href: "/admin/settings/shop-info",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Cấu hình vận chuyển",
    description: "Phí vận chuyển, thời gian giao hàng dự kiến",
    icon: Truck,
    href: "/admin/settings/shipping",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Cấu hình đơn hàng",
    description: "Bật/tắt thanh toán COD",
    icon: ShoppingCart,
    href: "/admin/settings/order",
    color: "from-orange-500 to-amber-500",
  },
  {
    title: "SEO mặc định",
    description: "Meta title và meta description mặc định",
    icon: Search,
    href: "/admin/settings/seo",
    color: "from-purple-500 to-pink-500",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
            <p className="text-sm text-gray-500">
              Quản lý các cài đặt của cửa hàng
            </p>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="group block bg-white p-6 rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${section.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {section.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Legacy Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Lưu ý:</strong> Các cài đặt đã được tách thành 4 phần riêng biệt
          để dễ quản lý. Cấu hình AI được quản lý tại trang{" "}
          <Link href="/admin/ai-settings" className="underline font-medium">
            Cài đặt AI
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
 