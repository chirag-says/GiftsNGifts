import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdStore, MdEdit, MdSave, MdImage, MdClose } from "react-icons/md";
import { FiSettings, FiCamera } from "react-icons/fi";

function StoreSettings() {
  const [settings, setSettings] = useState({
    storeName: "",
    storeLogo: "",
    storeBanner: "",
    storeDescription: "",
    storeEmail: "",
    storePhone: "",
    storeAddress: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const stoken = localStorage.getItem("stoken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/seller-panel/store/settings`, {
          headers: { stoken }
        });
        if (res.data.success && res.data.data) {
          setSettings(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/seller-panel/store/settings`, settings, {
        headers: { stoken }
      });
      if (res.data.success) {
        setEditing(false);
        alert("Settings saved successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Store Settings</h1>
          <p className="text-sm text-gray-500">Manage your store profile and appearance</p>
        </div>
        <div className="flex gap-3">
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <MdClose /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                <MdSave /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2"
            >
              <MdEdit /> Edit Settings
            </button>
          )}
        </div>
      </div>

      {/* Store Banner & Logo Preview */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div 
          className="h-48 bg-gradient-to-r from-blue-500 to-purple-500 relative"
          style={settings.storeBanner ? { backgroundImage: `url(${settings.storeBanner})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          {editing && (
            <button className="absolute bottom-4 right-4 bg-white/90 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-white">
              <FiCamera /> Change Banner
            </button>
          )}
        </div>
        <div className="p-6 -mt-16 relative">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-32 h-32 bg-white rounded-xl border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
              {settings.storeLogo ? (
                <img src={settings.storeLogo} alt="Store Logo" className="w-full h-full object-cover" />
              ) : (
                <MdStore className="text-5xl text-gray-400" />
              )}
            </div>
            <div className="mt-8 md:mt-12">
              <h2 className="text-2xl font-bold text-gray-800">{settings.storeName || "Your Store Name"}</h2>
              <p className="text-gray-500 mt-1">{settings.storeDescription || "No description yet"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Store Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <MdStore className="text-blue-500" /> Store Information
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
            <input
              type="text"
              name="storeName"
              value={settings.storeName}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
              placeholder="Enter store name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Description</label>
            <textarea
              name="storeDescription"
              value={settings.storeDescription}
              onChange={handleChange}
              disabled={!editing}
              rows="3"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50 resize-none"
              placeholder="Describe your store..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Logo URL</label>
            <input
              type="text"
              name="storeLogo"
              value={settings.storeLogo}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Banner URL</label>
            <input
              type="text"
              name="storeBanner"
              value={settings.storeBanner}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
              placeholder="https://example.com/banner.png"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <FiSettings className="text-purple-500" /> Contact Information
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Email</label>
            <input
              type="email"
              name="storeEmail"
              value={settings.storeEmail}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
              placeholder="store@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Phone</label>
            <input
              type="tel"
              name="storePhone"
              value={settings.storePhone}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
              placeholder="+91 XXXXX XXXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
            <textarea
              name="storeAddress"
              value={settings.storeAddress}
              onChange={handleChange}
              disabled={!editing}
              rows="3"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50 resize-none"
              placeholder="Full store address..."
            />
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Pro Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use a high-quality logo (recommended: 200x200px)</li>
          <li>• Banner images work best at 1200x300px</li>
          <li>• A compelling store description helps attract customers</li>
        </ul>
      </div>
    </div>
  );
}

export default StoreSettings;
