"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
import { deleteAccount } from "@/lib/api";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteAccountSection() {
  const router = useRouter();
  const { showToast } = useToast();
  const { logout } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!password) {
      showToast("Vui lòng nhập mật khẩu", "error");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount(password);
      showToast("Tài khoản đã được xóa", "success");
      setPassword(""); // Clear password after successful deletion
      setShowDialog(false);
      // Logout and redirect
      try {
        await logout();
        router.push("/");
      } catch (logoutError) {
        // Handle post-deletion errors separately
        console.error("Error during post-deletion logout:", logoutError);
        // Still redirect even if logout fails
        router.push("/");
      }
    } catch (error: any) {
      showToast(error.message || "Mật khẩu không đúng", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Xóa tài khoản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2">Cảnh báo</h3>
              <p className="text-sm text-red-700">
                Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn, bao gồm:
              </p>
              <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc list-inside">
                <li>Thông tin cá nhân</li>
                <li>Lịch sử đơn hàng</li>
                <li>Địa chỉ đã lưu</li>
                <li>Sản phẩm yêu thích</li>
              </ul>
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => setShowDialog(true)}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa tài khoản
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog 
        open={showDialog} 
        onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) setPassword(""); // Clear password when dialog closes
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
            <DialogDescription>
              Vui lòng nhập mật khẩu của bạn để xác nhận xóa tài khoản. Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="deletePassword">Mật khẩu</Label>
              <Input
                id="deletePassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu của bạn"
                disabled={isDeleting}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDialog(false);
                  setPassword("");
                }}
                disabled={isDeleting}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  "Xác nhận xóa"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
