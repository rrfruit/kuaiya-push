import { useNavigate } from 'react-router-dom'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from '@repo/ui/components/ui/sidebar'
import Logo from '@/components/logo'

export function NavHeader() {
  const navigate = useNavigate()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground bg-transparent!"
        >
          <div>
            <div
              className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
              onClick={() => {
                navigate('/')
              }}
            >
              <Logo className="size-8" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">快剪鸭</span>
              <span className="truncate text-xs">KuaiJianYa</span>
            </div>
            <SidebarTrigger className="-ml-1 hover:scale-110" />
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
