import { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import properties from "../data/properties";
import { Building, SlidersHorizontal, Plus } from "lucide-react";

const Map = () => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markersRef = useRef([]);
  const accessToken = import.meta.env.VITE_MAPBOX_ACCESSTOKEN;

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all"); // ✅ fixed typo
  const [typeFilter, setTypeFilter] = useState("all");

  // filter properties based on active buttons
  const filteredProperties = properties.filter((property) => {
    // check if status matches — "all" shows everything
    const statusMatch =
      activeFilter === "all" || property.status === activeFilter;

    // check if type matches — "all" shows everything
    const typeMatch =
      typeFilter === "all" || property.type === typeFilter;

    // only show if BOTH match
    return statusMatch && typeMatch;
  });

  // Phase 1 — set up the map ONCE when component loads
  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      accessToken: accessToken,
      container: mapContainerRef.current,
      center: [3.3792, 6.5244], // Lagos
      zoom: 11,
    });

    mapRef.current.addControl(
      new mapboxgl.NavigationControl(),
      "top-right"
    );

    // cleanup when component unmounts
    return () => mapRef.current.remove();
  }, []); // ← empty array means runs ONCE only

  // Phase 2 — add/update markers when filters or selection changes
  useEffect(() => {
    if (!mapRef.current) return;

    // remove all old markers first
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // add fresh markers for filtered properties
    filteredProperties.forEach((property) => {
      const el = document.createElement("div");

      // ✅ consistent ID comparison
      const isSelected = selectedProperty?.id === property.id;

      const bgColor = isSelected
        ? "#E07B39"                    // orange when selected
        : property.status === "rent"
        ? "#1D9E75"                    // green for rent
        : "#1a3a5e";                   // blue for sale

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
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${bgColor};
          margin: 2px auto 0;
        "></div>
      `;

      // when marker is clicked — select that property
      el.addEventListener("click", () => {
        setSelectedProperty(property);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(property.coordinates) // [lng, lat]
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });

  }, [filteredProperties, selectedProperty]); // runs when these change

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">

      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="bg-[#23476c] p-3 rounded-lg">
            <Building size={20} />
          </div>
          <div>
            <h1 className="text-xl text-gray-200 font-bold">NaijaHomes</h1>
            <p className="text-sm text-gray-400">Find properties across Nigeria</p>
          </div>
        </div>

        <div className="w-[50%]">
          <input
            placeholder="Search by city, area or property type..."
            className="w-full py-2 px-4 rounded-lg outline-none border border-gray-700 bg-gray-900 text-white"
          />
        </div>

        <div className="flex items-center gap-3 cursor-pointer">
          <div className="flex items-center gap-2 border border-gray-600 py-2 px-4 rounded-lg hover:bg-gray-800">
            <SlidersHorizontal size={15} />
            <p className="text-sm text-gray-300">Filters</p>
          </div>
          <div className="flex items-center gap-2 bg-[#23476c] py-2 px-4 rounded-lg hover:bg-[#1a3a5e]">
            <Plus size={16} />
            <p className="text-sm text-gray-300">List property</p>
          </div>
        </div>
      </header>

      {/* Filter buttons */}
      <div className="flex gap-2 p-3 border-b border-gray-800 overflow-x-auto bg-gray-900">

        {/* status filters */}
        {["all", "sale", "rent"].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)} // ✅ fixed name
            className={`px-4 py-1.5 rounded-full text-sm border whitespace-nowrap
              ${activeFilter === filter // ✅ fixed name
                ? "bg-blue-900 border-blue-500 text-blue-300"
                : "border-gray-700 text-gray-400 bg-gray-800"
              }`}
          >
            {filter === "all" ? "All" : filter === "sale" ? "For Sale" : "For Rent"}
          </button>
        ))}

        <div className="w-px bg-gray-700 mx-1"></div>

        {/* type filters */}
        {["all", "house", "apartment", "land", "commercial"].map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-4 py-1.5 rounded-full text-sm border whitespace-nowrap capitalize
              ${typeFilter === type
                ? "bg-blue-900 border-blue-500 text-blue-300"
                : "border-gray-700 text-gray-400 bg-gray-800"
              }`}
          >
            {type === "all" ? "All types" : type}
          </button>
        ))}
      </div>

      {/* Map and Sidebar */}
      {/* ✅ fixed height so map is visible */}
      <div className="flex flex-1 overflow-hidden">

        {/* Map area */}
        <div className="flex-1 relative">

          {/* result count on map */}
          <div className="absolute top-3 left-3 z-10 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 shadow-sm">
            Showing{" "}
            <span className="font-semibold text-blue-700">
              {filteredProperties.length} properties
            </span>
          </div>

          {/* ✅ map container with proper height */}
          <div
            ref={mapContainerRef}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col overflow-hidden">

          <div className="p-3 border-b border-gray-800">
            <p className="text-sm font-semibold text-gray-300">
              {filteredProperties.length} properties found
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {filteredProperties.map((property) => {
              const isSelected = selectedProperty?.id === property.id; // ✅ consistent check

              return (
                <div
                  key={property.id}
                  onClick={() => setSelectedProperty(property)}
                  className={`border rounded-xl mb-3 overflow-hidden cursor-pointer transition-all
                    ${isSelected
                      ? "border-blue-500 shadow-lg"
                      : "border-gray-700 hover:border-gray-600"
                    }`}
                >
                  {/* image placeholder */}
                  {/* ✅ fixed gradient class */}
                  <div className="h-24 bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center relative">
                    <span className="text-3xl">🏠</span>
                    <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium
                      ${property.status === "sale"
                        ? "bg-blue-900 text-blue-300"
                        : "bg-green-900 text-green-300"
                      }`}>
                      {property.status === "sale" ? "For Sale" : "For Rent"}
                    </span>
                  </div>

                  <div className="p-3">
                    <p className="font-bold text-gray-200">{property.priceLabel}</p>
                    <p className="text-sm text-gray-400 mt-1">{property.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{property.area}</p>

                    <div className="flex gap-3 mt-2">
                      {property.beds > 0 && (
                        <span className="text-xs text-gray-500">🛏 {property.beds} beds</span>
                      )}
                      {property.baths > 0 && (
                        <span className="text-xs text-gray-500">🚿 {property.baths} baths</span>
                      )}
                      <span className="text-xs text-gray-500">📐 {property.size} m²</span>
                    </div>

                    {isSelected && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-700">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`tel:${property.phone}`);
                          }}
                          className="flex-1 bg-[#1a3a5e] text-white text-xs py-2 rounded-lg hover:bg-[#23476c]"
                        >
                          📞 Contact
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${property.coordinates[1]},${property.coordinates[0]}`,
                              "_blank"
                            );
                          }}
                          className="flex-1 border border-gray-700 text-gray-400 text-xs py-2 rounded-lg hover:bg-gray-800"
                        >
                          🗺 Directions
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;