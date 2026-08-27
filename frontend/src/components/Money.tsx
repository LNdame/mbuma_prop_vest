'use client';

import { useCurrency } from '@/lib/CurrencyContext';

/**
 * Renders a ZAR amount in the viewer's selected display currency. Non-base
 * currencies are prefixed with "≈" to signal the value is indicative.
 */
export default function Money({
  amount,
  approx = true,
  className,
}: {
  amount: number | string | null | undefined;
  approx?: boolean;
  className?: string;
}) {
  const { format, isBase } = useCurrency();
  return <span className={className}>{!isBase && approx ? '≈ ' : ''}{format(amount)}</span>;
}
