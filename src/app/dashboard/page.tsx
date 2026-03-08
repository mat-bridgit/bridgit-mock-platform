import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { donations } from "@/data/donations";
import { donors } from "@/data/donors";
import { campaigns } from "@/data/fundraising";
import { format, parseISO } from "date-fns";
import { DollarSign, Heart, Megaphone, TrendingUp } from "lucide-react";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    completed: "default",
    pending: "outline",
    refunded: "secondary",
    failed: "destructive"
};

export default function DashboardPage() {
    const completedDonations = donations.filter((d) => d.status === "completed");
    const totalDonations = completedDonations.reduce((sum, d) => sum + d.amount, 0);
    const totalDonors = donors.length;
    const activeFundraisers = campaigns.filter((c) => c.status === "active").length;
    const avgDonation = completedDonations.length > 0 ? totalDonations / completedDonations.length : 0;

    const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const cards = [
        { title: "Total Donations", value: fmt(totalDonations), icon: DollarSign },
        { title: "Total Donors", value: totalDonors.toLocaleString(), icon: Heart },
        { title: "Active Fundraisers", value: activeFundraisers.toLocaleString(), icon: Megaphone },
        { title: "Avg. Donation", value: fmt(avgDonation), icon: TrendingUp }
    ];

    // Last 7 days with donations (group by date, take most recent 7)
    const byDate = new Map<string, { total: number; count: number }>();
    for (const d of donations) {
        const entry = byDate.get(d.date) || { total: 0, count: 0 };
        entry.count++;
        if (d.status === "completed") entry.total += d.amount;
        byDate.set(d.date, entry);
    }
    const last7Days = [...byDate.entries()]
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, 7)
        .reverse()
        .map(([dateStr, { total, count }]) => ({
            date: parseISO(dateStr),
            dateStr,
            total,
            count
        }));
    const maxTotal = Math.max(...last7Days.map((d) => d.total), 1);

    // Last 10 donations (sorted by date desc)
    const recentDonations = [...donations].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Dashboard</h1>

            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <Card key={card.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <card.icon className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Last 7 days */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-3">
                        {last7Days.map((day) => {
                            const pct = Math.max((day.total / maxTotal) * 100, 4);
                            return (
                                <div key={day.dateStr} className="flex flex-1 flex-col items-center gap-2">
                                    <span className="text-foreground text-xs font-semibold tabular-nums">
                                        {fmt(day.total)}
                                    </span>
                                    <div
                                        className="relative w-full"
                                        style={{ height: 140 }}
                                    >
                                        <div className="bg-muted/50 absolute inset-0 rounded-lg" />
                                        <div
                                            className="chart-bar absolute bottom-0 w-full rounded-lg"
                                            style={{ height: `${pct}%` }}
                                        />
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-foreground text-xs font-medium">{format(day.date, "EEE")}</span>
                                        <span className="text-muted-foreground text-[11px]">{format(day.date, "MMM d")}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Recent donations */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Recent Donations</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Donor</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Campaign</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentDonations.map((d) => (
                                    <TableRow key={d.id}>
                                        <TableCell className="font-medium">{d.donorName}</TableCell>
                                        <TableCell>{fmt(d.amount)}</TableCell>
                                        <TableCell>{d.date}</TableCell>
                                        <TableCell>{d.campaign}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant[d.status]} className="uppercase">
                                                {d.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
