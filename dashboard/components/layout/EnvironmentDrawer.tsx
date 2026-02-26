"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEnvironment } from "@/context/EnvironmentContext";
import { ENVIRONMENT_OPTIONS, type EnvironmentKey } from "@/utils/environments";

interface EnvironmentDrawerProps {
    open: boolean;
    onClose: () => void;
}

/**
 * Right-side environment selection drawer.
 *
 * @param props Drawer props.
 * @returns {JSX.Element}
 */
export function EnvironmentDrawer({ open, onClose }: EnvironmentDrawerProps): JSX.Element {
    const { environment, setEnvironment } = useEnvironment();

    return (
        <>
            {open ? <button type="button" className="drawer-overlay" onClick={onClose} aria-label="Close environment drawer" /> : null}
            <aside className={`environment-drawer ${open ? "environment-drawer-open" : ""}`}>
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <h2 className="text-sm font-semibold">Select Environment</h2>
                    <Button type="button" variant="ghost" size="icon" onClick={onClose}>
                        <X size={16} />
                    </Button>
                </div>
                <div className="space-y-2 p-4">
                    {ENVIRONMENT_OPTIONS.map((option) => (
                        <button
                            key={option}
                            type="button"
                            className={`environment-option ${environment === option ? "environment-option-active" : ""}`}
                            onClick={() => {
                                setEnvironment(option as EnvironmentKey);
                                onClose();
                            }}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </aside>
        </>
    );
}
