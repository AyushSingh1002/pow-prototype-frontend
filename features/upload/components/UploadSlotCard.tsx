'use client';

import React, { useRef } from 'react';
import { FileUp, Trash2, UploadCloud } from 'lucide-react';
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

  return (
    <div
      className={index > 0 ? 'cover-upload-section' : undefined}
      style={index > 0 ? { marginTop: 28 } : undefined}
    >
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h3 style={{ fontSize: 18, margin: 0, color: 'var(--ink)' }}>{slot.title}</h3>
          <span
            style={{
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              padding: '2px 6px',
              borderRadius: 3,
              backgroundColor: isRequired ? 'rgba(180, 83, 9, 0.12)' : 'var(--surface-hover)',
              color: isRequired ? 'var(--amber)' : 'var(--muted)',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            {isRequired ? 'Required' : 'Optional'}
          </span>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: '4px 0 0' }}>{slot.subtitle}</p>
      </div>

      <input
        type="file"
        ref={inputRef}
        style={{ display: 'none' }}
        accept={slot.acceptedExtensions.join(',')}
        onClick={(e) => {
          (e.target as HTMLInputElement).value = '';
        }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onUpload(slot, e.target.files[0]);
          }
        }}
      />

      {!slotData ? (
        <div
          className={slot.role === 'cover' ? 'cover-dropzone' : 'dropzone'}
          style={{
            borderColor: isDragOver ? 'var(--navy)' : undefined,
            backgroundColor: isDragOver ? 'var(--surface-hover)' : undefined,
          }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            onDragOverChange(slot.id, true);
          }}
          onDragLeave={() => {
            onDragOverChange(slot.id, false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            onDragOverChange(slot.id, false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              onUpload(slot, e.dataTransfer.files[0]);
            }
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          {slot.role === 'cover' || slot.role === 'secondary' ? (
            <FileUp size={32} style={{ color: 'var(--muted)', marginBottom: 10 }} />
          ) : (
            <UploadCloud size={36} />
          )}
          <h4 style={{ fontSize: 15, margin: '0 0 6px', fontWeight: 600 }}>
            {slot.dropzoneLabel}
          </h4>
          <p style={{ color: 'var(--muted)', fontSize: 12, margin: '0 0 14px' }}>
            {slot.formatHelpText}
          </p>
          <button
            className="btn btn-outline"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
          >
            {isUploading ? 'Registering with backend...' : slot.buttonLabel}
          </button>
          {!isRequired && (
            <p
              style={{
                fontSize: 11,
                color: 'var(--muted)',
                marginTop: 12,
                marginBottom: 0,
                fontStyle: 'italic',
              }}
            >
              This slot is optional. If not uploaded, standard default layout will be used.
            </p>
          )}
        </div>
      ) : (
        <div className="uploaded-file">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 4,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--surface-alt)',
              border: '1px solid var(--line)',
              flexShrink: 0,
            }}
          >
            {slotData.previewUrl ? (
              <img
                src={slotData.previewUrl}
                alt={`${slot.title} thumbnail`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span
                style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: 'var(--ink)',
                }}
              >
                {slotData.file.name.split('.').pop()?.toUpperCase() || 'FILE'}
              </span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b
              style={{
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {slotData.file.name}
            </b>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)' }}>
              {(slotData.file.size / (1024 * 1024)).toFixed(2)} MB ·{' '}
              {slotData.uploadResponse ? (
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                  ✓ Registered with Backend
                </span>
              ) : (
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>✓ Ready for proof</span>
              )}
            </p>
            {slotData.uploadResponse && (
              <small
                style={{
                  font: 'var(--font-mono)',
                  color: 'var(--muted)',
                  fontSize: 10,
                  display: 'block',
                  marginTop: 2,
                }}
              >
                Server File ID: {slotData.uploadResponse.fileId}
              </small>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ padding: '6px 12px', fontSize: 11 }}
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              style={{
                color: 'var(--rust)',
                padding: '6px 10px',
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              onClick={() => {
                onRemove(slot.id);
                if (inputRef.current) inputRef.current.value = '';
              }}
              aria-label={`Remove ${slot.title}`}
            >
              <Trash2 size={14} />
              <span>Remove</span>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            backgroundColor: 'var(--warning-bg)',
            border: '1px solid var(--warning-border)',
            color: 'var(--rust)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            marginTop: 10,
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
