import React, { useState } from "react";
import { useRef, useEffect } from "react";
import * as mapboxgl from "mapbox-gl/esm";
import "mapbox-gl/dist/mapbox-gl.css";
import properties from "../data/properties";

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

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-left");

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

  return <div id="map" ref={mapContainerRef} style={{ height: "100vh" }}></div>;
};

export default Map;
