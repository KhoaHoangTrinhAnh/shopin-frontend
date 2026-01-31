"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Address } from "./AddressSelector";
import { createAddress, updateAddress } from "@/lib/api";
import { useToast } from "@/hooks/useToast";

interface AddressFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: Address | null;
  onSave: (address: Address) => void;
}

export function AddressFormDialog({
  open,
  onOpenChange,
  address,
  onSave
}: AddressFormDialogProps) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Address>>({
    fullName: "",
    phone: "",
    address: "",
    ward: "",
    district: "",
    city: "",
    isDefault: false
  });

  useEffect(() => {
    if (address) {
      setFormData(address);
    } else {
      setFormData({
        fullName: "",
        phone: "",
        address: "",
        ward: "",
        district: "",
        city: "",
        isDefault: false
      });
    }
  }, [address, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
      showToast("Vui lòng điền đầy đủ thông tin bắt buộc", "error");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const apiData = {
        full_name: formData.fullName,
        phone: formData.phone,
        address_line: formData.address,
        ward: formData.ward || undefined,
        district: formData.district || undefined,
        city: formData.city,
        is_default: formData.isDefault || false,
      };

      let savedAddress;
      if (address?.id) {
        // Update existing
        savedAddress = await updateAddress(address.id, apiData);
        showToast("Đã cập nhật địa chỉ", "success");
      } else {
        // Create new - use response to get the ID
        savedAddress = await createAddress(apiData);
        showToast("Đã thêm địa chỉ mới", "success");
      }

      // Use API response data instead of form data to get correct ID
      onSave({
        id: savedAddress?.id || address?.id || "",
        fullName: savedAddress?.full_name || formData.fullName,
        phone: savedAddress?.phone || formData.phone,
        address: savedAddress?.address_line || formData.address,
        ward: savedAddress?.ward || formData.ward || "",
        district: savedAddress?.district || formData.district || "",
        city: savedAddress?.city || formData.city,
        isDefault: savedAddress?.is_default ?? formData.isDefault ?? false,
      });
      
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Không thể lưu địa chỉ";
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof Address, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {address ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Họ và tên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder="Nguyễn Văn A"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Số điện thoại <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="0912345678"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              Địa chỉ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Số nhà, tên đường"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ward">Phường/Xã</Label>
              <Input
                id="ward"
                value={formData.ward}
                onChange={(e) => handleChange("ward", e.target.value)}
                placeholder="Phường 1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">Quận/Huyện</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => handleChange("district", e.target.value)}
                placeholder="Quận 1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">
                Tỉnh/TP <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="TP. HCM"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => handleChange("isDefault", e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <Label htmlFor="isDefault" className="cursor-pointer">
              Đặt làm địa chỉ mặc định
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {address ? "Cập nhật" : "Thêm địa chỉ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
