"use client";
import React, { useState } from 'react';
import { FaStar, FaHeart as FaHeartSolid, FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { Product } from '@/data/products';
import ProductCard from './ProductCard';

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
}

// Hardcoded product data from crawled JSON
const HARDCODED_PRODUCT_DATA = {
  url: "https://www.thegioididong.com/dtdd/samsung-galaxy-a17-5g-8gb-128gb",
  product_id: "samsung-galaxy-a17-5g-8gb-128gb",
  name: "Điện thoại Samsung Galaxy A17 5G 8GB/128GB",
  price: 5990000,
  original_price: 6190000,
  brand: "Samsung",
  category: "Điện thoại",
  description: "Không chỉ dừng lại ở vai trò liên lạc, smartphone giờ đây còn là phụ kiện thể hiện cá tính. Samsung Galaxy A17 5G được thiết kế để vừa đẹp mắt, vừa tiện lợi khi sử dụng, mang đến cho người dùng trải nghiệm trọn vẹn về cả nhìn lẫn cảm giác cầm nắm trong phân khúc giá của mình.",
  specifications: [
    {
      "Cấu hình & Bộ nhớ": {
        "Hệ điều hành": "Android 15",
        "Chip xử lý (CPU)": "Exynos 1330",
        "Tốc độ CPU": "2 nhân 2.4 GHz & 6 nhân 2 GHz",
        "Chip đồ họa (GPU)": "Đang cập nhật",
        "RAM": "8 GB",
        "Dung lượng lưu trữ": "128 GB",
        "Dung lượng còn lại (khả dụng) khoảng": "107 GB",
        "Thẻ nhớ": "MicroSD, hỗ trợ tối đa 2 TB",
        "Danh bạ": "Không giới hạn"
      }
    },
    {
      "Camera & Màn hình": {
        "Độ phân giải camera sau": "Chính 50 MP & Phụ 5 MP, 2 MP",
        "Quay phim camera sau": "HD 720p@120fps, FullHD 1080p@30fps",
        "Đèn Flash camera sau": "Có",
        "Tính năng camera sau": "Zoom kỹ thuật số, Xóa phông, Tự động lấy nét (AF), Trôi nhanh thời gian (Time Lapse), Toàn cảnh (Panorama), Siêu cận (Macro), Quay chậm (Slow Motion), Làm đẹp, Chống rung quang học (OIS), Chế độ thức ăn, Chuyên nghiệp (Pro), Ban đêm (Night Mode)",
        "Độ phân giải camera trước": "13 MP",
        "Tính năng camera trước": "Xóa phông, Nhãn dán (AR Stickers), Làm đẹp",
        "Công nghệ màn hình": "Super AMOLED",
        "Độ phân giải màn hình": "Full HD+ (1080 x 2340 Pixels)",
        "Màn hình rộng": "6.7 inch - Tần số quét  90 Hz",
        "Độ sáng tối đa": "800 nits",
        "Mặt kính cảm ứng": "Kính cường lực Corning Gorilla Glass Victus"
      }
    },
    {
      "Pin & Sạc": {
        "Dung lượng pin": "5000 mAh",
        "Loại pin": "Li-Ion",
        "Hỗ trợ sạc tối đa": "25 W",
        "Công nghệ pin": "Tiết kiệm pin, Sạc pin nhanh"
      }
    },
    {
      "Tiện ích": {
        "Bảo mật nâng cao": "Mở khoá vân tay cạnh viền, Mở khoá khuôn mặt",
        "Tính năng đặc biệt": "Trợ lý ảo Google Gemini, Smart Switch (ứng dụng chuyển đổi dữ liệu), Khoanh tròn để tìm kiếm",
        "Kháng nước, bụi": "IP54",
        "Ghi âm": "Ghi âm mặc định, Ghi âm cuộc gọi",
        "Xem phim": "WEBM, MP4, MKV, M4V, FLV, AVI, 3GP, 3G2",
        "Nghe nhạc": "XMF, WAV, RTX, RTTTL, OTA, OGG, OGA, Midi, MXMF, MP3, M4A, IMY, FLAC, AWB, AMR, AAC, 3GA"
      }
    },
    {
      "Kết nối": {
        "Mạng di động": "Hỗ trợ 5G",
        "SIM": "2 Nano SIM",
        "Wifi": "Wi-Fi hotspot",
        "GPS": "QZSS, GPS, GLONASS, GALILEO, BEIDOU",
        "Bluetooth": "v5.3",
        "Cổng kết nối/sạc": "Type-C",
        "Jack tai nghe": "Type-C",
        "Kết nối khác": "NFC"
      }
    },
    {
      "Thiết kế & Chất liệu": {
        "Thiết kế": "Nguyên khối",
        "Chất liệu": "Khung & Mặt lưng nhựa",
        "Kích thước, khối lượng": "Dài 164.4 mm - Ngang 77.9 mm - Dày 7.5 mm - Nặng 192 g",
        "Thời điểm ra mắt": "08/2025"
      }
    }
  ],
  main_image: "samsung-galaxy-a17-5g-gray-1-638925131547875229.jpg",
  images: [
    "samsung-galaxy-a17-5g-gray-2-638925131541619295.jpg",
    "samsung-galaxy-a17-5g-gray-3-638925131535079597.jpg",
    "samsung-galaxy-a17-5g-gray-4-638925131528503776.jpg",
    "samsung-galaxy-a17-5g-gray-5-638925131519844861.jpg",
    "samsung-galaxy-a17-5g-gray-6-638925131512486372.jpg",
    "samsung-galaxy-a17-5g-gray-7-638925131505532821.jpg",
    "samsung-galaxy-a17-5g-gray-8-638925131497911816.jpg",
    "samsung-galaxy-a17-5g-gray-9-638925131491175268.jpg",
    "samsung-galaxy-a17-5g-gray-10-638925131484367936.jpg",
    "samsung-galaxy-a17-5g-gray-11-638925131477412712.jpg",
    "samsung-galaxy-a17-5g-gray-12-638925131468522278.jpg",
    "samsung-galaxy-a17-5g-gray-13-638925131460429115.jpg",
    "galaxy-a17-5g-bbh-638925134410222538.jpg"
  ]
};

