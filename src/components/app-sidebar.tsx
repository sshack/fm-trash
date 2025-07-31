'use client';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/sidebar';
import { useSession } from '@/hooks/useSession';
import { Bot, GalleryVerticalEnd, SquareTerminal } from 'lucide-react';
import { usePathname } from 'next/navigation';

const data = {
  teams: [
    {
      name: 'Gondola',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
  ],
  navInst: [
    {
      title: 'Client',
      url: 'inst/client',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'Workspaces',
          url: 'workspaces',
        },
        {
          title: 'Workspace Users',
          url: 'workspace-users',
        },
      ],
    },
    {
      title: 'Deals',
      url: 'inst/deals',
      icon: Bot,
      items: [
        {
          title: 'Indications',
          url: 'indications',
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { session } = useSession();
  const pathname = usePathname();
  const isRtl = pathname.startsWith('/rtl');
  const isInst = pathname.startsWith('/inst');

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        {isInst && <NavMain items={data.navInst} />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: session?.name ?? 'Admin',
            email: session?.email ?? 'email',
            avatar: session?.picture ?? '/avatars/shadcn.jpg',
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
