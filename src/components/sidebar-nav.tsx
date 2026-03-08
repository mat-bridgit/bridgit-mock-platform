"use client";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar";
import { Heart, Home, Megaphone, PoundSterling, Settings, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { title: string; href: string; icon: LucideIcon };

type NavSection = {
    label?: string;
    items: NavItem[];
    adminOnly?: boolean;
};

const sections: NavSection[] = [
    {
        items: [{ title: "Dashboard", href: "/dashboard", icon: Home }]
    },
    {
        label: "Data",
        items: [
            { title: "Donations", href: "/dashboard/donations", icon: PoundSterling },
            { title: "Donors", href: "/dashboard/donors", icon: Heart },
            { title: "Fundraising", href: "/dashboard/fundraising", icon: Megaphone }
        ]
    },
    {
        label: "Admin",
        items: [
            { title: "Users", href: "/dashboard/users", icon: Users },
            { title: "Config", href: "/dashboard/config", icon: Settings }
        ],
        adminOnly: true
    }
];

export function SidebarNav({ role }: { role?: string }) {
    const pathname = usePathname();

    const activeClass =
        "data-[active=true]:bg-white data-[active=true]:shadow-sm data-[active=true]:rounded-xl px-3 dark:data-[active=true]:bg-sidebar-accent dark:data-[active=true]:text-sidebar-accent-foreground";

    return (
        <>
            {sections.map((section) => {
                if (section.adminOnly && role !== "admin") return null;

                return (
                    <SidebarGroup key={section.label ?? "home"}>
                        {section.label && <SidebarGroupLabel>{section.label}</SidebarGroupLabel>}
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {section.items.map((item) => {
                                    const isActive =
                                        item.href === "/dashboard"
                                            ? pathname === "/dashboard"
                                            : pathname.startsWith(item.href);

                                    return (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton asChild isActive={isActive} className={activeClass}>
                                                <Link href={item.href}>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                );
            })}
        </>
    );
}
