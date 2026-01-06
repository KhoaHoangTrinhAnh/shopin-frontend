// Mock data cho sản phẩm
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  description: string;
  images: string[];
  rating: number;
  reviewCount: number;
  sold: number;
  brand: string;
  category: string;
  color: string;
  size?: string;
  weight: string;
  material: string;
  warranty: string;
  inStock: boolean;
  features: string[];
  specifications: {
    [key: string]: string;
  };
}

export const products: Product[] = [
  {
    id: "1",
    name: "ASUS ROG Zephyrus G16 Gaming Laptop",
    price: 2499,
    originalPrice: 2799,
    description: "Ultimate gaming laptop with RTX 4070, 16GB RAM, 1TB SSD. Perfect for gaming and content creation with stunning 16-inch QHD display and premium build quality.",
    images: [
      "/ZephyrusG16.png",
      "/Gaming.png",
      "/ZephyrusG16.png",
      "/Gaming.png"
    ],
    rating: 4.8,
    reviewCount: 1247,
    sold: 856,
    brand: "ASUS",
    category: "Gaming Laptop",
    color: "Black",
    weight: "2.1 kg",
    material: "Aluminum",
    warranty: "2 years",
    inStock: true,
    features: [
      "NVIDIA RTX 4070 Graphics",
      "16GB DDR5 RAM",
      "1TB NVMe SSD",
      "16-inch QHD 165Hz Display",
      "RGB Backlit Keyboard",
      "Wi-Fi 6E",
      "Thunderbolt 4"
    ],
    specifications: {
      "Processor": "Intel Core i7-13700H",
      "Graphics": "NVIDIA RTX 4070 8GB",
      "Memory": "16GB DDR5-4800MHz",
      "Storage": "1TB PCIe 4.0 NVMe SSD",
      "Display": "16-inch QHD (2560x1600) 165Hz",
      "Battery": "90Wh 4-cell Li-ion",
      "Ports": "2x USB-C, 2x USB-A, HDMI, RJ45",
      "OS": "Windows 11 Home"
    }
  },
  {
    id: "2",
    name: "MacBook Pro 14-inch M3 Pro",
    price: 1999,
    originalPrice: 2199,
    description: "Professional laptop with Apple M3 Pro chip, 18GB unified memory, and stunning Liquid Retina XDR display. Perfect for developers and creative professionals.",
    images: [
      "/Gaming.png",
      "/ZephyrusG16.png",
      "/Gaming.png",
      "/ZephyrusG16.png"
    ],
    rating: 4.9,
    reviewCount: 892,
    sold: 654,
    brand: "Apple",
    category: "Professional Laptop",
    color: "Space Gray",
    weight: "1.6 kg",
    material: "Aluminum",
    warranty: "1 year",
    inStock: true,
    features: [
      "Apple M3 Pro Chip",
      "18GB Unified Memory",
      "512GB SSD",
      "14-inch Liquid Retina XDR",
      "Magic Keyboard",
      "Touch ID",
      "Force Touch Trackpad"
    ],
    specifications: {
      "Processor": "Apple M3 Pro (12-core CPU, 18-core GPU)",
      "Memory": "18GB Unified Memory",
      "Storage": "512GB SSD",
      "Display": "14-inch Liquid Retina XDR (3024x1964)",
      "Battery": "Up to 22 hours",
      "Ports": "3x Thunderbolt 4, HDMI, SDXC",
      "OS": "macOS Sonoma"
    }
  },
  {
    id: "3",
    name: "Dell XPS 13 Plus Ultrabook",
    price: 1299,
    originalPrice: 1499,
    description: "Premium ultrabook with 13th Gen Intel processor, 16GB RAM, and stunning 13.4-inch OLED display. Perfect for business and productivity.",
    images: [
      "/ZephyrusG16.png",
      "/Gaming.png",
      "/ZephyrusG16.png",
      "/Gaming.png"
    ],
    rating: 4.7,
    reviewCount: 567,
    sold: 423,
    brand: "Dell",
    category: "Ultrabook",
    color: "Platinum Silver",
    weight: "1.2 kg",
    material: "Aluminum",
    warranty: "3 years",
    inStock: true,
    features: [
      "13th Gen Intel Core i7",
      "16GB LPDDR5 RAM",
      "512GB PCIe SSD",
      "13.4-inch 3.5K OLED Display",
      "Backlit Keyboard",
      "Fingerprint Reader",
      "Thunderbolt 4"
    ],
    specifications: {
      "Processor": "Intel Core i7-1360P",
      "Graphics": "Intel Iris Xe Graphics",
      "Memory": "16GB LPDDR5-5200MHz",
      "Storage": "512GB PCIe 4.0 NVMe SSD",
      "Display": "13.4-inch 3.5K (3456x2160) OLED",
      "Battery": "55Wh 4-cell Li-ion",
      "Ports": "2x Thunderbolt 4, 1x USB-C",
      "OS": "Windows 11 Pro"
    }
  }
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getRelatedProducts = (currentProductId: string, limit: number = 4): Product[] => {
  return products
    .filter(product => product.id !== currentProductId)
    .slice(0, limit);
};

