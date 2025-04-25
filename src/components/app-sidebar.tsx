import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Info, MessageSquare, MessagesSquare } from "lucide-react";

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
                <SidebarMenuButton asChild className="bg-amber-200 text-amber-950">
                  <nav>
                    <AlertTriangle />
                    <span>Under Development</span>
                  </nav>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
              {/* <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href={`${import.meta.env.VITE_API_URL}/login`} >
                    <Info />
                    <span>Login</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href={`${import.meta.env.VITE_API_URL}/logout`} >
                    <Info />
                    <span>Logout</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
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
