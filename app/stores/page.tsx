'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  Search,
  Store
} from 'lucide-react';

type StoreLocation = {
  id: string;
  name: string;
  area: string;
  address: string;
  phone: string;
  hours: string;
  note: string;
  services: string[];
  mapPosition: { left: string; top: string };
};

const STORES: StoreLocation[] = [
  {
    id: 'uttara',
    name: 'Fabrilife Uttara',
    area: 'Uttara',
    address: 'Sector 7, Uttara, Dhaka',
    phone: '+880 9612 000 000',
    hours: '10:00 AM - 9:00 PM',
    note: 'Open today',
    services: ['Pickup', 'Exchange', 'Trial Room'],
    mapPosition: { left: '66%', top: '21%' }
  },
  {
    id: 'banani',
    name: 'Fabrilife Banani',
    area: 'Banani',
    address: 'Road 11, Banani, Dhaka',
    phone: '+880 9612 000 000',
    hours: '10:00 AM - 9:00 PM',
    note: 'Open today',
    services: ['Pickup', 'Exchange', 'New Arrivals'],
    mapPosition: { left: '53%', top: '49%' }
  },
  {
    id: 'mirpur',
    name: 'Fabrilife Mirpur',
    area: 'Mirpur',
    address: 'Mirpur 10, Dhaka',
    phone: '+880 9612 000 000',
    hours: '10:00 AM - 9:00 PM',
    note: 'Open today',
    services: ['Pickup', 'Exchange', 'Trial Room'],
    mapPosition: { left: '27%', top: '40%' }
  }
];

const AREAS = ['All', ...STORES.map((store) => store.area)];

