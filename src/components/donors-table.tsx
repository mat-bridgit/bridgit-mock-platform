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
import { type Donor } from "@/data/donors";
import { downloadCsv } from "@/lib/csv";
import { ArrowDown, ArrowUp, ArrowUpDown, Download, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "new", label: "New" },
];

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    inactive: "secondary",
    new: "secondary",
};

type SortKey = "name" | "email" | "totalDonated" | "donationCount" | "firstDonationDate" | "lastDonationDate" | "status";

function formatCurrency(amount: number) {
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface DonorsTableProps {
    data: Donor[];
}

export function DonorsTable({ data }: DonorsTableProps) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortBy, setSortBy] = useState<SortKey>("totalDonated");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
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
                    d.name.toLowerCase().includes(q) ||
                    d.email.toLowerCase().includes(q)
            );
        }

        if (statusFilter.size > 0) {
            result = result.filter((d) => statusFilter.has(d.status));
        }

        if (startDate) {
            const s = startDate.toISOString().split("T")[0];
            result = result.filter((d) => d.lastDonationDate >= s);
        }

        if (endDate) {
            const e = endDate.toISOString().split("T")[0];
            result = result.filter((d) => d.lastDonationDate <= e);
        }

        result.sort((a, b) => {
            let cmp = 0;
            switch (sortBy) {
                case "name":
                    cmp = a.name.localeCompare(b.name);
                    break;
                case "email":
                    cmp = a.email.localeCompare(b.email);
                    break;
                case "totalDonated":
                    cmp = a.totalDonated - b.totalDonated;
                    break;
                case "donationCount":
                    cmp = a.donationCount - b.donationCount;
                    break;
                case "firstDonationDate":
                    cmp = a.firstDonationDate.localeCompare(b.firstDonationDate);
                    break;
                case "lastDonationDate":
                    cmp = a.lastDonationDate.localeCompare(b.lastDonationDate);
                    break;
                case "status":
                    cmp = a.status.localeCompare(b.status);
                    break;
            }
            return sortOrder === "asc" ? cmp : -cmp;
        });

        return result;
    }, [data, debouncedSearch, statusFilter, startDate, endDate, sortBy, sortOrder]);

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

    function handleReset() {
        setSearch("");
        setDebouncedSearch("");
        setStatusFilter(new Set());
        setStartDate(undefined);
        setEndDate(undefined);
        setSortBy("totalDonated");
        setSortOrder("desc");
        setPage(1);
    }

    function handleDownload() {
        downloadCsv(filteredData, [
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "totalDonated", label: "Total Donated" },
            { key: "donationCount", label: "Donation Count" },
            { key: "firstDonationDate", label: "First Donation" },
            { key: "lastDonationDate", label: "Last Donation" },
            { key: "status", label: "Status" },
        ], "donors");
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
        startDate !== undefined ||
        endDate !== undefined;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Input
                    placeholder="Search name or email..."
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
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("name")}>
                                Name <SortIcon column="name" />
                            </TableHead>
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("email")}>
                                Email <SortIcon column="email" />
                            </TableHead>
                            <TableHead className="cursor-pointer select-none text-right" onClick={() => handleSort("totalDonated")}>
                                Total Donated <SortIcon column="totalDonated" />
                            </TableHead>
                            <TableHead className="cursor-pointer select-none text-right" onClick={() => handleSort("donationCount")}>
                                Donation Count <SortIcon column="donationCount" />
                            </TableHead>
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("firstDonationDate")}>
                                First Donation <SortIcon column="firstDonationDate" />
                            </TableHead>
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("lastDonationDate")}>
                                Last Donation <SortIcon column="lastDonationDate" />
                            </TableHead>
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("status")}>
                                Status <SortIcon column="status" />
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No donors found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((d) => (
                                <TableRow key={d.id}>
                                    <TableCell className="font-medium">{d.name}</TableCell>
                                    <TableCell>{d.email}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(d.totalDonated)}</TableCell>
                                    <TableCell className="text-right">{d.donationCount}</TableCell>
                                    <TableCell>{d.firstDonationDate}</TableCell>
                                    <TableCell>{d.lastDonationDate}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariant[d.status] ?? "default"} className="capitalize">
                                            {d.status}
                                        </Badge>
                                    </TableCell>
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
