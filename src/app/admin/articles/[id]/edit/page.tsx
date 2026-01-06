"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  Sparkles,
  Image as ImageIcon,
  X,
  Loader2,
} from "lucide-react";
import BlockEditor from "@/components/admin/BlockEditor";
import {
  getAdminArticle,
  updateArticle,
  generateArticleContent,
  uploadArticleImage,
  ContentBlock,
} from "@/lib/adminApi";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);

  useEffect(() => {
    loadArticle();
  }, [articleId]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const article = await getAdminArticle(articleId);
      setTitle(article.title);
      setSlug(article.slug);
      setExcerpt(article.excerpt || "");
      setFeaturedImage(article.featured_image || "");
      setTopic(article.topic || "");
      setKeyword(article.keyword || "");
      setMetaTitle(article.meta_title || "");
      setMetaDescription(article.meta_description || "");
      setSeoKeywords(article.seo_keywords || "");
      setStatus(article.status);
      setContentBlocks(article.content_blocks || [{ type: "text", content: "", level: "p" }]);
    } catch (error) {
      console.error("Error loading article:", error);
      router.push("/admin/articles");
    } finally {
      setLoading(false);
    }
  };

  // AI Generate Content
  const handleGenerate = async () => {
    if (!keyword) {
      alert("Vui lòng nhập từ khóa để tạo nội dung");
      return;
    }

    try {
      setGenerating(true);
      const result = await generateArticleContent(keyword, topic);

      if (result.title) setTitle(result.title);
      if (result.excerpt) setExcerpt(result.excerpt);
      if (result.content_blocks) setContentBlocks(result.content_blocks);
      if (result.meta_title) setMetaTitle(result.meta_title);
      if (result.meta_description) setMetaDescription(result.meta_description);
      if (result.seo_keywords) setSeoKeywords(result.seo_keywords);
    } catch (error: any) {
      alert(error.message || "Lỗi khi tạo nội dung AI");
    } finally {
      setGenerating(false);
    }
  };

  // Upload featured image
  const handleFeaturedImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const { url } = await uploadArticleImage(file);
      setFeaturedImage(url);
    } catch (error) {
      alert("Lỗi khi tải ảnh lên");
    } finally {
      setUploadingImage(false);
    }
  };

  // Save article
  const handleSave = async (publishStatus?: "draft" | "published") => {
    if (!title) {
      alert("Vui lòng nhập tiêu đề bài viết");
      return;
    }

    try {
      setSaving(true);
      const finalStatus = publishStatus || status;

      await updateArticle(articleId, {
        title,
        slug,
        excerpt,
        featured_image: featuredImage,
        topic,
        keyword,
        meta_title: metaTitle,
        meta_description: metaDescription,
        seo_keywords: seoKeywords,
        status: finalStatus,
        content_blocks: contentBlocks,
      });

      router.push("/admin/articles");
    } catch (error: any) {
      alert(error.message || "Lỗi khi lưu bài viết");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chỉnh sửa bài viết
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              ID: {articleId.slice(0, 8)}...
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>Lưu nháp</span>
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
            <span>Xuất bản</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* AI Generator */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Tạo lại nội dung AI
                </h3>
                <p className="text-sm text-gray-500">
                  Nhập từ khóa để AI tạo nội dung mới
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Nhập từ khóa (VD: iPhone 15 Pro Max)"
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
              />
              <button
                onClick={handleGenerate}
                disabled={generating || !keyword}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
              >
                {generating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                <span>{generating ? "Đang tạo..." : "Tạo lại"}</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề bài viết *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề bài viết..."
              className="w-full px-4 py-3 text-xl border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Content Blocks */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Nội dung bài viết
            </label>
            <BlockEditor blocks={contentBlocks} onChange={setContentBlocks} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Featured Image */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Ảnh đại diện
            </label>
            {featuredImage ? (
              <div className="relative">
                <img
                  src={featuredImage}
                  alt="Featured"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => setFeaturedImage("")}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFeaturedImageUpload}
                />
                {uploadingImage ? (
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      Click để tải ảnh lên
                    </span>
                  </>
                )}
              </label>
            )}
          </div>

          {/* Meta Info */}
          <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Thông tin</h3>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Đường dẫn (slug)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ten-bai-viet"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Chủ đề
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="VD: Công nghệ, Đánh giá"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Mô tả ngắn
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Mô tả ngắn về bài viết..."
                rows={3}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "draft" | "published")
                }
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="draft">Bản nháp</option>
                <option value="published">Đã xuất bản</option>
              </select>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">SEO</h3>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Meta Title
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Tiêu đề SEO"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="text-xs text-gray-400 mt-1">
                {metaTitle.length}/60 ký tự
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Meta Description
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Mô tả SEO"
                rows={3}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                {metaDescription.length}/160 ký tự
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                SEO Keywords
              </label>
              <input
                type="text"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder="keyword1, keyword2, keyword3"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
