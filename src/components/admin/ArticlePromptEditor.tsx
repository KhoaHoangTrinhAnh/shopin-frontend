"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  GripVertical,
  RotateCcw,
} from "lucide-react";
import {
  PromptTemplateJsonb,
  DEFAULT_PROMPT_TEMPLATE,
} from "@/types/prompt-template";

interface ArticlePromptEditorProps {
  value: PromptTemplateJsonb;
  defaultTemplate?: PromptTemplateJsonb;
  onChange: (template: PromptTemplateJsonb) => void;
  onReset: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export default function ArticlePromptEditor({
  value,
  defaultTemplate = DEFAULT_PROMPT_TEMPLATE,
  onChange,
  onReset,
  isExpanded = false,
  onToggleExpand,
}: ArticlePromptEditorProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const updateField = <K extends keyof PromptTemplateJsonb>(
    section: K,
    field: string,
    fieldValue: unknown
  ) => {
    onChange({
      ...value,
      [section]: {
        ...value[section],
        [field]: fieldValue,
      },
    });
  };

  const updateStructureItem = (index: number, newValue: string) => {
    const structure = [...(value.description?.structure || [])];
    structure[index] = newValue;
    updateField("description", "structure", structure);
  };

  const addStructureItem = () => {
    const structure = [...(value.description?.structure || []), ""];
    updateField("description", "structure", structure);
  };

  const removeStructureItem = (index: number) => {
    const structure = [...(value.description?.structure || [])];
    structure.splice(index, 1);
    updateField("description", "structure", structure);
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const SectionHeader = ({
    id,
    title,
    subtitle,
  }: {
    id: string;
    title: string;
    subtitle: string;
  }) => (
    <button
      type="button"
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="text-left">
        <span className="font-medium text-gray-900">{title}</span>
        <span className="ml-2 text-xs text-gray-500">{subtitle}</span>
      </div>
      {activeSection === id ? (
        <ChevronUp className="w-4 h-4 text-gray-500" />
      ) : (
        <ChevronDown className="w-4 h-4 text-gray-500" />
      )}
    </button>
  );

  const InputField = ({
    label,
    value: fieldValue,
    onChange: onFieldChange,
    placeholder,
    type = "text",
  }: {
    label: string;
    value: string | number | undefined;
    onChange: (val: string) => void;
    placeholder?: string;
    type?: "text" | "number";
  }) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <input
        type={type}
        value={fieldValue ?? ""}
        onChange={(e) => onFieldChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
      />
    </div>
  );

  const CheckboxField = ({
    label,
    checked,
    onChange: onFieldChange,
  }: {
    label: string;
    checked: boolean | undefined;
    onChange: (val: boolean) => void;
  }) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked ?? false}
        onChange={(e) => onFieldChange(e.target.checked)}
        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );

