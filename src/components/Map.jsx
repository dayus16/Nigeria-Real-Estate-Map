import React, { useState } from "react";
import { useRef, useEffect } from "react";
import * as mapboxgl from "mapbox-gl/esm";
import "mapbox-gl/dist/mapbox-gl.css";
import properties from "../data/properties";
import { Fuel, Funnel } from "lucide-react";

const Map = () => {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const markersRef = useRef([]);
  const accessToken = import.meta.env.VITE_MAPBOX_ACCESSTOKEN;

  const [selectedProperty, setSelectProperty] = useState(null);
  const [aciveFilter, setActiveFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filterProperties = properties.filter((property) => {
    const statusMatch =
      aciveFilter === "all" || property.status === aciveFilter;

    const typeMatch = typeFilter === "all" || property.type === typeFilter;

    return statusMatch && typeMatch;
  });

  //   mapUseRef.current

  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      accessToken: accessToken,
      container: mapContainerRef.current,
      center: [3.3792, 6.5244],
      zoom: 11,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      mapRef.current.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    filterProperties.forEach((property) => {
      const el = document.createElement("div");
      const isSelected = selectedProperty === property;
      const bgColor = isSelected
        ? "#E07B39"
        : property.status === "rent"
          ? "#1D9E75"
          : "#1a3a5e";

      el.innerHTML = `
        <div style="
          background: ${bgColor};
          color: white;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          white-space: nowrap;
        ">
          ${property.priceLabel}
        </div>
        <div style="
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${bgColor};
          margin: 2px auto 0;
        "></div>
      `;

      el.addEventListener("click", () => {
        selectedProperty(property);
      });

      // create a marker at a coordinate
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(property.coordinates)
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });
  }, [filterProperties, selectedProperty]);

  return (
    <div>
      <header className="flex justify-between items-center p-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#23476c] p-3 rounded-lg">
            <Fuel />
          </div>
          <div>
            <h1 className="text-xl text-gray-200 font-bold">NaijaHomes</h1>
            <p className="text-sm text-gray-300">
              Find properties accross Nigeria
            </p>
          </div>
        </div>
        <div className="w-[50%]">
          <input
            placeholder="Search by city, area of property type..."
            className="w-full py-2 px-4 rounded-lg outline-none border border-[#23476c]"
          />
        </div>
        <div className="flex items-center gap-4 cursor-pointer">
          <div className="flex items-center gap-2 border border-gray-600 py-1 px-4 rounded-lg ">
            <Funnel size={15} />
            <p className="text-base text-gray-300">Filters</p>
          </div>
          <div className="flex items-center gap-2 bg-[#23476c] py-1 px-4 rounded-lg">
            <span className="text-2xl">+</span>
            <p className="text-base text-gray-300">List property</p>
          </div>
        </div>
      </header>
      <div className="flex gap-3 p-3 border-b border-gray-500 overflow-x-auto">
        {["all", "sale", "rent"].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-lg text-sm border whitespace-nowrap capitalize ${
              aciveFilter === filter
                ? "bg-blue-100 border-blue-500 text-blue-700"
                : "border-gray-300 text-gray-600 bg-white"
            }`}
          >
            {filter === "all"
              ? "All"
              : filter === "sale"
                ? "For Sale"
                : "For Rent"}
          </button>
        ))}
        <div className="w-px bg-gray-500 mx-1"></div>
        {["all", "house", "apartment", "land", "commercial"].map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-4 py-1.5 rounded-lg text-sm border whitespace-nowrap capitalize ${
              typeFilter === type
                ? "bg-blue-100 border-blue-500 text-blue-700"
                : "border-gray-300 text-gray-600 bg-white"
            }`}
          >
            {type === "all" ? "All types" : type}
          </button>
        ))}
      </div>
      <div className="flex">
        <div
          className="w-[70%]"
          id="map"
          ref={mapContainerRef}
          style={{ height: "100vh" }}
        ></div>
        <div className="w-[30%]"></div>
      </div>
    </div>
  );
};

export default Map;
