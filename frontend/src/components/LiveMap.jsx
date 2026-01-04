import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button, Card } from "./ui";

const userIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const vendorIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});



const RADIUS = 500; // meters
const MAX_ACCURACY = 20; // meters

export default function LiveMap({ filteredVendors = [] }) {
  const [userPos] = useState([19.3858397, 72.8285238]);
  const mapRef = useRef(null);

  const centerMap = () => {
    const map = mapRef.current;
    if (map && userPos)
      map.flyTo(userPos, 17, { animate: true, duration: 1.5 });
  };

  const vendorsToShow = filteredVendors.length > 0 ? filteredVendors : [];

  if (!userPos)
    return <div className="p-10 text-center text-gray-500">Locating you...</div>;

  return (
    <Card variant="glass" className="md:mx-10">
      <div className="w-full max-w-4xl mx-auto p-2 flex flex-col gap-4">

        <div className="relative border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg">
          <MapContainer
            center={userPos}
            zoom={17}
            scrollWheelZoom={true}
            style={{ height: "70vh", width: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />

            {/* User Marker */}
            <Marker position={userPos} icon={userIcon}>
              <Popup>You are here (Live)</Popup>
            </Marker>

            {/* Radius Circle */}
            <Circle
              center={userPos}
              radius={RADIUS}
              pathOptions={{
                color: "green",
                fillColor: "blue",
                fillOpacity: 0.1,
                dashArray: "1,10",
              }}
            />

            {/* Vendor Markers */}
            {vendorsToShow.map((v, idx) => {
              const distance = getDistanceFromLatLonInMeters(
                userPos[0],
                userPos[1],
                v.lat,
                v.lng
              );
              const isNearby = distance <= RADIUS;

              return (
                <Marker
                  key={idx}
                  position={[v.lat, v.lng]}
                  icon={vendorIcon}
                  opacity={isNearby ? 1 : 0.4}
                >
                  <Popup>
                    <div className="text-center">
                      <strong>{v.name}</strong>
                      {v.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 mt-1 w-50">
                          <img
                            src={item.imageUrl || item.img}
                            alt={item.name}
                            className="w-15 h-15 rounded mr-5"
                          />
                          <div className="text-left text-sm">
                            <div>{item.name}</div>
                            <div className="text-gray-500">
                              {item.unit} - ₹{item.price} <br />
                              {distance.toFixed(0)} m away
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
        <div className="absolute top-0 right-0 z-1500 m-2">
          <Button size='sm' variant='primary' onClick={centerMap}>Center on Me</Button>
        </div>

      </div>
    </Card>
  );
}

// --- Haversine Formula ---
export function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meters
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