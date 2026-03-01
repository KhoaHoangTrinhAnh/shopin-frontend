// PromptTemplateJsonb types for AI Article Generation
// Matches backend convertPromptJsonbToText() structure

export interface PromptTitleConfig {
  instruction: string;
  max_length?: number;
  format?: string;
}

export interface PromptDescriptionConfig {
  instruction: string;
  min_words?: number;
  structure?: string[];
  no_markdown?: boolean;
}

export interface PromptTagsConfig {
  instruction: string;
  quantity?: string;
  separator?: string;
  no_quotes?: boolean;
}

export interface PromptSeoKeywordConfig {
  instruction: string;
  format?: string;
  max_length?: number;
  no_diacritics?: boolean;
  example?: string;
}

export interface PromptMetaTitleConfig {
  instruction: string;
  length?: string;
  no_duplicate_with_title?: boolean;
  natural?: boolean;
}

export interface PromptMetaDescriptionConfig {
  instruction: string;
  length?: string;
  natural?: boolean;
}

export interface PromptMetaKeywordsConfig {
  instruction: string;
  separator?: string;
  correct_spelling?: boolean;
  complete_words?: boolean;
}

export interface PromptTemplateJsonb {
  title?: PromptTitleConfig;
  description?: PromptDescriptionConfig;
  tags?: PromptTagsConfig;
  seo_keyword?: PromptSeoKeywordConfig;
  meta_title?: PromptMetaTitleConfig;
  meta_description?: PromptMetaDescriptionConfig;
  meta_keywords?: PromptMetaKeywordsConfig;
}

// Default prompt template matching backend defaultAIPromptJsonb
export const DEFAULT_PROMPT_TEMPLATE: PromptTemplateJsonb = {
  title: {
    instruction: 'Tiêu đề bài viết hấp dẫn và SEO-friendly',
    max_length: 200,
    format: 'Không dùng ký tự đặc biệt'
  },
  description: {
    instruction: 'Nội dung bài viết chi tiết',
    min_words: 500,
    structure: [
      'Chia thành 3-7 phần với tiêu đề rõ ràng',
      'Mỗi phần có 1 tiêu đề phụ (dùng thẻ <h3>) và 1-3 đoạn văn (dùng thẻ <p>)',
      'Ví dụ format: <h3>Giới thiệu về [chủ đề]</h3><p>Nội dung giới thiệu...</p>',
      'KHÔNG dùng markdown **, ### hoặc ký tự đặc biệt',
      'Nội dung phải logic, dễ đọc, mạch lạc, tự nhiên, đúng chính tả, có giá trị thông tin thực tế, không trùng lặp'
    ],
    no_markdown: true
  },
  tags: {
    instruction: 'Từ khóa liên quan',
    quantity: '5-8',
    separator: ',',
    no_quotes: true
  },
  seo_keyword: {
    instruction: 'URL slug thân thiện SEO',
    format: 'lowercase, a-z, 0-9, hyphens only',
    max_length: 100,
    no_diacritics: true,
    example: 'tin-tuc-cong-nghe-moi-nhat'
  },
  meta_title: {
    instruction: 'Tiêu đề SEO tối ưu',
    length: '50-60 ký tự',
    no_duplicate_with_title: true,
    natural: true
  },
  meta_description: {
    instruction: 'Mô tả SEO hấp dẫn',
    length: '120-150 ký tự',
    natural: true
  },
  meta_keywords: {
    instruction: 'Từ khóa SEO',
    separator: ',',
    correct_spelling: true,
    complete_words: true
  }
};

// Helper to check if object is a valid PromptTemplateJsonb
export function isPromptTemplateJsonb(obj: unknown): obj is PromptTemplateJsonb {
  if (!obj || typeof obj !== 'object') return false;
  const template = obj as Record<string, unknown>;
  // Check at least one of the expected keys exists
  return (
    'title' in template ||
    'description' in template ||
    'tags' in template ||
    'seo_keyword' in template ||
    'meta_title' in template ||
    'meta_description' in template ||
    'meta_keywords' in template
  );
}

// Helper to merge partial template with defaults
export function mergeWithDefaults(partial: Partial<PromptTemplateJsonb>): PromptTemplateJsonb {
  return {
    title: { ...DEFAULT_PROMPT_TEMPLATE.title, ...partial.title } as PromptTitleConfig,
    description: {
      ...DEFAULT_PROMPT_TEMPLATE.description,
      ...partial.description,
      structure: partial.description?.structure || DEFAULT_PROMPT_TEMPLATE.description?.structure,
    } as PromptDescriptionConfig,
    tags: { ...DEFAULT_PROMPT_TEMPLATE.tags, ...partial.tags } as PromptTagsConfig,
    seo_keyword: { ...DEFAULT_PROMPT_TEMPLATE.seo_keyword, ...partial.seo_keyword } as PromptSeoKeywordConfig,
    meta_title: { ...DEFAULT_PROMPT_TEMPLATE.meta_title, ...partial.meta_title } as PromptMetaTitleConfig,
    meta_description: { ...DEFAULT_PROMPT_TEMPLATE.meta_description, ...partial.meta_description } as PromptMetaDescriptionConfig,
    meta_keywords: { ...DEFAULT_PROMPT_TEMPLATE.meta_keywords, ...partial.meta_keywords } as PromptMetaKeywordsConfig,
  };
}
