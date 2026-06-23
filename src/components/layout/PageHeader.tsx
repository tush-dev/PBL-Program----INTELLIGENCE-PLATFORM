interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
      <div className="min-w-0">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-slate-500 mt-0.5 leading-relaxed max-w-2xl">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </div>
  );
}
