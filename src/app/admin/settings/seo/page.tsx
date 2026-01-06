"use client";

import { useState, useEffect } from "react";
import { Search, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface DefaultSEO {
  meta_title: string;
  meta_description: string;
}

export default function DefaultSEOPage() {
  const [settings, setSettings] = useState<DefaultSEO>({
    meta_title: "",
    meta_description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings/seo");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch SEO settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert("✅ Cập nhật SEO mặc định thành công!");
      } else {
        alert("❌ Lỗi khi cập nhật SEO mặc định");
      }
    } catch (error) {
      console.error("Failed to save SEO settings:", error);
      alert("❌ Lỗi khi cập nhật SEO mặc định");
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
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SEO mặc định</h1>
            <p className="text-sm text-gray-500">
              Meta title và meta description mặc định cho trang web
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meta Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={settings.meta_title}
            onChange={(e) =>
              setSettings({ ...settings, meta_title: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="ShopIn - Mua sắm trực tuyến"
            maxLength={60}
          />
          <p className="text-xs text-gray-500 mt-1">
            Độ dài khuyến nghị: 50-60 ký tự ({settings.meta_title.length}/60)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meta Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={settings.meta_description}
            onChange={(e) =>
              setSettings({ ...settings, meta_description: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Cửa hàng điện tử trực tuyến uy tín, giá tốt"
            maxLength={160}
          />
          <p className="text-xs text-gray-500 mt-1">
            Độ dài khuyến nghị: 150-160 ký tự (
            {settings.meta_description.length}/160)
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

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Lưu ý:</strong> Các giá trị này sẽ được sử dụng cho các trang
          không có SEO riêng (trang chủ, danh mục, v.v.). Các trang sản phẩm và
          bài viết có thể tự định nghĩa meta tags riêng.
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
              Các tính năng SEO nâng cao như sitemap, robots.txt, và Open Graph sẽ được bổ sung trong các phiên bản tiếp theo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
