import React from "react";

export function DataField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] text-muted-foreground font-medium">
        {label}
      </span>
      <div className="text-sm text-foreground bg-slate-50 dark:bg-slate-900/50 p-2 rounded-md border border-slate-100 dark:border-slate-800">
        {value}
      </div>
    </div>
  );
}
