import {
  ClipboardListIcon,
  DatabaseIcon,
  FileIcon,
  FileTextIcon,
  FileVideo2,
  MessageSquareShare,
  MailCheck,
  SettingsIcon,
  User,
  ServerIcon,
  ServerCogIcon,
  LayoutDashboardIcon,
  CirclePlus,
} from 'lucide-react'
import * as React from 'react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenuButton, SidebarMenu, SidebarMenuItem, SidebarRail, SidebarGroupContent, SidebarGroup } from '@repo/ui/components/ui/sidebar'
import { NavHeader } from './nav-header'
import { NavMain } from './nav-main'
import { sidebarData } from './sidebar-data'
import { NavGroup } from './nav-group'

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
  },
  navMain: [
    {
      title: '数据概览',
      url: '/dashboard',
      icon: LayoutDashboardIcon,
    },
    {
      title: '作品管理',
      url: '/works',
      icon: FileVideo2,
    },
    {
      title: '发布记录',
      url: '/publish-records',
      icon: FileTextIcon,
    },
    {
      title: '账号管理',
      url: '/accounts',
      icon: User,
    },
    {
      title: '代理管理',
      url: '/proxies',
      icon: ServerIcon,
    },
    {
      title: '平台管理',
      url: '/platforms',
      icon: ServerCogIcon,
    },
    {
      title: '系统设置',
      url: '/settings',
      icon: SettingsIcon,
    },
  ],
  navSecondary: [
    {
      title: '联系我们',
      url: '#',
      icon: MessageSquareShare,
    },
    {
      title: '问题反馈',
      url: '#',
      icon: MailCheck,
    },
  ],
  documents: [
    {
      name: 'Data Library',
      url: '#',
      icon: DatabaseIcon,
    },
    {
      name: 'Reports',
      url: '#',
      icon: ClipboardListIcon,
    },
    {
      name: 'Word Assistant',
      url: '#',
      icon: FileIcon,
    },
  ],
}

function NewWorkButton() {
  return <SidebarGroup>
    <SidebarGroupContent className="flex flex-col gap-2">
      <SidebarMenu>
        <SidebarMenuItem className="flex items-center gap-2">
          <SidebarMenuButton
            tooltip="新建作品"
            className="bg-primary hover:bg-primary/90 active:bg-primary/90 min-w-8 cursor-pointer text-white! duration-200 ease-linear hover:text-white"
            onClick={() => {
              // navigate('/works/create')
            }}
          >
            <CirclePlus />
            <span>新建作品</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="py-2.5">
        <NavHeader />
      </SidebarHeader>
      <SidebarContent>

        <NewWorkButton />

        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="pb-[env(safe-area-inset-bottom)]"></div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
