import { type ReactNode } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import StatusBadge from './status-badge';
import { useHealth } from '@/hooks/chat';
export default function RootDocument({ children }: Readonly<{ children: ReactNode }>) {

  const { data: health } = useHealth()

  return (

    <SidebarProvider className="w-auto">
      <AppSidebar />
      <SidebarInset>
        <main className="flex h-screen bg-background">
          {/* Main Content */}
          <div className="flex-1 flex">
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <header className="p-4 border-b">
                <div className="flex justify-between">
                  <div className="flex items-center gap-x-2">
                    <SidebarTrigger />
                    <span className="font-semibold">Chat</span>
                  </div>
                  <div>
                    <StatusBadge status="gpt-4o-mini" />
                    <StatusBadge status={health.status} />
                  </div>
                </div>
              </header>
              {children}
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
