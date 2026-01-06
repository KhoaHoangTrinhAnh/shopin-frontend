"use client";

import { useState, useEffect } from "react";
import { Truck, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ShippingConfig {
  default_shipping_fee: number;
  estimated_delivery_days: number;
}

export default function ShippingConfigPage() {
  const [settings, setSettings] = useState<ShippingConfig>({
    default_shipping_fee: 30000,
    estimated_delivery_days: 3,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings/shipping");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch shipping config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings/shipping", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert("✅ Cập nhật cấu hình vận chuyển thành công!");
      } else {
        alert("❌ Lỗi khi cập nhật cấu hình vận chuyển");
      }
    } catch (error) {
      console.error("Failed to save shipping config:", error);
      alert("❌ Lỗi khi cập nhật cấu hình vận chuyển");
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
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Cấu hình vận chuyển
            </h1>
            <p className="text-sm text-gray-500">
              Phí vận chuyển và thời gian giao hàng dự kiến
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phí vận chuyển mặc định (VNĐ) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={settings.default_shipping_fee}
            onChange={(e) =>
              setSettings({
                ...settings,
                default_shipping_fee: parseInt(e.target.value) || 0,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="30000"
            min="0"
            step="1000"
          />
          <p className="text-xs text-gray-500 mt-1">
            Phí vận chuyển mặc định cho mọi đơn hàng
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thời gian giao hàng dự kiến (ngày){" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={settings.estimated_delivery_days}
            onChange={(e) =>
              setSettings({
                ...settings,
                estimated_delivery_days: parseInt(e.target.value) || 1,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="3"
            min="1"
            max="30"
          />
          <p className="text-xs text-gray-500 mt-1">
            Số ngày giao hàng ước tính hiển thị cho khách hàng
          </p>
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
              Các tính năng vận chuyển nâng cao như tích hợp API đơn vị vận chuyển (GHN, GHTK, VNPost), 
              miễn phí vận chuyển theo khu vực, và tính phí theo cân nặng sẽ được bổ sung trong các phiên bản tiếp theo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
