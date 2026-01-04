import React from "react";
import Table from "../ui/Table";
import { Trophy } from "lucide-react";

const getDemandLevel = (avg) => {
  if (avg >= 70) return "High";
  if (avg >= 30) return "Medium";
  return "Low";
};

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleString();
};

const VendorLeaderboardTable = ({ data = [] }) => {
  const columns = [
    {
      header: "Rank",
      accessor: "rank",
      cell: (row) => (
        <div className="flex items-center gap-2 font-semibold">
          <Trophy className="w-4 text-green-600" />
          #{row.rank}
        </div>
      ),
    },
    {
      header: "Store",
      accessor: "storeName",
      cell: (row) => (
        <div>
          <p className="font-semibold">{row.storeName}</p>
          <p className="text-xs text-gray-500 truncate max-w-xs">
            {row.location}
          </p>
        </div>
      ),
    },
    {
      header: "Demand",
      accessor: "demand",
      cell: (row) => (
        <span className="font-medium">
          {getDemandLevel(row.scores.avgDemandIndex)} (
          {row.scores.avgDemandIndex}%)
        </span>
      ),
    },
    {
      header: "Total Demand",
      accessor: "totalDemand",
      cell: (row) => row.scores.totalDemand,
    },
    {
      header: "Stock Score",
      accessor: "stockScore",
      cell: (row) => (
        <span
          className={`font-semibold ${
            row.scores.stockScore >= 70
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {row.scores.stockScore}%
        </span>
      ),
    },
    {
      header: "Products",
      accessor: "products",
      cell: (row) =>
        `${row.stats.availableProducts}/${row.stats.totalProducts}`,
    },
    {
      header: "Badges",
      accessor: "badges",
      cell: (row) =>
        row.badges.length ? (
          <div className="flex gap-2">
            {row.badges.map((b) => (
              <span
                key={b}
                className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700"
              >
                {b}
              </span>
            ))}
          </div>
        ) : (
          "—"
        ),
    },
    {
      header: "Last Updated",
      accessor: "lastUpdated",
      cell: (row) => (
        <span className="text-xs text-gray-500">
          {formatDate(row.lastUpdated)}
        </span>
      ),
    },
  ];

  const tableData = data.map((vendor, index) => ({
    ...vendor,
    rank: index + 1,
  }));

  return <Table columns={columns} data={tableData} />;
};

export default VendorLeaderboardTable;
