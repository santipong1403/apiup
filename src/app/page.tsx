"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSun, FaMoon, FaWater, FaMountain, FaPumpMedical } from "react-icons/fa";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Dynamic Import for React-Leaflet components
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });


// ประเภทข้อมูล
type Station = {
  infrastruc_name: string;
  infrastruc_district: string;
  infrastruc_province: string;
  infrastruc_type: string;
  coordinates_lat: string;
  coordinates_long: string;
};

type StationCount = {
  infrastruc: number;
  weir: number;
  pumpstation: number;
};

const InfrastrucComponent = () => {
  const [infrastruc, setInfrastruc] = useState<Station[]>([]);
  const [stationCount, setStationCount] = useState<StationCount>({
    infrastruc: 0,
    weir: 0,
    pumpstation: 0,
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [stationType, setStationType] = useState<string>("infrastruc");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [icon, setIcon] = useState<any>(null);

  useEffect(() => {
    // สร้าง Leaflet Icon เฉพาะฝั่ง Client
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        setIcon(
          new L.Icon({
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          })
        );
      });
    }
  }, []);

  // ดึงข้อมูลจำนวนสถานี
  const fetchStationCount = async () => {
    try {
      const response = await axios.get("http://localhost:3000/station_count");
      setStationCount(response.data);
    } catch {
      setError("Error fetching station count");
    }
  };

  // ดึงข้อมูลสถานี
  const fetchInfrastruc = async (type: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:3000/${type}`);
      setInfrastruc(response.data);
    } catch {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  // ใช้ useEffect
  useEffect(() => {
    fetchStationCount();
  }, []);

  useEffect(() => {
    fetchInfrastruc(stationType);
  }, [stationType]);

  // กรองข้อมูลตามคำค้นหา
  const filteredInfrastruc = infrastruc.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.infrastruc_name.toLowerCase().includes(searchLower) ||
      item.infrastruc_district.toLowerCase().includes(searchLower) ||
      item.infrastruc_province.toLowerCase().includes(searchLower)
    );
  });

  // สลับธีม
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
    document.body.classList.toggle("dark", !isDarkMode);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-2xl font-semibold text-gray-600">
        <span className="animate-pulse">Loading...</span>
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 text-lg font-semibold">{error}</div>
    );

  return (
    <div
      className={`min-h-screen p-6 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Infrastruc Map</h1>
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-300 ease-in-out"
        >
          {isDarkMode ? (
            <FaSun className="text-yellow-400" />
          ) : (
            <FaMoon className="text-blue-500" />
          )}
        </button>
      </div>

      <div className="mb-6 flex space-x-4">
        <input
          type="text"
          placeholder="ค้นหาสถานี..."
          className={`p-2 border rounded-md w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
            isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
          }`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex justify-center mb-4 space-x-4">
        <button
          className={`flex items-center p-2 rounded-lg shadow-md ${
            stationType === "infrastruc"
              ? "bg-green-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
          onClick={() => setStationType("infrastruc")}
        >
          <FaWater className="mr-2" />
          <span>ประตูระบายน้ำ</span>
        </button>
        <button
          className={`flex items-center p-2 rounded-lg shadow-md ${
            stationType === "weir"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
          onClick={() => setStationType("weir")}
        >
          <FaMountain className="mr-2" />
          <span>ฝาย</span>
        </button>
        <button
          className={`flex items-center p-2 rounded-lg shadow-md ${
            stationType === "pumpstation"
              ? "bg-red-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
          onClick={() => setStationType("pumpstation")}
        >
          <FaPumpMedical className="mr-2" />
          <span>สถานีสูบน้ำ</span>
        </button>
      </div>

      <MapContainer
        center={[13.75, 100.5]}
        zoom={6}
        style={{ width: "500px", height: "500px", borderRadius: "10px", marginTop: "10px" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {filteredInfrastruc.map((item, index) => {
          const lat = parseFloat(item.coordinates_lat);
          const lng = parseFloat(item.coordinates_long);

          if (!isNaN(lat) && !isNaN(lng) && icon) {
            return (
              <Marker key={index} position={[lat, lng]} icon={icon}>
                <Popup>
                  <strong className="text-lg">{item.infrastruc_name}</strong>
                  <div>
                    {item.infrastruc_district}, {item.infrastruc_province}
                  </div>
                  <div>
                    <strong>ประเภท:</strong> {item.infrastruc_type}
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
};

export default InfrastrucComponent;
