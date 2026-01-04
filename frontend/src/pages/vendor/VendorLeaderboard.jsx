import React, { useEffect, useState } from "react";
import VendorLeaderboardTable from "../../components/vendor/VendorleaderboardTable";
import {ErrorBanner} from "../../components/ui/ErrorBanner";

const VendorLeaderboard = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const city = "Vasai";

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/v1/vendors/leaderboard?city=${city}`
        );
        const data = await res.json();

        if (!data.success) {
          throw new Error("Failed to load leaderboard");
        }

        setVendors(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [city]);

  if (loading) {
    return <p className="p-6 text-gray-500">Loading leaderboard…</p>;
  }

  if (error) {
    return <ErrorBanner message={error} />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Vendor Leaderboard</h1>
        <p className="text-gray-500">
          Ranking vendors by demand and stock reliability
        </p>
      </div>

      <VendorLeaderboardTable data={vendors} />
    </div>
  );
};

export default VendorLeaderboard;
