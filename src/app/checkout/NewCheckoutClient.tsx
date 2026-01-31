"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  Truck,
  ArrowLeft,
  Check,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice, getCart, getDefaultAddress, createOrder, createSepayPayment, Address as ApiAddress, CartItem as ApiCartItem } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { AddressListDialog } from "@/components/AddressListDialog";
import { Address as SelectorAddress } from "@/components/AddressSelector";
import { SepayCheckoutForm } from "@/components/SepayCheckoutForm";

// Local CartItem with quantity alias
interface CartItem extends Omit<ApiCartItem, 'qty'> {
  quantity: number;
}

export default function NewCheckoutClient() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState<ApiAddress | null>(null);
  const [selectorAddress, setSelectorAddress] = useState<SelectorAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [sepayFormData, setSepayFormData] = useState<{ checkoutUrl: string; formFields: any } | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [showCancelledBanner, setShowCancelledBanner] = useState(false);
  const [cancelledOrderId, setCancelledOrderId] = useState<string | null>(null);

  // Convert API address to selector format
  const toSelectorAddress = (apiAddr: ApiAddress): SelectorAddress => ({
    id: apiAddr.id,
    fullName: apiAddr.full_name,
    phone: apiAddr.phone,
    address: apiAddr.address_line,
    city: apiAddr.city || '',
    district: apiAddr.district || '',
    ward: apiAddr.ward || '',
    isDefault: apiAddr.is_default
  });

  // Fetch cart and default address
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [cartData, addressData] = await Promise.all([
        getCart(),
        getDefaultAddress()
      ]);
      // Transform cart items to add quantity alias
      const transformedItems = (cartData.items || []).map(item => ({
        ...item,
        quantity: item.qty
      }));
      setCartItems(transformedItems);
      setAddress(addressData);
      if (addressData) {
        setSelectorAddress(toSelectorAddress(addressData));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Không thể tải thông tin. Vui lòng thử lại.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchData();
    } else if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated]); // Only depend on auth state changes

  // Handle cancelled payment query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cancelled = params.get('cancelled');
    const orderId = params.get('orderId');
    
    if (cancelled === 'true' && orderId) {
      setShowCancelledBanner(true);
      setCancelledOrderId(orderId);
      setPendingOrderId(orderId);
      showToast('Thanh toán đã bị hủy. Bạn có thể thử lại.', 'warning');
    }
  }, [showToast]);

  // Calculate totals with useMemo to prevent recalculation on every render
  const { subtotal, shippingFee, discount, total } = useMemo(() => {
    const sub = cartItems.reduce((sum, item) => sum + (item.variant?.price || item.unit_price) * item.quantity, 0);
    const shipping = sub >= 500000 ? 0 : 30000;
    const disc = 0; // TODO: Implement coupon discount logic
    return {
      subtotal: sub,
      shippingFee: shipping,
      discount: disc,
      total: sub + shipping - disc
    };
  }, [cartItems]);

  const handlePlaceOrder = async () => {
    if (!address) {
      showToast('Vui lòng chọn địa chỉ nhận hàng', 'error');
      return;
    }
    
    if (cartItems.length === 0 && !pendingOrderId) {
      showToast('Giỏ hàng trống', 'error');
      return;
    }

    try {
      setIsPlacingOrder(true);
      
      // Use existing pendingOrderId or create new order
      let orderId = pendingOrderId;
      if (!orderId) {
        console.log('[Checkout] Creating order...');
        const order = await createOrder({
          address_id: address.id,
          payment_method: paymentMethod,
          note: note || undefined
        });
        orderId = order.id;
        setPendingOrderId(orderId);
        console.log('[Checkout] Order created:', orderId);
      } else {
        console.log('[Checkout] Retrying payment for existing order:', orderId);
      }

      // If payment method is card, create SePay payment and redirect
      if (paymentMethod === 'card') {
        try {
          const returnUrl = `${window.location.origin}/orders/success?orderId=${orderId}`;
          const cancelUrl = `${window.location.origin}/checkout?cancelled=true&orderId=${orderId}`;
          
          console.log('[Checkout] Creating SePay payment for order:', orderId);
          const paymentResponse = await createSepayPayment({
            orderId,
            amount: total,
            returnUrl,
            cancelUrl,
          });
          
          console.log('[Checkout] Payment created, will render form with fields:', paymentResponse.formFields);
          // Set form data to trigger form render and auto-submit
          setSepayFormData({
            checkoutUrl: paymentResponse.checkoutUrl,
            formFields: paymentResponse.formFields
          });
          return; // Form component will handle redirect
        } catch (paymentError) {
          console.error('Payment creation failed:', paymentError);
          showToast('Không thể tạo thanh toán. Vui lòng thử lại hoặc chọn phương thức khác.', 'error');
          // Keep pendingOrderId so user can retry
          return;
        }
      }

      // For COD, redirect to success page directly
      setPendingOrderId(null);
      showToast('Đặt hàng thành công!', 'success');
      router.push(`/orders/success?orderId=${orderId}`);
    } catch (error) {
      console.error('Error creating order:', error);
      showToast('Không thể đặt hàng. Vui lòng thử lại.', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleAddressSelect = (selectedAddress: SelectorAddress | null) => {
    if (selectedAddress) {
      setSelectorAddress(selectedAddress);
      // Convert selector address back to API format for order creation
      setAddress({
        id: selectedAddress.id,
        profile_id: '', // Will be filled by backend
        full_name: selectedAddress.fullName,
        phone: selectedAddress.phone,
        address_line: selectedAddress.address,
        city: selectedAddress.city,
        district: selectedAddress.district,
        ward: selectedAddress.ward,
        is_default: selectedAddress.isDefault || false,
        created_at: '',
        updated_at: ''
      });
    }
    setShowAddressDialog(false);
  };

  const paymentMethods = [
    { 
      id: "cod", 
      name: "Thanh toán khi nhận hàng (COD)", 
      description: "Thanh toán bằng tiền mặt khi nhận hàng",
      icon: Truck 
    },
    { 
      id: "card", 
      name: "Thẻ tín dụng/ghi nợ (SePay)", 
      description: "Thanh toán an toàn qua cổng SePay - Visa, MasterCard, JCB",
      icon: CreditCard 
    }
  ];

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  // SePay payment form (auto-submit)
  if (sepayFormData) {
    return <SepayCheckoutForm checkoutUrl={sepayFormData.checkoutUrl} formFields={sepayFormData.formFields} />;
  }

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Giỏ hàng trống</h2>
          <p className="text-muted-foreground mb-4">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
          <Button asChild>
            <Link href="/all-products">Tiếp tục mua sắm</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/cart" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Quay lại giỏ hàng
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
          <p className="text-muted-foreground mt-1">Xác nhận thông tin và hoàn tất đơn hàng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  Địa chỉ nhận hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                {address ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-lg mb-1">{address.full_name}</p>
                        <p className="text-muted-foreground mb-1">{address.phone}</p>
                        <p className="text-sm">
                          {address.address_line}, {address.ward}, {address.district}, {address.city}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setShowAddressDialog(true)}>
                        Thay đổi
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-muted-foreground mb-2">Chưa có địa chỉ nhận hàng</p>
                    <Button variant="outline" size="sm" onClick={() => setShowAddressDialog(true)}>
                      Thêm địa chỉ
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-green-600" />
                  Sản phẩm ({cartItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                      <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.variant?.main_image || item.product?.main_image || "/placeholder.png"}
                          alt={item.product?.name || "Product"}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{item.product?.name || "Sản phẩm"}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.variant?.name || item.variant?.sku || ""} {item.variant?.color ? `- ${item.variant.color}` : ""}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Số lượng: {item.quantity}</span>
                          <span className="font-semibold text-green-600">{formatPrice(item.variant?.price || item.unit_price)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        paymentMethod === method.id 
                          ? "border-green-500 bg-green-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={method.id} className="flex items-center gap-2 font-medium cursor-pointer">
                          {method.icon && <method.icon className="h-4 w-4" />}
                          {method.name}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                      </div>
                      {paymentMethod === method.id && (
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Order Note */}
            <Card>
              <CardHeader>
                <CardTitle>Ghi chú đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ghi chú thêm cho đơn hàng (không bắt buộc)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phí vận chuyển</span>
                    <span className="font-medium">
                      {shippingFee === 0 ? (
                        <span className="text-green-600">Miễn phí</span>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>
                  {shippingFee === 0 && (
                    <p className="text-xs text-green-600">Miễn phí vận chuyển cho đơn hàng từ 500.000₫</p>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá</span>
                      <span className="font-medium">-{formatPrice(discount)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-green-600">{formatPrice(total)}</span>
                </div>

                {/* Place Order Button */}
                <Button 
                  size="lg" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || !address}
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Đặt hàng'
                  )}
                </Button>

                {/* Terms */}
                <p className="text-xs text-muted-foreground text-center">
                  Bằng cách đặt hàng, bạn đồng ý với{" "}
                  <Link href="/terms" className="underline">Điều khoản sử dụng</Link>
                  {" "}và{" "}
                  <Link href="/privacy" className="underline">Chính sách bảo mật</Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Address Selection Dialog */}
      <AddressListDialog
        open={showAddressDialog}
        onOpenChange={setShowAddressDialog}
        selectedAddress={selectorAddress}
        onSelectAddress={handleAddressSelect}
      />
    </div>
  );
}
