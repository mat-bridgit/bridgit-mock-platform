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
import { type FundraisingCampaign } from "@/data/fundraising";
import { downloadCsv } from "@/lib/csv";
import { ArrowDown, ArrowUp, ArrowUpDown, Download, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "planned", label: "Planned" },
    { value: "cancelled", label: "Cancelled" },
];

const CATEGORY_OPTIONS = [
    { value: "education", label: "Education" },
    { value: "health", label: "Health" },
    { value: "community", label: "Community" },
    { value: "emergency", label: "Emergency" },
    { value: "environment", label: "Environment" },
];

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    completed: "default",
    planned: "outline",
    cancelled: "destructive",
};

const categoryLabel: Record<string, string> = {
    education: "Education",
    health: "Health",
    community: "Community",
    emergency: "Emergency",
    environment: "Environment",
};

type SortKey = "name" | "category" | "goalAmount" | "raisedAmount" | "progress" | "donorCount" | "startDate" | "endDate" | "status";

function formatCurrency(amount: number) {
    return `$${amount.toLocaleString("en-US")}`;
}

interface FundraisingTableProps {
    data: FundraisingCampaign[];
}

export function FundraisingTable({ data }: FundraisingTableProps) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortBy, setSortBy] = useState<SortKey>("startDate");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
    const [categoryFilter, setCategoryFilter] = useState<Set<string>>(new Set());
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

    function getProgress(c: FundraisingCampaign) {
        if (c.goalAmount === 0) return 0;
        return (c.raisedAmount / c.goalAmount) * 100;
    }

    const filteredData = useMemo(() => {
        let result = [...data];

        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            result = result.filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.description.toLowerCase().includes(q)
            );
        }

        if (statusFilter.size > 0) {
            result = result.filter((c) => statusFilter.has(c.status));
        }

        if (categoryFilter.size > 0) {
            result = result.filter((c) => categoryFilter.has(c.category));
        }

        if (startDate) {
            const s = startDate.toISOString().split("T")[0];
            result = result.filter((c) => c.startDate >= s);
        }

        if (endDate) {
            const e = endDate.toISOString().split("T")[0];
            result = result.filter((c) => c.startDate <= e);
        }

        result.sort((a, b) => {
            let cmp = 0;
            switch (sortBy) {
                case "name":
                    cmp = a.name.localeCompare(b.name);
                    break;
                case "category":
                    cmp = a.category.localeCompare(b.category);
                    break;
                case "goalAmount":
                    cmp = a.goalAmount - b.goalAmount;
                    break;
                case "raisedAmount":
                    cmp = a.raisedAmount - b.raisedAmount;
                    break;
                case "progress":
                    cmp = getProgress(a) - getProgress(b);
                    break;
                case "donorCount":
                    cmp = a.donorCount - b.donorCount;
                    break;
                case "startDate":
                    cmp = a.startDate.localeCompare(b.startDate);
                    break;
                case "endDate":
                    cmp = a.endDate.localeCompare(b.endDate);
                    break;
                case "status":
                    cmp = a.status.localeCompare(b.status);
                    break;
            }
            return sortOrder === "asc" ? cmp : -cmp;
        });

        return result;
    }, [data, debouncedSearch, statusFilter, categoryFilter, startDate, endDate, sortBy, sortOrder]);

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

    function toggleCategory(value: string) {
        setCategoryFilter((prev) => {
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
        setCategoryFilter(new Set());
        setStartDate(undefined);
        setEndDate(undefined);
        setSortBy("startDate");
        setSortOrder("desc");
        setPage(1);
    }

    function handleDownload() {
        const exportData = filteredData.map((c) => ({
            ...c,
            progress: `${Math.round(getProgress(c))}%`,
        }));
        downloadCsv(exportData, [
            { key: "name", label: "Name" },
            { key: "category", label: "Category" },
            { key: "goalAmount", label: "Goal" },
            { key: "raisedAmount", label: "Raised" },
            { key: "progress", label: "Progress" },
            { key: "donorCount", label: "Donor Count" },
            { key: "startDate", label: "Start Date" },
            { key: "endDate", label: "End Date" },
            { key: "status", label: "Status" },
        ], "fundraising-campaigns");
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
        categoryFilter.size > 0 ||
        startDate !== undefined ||
        endDate !== undefined;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Input
                    placeholder="Search name or description..."
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
                    label="Category"
                    options={CATEGORY_OPTIONS}
                    selected={categoryFilter}
                    onToggle={toggleCategory}
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
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("category")}>
                                Category <SortIcon column="category" />
                            </TableHead>
                            <TableHead className="cursor-pointer select-none text-right" onClick={() => handleSort("goalAmount")}>
                                Goal <SortIcon column="goalAmount" />
                            </TableHead>
                            <TableHead className="cursor-pointer select-none text-right" onClick={() => handleSort("raisedAmount")}>
                                Raised <SortIcon column="raisedAmount" />
                            </TableHead>
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("progress")}>
                                Progress <SortIcon column="progress" />
                            </TableHead>
                            <TableHead className="cursor-pointer select-none text-right" onClick={() => handleSort("donorCount")}>
                                Donors <SortIcon column="donorCount" />
                            </TableHead>
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("startDate")}>
                                Start Date <SortIcon column="startDate" />
                            </TableHead>
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("endDate")}>
                                End Date <SortIcon column="endDate" />
                            </TableHead>
                            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("status")}>
                                Status <SortIcon column="status" />
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                    No campaigns found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((c) => {
                                const progress = getProgress(c);
                                return (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-medium">{c.name}</TableCell>
                                        <TableCell className="capitalize">{categoryLabel[c.category] ?? c.category}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(c.goalAmount)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(c.raisedAmount)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-20 rounded-full bg-muted">
                                                    <div
                                                        className="h-2 rounded-full bg-primary"
                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-muted-foreground">
                                                    {Math.round(progress)}%
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">{c.donorCount}</TableCell>
                                        <TableCell>{c.startDate}</TableCell>
                                        <TableCell>{c.endDate}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant[c.status] ?? "default"} className="capitalize">
                                                {c.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
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
