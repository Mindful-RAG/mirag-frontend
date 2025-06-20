import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { Info, MessageSquare, MessagesSquare } from "lucide-react";

export function AppSidebar() {
  return (
    <Sidebar >
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-x-4">
          <MessageSquare className="h-5 w-5" />
          <Link to="/" className="text-xl font-bold py-0.5">Mindful RAG</Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="bg-amber-200 text-amber-950">
                  <nav>
                    <AlertTriangle />
                    <span>Under Development</span>
                  </nav>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}
        <SidebarGroup>
          <SidebarGroupLabel>
            Info
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/" >
                    <MessagesSquare />
                    <span>Chat</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
