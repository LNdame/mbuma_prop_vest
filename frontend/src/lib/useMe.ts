'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface MeProperty {
  id: string;
  title: string;
  propertyType: 'residential' | 'commercial' | 'mixed_use';
  address: string;
  province: string;
  status: 'draft' | 'open' | 'funded' | 'closed';
  projectedYieldPct: string;
  targetRaise: string;
  fundedAmount: string;
}
export interface MePledge {
  id: string;
  amount: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  confirmedAt: string | null;
  createdAt: string;
  property: MeProperty;
}
export interface MeDistributionLine {
  id: string;
  pledgeId: string;
  grossAmount: string;
  withholdingTax: string;
  netAmount: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | string;
  paidAt: string | null;
  createdAt: string;
  distribution: { periodLabel: string; processedAt: string | null; property: { title: string } };
}
export interface MeDocument {
  id: string;
  docType: 'id_document' | 'proof_of_address' | 'investment_agreement' | 'title_deed' | 'other' | 'selfie_with_id';
  fileName: string;
  mimeType: string;
  signingStatus: 'pending' | 'sent' | 'signed' | 'declined';
  signedAt: string | null;
  createdAt: string;
  downloadUrl: string;
  property: { title: string } | null;
}
export interface MeProfile {
  idNumber: string | null;
  idType: string | null;
  taxNumber: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankBranchCode: string | null;
  addressLine1: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
}
export interface Me {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'under_review';
  kycVerifiedAt: string | null;
  isActive: boolean;
  createdAt: string;
  investorProfile: MeProfile | null;
  pledges: MePledge[];
  distributionLines: MeDistributionLine[];
  documents: MeDocument[];
  availableFunds: number;
  fundsBreakdown: FundsBreakdown;
  fundAllocations: MeFundAllocation[];
}

export interface FundsBreakdown {
  deposits: number;      // direct bank deposits credited
  distributions: number; // net rental income allocated from distributions
  reserved: number;      // amount reserved by active (pending/confirmed) pledges
}

export interface MeFundAllocation {
  id: string;
  amount: string;
  reference: string | null;
  note: string | null;
  createdAt: string;
}

interface State {
  me: Me | null;
  loading: boolean;
  /** 'unauthenticated' when no token, otherwise an error message. */
  error: string | null;
}

export function useMe(): State {
  const [state, setState] = useState<State>({ me: null, loading: true, error: null });

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setState({ me: null, loading: false, error: 'unauthenticated' });
      return;
    }
    let cancelled = false;
    fetch(`${API}/api/investors/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.error ?? `Failed to load (${r.status})`);
        }
        return r.json();
      })
      .then((j) => { if (!cancelled) setState({ me: j.data, loading: false, error: null }); })
      .catch((e) => { if (!cancelled) setState({ me: null, loading: false, error: (e as Error).message }); });
    return () => { cancelled = true; };
  }, []);

  return state;
}
