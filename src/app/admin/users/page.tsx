"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Users,
  Shield,
  ShieldCheck,
  Loader2,
  X,
  Mail,
  Phone,
  Calendar,
  ShoppingCart,
  MapPin,
} from "lucide-react";
import {
  getAdminUsers,
  getAdminUserDetail,
  updateUserRole,
  User,
  PaginationQuery,
} from "@/lib/adminApi";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState<PaginationQuery>({
    page: 1,
    limit: 10,
    search: "",
  });

  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User & { ordersCount: number; addresses: unknown[] } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Role update
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [query.page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getAdminUsers(query);
      setUsers(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery({ ...query, page: 1 });
    loadUsers();
  };

  const openDetailModal = async (userId: string) => {
    try {
      setLoadingDetail(true);
      setShowDetailModal(true);
      const user = await getAdminUserDetail(userId);
      setSelectedUser(user);
    } catch (error) {
      console.error("Error loading user detail:", error);
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const confirmMessage =
      newRole === "admin"
        ? "Bạn có chắc muốn cấp quyền Admin cho người dùng này?"
        : "Bạn có chắc muốn thu hồi quyền Admin của người dùng này?";

    if (!confirm(confirmMessage)) return;

    try {
      setUpdatingRole(userId);
      await updateUserRole(userId, newRole);
      await loadUsers();

      if (selectedUser?.id === userId) {
        const updated = await getAdminUserDetail(userId);
        setSelectedUser(updated);
      }
    } catch (error: any) {
      alert(error.message || "Lỗi khi cập nhật quyền");
    } finally {
      setUpdatingRole(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tổng cộng {total} người dùng
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <form onSubmit={handleSearch} className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, số điện thoại..."
              value={query.search}
              onChange={(e) => setQuery({ ...query, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-gray-500 mt-2">Đang tải...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Không tìm thấy người dùng</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Người dùng
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Điện thoại
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Quyền
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Ngày đăng ký
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <span className="font-medium text-gray-900">
                        {user.full_name || "Chưa cập nhật"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {user.phone || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleRoleToggle(user.id, user.role)}
                      disabled={updatingRole === user.id}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {updatingRole === user.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : user.role === "admin" ? (
                        <ShieldCheck className="w-3 h-3" />
                      ) : (
                        <Shield className="w-3 h-3" />
                      )}
                      {user.role === "admin" ? "Admin" : "User"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {formatDate(user.created_at)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => openDetailModal(user.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Chi tiết</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-500">
              Hiển thị {(query.page! - 1) * query.limit! + 1} -{" "}
              {Math.min(query.page! * query.limit!, total)} / {total} người dùng
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuery({ ...query, page: query.page! - 1 })}
                disabled={query.page === 1}
                className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              <button
                onClick={() => setQuery({ ...query, page: query.page! + 1 })}
                disabled={query.page! * query.limit! >= total}
                className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">Thông tin người dùng</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedUser(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
              </div>
            ) : selectedUser ? (
              <div className="p-4 space-y-6">
                {/* Avatar & Name */}
                <div className="flex items-center gap-4">
                  {selectedUser.avatar_url ? (
                    <img
                      src={selectedUser.avatar_url}
                      alt=""
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {selectedUser.full_name || "Chưa cập nhật tên"}
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        selectedUser.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {selectedUser.role === "admin" ? (
                        <ShieldCheck className="w-3 h-3" />
                      ) : (
                        <Shield className="w-3 h-3" />
                      )}
                      {selectedUser.role === "admin" ? "Admin" : "User"}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{selectedUser.email}</span>
                  </div>
                  {selectedUser.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{selectedUser.phone}</span>
                    </div>
                  )}
                  {selectedUser.date_of_birth && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">
                        {formatDate(selectedUser.date_of_birth)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <ShoppingCart className="w-6 h-6 text-primary mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedUser.ordersCount}
                    </p>
                    <p className="text-sm text-gray-500">Đơn hàng</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <MapPin className="w-6 h-6 text-primary mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedUser.addresses?.length || 0}
                    </p>
                    <p className="text-sm text-gray-500">Địa chỉ</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="pt-4 border-t text-sm text-gray-500 space-y-1">
                  <p>Đăng ký: {formatDate(selectedUser.created_at)}</p>
                  <p>Cập nhật: {formatDate(selectedUser.updated_at)}</p>
                </div>

                {/* Role Action */}
                <div className="pt-4 border-t">
                  <button
                    onClick={() =>
                      handleRoleToggle(selectedUser.id, selectedUser.role)
                    }
                    disabled={updatingRole === selectedUser.id}
                    className={`w-full py-2 rounded-lg font-medium transition-colors ${
                      selectedUser.role === "admin"
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                    }`}
                  >
                    {updatingRole === selectedUser.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : selectedUser.role === "admin" ? (
                      "Thu hồi quyền Admin"
                    ) : (
                      "Cấp quyền Admin"
                    )}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
