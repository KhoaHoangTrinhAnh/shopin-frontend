"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Key,
  RefreshCcw,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import {
  getAISettings,
  updateAISettings,
  resetAIPrompt,
  AISettings,
} from "@/lib/adminApi";

export default function AISettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form state
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-4");
  const [apiUrl, setApiUrl] = useState(
    "https://api.openai.com/v1/chat/completions"
  );
  const [prompt, setPrompt] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await getAISettings();
      setModel(settings.model);
      setApiUrl(settings.api_url);
      setPrompt(settings.prompt);
      setHasApiKey(settings.has_api_key || false);
      if (settings.api_key && settings.api_key !== "") {
        setApiKey(settings.api_key);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updateData: Partial<AISettings> = {
        model,
        api_url: apiUrl,
        prompt,
      };

      // Only send api_key if it was changed (not the masked version)
      if (apiKey && !apiKey.startsWith("***")) {
        updateData.api_key = apiKey;
      }

      await updateAISettings(updateData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setHasApiKey(true);
    } catch (error: any) {
      alert(error.message || "Lỗi khi lưu cài đặt");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPrompt = async () => {
    if (
      !confirm("Bạn có chắc muốn đặt lại prompt về mặc định không?")
    )
      return;

    try {
      setResetting(true);
      const result = await resetAIPrompt();
      setPrompt(result.prompt);
    } catch (error: any) {
      alert(error.message || "Lỗi khi đặt lại prompt");
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt AI</h1>
        <p className="text-sm text-gray-500 mt-1">
          Cấu hình API và prompt cho tính năng tạo nội dung AI
        </p>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg">
          <CheckCircle className="w-5 h-5" />
          <span>Đã lưu cài đặt thành công!</span>
        </div>
      )}

      {/* API Configuration */}
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Cấu hình API</h2>
            <p className="text-sm text-gray-500">
              Kết nối với OpenAI hoặc các API tương thích
            </p>
          </div>
        </div>

        {/* API Key */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Key className="w-4 h-4" />
            API Key
          </label>
          <div className="flex gap-3">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={hasApiKey ? "••••••••" : "Nhập API Key của bạn"}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 hover:text-primary border rounded-lg hover:border-primary/50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Lấy API Key</span>
            </a>
          </div>
          {hasApiKey && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              API Key đã được cấu hình
            </p>
          )}
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
            <option value="gpt-4o">GPT-4o</option>
            <option value="gpt-4o-mini">GPT-4o Mini</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          </select>
        </div>

        {/* API URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API URL
          </label>
          <input
            type="url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="https://api.openai.com/v1/chat/completions"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <p className="text-xs text-gray-500 mt-1">
            Sử dụng URL mặc định của OpenAI hoặc URL của API tương thích
          </p>
        </div>
      </div>

      {/* Prompt Configuration */}
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Prompt mẫu</h2>
              <p className="text-sm text-gray-500">
                Hướng dẫn AI cách tạo nội dung
              </p>
            </div>
          </div>
          <button
            onClick={handleResetPrompt}
            disabled={resetting}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-primary border rounded-lg hover:border-primary/50 transition-colors disabled:opacity-50"
          >
            {resetting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCcw className="w-4 h-4" />
            )}
            <span>Đặt lại mặc định</span>
          </button>
        </div>

        <div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={10}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-sm resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">
            <AlertCircle className="w-3 h-3 inline mr-1" />
            Prompt sẽ được kết hợp với từ khóa người dùng nhập. Dòng "Dựa trên từ khóa: '{"{$keyword}"}'" sẽ được tự động thêm vào cuối prompt.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>{saving ? "Đang lưu..." : "Lưu cài đặt"}</span>
        </button>
      </div>
    </div>
  );
}
