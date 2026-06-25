export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && <div className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4"><Icon size={32} className="text-gray-400" /></div>}
      <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-gray-500 mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}
