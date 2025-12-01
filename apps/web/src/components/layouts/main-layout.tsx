import { AppSidebar } from "@repo/ui/components/app-sidebar"
import { SiteHeader } from "@repo/ui/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@repo/ui/components/ui/sidebar"

import { Outlet } from "react-router-dom"

export default function MainLayout() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 60)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
