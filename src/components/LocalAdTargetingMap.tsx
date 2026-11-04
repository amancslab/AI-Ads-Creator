import React, { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Plus, Trash2, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { auth, db } from '../lib/firebase.ts';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';

interface TargetLocation {
  id?: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  radiusKm: number;
  badgeLabel: string;
}

const DEFAULT_LOCATIONS: TargetLocation[] = [
  {
    name: 'San Francisco Flagship Studio',
    address: '888 Market St, San Francisco, CA',
    lat: 37.7858,
    lng: -122.4065,
    radiusKm: 15,
    badgeLabel: 'VISIT SAN FRANCISCO FLAGSHIP',
  },
  {
    name: 'New York SoHo Showroom',
    address: '450 Broadway, New York, NY',
    lat: 40.7209,
    lng: -74.0007,
    radiusKm: 25,
    badgeLabel: 'VISIT SOHO STORE • NYC',
  },
  {
    name: 'London Mayfair Boutique',
    address: '14 New Bond St, London, UK',
    lat: 51.5113,
    lng: -0.1432,
    radiusKm: 20,
    badgeLabel: 'MAYFAIR LONDON EXCLUSIVE',
  },
  {
    name: 'Tokyo Ginza Showcase',
    address: '6 Chome Ginza, Chuo City, Tokyo',
    lat: 35.6705,
    lng: 139.7645,
    radiusKm: 30,
    badgeLabel: 'GINZA TOKYO HUB',
  },
];

interface LocalAdTargetingMapProps {
  onApplyLocationBadge: (badge: string) => void;
  activeBadge: string;
}

export const LocalAdTargetingMap: React.FC<LocalAdTargetingMapProps> = ({
  onApplyLocationBadge,
  activeBadge,
}) => {
  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    'AIzaSyCuJgow-qyfGXiyMwlF-W2ro47_77R4Sac';

  const [locations, setLocations] = useState<TargetLocation[]>(DEFAULT_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState<TargetLocation | null>(DEFAULT_LOCATIONS[0]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 37.7858,
    lng: -122.4065,
  });

  // New location form state
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newLat, setNewLat] = useState('37.7749');
  const [newLng, setNewLng] = useState('-122.4194');
  const [newRadius, setNewRadius] = useState('15');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Load locations from Firestore if signed in
  useEffect(() => {
    async function loadCloudLocations() {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const q = query(collection(db, 'locations'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const loaded: TargetLocation[] = [];
          snap.forEach((d) => {
            const data = d.data();
            loaded.push({
              id: d.id,
              name: data.name,
              address: data.address || '',
              lat: Number(data.lat),
              lng: Number(data.lng),
              radiusKm: Number(data.radiusKm) || 15,
              badgeLabel: `VISIT ${data.name.toUpperCase()}`,
            });
          });
          setLocations([...loaded, ...DEFAULT_LOCATIONS]);
        }
      } catch (err) {
        console.warn('Could not load locations from Firestore:', err);
      }
    }
    loadCloudLocations();
  }, []);

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const lat = parseFloat(newLat) || 37.7749;
    const lng = parseFloat(newLng) || -122.4194;
    const radius = parseFloat(newRadius) || 15;
    const badge = `VISIT ${newName.toUpperCase()}`;

    const newLoc: TargetLocation = {
      name: newName,
      address: newAddress || 'Custom Store Location',
      lat,
      lng,
      radiusKm: radius,
      badgeLabel: badge,
    };

    // Save to Firestore if user logged in
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = await addDoc(collection(db, 'locations'), {
          userId: user.uid,
          name: newName,
          address: newAddress,
          lat,
          lng,
          radiusKm: radius,
          createdAt: new Date().toISOString(),
        });
        newLoc.id = docRef.id;
        setSaveStatus('Saved target store location to Firestore cloud!');
        setTimeout(() => setSaveStatus(null), 3000);
      } catch (err) {
        console.error('Failed saving location to Firestore:', err);
      }
    }

    setLocations((prev) => [newLoc, ...prev]);
    setSelectedLocation(newLoc);
    setMapCenter({ lat, lng });
    setNewName('');
    setNewAddress('');
  };

  const handleSelectLocation = (loc: TargetLocation) => {
    setSelectedLocation(loc);
    setMapCenter({ lat: loc.lat, lng: loc.lng });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg">
              <MapPin className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white">
              Google Maps Geo-Targeted Banner Studio
            </h2>
            <span className="bg-sky-500/15 text-sky-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-500/30">
              Interactive Storefronts
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pin storefronts or regional target radiuses to dynamically personalize your display banner ads with local location badges.
          </p>
        </div>

        {saveStatus && (
          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 font-medium">
            {saveStatus}
          </span>
        )}
      </div>

      {/* Main Grid: Map on Left, Locations and Controls on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Google Maps Container */}
        <div className="lg:col-span-2 relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl" style={{ height: '480px' }}>
          <APIProvider apiKey={apiKey}>
            <Map
              center={mapCenter}
              zoom={11}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
              gestureHandling="greedy"
              disableDefaultUI={false}
            >
              {locations.map((loc, idx) => (
                <AdvancedMarker
                  key={loc.id || `${loc.name}-${idx}`}
                  position={{ lat: loc.lat, lng: loc.lng }}
                  onClick={() => setSelectedLocation(loc)}
                >
                  <Pin
                    background={selectedLocation?.name === loc.name ? '#0EA5E9' : '#F59E0B'}
                    glyphColor="#FFFFFF"
                    borderColor="#FFFFFF"
                  />
                </AdvancedMarker>
              ))}

              {selectedLocation && (
                <InfoWindow
                  position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                  onCloseClick={() => setSelectedLocation(null)}
                >
                  <div className="p-1 text-slate-900 max-w-xs font-sans">
                    <h4 className="font-bold text-xs text-sky-600 mb-0.5">
                      {selectedLocation.name}
                    </h4>
                    <p className="text-[11px] text-slate-600 mb-2">
                      {selectedLocation.address}
                    </p>
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200">
                      <span className="text-[10px] font-mono text-slate-500">
                        Target Radius: {selectedLocation.radiusKm} km
                      </span>
                      <button
                        onClick={() => onApplyLocationBadge(selectedLocation.badgeLabel)}
                        className="px-2 py-1 bg-sky-600 text-white rounded text-[10px] font-bold shadow hover:bg-sky-500"
                      >
                        Apply to Banners
                      </button>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        </div>

        {/* Sidebar: Location List & Add Pin */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Configured Target Storefronts ({locations.length})
            </span>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {locations.map((loc) => {
                const isActive = activeBadge === loc.badgeLabel;
                const isSelected = selectedLocation?.name === loc.name;
                return (
                  <div
                    key={loc.name}
                    onClick={() => handleSelectLocation(loc)}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500/60 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="text-xs font-bold truncate">{loc.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                        {loc.address}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onApplyLocationBadge(loc.badgeLabel);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-bold shrink-0 transition-all ${
                        isActive
                          ? 'bg-emerald-500 text-white shadow'
                          : 'bg-slate-800 hover:bg-sky-500 text-slate-300 hover:text-white'
                      }`}
                    >
                      {isActive ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Storefront Pin Form */}
          <form
            onSubmit={handleAddLocation}
            className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3"
          >
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Plus className="w-3.5 h-3.5 text-sky-400" />
              Add Target Store Location
            </span>

            <div>
              <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                Location Name
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Austin Downtown Studio"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                Street Address
              </label>
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="e.g. 500 Congress Ave, Austin, TX"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                  Latitude
                </label>
                <input
                  type="text"
                  value={newLat}
                  onChange={(e) => setNewLat(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                  Longitude
                </label>
                <input
                  type="text"
                  value={newLng}
                  onChange={(e) => setNewLng(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Pin to Map & Firestore</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
