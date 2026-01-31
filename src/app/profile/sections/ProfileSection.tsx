"use client";

import { useState, useEffect } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { getProfile, updateProfile, uploadAvatar } from "@/lib/api";
import Image from "next/image";

// Helper function to validate and format avatar URLs for Next.js Image component
function getAvatarSrc(url: string | null): string {
  if (!url) return "/default-avatar.svg";
  if (url.startsWith('data:')) return url; // Data URL preview
  if (url.startsWith('http://') || url.startsWith('https://')) return url; // Absolute URL
  if (url.startsWith('/')) return url; // Relative path with leading slash
  return "/default-avatar.svg"; // Fallback for invalid URLs
}

export default function ProfileSection() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [avatar, setAvatar] = useState<string>("/default-avatar.svg");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    birthDate: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      
      try {
        const profile = await getProfile();
        setFormData({
          fullName: profile.full_name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          gender: profile.gender || "",
          birthDate: profile.date_of_birth || "",
        });
        if (profile.avatar_url) {
          setAvatar(profile.avatar_url);
        }
      } catch (error: any) {
        showToast(error.message || "Không thể tải thông tin cá nhân", "error");
      } finally {
        setIsFetching(false);
      }
    }
    
    fetchProfile();
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast("Kích thước ảnh không được vượt quá 2MB", "error");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast("Vui lòng chọn file ảnh", "error");
      return;
    }

    // Preview image immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server and store URL temporarily
    try {
      setIsLoading(true);
      const result = await uploadAvatar(file);
      setPendingAvatarUrl(result.avatar_url);
      showToast("Đã tải ảnh lên. Nhấn 'Lưu thay đổi' để hoàn tất", "success");
    } catch (error: any) {
      showToast(error.message || "Không thể tải ảnh lên", "error");
      setAvatarPreview(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Include pending avatar URL if it exists
      const updateData: any = {
        full_name: formData.fullName,
        phone: formData.phone,
        gender: formData.gender,
        date_of_birth: formData.birthDate,
      };
      
      if (pendingAvatarUrl) {
        updateData.avatar_url = pendingAvatarUrl;
      }

      await updateProfile(updateData);
      
      // Update avatar state and clear preview/pending
      if (pendingAvatarUrl) {
        setAvatar(pendingAvatarUrl);
        setPendingAvatarUrl(null);
        setAvatarPreview(null);
      }
      
      showToast("Cập nhật hồ sơ thành công", "success");
    } catch (error: any) {
      showToast(error.message || "Không thể cập nhật hồ sơ", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Display avatar preview if exists, otherwise use saved avatar
  const displayAvatar = avatarPreview || avatar;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin cá nhân</CardTitle>
      </CardHeader>
      <CardContent>
        {isFetching ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100">
              <Image
                src={getAvatarSrc(displayAvatar)}
                alt="Avatar"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <Label htmlFor="avatar" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Chọn ảnh</span>
                </div>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </Label>
              <p className="text-xs text-muted-foreground mt-2">
                Dung lượng tối đa 2MB, định dạng JPG, PNG
              </p>
              {pendingAvatarUrl && (
                <p className="text-xs text-yellow-600 mt-1">
                  ⚠ Ảnh chưa được lưu. Nhấn &quot;Lưu thay đổi&quot; để hoàn tất.
                </p>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                placeholder="Nhập họ và tên"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div>
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div>
              <Label htmlFor="gender">Giới tính</Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div>
              <Label htmlFor="birthDate">Ngày sinh</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </div>
        </form>
        )}
      </CardContent>
    </Card>
  );
}
