import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/api";

interface CartItemProps {
  item: {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    maxQuantity?: number;
    variant?: string;
  };
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
  onQuantityChange?: (id: string, quantity: number) => void;
}

export default function CartItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  onQuantityChange,
}: CartItemProps) {
  const subtotal = item.price * item.quantity;

  return (
    <Card className="p-4">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-contain"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
            {item.variant && (
              <p className="text-sm text-muted-foreground">{item.variant}</p>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            {/* Quantity Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onDecrease(item.id)}
                disabled={item.quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  onQuantityChange?.(item.id, parseInt(e.target.value) || 1)
                }
                className="w-16 text-center border rounded-md py-1 text-sm"
                min="1"
                max={item.maxQuantity || 999}
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onIncrease(item.id)}
                disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Price & Remove */}
            <div className="text-right">
              <p className="font-bold text-primary">{formatPrice(subtotal)}</p>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-auto p-1"
                onClick={() => onRemove(item.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Xóa
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
