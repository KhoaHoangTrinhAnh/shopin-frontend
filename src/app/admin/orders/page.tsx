"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Package,
  ShoppingCart,
  Loader2,
  X,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import {
  getAdminOrders,
  getAdminOrderDetail,
  confirmOrder,
  updateOrderStatus,
  getPendingCancellations,
  approveCancellation,
  rejectCancellation,
  Order,
  PaginationQuery,
} from "@/lib/adminApi";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: "Chờ xác nhận",
    color: "bg-yellow-100 text-yellow-700",
    icon: <Clock className="w-4 h-4" />,
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "bg-blue-100 text-blue-700",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  processing: {
    label: "Đang xử lý",
    color: "bg-purple-100 text-purple-700",
    icon: <Package className="w-4 h-4" />,
  },
  shipping: {
    label: "Đang giao",
    color: "bg-orange-100 text-orange-700",
    icon: <Truck className="w-4 h-4" />,
  },
  delivered: {
    label: "Hoàn thành",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  cancelled: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-700",
    icon: <XCircle className="w-4 h-4" />,
  },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState<PaginationQuery>({
    page: 1,
    limit: 10,
    search: "",
    status: "",
  });

  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Action states
  const [confirming, setConfirming] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  // Cancellation states
  const [pendingCancellations, setPendingCancellations] = useState<Order[]>([]);
  const [cancellationsCount, setCancellationsCount] = useState(0);
  const [showCancellationsTab, setShowCancellationsTab] = useState(false);
  const [approvingCancellation, setApprovingCancellation] = useState(false);
  const [rejectingCancellation, setRejectingCancellation] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [orderToReject, setOrderToReject] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
    loadCancellations();
  }, [query.page, query.status]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await getAdminOrders(query);
      setOrders(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCancellations = async () => {
    try {
      const response = await getPendingCancellations({ limit: 100 });
      setPendingCancellations(response.data);
      setCancellationsCount(response.meta.total);
    } catch (error) {
      console.error("Error loading cancellations:", error);
    }
  };

  const handleApproveCancellation = async (orderId: string) => {
    try {
      setApprovingCancellation(true);
      await approveCancellation(orderId);
      await loadCancellations();
      await loadOrders();
      if (selectedOrder?.id === orderId) {
        const updated = await getAdminOrderDetail(orderId);
        setSelectedOrder(updated);
      }
    } catch (error: any) {
      alert(error.message || "Lỗi khi duyệt hủy đơn hàng");
    } finally {
      setApprovingCancellation(false);
    }
  };

  const openRejectModal = (order: Order) => {
    setOrderToReject(order);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleRejectCancellation = async () => {
    if (!orderToReject) return;
    try {
      setRejectingCancellation(true);
      await rejectCancellation(orderToReject.id, rejectReason);
      setShowRejectModal(false);
      setOrderToReject(null);
      await loadCancellations();
      await loadOrders();
      if (selectedOrder?.id === orderToReject.id) {
        const updated = await getAdminOrderDetail(orderToReject.id);
        setSelectedOrder(updated);
      }
    } catch (error: any) {
      alert(error.message || "Lỗi khi từ chối hủy đơn hàng");
    } finally {
      setRejectingCancellation(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery({ ...query, page: 1 });
    loadOrders();
  };

  const openDetailModal = async (orderId: string) => {
    try {
      setLoadingDetail(true);
      setShowDetailModal(true);
      const order = await getAdminOrderDetail(orderId);
      setSelectedOrder(order);
      setAdminNotes(order.admin_notes || "");
    } catch (error) {
      console.error("Error loading order detail:", error);
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedOrder) return;
    try {
      setConfirming(true);
      await confirmOrder(selectedOrder.id, adminNotes);
      await loadOrders();
      const updated = await getAdminOrderDetail(selectedOrder.id);
      setSelectedOrder(updated);
    } catch (error: any) {
      alert(error.message || "Lỗi khi xác nhận đơn hàng");
    } finally {
      setConfirming(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder) return;
    try {
      setUpdating(true);
      await updateOrderStatus(selectedOrder.id, newStatus, adminNotes);
      await loadOrders();
      const updated = await getAdminOrderDetail(selectedOrder.id);
      setSelectedOrder(updated);
    } catch (error: any) {
      alert(error.message || "Lỗi khi cập nhật trạng thái");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const getStatusInfo = (status: string) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tổng cộng {total} đơn hàng
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b">
        <button
          onClick={() => setShowCancellationsTab(false)}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            !showCancellationsTab
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Tất cả đơn hàng
        </button>
        <button
          onClick={() => setShowCancellationsTab(true)}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            showCancellationsTab
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Yêu cầu hủy đơn
          {cancellationsCount > 0 && (
            <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
              {cancellationsCount}
            </span>
          )}
        </button>
      </div>

      {/* Cancellation Requests Tab */}
      {showCancellationsTab ? (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {pendingCancellations.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
              <p className="text-gray-500">Không có yêu cầu hủy đơn nào</p>
            </div>
          ) : (
            <div className="divide-y">
              {pendingCancellations.map((order) => (
                <div key={order.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            getStatusInfo(order.status).color
                          }`}
                        >
                          {getStatusInfo(order.status).label}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Khách hàng:</span>{" "}
                        {order.customer?.full_name || "N/A"} ({order.customer?.email})
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Tổng tiền:</span>{" "}
                        {formatCurrency(order.total_price || 0)}đ
                      </div>
                      {(order as any).cancellation_reason && (
                        <div className="p-3 bg-red-50 rounded-lg text-sm">
                          <span className="font-medium text-red-700">Lý do hủy:</span>{" "}
                          <span className="text-red-600">{(order as any).cancellation_reason}</span>
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-2">
                        Yêu cầu lúc: {formatDate((order as any).cancellation_requested_at || order.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveCancellation(order.id)}
                        disabled={approvingCancellation}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                      >
                        {approvingCancellation ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Duyệt hủy
                      </button>
                      <button
                        onClick={() => openRejectModal(order)}
                        disabled={rejectingCancellation}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Từ chối
                      </button>
                      <button
                        onClick={() => openDetailModal(order.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <form onSubmit={handleSearch} className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm theo mã đơn hàng..."
                  value={query.search}
                  onChange={(e) => setQuery({ ...query, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <select
                value={query.status}
                onChange={(e) =>
                  setQuery({ ...query, status: e.target.value, page: 1 })
                }
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipping">Đang giao</option>
                <option value="delivered">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
          </select>
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
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Đơn hàng
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Khách hàng
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Tổng tiền
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Ngày tạo
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-900">
                        #{order.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {order.customer?.avatar_url ? (
                          <img
                            src={order.customer.avatar_url}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded-full" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.customer?.full_name || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.customer?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        {formatCurrency(order.total_price || 0)}đ
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                        >
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                        {(order as any).cancellation_requested && !(order as any).cancellation_approved && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                            <AlertTriangle className="w-3 h-3" />
                            Yêu cầu hủy
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {formatDate(order.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => openDetailModal(order.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Chi tiết</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && orders.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-500">
              Hiển thị {(query.page! - 1) * query.limit! + 1} -{" "}
              {Math.min(query.page! * query.limit!, total)} / {total} đơn hàng
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
        </>
      )}

      {/* Order Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">
                Chi tiết đơn hàng #{selectedOrder?.id.slice(0, 8)}
              </h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedOrder(null);
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
            ) : selectedOrder ? (
              <div className="p-4 space-y-6">
                {/* Status & Actions */}
                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                        getStatusInfo(selectedOrder.status).color
                      }`}
                    >
                      {getStatusInfo(selectedOrder.status).icon}
                      {getStatusInfo(selectedOrder.status).label}
                    </span>
                  </div>

                  {/* Status Actions */}
                  {selectedOrder.status === "pending" && (
                    <button
                      onClick={handleConfirm}
                      disabled={confirming}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                      {confirming ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      <span>Xác nhận đơn hàng</span>
                    </button>
                  )}

                  {selectedOrder.status !== "pending" &&
                    selectedOrder.status !== "delivered" &&
                    selectedOrder.status !== "cancelled" && (
                      <div className="flex items-center gap-2">
                        {selectedOrder.status === "confirmed" && (
                          <button
                            onClick={() => handleUpdateStatus("processing")}
                            disabled={updating}
                            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                          >
                            Xử lý
                          </button>
                        )}
                        {selectedOrder.status === "processing" && (
                          <button
                            onClick={() => handleUpdateStatus("shipping")}
                            disabled={updating}
                            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                          >
                            Giao hàng
                          </button>
                        )}
                        {selectedOrder.status === "shipping" && (
                          <button
                            onClick={() => handleUpdateStatus("delivered")}
                            disabled={updating}
                            className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                          >
                            Hoàn thành
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateStatus("cancelled")}
                          disabled={updating}
                          className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                        >
                          Hủy đơn
                        </button>
                      </div>
                    )}
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Thông tin khách hàng
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Họ tên:</span>
                      <span className="ml-2 text-gray-900">
                        {selectedOrder.customer?.full_name || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <span className="ml-2 text-gray-900">
                        {selectedOrder.customer?.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Điện thoại:</span>
                      <span className="ml-2 text-gray-900">
                        {selectedOrder.shipping_phone || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Thanh toán:</span>
                      <span className="ml-2 text-gray-900">
                        {selectedOrder.payment_method === "cod"
                          ? "Thanh toán khi nhận hàng"
                          : selectedOrder.payment_method || "N/A"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Địa chỉ:</span>
                      <span className="ml-2 text-gray-900">
                        {selectedOrder.shipping_address || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Sản phẩm đặt hàng
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        {item.product?.thumbnail ? (
                          <img
                            src={item.product.thumbnail}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {item.product?.name || "Sản phẩm không tồn tại"}
                          </p>
                          <p className="text-sm text-gray-500">
                            x{item.quantity}
                          </p>
                        </div>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(item.price * item.quantity)}đ
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="flex justify-end mt-4 pt-4 border-t">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Tổng cộng</p>
                      <p className="text-xl font-bold text-primary">
                        {formatCurrency(selectedOrder.total_price || 0)}đ
                      </p>
                    </div>
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Ghi chú admin
                  </h4>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Thêm ghi chú cho đơn hàng này..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Lịch sử đơn hàng
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-gray-600">
                        Đơn hàng được tạo lúc{" "}
                        {formatDate(selectedOrder.created_at)}
                      </span>
                    </div>
                    {selectedOrder.confirmed_at && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="text-gray-600">
                          Đã xác nhận lúc {formatDate(selectedOrder.confirmed_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Reject Cancellation Modal */}
      {showRejectModal && orderToReject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Từ chối yêu cầu hủy đơn</h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setOrderToReject(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600">
                Đơn hàng: <span className="font-mono font-medium">#{orderToReject.id.slice(0, 8)}</span>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do từ chối
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối yêu cầu hủy..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setOrderToReject(null);
                  }}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleRejectCancellation}
                  disabled={rejectingCancellation}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {rejectingCancellation && <Loader2 className="w-4 h-4 animate-spin" />}
                  Từ chối yêu cầu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
