import { Outlet } from 'react-router-dom'
import { SidebarInset, SidebarProvider } from '@repo/ui/components/ui/sidebar'
import { AppSidebar } from '@repo/ui/components/app-sidebar'

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
