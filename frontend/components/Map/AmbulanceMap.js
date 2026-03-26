'use client';
/**
 * AmbulanceMap — Leaflet map with ambulance markers, clustering, and route trails.
 * This component is always dynamically imported (no SSR) to avoid window errors.
 */
import { useEffect, useRef, useMemo } from 'react';
import { getStatusColor } from '../../utils/alertUtils';

let L; // Leaflet loaded lazily

const STATUS_COLORS = {
  Critical: '#ef4444',
  Warning:  '#f59e0b',
  Normal:   '#10b981',
};

const createAmbulanceIcon = (status) => {
  const color = STATUS_COLORS[status] || STATUS_COLORS.Normal;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
      <circle cx="20" cy="20" r="18" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="2"/>
      <text x="20" y="27" text-anchor="middle" font-size="20">🚑</text>
    </svg>`;
  return L.divIcon({
    html: `<div style="filter:drop-shadow(0 2px 8px ${color}88)">${svg}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    className: '',
  });
};

export default function AmbulanceMap({ ambulances = [], onMarkerClick, center, zoom = 5 }) {
  const mapRef       = useRef(null);
  const mapInstance  = useRef(null);
  const markersRef   = useRef({});
  const trailsRef    = useRef({});
  const clusterRef   = useRef(null);

  // Initialize map on mount
  useEffect(() => {
    if (typeof window === 'undefined' || mapInstance.current) return;

    const init = async () => {
      L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      await import('leaflet.markercluster/dist/MarkerCluster.css');
      await import('leaflet.markercluster/dist/MarkerCluster.Default.css');
      const { MarkerClusterGroup } = await import('leaflet.markercluster');

      if (!mapRef.current || mapInstance.current) return;

      const defaultCenter = center || [22.5, 80.0];
      const map = L.map(mapRef.current, {
        center: defaultCenter,
        zoom,
        zoomControl: true,
        preferCanvas: true,
      });

      // OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Marker cluster group
      const cluster = new MarkerClusterGroup({
        chunkedLoading: true,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        maxClusterRadius: 60,
      });
      map.addLayer(cluster);

      mapInstance.current = map;
      clusterRef.current  = cluster;
    };

    init().catch(console.error);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markersRef.current  = {};
        trailsRef.current   = {};
      }
    };
  }, []); // eslint-disable-line

  // Update markers when ambulances change
  useEffect(() => {
    if (!mapInstance.current || !L || !clusterRef.current) return;
    const cluster = clusterRef.current;

    ambulances.forEach((amb) => {
      const { ambulance_id, latitude, longitude, latestVitals, patient } = amb;
      if (!latitude || !longitude) return;

      const status = latestVitals?.status || 'Normal';
      const icon   = createAmbulanceIcon(status);
      const latlng = [latitude, longitude];

      if (markersRef.current[ambulance_id]) {
        // Update existing marker position & icon
        markersRef.current[ambulance_id].setLatLng(latlng).setIcon(icon);
      } else {
        // Create new marker
        const marker = L.marker(latlng, { icon });
        marker.bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:180px">
            <h4 style="font-weight:700;margin:0 0 4px">${ambulance_id}</h4>
            <p style="margin:0 0 2px;font-size:12px;opacity:.7">${patient?.name || 'Unknown Patient'}</p>
            <p style="margin:0 0 2px;font-size:12px">HR: <b>${latestVitals?.hr || '--'} bpm</b></p>
            <p style="margin:0 0 2px;font-size:12px">SpO₂: <b>${latestVitals?.spo2 || '--'}%</b></p>
            <p style="margin:0;font-size:12px">Status: <b style="color:${STATUS_COLORS[status]}">${status}</b></p>
          </div>
        `, { maxWidth: 240 });
        marker.on('click', () => onMarkerClick?.(amb));
        cluster.addLayer(marker);
        markersRef.current[ambulance_id] = marker;
      }

      // Update route trail
      const lat = Number(latitude);
      const lng = Number(longitude);
      if (!trailsRef.current[ambulance_id]) {
        trailsRef.current[ambulance_id] = {
          points: [[lat, lng]],
          polyline: L.polyline([[lat, lng]], {
            color: STATUS_COLORS[status],
            weight: 2,
            opacity: 0.5,
            dashArray: '4 4',
          }).addTo(mapInstance.current),
        };
      } else {
        const trail = trailsRef.current[ambulance_id];
        trail.points.push([lat, lng]);
        if (trail.points.length > 30) trail.points.shift();
        trail.polyline.setLatLngs(trail.points);
        trail.polyline.setStyle({ color: STATUS_COLORS[status] });
      }
    });
  }, [ambulances, onMarkerClick]);

  return (
    <div
      ref={mapRef}
      className="w-full rounded-2xl overflow-hidden"
      style={{ height: '100%', minHeight: '400px' }}
    />
  );
}
