'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import s from './page.module.css';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const MAX_MB = 10;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

type KycType = 'id_document' | 'selfie_with_id' | 'proof_of_address';

interface Section {
  key: KycType;
  title: string;
  desc: string;
  accept: string;
  allowPdf: boolean;
}

const SECTIONS: Section[] = [
  {
    key: 'id_document',
    title: 'ID Document',
    desc: 'A clear photo or PDF of your government-issued ID — ID book/card, passport, or driver’s licence.',
    accept: 'image/jpeg,image/png,image/webp,application/pdf',
    allowPdf: true,
  },
  {
    key: 'selfie_with_id',
    title: 'Selfie Holding Your ID',
    desc: 'A selfie of you holding your ID next to your face, with both clearly visible.',
    accept: 'image/jpeg,image/png,image/webp',
    allowPdf: false,
  },
  {
    key: 'proof_of_address',
    title: 'Proof of Residence',
    desc: 'A utility bill or bank statement from the last 3 months showing your name and home address.',
    accept: 'image/jpeg,image/png,image/webp,application/pdf',
    allowPdf: true,
  },
];

interface ExistingDoc { docType: KycType; fileName: string; createdAt: string; downloadUrl: string; }

function fmtSize(b: number) { return b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`; }

export default function InvestorKycPage() {
  const [kycStatus, setKycStatus] = useState<string>('pending');
  const [existing, setExisting]   = useState<Record<string, ExistingDoc>>({});
  const [files, setFiles]         = useState<Record<string, File | null>>({});
  const [previews, setPreviews]   = useState<Record<string, string | null>>({});
  const [fieldErr, setFieldErr]   = useState<Record<string, string>>({});
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  // Load current status + any documents already on file.
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { setLoading(false); setError('unauthenticated'); return; }
    let cancelled = false;
    fetch(`${API}/api/kyc`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        setKycStatus(j?.data?.kycStatus ?? 'pending');
        const map: Record<string, ExistingDoc> = {};
        for (const d of (j?.data?.documents ?? []) as ExistingDoc[]) {
          if (!map[d.docType]) map[d.docType] = d; // newest first (ordered desc)
        }
        setExisting(map);
      })
      .catch(() => { if (!cancelled) setError('Could not load your KYC status.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function pickFile(sec: Section, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const okType = IMAGE_TYPES.includes(file.type) || (sec.allowPdf && file.type === 'application/pdf');
    if (!okType) {
      setFieldErr((p) => ({ ...p, [sec.key]: sec.allowPdf ? 'Use a JPEG, PNG, WebP or PDF file.' : 'The selfie must be a JPEG, PNG or WebP image.' }));
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setFieldErr((p) => ({ ...p, [sec.key]: `File must be under ${MAX_MB} MB.` }));
      return;
    }
    setFieldErr((p) => ({ ...p, [sec.key]: '' }));
    setFiles((p) => ({ ...p, [sec.key]: file }));
    setPreviews((p) => {
      const old = p[sec.key];
      if (old) URL.revokeObjectURL(old);
      return { ...p, [sec.key]: file.type === 'application/pdf' ? null : URL.createObjectURL(file) };
    });
  }

  async function uploadOne(docType: KycType, file: File, token: string) {
    const presignRes = await fetch(`${API}/api/kyc/presign`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ docType, fileName: file.name, mimeType: file.type, sizeBytes: file.size }),
    });
    const presign = await presignRes.json();
    if (!presignRes.ok) throw new Error(presign.error ?? 'Could not start upload.');

    const form = new FormData();
    Object.entries(presign.fields as Record<string, string>).forEach(([k, v]) => form.append(k, v));
    form.append('file', file);
    const up = await fetch(presign.uploadUrl, { method: 'POST', body: form });
    if (!up.ok) throw new Error('Upload to storage failed.');

    return { docType, s3Key: presign.s3Key as string, fileName: file.name, mimeType: file.type };
  }

  const allSelected = SECTIONS.every((sec) => files[sec.key]);

  async function submit() {
    if (!allSelected) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { setError('Please log in to submit.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const documents = await Promise.all(SECTIONS.map((sec) => uploadOne(sec.key, files[sec.key]!, token)));
      const res = await fetch(`${API}/api/kyc/submit`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ documents }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Submission failed.');
      setKycStatus('under_review');
      setSuccess(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className={s.page}><div className={s.empty}>Loading…</div></div>;
  if (error === 'unauthenticated') return <div className={s.page}><div className={s.empty}>Please <a href="/login" className={s.link}>log in</a> to verify your identity.</div></div>;

  const banner =
    kycStatus === 'approved'     ? { cls: s.bannerOk,      icon: '✓', title: 'Identity verified', text: 'Your KYC documents have been approved. You’re fully verified.' }
    : kycStatus === 'under_review' ? { cls: s.bannerReview, icon: '⏳', title: 'Under review', text: 'Your documents have been submitted and are being reviewed. We’ll notify you once verified.' }
    : kycStatus === 'rejected'    ? { cls: s.bannerReject, icon: '!', title: 'Verification rejected', text: 'Something was wrong with your previous submission. Please re-upload the documents below.' }
    :                              { cls: s.bannerPending, icon: '!', title: 'Verification required', text: 'Upload the three documents below to verify your identity and unlock pledging.' };

  const verified = kycStatus === 'approved';

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Identity Verification (KYC)</h1>
          <p className={s.pageSub}>Upload your documents so we can verify your identity</p>
        </div>
      </div>

      <div className={`${s.banner} ${banner.cls}`}>
        <span className={s.bannerIcon}>{banner.icon}</span>
        <div>
          <div className={s.bannerTitle}>{banner.title}</div>
          <div className={s.bannerText}>{banner.text}</div>
        </div>
      </div>

      {success && (
        <div className={`${s.banner} ${s.bannerOk}`}>
          <span className={s.bannerIcon}>🎉</span>
          <div>
            <div className={s.bannerTitle}>Documents submitted</div>
            <div className={s.bannerText}>Thanks! Your documents are now under review.</div>
          </div>
        </div>
      )}

      {!verified && (
        <>
          {SECTIONS.map((sec, i) => {
            const file = files[sec.key];
            const preview = previews[sec.key];
            const ex = existing[sec.key];
            const err = fieldErr[sec.key];
            return (
              <div key={sec.key} className={s.card}>
                <div className={s.cardHead}>
                  <span className={s.stepNum}>{i + 1}</span>
                  <div>
                    <div className={s.cardTitle}>{sec.title}</div>
                    <div className={s.cardDesc}>{sec.desc}</div>
                  </div>
                  {file && <span className={s.readyPill}>Ready</span>}
                </div>

                {ex && !file && (
                  <div className={s.existing}>
                    Currently on file: <a href={ex.downloadUrl} target="_blank" rel="noreferrer" className={s.link}>{ex.fileName}</a>
                  </div>
                )}

                <label className={s.dropZone}>
                  <input type="file" accept={sec.accept} className={s.hiddenInput} onChange={(e) => pickFile(sec, e)} disabled={submitting} />
                  {file ? (
                    <div className={s.selected}>
                      {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt={file.name} className={s.thumb} />
                      ) : (
                        <span className={s.fileIcon}>📄</span>
                      )}
                      <div className={s.fileMeta}>
                        <div className={s.fileName}>{file.name}</div>
                        <div className={s.fileSize}>{fmtSize(file.size)} · click to replace</div>
                      </div>
                    </div>
                  ) : (
                    <div className={s.dropContent}>
                      <span className={s.dropIcon}>⬆️</span>
                      <div className={s.dropText}><strong>Click to upload</strong> or drag &amp; drop</div>
                      <div className={s.dropHint}>{sec.allowPdf ? 'JPEG, PNG, WebP or PDF' : 'JPEG, PNG or WebP'} · Max {MAX_MB} MB</div>
                    </div>
                  )}
                </label>

                {err && <div className={s.fieldError}>{err}</div>}
              </div>
            );
          })}

          {error && <div className={s.submitError}>{error}</div>}

          <div className={s.submitBar}>
            <span className={s.submitHint}>
              {allSelected ? 'All three documents ready.' : 'Add all three documents to submit.'}
            </span>
            <button
              type="button"
              className={`${s.btnSubmit} ${(!allSelected || submitting) ? s.btnDisabled : ''}`}
              disabled={!allSelected || submitting}
              onClick={submit}
            >
              {submitting ? 'Submitting…' : 'Submit for verification'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
