"use client";

import { useState, useEffect } from "react";
import { Sparkles, Save } from "lucide-react";
import { getAPISettings, updateAPISettings, APISettings } from "@/lib/adminApi";
import toast from "react-hot-toast";

export default function APISettingsPage() {
  const [settings, setSettings] = useState<APISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [promptText, setPromptText] = useState(""); // For editing

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getAPISettings('article_generation');
      setSettings(data);
      
      // Convert JSONB to text if needed
      if (data.default_prompt) {
        if (typeof data.default_prompt === 'object') {
          setPromptText(JSON.stringify(data.default_prompt, null, 2));
        } else {
          setPromptText(data.default_prompt as string);
        }
      }
    } catch (error) {
      console.error("Failed to fetch API settings:", error);
      toast.error("Lỗi khi tải cấu hình API");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      // Try to parse as JSON first, otherwise use as text
      let promptValue: string | Record<string, any> = promptText;
      try {
        promptValue = JSON.parse(promptText);
      } catch {
        // If parse fails, use as text string
        promptValue = promptText;
      }
      
      await updateAPISettings('article_generation', {
        model_name: settings.model_name,
        api_endpoint: settings.api_endpoint,
        default_prompt: promptValue,
        description: settings.description,
      });
      toast.success("Cập nhật cấu hình API thành công!");
    } catch (error: unknown) {
      console.error("Failed to save API settings:", error);
      const message = error instanceof Error ? error.message : "Lỗi khi cập nhật cấu hình API";
      toast.error(message);
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
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
              placeholder="Nhập prompt mặc định hoặc JSON structure..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Prompt sẽ được sử dụng khi tạo nội dung tự động. Có thể là text hoặc JSON structure
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