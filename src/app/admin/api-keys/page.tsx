"use client";

import { useState, useEffect } from "react";
import { Key, Plus, Edit, Trash2, Copy, Save, X } from "lucide-react";

const toast = {
  success: (msg: string) => {
    if (typeof window !== "undefined") {
      // fallback: log to console (or replace with alert if you prefer)
      console.log("toast.success:", msg);
    }
  },
  error: (msg: string) => {
    if (typeof window !== "undefined") {
      console.error("toast.error:", msg);
    }
  },
};

interface APIKey {
  id: string;
  name: string;
  key: string;
  description?: string;
  created_at: string;
  last_used?: string;
}

export default function APIKeysPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState<APIKey | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    key: "",
    description: "",
  });

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  const fetchAPIKeys = async () => {
    try {
      // Placeholder - replace with actual API call
      setApiKeys([
        {
          id: "1",
          name: "OpenAI API Key",
          key: "sk-proj-1234567890abcdefghijklmnopqrstuvwxyz",
          description: "API key for article generation",
          created_at: new Date().toISOString(),
          last_used: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setIsEditing(true);
    setEditingKey(null);
    setFormData({ name: "", key: "", description: "" });
  };

  const handleEdit = (key: APIKey) => {
    setIsEditing(true);
    setEditingKey(key);
    setFormData({
      name: key.name,
      key: key.key,
      description: key.description || "",
    });
  };

  const handleSave = async () => {
    try {
      // Placeholder - implement actual save logic
      if (editingKey) {
        // Update existing key - DO NOT log sensitive data
        // API call here
      } else {
        // Create new key - DO NOT log sensitive data
        // API call here
      }
      setIsEditing(false);
      fetchAPIKeys();
    } catch (error) {
      console.error("Failed to save API key");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc muốn xoá API key này?")) {
      try {
        // Placeholder - implement actual delete logic
        // API call here - DO NOT log sensitive data
        fetchAPIKeys();
      } catch (error) {
        console.error("Failed to delete API key");
      }
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return "***";
    return key.substring(0, 7) + "..." + key.substring(key.length - 4);
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý API Keys</h1>
              <p className="text-sm text-gray-500">
                Quản lý các API keys cho tích hợp bên thứ ba
              </p>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Thêm API Key
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {isEditing && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingKey ? "Chỉnh sửa API Key" : "Thêm API Key mới"}
            </h2>
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="VD: OpenAI API Key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
              placeholder="sk-proj-..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Mô tả ngắn gọn về API key này..."
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              <Save className="w-4 h-4" />
              Lưu
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Huỷ
            </button>
          </div>
        </div>
      )}

      {/* API Keys List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {apiKeys.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Key className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Chưa có API key nào</p>
            <p className="text-xs mt-1">Thêm API key để bắt đầu sử dụng</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sử dụng lần cuối
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {key.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-gray-600 select-none">
                          {maskKey(key.key)}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(key.key);
                            toast.success("Đã copy API key!");
                          }}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy API key"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {key.description || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {key.last_used
                          ? new Date(key.last_used).toLocaleString("vi-VN")
                          : "Chưa sử dụng"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(key)}
                          className="p-1 text-blue-600 hover:text-blue-700"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(key.id)}
                          className="p-1 text-red-600 hover:text-red-700"
                          title="Xoá"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Lưu ý bảo mật:</strong> API keys là thông tin nhạy cảm. Không chia
          sẻ API keys của bạn với người khác và lưu trữ chúng một cách an toàn.
        </p>
      </div>
    </div>
  );
}
