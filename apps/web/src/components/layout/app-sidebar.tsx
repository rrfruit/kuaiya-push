import * as React from 'react'
import {
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FileVideo2,
  FolderKanban,
  MessageSquareShare,
  MailCheck,
  SquareActivity,
} from 'lucide-react'
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
      title: '我的项目',
      url: '/projects',
      icon: FolderKanban,
    },
    {
      title: '音频创作',
      url: '/tts',
      icon: SquareActivity,
    },
    {
      title: '资源管理',
      url: '/assets',
      icon: FileVideo2,
    },
    // {
    //   title: '图片生成',
    //   url: '/text-to-img',
    //   icon: Images
    // },
    {
      title: '任务管理',
      url: '/job',
      icon: ClipboardListIcon,
    },
  ],
  navClouds: [
    {
      title: 'Capture',
      icon: CameraIcon,
      isActive: true,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Proposal',
      icon: FileTextIcon,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Prompts',
      icon: FileCodeIcon,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
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
