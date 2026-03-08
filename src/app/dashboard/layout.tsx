import { auth, signOut } from "@/auth";
import { SidebarNav } from "@/components/sidebar-nav";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarInset,
    SidebarProvider,
    SidebarTrigger
} from "@/components/ui/sidebar";
import { db } from "@/db";
import { config } from "@/db/schema";
import { eq } from "drizzle-orm";
import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const configRows = await db.select().from(config);
    const configMap: Record<string, string | null> = {};
    for (const row of configRows) {
        configMap[row.key] = row.value;
    }

    const dashboardTitle = configMap.dashboard_title || "Bridgit Dashboard";
    const logoPath = configMap.logo_path || null;
    const primaryColor = configMap.primary_color || null;
    const mutedColor = configMap.muted_color || null;

    // Build light-mode CSS overrides from config colors
    const cssOverrides: string[] = [];
    if (mutedColor) {
        cssOverrides.push(`--background: ${mutedColor};`);
        cssOverrides.push(`--sidebar: ${mutedColor};`);
    }
    if (primaryColor) {
        cssOverrides.push(`--config-primary: ${primaryColor};`);
    }
    const styleTag =
        cssOverrides.length > 0
            ? `html:not(.dark) { ${cssOverrides.join(" ")} }`
            : "";

    return (
        <>
        {styleTag && <style dangerouslySetInnerHTML={{ __html: styleTag }} />}
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <div className="px-2 py-2">
                        <div className="flex flex-row items-center gap-2">
                            {logoPath && (
                                <Image
                                    alt="Logo"
                                    width={24}
                                    height={24}
                                    src={logoPath}
                                    className="h-8 w-8 rounded-sm object-contain"
                                />
                            )}
                            <h2 className="text-lg font-semibold">{dashboardTitle}</h2>
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarNav role={session.user.role} />
                </SidebarContent>
                <SidebarFooter>
                    <div className="px-2 py-2">
                        <Link
                            href="/dashboard/profile"
                            className="text-muted-foreground hover:text-foreground hover:bg-card dark:hover:bg-sidebar-accent mb-2 block rounded-lg p-1 px-2 transition-colors"
                        >
                            <div className="flex flex-col">
                                <span className="text-sm">{session.user.name}</span>
                                <span className="text-xs">{session.user.email}</span>
                            </div>
                        </Link>
                        <form
                            action={async () => {
                                "use server";
                                await signOut({ redirectTo: "/login" });
                            }}
                        >
                            <Button variant="ghost" size="sm" className="w-full justify-start">
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign out
                            </Button>
                        </form>
                    </div>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="flex h-14 items-center gap-2 px-4">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="h-6" />
                </header>
                <div className="flex flex-1 flex-col p-4 pt-0">
                    <div className="bg-card flex-1 rounded-xl border shadow-sm">
                        <main className="p-6">{children}</main>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
        </>
    );
}
