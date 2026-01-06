"use client";

import { useState, useRef, useCallback } from "react";
import {
  Type,
  Image as ImageIcon,
  Heading2,
  Heading3,
  AlignLeft,
  Trash2,
  GripVertical,
  Plus,
  Upload,
  X,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { uploadArticleImage, ContentBlock } from "@/lib/adminApi";

interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadBlockIndex, setUploadBlockIndex] = useState<number | null>(null);

  const addBlock = (type: "text" | "image", index?: number) => {
    const newBlock: ContentBlock =
      type === "text"
        ? { type: "text", content: "", level: "p" }
        : { type: "image", url: "", alt: "" };

    const newBlocks = [...blocks];
    if (index !== undefined) {
      newBlocks.splice(index + 1, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }
    onChange(newBlocks);
  };

  const updateBlock = (index: number, data: Partial<ContentBlock>) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...data } as ContentBlock;
    onChange(newBlocks);
  };

  const removeBlock = (index: number) => {
    if (blocks.length <= 1) return; // Keep at least one block
    const newBlocks = blocks.filter((_, i) => i !== index);
    onChange(newBlocks);
  };

  const moveBlock = (from: number, to: number) => {
    if (to < 0 || to >= blocks.length) return;
    const newBlocks = [...blocks];
    const [removed] = newBlocks.splice(from, 1);
    newBlocks.splice(to, 0, removed);
    onChange(newBlocks);
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    moveBlock(dragIndex, index);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const { url } = await uploadArticleImage(file);
      updateBlock(index, { url });
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Lỗi khi upload hình ảnh");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerImageUpload = (index: number) => {
    setUploadBlockIndex(index);
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (uploadBlockIndex !== null) {
            handleImageUpload(e, uploadBlockIndex);
          }
        }}
      />

      {/* Blocks */}
      <div className="space-y-3">
        {blocks.map((block, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`group relative bg-white border rounded-lg p-4 ${
              dragIndex === index ? "opacity-50" : ""
            }`}
          >
            {/* Drag Handle & Controls */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
              <button
                type="button"
                className="p-1 text-gray-400 hover:text-gray-600 cursor-grab"
                title="Kéo để di chuyển"
              >
                <GripVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Block Actions */}
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveBlock(index, index - 1)}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="Di chuyển lên"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveBlock(index, index + 1)}
                disabled={index === blocks.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="Di chuyển xuống"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => removeBlock(index)}
                className="p-1 text-gray-400 hover:text-red-500"
                title="Xóa block"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Block Content */}
            <div className="pl-8">
              {block.type === "text" ? (
                <div className="space-y-2">
                  {/* Text Level Selector */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateBlock(index, { level: "h2" })}
                      className={`p-1.5 rounded ${
                        block.level === "h2"
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title="Heading 2"
                    >
                      <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateBlock(index, { level: "h3" })}
                      className={`p-1.5 rounded ${
                        block.level === "h3"
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title="Heading 3"
                    >
                      <Heading3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateBlock(index, { level: "p" })}
                      className={`p-1.5 rounded ${
                        block.level === "p"
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title="Paragraph"
                    >
                      <AlignLeft className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Text Content */}
                  <textarea
                    value={block.content || ""}
                    onChange={(e) =>
                      updateBlock(index, { content: e.target.value })
                    }
                    placeholder={
                      block.level === "h2"
                        ? "Nhập tiêu đề H2..."
                        : block.level === "h3"
                        ? "Nhập tiêu đề H3..."
                        : "Nhập nội dung đoạn văn..."
                    }
                    className={`w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                      block.level === "h2"
                        ? "text-xl font-semibold"
                        : block.level === "h3"
                        ? "text-lg font-medium"
                        : "text-base"
                    }`}
                    rows={block.level === "p" ? 4 : 2}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  {block.url ? (
                    <div className="relative">
                      <img
                        src={block.url}
                        alt={block.alt || ""}
                        className="w-full max-h-[300px] object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => updateBlock(index, { url: "" })}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => triggerImageUpload(index)}
                      className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      {uploading && uploadBlockIndex === index ? (
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">
                            Click để tải ảnh lên
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  {/* Image Alt & Caption */}
                  {block.url && (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={block.alt || ""}
                        onChange={(e) =>
                          updateBlock(index, { alt: e.target.value })
                        }
                        placeholder="Alt text (mô tả ảnh)"
                        className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      <input
                        type="text"
                        value={block.caption || ""}
                        onChange={(e) =>
                          updateBlock(index, { caption: e.target.value })
                        }
                        placeholder="Caption (chú thích)"
                        className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Add Block After */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1 bg-white border rounded-full shadow-sm px-2 py-1">
                <button
                  type="button"
                  onClick={() => addBlock("text", index)}
                  className="p-1 text-gray-400 hover:text-primary"
                  title="Thêm văn bản"
                >
                  <Type className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("image", index)}
                  className="p-1 text-gray-400 hover:text-primary"
                  title="Thêm hình ảnh"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add First Block */}
      {blocks.length === 0 && (
        <div className="flex items-center justify-center gap-4 p-8 border-2 border-dashed rounded-lg">
          <button
            type="button"
            onClick={() => addBlock("text")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Type className="w-5 h-5" />
            <span>Thêm văn bản</span>
          </button>
          <button
            type="button"
            onClick={() => addBlock("image")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <ImageIcon className="w-5 h-5" />
            <span>Thêm hình ảnh</span>
          </button>
        </div>
      )}

      {/* Add Block Buttons */}
      {blocks.length > 0 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => addBlock("text")}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Văn bản</span>
          </button>
          <button
            type="button"
            onClick={() => addBlock("image")}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Hình ảnh</span>
          </button>
        </div>
      )}
    </div>
  );
}
