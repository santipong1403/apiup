"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSun, FaMoon, FaWater, FaMountain, FaPumpMedical } from "react-icons/fa";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

// Dynamic Import for React-Leaflet components
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

type Rainfall = {
  date: string;
  value: number;
};

const InfrastrucComponent = () => {
  const [infrastruc, setInfrastruc] = useState<Station[]>([]);
  const [rainfallData, setRainfallData] = useState<Rainfall[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [stationType, setStationType] = useState<string>("infrastruc");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [icon, setIcon] = useState<any>(null);

  useEffect(() => {
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

  const fetchInfrastruc = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:3000/${stationType}`);
      setInfrastruc(response.data);
    } catch {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const fetchRainfallData = async () => {
    try {
      const formattedStartDate = startDate?.toISOString().split("T")[0];
      const formattedEndDate = endDate?.toISOString().split("T")[0];
      const response = await axios.get("http://localhost:3000/rainfall_daily", {
        params: { startDate: formattedStartDate, endDate: formattedEndDate },
      });
      setRainfallData(
        response.data.map((item: any) => ({
          date: item.date.split(" ")[0],
          value: item.value,
        }))
      );
    } catch (err) {
      console.error("Error fetching rainfall data:", err);
    }
  };

  useEffect(() => {
    fetchInfrastruc();
  }, [stationType]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchRainfallData();
    }
  }, [startDate, endDate]);

  const rainfallChartData = {
    labels: rainfallData.map((item) => item.date),
    datasets: [
      {
        label: "ปริมาณน้ำฝน (มม.)",
        data: rainfallData.map((item) => item.value),
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.2)",
        fill: true,
        tension: 0.1,
      },
    ],
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
    document.body.classList.toggle("dark", !isDarkMode);
  };

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

      <div className="flex justify-start mb-4 space-x-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <MapContainer
          center={[13.75, 100.5]}
          zoom={6}
          style={{ height: "500px", borderRadius: "10px" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {infrastruc.map((item, index) => {
            const lat = parseFloat(item.coordinates_lat);
            const lng = parseFloat(item.coordinates_long);
            if (!isNaN(lat) && !isNaN(lng) && icon) {
              return (
                <Marker key={index} position={[lat, lng]} icon={icon}>
                  <Popup>
                    <strong>{item.infrastruc_name}</strong>
                    <p>
                      {item.infrastruc_district}, {item.infrastruc_province}
                    </p>
                    <p>ประเภท: {item.infrastruc_type}</p>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
        </MapContainer>

        <div>
          <h2 className="text-lg font-semibold mb-4">เลือกช่วงวันที่</h2>
          <div className="flex mb-4 space-x-4">
            <div>
              <label>วันที่เริ่มต้น</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => {
                  if (date) {
                    setStartDate(date);
                    if (
                      endDate &&
                      (endDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) > 3
                    ) {
                      setEndDate(new Date(date.getTime() + 3 * 24 * 60 * 60 * 1000));
                    }
                  }
                }}
                dateFormat="yyyy-MM-dd"
                maxDate={endDate ? new Date(endDate.getTime() + 3 * 24 * 60 * 60 * 1000) : undefined}
                className="w-full mt-2 p-2 border rounded"
              />
            </div>
            <div>
              <label>วันที่สิ้นสุด</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => {
                  if (date) {
                    setEndDate(date);
                    if (
                      startDate &&
                      (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) > 3
                    ) {
                      setStartDate(new Date(date.getTime() - 3 * 24 * 60 * 60 * 1000));
                    }
                  }
                }}
                dateFormat="yyyy-MM-dd"
                minDate={startDate ? new Date(startDate.getTime() - 3 * 24 * 60 * 60 * 1000) : undefined}
                className="w-full mt-2 p-2 border rounded"
              />
            </div>
          </div>
          <h2 className="text-lg font-semibold mb-4">กราฟปริมาณน้ำฝน</h2>
          {rainfallData.length > 0 ? (
            <Line
              data={rainfallChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: true },
                  tooltip: { enabled: true },
                },
                scales: {
                  x: { title: { display: true, text: "วันที่" } },
                  y: { title: { display: true, text: "ปริมาณน้ำฝน (มม.)" } },
                },
              }}
            />
          ) : (
            <p className="text-gray-500">ไม่มีข้อมูลในช่วงวันที่ที่เลือก</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfrastrucComponent;
//8;p