// map-initializer.js - File bantuan untuk memastikan marker selalu muncul

/**
 * Pastikan marker selalu terlihat di peta
 * @param {Object} map - Instansi peta Leaflet
 * @param {Array} position - Array [lat, lng]
 * @param {String} color - Warna marker (default: merah)
 */
export function ensureMarkerVisible(map, position, color = "#e74c3c") {
  if (!map || !position) return null;

  try {
    // Buat multiple layer marker untuk memastikan pasti terlihat

    // 1. Circle marker dasar (pasti terlihat)
    const circleMarker = L.circleMarker(position, {
      radius: 10,
      fillColor: color,
      color: "#fff",
      weight: 3,
      opacity: 1,
      fillOpacity: 1,
      zIndexOffset: 1000,
    }).addTo(map);

    // 2. Marker dengan icon div custom
    const customIcon = L.divIcon({
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
      className: "simple-custom-marker",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const marker = L.marker(position, {
      icon: customIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    // 3. Tambahkan tooltip untuk memastikan terlihat
    marker
      .bindTooltip("Lokasi yang dipilih", {
        permanent: true,
        direction: "top",
        offset: [0, -15],
        className: "marker-tooltip",
      })
      .openTooltip();

    return marker;
  } catch (err) {
    console.error("Error ensuring marker visibility:", err);
    return null;
  }
}
