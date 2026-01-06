import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 rounded-full bg-yellow-100 dark:bg-yellow-900/20 p-6">
        <ShieldAlert className="h-16 w-16 text-yellow-600 dark:text-yellow-500" />
      </div>
      <h1 className="mb-2 text-4xl font-bold">401</h1>
      <h2 className="mb-4 text-2xl font-semibold">Chưa đăng nhập</h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        Bạn cần đăng nhập để truy cập trang này.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/login">Đăng nhập</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Về trang chủ</Link>
        </Button>
      </div>
    </div>
  );
}
