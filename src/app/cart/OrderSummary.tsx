import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/api";
import { useState } from "react";
import { AddressSelector, Address } from "@/components/AddressSelector";
import Link from "next/link";

interface OrderSummaryProps {
  cartItems: {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];
}

export default function OrderSummary({ cartItems }: OrderSummaryProps) {
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee = subtotal > 5000000 ? 0 : 30000; // Free shipping over 5M VND
  const discount = appliedPromo ? appliedPromo.discount : 0;
  const total = subtotal + shippingFee - discount;

  const handleApplyPromo = () => {
    // Mock promo code validation
    if (promoCode.toUpperCase() === "SAVE10") {
      setAppliedPromo({
        code: promoCode,
        discount: Math.floor(subtotal * 0.1),
      });
    } else if (promoCode) {
      alert("Mã giảm giá không hợp lệ");
    }
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Tóm tắt đơn hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address Selection */}
        <AddressSelector
          selectedAddress={selectedAddress}
          onAddressChange={setSelectedAddress}
        />

        <Separator />

        {/* Promo Code */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Mã giảm giá</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nhập mã giảm giá"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md text-sm"
              disabled={!!appliedPromo}
            />
            <Button
              variant="secondary"
              onClick={handleApplyPromo}
              disabled={!promoCode || !!appliedPromo}
            >
              Áp dụng
            </Button>
          </div>
          {appliedPromo && (
            <p className="text-sm text-green-600">
              Đã áp dụng mã {appliedPromo.code}
            </p>
          )}
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tạm tính</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Phí vận chuyển</span>
            <span className="font-medium">
              {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
            </span>
          </div>
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
          <span className="text-primary">{formatPrice(total)}</span>
        </div>

        {/* Free Shipping Notice */}
        {shippingFee > 0 && (
          <p className="text-xs text-muted-foreground">
            Mua thêm {formatPrice(5000000 - subtotal)} để được miễn phí vận chuyển
          </p>
        )}

        {/* Checkout Button */}
        <Button size="lg" className="w-full mt-4" asChild disabled={!selectedAddress}>
          <Link href="/checkout">
            Thanh toán
          </Link>
        </Button>
        {!selectedAddress && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            Vui lòng chọn địa chỉ nhận hàng
          </p>
        )}
      </CardContent>
    </Card>
  );
}
