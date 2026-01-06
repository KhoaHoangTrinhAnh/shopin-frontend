"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Users,
  Package,
  FileText,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/api";
import { getDashboardStats, DashboardStats } from "@/lib/adminApi";

interface OrderStatusCount {
  status: string;
  count: number;
}

interface ExtendedDashboardStats extends DashboardStats {
  ordersByStatus?: OrderStatusCount[];
  totalArticles?: number;
  todayOrders?: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<ExtendedDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err: any) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err.message || "Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipping: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    const labels: Record<string, string> = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      processing: "Đang xử lý",
      shipping: "Đang giao",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
      refunded: "Đã hoàn tiền",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-800"}`}>
        {labels[status] || status}
      </span>
    );
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-lg">{error}</div>
        <button 
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Tổng quan hoạt động cửa hàng</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Doanh thu tháng</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatPrice(stats.stats.revenue.total)}
                </p>
                <div className="flex items-center mt-2">
                  {stats.stats.revenue.change >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm ${stats.stats.revenue.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {Math.abs(stats.stats.revenue.change)}%
                  </span>
                  <span className="text-xs text-gray-400 ml-1">vs tháng trước</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đơn hàng tháng</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.stats.orders.total}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-yellow-600">
                    {stats.stats.pendingOrders} chờ xác nhận
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng người dùng</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.stats.users.total.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  {stats.stats.users.change >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm ${stats.stats.users.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {Math.abs(stats.stats.users.change)}%
                  </span>
                  <span className="text-xs text-gray-400 ml-1">vs tháng trước</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Sản phẩm</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.stats.products.total}
                </p>
                <p className="text-xs text-gray-400 mt-2">Đang bán</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.stats.pendingOrders}</p>
            <p className="text-xs text-gray-500">Chờ xác nhận</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.ordersByStatus?.find(s => s.status === 'confirmed')?.count || 0}
            </p>
            <p className="text-xs text-gray-500">Đã xác nhận</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.ordersByStatus?.find(s => s.status === 'processing')?.count || 0}
            </p>
            <p className="text-xs text-gray-500">Đang xử lý</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Truck className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.ordersByStatus?.find(s => s.status === 'shipping')?.count || 0}
            </p>
            <p className="text-xs text-gray-500">Đang giao</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.ordersByStatus?.find(s => s.status === 'delivered')?.count || 0}
            </p>
            <p className="text-xs text-gray-500">Hoàn thành</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.ordersByStatus?.find(s => s.status === 'cancelled')?.count || 0}
            </p>
            <p className="text-xs text-gray-500">Đã hủy</p>
          </div>
        </div>
      </div>

      {/* Recent Orders & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Đơn hàng gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.slice(0, 5).map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/admin/orders?id=${order.id}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.customer?.full_name || "Khách hàng"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatPrice(order.total_price || order.total || 0)}
                      </p>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Chưa có đơn hàng nào</p>
                </div>
              )}
            </div>
            <Link
              href="/admin/orders"
              className="block text-center text-sm text-primary hover:underline mt-4"
            >
              Xem tất cả đơn hàng →
            </Link>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thống kê nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link 
              href="/admin/articles"
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Bài viết</span>
              </div>
              <span className="font-semibold">{stats.totalArticles || 0}</span>
            </Link>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Tăng trưởng đơn hàng</span>
              </div>
              <span className={`font-semibold ${stats.stats.orders.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.stats.orders.change >= 0 ? '+' : ''}{stats.stats.orders.change}%
              </span>
            </div>
            <Link 
              href="/admin/products"
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Tổng sản phẩm</span>
              </div>
              <span className="font-semibold">{stats.stats.products.total}</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
