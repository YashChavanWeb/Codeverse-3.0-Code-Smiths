import React from "react";

export const Alert = React.forwardRef(
  (
    {
      type = "info",
      title,
      dismissible = false,
      onDismiss,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    const [isDismissed, setIsDismissed] = React.useState(false);

    if (isDismissed) return null;

    const typeStyles = {
      PRICE_UPDATE:
        "bg-blue-50 border-blue-200 text-blue-800 border-l-blue-500",
      STOCK_UPDATE:
        "bg-amber-50 border-amber-200 text-amber-800 border-l-amber-500",
      AVAILABILITY_UPDATE:
        "bg-emerald-50 border-emerald-200 text-emerald-800 border-l-emerald-500",
      TITLE_UPDATE:
        "bg-purple-50 border-purple-200 text-purple-800 border-l-purple-500",
      ERROR:
        "bg-red-50 border-red-200 text-red-800 border-l-red-500",
      info:
        "bg-blue-50 border-blue-200 text-blue-800 border-l-blue-500",
      success:
        "bg-emerald-50 border-emerald-200 text-emerald-800 border-l-emerald-500",
      warning:
        "bg-amber-50 border-amber-200 text-amber-800 border-l-amber-500",
    };

    const handleDismiss = () => {
      setIsDismissed(true);
      onDismiss && onDismiss();
    };

    return (
      <div
        ref={ref}
        className={`
          relative border border-l-4 rounded-xl p-4
          shadow-sm transition-all duration-200
          ${typeStyles[type]} ${className}
        `}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {title && (
              <h3 className="font-semibold text-sm mb-1">
                {title}
              </h3>
            )}

            <div className="text-sm leading-relaxed text-gray-700">
              {children}
            </div>
          </div>

          {dismissible && (
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = "Alert";
