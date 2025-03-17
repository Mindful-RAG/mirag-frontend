import { useEffect, useState, type ReactNode } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import StatusBadge from './status-badge';
export default function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const [apiStatus, setApiStatus] = useState<"ready" | "initializing" | "error">("initializing");

  useEffect(() => {
    // Check API health on mount
    const checkHealth = async () => {
      try {
        const response = await fetch("http://localhost:8000/health");
        const data = await response.json();
        if (data.status === "ready") {
          setApiStatus("ready");
        } else {
          setTimeout(checkHealth, 3000); // Retry after 3 seconds
        }
      } catch (error) {
        console.error("API health check failed:", error);
        setApiStatus("error");
        setTimeout(checkHealth, 5000); // Retry after 5 seconds
      }
    };

    checkHealth();
  }, []);
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
                    <StatusBadge status={apiStatus} />
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
