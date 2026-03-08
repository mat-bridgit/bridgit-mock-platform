"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { useCallback, useRef, useState } from "react";

type ConfirmOptions = {
    title?: string;
    description: string;
    confirmLabel?: string;
    variant?: "default" | "destructive";
};

export function useConfirm() {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions>({ description: "" });
    const resolveRef = useRef<((value: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions) => {
        setOptions(opts);
        setOpen(true);
        return new Promise<boolean>((resolve) => {
            resolveRef.current = resolve;
        });
    }, []);

    function handleConfirm() {
        setOpen(false);
        resolveRef.current?.(true);
    }

    function handleCancel() {
        setOpen(false);
        resolveRef.current?.(false);
    }

    const dialog = (
        <Dialog open={open} onOpenChange={(v) => !v && handleCancel()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{options.title ?? "Are you sure?"}</DialogTitle>
                    <DialogDescription>{options.description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button variant={options.variant ?? "default"} onClick={handleConfirm}>
                        {options.confirmLabel ?? "Confirm"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    return { confirm, dialog };
}
