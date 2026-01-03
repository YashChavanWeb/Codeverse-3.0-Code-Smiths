import React, { useState } from "react";
import LiveMap, { vendors as allVendors } from "../../components/LiveMap";
import { Input, Button, Card } from "../../components/ui";
import { List } from "lucide-react";
import logo from '../../assets/Images/logo.png';

const LiveLocationMap = () => {
  const [search, setSearch] = useState("");
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);

  const handleSearch = () => {
    setLoading(true);

    setTimeout(() => {
      const results = allVendors.filter((v) =>
        v.items?.some((item) =>
          item.name.toLowerCase().includes(search.toLowerCase())
        )
      );
      setFilteredVendors(results);
      setLoading(false);
      setShowList(true);
    }, 400);
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Search bar */}
      <div className=" md:w-1/2 p-3 flex gap-2 mt-15 md:mt-20 md:ml-10">
        <Input
          placeholder="Search a fruit or vegetable..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />

        <Button size='sm' onClick={handleSearch}>Search</Button>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 relative overflow-hidden h-1/2">
        <div className="flex-1">
          <LiveMap search={search} filteredVendors={filteredVendors} />
        </div>

        <div className="hidden md:block w-1/3 bg-white overflow-y-auto mx-10 mb-10">
          <VendorList vendors={filteredVendors} loading={loading} />
        </div>

        <div
          className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl transform transition-transform duration-300 md:hidden
            ${showList ? "translate-y-0" : "translate-y-full"}`}
          style={{ height: "65vh" }}
        >
          <div className="p-3 border-b flex justify-between items-center">
            <div className="font-semibold">Vendors</div>
            <Button size="sm" onClick={() => setShowList(false)}>Close</Button>
          </div>

          <div className="overflow-y-auto h-full p-3">
            <VendorList vendors={filteredVendors} loading={loading} />
          </div>
        </div>

        {filteredVendors.length > 0 && !showList && (
          <Button
            variant='secondary'
            size='sm'
            onClick={() => setShowList(true)}
            className="md:hidden fixed bottom-18 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg"
          >
            <List size={18} />
            List Vendors
          </Button>
        )}
      </div>
    </div>
  );
};

export default LiveLocationMap;

const VendorList = ({ vendors, loading }) => {
  const handleAddToBasket = (vendor, item) => {
    console.log("Added to basket:", {
      vendor: vendor.name,
      item,
    });

    // later:
    // dispatch(addToCart({ vendorId, item }))
  };

  if (loading)
    return <div className="text-center text-gray-500">Searching…</div>;

  if (!vendors.length)
    return <div className="text-center text-gray-400">
      <img src={logo} alt="SmartVeggie" className="mx-auto w-20 h-20" />
      <span>No vendors found</span></div>;

  return (
    <div className="flex flex-col gap-3 mb-30">
      <span className="text-xl font-bold">Vendors List</span>

      {vendors.map((v, idx) => (
        <Card key={idx} variant="subtle" className="px-6 py-4">
          <div className="font-semibold mb-2">{v.name}</div>

          {v.items.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 mt-3"
            >
              <div className="flex justify-around items-center gap-3">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-10 h-10 rounded"
                />

                <div className="text-sm">
                  <div className="italic px-2">{item.name}</div>
                  <div className="bg-green-800/30 px-2 py-1 mt-2 rounded-full ">
                    ₹{item.price}/{item.unit}
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAddToBasket(v, item)}
                className='scale-80 sm:scale-90 translate-x-6 md:translate-x-0'
              >
                Add to Basket
              </Button>
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
};