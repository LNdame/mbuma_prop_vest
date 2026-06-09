'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import s from '../../new/form.module.css';
import ImageUploader, { type UploadedImage } from '../../../../../components/ImageUploader';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface PropertyImageData {
  id: string;
  s3Key: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface PropertyFormData {
  id: string;
  title: string;
  propertyType: string;
  address: string;
  province: string;
  status: string;
  fundingCloseDate: string | null;
  purchasePrice: string;
  targetRaise: string;
  minimumPledge: string;
  grossMonthlyRent: string;
  operatingExpensesMonthly: string;
  netMonthlyRent: string;
  projectedYieldPct: string;
  loanAmount: string | null;
  loanInterestRate: string | null;
  loanTermMonths: number | null;
}

interface FormState {
  title: string;
  propertyType: string;
  address: string;
  province: string;
  status: string;
  fundingCloseDate: string;
  purchasePrice: string;
  targetRaise: string;
  minimumPledge: string;
  grossMonthlyRent: string;
  operatingExpensesMonthly: string;
  projectedYieldPct: string;
  loanAmount: string;
  loanInterestRate: string;
  loanTermMonths: string;
}

const PROVINCES = [
  'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape',
  'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'Northern Cape',
];

function toFormState(p: PropertyFormData): FormState {
  return {
    title:                    p.title,
    propertyType:             p.propertyType,
    address:                  p.address,
    province:                 p.province,
    status:                   p.status,
    fundingCloseDate:         p.fundingCloseDate
                                ? p.fundingCloseDate.split('T')[0]
                                : '',
    purchasePrice:            String(Number(p.purchasePrice)),
    targetRaise:              String(Number(p.targetRaise)),
    minimumPledge:            String(Number(p.minimumPledge)),
    grossMonthlyRent:         String(Number(p.grossMonthlyRent)),
    operatingExpensesMonthly: String(Number(p.operatingExpensesMonthly)),
    projectedYieldPct:        String(Number(p.projectedYieldPct)),
    loanAmount:               p.loanAmount    ? String(Number(p.loanAmount))    : '',
    loanInterestRate:         p.loanInterestRate ? String(Number(p.loanInterestRate)) : '',
    loanTermMonths:           p.loanTermMonths   ? String(p.loanTermMonths)           : '',
  };
}

function toUploadedImage(img: PropertyImageData): UploadedImage {
  return {
    id:        img.id,
    s3Key:     img.s3Key,
    url:       img.url,
    fileName:  img.fileName,
    mimeType:  img.mimeType,
    sizeBytes: img.sizeBytes,
    preview:   img.url,   // non-blob; used as React key + display fallback
    status:    'done',
  };
}

export default function EditPropertyForm({
  property,
  initialImages = [],
}: {
  property: PropertyFormData;
  initialImages?: PropertyImageData[];
}) {
  const router = useRouter();
  const [form, setForm]     = useState<FormState>(toFormState(property));
  const [images, setImages] = useState<UploadedImage[]>(initialImages.map(toUploadedImage));
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const gross          = parseFloat(form.grossMonthlyRent) || 0;
  const opex           = parseFloat(form.operatingExpensesMonthly) || 0;
  const netMonthlyRent = Math.max(0, gross - opex);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { setError('You must be logged in.'); setSaving(false); return; }

    const payload = {
      title:                    form.title,
      propertyType:             form.propertyType,
      address:                  form.address,
      province:                 form.province,
      status:                   form.status,
      fundingCloseDate:         form.fundingCloseDate || null,
      purchasePrice:            parseFloat(form.purchasePrice)            || 0,
      targetRaise:              parseFloat(form.targetRaise)              || 0,
      minimumPledge:            parseFloat(form.minimumPledge)            || 0,
      grossMonthlyRent:         gross,
      operatingExpensesMonthly: opex,
      netMonthlyRent:           netMonthlyRent,
      projectedYieldPct:        parseFloat(form.projectedYieldPct)        || 0,
      loanAmount:               form.loanAmount       ? parseFloat(form.loanAmount)       : null,
      loanInterestRate:         form.loanInterestRate ? parseFloat(form.loanInterestRate) : null,
      loanTermMonths:           form.loanTermMonths   ? parseInt(form.loanTermMonths)     : null,
    };

    try {
      const res = await fetch(`${API}/api/properties/${property.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to save changes'); return; }
      router.push(`/admin/properties/${property.id}`);
      router.refresh();
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const isValid = !!(form.title && form.address && form.purchasePrice && form.targetRaise && form.minimumPledge && form.grossMonthlyRent);

  return (
    <div className={s.page}>

      {/* Header */}
      <div className={s.pageHeader}>
        <div className={s.breadcrumb}>
          <a href="/admin/properties" className={s.breadcrumbLink}>Properties</a>
          <span className={s.breadcrumbSep}>›</span>
          <a href={`/admin/properties/${property.id}`} className={s.breadcrumbLink}>{property.title}</a>
          <span className={s.breadcrumbSep}>›</span>
          <span>Edit</span>
        </div>
        <h1 className={s.pageTitle}>Edit Property</h1>
        <p className={s.pageSub}>Update the property details. Changes are saved immediately.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className={s.formLayout}>

          {/* ── LEFT COLUMN ── */}
          <div className={s.leftCol}>

            {/* Basic details */}
            <div className={s.card}>
              <div className={s.cardHead}>
                <span className={s.cardTitle}>Basic Details</span>
              </div>
              <div className={s.cardBody}>

                <div className={s.fieldFull}>
                  <label className={s.label} htmlFor="title">Property Title <span className={s.req}>*</span></label>
                  <input id="title" name="title" className={s.input} value={form.title} onChange={handleChange} placeholder="e.g. 14 Fern Close, Fourways" required />
                </div>

                <div className={s.row2}>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="propertyType">Property Type <span className={s.req}>*</span></label>
                    <select id="propertyType" name="propertyType" className={s.select} value={form.propertyType} onChange={handleChange}>
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="mixed_use">Mixed-use</option>
                    </select>
                  </div>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="province">Province <span className={s.req}>*</span></label>
                    <select id="province" name="province" className={s.select} value={form.province} onChange={handleChange}>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div className={s.fieldFull}>
                  <label className={s.label} htmlFor="address">Full Address <span className={s.req}>*</span></label>
                  <input id="address" name="address" className={s.input} value={form.address} onChange={handleChange} placeholder="e.g. 14 Fern Close, Fourways, Sandton, 2068" required />
                </div>

                <div className={s.row2}>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="status">Status</label>
                    <select id="status" name="status" className={s.select} value={form.status} onChange={handleChange}>
                      <option value="draft">Draft</option>
                      <option value="open">Open</option>
                      <option value="funded">Funded</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="fundingCloseDate">Funding Close Date</label>
                    <input id="fundingCloseDate" name="fundingCloseDate" type="date" className={s.input} value={form.fundingCloseDate} onChange={handleChange} />
                  </div>
                </div>

              </div>
            </div>

            {/* Financials */}
            <div className={s.card}>
              <div className={s.cardHead}>
                <span className={s.cardTitle}>Property Financials</span>
                <span className={s.cardHint}>All amounts in South African Rand (ZAR)</span>
              </div>
              <div className={s.cardBody}>

                <div className={s.row2}>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="purchasePrice">Purchase Price <span className={s.req}>*</span></label>
                    <div className={s.inputPrefix}>
                      <span className={s.prefix}>R</span>
                      <input id="purchasePrice" name="purchasePrice" type="number" min="0" step="1000" className={s.inputWithPrefix} value={form.purchasePrice} onChange={handleChange} placeholder="0" required />
                    </div>
                  </div>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="targetRaise">Target Raise <span className={s.req}>*</span></label>
                    <div className={s.inputPrefix}>
                      <span className={s.prefix}>R</span>
                      <input id="targetRaise" name="targetRaise" type="number" min="0" step="1000" className={s.inputWithPrefix} value={form.targetRaise} onChange={handleChange} placeholder="0" required />
                    </div>
                  </div>
                </div>

                <div className={s.row2}>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="minimumPledge">Minimum Pledge <span className={s.req}>*</span></label>
                    <div className={s.inputPrefix}>
                      <span className={s.prefix}>R</span>
                      <input id="minimumPledge" name="minimumPledge" type="number" min="0" step="500" className={s.inputWithPrefix} value={form.minimumPledge} onChange={handleChange} placeholder="0" required />
                    </div>
                  </div>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="projectedYieldPct">Projected Yield (%) <span className={s.req}>*</span></label>
                    <div className={s.inputSuffix}>
                      <input id="projectedYieldPct" name="projectedYieldPct" type="number" min="0" max="100" step="0.1" className={s.inputWithSuffix} value={form.projectedYieldPct} onChange={handleChange} placeholder="0.0" required />
                      <span className={s.suffix}>%</span>
                    </div>
                  </div>
                </div>

                <div className={s.divider} />

                <div className={s.row3}>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="grossMonthlyRent">Gross Monthly Rent <span className={s.req}>*</span></label>
                    <div className={s.inputPrefix}>
                      <span className={s.prefix}>R</span>
                      <input id="grossMonthlyRent" name="grossMonthlyRent" type="number" min="0" step="100" className={s.inputWithPrefix} value={form.grossMonthlyRent} onChange={handleChange} placeholder="0" required />
                    </div>
                  </div>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="operatingExpensesMonthly">Operating Expenses</label>
                    <div className={s.inputPrefix}>
                      <span className={s.prefix}>R</span>
                      <input id="operatingExpensesMonthly" name="operatingExpensesMonthly" type="number" min="0" step="100" className={s.inputWithPrefix} value={form.operatingExpensesMonthly} onChange={handleChange} placeholder="0" />
                    </div>
                  </div>
                  <div className={s.field}>
                    <label className={s.label}>Net Monthly Rent</label>
                    <div className={s.calcField}>
                      <span className={s.calcPrefix}>R</span>
                      <span className={s.calcValue}>{netMonthlyRent.toLocaleString('en-ZA')}</span>
                      <span className={s.calcBadge}>Auto-calculated</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Property Images */}
            <div className={s.card}>
              <div className={s.cardHead}>
                <span className={s.cardTitle}>Property Images</span>
                <span className={s.cardHint}>First image becomes the cover · max 10 MB each</span>
              </div>
              <div className={s.cardBody}>
                <ImageUploader
                  propertyId={property.id}
                  images={images}
                  onChange={setImages}
                />
              </div>
            </div>

            {/* Loan details */}
            <div className={s.card}>
              <div className={s.cardHead}>
                <span className={s.cardTitle}>Loan Details</span>
                <span className={s.cardHint}>Optional — leave blank if no financing</span>
              </div>
              <div className={s.cardBody}>
                <div className={s.row3}>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="loanAmount">Loan Amount</label>
                    <div className={s.inputPrefix}>
                      <span className={s.prefix}>R</span>
                      <input id="loanAmount" name="loanAmount" type="number" min="0" step="1000" className={s.inputWithPrefix} value={form.loanAmount} onChange={handleChange} placeholder="0" />
                    </div>
                  </div>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="loanInterestRate">Interest Rate</label>
                    <div className={s.inputSuffix}>
                      <input id="loanInterestRate" name="loanInterestRate" type="number" min="0" max="100" step="0.25" className={s.inputWithSuffix} value={form.loanInterestRate} onChange={handleChange} placeholder="0.0" />
                      <span className={s.suffix}>%</span>
                    </div>
                  </div>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="loanTermMonths">Term (months)</label>
                    <input id="loanTermMonths" name="loanTermMonths" type="number" min="0" max="360" step="12" className={s.input} value={form.loanTermMonths} onChange={handleChange} placeholder="e.g. 240" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className={s.rightCol}>

            {/* Summary */}
            <div className={`${s.card} ${s.stickyCard}`}>
              <div className={s.cardHead}>
                <span className={s.cardTitle}>Summary</span>
              </div>
              <div className={s.summaryBody}>
                {[
                  { label: 'Title',           value: form.title || '—' },
                  { label: 'Type',            value: form.propertyType.replace('_', '-') },
                  { label: 'Province',        value: form.province },
                  { label: 'Target raise',    value: form.targetRaise ? `R${Number(form.targetRaise).toLocaleString('en-ZA')}` : '—' },
                  { label: 'Min. pledge',     value: form.minimumPledge ? `R${Number(form.minimumPledge).toLocaleString('en-ZA')}` : '—' },
                  { label: 'Proj. yield',     value: form.projectedYieldPct ? `${form.projectedYieldPct}%` : '—', accent: true },
                  { label: 'Net monthly rent',value: netMonthlyRent > 0 ? `R${netMonthlyRent.toLocaleString('en-ZA')}` : '—', accent: true },
                  { label: 'Status',          value: form.status },
                ].map(row => (
                  <div key={row.label} className={s.summaryRow}>
                    <span className={s.summaryLabel}>{row.label}</span>
                    <span className={[s.summaryVal, row.accent ? s.summaryAccent : ''].filter(Boolean).join(' ')}
                          style={{ textTransform: 'capitalize' }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {error && <div className={s.errorBanner}>{error}</div>}

              <div className={s.cardFooter}>
                <button
                  type="button"
                  className={s.btnDraft}
                  onClick={() => router.push(`/admin/properties/${property.id}`)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={s.btnPublish}
                  disabled={!isValid || saving}
                >
                  {saving ? 'Saving…' : '✓ Save changes'}
                </button>
              </div>
            </div>

            {/* Checklist */}
            <div className={s.card}>
              <div className={s.cardHead}>
                <span className={s.cardTitle}>Required fields</span>
              </div>
              <div className={s.checkList}>
                {[
                  { label: 'Title entered',          done: !!form.title },
                  { label: 'Address entered',        done: !!form.address },
                  { label: 'Purchase price set',     done: !!form.purchasePrice },
                  { label: 'Target raise set',       done: !!form.targetRaise },
                  { label: 'Minimum pledge set',     done: !!form.minimumPledge },
                  { label: 'Gross monthly rent set', done: !!form.grossMonthlyRent },
                  { label: 'Projected yield set',    done: !!form.projectedYieldPct },
                  { label: 'Funding close date set', done: !!form.fundingCloseDate },
                ].map(c => (
                  <div key={c.label} className={s.checkItem}>
                    <span className={c.done ? s.checkDone : s.checkPending}>{c.done ? '✓' : '○'}</span>
                    <span className={c.done ? s.checkLabelDone : s.checkLabel}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
