import React from "react";

export function DataSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
