import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar"
import { Link } from "@tanstack/react-router"
import { Info, MessageSquare } from "lucide-react"

export function AppSidebar() {
  return (
    <Sidebar >
      <SidebarHeader className="border-b p-4 ">
        <div className="flex items-center gap-x-2">
          <MessageSquare className="h-6 w-6" />
          <Link to="/" className="text-xl font-bold">Mindful RAG</Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/about" >
                    <Info />
                    <span>About</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground">
          © 2025 Mindful RAG
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
