"use client";

import { DateFilterButton } from "@/components/date-filter-button";
import { MultiSelectFilter } from "@/components/multi-select-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { type Donation } from "@/data/donations";
import { downloadCsv } from "@/lib/csv";
import { ArrowDown, ArrowUp, ArrowUpDown, Download, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
    { value: "completed", label: "Completed" },
    { value: "pending", label: "Pending" },
    { value: "refunded", label: "Refunded" },
    { value: "failed", label: "Failed" },
];

const PAYMENT_METHOD_OPTIONS = [
    { value: "credit_card", label: "Credit Card" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "paypal", label: "PayPal" },
    { value: "cash", label: "Cash" },
    { value: "check", label: "Check" },
];

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    completed: "default",
    pending: "outline",
    refunded: "secondary",
    failed: "destructive",
};

const paymentMethodLabel: Record<string, string> = {
    credit_card: "Credit Card",
    bank_transfer: "Bank Transfer",
    paypal: "PayPal",
    cash: "Cash",
    check: "Check",
};

type SortKey = "donorName" | "amount" | "date" | "campaign" | "status" | "paymentMethod";

function formatCurrency(amount: number) {
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface DonationsTableProps {
    data: Donation[];
}

export function DonationsTable({ data }: DonationsTableProps) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortBy, setSortBy] = useState<SortKey>("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
    const [paymentFilter, setPaymentFilter] = useState<Set<string>>(new Set());
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

    const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => {
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(searchTimer.current);
    }, [search]);

    const filteredData = useMemo(() => {
        let result = [...data];

        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            result = result.filter(
                (d) =>
                    d.donorName.toLowerCase().includes(q) ||
                    d.campaign.toLowerCase().includes(q)
            );
        }

        if (statusFilter.size > 0) {
            result = result.filter((d) => statusFilter.has(d.status));
        }

        if (paymentFilter.size > 0) {
            result = result.filter((d) => paymentFilter.has(d.paymentMethod));
        }

        if (startDate) {
            const s = startDate.toISOString().split("T")[0];
            result = result.filter((d) => d.date >= s);
        }

        if (endDate) {
            const e = endDate.toISOString().split("T")[0];
            result = result.filter((d) => d.date <= e);
        }

        result.sort((a, b) => {
            let cmp = 0;
            switch (sortBy) {
                case "donorName":
                    cmp = a.donorName.localeCompare(b.donorName);
                    break;
                case "amount":
                    cmp = a.amount - b.amount;
                    break;
                case "date":
                    cmp = a.date.localeCompare(b.date);
                    break;
                case "campaign":
                    cmp = a.campaign.localeCompare(b.campaign);
                    break;
                case "status":
                    cmp = a.status.localeCompare(b.status);
                    break;
                case "paymentMethod":
                    cmp = a.paymentMethod.localeCompare(b.paymentMethod);
                    break;
            }
            return sortOrder === "asc" ? cmp : -cmp;
        });

        return result;
    }, [data, debouncedSearch, statusFilter, paymentFilter, startDate, endDate, sortBy, sortOrder]);

    const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

    const paginatedData = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredData.slice(start, start + PAGE_SIZE);
    }, [filteredData, page]);

    function handleSort(column: SortKey) {
        if (sortBy === column) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
        setPage(1);
    }

    function toggleStatus(value: string) {
        setStatusFilter((prev) => {
            const next = new Set(prev);
            if (next.has(value)) next.delete(value);
            else next.add(value);
            return next;
        });
        setPage(1);
    }

    function togglePayment(value: string) {
        setPaymentFilter((prev) => {
            const next = new Set(prev);
            if (next.has(value)) next.delete(value);
            else next.add(value);
            return next;
        });
        setPage(1);
    }

    function handleReset() {
        setSearch("");
        setDebouncedSearch("");
        setStatusFilter(new Set());
        setPaymentFilter(new Set());
        setStartDate(undefined);
        setEndDate(undefined);
        setSortBy("date");
        setSortOrder("desc");
        setPage(1);
    }

    function handleDownload() {
        downloadCsv(filteredData, [
            { key: "donorName", label: "Donor Name" },
            { key: "amount", label: "Amount" },
            { key: "date", label: "Date" },
            { key: "campaign", label: "Campaign" },
            { key: "status", label: "Status" },
            { key: "paymentMethod", label: "Payment Method" },
        ], "donations");
    }

    function SortIcon({ column }: { column: SortKey }) {
        if (sortBy !== column) return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 opacity-50" />;
        return sortOrder === "asc"
            ? <ArrowUp className="ml-1 inline h-3.5 w-3.5" />
            : <ArrowDown className="ml-1 inline h-3.5 w-3.5" />;
    }

    const hasFilters =
        search !== "" ||
        statusFilter.size > 0 ||
        paymentFilter.size > 0 ||
        startDate !== undefined ||
        endDate !== undefined;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Input
                    placeholder="Search donor or campaign..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 w-64"
                />
                <MultiSelectFilter
                    label="Status"
                    options={STATUS_OPTIONS}
                    selected={statusFilter}
                    onToggle={toggleStatus}
                />
                <MultiSelectFilter
                    label="Payment Method"
                    options={PAYMENT_METHOD_OPTIONS}
                    selected={paymentFilter}
                    onToggle={togglePayment}
                />
                <DateFilterButton label="Start Date" value={startDate} onChange={(d) => { setStartDate(d); setPage(1); }} />
                <DateFilterButton label="End Date" value={endDate} onChange={(d) => { setEndDate(d); setPage(1); }} />
                <Button variant="outline" size="sm" className="h-9 gap-1" onClick={handleDownload}>
                    <Download className="h-3.5 w-3.5" />
                    Download Data
                </Button>
                {hasFilters && (
                    <Button variant="ghost" size="sm" className="h-9 gap-1" onClick={handleReset}>
                        <X className="h-3.5 w-3.5" />
                        Reset
                    </Button>
                )}
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("donorName")}>
                                Donor Name <SortIcon column="donorName" />
                            </TableHead>
                            <TableHead className="cursor-pointer select-none text-right" onClick={() => handleSort("amount")}>
                                Amount <SortIcon column="amount" />
                            </TableHead>
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("date")}>
                                Date <SortIcon column="date" />
                            </TableHead>
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("campaign")}>
                                Campaign <SortIcon column="campaign" />
                            </TableHead>
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("status")}>
                                Status <SortIcon column="status" />
                            </TableHead>
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("paymentMethod")}>
                                Payment Method <SortIcon column="paymentMethod" />
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No donations found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((d) => (
                                <TableRow key={d.id}>
                                    <TableCell className="font-medium">{d.donorName}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(d.amount)}</TableCell>
                                    <TableCell>{d.date}</TableCell>
                                    <TableCell>{d.campaign}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariant[d.status] ?? "default"} className="capitalize">
                                            {d.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{paymentMethodLabel[d.paymentMethod] ?? d.paymentMethod}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {filteredData.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredData.length)} of {filteredData.length}
                </p>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                        Previous
                    </Button>
                    <span className="text-sm">
                        Page {page} of {totalPages || 1}
                    </span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
