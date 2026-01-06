"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  User,
  Clock,
  Tag,
  Share2,
  ArrowLeft,
  Eye,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  getPublicArticle,
  getPublicArticles,
  Article,
  ContentBlock,
} from "@/lib/adminApi";

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      const [articleData, relatedData] = await Promise.all([
        getPublicArticle(slug),
        getPublicArticles({ limit: 4 }),
      ]);
      setArticle(articleData);
      // Filter out current article from related
      setRelatedArticles(
        relatedData.data.filter((a) => a.slug !== slug).slice(0, 3)
      );
    } catch (err: any) {
      setError("Không tìm thấy bài viết");
      console.error("Error loading article:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const renderContentBlock = (block: ContentBlock, index: number) => {
    if (block.type === "text") {
      switch (block.level) {
        case "h2":
          return (
            <h2 key={index} className="text-2xl font-bold text-gray-800 mt-8 mb-4">
              {block.content}
            </h2>
          );
        case "h3":
          return (
            <h3 key={index} className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              {block.content}
            </h3>
          );
        default:
          return (
            <p key={index} className="text-gray-700 leading-relaxed mb-4">
              {block.content}
            </p>
          );
      }
    }

    if (block.type === "image") {
      return (
        <figure key={index} className="my-6">
          <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
            <Image
              src={block.url || ""}
              alt={block.alt || ""}
              fill
              className="object-cover"
            />
          </div>
          {block.caption && (
            <figcaption className="text-center text-sm text-gray-500 mt-2 italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    return null;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Đã sao chép link bài viết!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">{error || "Không tìm thấy bài viết"}</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại Blog
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <article>
              {/* Header */}
              <div className="mb-6">
                {article.topic && (
                  <Badge variant="secondary" className="mb-3">
                    {article.topic}
                  </Badge>
                )}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {article.author && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{article.author.full_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(article.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{article.view_count.toLocaleString()} lượt xem</span>
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              {article.featured_image && (
                <div className="relative h-96 mb-8 rounded-xl overflow-hidden">
                  <Image
                    src={article.featured_image}
                    alt={article.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {/* Excerpt */}
              {article.excerpt && (
                <p className="text-lg text-gray-600 italic border-l-4 border-primary pl-4 mb-8">
                  {article.excerpt}
                </p>
              )}

              {/* Content Blocks */}
              <div className="prose prose-lg max-w-none">
                {article.content_blocks?.map((block, index) =>
                  renderContentBlock(block, index)
                )}
              </div>

              {/* Legacy content fallback */}
              {!article.content_blocks?.length && article.content && (
                <div
                  className="prose prose-lg max-w-none mb-8"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              )}

              <Separator className="my-8" />

              {/* Tags */}
              {article.seo_keywords && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold">Tags:</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {article.seo_keywords.split(",").map((tag) => (
                      <Badge
                        key={tag.trim()}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                      >
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Buttons */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Chia sẻ bài viết
                  </h3>
                  <Button variant="outline" onClick={handleShare}>
                    Chia sẻ
                  </Button>
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Author Card */}
              {article.author && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      {article.author.avatar_url ? (
                        <Image
                          src={article.author.avatar_url}
                          alt={article.author.full_name}
                          width={64}
                          height={64}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {article.author.full_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">
                          {article.author.full_name}
                        </h3>
                        <p className="text-sm text-gray-600">Tác giả</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Chuyên gia đánh giá công nghệ và sản phẩm tại ShopIn.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Related Posts */}
              {relatedArticles.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Bài viết liên quan
                    </h3>
                    <div className="space-y-4">
                      {relatedArticles.map((post) => (
                        <Link
                          key={post.id}
                          href={`/blog/${post.slug}`}
                          className="group block"
                        >
                          <div className="flex gap-3">
                            <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden">
                              {post.featured_image ? (
                                <Image
                                  src={post.featured_image}
                                  alt={post.title}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <span className="text-lg font-bold text-gray-300">
                                    {post.title.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              {post.topic && (
                                <Badge variant="secondary" className="text-xs mb-1">
                                  {post.topic}
                                </Badge>
                              )}
                              <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                                {post.title}
                              </h4>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