const ProductDetail: React.FC<ProductDetailProps> = ({ product, relatedProducts }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [openSpecSections, setOpenSpecSections] = useState<{ [key: string]: boolean }>({});

  // Combine main image with other images
  const allImages = [HARDCODED_PRODUCT_DATA.main_image, ...HARDCODED_PRODUCT_DATA.images];

  const toggleLike = () => {
    setLiked(!liked);
  };

  const handleQuantityChange = (value: number) => {
    const newQuantity = Math.max(1, quantity + value);
    setQuantity(newQuantity);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const toggleSpecSection = (sectionName: string) => {
    setOpenSpecSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const discountPercentage = Math.round(((HARDCODED_PRODUCT_DATA.original_price - HARDCODED_PRODUCT_DATA.price) / HARDCODED_PRODUCT_DATA.original_price) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <a href="/" className="text-gray-700 hover:text-green-600">Trang chủ</a>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <a href="/all-products" className="text-gray-700 hover:text-green-600">Sản phẩm</a>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">{HARDCODED_PRODUCT_DATA.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images Carousel */}
          <div className="space-y-4">
            {/* Main Image with Navigation */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg group">
              <img
                src={`https://cdn.tgdd.vn/Products/Images/42/329149/${allImages[currentImageIndex]}`}
                alt={HARDCODED_PRODUCT_DATA.name}
                className="w-full h-full object-contain"
              />
              
              {/* Previous Button */}
              <button
                onClick={handlePreviousImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FaChevronLeft className="w-5 h-5 text-gray-700" />
              </button>

              {/* Next Button */}
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FaChevronRight className="w-5 h-5 text-gray-700" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            </div>

            {/* Thumbnail Gallery (Owl Dots) */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    currentImageIndex === index
                      ? 'border-green-600 shadow-md scale-105'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={`https://cdn.tgdd.vn/Products/Images/42/329149/${image}`}
                    alt={`${HARDCODED_PRODUCT_DATA.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{HARDCODED_PRODUCT_DATA.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex items-center text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`w-5 h-5 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  4.5 (128 đánh giá)
                </span>
                <span className="ml-4 text-sm text-gray-500">
                  2.5k đã bán
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline space-x-3 mb-6">
                <span className="text-3xl font-bold text-red-600">{HARDCODED_PRODUCT_DATA.price.toLocaleString('vi-VN')}₫</span>
                <span className="text-xl text-gray-500 line-through">{HARDCODED_PRODUCT_DATA.original_price.toLocaleString('vi-VN')}₫</span>
                <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                  -{discountPercentage}%
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả sản phẩm</h3>
              <p className="text-gray-600 leading-relaxed">{HARDCODED_PRODUCT_DATA.description}</p>
            </div>

            {/* Product Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin sản phẩm</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-sm text-gray-500">Thương hiệu</div>
                  <div className="font-semibold">{HARDCODED_PRODUCT_DATA.brand}</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-sm text-gray-500">Danh mục</div>
                  <div className="font-semibold">{HARDCODED_PRODUCT_DATA.category}</div>
                </div>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium">Số lượng:</span>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x min-w-[60px] text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                  <FiShoppingCart className="w-5 h-5" />
                  <span>Thêm vào giỏ</span>
                </button>
                <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Mua ngay
                </button>
                <button
                  onClick={toggleLike}
                  className={`p-3 rounded-lg border transition-colors ${
                    liked
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                  }`}
                >
                  {liked ? <FaHeartSolid className="w-5 h-5" /> : <FiHeart className="w-5 h-5" />}
                </button>
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm text-green-600 font-medium">
                  Còn hàng
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Section with Dropdowns */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông số kỹ thuật</h2>
          <div className="space-y-3">
            {HARDCODED_PRODUCT_DATA.specifications.map((specGroup, index) => {
              const sectionName = Object.keys(specGroup)[0];
              const sectionData = specGroup[sectionName as keyof typeof specGroup] as Record<string, any>;
              const isOpen = openSpecSections[sectionName];

              return (
                <div key={index} className="border rounded-lg overflow-hidden">
                  {/* Dropdown Header */}
                  <button
                    onClick={() => toggleSpecSection(sectionName)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 text-lg">{sectionName}</span>
                    {isOpen ? (
                      <FaChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <FaChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {/* Dropdown Content */}
                  {isOpen && (
                    <div className="p-4 bg-white">
                      <div className="space-y-3">
                        {Object.entries(sectionData).map(([key, value], idx) => (
                          <div
                            key={idx}
                            className={`flex py-3 ${
                              idx !== Object.entries(sectionData).length - 1
                                ? 'border-b border-gray-100'
                                : ''
                            }`}
                          >
                            <span className="text-gray-600 font-medium w-1/3 pr-4">{key}:</span>
                            <span className="text-gray-900 w-2/3">
                              {Array.isArray(value) ? value.join(', ') : value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>


        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                id={relatedProduct.id}
                image={relatedProduct.images[0]}
                title={relatedProduct.name}
                price={relatedProduct.price}
                sold={relatedProduct.sold}
                category={relatedProduct.category}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
