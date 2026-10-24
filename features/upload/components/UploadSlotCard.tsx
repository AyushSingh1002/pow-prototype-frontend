'use client';

import React, { useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { UploadSlotConfig, UploadedSlotData } from '../../../lib/productUploadConfig';

interface UploadSlotCardProps {
  slot: UploadSlotConfig;
  index: number;
  slotData: UploadedSlotData | undefined;
  isRequired: boolean;
  isUploading: boolean;
  isDragOver: boolean;
  error: string | null;
  onUpload: (slot: UploadSlotConfig, file: File) => void;
  onRemove: (slotId: string) => void;
  onDragOverChange: (slotId: string, isOver: boolean) => void;
}

export function UploadSlotCard({
  slot,
  index,
  slotData,
  isRequired,
  isUploading,
  isDragOver,
  error,
  onUpload,
  onRemove,
  onDragOverChange,
}: UploadSlotCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    onDragOverChange(slot.id, true);
  };

  const handleDragLeave = () => {
    onDragOverChange(slot.id, false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDragOverChange(slot.id, false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(slot, e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="py-6 border-b border-[#CBD0DA]">
      <div className="flex justify-between items-baseline mb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-[#0F1218]" style={{ fontFamily: 'var(--font-headline)' }}>
            {slot.title}
          </h3>
          <span
            className="text-[11px] font-semibold uppercase px-2 py-0.5 border"
            style={{
              borderColor: isRequired ? 'var(--key)' : 'var(--key-soft)',
              color: isRequired ? 'var(--key)' : 'var(--key-soft)',
              backgroundColor: isRequired ? 'var(--sheet)' : 'transparent',
            }}
          >
            {isRequired ? 'Required' : 'Optional'}
          </span>
        </div>
      </div>
      <p className="reading-text-soft text-xs mb-4">{slot.subtitle}</p>

      <input
        ref={inputRef}
        id={`artwork-${slot.id}`}
        type="file"
        accept={slot.acceptedExtensions ? slot.acceptedExtensions.join(',') : '.pdf,.tiff,.jpg,.jpeg,.png'}
        className="hidden"
        aria-label={`Select ${slot.title}`}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onUpload(slot, e.target.files[0]);
          }
        }}
      />

      {/* 5 Distinct Dropzone States: empty, dragging, uploading, uploaded, error */}
      {isUploading ? (
        /* State 3: Uploading with Registration Target */
        <div className="p-8 border-2 border-dashed border-[#0F1218] bg-[#FDFDFC] flex flex-col items-center justify-center gap-3 text-center">
          <span className="registration-target animating w-6 h-6" />
          <span className="text-sm font-semibold text-[#0F1218]">
            Preflight inspecting artwork...
          </span>
          <span className="text-xs text-[#5A6070]">
            Validating trim box, bleed allowances and DPI metrics
          </span>
        </div>
      ) : slotData?.file ? (
        /* State 4: Uploaded */
        <div className="p-5 border-2 border-[#0F1218] bg-white flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-sm font-bold text-[#0F1218] block truncate max-w-md">
              {slotData.file.name}
            </span>
            <div className="flex items-center gap-3 text-xs text-[#5A6070] font-mono">
              <span>{(slotData.file.size / (1024 * 1024)).toFixed(2)} MB</span>
              {slotData.metadata?.numPages !== undefined && (
                <span>{slotData.metadata.numPages} pages detected</span>
              )}
              <span className="text-[#5A6070] font-sans font-semibold" aria-live="polite">
                {slotData.uploadResponse && !slotData.uploadResponse.isDemo
                  ? 'Upload registered'
                  : 'Local preview only · not uploaded'}
              </span>
            </div>
            {slotData.metadata?.previewFailed && (
              <p className="text-xs font-semibold text-[#9A5A00]" role="status">
                Preview unavailable. The file may be damaged, encrypted, or password-protected.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="btn-proof-secondary text-xs py-1.5 px-3"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onRemove(slot.id)}
              className="p-2 border border-[#0F1218] hover:bg-[#FFF0F0] text-[#0F1218] cursor-pointer"
              aria-label="Remove artwork"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ) : (
        /* State 1: Empty / State 2: Dragging / State 5: Error */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`${slot.dropzoneLabel}. ${isRequired ? 'Required.' : 'Optional.'}`}
          className="p-8 border-2 border-dashed cursor-pointer transition-colors duration-150 text-center flex flex-col items-center justify-center gap-2"
          style={{
            borderColor: error ? 'var(--error)' : isDragOver ? 'var(--cyan)' : 'var(--key)',
            backgroundColor: isDragOver ? '#F0F9FD' : error ? '#FFF5F5' : '#FDFDFC',
          }}
        >
          <span className="text-sm font-bold text-[#0F1218]">
            {isDragOver ? 'Release to upload artwork' : 'Drop artwork PDF here or click to select'}
          </span>
          <span className="text-xs text-[#5A6070]">
            Accepts PDF/X-1a, TIFF or PNG up to 50MB. Minimum 300 DPI recommended with 3mm bleed.
          </span>
          {error && (
            <div className="mt-2 text-xs font-semibold text-[#C4161C] border border-[#C4161C] p-2 bg-white">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UploadSlotCard;
