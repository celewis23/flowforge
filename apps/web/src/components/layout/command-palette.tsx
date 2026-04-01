"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appNav } from "@/lib/navigation";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const items = appNav.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Command K
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/40 px-4 pt-24 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-border bg-background shadow-2xl">
            <div className="border-b border-border p-4">
              <Input autoFocus placeholder="Search pages, reports, teams..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            <div className="max-h-[60vh] overflow-auto p-3">
              {items.length ? (
                <div className="grid gap-2">
                  {items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="rounded-2xl px-4 py-3 text-sm font-medium text-foreground transition hover:bg-surface"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span>{item.label}</span>
                        <span className="text-xs text-muted-foreground">{item.group}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="px-4 py-8 text-sm text-muted-foreground">No matches.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
