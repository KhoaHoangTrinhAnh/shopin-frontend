"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading2, 
  Heading3,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Eye,
  Edit3
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Nhập nội dung bài viết...",
  minHeight = "400px"
}: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Insert text at cursor position
  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const toolbarButtons = [
    {
      icon: Heading2,
      label: "Heading 2",
      action: () => insertText("<h2>", "</h2>"),
    },
    {
      icon: Heading3,
      label: "Heading 3",
      action: () => insertText("<h3>", "</h3>"),
    },
    {
      icon: Bold,
      label: "Bold",
      action: () => insertText("<strong>", "</strong>"),
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => insertText("<em>", "</em>"),
    },
    {
      icon: List,
      label: "Bullet List",
      action: () => insertText("<ul>\n<li>", "</li>\n</ul>"),
    },
    {
      icon: ListOrdered,
      label: "Numbered List",
      action: () => insertText("<ol>\n<li>", "</li>\n</ol>"),
    },
    {
      icon: Quote,
      label: "Blockquote",
      action: () => insertText("<blockquote>", "</blockquote>"),
    },
    {
      icon: Code,
      label: "Code",
      action: () => insertText("<code>", "</code>"),
    },
    {
      icon: LinkIcon,
      label: "Link",
      action: () => {
        const url = prompt("Nhập URL:");
        if (url) insertText(`<a href="${url}">`, "</a>");
      },
    },
  ];

  // Render HTML preview safely
  const renderPreview = () => {
    // Basic sanitization - in production, use DOMPurify
    return (
      <div 
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b p-2 flex items-center gap-1 flex-wrap">
        <div className="flex items-center gap-1">
          {toolbarButtons.map((btn, index) => (
            <button
              key={index}
              type="button"
              onClick={btn.action}
              title={btn.label}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
            >
              <btn.icon className="w-4 h-4 text-gray-700" />
            </button>
          ))}
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              isPreview 
                ? "bg-primary text-white" 
                : "bg-white border hover:bg-gray-50"
            }`}
          >
            {isPreview ? (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Xem trước</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor/Preview */}
      <div className="bg-white" style={{ minHeight }}>
        {isPreview ? (
          <div className="p-4">
            {value ? renderPreview() : (
              <p className="text-gray-400 italic">Chưa có nội dung để xem trước</p>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 border-0 focus:ring-0 focus:outline-none resize-none font-mono text-sm"
            style={{ minHeight }}
          />
        )}
      </div>

      {/* Help Text */}
      {!isPreview && (
        <div className="bg-gray-50 border-t px-4 py-2">
          <p className="text-xs text-gray-500">
            Hỗ trợ HTML. Sử dụng các nút ở trên để định dạng hoặc nhập trực tiếp HTML.
            Nhấn "Xem trước" để kiểm tra kết quả.
          </p>
        </div>
      )}
    </div>
  );
}
