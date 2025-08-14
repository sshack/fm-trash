'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/sidebar';
import Link from 'next/link';
import { Home, Building2, Package, Images, Route, Layers } from 'lucide-react';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider className="min-h-screen">
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <h2 className="px-2 py-4 text-lg font-bold">Admin Panel</h2>
        </SidebarHeader>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/dashboard'}>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Home size={18} />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/institutions')}
              >
                <Link href="/institutions" className="flex items-center gap-2">
                  <Building2 size={18} />
                  <span>Institutions</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/products')}
              >
                <Link href="/products" className="flex items-center gap-2">
                  <Package size={18} />
                  <span>Products</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/screenshots')}
              >
                <Link href="/screenshots" className="flex items-center gap-2">
                  <Images size={18} />
                  <span>Screenshots</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/journeys')}
              >
                <Link href="/journeys" className="flex items-center gap-2">
                  <Route size={18} />
                  <span>Journeys</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/variants')}
              >
                <Link href="/variants" className="flex items-center gap-2">
                  <Layers size={18} />
                  <span>Variants</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarFooter className="mt-auto flex justify-center py-2">
          <SidebarTrigger />
        </SidebarFooter>
      </Sidebar>
      {/* main content area */}
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
