import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button, Card } from "./ui";

/* ---------------- ICONS ---------------- */
const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const vendorIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

/* ---------------- STATIC SIMULATION COORDS ---------------- */
const STATIC_VENDOR_COORDS = [
  { lat: 19.3863, lng: 72.8289 }, // Nearby
  { lat: 19.3850, lng: 72.8290 }, // Nearby
  { lat: 19.3950, lng: 72.8350 }, // OUTSIDE (Approx 1.2km away)
  { lat: 19.3890, lng: 72.8320 }, // Borderline/Nearby
];

const RADIUS = 500; // meters

export default function LiveMap({ filteredVendors = [] }) {
  const [userPos] = useState([19.3858397, 72.8285238]);
  const mapRef = useRef(null);

  const centerMap = () => {
    const map = mapRef.current;
    if (map && userPos) {
      map.flyTo(userPos, 16, { animate: true, duration: 1.5 });
    }
  };

  const vendorsToShow = filteredVendors.length > 0 ? filteredVendors : [];

  return (
    <Card variant="glass" className="md:mx-10">
      <div className="relative w-full max-w-4xl mx-auto p-2 flex flex-col gap-4">

        <div className="relative border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg">
          <MapContainer
            center={userPos}
            zoom={15}
            scrollWheelZoom={true}
            style={{ height: "70vh", width: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />

            <Marker position={userPos} icon={userIcon}>
              <Popup>You are here (Live)</Popup>
            </Marker>

            <Circle
              center={userPos}
              radius={RADIUS}
              pathOptions={{
                color: "green",
                fillColor: "blue",
                fillOpacity: 0.1,
                dashArray: "5, 10",
              }}
            />

            {vendorsToShow.map((v, idx) => {
              const staticPos = STATIC_VENDOR_COORDS[idx % STATIC_VENDOR_COORDS.length];
              const distance = getDistanceFromLatLonInMeters(
                userPos[0], userPos[1],
                staticPos.lat, staticPos.lng
              );

              const isNearby = distance <= RADIUS;

              return (
                <Marker
                  key={v._id || idx}
                  position={[staticPos.lat, staticPos.lng]}
                  icon={vendorIcon}
                  opacity={isNearby ? 1 : 0.5} // Faded if outside radius
                >
                  <Popup>
                    <div className="min-w-[150px]">
                      <div className="font-bold border-b pb-1 mb-2">{v.name}</div>

                      {/* DISTANCE BADGE */}
                      <div className={`text-xs font-semibold mb-2 ${isNearby ? 'text-green-600' : 'text-red-500'}`}>
                        {distance > 1000
                          ? `Est. ${(distance / 1000).toFixed(2)} km away`
                          : `Est. ${Math.round(distance)} m away`}
                        {!isNearby && " (Outside Range)"}
                      </div>

                      {v.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 mt-1">
                          <img
                            src={item.imageUrl || item.img}
                            alt={item.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div className="text-xs">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-gray-500">₹{item.price} / {item.unit}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* CENTER BUTTON */}
          <div className="absolute top-4 right-4 z-[1000]">
            <Button size="sm" onClick={centerMap}>
              Center on Me
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ---------------- HAVERSINE FORMULA ---------------- */
export function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}