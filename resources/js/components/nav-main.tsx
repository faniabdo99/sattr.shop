import { Link, usePage } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { toUrl } from '@/lib/utils';
import type { NavItem } from '@/types';

export type NavGroup = {
    label?: string;
    items: NavItem[];
};

/**
 * A nav link is current when the path matches (or is a parent of) the page.
 * Links that carry a query (`/admin/pages?type=static`) also compare it.
 */
function isCurrent(href: string, pageUrl: string): boolean {
    const [path, query] = href.split('?');
    const [currentPath, currentQuery = ''] = pageUrl.split('#')[0].split('?');

    if (path === '/admin') {
        return currentPath === path;
    }

    if (!query) {
        return currentPath === path || currentPath.startsWith(`${path}/`);
    }

    if (currentPath !== path) {
        return false;
    }

    const wanted = new URLSearchParams(query);
    const actual = new URLSearchParams(currentQuery);

    return [...wanted].every(
        // The pages list shows faculty pages when no type is given.
        ([key, value]) =>
            (actual.get(key) ?? (key === 'type' ? 'faculty' : null)) === value,
    );
}

export function NavMain({ groups }: { groups: NavGroup[] }) {
    const { url } = usePage();

    return (
        <>
            {groups.map((group, index) => (
                <SidebarGroup
                    key={group.label ?? `group-${index}`}
                    className="px-2 py-1"
                >
                    {group.label && (
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                    )}
                    <SidebarMenu>
                        {group.items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrent(toUrl(item.href), url)}
                                    tooltip={{ children: item.title }}
                                >
                                    <Link href={item.href}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
