import { type ReactNode } from 'react'
import { SidebarInset, SidebarProvider } from "./ui/sidebar"
import { AppSidebar } from "./app-sidebar"

export default function RootDocument({ children }: Readonly<{ children: ReactNode }>) {

  return (
    <SidebarProvider className="w-auto">
      <AppSidebar />
      <SidebarInset>
        <main className="flex h-screen bg-background">
          {/* Main Content */}
          <div className="flex-1 flex">
            <div className="flex-1 flex flex-col">
              {children}
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
