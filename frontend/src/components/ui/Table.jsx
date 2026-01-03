import React from "react";
import { Button } from "./Button";

const Table = ({ columns = [], data = [] }) => {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm">
      <table className="min-w-full text-sm font-medium">
        <thead className="bg-linear-to-r from-green-50 to-emerald-50 border-b border-gray-200">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className="px-2 sm:px-6 py-3 text-left font-bold text-gray-800 tracking-wide text-sm uppercase"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-10 text-gray-500"
              >
                <div className="flex flex-col items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-300 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-gray-400 text-sm sm:text-base">No data available</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row._id || rowIndex}
                className={`hover:bg-green-50/50 transition-all duration-200 ${
                  rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                }`}
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-2 sm:px-6 py-3 whitespace-normal sm:whitespace-nowrap text-gray-700 break-words"
                  >
                    {col.cell ? col.cell(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Table footer with stats */}
      {data.length > 0 && (
        <div className="px-2 sm:px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-gray-600 gap-2 sm:gap-0">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Showing {data.length} items</span>
            </span>
            {/* <div className="flex items-center gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
              <Button
                variant="ghost"
                size="sm"
                className="px-3 py-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition"
              >
                Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="px-3 py-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition"
              >
                Next
              </Button>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
