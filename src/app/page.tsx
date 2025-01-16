"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamic Import สำหรับ React-Leaflet
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

type Station = {
  infrastruc_name: string;
  infrastruc_district: string;
  infrastruc_province: string;
  infrastruc_type: string;
  coordinates_lat: string;
  coordinates_long: string;
};

let L: typeof import("leaflet") | undefined;

if (typeof window !== "undefined") {
  import("leaflet").then((leaflet) => {
    L = leaflet;
  });
}

const Page = () => {
  const [stations, setStations] = useState<Station[]>([]); // ชนิดข้อมูลที่ชัดเจน
  const [selectedStation, setSelectedStation] = useState<string | null>(null); // สถานีที่เลือก
  const [isDarkMode, setIsDarkMode] = useState(false);

  // ดึงข้อมูลสถานี
  useEffect(() => {
    fetch("http://localhost:3000/infrastruc")
      .then((response) => response.json())
      .then((data) => setStations(data))
      .catch((error) => console.error("Error fetching station data:", error));
  }, []);

  const selectedStationData = stations.find(
    (station) => station.infrastruc_name === selectedStation
  );

  // สลับธีม
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
    document.body.classList.toggle("dark", !isDarkMode);
  };

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">เลือกสถานีและแสดงแผนที่</h1>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-500"
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
      </div>

      {/* ตัวเลือกสถานี */}
      <select
        className="p-2 border rounded-md w-full mb-4"
        value={selectedStation || ""}
        onChange={(e) => setSelectedStation(e.target.value)}
      >
        <option value="">-- เลือกสถานี --</option>
        {stations.map((station) => (
          <option key={station.infrastruc_name} value={station.infrastruc_name}>
            {station.infrastruc_name}
          </option>
        ))}
      </select>

      {/* แผนที่ */}
      <div className="w-full h-[500px]">
        <MapContainer
          center={[13.75, 100.5]} // ตำแหน่งเริ่มต้น
          zoom={6}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {selectedStationData && L && (
            <Marker
              position={[
                parseFloat(selectedStationData.coordinates_lat),
                parseFloat(selectedStationData.coordinates_long),
              ]}
              icon={
                new L.Icon({
                  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                })
              }
            >
              <Popup>
                <strong>{selectedStationData.infrastruc_name}</strong>
                <div>
                  {selectedStationData.infrastruc_district},{" "}
                  {selectedStationData.infrastruc_province}
                </div>
                <div>
                  <strong>ประเภท:</strong> {selectedStationData.infrastruc_type}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default Page;