export default function StoresPage() {
  const [query, setQuery] = useState('');
  const [activeArea, setActiveArea] = useState('All');
  const [selectedStoreId, setSelectedStoreId] = useState(STORES[0].id);
  const [locationMessage, setLocationMessage] = useState('');

  const filteredStores = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return STORES.filter((store) => {
      const matchesArea = activeArea === 'All' || store.area === activeArea;
      const matchesQuery = !normalizedQuery ||
        `${store.name} ${store.area} ${store.address}`.toLowerCase().includes(normalizedQuery);

      return matchesArea && matchesQuery;
    });
  }, [activeArea, query]);

  const selectedStore = STORES.find((store) => store.id === selectedStoreId) ?? STORES[0];

  const selectArea = (area: string) => {
    setActiveArea(area);
    const firstStoreInArea = area === 'All'
      ? STORES[0]
      : STORES.find((store) => store.area === area);

    if (firstStoreInArea) setSelectedStoreId(firstStoreInArea.id);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Location is not supported by this browser.');
      return;
    }

    setLocationMessage('Finding your location...');
    navigator.geolocation.getCurrentPosition(
      () => setLocationMessage('Showing the nearest outlet: Fabrilife Banani'),
      () => setLocationMessage('Please allow location access to find the nearest outlet.')
    );
  };

  return (
    <div className="flex w-full flex-col gap-8 py-4 md:py-7">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-white md:px-12 md:py-14">
        <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-brand-orange/25 blur-3xl" />
        <div className="absolute bottom-0 right-[28%] h-36 w-36 rounded-full bg-amber-400/10 blur-2xl" />
        <div className="relative z-10 grid items-end gap-10 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-brand-orange">
              <span className="h-px w-8 bg-brand-orange" />
              Visit Fabrilife
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
              Find a store <span className="text-brand-orange">near you.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm font-medium leading-6 text-slate-400 md:text-base">
              Explore our collections in person, find your perfect fit, and get help from our in-store team.
            </p>

            <div className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
              <label className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by area or outlet"
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/10 pl-11 pr-4 text-sm font-semibold text-white outline-none backdrop-blur placeholder:text-slate-500 focus:border-brand-orange"
                />
              </label>
              <button
                type="button"
                onClick={useCurrentLocation}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-orange px-5 text-xs font-black uppercase tracking-wider transition hover:bg-orange-600 active:scale-[0.98]"
              >
                <LocateFixed className="h-4 w-4" />
                Use my location
              </button>
            </div>
            {locationMessage && (
              <p className="mt-3 text-xs font-semibold text-slate-300">{locationMessage}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 lg:max-w-sm lg:justify-self-end">
            {[
              ['03', 'Dhaka outlets'],
              ['7 Days', 'Open weekly'],
              ['10 AM', 'Doors open']
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <strong className="block text-xl font-black text-white md:text-2xl">{value}</strong>
                <span className="mt-1 block text-[9px] font-bold uppercase leading-4 tracking-wider text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange">Our outlets</span>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">Choose your closest store</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {AREAS.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => selectArea(area)}
                className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-wider transition ${
                  activeArea === area
                    ? 'border-brand-orange bg-brand-orange text-white shadow-md shadow-orange-200'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-900'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[410px_1fr]">
          <div className="flex max-h-[680px] flex-col border-b border-slate-200 lg:border-b-0 lg:border-r">
            <div className="border-b border-slate-100 p-5">
              <p className="text-xs font-black text-slate-900">
                {filteredStores.length} {filteredStores.length === 1 ? 'store' : 'stores'} found
              </p>
              <p className="mt-1 text-[10px] font-semibold text-slate-400">Select an outlet to view its details on the map.</p>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto p-4">
              {filteredStores.length > 0 ? filteredStores.map((store) => {
                const isSelected = selectedStore.id === store.id;

                return (
                  <article
                    key={store.id}
                    onClick={() => setSelectedStoreId(store.id)}
                    className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                      isSelected
                        ? 'border-brand-orange bg-orange-50/60 shadow-md shadow-orange-100'
                        : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isSelected ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Store className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-black text-slate-950">{store.name}</h3>
                          <span className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {store.note}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{store.address}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-500">
                      <Clock3 className="h-3.5 w-3.5 text-brand-orange" />
                      {store.hours}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {store.services.map((service) => (
                        <span key={service} className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">
                          {service}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 flex gap-2">
                      <a
                        href={`tel:${store.phone.replace(/\s/g, '')}`}
                        onClick={(event) => event.stopPropagation()}
                        className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white text-[10px] font-black uppercase text-slate-700 transition hover:border-slate-400"
                      >
                        <Phone className="h-3.5 w-3.5" /> Call
                      </a>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.name + ' ' + store.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-950 text-[10px] font-black uppercase text-white transition hover:bg-brand-orange"
                      >
                        <Navigation className="h-3.5 w-3.5" /> Directions
                      </a>
                    </div>
                  </article>
                );
              }) : (
                <div className="flex flex-col items-center px-5 py-14 text-center">
                  <MapPin className="h-9 w-9 text-slate-300" />
                  <h3 className="mt-3 text-sm font-black text-slate-800">No outlets found</h3>
                  <p className="mt-1 text-xs text-slate-400">Try another area or search term.</p>
                </div>
              )}
            </div>
          </div>

          <div className="relative min-h-[520px] overflow-hidden bg-[#e8ece9] lg:min-h-[680px]">
            <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(#cfd6d1 1px, transparent 1px), linear-gradient(90deg, #cfd6d1 1px, transparent 1px)', backgroundSize: '46px 46px' }} />
            <div className="absolute -left-20 top-[18%] h-14 w-[125%] rotate-[14deg] border-y-8 border-white/90 bg-slate-300/80 shadow-sm" />
            <div className="absolute -left-16 top-[64%] h-10 w-[120%] -rotate-[8deg] border-y-4 border-white/80 bg-slate-300/70" />
            <div className="absolute -top-14 left-[46%] h-[120%] w-12 rotate-[4deg] border-x-4 border-white/90 bg-slate-300/70" />
            <div className="absolute left-[8%] top-[10%] h-40 w-48 rounded-[45%] bg-emerald-200/70 blur-[1px]" />
            <div className="absolute bottom-[10%] right-[8%] h-32 w-40 rounded-[40%] bg-sky-200/70 blur-[1px]" />

            <span className="absolute left-[12%] top-[35%] text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Mirpur</span>
            <span className="absolute left-[58%] top-[11%] text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Uttara</span>
            <span className="absolute left-[57%] top-[59%] text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Banani</span>

            {filteredStores.map((store) => {
              const isSelected = store.id === selectedStore.id;
              return (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => setSelectedStoreId(store.id)}
                  className={`absolute z-10 -translate-x-1/2 -translate-y-full transition-all ${isSelected ? 'scale-110' : 'hover:scale-105'}`}
                  style={store.mapPosition}
                  aria-label={`Select ${store.name}`}
                >
                  <span className={`flex h-12 w-12 items-center justify-center rounded-full border-4 border-white shadow-xl ${isSelected ? 'bg-brand-orange text-white' : 'bg-slate-950 text-white'}`}>
                    <MapPin className="h-5 w-5 fill-current" />
                  </span>
                  {isSelected && <span className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-2 rotate-45 bg-brand-orange" />}
                </button>
              );
            })}

            <div className="absolute left-5 right-5 top-5 z-20 flex items-start justify-between gap-4">
              <div className="rounded-xl border border-white/80 bg-white/90 px-4 py-3 shadow-lg backdrop-blur">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-orange" />
                  <span className="text-xs font-black text-slate-900">{selectedStore.name}</span>
                </div>
                <p className="mt-1 pl-6 text-[10px] font-semibold text-slate-500">{selectedStore.address}</p>
              </div>
              <div className="rounded-lg border border-white bg-white/90 px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-slate-400 shadow-sm backdrop-blur">
                Store map
              </div>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedStore.name + ' ' + selectedStore.address)}`}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-xl bg-slate-950 px-5 py-3 text-[10px] font-black uppercase tracking-wider text-white shadow-xl transition hover:bg-brand-orange"
            >
              Open in Google Maps <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Try before you buy', 'Check the fabric, fit, and finish before choosing your everyday essentials.'],
          ['Easy store exchange', 'Bring eligible items to an outlet for a quick and convenient size exchange.'],
          ['Friendly style support', 'Our in-store team can help you find the right collection, color, and fit.']
        ].map(([title, description]) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6">
            <CheckCircle2 className="h-6 w-6 text-brand-orange" />
            <h3 className="mt-4 text-sm font-black text-slate-950">{title}</h3>
            <p className="mt-2 text-xs font-medium leading-5 text-slate-500">{description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
