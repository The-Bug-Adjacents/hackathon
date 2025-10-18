export default function Box({ title, children, className = "" }) {
  return (
    <div className={`bg-secondary border border-border rounded-2xl p-4 shadow-sm ${className}`}>
      {title && <h2 className="font-semibold mb-3 text-foreground">{title}</h2>}
      <div>{children}</div>
    </div>
  );
}