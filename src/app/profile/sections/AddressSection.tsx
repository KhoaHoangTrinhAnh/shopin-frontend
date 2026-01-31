"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MapPin } from "lucide-react";
import { getAddresses, Address } from "@/lib/api";
import { AddressListDialog } from "@/components/AddressListDialog";
import { useToast } from "@/hooks/useToast";

export default function AddressSection() {
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const data = await getAddresses();
      setAddresses(data.items);
    } catch (error) {
      showToast("Không thể tải danh sách địa chỉ", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Địa chỉ nhận hàng</CardTitle>
            <Button 
              onClick={() => setShowDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Chỉnh sửa địa chỉ
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-muted-foreground mb-4">Chưa có địa chỉ nào</p>
              <p className="text-sm text-muted-foreground">
                Thêm địa chỉ để nhận hàng nhanh chóng
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-green-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold">{address.full_name}</p>
                        {address.is_default && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{address.phone}</p>
                      <p className="text-sm text-muted-foreground">
                        {[
                          address.address_line,
                          address.ward,
                          address.district,
                          address.city,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddressListDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        selectedAddress={null}
        onSelectAddress={() => {}}
      />
    </>
  );
}
