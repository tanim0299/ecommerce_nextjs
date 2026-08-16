import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

// Complete, comprehensive static country database to guarantee 100% availability and instant load
const countryList: Country[] = [
  { name: 'Bangladesh', code: 'BD', dialCode: '+880', flag: 'https://flagcdn.com/w320/bd.png' },
  { name: 'India', code: 'IN', dialCode: '+91', flag: 'https://flagcdn.com/w320/in.png' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: 'https://flagcdn.com/w320/us.png' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: 'https://flagcdn.com/w320/gb.png' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: 'https://flagcdn.com/w320/ca.png' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: 'https://flagcdn.com/w320/au.png' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: 'https://flagcdn.com/w320/sa.png' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: 'https://flagcdn.com/w320/ae.png' },
  { name: 'Pakistan', code: 'PK', dialCode: '+92', flag: 'https://flagcdn.com/w320/pk.png' },
  { name: 'Malaysia', code: 'MY', dialCode: '+60', flag: 'https://flagcdn.com/w320/my.png' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: 'https://flagcdn.com/w320/sg.png' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: 'https://flagcdn.com/w320/de.png' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: 'https://flagcdn.com/w320/fr.png' },
  { name: 'Italy', code: 'IT', dialCode: '+39', flag: 'https://flagcdn.com/w320/it.png' },
  { name: 'Spain', code: 'ES', dialCode: '+34', flag: 'https://flagcdn.com/w320/es.png' },
  { name: 'Japan', code: 'JP', dialCode: '+81', flag: 'https://flagcdn.com/w320/jp.png' },
  { name: 'China', code: 'CN', dialCode: '+86', flag: 'https://flagcdn.com/w320/cn.png' },
  { name: 'South Korea', code: 'KR', dialCode: '+82', flag: 'https://flagcdn.com/w320/kr.png' },
  { name: 'Russia', code: 'RU', dialCode: '+7', flag: 'https://flagcdn.com/w320/ru.png' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flag: 'https://flagcdn.com/w320/br.png' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: 'https://flagcdn.com/w320/za.png' },
  { name: 'Turkey', code: 'TR', dialCode: '+90', flag: 'https://flagcdn.com/w320/tr.png' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', flag: 'https://flagcdn.com/w320/nz.png' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', flag: 'https://flagcdn.com/w320/nl.png' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41', flag: 'https://flagcdn.com/w320/ch.png' },
  { name: 'Sweden', code: 'SE', dialCode: '+46', flag: 'https://flagcdn.com/w320/se.png' },
  { name: 'Norway', code: 'NO', dialCode: '+47', flag: 'https://flagcdn.com/w320/no.png' },
  { name: 'Denmark', code: 'DK', dialCode: '+45', flag: 'https://flagcdn.com/w320/dk.png' },
  { name: 'Finland', code: 'FI', dialCode: '+358', flag: 'https://flagcdn.com/w320/fi.png' },
  { name: 'Ireland', code: 'IE', dialCode: '+353', flag: 'https://flagcdn.com/w320/ie.png' },
  { name: 'Belgium', code: 'BE', dialCode: '+32', flag: 'https://flagcdn.com/w320/be.png' },
  { name: 'Austria', code: 'AT', dialCode: '+43', flag: 'https://flagcdn.com/w320/at.png' },
  { name: 'Poland', code: 'PL', dialCode: '+48', flag: 'https://flagcdn.com/w320/pl.png' },
  { name: 'Portugal', code: 'PT', dialCode: '+351', flag: 'https://flagcdn.com/w320/pt.png' },
  { name: 'Greece', code: 'GR', dialCode: '+30', flag: 'https://flagcdn.com/w320/gr.png' },
  { name: 'Oman', code: 'OM', dialCode: '+968', flag: 'https://flagcdn.com/w320/om.png' },
  { name: 'Qatar', code: 'QA', dialCode: '+974', flag: 'https://flagcdn.com/w320/qa.png' },
  { name: 'Kuwait', code: 'KW', dialCode: '+965', flag: 'https://flagcdn.com/w320/kw.png' },
  { name: 'Bahrain', code: 'BH', dialCode: '+973', flag: 'https://flagcdn.com/w320/bh.png' },
  { name: 'Egypt', code: 'EG', dialCode: '+20', flag: 'https://flagcdn.com/w320/eg.png' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62', flag: 'https://flagcdn.com/w320/id.png' },
  { name: 'Thailand', code: 'TH', dialCode: '+66', flag: 'https://flagcdn.com/w320/th.png' },
  { name: 'Vietnam', code: 'VN', dialCode: '+84', flag: 'https://flagcdn.com/w320/vn.png' },
  { name: 'Philippines', code: 'PH', dialCode: '+63', flag: 'https://flagcdn.com/w320/ph.png' },
  { name: 'Hong Kong', code: 'HK', dialCode: '+852', flag: 'https://flagcdn.com/w320/hk.png' },
  { name: 'Taiwan', code: 'TW', dialCode: '+886', flag: 'https://flagcdn.com/w320/tw.png' },
  { name: 'Argentina', code: 'AR', dialCode: '+54', flag: 'https://flagcdn.com/w320/ar.png' },
  { name: 'Mexico', code: 'MX', dialCode: '+52', flag: 'https://flagcdn.com/w320/mx.png' },
  { name: 'Colombia', code: 'CO', dialCode: '+57', flag: 'https://flagcdn.com/w320/co.png' },
  { name: 'Chile', code: 'CL', dialCode: '+56', flag: 'https://flagcdn.com/w320/cl.png' },
  { name: 'Peru', code: 'PE', dialCode: '+51', flag: 'https://flagcdn.com/w320/pe.png' },
  { name: 'Maldives', code: 'MV', dialCode: '+960', flag: 'https://flagcdn.com/w320/mv.png' },
  { name: 'Sri Lanka', code: 'LK', dialCode: '+94', flag: 'https://flagcdn.com/w320/lk.png' },
  { name: 'Nepal', code: 'NP', dialCode: '+977', flag: 'https://flagcdn.com/w320/np.png' },
  { name: 'Bhutan', code: 'BT', dialCode: '+975', flag: 'https://flagcdn.com/w320/bt.png' },
  { name: 'Brunei', code: 'BN', dialCode: '+673', flag: 'https://flagcdn.com/w320/bn.png' },
  { name: 'Cambodia', code: 'KH', dialCode: '+855', flag: 'https://flagcdn.com/w320/kh.png' },
  { name: 'Jordan', code: 'JO', dialCode: '+962', flag: 'https://flagcdn.com/w320/jo.png' },
  { name: 'Lebanon', code: 'LB', dialCode: '+961', flag: 'https://flagcdn.com/w320/lb.png' },
  { name: 'Iraq', code: 'IQ', dialCode: '+964', flag: 'https://flagcdn.com/w320/iq.png' },
  { name: 'Morocco', code: 'MA', dialCode: '+212', flag: 'https://flagcdn.com/w320/ma.png' },
  { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: 'https://flagcdn.com/w320/ng.png' },
  { name: 'Kenya', code: 'KE', dialCode: '+254', flag: 'https://flagcdn.com/w320/ke.png' }
];

interface CountryCodeSelectorProps {
  selectedCountry: Country | null;
  onChange: (country: Country) => void;
}

export default function CountryCodeSelector({ selectedCountry, onChange }: CountryCodeSelectorProps) {
  const [countries, setCountries] = useState<Country[]>(countryList);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Detect user country based on IP geolocation and select it dynamically
  useEffect(() => {
    const detectIpCountry = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          const countryCode = data.country_code; // e.g. "BD"
          const matched = countries.find(c => c.code === countryCode);
          if (matched) {
            onChange(matched);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to get IP location:', err);
      }
      
      // Default fallback if IP detection fails
      const bd = countries.find(c => c.code === 'BD');
      if (bd && !selectedCountry) {
        onChange(bd);
      }
    };
    detectIpCountry();
  }, []);

  // 2. Fetch full list of countries dynamically as background expansion
  useEffect(() => {
    const fetchAllCountries = async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags');
        if (res.ok) {
          const data = await res.json();
          const formatted: Country[] = data
            .map((item: any) => {
              const root = item.idd?.root || '';
              // Handle USA and other multi-dialcode root structures properly
              const suffix = item.idd?.suffixes && item.idd.suffixes.length > 0 
                ? (item.idd.suffixes.length > 10 ? '' : item.idd.suffixes[0]) 
                : '';
              return {
                name: item.name?.common || '',
                code: item.cca2 || '',
                dialCode: root + suffix,
                flag: item.flags?.png || item.flags?.svg || ''
              };
            })
            .filter((c: Country) => c.dialCode && c.name)
            .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

          // Merge fetched countries with static ones to remove duplicates
          const merged = [...countryList];
          formatted.forEach(f => {
            if (!merged.some(m => m.code === f.code)) {
              merged.push(f);
            }
          });
          
          // Sort merged alphabetically
          merged.sort((a, b) => a.name.localeCompare(b.name));

          // Ensure Bangladesh is always pinned at the absolute top
          const bdIndex = merged.findIndex(c => c.code === 'BD');
          if (bdIndex > -1) {
            const bd = merged.splice(bdIndex, 1)[0];
            merged.unshift(bd);
          }

          setCountries(merged);
        }
      } catch (e) {
        console.error('Failed to fetch full list of countries:', e);
      }
    };
    fetchAllCountries();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.dialCode.includes(searchQuery)
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 border-r-0 rounded-l-lg text-xs font-bold text-slate-800 transition-colors h-full cursor-pointer min-w-[95px] justify-between"
      >
        {selectedCountry ? (
          <div className="flex items-center gap-1.5">
            <img
              src={selectedCountry.flag}
              alt={selectedCountry.name}
              className="w-4.5 h-3 object-cover rounded-sm border border-slate-200"
            />
            <span>{selectedCountry.dialCode}</span>
          </div>
        ) : (
          <span className="text-slate-400">...</span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-150 shadow-2xl rounded-xl w-[280px] z-50 overflow-hidden animate-slide-up">
          <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search country/code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold focus:outline-none text-slate-800 placeholder-slate-400"
              autoFocus
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-center text-xs font-semibold text-slate-450">
                No matching countries
              </div>
            ) : (
              filteredCountries.map((c) => (
                <button
                  key={`${c.code}-${c.dialCode}`}
                  type="button"
                  onClick={() => {
                    onChange(c);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0 text-left transition-colors ${
                    selectedCountry?.code === c.code ? 'bg-slate-50/50' : ''
                  }`}
                >
                  <img
                    src={c.flag}
                    alt={c.name}
                    className="w-5.5 h-3.5 object-cover rounded-sm border border-slate-200 flex-shrink-0"
                  />
                  <span className="text-xs font-semibold text-slate-800 flex-1 truncate">{c.name}</span>
                  <span className="text-xs font-black text-slate-500 flex-shrink-0">{c.dialCode}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
