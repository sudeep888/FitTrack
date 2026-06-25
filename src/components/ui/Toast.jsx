import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, X, Trophy } from "lucide-react";
import { useApp } from "../../context/AppContext";

const icons = {
  success: <CheckCircle size={16} className="text-emerald-500" />,
  error: <XCircle size={16} className="text-red-500" />,
  info: <Info size={16} className="text-blue-500" />,
  achievement: <Trophy size={16} className="text-yellow-500" />,
};

const colors = {
  success: "border-emerald-200 dark:border-emerald-800",
  error: "border-red-200 dark:border-red-800",
  info: "border-blue-200 dark:border-blue-800",
  achievement: "border-yellow-200 dark:border-yellow-800",
};

function Toast({ id, message, type }) {
  const { removeToast } = useApp();
  const [exiting, setExiting] = useState(false);

  const dismiss = () => {
    setExiting(true);
    setTimeout(() => removeToast(id), 300);
  };

  return (
    <div className={`toast-enter flex items-start gap-3 px-4 py-3 card border ${colors[type] || colors.success} shadow-lg min-w-[260px] max-w-sm`}>
      <span className="mt-0.5 flex-shrink-0">{icons[type] || icons.success}</span>
      <p className="text-sm text-gray-800 dark:text-gray-200 flex-1">{message}</p>
      <button onClick={dismiss} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useApp();
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => <Toast key={t.id} {...t} />)}
    </div>
  );
}
