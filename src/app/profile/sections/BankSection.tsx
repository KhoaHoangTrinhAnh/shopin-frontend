"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus } from "lucide-react";

export default function BankSection() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Thẻ ngân hàng</CardTitle>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Thêm thẻ
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-muted-foreground mb-4">Chưa có thẻ ngân hàng nào</p>
          <p className="text-sm text-muted-foreground">
            Thêm thẻ ngân hàng để thanh toán nhanh chóng và tiện lợi hơn
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
