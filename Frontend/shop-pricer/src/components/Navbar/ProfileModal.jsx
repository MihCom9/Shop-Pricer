import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { MapPin, Search, Star, X } from "lucide-react";

export default function ProfileModal({ user, profile, onClose, onSave }) {
  const [displayName, setDisplayName] = useState(
    profile?.display_name || user?.user_metadata?.full_name || ""
  );

  // Region (city)
  const [citySearch, setCitySearch] = useState("");
  const [cityResults, setCityResults] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);

  // Preferred stores
  const [storeSearch, setStoreSearch] = useState("");
  const [storeResults, setStoreResults] = useState([]);
  const [preferredStores, setPreferredStores] = useState([]);

  const [saving, setSaving] = useState(false);

  // Load current city on open
  useEffect(() => {
    if (!profile?.city_ekatte) return;
    supabase.from("cities")
      .select("ekatte, name_bg, type, oblast")
      .eq("ekatte", profile.city_ekatte)
      .single()
      .then(({ data }) => { if (data) setSelectedCity(data); });
  }, []);

  // Load current preferred stores on open
  useEffect(() => {
    supabase.from("profile_stores")
      .select("store_id, stores(id, location)")
      .eq("profile_id", user.id)
      .then(({ data }) => {
        if (data) setPreferredStores(data.map(r => r.stores).filter(Boolean));
      });
  }, []);

  // Search cities
  useEffect(() => {
    if (citySearch.length < 2) { setCityResults([]); return; }
    supabase.from("cities")
      .select("ekatte, name_bg, type, oblast")
      .ilike("name_bg", `%${citySearch}%`)
      .order("name_bg").limit(20)
      .then(({ data }) => setCityResults(data ?? []));
  }, [citySearch]);

  // Search stores
  useEffect(() => {
    if (storeSearch.length < 2) { setStoreResults([]); return; }
    supabase.from("stores")
      .select("id, location")
      .ilike("location", `%${storeSearch}%`)
      .limit(10)
      .then(({ data }) => setCityResults([])||setStoreResults(data ?? []));
  }, [storeSearch]);

  const addStore = (store) => {
    if (!preferredStores.find(s => s.id === store.id))
      setPreferredStores(prev => [...prev, store]);
    setStoreResults([]);
    setStoreSearch("");
  };

  const removeStore = (id) =>
    setPreferredStores(prev => prev.filter(s => s.id !== id));

  const handleSave = async () => {
    setSaving(true);
    const { data, error } = await supabase.from("profiles")
      .upsert({ id: user.id, display_name: displayName.trim() || null, city_ekatte: selectedCity?.ekatte ?? null })
      .select("display_name, city_ekatte").single();

    if (!error) {
      // Sync junction table: delete existing, re-insert
      await supabase.from("profile_stores").delete().eq("profile_id", user.id);
      if (preferredStores.length > 0) {
        await supabase.from("profile_stores").insert(
          preferredStores.map(s => ({ profile_id: user.id, store_id: s.id }))
        );
      }
      onSave(data);
      onClose();
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Display name */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Display Name</label>
          <input
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>

        {/* Region */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Region</label>
          {selectedCity && (
            <div className="flex items-center gap-2 mb-2 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
              <MapPin size={12} className="text-stone-400 flex-shrink-0" />
              <span className="text-xs text-stone-700 font-medium">{selectedCity.type} {selectedCity.name_bg}</span>
              <span className="text-xs text-stone-400 ml-auto">{selectedCity.oblast}</span>
              <button onClick={() => { setSelectedCity(null); setCitySearch(""); }} className="text-stone-300 hover:text-red-400 transition-colors ml-1 flex-shrink-0">
                <X size={11} />
              </button>
            </div>
          )}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            <input
              value={citySearch}
              onChange={e => setCitySearch(e.target.value)}
              placeholder="Search settlement…"
              className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>
          {cityResults.length > 0 && (
            <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden max-h-36 overflow-y-auto">
              {cityResults.map(c => (
                <button key={c.ekatte} onClick={() => { setSelectedCity(c); setCityResults([]); setCitySearch(""); }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 text-left">
                  <span className="text-gray-700">{c.type} <span className="font-medium">{c.name_bg}</span></span>
                  <span className="text-gray-400 flex-shrink-0 ml-2">{c.oblast}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Preferred stores */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Preferred Stores</label>

          {/* Selected store chips */}
          {preferredStores.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {preferredStores.map(s => (
                <span key={s.id} className="flex items-center gap-1 bg-stone-100 text-stone-700 text-xs rounded-full px-2.5 py-1 max-w-[200px]">
                  <Star size={10} className="text-stone-400 flex-shrink-0" />
                  <span className="truncate">{s.location}</span>
                  <button onClick={() => removeStore(s.id)} className="text-stone-300 hover:text-red-400 transition-colors ml-0.5 flex-shrink-0">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            <input
              value={storeSearch}
              onChange={e => setStoreSearch(e.target.value)}
              placeholder="Search by city or chain…"
              className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>
          {storeResults.length > 0 && (
            <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden max-h-36 overflow-y-auto">
              {storeResults.map(s => (
                <button key={s.id} onClick={() => addStore(s)}
                  className="w-full flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 text-left">
                  <Star size={11} className="text-stone-300 mr-2 flex-shrink-0" />
                  <span className="truncate">{s.location}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border border-gray-200 rounded-lg py-2 text-xs font-medium text-gray-600 hover:border-gray-400 transition-all">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 bg-stone-800 hover:bg-stone-700 disabled:bg-stone-300 text-white rounded-lg py-2 text-xs font-medium transition-all">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
