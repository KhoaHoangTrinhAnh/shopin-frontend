import Link from "next/link";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Forbidden() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 rounded-full bg-red-100 dark:bg-red-900/20 p-6">
        <ShieldX className="h-16 w-16 text-red-600 dark:text-red-500" />
      </div>
      <h1 className="mb-2 text-4xl font-bold">403</h1>
      <h2 className="mb-4 text-2xl font-semibold">Truy cập bị từ chối</h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        Bạn không có quyền truy cập vào trang này.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">Về trang chủ</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/all-products">Xem sản phẩm</Link>
        </Button>
      </div>
    </div>
  );
}
