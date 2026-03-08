'use client';

import { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { cn } from '@/utils/helpers';
import Image from 'next/image';

interface FileUploadProps {
  label?: string;
  hint?: string;
  accept?: string;
  value?: string; // existing image URL
  onChange?: (file: File | null) => void;
  className?: string;
  aspectRatio?: 'square' | 'wide' | 'banner';
}

export function FileUpload({
  label,
  hint,
  accept = 'image/*',
  value,
  onChange,
  className,
  aspectRatio = 'square',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const aspectClasses = {
    square: 'aspect-square',
    wide: 'aspect-video',
    banner: 'aspect-[3/1]',
  };

  function handleFile(file: File) {
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange?.(file);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  }

  function handleRemove() {
    setPreview(null);
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <div
        className={cn(
          'relative w-full rounded-xl overflow-hidden border-2 border-dashed transition-all cursor-pointer',
          isDragging ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300',
          preview ? 'border-solid border-gray-200' : '',
          aspectClasses[aspectRatio]
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt="Upload preview"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  className="bg-white text-gray-900 rounded-lg px-3 py-1.5 text-xs font-medium shadow"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="bg-red-500 text-white rounded-lg px-3 py-1.5 text-xs font-medium shadow"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Upload size={18} className="text-gray-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">
                Drop image here or{' '}
                <span className="text-gray-900 underline underline-offset-2">
                  browse
                </span>
              </p>
              {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

interface MultiImageUploadProps {
  label?: string;
  images: string[];
  onAdd: (file: File) => void;
  onRemove: (index: number) => void;
  maxImages?: number;
}

export function MultiImageUpload({
  label,
  images,
  onAdd,
  onRemove,
  maxImages = 6,
}: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <div className="grid grid-cols-3 gap-3">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group"
          >
            <Image src={img} alt={`Product ${idx + 1}`} fill className="object-cover" />
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
            {idx === 0 && (
              <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-xs rounded-md px-1.5 py-0.5">
                Cover
              </span>
            )}
          </div>
        ))}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400 transition-colors flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-gray-600"
          >
            <ImageIcon size={20} />
            <span className="text-xs font-medium">Add</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onAdd(file);
            e.target.value = '';
          }
        }}
      />
    </div>
  );
}
