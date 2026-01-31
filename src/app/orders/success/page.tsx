"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { CheckCircle, Package, MapPin, CreditCard, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice, getOrderById, Order } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Suspense } from "react";

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

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500 hover:bg-yellow-600",
  confirmed: "bg-blue-500 hover:bg-blue-600",
  processing: "bg-purple-500 hover:bg-purple-600",
  shipping: "bg-orange-500 hover:bg-orange-600",
  delivered: "bg-green-500 hover:bg-green-600",
  cancelled: "bg-red-500 hover:bg-red-600"
};

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setError("Không tìm thấy mã đơn hàng");
      setIsLoading(false);
      return;
    }

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
            <Link href="/">Về trang chủ</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Success Icon & Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đặt hàng thành công!
          </h1>
          <p className="text-muted-foreground">
            Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất.
          </p>
        </div>

        {/* Order Info Card */}
        <Card className="mb-6 border-green-200">
          <CardHeader className="bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Mã đơn hàng: {order.order_number || order.id}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{formatDate(order.placed_at)}</p>
              </div>
              <Badge className={statusColors[order.status] || "bg-gray-500"}>
                {statusLabels[order.status] || order.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Shipping Address */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" />
                Địa chỉ nhận hàng
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{order.address?.full_name || "N/A"}</p>
                <p className="text-sm text-muted-foreground mt-1">{order.address?.phone || "N/A"}</p>
                <p className="text-sm mt-1">
                  {order.address ? 
                    `${order.address.address_line}, ${order.address.ward}, ${order.address.district}, ${order.address.city}` 
                    : "N/A"
                  }
                </p>
              </div>
            </div>

            <Separator />

            {/* Products */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-green-600" />
                Sản phẩm ({order.items?.length || 0})
              </h3>
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-start py-3 border-b last:border-0">
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">{item.variant_name}</p>
                      <p className="text-sm text-muted-foreground">Số lượng: {item.qty}</p>
                    </div>
                    <p className="font-semibold text-green-600">{formatPrice(item.unit_price)}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Payment Method */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-green-600" />
                Phương thức thanh toán
              </h3>
              <Badge variant="outline" className="text-sm">
                {paymentMethodLabels[order.payment_method || 'cod'] || order.payment_method}
              </Badge>
            </div>

            <Separator />

            {/* Order Summary */}
            <div>
              <h3 className="font-semibold mb-3">Tổng cộng</h3>
              <div className="space-y-2">
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
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-green-600">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            size="lg" 
            className="flex-1"
            onClick={() => router.push(`/orders/${order.id}`)}
          >
            <Package className="mr-2 h-4 w-4" />
            Theo dõi đơn hàng
          </Button>
          <Button 
            size="lg" 
            className="flex-1 bg-green-600 hover:bg-green-700"
            asChild
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Về trang chủ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
