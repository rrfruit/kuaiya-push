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
} from 'lucide-react'
import * as React from 'react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@repo/ui/components/ui/sidebar'
import { NavHeader } from './nav-header'
import { NavMain } from './nav-main'

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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="py-2.5">
        <NavHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <div className="flex-1"></div>
      </SidebarContent>
      <SidebarFooter>
        <div className="pb-[env(safe-area-inset-bottom)]"></div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
