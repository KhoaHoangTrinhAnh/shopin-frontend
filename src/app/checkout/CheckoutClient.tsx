"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  Truck,
  ChevronRight,
  Check,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/api";

interface CartItem {
  id: string;
  name: string;
  image: string;
  variant: string;
  price: number;
  quantity: number;
}

// Mock data - replace with actual cart data
const mockCartItems: CartItem[] = [
  {
    id: "1",
    name: "iPhone 16 Pro Max",
    image: "/placeholder.png",
    variant: "256GB - Titan Sa Mạc",
    price: 30590000,
    quantity: 1
  }
];

export default function CheckoutClient() {
  const router = useRouter();
  const [cartItems] = useState<CartItem[]>(mockCartItems);
  const [step, setStep] = useState(1); // 1: Thông tin, 2: Thanh toán, 3: Xác nhận
  
  // Form state
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    note: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("cod"); // cod, card, momo, zalopay

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = 30000; // Fixed shipping fee
  const discount = 0; // TODO: Apply coupon logic
  const total = subtotal + shippingFee - discount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setShippingInfo(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const canProceedToPayment = () => {
    return shippingInfo.fullName && 
           shippingInfo.phone && 
           shippingInfo.address && 
           shippingInfo.city;
  };

  const handlePlaceOrder = () => {
    // TODO: Implement order placement logic
    console.log("Order placed:", { shippingInfo, paymentMethod, cartItems });
    alert("Đặt hàng thành công!");
    router.push("/orders");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-shop_btn_dark_green hover:underline mb-4">
            ← Tiếp tục mua sắm
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[
              { num: 1, label: "Thông tin" },
              { num: 2, label: "Thanh toán" },
              { num: 3, label: "Xác nhận" }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s.num 
                      ? "bg-green-500 text-white" 
                      : "bg-gray-200 text-gray-500"
                  }`}>
                    {step > s.num ? <Check className="h-5 w-5" /> : s.num}
                  </div>
                  <span className="text-sm mt-2">{s.label}</span>
                </div>
                {idx < 2 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > s.num ? "bg-shop_btn_dark_green" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Thông tin giao hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={shippingInfo.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-shop_btn_dark_green focus:border-transparent"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-shop_btn_dark_green focus:border-transparent"
                        placeholder="0912345678"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={shippingInfo.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-shop_btn_dark_green focus:border-transparent"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-shop_btn_dark_green focus:border-transparent"
                      placeholder="Số nhà, tên đường"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Tỉnh/Thành phố <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-shop_btn_dark_green focus:border-transparent"
                        placeholder="TP. Hồ Chí Minh"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Quận/Huyện</label>
                      <input
                        type="text"
                        name="district"
                        value={shippingInfo.district}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-shop_btn_dark_green focus:border-transparent"
                        placeholder="Quận 1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phường/Xã</label>
                      <input
                        type="text"
                        name="ward"
                        value={shippingInfo.ward}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-shop_btn_dark_green focus:border-transparent"
                        placeholder="Phường Bến Nghé"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Ghi chú</label>
                    <textarea
                      name="note"
                      value={shippingInfo.note}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-shop_btn_dark_green focus:border-transparent"
                      placeholder="Ghi chú thêm cho đơn hàng (không bắt buộc)"
                    />
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full bg-shop_btn_dark_green hover:bg-shop_btn_dark_green/90"
                    onClick={() => setStep(2)}
                    disabled={!canProceedToPayment()}
                  >
                    Tiếp tục
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Phương thức thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { id: "cod", name: "Thanh toán khi nhận hàng (COD)", icon: Truck },
                    { id: "card", name: "Thẻ tín dụng/ghi nợ", icon: CreditCard },
                    { id: "momo", name: "Ví MoMo", icon: null },
                    { id: "zalopay", name: "ZaloPay", icon: null }
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full p-4 border-2 rounded-lg flex items-center justify-between transition-all ${
                        paymentMethod === method.id 
                          ? "border-shop_btn_dark_green bg-green-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {method.icon && <method.icon className="h-5 w-5" />}
                        <span className="font-medium">{method.name}</span>
                      </div>
                      {paymentMethod === method.id && (
                        <div className="w-6 h-6 rounded-full bg-shop_btn_dark_green text-white flex items-center justify-center">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </button>
                  ))}

                  <div className="flex gap-3 pt-4">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="flex-1"
                      onClick={() => setStep(1)}
                    >
                      Quay lại
                    </Button>
                    <Button 
                      size="lg" 
                      className="flex-1 bg-shop_btn_dark_green hover:bg-shop_btn_dark_green/90"
                      onClick={() => setStep(3)}
                    >
                      Tiếp tục
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Order Confirmation */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    Xác nhận đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Shipping Info Summary */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Thông tin giao hàng
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                      <p className="font-medium">{shippingInfo.fullName}</p>
                      <p>{shippingInfo.phone}</p>
                      {shippingInfo.email && <p>{shippingInfo.email}</p>}
                      <p>{shippingInfo.address}, {shippingInfo.ward}, {shippingInfo.district}, {shippingInfo.city}</p>
                      {shippingInfo.note && <p className="italic text-gray-600">Ghi chú: {shippingInfo.note}</p>}
                    </div>
                  </div>

                  {/* Payment Method Summary */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Phương thức thanh toán
                    </h3>
                    <Badge variant="outline" className="text-sm">
                      {paymentMethod === "cod" && "Thanh toán khi nhận hàng"}
                      {paymentMethod === "card" && "Thẻ tín dụng/ghi nợ"}
                      {paymentMethod === "momo" && "Ví MoMo"}
                      {paymentMethod === "zalopay" && "ZaloPay"}
                    </Badge>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="flex-1"
                      onClick={() => setStep(2)}
                    >
                      Quay lại
                    </Button>
                    <Button 
                      size="lg" 
                      className="flex-1 bg-shop_btn_dark_green hover:bg-shop_btn_dark_green/90"
                      onClick={handlePlaceOrder}
                    >
                      Đặt hàng
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Đơn hàng ({cartItems.length} sản phẩm)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain"
                        />
                        <span className="absolute -top-2 -right-2 bg-shop_btn_dark_green text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-gray-500">{item.variant}</p>
                        <p className="text-sm font-semibold text-shop_btn_dark_green mt-1">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Price Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển</span>
                    <span>{formatPrice(shippingFee)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-red-500">
                      <span>Giảm giá</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Tổng cộng</span>
                    <span className="text-shop_btn_dark_green">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Coupon Code */}
                <div className="pt-2">
                  <label className="block text-sm font-medium mb-2">Mã giảm giá</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-shop_btn_dark_green focus:border-transparent"
                      placeholder="Nhập mã"
                    />
                    <Button size="sm" variant="outline">Áp dụng</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
