import React, { useState, useEffect } from "react";
import axios from "axios";
import LiveMap from "../../components/LiveMap";
import { Input, Button, Card } from "../../components/ui";
import { List } from "lucide-react";
import logo from "../../assets/Images/logo.png";

const LiveLocationMap = () => {
  const [search, setSearch] = useState("");
  const [allVendors, setAllVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [defaultVendors, setDefaultVendors] = useState([]); // Stores first 3 from API
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          "http://localhost:3000/api/v1/products/vendors-with-products"
        );
        const vendors = res.data.data;
        setAllVendors(vendors);

        // Replace static names: Use first 3 vendors from fetched data as default
        const initial = vendors.slice(0, 3);
        setDefaultVendors(initial);
        setFilteredVendors(initial);
      } catch (err) {
        console.error("Vendor fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const handleSearch = () => {
    if (!search.trim()) {
      setFilteredVendors(defaultVendors);
      return;
    }

    setLoading(true);
    const results = allVendors
      .map((v) => ({
        ...v,
        items: v.items.filter((i) =>
          i.name.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter((v) => v.items.length > 0);

    setFilteredVendors(results);
    setShowList(true);
    setLoading(false);
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="md:w-1/2 p-3 flex gap-2 mt-20 md:ml-10">
        <Input
          placeholder="Search a fruit or vegetable..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button size="sm" onClick={handleSearch}>Search</Button>
      </div>

      <div className="flex flex-1 relative overflow-hidden">
        <div className="flex-1">
          <LiveMap filteredVendors={filteredVendors} />
        </div>

        <div className="hidden md:block w-1/3 bg-white overflow-y-auto mx-10 mb-10">
          <VendorList vendors={filteredVendors} loading={loading} />
        </div>

        <div className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl transition-transform duration-300 md:hidden z-[2000] ${showList ? "translate-y-0" : "translate-y-full"}`} style={{ height: "65vh" }}>
          <div className="p-3 border-b flex justify-between">
            <span className="font-semibold">Vendors</span>
            <Button size="sm" onClick={() => setShowList(false)}>Close</Button>
          </div>
          <div className="p-3 overflow-y-auto">
            <VendorList vendors={filteredVendors} loading={loading} />
          </div>
        </div>

        {filteredVendors.length > 0 && !showList && (
          <Button size="sm" variant="secondary" className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-[1000]" onClick={() => setShowList(true)}>
            <List size={18} /> List Vendors
          </Button>
        )}
      </div>
    </div>
  );
};

const VendorList = ({ vendors, loading }) => {
  if (loading) return <div className="text-center">Searching…</div>;
  if (!vendors.length) return (
    <div className="text-center text-gray-400">
      <img src={logo} className="mx-auto w-20" alt="logo" />
      No vendors found
    </div>
  );
  return (
    <div className="flex flex-col gap-3 mb-20">
      <span className="text-xl font-bold">Vendors</span>
      {vendors.map((v) => (
        <Card key={v._id} className="px-6 py-4">
          <div className="font-semibold">{v.name}</div>
          {v.items.map((item) => (
            <div key={item._id} className="flex justify-between mt-3">
              <div className="flex gap-3 items-center">
                <img src={item.imageUrl} className="w-10 h-10 rounded" alt={item.name} />
                <div>
                  <div>{item.name}</div>
                  <div className="text-sm text-gray-500">₹{item.price}/{item.unit}</div>
                </div>
              </div>
              <Button size="sm" variant="ghost">Add</Button>
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
};

export default LiveLocationMap;