# 🛍️ ShopIn Frontend

<p align="center">
  <img src="https://nextjs.org/static/blog/next-15/twitter-card.png" width="600" alt="Next.js" />
</p>

<p align="center">
  Frontend application cho hệ thống thương mại điện tử ShopIn - Xây dựng với Next.js 16, TypeScript và TailwindCSS
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Structure</a> •
  <a href="#deployment">Deployment</a>
</p>

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Pages & Routes](#-pages--routes)
- [Components](#️-components)
- [State Management](#-state-management)
- [Styling](#-styling)
- [Deployment](#-deployment)

---

## 🎯 Tổng quan

**ShopIn Frontend** là ứng dụng web thương mại điện tử hiện đại được xây dựng với Next.js 16 (App Router), TypeScript, và TailwindCSS. Ứng dụng cung cấp trải nghiệm mua sắm trực tuyến hoàn chỉnh với:

- 🛒 Giao diện mua sắm mượt mà và responsive
- 🔐 Xác thực người dùng an toàn
- 🎨 UI/UX hiện đại với TailwindCSS + Shadcn/ui
- ⚡ Server-side rendering với Next.js App Router
- 📱 Mobile-first design
- 🤖 Admin panel với AI article generation
- 💳 Tích hợp thanh toán SePay
- 💬 Real-time chat support
- 🔍 Tìm kiếm và lọc sản phẩm mạnh mẽ
### 📌 Về Dự Án

> **Lưu ý quan trọng:** ShopIn là **side project cá nhân** được tạo ra với mục đích:
> - 🎓 **Học tập và rèn luyện kỹ năng** phát triển fullstack website
> - 💻 **Thực hành các công nghệ hiện đại**: Next.js 16, React 19, TypeScript, TailwindCSS
> - 🎨 **Nghiên cứu UI/UX** của các trang thương mại điện tử hàng đầu
> - 🛒 **Tìm hiểu nghiệp vụ bán hàng** của hệ thống trang web thương mại điện tử
> - 🔧 **Thử nghiệm các pattern** và best practices trong web development
>
> ⚠️ **Dự án KHÔNG có mục đích thương mại** và không được sử dụng cho môi trường production thực tế.

### 📊 Dữ Liệu Sản Phẩm

Trang web hiển thị **dữ liệu sản phẩm thực tế** được thu thập từ TheGioiDiDong.com:

**Data Source:** [TheGioiDiDong Product Crawler](https://github.com/KhoaHoangTrinhAnh/thegioididong-product-crawler)

- 📱 **490+ sản phẩm** công nghệ (iPhone, MacBook, Galaxy, Dell, Asus...)
- 🏷️ **4 danh mục chính:** Điện thoại, Laptop, Đồng hồ thông minh, Tablet
- 🖼️ **High-quality images** với multiple views
- 📝 **Chi tiết đầy đủ:** Specifications, variants, pricing, reviews
- 💰 **Giá thực tế** từ thị trường Việt Nam (VNĐ)

> Dữ liệu được crawl tự động và import vào Supabase database, cung cấp dataset realistic cho testing và development.
---

## ✨ Features

### 🛍️ Shopping Experience

#### Homepage
- Hero banner carousel với animations
- Featured products showcase
- Category navigation
- Best-selling products
- Product recommendations
- Blog/news section

#### Product Catalog
- **Product Listing:** Grid/list view với pagination
- **Advanced Filtering:** Theo category, brand, price range, ratings
- **Search:** Full-text search với suggestions
- **Sorting:** Theo giá, tên, mới nhất, bán chạy
- **Product Card:** Images, ratings, pricing, quick actions

#### Product Details
- Image gallery với zoom
- Variant selection (color, size, storage)
- Specifications table
- Stock availability
- Add to cart/favorites
- Related products
- Reviews & ratings (coming soon)

#### Shopping Cart
- Persistent cart (logged in users)
- Quantity adjustment
- Variant management
- Price calculation
- Coupon application
- Remove items

#### Checkout Process
- Multi-step checkout flow
- Address selection/creation
- Shipping method selection
- Payment method (SePay)
- Order summary
- Order confirmation

### 👤 User Features

#### Authentication
- Email/password registration
- Login with JWT
- Logout
- Password reset (coming soon)
- Profile management

#### User Dashboard
- **Profile:** View/edit personal info, avatar upload
- **Addresses:** Manage multiple shipping addresses
- **Orders:** Order history, tracking, cancellation
- **Favorites:** Wishlist management
- **Settings:** Account settings

### 📝 Content & Blog

#### Blog/News
- Article listing với categories
- Article detail page
- SEO-optimized pages
- Rich text content
- Social sharing (coming soon)

### 💬 Customer Support

#### Live Chat
- Real-time messaging
- Conversation history
- Customer support interface
- Admin chat dashboard

### 👨‍💼 Admin Panel

> Accessible at `/admin/*` routes (requires admin authentication)

#### Dashboard
- Overview statistics
- Recent orders
- Sales charts (coming soon)

#### Product Management
- CRUD operations
- Image upload
- Variant management
- Inventory tracking
- Category/brand assignment

#### Order Management
- Order list with filters
- Order details
- Status updates
- Cancellation handling

#### Article Management
- Create/edit articles
- **AI Generation:** Auto-generate content from keyword
- SEO optimization
- Publish/draft status

#### Coupon Management
- Create/edit coupons
- Discount types (%, fixed amount)
- Validity period
- Usage limits

#### Settings
- API configuration
- AI prompt templates
- System settings

---

## 🛠️ Tech Stack

### Core Framework
- **Next.js** 16.0.7 - React framework with App Router
- **React** 19.2.1 - UI library
- **TypeScript** 5.x - Type safety

### Styling & UI
- **TailwindCSS** 3.4 - Utility-first CSS
- **Shadcn/ui** - Component library
- **Radix UI** - Headless UI primitives
- **Framer Motion** - Animations
- **Lucide Icons** - Icon library
- **React Icons** - Additional icons

### State Management
- **Zustand** 5.x - Lightweight state management
- **React Query** (@tanstack/react-query) - Server state
- **React Hook Form** - Form state
- **Zod** - Schema validation

### Data Fetching & API
- **Supabase Client** - Backend integration
- **Fetch API** - HTTP requests
- **Next.js Server Components** - SSR data fetching

### Authentication
- **NextAuth** 4.24 - Authentication solution
- **JWT** - Token-based auth

### Utilities
- **date-fns** - Date formatting
- **clsx** - Conditional classNames
- **tailwind-merge** - Merge Tailwind classes
- **react-hot-toast** - Notifications

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

---

## 📁 Cấu trúc dự án

```
shopin-frontend/
├── public/                     # Static assets
│   ├── images/
│   └── ...
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage
│   │   ├── globals.css         # Global styles
│   │   ├── about/              # Trang giới thiệu
│   │   ├── admin/              # Admin panel routes
│   │   │   ├── page.tsx        # Admin dashboard
│   │   │   ├── articles/       # Article management
│   │   │   │   ├── page.tsx    # Article list
│   │   │   │   ├── new/        # Create article
│   │   │   │   └── [id]/edit/  # Edit article
│   │   │   ├── orders/         # Order management
│   │   │   ├── products/       # Product management
│   │   │   ├── coupons/        # Coupon management
│   │   │   ├── chat/           # Chat management
│   │   │   └── api-settings/   # API settings
│   │   ├── all-products/       # Product catalog
│   │   ├── product/[id]/       # Product detail
│   │   ├── cart/               # Shopping cart
│   │   ├── checkout/           # Checkout flow
│   │   ├── orders/             # User orders
│   │   ├── profile/            # User profile
│   │   ├── favorites/          # Wishlist
│   │   ├── blog/               # Blog listing
│   │   ├── auth/               # Auth pages
│   │   ├── 401/                # Unauthorized
│   │   └── 403/                # Forbidden
│   ├── components/             # React components
│   │   ├── Header.tsx          # Site header
│   │   ├── Footer.tsx          # Site footer
│   │   ├── ProductCard.tsx     # Product card
│   │   ├── ProductDetail.tsx   # Product details
│   │   ├── BannerCarousel.tsx  # Homepage carousel
│   │   ├── CategoryFilter.tsx  # Category filters
│   │   ├── Search.tsx          # Search component
│   │   ├── LoginModal.tsx      # Login modal
│   │   ├── RegisterModal.tsx   # Register modal
│   │   ├── ChatbotIcon.tsx     # Chat widget
│   │   ├── AddressSelector.tsx # Address management
│   │   └── ...                 # More components
│   ├── lib/                    # Utilities & helpers
│   │   ├── adminApi.ts         # Admin API client
│   │   ├── supabase.ts         # Supabase client
│   │   └── utils.ts            # Utility functions
│   ├── contexts/               # React contexts
│   │   ├── AuthContext.tsx     # Auth state
│   │   ├── CartContext.tsx     # Cart state
│   │   └── ...
│   ├── features/               # Feature modules
│   │   └── ...
│   ├── types/                  # TypeScript types
│   │   └── ...
│   ├── config/                 # App configuration
│   │   └── ...
│   └── data/                   # Static data
│       └── ...
├── .env.example                # Environment template
├── .env                        # Environment variables (gitignored)
├── next.config.ts              # Next.js configuration
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript config
├── postcss.config.js           # PostCSS config
└── package.json                # Dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 20.x
- **npm** >= 10.x
- **Backend API** running (ShopIn Backend)

### Installation

1. **Clone repository:**
```bash
git clone https://github.com/your-username/shopin-frontend.git
cd shopin-frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Setup environment variables:**
```bash
cp .env.example .env
```

Chỉnh sửa `.env`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# API Configuration
NEXT_PUBLIC_API_BASE=http://localhost:3000

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

4. **Start development server:**
```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:3001`

### Development Commands

```bash
# Development server (port 3001)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGci...` |
| `NEXT_PUBLIC_API_BASE` | Backend API base URL | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Frontend app URL | `http://localhost:3001` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SePay_PUBLISHABLE_KEY` | Sepay public key | - |

---

## 🗺️ Pages & Routes

### Public Routes

| Route | Description | Page |
|-------|-------------|------|
| `/` | Homepage | Landing page with products |
| `/about` | Về chúng tôi | Company info |
| `/all-products` | Danh sách sản phẩm | Product catalog |
| `/product/[id]` | Chi tiết sản phẩm | Product detail page |
| `/blog` | Blog listing | Article list |
| `/blog/[slug]` | Article detail | Blog post |
| `/auth/login` | Đăng nhập | Login page |
| `/auth/register` | Đăng ký | Registration page |

### Protected Routes (Auth Required)

| Route | Description | Access |
|-------|-------------|--------|
| `/cart` | Giỏ hàng | Logged-in users |
| `/checkout` | Thanh toán | Logged-in users |
| `/orders` | Đơn hàng | Logged-in users |
| `/orders/[id]` | Chi tiết đơn hàng | Logged-in users |
| `/profile` | Hồ sơ | Logged-in users |
| `/favorites` | Yêu thích | Logged-in users |

### Admin Routes (Admin Only)

| Route | Description | Access |
|-------|-------------|--------|
| `/admin` | Admin dashboard | Admins only |
| `/admin/products` | Quản lý sản phẩm | Admins only |
| `/admin/products/new` | Tạo sản phẩm | Admins only |
| `/admin/products/[id]/edit` | Sửa sản phẩm | Admins only |
| `/admin/orders` | Quản lý đơn hàng | Admins only |
| `/admin/articles` | Quản lý bài viết | Admins only |
| `/admin/articles/new` | Tạo bài viết | Admins only |
| `/admin/articles/[id]/edit` | Sửa bài viết | Admins only |
| `/admin/coupons` | Quản lý coupon | Admins only |
| `/admin/chat` | Quản lý chat | Admins only |
| `/admin/api-settings` | Cấu hình API | Admins only |

### Error Pages

| Route | Description |
|-------|-------------|
| `/401` | Unauthorized |
| `/403` | Forbidden |
| `/404` | Not Found (auto) |
| `/error` | Error page |

---

## 🧩 Components

### Layout Components

- **Header** - Site navigation, search, cart icon
- **Footer** - Links, contact info
- **ConditionalLayout** - Layout wrapper with auth logic

### Product Components

- **ProductCard** - Product display card
- **ProductDetail** - Detailed product view
- **CategoryFilter** - Category/brand filtering
- **CategorySidebar** - Sidebar navigation
- **BestSellingList** - Top products

### Cart & Checkout

- **CartSummary** - Cart totals
- **AddressSelector** - Address management
- **AddressFormDialog** - Address create/edit
- **AddressListDialog** - Address list modal

### UI Components (Shadcn/ui based)

- **Button** - Button component
- **Input** - Input fields
- **Dialog** - Modal dialogs
- **Select** - Dropdown select
- **RadioGroup** - Radio buttons
- **Label** - Form labels
- And more...

### Feature Components

- **LoginModal** - Login form modal
- **RegisterModal** - Registration modal
- **ForgotModal** - Password reset modal
- **Search** - Search functionality
- **ChatbotIcon** - Chat widget
- **BannerCarousel** - Homepage carousel
- **EmptyState** - Empty state displays

---

## 🗃️ State Management

### Zustand Stores

**Auth Store** (contexts/AuthContext.tsx):
```typescript
- user: User | null
- login(email, password)
- logout()
- register(data)
```

**Cart Store** (contexts/CartContext.tsx):
```typescript
- items: CartItem[]
- addItem(product, variant)
- removeItem(id)
- updateQuantity(id, quantity)
- clearCart()
```

### React Query

Sử dụng cho server state:
- Product fetching
- Order fetching
- API mutations

---

## 🎨 Styling

### TailwindCSS

Utility-first CSS framework:

```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-900">Product Title</h2>
  <span className="text-green-600">$99.99</span>
</div>
```

### Shadcn/ui Components

Pre-built, customizable components:

```tsx
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'

<Button variant="primary" size="lg">
  Add to Cart
</Button>
```

### Custom CSS

Global styles in `app/globals.css`:
- CSS variables for theming
- Custom animations
- Typography styles

---

## 🔄 Data Flow

### API Integration

**Public API:**
```typescript
// Fetch products
const response = await fetch(`${API_BASE}/products`);
const products = await response.json();
```

**Authenticated API:**
```typescript
// With auth token
const response = await fetch(`${API_BASE}/cart`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Admin API:**
```typescript
// src/lib/adminApi.ts
export const adminApi = {
  generateArticleContent: async (keyword, customPrompt) => {
    const response = await fetch(`${API_BASE}/admin/articles/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ keyword, customPrompt })
    });
    return response.json();
  }
};
```

---

## 🚀 Deployment

### Build for Production

```bash
# Build application
npm run build

# Test production build locally
npm start
```

### Deployment Platforms

**Recommended:**

#### Vercel (Easiest)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Netlify
```bash
# Build command
npm run build

# Publish directory
.next
```

#### Other Platforms
- **AWS Amplify**
- **Cloudflare Pages**
- **Railway**
- **Render**

### Environment Variables Setup

Đảm bảo set tất cả env variables trên deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_BASE`
- `NEXT_PUBLIC_APP_URL`

### Build Optimization

- ✅ Image optimization với Next.js Image
- ✅ Code splitting tự động
- ✅ Server-side rendering
- ✅ Static generation cho static pages
- ✅ Font optimization

---

## 📱 Responsive Design

Ứng dụng được thiết kế mobile-first với breakpoints:

- **xs:** < 640px (mobile)
- **sm:** 640px (mobile landscape)
- **md:** 768px (tablet)
- **lg:** 1024px (desktop)
- **xl:** 1280px (large desktop)
- **2xl:** 1536px (extra large)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Responsive grid */}
</div>
```

---

## 🔍 SEO Optimization

### Next.js Metadata API

```typescript
// app/page.tsx
export const metadata = {
  title: 'ShopIn - Mua sắm trực tuyến',
  description: 'Nền tảng thương mại điện tử hàng đầu Việt Nam',
  keywords: 'mua sắm, điện thoại, laptop, thương mại điện tử'
};
```

### Dynamic Metadata

```typescript
// app/product/[id]/page.tsx
export async function generateMetadata({ params }) {
  const product = await fetchProduct(params.id);
  return {
    title: product.name,
    description: product.description
  };
}
```

---

## 🧪 Testing

### Manual Testing

```bash
# Start dev server
npm run dev

# Test routes manually in browser
```

### Future: Automated Testing

- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright/Cypress** - E2E testing

---

## 🔧 Configuration Files

### next.config.ts

```typescript
const nextConfig = {
  images: {
    domains: ['supabase.co', 'your-domain.com'],
  },
  // More config...
};
```

### tailwind.config.js

```javascript
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#...',
        secondary: '#...'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};
```

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

## 📝 License

This project is **UNLICENSED** - see package.json for details.

---

## 🙏 Acknowledgments

- **Next.js** - Amazing React framework
- **Vercel** - Hosting and deployment
- **Shadcn** - Beautiful UI components
- **TailwindCSS** - Utility-first CSS
- **Supabase** - Backend platform

---

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Contact development team

---

**Built with ❤️ using Next.js 16 and TypeScript**
