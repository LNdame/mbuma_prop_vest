'use client';

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import s from './ImageUploader.module.css';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const MAX_MB = 10;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export interface UploadedImage {
  id?: string;       // set after DB save
  s3Key: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  preview: string;   // local object URL before upload completes
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

interface Props {
  propertyId: string | null;  // null = new property (images queued until save)
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}

export default function ImageUploader({ propertyId, images, onChange }: Props) {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: File[]) => {
    const token = localStorage.getItem('token');

    for (const file of files) {
      if (!ALLOWED.includes(file.type)) {
        alert(`${file.name}: only JPEG, PNG, WebP and AVIF are allowed.`);
        continue;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        alert(`${file.name}: must be under ${MAX_MB} MB.`);
        continue;
      }

      // Add a placeholder entry immediately so the user sees progress
      const preview = URL.createObjectURL(file);
      const placeholder: UploadedImage = {
        s3Key: '', url: '', fileName: file.name, mimeType: file.type,
        sizeBytes: file.size, preview, status: 'uploading',
      };

      onChange([...images, placeholder]);

      try {
        if (!propertyId) {
          // Property not yet saved — mark done locally, will be committed on form submit
          const done: UploadedImage = { ...placeholder, status: 'done', url: preview, s3Key: `local:${file.name}` };
          onChange((prev: UploadedImage[]) => prev.map((img) => img.preview === preview ? done : img));
          continue;
        }

        // 1 — request presigned POST from backend
        const presignRes = await fetch(`${API}/api/properties/${propertyId}/images/presign`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body:    JSON.stringify({ fileName: file.name, mimeType: file.type, sizeBytes: file.size }),
        });
        const presign = await presignRes.json();
        if (!presignRes.ok) throw new Error(presign.error ?? 'Presign failed');

        // 2 — upload directly to bucket using presigned POST
        const form = new FormData();
        Object.entries(presign.fields as Record<string, string>).forEach(([k, v]) => form.append(k, v));
        form.append('file', file);
        const uploadRes = await fetch(presign.uploadUrl, { method: 'POST', body: form });
        if (!uploadRes.ok) throw new Error('Upload to bucket failed');

        // 3 — register the image in the database
        const saveRes = await fetch(`${API}/api/properties/${propertyId}/images`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body:    JSON.stringify({
            s3Key:     presign.s3Key,
            fileName:  file.name,
            mimeType:  file.type,
            sizeBytes: file.size,
            position:  images.length,
          }),
        });
        const saved = await saveRes.json();
        if (!saveRes.ok) throw new Error(saved.error ?? 'DB save failed');

        onChange((prev: UploadedImage[]) =>
          prev.map((img) =>
            img.preview === preview
              ? { ...img, id: saved.data.id, s3Key: presign.s3Key, url: presign.publicImageUrl, status: 'done' }
              : img
          )
        );
      } catch (err) {
        onChange((prev: UploadedImage[]) =>
          prev.map((img) =>
            img.preview === preview
              ? { ...img, status: 'error', error: (err as Error).message }
              : img
          )
        );
      }
    }
  }, [propertyId, images, onChange]);

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  }

  async function removeImage(img: UploadedImage) {
    const token = localStorage.getItem('token');
    if (img.id && propertyId) {
      await fetch(`${API}/api/properties/${propertyId}/images/${img.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    if (img.preview.startsWith('blob:')) URL.revokeObjectURL(img.preview);
    onChange(images.filter((i) => i !== img));
  }

  async function moveImage(idx: number, dir: -1 | 1) {
    const next = [...images];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    onChange(next);
    // Persist order for saved images
    const token = localStorage.getItem('token');
    if (propertyId) {
      const ids = next.filter((i) => i.id).map((i) => i.id!);
      if (ids.length) {
        fetch(`${API}/api/properties/${propertyId}/images/reorder`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body:    JSON.stringify({ order: ids }),
        });
      }
    }
  }

  return (
    <div className={s.root}>
      {/* Drop zone */}
      <div
        className={[s.dropZone, dragging ? s.dragging : ''].filter(Boolean).join(' ')}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className={s.hiddenInput}
          onChange={onFileChange}
        />
        <div className={s.dropContent}>
          <span className={s.dropIcon}>{dragging ? '📂' : '🖼️'}</span>
          <div className={s.dropText}>
            {dragging
              ? 'Drop images here'
              : <><strong>Click to upload</strong> or drag & drop</>
            }
          </div>
          <div className={s.dropHint}>JPEG, PNG, WebP, AVIF · Max {MAX_MB} MB per image</div>
        </div>
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className={s.grid}>
          {images.map((img, idx) => (
            <div key={img.preview} className={[s.tile, img.status === 'error' ? s.tileError : ''].join(' ')}>
              {/* Preview image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.status === 'done' ? (img.url || img.preview) : img.preview} alt={img.fileName} className={s.tileImg} />

              {/* Cover badge for first image */}
              {idx === 0 && img.status === 'done' && (
                <span className={s.coverBadge}>Cover</span>
              )}

              {/* Upload overlay */}
              {img.status === 'uploading' && (
                <div className={s.overlay}>
                  <span className={s.spinner} />
                </div>
              )}

              {/* Error overlay */}
              {img.status === 'error' && (
                <div className={s.overlayError}>
                  <span>⚠️</span>
                  <span className={s.errorMsg}>{img.error}</span>
                </div>
              )}

              {/* Controls */}
              {img.status !== 'uploading' && (
                <div className={s.controls}>
                  <button type="button" className={s.ctrlBtn} onClick={() => moveImage(idx, -1)} disabled={idx === 0} title="Move left">←</button>
                  <button type="button" className={s.ctrlBtn} onClick={() => moveImage(idx, 1)}  disabled={idx === images.length - 1} title="Move right">→</button>
                  <button type="button" className={`${s.ctrlBtn} ${s.ctrlDel}`} onClick={() => removeImage(img)} title="Remove">✕</button>
                </div>
              )}

              <div className={s.tileName}>{img.fileName}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
