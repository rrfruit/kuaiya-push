"use client";

import * as React from "react";
import {
  LayoutDashboardIcon,
  FileIcon,
  UserIcon,
  GlobeIcon,
  ServerIcon,
  SettingsIcon,
  CirclePlusIcon,
} from "lucide-react";

import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/ui/sidebar";
import { NavGroup } from "./nav-group";

export const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "作品",
      url: "/works",
      icon: FileIcon,
    },
    {
      title: "账号",
      url: "/account",
      icon: UserIcon,
    },
    {
      title: "代理",
      url: "/proxy",
      icon: GlobeIcon,
    },
    {
      title: "平台",
      url: "/platform",
      icon: ServerIcon,
    },
    {
      title: "设置",
      url: "/settings",
      icon: SettingsIcon,
    },
  ],
  navSecondary: [],
  documents: [],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <LayoutDashboardIcon className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0!">
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2 pr-4">
                <SidebarMenuButton
                  tooltip="立即创建"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                >
                  <CirclePlusIcon />
                  <span>立即创建</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <NavGroup title="" items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>{data.user && <NavUser user={data.user} />}</SidebarFooter>
    </Sidebar>
  );
}
