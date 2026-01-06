"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User, ArrowRight, Search, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getPublicArticles,
  Article,
  PaginationQuery,
} from "@/lib/adminApi";

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState<PaginationQuery>({
    page: 1,
    limit: 9,
    search: "",
  });

  useEffect(() => {
    loadArticles();
  }, [query.page]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await getPublicArticles(query);
      setArticles(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      console.error("Error loading articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery({ ...query, page: 1 });
    loadArticles();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1);
  const totalPages = Math.ceil(total / query.limit!);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Blog ShopIn
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Cập nhật tin tức công nghệ mới nhất, đánh giá sản phẩm chi tiết và
            hướng dẫn mua sắm thông minh
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={query.search}
              onChange={(e) => setQuery({ ...query, search: e.target.value })}
              className="w-full pl-12 pr-24 py-3 border rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
            >
              Tìm kiếm
            </button>
          </div>
        </form>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-gray-500">Đang tải bài viết...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Chưa có bài viết nào</p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredArticle && (
              <Card className="mb-12 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative h-64 md:h-full min-h-[300px]">
                    {featuredArticle.featured_image ? (
                      <Image
                        src={featuredArticle.featured_image}
                        alt={featuredArticle.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                        <span className="text-6xl font-bold text-primary/50">
                          {featuredArticle.title.charAt(0)}
                        </span>
                      </div>
                    )}
                    <Badge className="absolute top-4 left-4 bg-primary">
                      Nổi bật
                    </Badge>
                  </div>
                  <CardContent className="p-8 flex flex-col justify-center">
                    {featuredArticle.topic && (
                      <Badge variant="secondary" className="w-fit mb-3">
                        {featuredArticle.topic}
                      </Badge>
                    )}
                    <h2 className="text-3xl font-bold text-gray-800 mb-4 hover:text-primary transition-colors">
                      <Link href={`/blog/${featuredArticle.slug}`}>
                        {featuredArticle.title}
                      </Link>
                    </h2>
                    {featuredArticle.excerpt && (
                      <p className="text-gray-600 mb-6 line-clamp-3">
                        {featuredArticle.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                      {featuredArticle.author && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{featuredArticle.author.full_name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(featuredArticle.created_at)}</span>
                      </div>
                    </div>
                    <Link
                      href={`/blog/${featuredArticle.slug}`}
                      className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
                    >
                      Đọc tiếp <ArrowRight className="w-4 h-4" />
                    </Link>
                  </CardContent>
                </div>
              </Card>
            )}

            {/* Blog Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherArticles.map((article) => (
                <Card
                  key={article.id}
                  className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
                >
                  <div className="relative h-48 overflow-hidden">
                    {article.featured_image ? (
                      <Image
                        src={article.featured_image}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-4xl font-bold text-gray-300">
                          {article.title.charAt(0)}
                        </span>
                      </div>
                    )}
                    {article.topic && (
                      <Badge className="absolute top-4 left-4 bg-primary/90">
                        {article.topic}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 hover:text-primary transition-colors">
                      <Link href={`/blog/${article.slug}`}>{article.title}</Link>
                    </h3>
                    {article.excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                      {article.author && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{article.author.full_name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(article.created_at)}</span>
                      </div>
                    </div>
                    <Link
                      href={`/blog/${article.slug}`}
                      className="inline-flex items-center gap-2 text-primary text-sm font-semibold hover:gap-3 transition-all"
                    >
                      Đọc tiếp <ArrowRight className="w-4 h-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                <button
                  onClick={() => setQuery({ ...query, page: query.page! - 1 })}
                  disabled={query.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (query.page! <= 3) {
                    pageNum = i + 1;
                  } else if (query.page! >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = query.page! - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setQuery({ ...query, page: pageNum })}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        query.page === pageNum
                          ? "bg-primary text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setQuery({ ...query, page: query.page! + 1 })}
                  disabled={query.page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
