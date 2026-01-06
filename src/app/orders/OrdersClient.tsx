"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Package, Clock, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp, Loader2, Eye, AlertTriangle, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/EmptyState";
import { formatPrice, getOrders, requestOrderCancellation, Order } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const statusConfig: Record<string, { label: string; icon: React.ElementType; variant: "secondary" | "default" | "destructive" | "outline" }> = {
  pending: { label: "Chờ xác nhận", icon: Clock, variant: "secondary" },
  confirmed: { label: "Đã xác nhận", icon: CheckCircle, variant: "default" },
  processing: { label: "Đang xử lý", icon: Package, variant: "default" },
  shipping: { label: "Đang giao", icon: Truck, variant: "default" },
  delivered: { label: "Hoàn thành", icon: CheckCircle, variant: "default" },
  cancelled: { label: "Đã hủy", icon: XCircle, variant: "destructive" },
};

export default function OrdersClient() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  // Cancellation states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getOrders();
      // Transform data to add aliases
      const ordersWithAliases = response.items.map(order => ({
        ...order,
        created_at: order.placed_at,
        shipping_address: order.address,
        discount: 0,
        items: order.items.map(item => ({
          ...item,
          quantity: item.qty,
          price: item.unit_price
        }))
      }));
      setOrders(ordersWithAliases);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchOrders();
    } else if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated, fetchOrders, router]);

  const toggleOrder = (orderId: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const openCancelModal = (order: Order) => {
    setOrderToCancel(order);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    try {
      setCancelling(true);
      await requestOrderCancellation(orderToCancel.id, cancelReason);
      setShowCancelModal(false);
      setOrderToCancel(null);
      await fetchOrders();
      alert("Yêu cầu hủy đơn hàng đã được gửi. Chúng tôi sẽ xử lý trong thời gian sớm nhất.");
    } catch (error: any) {
      alert(error.message || "Có lỗi xảy ra khi gửi yêu cầu hủy");
    } finally {
      setCancelling(false);
    }
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={Package}
          title="Chưa có đơn hàng"
          description="Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!"
          action={
            <Button asChild>
              <Link href="/all-products">Mua sắm ngay</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Đơn hàng của tôi</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const config = statusConfig[order.status] || statusConfig.pending;
          const StatusIcon = config.icon;
          const isExpanded = expandedOrders.has(order.id);

          return (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
                      <p className="font-mono font-semibold">{order.order_number || `#${order.id.slice(0, 8)}`}</p>
                    </div>
                    <Separator orientation="vertical" className="h-10" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ngày đặt</p>
                      <p className="font-semibold">
                        {new Date(order.created_at).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <Separator orientation="vertical" className="h-10" />
                    <div>
                      <p className="text-sm text-muted-foreground">Tổng tiền</p>
                      <p className="font-bold text-primary">
                        {formatPrice(order.total || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={config.variant} className="flex items-center gap-1">
                      <StatusIcon className="h-4 w-4" />
                      {config.label}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleOrder(order.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="p-4">
                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="relative w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={item.main_image || "/placeholder.png"}
                            alt={item.product_name || "Product"}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{item.product_name}</h3>
                          {item.variant_name && (
                            <p className="text-sm text-muted-foreground">
                              Phân loại: {item.variant_name}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Số lượng: {item.qty}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatPrice(item.unit_price)}</p>
                          <p className="text-sm text-muted-foreground">
                            Thành tiền: {formatPrice(item.unit_price * item.qty)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Order Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tạm tính:</span>
                      <span>{formatPrice(order.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Phí vận chuyển:</span>
                      <span>
                        {order.shipping_fee === 0 ? (
                          <span className="text-green-600">Miễn phí</span>
                        ) : (
                          formatPrice(order.shipping_fee || 0)
                        )}
                      </span>
                    </div>
                    {(order.discount || 0) > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Giảm giá:</span>
                        <span>-{formatPrice(order.discount || 0)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Tổng cộng:</span>
                      <span className="text-primary">{formatPrice(order.total || 0)}</span>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {order.address && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold mb-2">Địa chỉ giao hàng</h4>
                      <p className="text-sm">
                        <span className="font-medium">{order.address.full_name}</span>
                        <span className="ml-2">• {order.address.phone}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {[
                          order.address.address_line,
                          order.address.ward,
                          order.address.district,
                          order.address.city,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 mt-4">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      asChild
                    >
                      <Link href={`/orders/${order.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Xem chi tiết
                      </Link>
                    </Button>
                    {order.status === "delivered" && (
                      <Button variant="outline" className="flex-1">
                        Mua lại
                      </Button>
                    )}
                    {(order.status === "pending" || order.status === "confirmed") && !(order as any).cancellation_requested && (
                      <Button 
                        variant="destructive" 
                        className="flex-1"
                        onClick={() => openCancelModal(order)}
                      >
                        Hủy đơn
                      </Button>
                    )}
                    {(order as any).cancellation_requested && !(order as any).cancellation_approved && order.status !== "cancelled" && (
                      <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-md text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        Đang chờ duyệt hủy
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && orderToCancel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Yêu cầu hủy đơn hàng</h3>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setOrderToCancel(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600">
                Mã đơn hàng: <span className="font-mono font-medium">{orderToCancel.order_number || `#${orderToCancel.id.slice(0, 8)}`}</span>
              </p>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                <AlertTriangle className="h-4 w-4 inline mr-2" />
                Yêu cầu hủy sẽ được gửi đến quản trị viên để xét duyệt.
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do hủy đơn (không bắt buộc)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do bạn muốn hủy đơn hàng..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCancelModal(false);
                    setOrderToCancel(null);
                  }}
                >
                  Đóng
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Gửi yêu cầu hủy
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
