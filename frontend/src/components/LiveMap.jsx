import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button, Card } from "./ui";

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

function PopupCarousel({ items }) {
  const [index, setIndex] = useState(0);

  const prev = () => {
    setIndex((i) => (i === 0 ? items.length - 1 : i - 1));
  };

  const next = () => {
    setIndex((i) => (i === items.length - 1 ? 0 : i + 1));
  };

  const item = items[index];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <img
          src={item.imageUrl || item.img}
          alt={item.name}
          className="w-12 h-12 rounded object-cover"
        />
        <div className="text-xs">
          <div className="font-medium">{item.name}</div>
          <div className="text-gray-500">
            ₹{item.price} / {item.unit}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs mt-1">
        <button onClick={prev} className="px-2 py-1 bg-gray-100 rounded">
          ◀
        </button>

        <span className="text-gray-400">
          {index + 1} / {items.length}
        </span>

        <button onClick={next} className="px-2 py-1 bg-gray-100 rounded">
          ▶
        </button>
      </div>
    </div>
  );
}

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
            zoom={16}
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

                      {v.items.length === 1 ? (
                        <div className="flex items-center gap-2 mt-1">
                          <img
                            src={v.items[0].imageUrl || v.items[0].img}
                            alt={v.items[0].name}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div className="text-xs">
                            <div className="font-medium">{v.items[0].name}</div>
                            <div className="text-gray-500">
                              ₹{v.items[0].price} / {v.items[0].unit}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <PopupCarousel items={v.items} />
                      )}

                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          <Card className="mt-4">
  <div className="px-6 py-4">
    <h3 className="font-semibold mb-2">
      How this map works
    </h3>

    <ul className="text-sm text-gray-600 space-y-2">
      <li className="flex gap-2">
        <span>🔴</span>
        <span>
          <strong>Your location:</strong> This shows where you are right now.
        </span>
      </li>

      <li className="flex gap-2">
        <span>🟢</span>
        <span>
          <strong>Nearby vendors:</strong> Vendors inside a 500m walkable radius.
        </span>
      </li>

      <li className="flex gap-2">
        <span>⚪</span>
        <span>
          <strong>Faded vendors:</strong> Slightly farther away, shown for price comparison.
        </span>
      </li>

      <li className="flex gap-2">
        <span>🔵</span>
        <span>
          <strong>Blue circle:</strong> Active service radius around you.
        </span>
      </li>
    </ul>

    <p className="mt-3 text-xs text-gray-400">
      Distances are GPS-based estimates. Real life traffic may still humble you.
    </p>
  </div>
</Card>


          {/* CENTER BUTTON */}
          <div className="absolute top-4 right-4 z-1000">
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