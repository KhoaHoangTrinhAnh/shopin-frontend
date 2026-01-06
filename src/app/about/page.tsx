import { Metadata } from "next";
import Image from "next/image";
import { CheckCircle2, Target, Award, Users, ShieldCheck, TrendingUp, Heart, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Về chúng tôi - ShopIn | Nơi mua sắm công nghệ uy tín",
  description: "ShopIn - Điểm đến tin cậy cho những người yêu công nghệ. Cam kết sản phẩm chính hãng, giá cả cạnh tranh và dịch vụ tận tâm.",
  keywords: "ShopIn, mua sắm công nghệ, điện thoại chính hãng, laptop uy tín, về chúng tôi",
};

const values = [
  {
    icon: ShieldCheck,
    title: "Sản phẩm chính hãng 100%",
    description: "Cam kết mỗi sản phẩm đều là hàng chính hãng, có nguồn gốc rõ ràng và đầy đủ giấy tờ bảo hành.",
  },
  {
    icon: Award,
    title: "Chất lượng đảm bảo",
    description: "Kiểm tra kỹ lưỡng trước khi giao hàng, đảm bảo sản phẩm hoạt động tốt và không có lỗi kỹ thuật.",
  },
  {
    icon: Heart,
    title: "Dịch vụ tận tâm",
    description: "Đội ngũ tư vấn chuyên nghiệp, nhiệt tình hỗ trợ khách hàng 24/7 qua nhiều kênh liên lạc.",
  },
  {
    icon: TrendingUp,
    title: "Giá cả cạnh tranh",
    description: "Cam kết giá tốt nhất thị trường với nhiều chương trình khuyến mãi hấp dẫn quanh năm.",
  },
  {
    icon: Zap,
    title: "Giao hàng nhanh chóng",
    description: "Vận chuyển siêu tốc trong 24h với đội ngũ shipper chuyên nghiệp và cẩn thận.",
  },
  {
    icon: Users,
    title: "Cộng đồng lớn mạnh",
    description: "Hơn 500,000 khách hàng tin tưởng và lựa chọn ShopIn để mua sắm công nghệ.",
  },
];

const stats = [
  { number: "500K+", label: "Khách hàng tin tưởng" },
  { number: "100K+", label: "Sản phẩm đã bán" },
  { number: "98%", label: "Khách hàng hài lòng" },
  { number: "24/7", label: "Hỗ trợ khách hàng" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Về ShopIn
            </h1>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
              Nơi công nghệ gặp gỡ niềm tin - Điểm đến uy tín cho những người yêu công nghệ
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 -mt-10 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm md:text-base text-gray-600">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6">
              ShopIn là gì?
            </h2>
            <div className="text-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                <strong className="text-primary">ShopIn</strong> là nền tảng thương mại điện tử chuyên cung cấp các sản phẩm công nghệ 
                cao cấp như điện thoại thông minh, laptop, tablet, đồng hồ thông minh và phụ kiện điện tử. 
                Với sứ mệnh mang đến trải nghiệm mua sắm trực tuyến tốt nhất, chúng tôi cam kết cung cấp 
                sản phẩm chính hãng, giá cả cạnh tranh và dịch vụ khách hàng xuất sắc.
              </p>
              <p>
                Được thành lập năm 2020, ShopIn đã nhanh chóng trở thành một trong những điểm đến tin cậy 
                của người tiêu dùng Việt Nam khi mua sắm công nghệ. Chúng tôi tự hào đã phục vụ hơn 500,000 
                khách hàng trên toàn quốc với tỷ lệ hài lòng lên đến 98%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sourcing Commitment Section */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">
              Cam kết nguồn hàng
            </h2>
            <Card>
              <CardContent className="p-8">
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <p>
                      <strong>Đối tác chính thức:</strong> ShopIn là đối tác phân phối chính thức của các thương hiệu 
                      hàng đầu như Apple, Samsung, ASUS, Dell, HP, Lenovo, Huawei và Garmin. Mọi sản phẩm đều được 
                      nhập khẩu trực tiếp từ nhà sản xuất hoặc đại lý ủy quyền.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <p>
                      <strong>Kiểm tra chất lượng nghiêm ngặt:</strong> Mỗi sản phẩm trước khi đến tay khách hàng đều 
                      trải qua quy trình kiểm tra chất lượng 15 bước theo tiêu chuẩn quốc tế. Chúng tôi đảm bảo sản 
                      phẩm hoạt động hoàn hảo, không có lỗi kỹ thuật hay hư hỏng vật lý.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <p>
                      <strong>Bảo hành toàn diện:</strong> Tất cả sản phẩm đều được bảo hành chính hãng từ 12-36 tháng 
                      tùy theo từng dòng sản phẩm. Ngoài ra, ShopIn còn cung cấp gói bảo hành mở rộng và bảo hiểm 
                      rơi vỡ cho khách hàng có nhu cầu.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <p>
                      <strong>Nguồn gốc minh bạch:</strong> Mỗi sản phẩm đều có mã vạch, tem chống hàng giả và hóa đơn 
                      VAT đầy đủ. Khách hàng có thể tra cứu nguồn gốc và thông tin bảo hành ngay trên website hoặc 
                      ứng dụng của chúng tôi.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            Điểm khác biệt của ShopIn
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Tầm nhìn
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Trở thành nền tảng thương mại điện tử công nghệ hàng đầu Việt Nam, nơi khách hàng 
                    có thể tìm thấy mọi sản phẩm công nghệ họ cần với chất lượng tốt nhất và giá cả 
                    hợp lý nhất. Chúng tôi hướng đến việc mở rộng ra khu vực Đông Nam Á trong 5 năm tới.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Sứ mệnh
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Mang công nghệ đến gần hơn với mọi người thông qua trải nghiệm mua sắm trực tuyến 
                    tiện lợi, an toàn và đáng tin cậy. Chúng tôi cam kết không ngừng cải tiến dịch vụ, 
                    đầu tư vào công nghệ và đào tạo đội ngũ để mang lại giá trị tốt nhất cho khách hàng.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Sẵn sàng khám phá công nghệ cùng ShopIn?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Tham gia cộng đồng hơn 500,000 người dùng đang tin tưởng ShopIn để mua sắm công nghệ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/all-products"
              className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Khám phá sản phẩm
            </a>
            <a
              href="/blog"
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors"
            >
              Đọc Blog
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
