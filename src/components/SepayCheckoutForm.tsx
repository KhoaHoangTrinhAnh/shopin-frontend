"use client";

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface SepayCheckoutFormProps {
  checkoutUrl: string;
  formFields: Record<string, any>;
}

export function SepayCheckoutForm({ checkoutUrl, formFields }: SepayCheckoutFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Auto-submit form after component mounts
    if (formRef.current) {
      console.log('[SePay] Auto-submitting payment form');
      formRef.current.submit();
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="h-12 w-12 animate-spin text-green-600 mb-4" />
      <p className="text-lg font-medium text-gray-700 mb-2">Đang chuyển đến trang thanh toán...</p>
      <p className="text-sm text-gray-500">Vui lòng không tắt trình duyệt</p>
      
      {/* Hidden form that auto-submits */}
      <form ref={formRef} action={checkoutUrl} method="POST" className="hidden">
        {Object.entries(formFields).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      </form>
    </div>
  );
}
