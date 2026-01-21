"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  Sparkles,
  Image as ImageIcon,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  createArticle,
  generateArticleContent,
  uploadArticleImage,
  getAllAPISettings,
} from "@/lib/adminApi";
import ArticlePromptEditor from "@/components/admin/ArticlePromptEditor";
import RichTextEditor from "@/components/admin/RichTextEditor";
import {
  PromptTemplateJsonb,
  DEFAULT_PROMPT_TEMPLATE,
  isPromptTemplateJsonb,
  mergeWithDefaults,
} from "@/types/prompt-template";

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingContentImage, setUploadingContentImage] = useState(false);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [promptTemplate, setPromptTemplate] = useState<PromptTemplateJsonb>(DEFAULT_PROMPT_TEMPLATE);
  const [defaultPromptTemplate, setDefaultPromptTemplate] = useState<PromptTemplateJsonb>(DEFAULT_PROMPT_TEMPLATE);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [tags, setTags] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  
  // Simplified content structure: one content block + one image block
  const [mainContent, setMainContent] = useState("");
  const [contentImage, setContentImage] = useState("");
  const [contentImageAlt, setContentImageAlt] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load default prompt on mount
  useEffect(() => {
    const loadDefaultPrompt = async () => {
      try {
        const apiSettings = await getAllAPISettings();
        const articleSettings = apiSettings.find((s) => s.name === "article");
        if (articleSettings && articleSettings.default_prompt) {
          // Handle JSONB prompt template
          if (isPromptTemplateJsonb(articleSettings.default_prompt)) {
            const merged = mergeWithDefaults(articleSettings.default_prompt);
            setDefaultPromptTemplate(merged);
            setPromptTemplate(merged);
          } else if (typeof articleSettings.default_prompt === 'object') {
            // Object but missing some fields - merge with defaults
            const merged = mergeWithDefaults(articleSettings.default_prompt as Partial<PromptTemplateJsonb>);
            setDefaultPromptTemplate(merged);
            setPromptTemplate(merged);
          }
          // If it's a string (legacy), keep using DEFAULT_PROMPT_TEMPLATE
        }
      } catch (error) {
        console.error("Failed to load default prompt:", error);
      }
    };
    loadDefaultPrompt();
  }, []);

  // Generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug) {
      setSlug(generateSlug(value));
    }
    if (!metaTitle) {
      setMetaTitle(value);
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
      // Send JSONB prompt template directly to backend
      const result = await generateArticleContent(keyword, topic, promptTemplate);

      if (result.title) setTitle(result.title);
      if (result.tags && Array.isArray(result.tags)) setTags(result.tags.join(', '));
      // Convert content blocks to single content string
      if (result.content_blocks && result.content_blocks.length > 0) {
        const textContent = result.content_blocks
          .filter((block: any) => block.type === 'text')
          .map((block: any) => block.content)
          .join('\n\n');
        setMainContent(textContent);
      }
      if (result.meta_title) setMetaTitle(result.meta_title);
      if (result.meta_description) setMetaDescription(result.meta_description);
      if (result.seo_keywords) setSeoKeywords(result.seo_keywords);
      if (result.title && !slug) setSlug(generateSlug(result.title));
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

  // Upload content image
  const handleContentImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingContentImage(true);
      const { url } = await uploadArticleImage(file);
      setContentImage(url);
    } catch (error) {
      alert("Lỗi khi tải ảnh lên");
    } finally {
      setUploadingContentImage(false);
    }
  };

  // Validation
  const validateForm = (publishStatus: "draft" | "published"): boolean => {
    const newErrors: Record<string, string> = {};

    // Required for all
    if (!title.trim()) {
      newErrors.title = "Tiêu đề là bắt buộc";
    }

    // Additional validation for published articles
    if (publishStatus === "published") {
      if (!slug.trim()) {
        newErrors.slug = "Đường dẫn (slug) là bắt buộc khi xuất bản";
      }
      if (!mainContent.trim()) {
        newErrors.content = "Nội dung bài viết là bắt buộc khi xuất bản";
      }
      if (!tags.trim()) {
        newErrors.tags = "Tags là bắt buộc khi xuất bản";
      }
      if (!featuredImage) {
        newErrors.featuredImage = "Ảnh đại diện là bắt buộc khi xuất bản";
      }
      if (!metaTitle.trim()) {
        newErrors.metaTitle = "Meta Title là bắt buộc khi xuất bản";
      }
      if (!metaDescription.trim()) {
        newErrors.metaDescription = "Meta Description là bắt buộc khi xuất bản";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save article
  const handleSave = async (publishStatus: "draft" | "published") => {
    // Validate form
    if (!validateForm(publishStatus)) {
      alert(publishStatus === "published" 
        ? "Vui lòng điền đầy đủ các thông tin bắt buộc trước khi xuất bản" 
        : "Vui lòng nhập tiêu đề bài viết");
      return;
    }

    try {
      setLoading(true);

      // Convert simplified format to content_blocks for storage
      const contentBlocks = [];
      if (mainContent) {
        contentBlocks.push({ type: "text" as const, content: mainContent, level: "p" as const });
      }
      if (contentImage) {
        contentBlocks.push({ type: "image" as const, url: contentImage, alt: contentImageAlt });
      }

      await createArticle({
        title,
        slug,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        featured_image: featuredImage,
        topic,
        keyword,
        meta_title: metaTitle,
        meta_description: metaDescription,
        seo_keywords: seoKeywords,
        status: publishStatus,
        content_blocks: contentBlocks,
      });

      router.push("/admin/articles");
    } catch (error: any) {
      alert(error.message || "Lỗi khi lưu bài viết");
    } finally {
      setLoading(false);
    }
  };

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
              Tạo bài viết mới
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Sử dụng trình soạn thảo block để tạo nội dung
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave("draft")}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>Lưu nháp</span>
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
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
                  Tạo nội dung AI
                </h3>
                <p className="text-sm text-gray-500">
                  Nhập từ khóa để AI tạo nội dung tự động
                </p>
              </div>
            </div>
            <div className="flex gap-3 mb-3">
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
                <span>{generating ? "Đang tạo..." : "Tạo nội dung"}</span>
              </button>
            </div>

            {/* Prompt Editor Toggle */}
            <ArticlePromptEditor
              value={promptTemplate}
              defaultTemplate={defaultPromptTemplate}
              onChange={setPromptTemplate}
              onReset={() => setPromptTemplate(defaultPromptTemplate)}
              isExpanded={showPromptEditor}
              onToggleExpand={() => setShowPromptEditor(!showPromptEditor)}
            />
          </div>

          {/* Title */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Tiêu đề bài viết *
              </label>
              {errors.title && (
                <span className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {errors.title}
                </span>
              )}
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Nhập tiêu đề bài viết..."
              className={`w-full px-4 py-3 text-xl border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                errors.title ? "border-red-300" : ""
              }`}
            />
          </div>

          {/* Main Content - Rich Text Editor */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Nội dung bài viết *
              </label>
              {errors.content && (
                <span className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {errors.content}
                </span>
              )}
            </div>
            <RichTextEditor
              value={mainContent}
              onChange={setMainContent}
              placeholder="Nhập nội dung bài viết..."
              minHeight="500px"
            />
          </div>

          {/* Content Image - Single image block */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Hình ảnh trong bài viết
            </label>
            {contentImage ? (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={contentImage}
                    alt={contentImageAlt || "Content image"}
                    className="w-full max-h-80 object-contain rounded-lg border"
                  />
                  <button
                    onClick={() => {
                      setContentImage("");
                      setContentImageAlt("");
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Mô tả hình ảnh (alt text)
                  </label>
                  <input
                    type="text"
                    value={contentImageAlt}
                    onChange={(e) => setContentImageAlt(e.target.value)}
                    placeholder="Mô tả hình ảnh cho SEO..."
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleContentImageUpload}
                />
                {uploadingContentImage ? (
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 text-gray-400 mb-3" />
                    <span className="text-sm text-gray-600 font-medium">
                      Click để tải ảnh lên
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      PNG, JPG, GIF (tối đa 5MB)
                    </span>
                  </>
                )}
              </label>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Featured Image */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Ảnh đại diện *
              </label>
              {errors.featuredImage && (
                <span className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  Bắt buộc
                </span>
              )}
            </div>
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
              <label className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors ${
                errors.featuredImage ? "border-red-300" : ""
              }`}>
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm text-gray-600">
                  Đường dẫn (slug) *
                </label>
                {errors.slug && (
                  <span className="text-xs text-red-600">Bắt buộc</span>
                )}
              </div>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ten-bai-viet"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                  errors.slug ? "border-red-300" : ""
                }`}
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm text-gray-600">
                  Tags *
                </label>
                {errors.tags && (
                  <span className="text-xs text-red-600">Bắt buộc</span>
                )}
              </div>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="công nghệ, điện thoại, smartphone..."
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none ${
                  errors.tags ? "border-red-300" : ""
                }`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Các từ khóa cách nhau bằng dấu phẩy (,)
              </p>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">SEO</h3>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm text-gray-600">
                  Meta Title *
                </label>
                {errors.metaTitle && (
                  <span className="text-xs text-red-600">Bắt buộc</span>
                )}
              </div>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Tiêu đề SEO"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                  errors.metaTitle ? "border-red-300" : ""
                }`}
              />
              <p className={`text-xs mt-1 ${metaTitle.length > 60 ? "text-red-500" : "text-gray-400"}`}>
                {metaTitle.length}/60 ký tự
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm text-gray-600">
                  Meta Description *
                </label>
                {errors.metaDescription && (
                  <span className="text-xs text-red-600">Bắt buộc</span>
                )}
              </div>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Mô tả SEO"
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none ${
                  errors.metaDescription ? "border-red-300" : ""
                }`}
              />
              <p className={`text-xs mt-1 ${metaDescription.length > 160 ? "text-red-500" : "text-gray-400"}`}>
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
