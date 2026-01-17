import type { ReactNode } from 'react'
import { Header } from './Header'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 bg-subtle-pattern">
      <Header />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
