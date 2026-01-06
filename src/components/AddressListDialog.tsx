"use client";

import { useState, useEffect, useCallback } from "react";
import { Pencil, Trash2, MapPin, Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Address } from "./AddressSelector";
import { AddressFormDialog } from "./AddressFormDialog";
import { 
  getAddresses, 
  deleteAddress as deleteAddressApi, 
  setDefaultAddress as setDefaultAddressApi,
  Address as ApiAddress 
} from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

interface AddressListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAddress: Address | null;
  onSelectAddress: (address: Address | null) => void;
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

export function AddressListDialog({
  open,
  onOpenChange,
  selectedAddress,
  onSelectAddress
}: AddressListDialogProps) {
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAddresses();
      setAddresses(response.items.map(transformAddress));
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && !formOpen) {
      fetchAddresses();
    }
  }, [open, formOpen, fetchAddresses]);

  const handleAddNew = () => {
    setEditingAddress(null);
    setFormOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
    
    try {
      await deleteAddressApi(id);
      setAddresses(prev => prev.filter(addr => addr.id !== id));
      if (selectedAddress?.id === id) {
        onSelectAddress(null);
      }
      showToast("Đã xóa địa chỉ", "success");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Không thể xóa địa chỉ";
      showToast(msg, "error");
    }
  };

  const handleSaveAddress = () => {
    // Refresh list after save - fetchAddresses will be called via useEffect
    setFormOpen(false);
    setEditingAddress(null);
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddressApi(id);
      setAddresses(prev => prev.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      })));
      showToast("Đã đặt làm địa chỉ mặc định", "success");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Không thể đặt mặc định";
      showToast(msg, "error");
    }
  };

  const handleFormOpenChange = (isOpen: boolean) => {
    setFormOpen(isOpen);
    if (!isOpen) {
      setEditingAddress(null);
    }
  };

  // When form dialog is open, hide the list dialog
  const effectiveListOpen = open && !formOpen;

  return (
    <>
      <Dialog open={effectiveListOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Địa chỉ của tôi</DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={handleAddNew}
              >
                <Plus className="w-4 h-4" />
                Thêm địa chỉ mới
              </Button>

              {addresses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Chưa có địa chỉ nào</p>
                  <p className="text-sm mt-1">Thêm địa chỉ để tiếp tục</p>
                </div>
              ) : (
                addresses.map((address) => (
                  <Card
                    key={address.id}
                    className={`p-4 cursor-pointer transition-all group hover:border-green-500 ${
                      selectedAddress?.id === address.id ? 'border-green-500 bg-green-50' : ''
                    }`}
                    onClick={() => {
                      onSelectAddress(address);
                      onOpenChange(false);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{address.fullName}</p>
                          <span className="text-muted-foreground">|</span>
                          <p className="text-muted-foreground">{address.phone}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {address.address}, {address.ward}, {address.district}, {address.city}
                        </p>
                        {address.isDefault && (
                          <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">
                            Mặc định
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(address);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(address.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    {!address.isDefault && (
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2 h-auto p-0 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(address.id);
                        }}
                      >
                        Đặt làm mặc định
                      </Button>
                    )}
                  </Card>
                ))
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddressFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        address={editingAddress}
        onSave={handleSaveAddress}
      />
    </>
  );
}
