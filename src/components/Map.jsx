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
  const [activeFilter, setActiveFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Filter properties based on active buttons
  const filteredProperties = properties.filter((property) => {
    const statusMatch =
      activeFilter === "all" || property.status === activeFilter;

    const typeMatch = typeFilter === "all" || property.type === typeFilter;

    return statusMatch && typeMatch;
  });

  // Set up the map ONCE when component loads
  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      accessToken: accessToken,
      container: mapContainerRef.current,
      center: [3.3792, 6.5244],
      zoom: 11,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => mapRef.current.remove();
  }, []);

  // Add/update markers when filters or selection changes
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add fresh markers
    filteredProperties.forEach((property) => {
      const el = document.createElement("div");

      const isSelected = selectedProperty?.id === property.id;

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
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${bgColor};
          margin: 2px auto 0;
        "></div>
      `;

      el.addEventListener("click", () => {
        setSelectedProperty(property);
      });

      const marker = new mapboxgl.Marker({
        element: el,
      })
        .setLngLat(property.coordinates)
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });
  }, [filteredProperties, selectedProperty]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      {/* ================= HEADER ================= */}
      <header className="bg-gray-950 border-b border-gray-800">
        <div
          className="
            flex
            flex-col
            gap-4
            p-4
            sm:p-5
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="bg-[#23476c] p-3 rounded-lg shrink-0">
              <Building size={20} />
            </div>

            <div>
              <h1 className="text-lg sm:text-xl text-gray-200 font-bold">
                NaijaHomes
              </h1>

              <p className="text-xs sm:text-sm text-gray-400">
                Find properties across Nigeria
              </p>
            </div>
          </div>

          {/* SEARCH */}
          <div
            className="
              w-full
              sm:w-full
              md:w-[60%]
              lg:w-[45%]
              xl:w-[50%]
              order-3
              lg:order-none
            "
          >
            <input
              placeholder="Search by city, area or property type..."
              className="
                w-full
                py-2
                px-4
                rounded-lg
                outline-none
                border
                border-gray-700
                bg-gray-900
                text-white
                text-sm
                focus:border-blue-600
              "
            />
          </div>

          {/* ACTION BUTTONS */}
          <div
            className="
              flex
              items-center
              gap-2
              w-full
              sm:w-auto
            "
          >
            <button
              className="
                flex
                items-center
                justify-center
                gap-2
                border
                border-gray-600
                py-2
                px-3
                sm:px-4
                rounded-lg
                hover:bg-gray-800
                flex-1
                sm:flex-none
              "
            >
              <SlidersHorizontal size={15} />

              <p className="text-sm text-gray-300">Filters</p>
            </button>

            <button
              className="
                flex
                items-center
                justify-center
                gap-2
                bg-[#23476c]
                py-2
                px-3
                sm:px-4
                rounded-lg
                hover:bg-[#1a3a5e]
                flex-1
                sm:flex-none
              "
            >
              <Plus size={16} />

              <p className="text-sm text-gray-300">List property</p>
            </button>
          </div>
        </div>
      </header>

      {/* ================= FILTERS ================= */}
      <div
        className="
          flex
          gap-2
          p-3
          border-b
          border-gray-800
          overflow-x-auto
          bg-gray-900
          scrollbar-hide
        "
      >
        {/* STATUS FILTERS */}
        {["all", "sale", "rent"].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`
              px-3
              sm:px-4
              py-1.5
              rounded-full
              text-xs
              sm:text-sm
              border
              whitespace-nowrap
              shrink-0
              ${
                activeFilter === filter
                  ? "bg-blue-900 border-blue-500 text-blue-300"
                  : "border-gray-700 text-gray-400 bg-gray-800"
              }
            `}
          >
            {filter === "all"
              ? "All"
              : filter === "sale"
                ? "For Sale"
                : "For Rent"}
          </button>
        ))}

        <div className="w-px bg-gray-700 mx-1 shrink-0" />

        {/* TYPE FILTERS */}
        {["all", "house", "apartment", "land", "commercial"].map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`
              px-3
              sm:px-4
              py-1.5
              rounded-full
              text-xs
              sm:text-sm
              border
              whitespace-nowrap
              shrink-0
              capitalize
              ${
                typeFilter === type
                  ? "bg-blue-900 border-blue-500 text-blue-300"
                  : "border-gray-700 text-gray-400 bg-gray-800"
              }
            `}
          >
            {type === "all" ? "All types" : type}
          </button>
        ))}
      </div>

      {/* ================= MAP + SIDEBAR ================= */}

      <div
        className="
          flex
          flex-col
          lg:flex-row
          flex-1
          min-h-0
        "
      >
        {/* ================= MAP ================= */}

        <div
          className="
            w-full
            lg:w-[70%]
            relative
            h-[55vh]
            sm:h-[60vh]
            lg:h-auto
            lg:min-h-[calc(100vh-150px)]
          "
        >
          {/* RESULT COUNT */}
          <div
            className="
              absolute
              top-3
              left-3
              z-10
              bg-white
              border
              border-gray-200
              rounded-lg
              px-3
              py-1.5
              text-xs
              sm:text-sm
              text-gray-700
              shadow-sm
            "
          >
            Showing{" "}
            <span className="font-semibold text-blue-700">
              {filteredProperties.length}
            </span>{" "}
            <span className="hidden sm:inline">properties</span>
          </div>

          {/* MAP CONTAINER */}
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* ================= SIDEBAR ================= */}

        <div
          className="
            w-full
            lg:w-[30%]
            bg-gray-900
            border-t
            lg:border-t-0
            lg:border-l
            border-gray-800
            flex
            flex-col
            min-h-0
            max-h-[45vh]
            lg:max-h-none
            lg:min-h-[calc(100vh-150px)]
          "
        >
          {/* SIDEBAR HEADER */}
          <div className="p-3 border-b border-gray-800 shrink-0">
            <p className="text-sm font-semibold text-gray-300">
              {filteredProperties.length} properties found
            </p>
          </div>

          {/* PROPERTY LIST */}
          <div
            className="
              flex-1
              overflow-y-auto
              p-3
            "
          >
            {filteredProperties.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-gray-500 text-sm text-center">
                  No properties found.
                  <br />
                  Try another filter.
                </p>
              </div>
            ) : (
              filteredProperties.map((property) => {
                const isSelected = selectedProperty?.id === property.id;

                return (
                  <div
                    key={property.id}
                    onClick={() => setSelectedProperty(property)}
                    className={`
                      border
                      rounded-xl
                      mb-3
                      overflow-hidden
                      cursor-pointer
                      transition-all
                      ${
                        isSelected
                          ? "border-blue-500 shadow-lg"
                          : "border-gray-700 hover:border-gray-600"
                      }
                    `}
                  >
                    {/* IMAGE PLACEHOLDER */}
                    <div
                      className="
                        h-24
                        sm:h-28
                        bg-gradient-to-br
                        from-gray-700
                        to-gray-600
                        flex
                        items-center
                        justify-center
                        relative
                      "
                    >
                      <span className="text-3xl">🏠</span>

                      {/* STATUS */}
                      <span
                        className={`
                          absolute
                          top-2
                          left-2
                          text-xs
                          px-2
                          py-0.5
                          rounded-full
                          font-medium
                          ${
                            property.status === "sale"
                              ? "bg-blue-900 text-blue-300"
                              : "bg-green-900 text-green-300"
                          }
                        `}
                      >
                        {property.status === "sale" ? "For Sale" : "For Rent"}
                      </span>
                    </div>

                    {/* PROPERTY DETAILS */}
                    <div className="p-3">
                      <p className="font-bold text-gray-200">
                        {property.priceLabel}
                      </p>

                      <p className="text-sm text-gray-400 mt-1 truncate">
                        {property.name}
                      </p>

                      <p className="text-xs text-gray-500 mt-0.5">
                        {property.area}
                      </p>

                      {/* PROPERTY FEATURES */}
                      <div
                        className="
                          flex
                          flex-wrap
                          gap-x-3
                          gap-y-1
                          mt-2
                        "
                      >
                        {property.beds > 0 && (
                          <span className="text-xs text-gray-500">
                            🛏 {property.beds} beds
                          </span>
                        )}

                        {property.baths > 0 && (
                          <span className="text-xs text-gray-500">
                            🚿 {property.baths} baths
                          </span>
                        )}

                        <span className="text-xs text-gray-500">
                          📐 {property.size} m²
                        </span>
                      </div>

                      {/* ACTION BUTTONS */}
                      {isSelected && (
                        <div
                          className="
                            flex
                            flex-col
                            sm:flex-row
                            gap-2
                            mt-3
                            pt-3
                            border-t
                            border-gray-700
                          "
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              window.open(`tel:${property.phone}`);
                            }}
                            className="
                              flex-1
                              bg-[#1a3a5e]
                              text-white
                              text-xs
                              py-2
                              rounded-lg
                              hover:bg-[#23476c]
                            "
                          >
                            📞 Contact
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              window.open(
                                `https://www.google.com/maps/dir/?api=1&destination=${property.coordinates[1]},${property.coordinates[0]}`,
                                "_blank",
                              );
                            }}
                            className="
                              flex-1
                              border
                              border-gray-700
                              text-gray-400
                              text-xs
                              py-2
                              rounded-lg
                              hover:bg-gray-800
                            "
                          >
                            🗺 Directions
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
