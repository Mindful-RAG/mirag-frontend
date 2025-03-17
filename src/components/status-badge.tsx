export default function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;

  const statusMap: Record<string, { color: string, label: string }> = {
    ready: { color: "text-green-600 bg-green-50", label: "ready" },
    initializing: { color: "text-yellow-600 bg-yellow-50", label: "initializing" },
    error: { color: "text-red-600 bg-red-50", label: "error" }
  };

  const { color, label } = statusMap[status] || { color: "text-gray-600 bg-gray-100", label: status };

  return (
    <span className={`${color} text-xs px-2 py-0.5 rounded-full font-medium ml-2`}>
      {label}
    </span>
  );
};
