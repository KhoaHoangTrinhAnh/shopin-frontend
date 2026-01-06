"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface OrderConfig {
  cod_enabled: boolean;
}

export default function OrderConfigPage() {
  const [settings, setSettings] = useState<OrderConfig>({
    cod_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings/order");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch order config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert("✅ Cập nhật cấu hình đơn hàng thành công!");
      } else {
        alert("❌ Lỗi khi cập nhật cấu hình đơn hàng");
      }
    } catch (error) {
      console.error("Failed to save order config:", error);
      alert("❌ Lỗi khi cập nhật cấu hình đơn hàng");
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
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Cấu hình đơn hàng
            </h1>
            <p className="text-sm text-gray-500">
              Cài đặt phương thức thanh toán và quy trình đơn hàng
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center h-6">
            <input
              type="checkbox"
              checked={settings.cod_enabled}
              onChange={(e) =>
                setSettings({ ...settings, cod_enabled: e.target.checked })
              }
              className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-900 cursor-pointer">
              Bật thanh toán COD (Thanh toán khi nhận hàng)
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Cho phép khách hàng thanh toán bằng tiền mặt khi nhận hàng
            </p>
          </div>
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

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Lưu ý:</strong> Khi tắt COD, khách hàng chỉ có thể thanh toán
          qua chuyển khoản ngân hàng hoặc các phương thức thanh toán online khác.
        </p>
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
              Một số tính năng thanh toán online (VNPay, Momo, ZaloPay) sẽ được bổ sung trong các phiên bản tiếp theo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
