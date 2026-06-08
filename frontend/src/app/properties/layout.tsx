import type { ReactNode } from 'react';
import PublicHeader from '@/components/PublicHeader';
import s from './properties.module.css';

export default function PublicPropertiesLayout({ children }: { children: ReactNode }) {
  return (
    <div className={s.shell}>
      <PublicHeader />
      <main className={s.main}>{children}</main>
    </div>
  );
}
