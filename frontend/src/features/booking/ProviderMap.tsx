import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import type { ProviderProfile } from '@/types'

// Fix default marker icons under bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const userIcon = L.divIcon({
  html: `<div style="background:#e8a33d;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3);"></div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

const PUNE_CENTER: [number, number] = [18.5204, 73.8567]

export function ProviderMap({
  providers,
  userLocation,
}: {
  providers: ProviderProfile[]
  userLocation?: { lat: number; lng: number } | null
}) {
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : providers.length > 0
      ? [providers[0].lat, providers[0].lng]
      : PUNE_CENTER

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={true}
      className="h-full w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User location marker */}
      {userLocation && (
        <>
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="flex flex-col gap-1 text-sm">
                <strong>You are here</strong>
              </div>
            </Popup>
          </Marker>
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={1000}
            pathOptions={{ color: '#e8a33d', fillColor: '#e8a33d', fillOpacity: 0.08, weight: 2, dashArray: '5, 8' }}
          />
        </>
      )}

      {/* Provider markers */}
      {providers.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={defaultIcon}>
          <Popup>
            <div className="flex flex-col gap-1 text-sm">
              <strong>{p.name}</strong>
              <span>
                {p.areaLabel} · ★ {p.rating || 'New'} · ₹{p.hourlyRate}/hr
              </span>
              <Link to={`/providers/${p.id}`} className="text-primary font-medium underline underline-offset-2">
                View profile
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Scroll-to-zoom hint on initial load */}
      {!userLocation && providers.length === 0 && (
        <Popup position={PUNE_CENTER}>
          <span className="text-sm">Pinch or scroll to explore Pune</span>
        </Popup>
      )}
    </MapContainer>
  )
}
