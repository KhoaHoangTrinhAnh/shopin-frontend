"use client";

import { useState, useEffect } from "react";
import { Store, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ShopInfo {
  shop_name: string;
  contact_email: string;
  hotline: string;
}

export default function ShopInfoPage() {
  const [settings, setSettings] = useState<ShopInfo>({
    shop_name: "",
    contact_email: "",
    hotline: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings/shop-info");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch shop info:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings/shop-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert("✅ Cập nhật thông tin cửa hàng thành công!");
      } else {
        alert("❌ Lỗi khi cập nhật thông tin cửa hàng");
      }
    } catch (error) {
      console.error("Failed to save shop info:", error);
      alert("❌ Lỗi khi cập nhật thông tin cửa hàng");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Breadcrumb */}
      <Link
        href="/admin/settings"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại cài đặt
      </Link>

      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Thông tin cửa hàng
            </h1>
            <p className="text-sm text-gray-500">
              Cập nhật tên, email và hotline của cửa hàng
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên cửa hàng <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={settings.shop_name}
            onChange={(e) =>
              setSettings({ ...settings, shop_name: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="ShopIn"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email liên hệ <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={settings.contact_email}
            onChange={(e) =>
              setSettings({ ...settings, contact_email: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="contact@shopin.vn"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số hotline <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={settings.hotline}
            onChange={(e) =>
              setSettings({ ...settings, hotline: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="+84 123 456 789"
          />
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      {/* Development Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800">
              🚧 Tính năng đang trong quá trình phát triển
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Các tính năng nâng cao như địa chỉ cửa hàng, giờ làm việc, và mạng xã hội sẽ được bổ sung trong các phiên bản tiếp theo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
