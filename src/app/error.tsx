"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 rounded-full bg-destructive/10 p-6">
        <AlertTriangle className="h-16 w-16 text-destructive" />
      </div>
      <h1 className="mb-2 text-4xl font-bold">500</h1>
      <h2 className="mb-4 text-2xl font-semibold">Đã có lỗi xảy ra</h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        Xin lỗi, đã có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại sau.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset}>Thử lại</Button>
        <Button variant="outline" asChild>
          <Link href="/">Về trang chủ</Link>
        </Button>
      </div>
    </div>
  );
}
