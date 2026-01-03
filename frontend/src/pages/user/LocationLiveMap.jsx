import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { Card, CardContent } from "../../components/ui";
import { Button } from "../../components/ui";

/* ---------------- ICONS ---------------- */

const userIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const vendorIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

/* ---------------- DUMMY VENDORS ---------------- */

const vendors = [
  {
    id: 1,
    name: "Fresh Fruits Stall",
    lat: 19.3860,
    lng: 72.8275,
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e",
    veggie: "Tomato",
    price: 32,
    unit: "kg",
    rating: 4.4,
  },
  {
    id: 2,
    name: "Local Grocery Store",
    lat: 19.3863,
    lng: 72.8289,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31b",
    veggie: "Potato",
    price: 28,
    unit: "kg",
    rating: 4.1,
  },
  {
    id: 3,
    name: "Green Veg Hub",
    lat: 19.3850,
    lng: 72.8290,
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf",
    veggie: "Onion",
    price: 35,
    unit: "kg",
    rating: 4.2,
  },
];

const RADIUS = 500;

/* ---------------- MAIN PAGE ---------------- */

export default function LocationLiveMap() {
  const [userPos, setUserPos] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        alert("Turn on location bro");
      },
      { enableHighAccuracy: true }
    );
  }, []);

  if (!userPos) {
    return (
      <div className="p-10 text-center text-gray-500">
        Finding you on earth...
      </div>
    );
  }

  const enrichedVendors = vendors
    .map((v) => ({
      ...v,
      distance: getDistanceFromLatLonInMeters(
        userPos[0],
        userPos[1],
        v.lat,
        v.lng
      ),
    }))
    .filter((v) => v.distance <= RADIUS)
    .sort((a, b) => a.distance - b.distance);

  return (
    <div className="w-full h-[80vh] grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {/* ---------------- MAP ---------------- */}
      <div className="md:col-span-2 rounded-2xl overflow-hidden border shadow-lg">
        <MapContainer
          center={userPos}
          zoom={17}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap"
          />

          <Marker position={userPos} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>

          <Circle
            center={userPos}
            radius={RADIUS}
            pathOptions={{
              color: "green",
              fillOpacity: 0.08,
              dashArray: "4",
            }}
          />

          {enrichedVendors.map((v) => (
            <Marker
              key={v.id}
              position={[v.lat, v.lng]}
              icon={vendorIcon}
            >
              <Popup>
                <div className="w-52">
                  <img
                    src={v.image}
                    alt={v.name}
                    className="h-20 w-full object-cover rounded-md mb-2"
                  />

                  <h3 className="font-semibold text-sm">{v.name}</h3>

                  <p className="text-xs text-gray-600">
                    {v.veggie} · ₹{v.price}/{v.unit}
                  </p>

                  <p className="text-xs text-gray-500">
                    📍 {Math.round(v.distance)} m away
                  </p>

                  <p className="text-xs">⭐ {v.rating}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* ---------------- SIDE PANEL ---------------- */}
      <div className="space-y-3 overflow-y-auto">
        <h2 className="text-lg font-semibold px-1">
          Nearby Vendors
        </h2>

        {enrichedVendors.map((v) => (
          <Card
            key={v.id}
            className="cursor-pointer hover:scale-[1.01]"
            onClick={() =>
              mapRef.current?.flyTo([v.lat, v.lng], 18)
            }
          >
            <CardContent className="flex gap-4 items-center">
              <img
                src={v.image}
                alt={v.name}
                className="h-14 w-14 rounded-xl object-cover"
              />

              <div className="flex-1">
                <p className="font-semibold text-sm">{v.name}</p>

                <p className="text-xs text-gray-600">
                  {v.veggie} · ₹{v.price}/{v.unit}
                </p>

                <p className="text-xs text-gray-500">
                  {Math.round(v.distance)} m away
                </p>
              </div>

              <Button size="sm">View</Button>
            </CardContent>
          </Card>
        ))}

        {enrichedVendors.length === 0 && (
          <p className="text-sm text-gray-500 px-2">
            No vendors nearby. Tough luck.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------- DISTANCE UTILS ---------------- */

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
