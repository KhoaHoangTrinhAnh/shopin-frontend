"use client";

import { useState, useEffect } from "react";
import { Sparkles, Save, RotateCcw } from "lucide-react";

interface APISettings {
  key: string;
  model_name: string;
  api_endpoint: string;
  default_prompt: string;
  description: string;
}

export default function APISettingsPage() {
  const [settings, setSettings] = useState<APISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings/api/article_generation");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch API settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings/api/article_generation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert("✅ Cập nhật cấu hình API thành công!");
      } else {
        alert("❌ Lỗi khi cập nhật cấu hình API");
      }
    } catch (error) {
      console.error("Failed to save API settings:", error);
      alert("❌ Lỗi khi cập nhật cấu hình API");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Bạn có chắc muốn reset về cấu hình mặc định?")) {
      setSettings({
        key: "article_generation",
        model_name: "gpt-4",
        api_endpoint: "https://api.openai.com/v1/chat/completions",
        default_prompt: `Hãy viết một bài viết chi tiết, chuyên nghiệp và hấp dẫn. Bài viết cần có:
1. Tiêu đề hấp dẫn
2. Mở bài thu hút
3. Nội dung chính với các tiêu đề phụ rõ ràng
4. Kết luận súc tích
5. Sử dụng ngôn ngữ tự nhiên, dễ hiểu

Đảm bảo bài viết có giá trị thông tin cao và tối ưu cho SEO.`,
        description: "Tạo nội dung bài viết tự động từ từ khóa",
      });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cấu hình API</h1>
            <p className="text-sm text-gray-500">
              Cài đặt API cho tính năng tạo nội dung tự động
            </p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      {settings && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
          {/* Model Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={settings.model_name}
              onChange={(e) =>
                setSettings({ ...settings, model_name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="gpt-4"
            />
            <p className="text-xs text-gray-500 mt-1">
              VD: gpt-4, gpt-3.5-turbo, claude-3-opus
            </p>
          </div>

          {/* API Endpoint */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Endpoint <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={settings.api_endpoint}
              onChange={(e) =>
                setSettings({ ...settings, api_endpoint: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="https://api.openai.com/v1/chat/completions"
            />
          </div>

          {/* Default Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Prompt <span className="text-red-500">*</span>
            </label>
            <textarea
              value={settings.default_prompt}
              onChange={(e) =>
                setSettings({ ...settings, default_prompt: e.target.value })
              }
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Nhập prompt mặc định..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Prompt sẽ được sử dụng khi tạo nội dung tự động từ từ khóa
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <input
              type="text"
              value={settings.description}
              onChange={(e) =>
                setSettings({ ...settings, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Mô tả ngắn gọn về API này..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Đang lưu..." : "Lưu cấu hình"}
            </button>
            <button
              onClick={handleReset}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <RotateCcw className="w-4 h-4" />
              Reset về mặc định
            </button>
          </div>
        </div>
      )}

      {/* Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Lưu ý:</strong> API key được quản lý riêng biệt ở phần cài đặt
          AI. Cấu hình này chỉ dành cho endpoint và prompt mặc định.
        </p>
      </div>
    </div>
  );
}
