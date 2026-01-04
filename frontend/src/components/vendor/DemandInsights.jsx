import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Table, Card, ErrorBanner } from "../../components/ui";

const DemandInsights = ({ city }) => {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const sseRef = useRef(null);

  const fetchDemand = async () => {
    try {
      const res = await axios.get(
        `/api/v1/basket/demand`,
        { params: { city } }
      );

      if (res.data?.success) {
        setRows(res.data.data);
      }
    } catch (err) {
      setError("Failed to load demand insights");
    }
  };

  useEffect(() => {
    fetchDemand();
  }, [city]);

  // Live updates via SSE
  useEffect(() => {
    sseRef.current = new EventSource(
      `/api/v1/basket/demand/stream?city=${city}`
    );

    sseRef.current.onmessage = (e) => {
      const update = JSON.parse(e.data);

      setRows((prev) => {
        const index = prev.findIndex(
          (r) => r.product?._id === update.productId
        );

        if (index === -1) return prev;

        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          demandCount: update.demandCount,
          demandIndex: update.demandIndex,
        };
        return copy;
      });
    };

    return () => sseRef.current?.close();
  }, [city]);

  const columns = [
    {
      header: "Product",
      accessor: (row) => row.product?.name || "-"
    },
    {
      header: "Price",
      accessor: (row) => `₹${row.product?.price ?? "-"}`
    },
    {
      header: "Stock",
      accessor: (row) => row.product?.stock?.current ?? 0
    },
    {
      header: "Demand",
      accessor: (row) => row.demandCount
    },
    {
      header: "Demand Index",
      accessor: (row) => (
        <span
          className={`font-semibold ${
            row.demandIndex > 80
              ? "text-red-600"
              : row.demandIndex > 40
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
          {row.demandIndex}%
        </span>
      )
    }
  ];

  return (
    <Card>
      <h2 className="text-lg font-bold mb-4">Demand Insights</h2>

      <ErrorBanner message={error} onClose={() => setError("")} />

      <Table
        columns={columns}
        data={rows}
        emptyMessage="No demand data yet"
      />
    </Card>
  );
};

export default DemandInsights;
