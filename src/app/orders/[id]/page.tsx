"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  CreditCard, 
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  PackageCheck,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice, getOrderById, Order } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface OrderTimelineStep {
  id: string;
  label: string;
  description: string;
  date?: string;
  completed: boolean;
  active: boolean;
}

const paymentMethodLabels: Record<string, string> = {
  cod: "Thanh toán khi nhận hàng",
  card: "Thẻ tín dụng/ghi nợ",
  momo: "Ví MoMo",
  zalopay: "ZaloPay"
};

const statusLabels: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  shipping: "Đang giao hàng",
  delivered: "Đã giao hàng",
  cancelled: "Đã hủy"
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    try {
      setIsLoading(true);
      const orderData = await getOrderById(orderId);
      setOrder(orderData);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Không thể tải thông tin đơn hàng");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && orderId) {
      fetchOrder();
    } else if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated, orderId, fetchOrder, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Order timeline based on status
  const getOrderTimeline = (currentStatus: string, placedAt: string): OrderTimelineStep[] => {
    const baseTimeline: OrderTimelineStep[] = [
      {
        id: "pending",
        label: "Chờ xác nhận",
        description: "Đơn hàng đang chờ xác nhận",
        date: formatDate(placedAt),
        completed: false,
        active: false
      },
      {
        id: "confirmed",
        label: "Đã xác nhận",
        description: "Đơn hàng đã được xác nhận",
        completed: false,
        active: false
      },
      {
        id: "shipping",
        label: "Đang giao hàng",
        description: "Đơn hàng đang trên đường giao đến bạn",
        completed: false,
        active: false
      },
      {
        id: "delivered",
        label: "Đã giao hàng",
        description: "Đơn hàng đã được giao thành công",
        completed: false,
        active: false
      }
    ];

    const statusOrder = ["pending", "confirmed", "shipping", "delivered"];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return baseTimeline.map((step, index) => ({
      ...step,
      completed: index < currentIndex,
      active: index === currentIndex
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className: string }> = {
      pending: { variant: "secondary", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
      confirmed: { variant: "secondary", className: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
      processing: { variant: "secondary", className: "bg-purple-100 text-purple-800 hover:bg-purple-200" },
      shipping: { variant: "default", className: "bg-green-600 hover:bg-green-700" },
      delivered: { variant: "secondary", className: "bg-green-100 text-green-800 hover:bg-green-200" },
      cancelled: { variant: "destructive", className: "" }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant} className={config.className}>{statusLabels[status] || status}</Badge>;
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error || "Không tìm thấy đơn hàng"}</p>
          <Button asChild>
            <Link href="/orders">Danh sách đơn hàng</Link>
          </Button>
        </div>
      </div>
    );
  }

  const timeline = getOrderTimeline(order.status, order.placed_at);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/orders" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Danh sách đơn hàng
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
              <p className="text-muted-foreground mt-1">Mã đơn hàng: {order.order_number || order.id}</p>
            </div>
            {getStatusBadge(order.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Timeline & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-green-600" />
                  Trạng thái đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.status === "shipping" && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <PackageCheck className="h-5 w-5 text-green-600" />
                      <span className="font-semibold">Đang giao hàng</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Đơn hàng đang trên đường giao đến bạn
                    </p>
                  </div>
                )}

                <div className="space-y-6">
                  {timeline.map((step, index) => (
                    <div key={step.id} className="flex gap-4">
                      {/* Icon */}
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          step.completed 
                            ? "bg-green-600 text-white" 
                            : step.active 
                            ? "bg-green-100 text-green-600 border-2 border-green-600" 
                            : "bg-gray-200 text-gray-400"
                        }`}>
                          {step.completed ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : step.active ? (
                            <Clock className="h-5 w-5" />
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-gray-400" />
                          )}
                        </div>
                        {index < timeline.length - 1 && (
                          <div className={`w-0.5 h-16 ${
                            step.completed ? "bg-green-600" : "bg-gray-200"
                          }`} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-8">
                        <h3 className={`font-semibold mb-1 ${
                          step.active ? "text-green-600" : step.completed ? "text-gray-900" : "text-gray-400"
                        }`}>
                          {step.label}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-1">{step.description}</p>
                        {step.date && (
                          <p className="text-xs text-muted-foreground">{step.date}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-600" />
                  Sản phẩm ({order.items?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                      <div className="relative w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        {item.main_image && (
                          <Image
                            src={item.main_image}
                            alt={item.product_name ?? 'Product'}
                            fill
                            className="object-contain"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{item.product_name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{item.variant_name}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Số lượng: {item.qty}</span>
                          <span className="font-semibold text-green-600">{formatPrice(item.unit_price)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Shipping Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  Địa chỉ nhận hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{order.address?.full_name || "N/A"}</p>
                  <p className="text-muted-foreground">{order.address?.phone || "N/A"}</p>
                  <p className="text-muted-foreground">
                    {order.address ? 
                      `${order.address.address_line}, ${order.address.ward}, ${order.address.district}, ${order.address.city}` 
                      : "N/A"
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  Thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">
                  {paymentMethodLabels[order.payment_method || 'cod'] || order.payment_method}
                </Badge>
                {order.status === "pending" && (
                  <p className="text-xs text-yellow-600 mt-2">
                    Chưa thanh toán
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tổng cộng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span>
                    {order.shipping_fee === 0 ? (
                      <span className="text-green-600">Miễn phí</span>
                    ) : (
                      formatPrice(order.shipping_fee)
                    )}
                  </span>
                </div>
                {(order.discount || 0) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatPrice(order.discount || 0)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-green-600">{formatPrice(order.total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Note */}
            {order.note && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ghi chú</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{order.note}</p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                Liên hệ hỗ trợ
              </Button>
              {order.status === "pending" && (
                <Button variant="destructive" className="w-full">
                  <XCircle className="mr-2 h-4 w-4" />
                  Hủy đơn hàng
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