  return (
    <div className="mt-3 border-t pt-3">
      <button
        type="button"
        onClick={onToggleExpand}
        className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        <span>Tùy chỉnh Prompt AI</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {/* TITLE Section */}
          <div className="border rounded-lg overflow-hidden">
            <SectionHeader
              id="title"
              title="TITLE"
              subtitle="Cấu hình tiêu đề bài viết"
            />
            {activeSection === "title" && (
              <div className="p-4 space-y-3 bg-white">
                <InputField
                  label="Hướng dẫn"
                  value={value.title?.instruction}
                  onChange={(v) => updateField("title", "instruction", v)}
                  placeholder="Tiêu đề bài viết hấp dẫn và SEO-friendly"
                />
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="Độ dài tối đa (ký tự)"
                    value={value.title?.max_length}
                    onChange={(v) =>
                      updateField("title", "max_length", parseInt(v) || undefined)
                    }
                    type="number"
                    placeholder="200"
                  />
                  <InputField
                    label="Định dạng"
                    value={value.title?.format}
                    onChange={(v) => updateField("title", "format", v)}
                    placeholder="Không dùng ký tự đặc biệt"
                  />
                </div>
              </div>
            )}
          </div>

          {/* DESCRIPTION Section */}
          <div className="border rounded-lg overflow-hidden">
            <SectionHeader
              id="description"
              title="DESCRIPTION"
              subtitle="Cấu hình nội dung bài viết"
            />
            {activeSection === "description" && (
              <div className="p-4 space-y-3 bg-white">
                <InputField
                  label="Hướng dẫn"
                  value={value.description?.instruction}
                  onChange={(v) => updateField("description", "instruction", v)}
                  placeholder="Nội dung bài viết chi tiết"
                />
                <InputField
                  label="Số từ tối thiểu"
                  value={value.description?.min_words}
                  onChange={(v) =>
                    updateField("description", "min_words", parseInt(v) || undefined)
                  }
                  type="number"
                  placeholder="500"
                />
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600">
                    Cấu trúc bài viết
                  </label>
                  {value.description?.structure?.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <GripVertical className="w-4 h-4 text-gray-400 mt-2.5 cursor-move" />
                      <textarea
                        value={item}
                        onChange={(e) => updateStructureItem(index, e.target.value)}
                        rows={2}
                        className="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-400 resize-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeStructureItem(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addStructureItem}
                    className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm dòng</span>
                  </button>
                </div>
                <CheckboxField
                  label="Không dùng Markdown"
                  checked={value.description?.no_markdown}
                  onChange={(v) => updateField("description", "no_markdown", v)}
                />
              </div>
            )}
          </div>

          {/* TAGS Section */}
          <div className="border rounded-lg overflow-hidden">
            <SectionHeader
              id="tags"
              title="TAGS"
              subtitle="Cấu hình từ khóa/tags"
            />
            {activeSection === "tags" && (
              <div className="p-4 space-y-3 bg-white">
                <InputField
                  label="Hướng dẫn"
                  value={value.tags?.instruction}
                  onChange={(v) => updateField("tags", "instruction", v)}
                  placeholder="Từ khóa liên quan"
                />
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="Số lượng"
                    value={value.tags?.quantity}
                    onChange={(v) => updateField("tags", "quantity", v)}
                    placeholder="5-8"
                  />
                  <InputField
                    label="Ký tự phân cách"
                    value={value.tags?.separator}
                    onChange={(v) => updateField("tags", "separator", v)}
                    placeholder=","
                  />
                </div>
                <CheckboxField
                  label="Không dùng dấu ngoặc"
                  checked={value.tags?.no_quotes}
                  onChange={(v) => updateField("tags", "no_quotes", v)}
                />
              </div>
            )}
          </div>

          {/* SEO_KEYWORD Section */}
          <div className="border rounded-lg overflow-hidden">
            <SectionHeader
              id="seo_keyword"
              title="SEO_KEYWORD"
              subtitle="Cấu hình URL slug"
            />
            {activeSection === "seo_keyword" && (
              <div className="p-4 space-y-3 bg-white">
                <InputField
                  label="Hướng dẫn"
                  value={value.seo_keyword?.instruction}
                  onChange={(v) => updateField("seo_keyword", "instruction", v)}
                  placeholder="URL slug thân thiện SEO"
                />
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="Định dạng"
                    value={value.seo_keyword?.format}
                    onChange={(v) => updateField("seo_keyword", "format", v)}
                    placeholder="lowercase, a-z, 0-9, hyphens only"
                  />
                  <InputField
                    label="Độ dài tối đa"
                    value={value.seo_keyword?.max_length}
                    onChange={(v) =>
                      updateField("seo_keyword", "max_length", parseInt(v) || undefined)
                    }
                    type="number"
                    placeholder="100"
                  />
                </div>
                <InputField
                  label="Ví dụ"
                  value={value.seo_keyword?.example}
                  onChange={(v) => updateField("seo_keyword", "example", v)}
                  placeholder="tin-tuc-cong-nghe-moi-nhat"
                />
                <CheckboxField
                  label="Không dùng dấu tiếng Việt"
                  checked={value.seo_keyword?.no_diacritics}
                  onChange={(v) => updateField("seo_keyword", "no_diacritics", v)}
                />
              </div>
            )}
          </div>

          {/* META_TITLE Section */}
          <div className="border rounded-lg overflow-hidden">
            <SectionHeader
              id="meta_title"
              title="META_TITLE"
              subtitle="Cấu hình tiêu đề SEO"
            />
            {activeSection === "meta_title" && (
              <div className="p-4 space-y-3 bg-white">
                <InputField
                  label="Hướng dẫn"
                  value={value.meta_title?.instruction}
                  onChange={(v) => updateField("meta_title", "instruction", v)}
                  placeholder="Tiêu đề SEO tối ưu"
                />
                <InputField
                  label="Độ dài"
                  value={value.meta_title?.length}
                  onChange={(v) => updateField("meta_title", "length", v)}
                  placeholder="50-60 ký tự"
                />
                <div className="space-y-2">
                  <CheckboxField
                    label="Không trùng 100% với TITLE"
                    checked={value.meta_title?.no_duplicate_with_title}
                    onChange={(v) =>
                      updateField("meta_title", "no_duplicate_with_title", v)
                    }
                  />
                  <CheckboxField
                    label="Tự nhiên"
                    checked={value.meta_title?.natural}
                    onChange={(v) => updateField("meta_title", "natural", v)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* META_DESCRIPTION Section */}
          <div className="border rounded-lg overflow-hidden">
            <SectionHeader
              id="meta_description"
              title="META_DESCRIPTION"
              subtitle="Cấu hình mô tả SEO"
            />
            {activeSection === "meta_description" && (
              <div className="p-4 space-y-3 bg-white">
                <InputField
                  label="Hướng dẫn"
                  value={value.meta_description?.instruction}
                  onChange={(v) => updateField("meta_description", "instruction", v)}
                  placeholder="Mô tả SEO hấp dẫn"
                />
                <InputField
                  label="Độ dài"
                  value={value.meta_description?.length}
                  onChange={(v) => updateField("meta_description", "length", v)}
                  placeholder="120-150 ký tự"
                />
                <CheckboxField
                  label="Tự nhiên"
                  checked={value.meta_description?.natural}
                  onChange={(v) => updateField("meta_description", "natural", v)}
                />
              </div>
            )}
          </div>

          {/* META_KEYWORDS Section */}
          <div className="border rounded-lg overflow-hidden">
            <SectionHeader
              id="meta_keywords"
              title="META_KEYWORDS"
              subtitle="Cấu hình từ khóa SEO"
            />
            {activeSection === "meta_keywords" && (
              <div className="p-4 space-y-3 bg-white">
                <InputField
                  label="Hướng dẫn"
                  value={value.meta_keywords?.instruction}
                  onChange={(v) => updateField("meta_keywords", "instruction", v)}
                  placeholder="Từ khóa SEO"
                />
                <InputField
                  label="Ký tự phân cách"
                  value={value.meta_keywords?.separator}
                  onChange={(v) => updateField("meta_keywords", "separator", v)}
                  placeholder=","
                />
                <div className="space-y-2">
                  <CheckboxField
                    label="Đúng chính tả"
                    checked={value.meta_keywords?.correct_spelling}
                    onChange={(v) =>
                      updateField("meta_keywords", "correct_spelling", v)
                    }
                  />
                  <CheckboxField
                    label="Đầy đủ chữ"
                    checked={value.meta_keywords?.complete_words}
                    onChange={(v) =>
                      updateField("meta_keywords", "complete_words", v)
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Reset Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Khôi phục mặc định</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
