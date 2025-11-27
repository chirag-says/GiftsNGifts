import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdLocalShipping, MdEdit, MdSave, MdClose, MdAdd, MdDelete } from "react-icons/md";
import { FiTruck, FiMapPin, FiPackage } from "react-icons/fi";

function ShippingSettings() {
  const [settings, setSettings] = useState({
    freeShippingThreshold: 0,
    defaultShippingCost: 0,
    expressShippingCost: 0,
    processingTime: "1-2",
    shippingZones: [],
    packagingIncluded: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const stoken = localStorage.getItem("stoken");

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/seller-panel/shipping/settings`, {
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
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/seller-panel/shipping/settings`, settings, {
        headers: { stoken }
      });
      if (res.data.success) {
        setEditing(false);
        alert("Shipping settings saved!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSettings(prev => ({ ...prev, [e.target.name]: value }));
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
          <h1 className="text-2xl font-bold text-gray-800">Shipping Settings</h1>
          <p className="text-sm text-gray-500">Configure your shipping options and rates</p>
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-5 text-white">
          <FiTruck className="text-2xl mb-2 opacity-80" />
          <p className="text-sm opacity-90">Free Shipping Above</p>
          <h3 className="text-2xl font-bold">{formatINR(settings.freeShippingThreshold)}</h3>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Standard Shipping</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{formatINR(settings.defaultShippingCost)}</h3>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Express Shipping</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{formatINR(settings.expressShippingCost)}</h3>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Processing Time</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{settings.processingTime} days</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <FiTruck className="text-blue-500" /> Shipping Rates
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold (₹)</label>
            <input
              type="number"
              name="freeShippingThreshold"
              value={settings.freeShippingThreshold}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
              placeholder="e.g., 500"
            />
            <p className="text-xs text-gray-500 mt-1">Set to 0 to disable free shipping</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Standard Shipping Cost (₹)</label>
            <input
              type="number"
              name="defaultShippingCost"
              value={settings.defaultShippingCost}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
              placeholder="e.g., 50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Express Shipping Cost (₹)</label>
            <input
              type="number"
              name="expressShippingCost"
              value={settings.expressShippingCost}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
              placeholder="e.g., 100"
            />
          </div>
        </div>

        {/* Processing & Handling */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <FiPackage className="text-purple-500" /> Processing & Handling
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Processing Time</label>
            <select
              name="processingTime"
              value={settings.processingTime}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
            >
              <option value="same-day">Same Day</option>
              <option value="1">1 Day</option>
              <option value="1-2">1-2 Days</option>
              <option value="2-3">2-3 Days</option>
              <option value="3-5">3-5 Days</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Time to pack and hand over to courier</p>
          </div>

          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              name="packagingIncluded"
              checked={settings.packagingIncluded}
              onChange={handleChange}
              disabled={!editing}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <div>
              <p className="font-medium text-gray-800">Gift Packaging Available</p>
              <p className="text-sm text-gray-500">Offer gift wrapping option to customers</p>
            </div>
          </label>

          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-700">
              💡 <strong>Tip:</strong> Faster processing times lead to better customer reviews!
            </p>
          </div>
        </div>
      </div>

      {/* Shipping Zones */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <FiMapPin className="text-red-500" /> Shipping Zones
          </h3>
          {editing && (
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1">
              <MdAdd /> Add Zone
            </button>
          )}
        </div>

        {settings.shippingZones?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiMapPin className="text-4xl mx-auto mb-2 opacity-50" />
            <p>No shipping zones configured</p>
            <p className="text-sm">Default shipping rates will apply to all locations</p>
          </div>
        ) : (
          <div className="space-y-3">
            {settings.shippingZones?.map((zone, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800">{zone.name}</p>
                  <p className="text-sm text-gray-500">{zone.states?.join(", ")}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">{formatINR(zone.rate)}</p>
                    <p className="text-xs text-gray-500">{zone.deliveryDays} days delivery</p>
                  </div>
                  {editing && (
                    <button className="p-2 text-red-500 hover:bg-red-100 rounded-lg">
                      <MdDelete />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-5">
        <h4 className="font-semibold text-green-800 mb-2">🚚 Shipping Best Practices</h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Offer free shipping above a threshold to increase average order value</li>
          <li>• Clearly communicate processing and delivery times</li>
          <li>• Consider offering express shipping for last-minute gift orders</li>
          <li>• Factor in packaging costs when setting shipping rates</li>
        </ul>
      </div>
    </div>
  );
}

export default ShippingSettings;
