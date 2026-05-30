import { ReactNode } from 'react';

export function generateStaticParams() {
  return [{ id: 'reas-1' }, { id: 'reas-2' }, { id: 'reas-3' }];
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
