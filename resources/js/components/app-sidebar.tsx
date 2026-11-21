import { Link } from '@inertiajs/react';
import {
    ArrowLeftRight,
    CircleHelp,
    ExternalLink,
    FileText,
    GraduationCap,
    LayoutGrid,
    Newspaper,
    Package,
    Palette,
    Settings,
    ShoppingBag,
    Star,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import type { NavGroup } from '@/components/nav-main';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

const navGroups: NavGroup[] = [
    {
        items: [
            { title: 'Dashboard', href: '/admin', icon: LayoutGrid },
            { title: 'Orders', href: '/admin/orders', icon: ShoppingBag },
        ],
    },
    {
        label: 'Catalog',
        items: [
            { title: 'Product', href: '/admin/product', icon: Package },
            { title: 'Designs', href: '/admin/designs', icon: Palette },
        ],
    },
    {
        label: 'Content',
        items: [
            {
                title: 'Faculty pages',
                href: '/admin/pages?type=faculty',
                icon: GraduationCap,
            },
            {
                title: 'Static pages',
                href: '/admin/pages?type=static',
                icon: FileText,
            },
            { title: 'Journal', href: '/admin/articles', icon: Newspaper },
            { title: 'FAQ', href: '/admin/faqs', icon: CircleHelp },
            { title: 'Reviews', href: '/admin/reviews', icon: Star },
            {
                title: 'Redirects',
                href: '/admin/redirects',
                icon: ArrowLeftRight,
            },
        ],
    },
    {
        items: [{ title: 'Settings', href: '/admin/settings', icon: Settings }],
    },
];

const footerNavItems: NavItem[] = [
    { title: 'View site', href: '/ar', icon: ExternalLink },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin" aria-label="Sattr admin">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={navGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
