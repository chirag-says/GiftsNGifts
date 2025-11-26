import React from "react";

const SUMMARY_CONFIG = [
  { key: "today", title: "Today's Orders" },
  { key: "month", title: "This Month" },
  { key: "year", title: "This Year" },
  { key: "overall", title: "Overall" },
];

function OrderSummaryCards({ stats, formatAmount, focusedRange, onSelectRange }) {
  return (
    <div className="grid  grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

      {SUMMARY_CONFIG.map(({ key, title }) => {
        const data = stats?.[key] || { count: 0, total: 0 };
        const isActive = focusedRange === key;
        const Tag = onSelectRange ? "button" : "div";

        return (
          <Tag
            key={key}
            type={onSelectRange ? "button" : undefined}
            onClick={onSelectRange ? () => onSelectRange(key) : undefined}
            className={`
              group
              rounded-2xl
              p-5
              text-left
              border
              transition-all
              shadow-sm
              hover:shadow-lg
              hover:-translate-y-1
              duration-200
              focus:outline-none

              ${
                isActive
                  ? "border-blue-500 bg-white shadow-md"
                  : "border-gray-200 bg-gradient-to-br from-gray-50 to-white"
              }
            `}
          >
            {/* TITLE */}
            <p className="text-sm font-medium text-gray-500">{title}</p>

            {/* ORDER COUNT */}
            <p className="mt-2 text-4xl font-extrabold text-gray-900 leading-tight">
              {data.count}
            </p>
            <p className="text-xs uppercase tracking-wider text-gray-400">
              Orders
            </p>

            {/* REVENUE */}
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Revenue
              </p>
              <p className="mt-1 text-xl font-bold text-green-700">
                {formatAmount ? formatAmount(data.total) : data.total}
              </p>
            </div>

            {/* Active indicator */}
            {isActive && (
              <div className="mt-3 h-1 rounded-full bg-blue-500"></div>
            )}
          </Tag>
        );
      })}

    </div>
  );
}

export default OrderSummaryCards;
