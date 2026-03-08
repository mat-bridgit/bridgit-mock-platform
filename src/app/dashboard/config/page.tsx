import { auth } from "@/auth";
import { db } from "@/db";
import { config } from "@/db/schema";
import { redirect } from "next/navigation";
import { ConfigForm } from "./config-form";

export default async function ConfigPage() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
        redirect("/dashboard");
    }

    const rows = await db.select().from(config);
    const configMap: Record<string, string | null> = {};
    for (const row of rows) {
        configMap[row.key] = row.value;
    }

    return (
        <div className="max-w-2xl">
            <h1 className="mb-6 text-2xl font-semibold">Configuration</h1>
            <ConfigForm
                dashboardTitle={configMap.dashboard_title || "Bridgit Dashboard"}
                logoPath={configMap.logo_path || null}
                primaryColor={configMap.primary_color || ""}
                mutedColor={configMap.muted_color || ""}
            />
        </div>
    );
}
