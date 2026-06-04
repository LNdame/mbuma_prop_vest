'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import s from './form.module.css';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface FormState {
  title: string;
  propertyType: string;
  address: string;
  province: string;
  status: string;
  fundingCloseDate: string;
  // Financials
  purchasePrice: string;
  targetRaise: string;
  minimumPledge: string;
  grossMonthlyRent: string;
  operatingExpensesMonthly: string;
  projectedYieldPct: string;
  // Loan (optional)
  loanAmount: string;
  loanInterestRate: string;
  loanTermMonths: string;
}

const EMPTY: FormState = {
  title: '', propertyType: 'residential', address: '', province: 'Gauteng',
  status: 'draft', fundingCloseDate: '',
  purchasePrice: '', targetRaise: '', minimumPledge: '',
  grossMonthlyRent: '', operatingExpensesMonthly: '', projectedYieldPct: '',
  loanAmount: '', loanInterestRate: '', loanTermMonths: '',
};

const PROVINCES = ['Gauteng','Western Cape','KwaZulu-Natal','Eastern Cape','Limpopo','Mpumalanga','North West','Free State','Northern Cape'];

export default function NewPropertyPage() {
  const router = useRouter();
  const [form, setForm]     = useState<FormState>(EMPTY);
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // Auto-calculate net monthly rent
  const gross = parseFloat(form.grossMonthlyRent) || 0;
  const opex  = parseFloat(form.operatingExpensesMonthly) || 0;
  const netMonthlyRent = Math.max(0, gross - opex);

  async function handleSubmit(e: FormEvent, statusOverride?: string) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { setError('You must be logged in.'); setSaving(false); return; }

    const payload = {
      ...form,
      status: statusOverride ?? form.status,
      netMonthlyRent: netMonthlyRent.toString(),
      purchasePrice:            parseFloat(form.purchasePrice)            || 0,
      targetRaise:              parseFloat(form.targetRaise)              || 0,
      minimumPledge:            parseFloat(form.minimumPledge)            || 0,
      grossMonthlyRent:         gross,
      operatingExpensesMonthly: opex,
      projectedYieldPct:        parseFloat(form.projectedYieldPct)        || 0,
      loanAmount:               form.loanAmount       ? parseFloat(form.loanAmount)       : null,
      loanInterestRate:         form.loanInterestRate ? parseFloat(form.loanInterestRate) : null,
      loanTermMonths:           form.loanTermMonths   ? parseInt(form.loanTermMonths)     : null,
      fundingCloseDate:         form.fundingCloseDate || null,
    };

    try {
      const res = await fetch(`${API}/api/properties`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to save property'); return; }
      router.push('/admin/properties');
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const isValid = form.title && form.address && form.purchasePrice && form.targetRaise && form.minimumPledge && form.grossMonthlyRent;

  return (
    <div className={s.page}>

      {/* ── Page header ── */}
      <div className={s.pageHeader}>
        <div className={s.breadcrumb}>
          <a href="/admin/properties" className={s.breadcrumbLink}>Properties</a>
          <span className={s.breadcrumbSep}>›</span>
          <span>New Property</span>
        </div>
        <h1 className={s.pageTitle}>Add New Property</h1>
        <p className={s.pageSub}>Fill in the property details. Save as draft to continue later, or publish to make it live.</p>
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
                      {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
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
                    <label className={s.label} htmlFor="operatingExpensesMonthly">Operating Expenses <span className={s.req}>*</span></label>
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

            {/* Loan details (optional) */}
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

            {/* Summary card */}
            <div className={`${s.card} ${s.stickyCard}`}>
              <div className={s.cardHead}>
                <span className={s.cardTitle}>Summary</span>
              </div>
              <div className={s.summaryBody}>
                <div className={s.summaryRow}>
                  <span className={s.summaryLabel}>Title</span>
                  <span className={s.summaryVal}>{form.title || '—'}</span>
                </div>
                <div className={s.summaryRow}>
                  <span className={s.summaryLabel}>Type</span>
                  <span className={s.summaryVal} style={{ textTransform: 'capitalize' }}>{form.propertyType.replace('_', '-')}</span>
                </div>
                <div className={s.summaryRow}>
                  <span className={s.summaryLabel}>Province</span>
                  <span className={s.summaryVal}>{form.province}</span>
                </div>
                <div className={s.summaryRow}>
                  <span className={s.summaryLabel}>Target raise</span>
                  <span className={s.summaryVal}>{form.targetRaise ? `R${Number(form.targetRaise).toLocaleString('en-ZA')}` : '—'}</span>
                </div>
                <div className={s.summaryRow}>
                  <span className={s.summaryLabel}>Min. pledge</span>
                  <span className={s.summaryVal}>{form.minimumPledge ? `R${Number(form.minimumPledge).toLocaleString('en-ZA')}` : '—'}</span>
                </div>
                <div className={s.summaryRow}>
                  <span className={s.summaryLabel}>Proj. yield</span>
                  <span className={[s.summaryVal, s.summaryAccent].join(' ')}>{form.projectedYieldPct ? `${form.projectedYieldPct}%` : '—'}</span>
                </div>
                <div className={s.summaryRow}>
                  <span className={s.summaryLabel}>Net monthly rent</span>
                  <span className={[s.summaryVal, s.summaryAccent].join(' ')}>{netMonthlyRent > 0 ? `R${netMonthlyRent.toLocaleString('en-ZA')}` : '—'}</span>
                </div>
                <div className={s.summaryRow}>
                  <span className={s.summaryLabel}>Status</span>
                  <span className={s.summaryVal} style={{ textTransform: 'capitalize' }}>{form.status}</span>
                </div>
                {form.fundingCloseDate && (
                  <div className={s.summaryRow}>
                    <span className={s.summaryLabel}>Close date</span>
                    <span className={s.summaryVal}>{form.fundingCloseDate}</span>
                  </div>
                )}
              </div>

              {error && <div className={s.errorBanner}>{error}</div>}

              <div className={s.cardFooter}>
                <button
                  type="button"
                  className={s.btnDraft}
                  disabled={!isValid || saving}
                  onClick={(e) => handleSubmit(e as unknown as FormEvent, 'draft')}
                >
                  {saving ? 'Saving…' : 'Save as Draft'}
                </button>
                <button
                  type="button"
                  className={s.btnPublish}
                  disabled={!isValid || saving}
                  onClick={(e) => handleSubmit(e as unknown as FormEvent, 'open')}
                >
                  {saving ? 'Publishing…' : '🚀 Publish & Open'}
                </button>
              </div>
            </div>

            {/* Checklist */}
            <div className={s.card}>
              <div className={s.cardHead}>
                <span className={s.cardTitle}>Pre-publish Checklist</span>
              </div>
              <div className={s.checkList}>
                {[
                  { label: 'Title entered',           done: !!form.title },
                  { label: 'Address entered',         done: !!form.address },
                  { label: 'Purchase price set',      done: !!form.purchasePrice },
                  { label: 'Target raise set',        done: !!form.targetRaise },
                  { label: 'Minimum pledge set',      done: !!form.minimumPledge },
                  { label: 'Gross monthly rent set',  done: !!form.grossMonthlyRent },
                  { label: 'Projected yield set',     done: !!form.projectedYieldPct },
                  { label: 'Funding close date set',  done: !!form.fundingCloseDate },
                ].map((c) => (
                  <div key={c.label} className={s.checkItem}>
                    <span className={c.done ? s.checkDone : s.checkPending}>
                      {c.done ? '✓' : '○'}
                    </span>
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
