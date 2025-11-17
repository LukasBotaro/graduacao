'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  LineChart,
  Settings,
} from 'lucide-react';

const menuItems = [
  { href: '/', label: 'Painel', icon: LayoutDashboard },
  { href: '/employees', label: 'Funcionários', icon: Users },
  { href: '/leave', label: 'Licenças', icon: Calendar },
  { href: '/documents', label: 'Documentos', icon: FileText },
  { href: '/reports', label: 'Relatórios', icon: LineChart },
  { href: '/settings', label: 'Configurações', icon: Settings },
];

export default function NavMenu() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {menuItems.map(({ href, label, icon: Icon }) => (
        <SidebarMenuItem key={href}>
          <Link href={href} passHref>
            <SidebarMenuButton
              isActive={pathname === href}
              tooltip={label}
            >
              <Icon />
              <span>{label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
