"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AddressListDialog } from "./AddressListDialog";
import { getAddresses, Address as ApiAddress } from "@/lib/api";

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  isDefault?: boolean;
}

interface AddressSelectorProps {
  selectedAddress: Address | null;
  onAddressChange: (address: Address | null) => void;
}

// Transform API address to component address format
function transformAddress(apiAddr: ApiAddress): Address {
  return {
    id: apiAddr.id,
    fullName: apiAddr.full_name,
    phone: apiAddr.phone,
    address: apiAddr.address_line,
    ward: apiAddr.ward || "",
    district: apiAddr.district || "",
    city: apiAddr.city || "",
    isDefault: apiAddr.is_default,
  };
}

export function AddressSelector({ selectedAddress, onAddressChange }: AddressSelectorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Auto-load default address on mount
  useEffect(() => {
    const loadDefaultAddress = async () => {
      // Only load if no address is selected
      if (selectedAddress) return;
      
      try {
        const response = await getAddresses();
        const defaultAddr = response.items.find(addr => addr.is_default);
        if (defaultAddr) {
          onAddressChange(transformAddress(defaultAddr));
        }
      } catch (error) {
        console.error('Failed to load default address:', error);
      }
    };
    
    loadDefaultAddress();
  }, []); // Run only on mount

  const handleAddressSelect = (address: Address | null) => {
    onAddressChange(address);
    setDialogOpen(false);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Địa chỉ nhận hàng</label>
      
      {selectedAddress ? (
        <Card 
          className="p-4 cursor-pointer hover:border-green-500 transition-colors"
          onClick={() => setDialogOpen(true)}
        >
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium">{selectedAddress.fullName}</p>
                <span className="text-muted-foreground">|</span>
                <p className="text-muted-foreground">{selectedAddress.phone}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedAddress.address}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.city}
              </p>
              {selectedAddress.isDefault && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                  Mặc định
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setDialogOpen(true)}>
              Thay đổi
            </Button>
          </div>
        </Card>
      ) : (
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 h-auto py-4"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Thêm địa chỉ nhận hàng
        </Button>
      )}

      <AddressListDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedAddress={selectedAddress}
        onSelectAddress={handleAddressSelect}
      />
    </div>
  );
}
