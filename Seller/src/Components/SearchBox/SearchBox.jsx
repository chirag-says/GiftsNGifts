// SearchBox.jsx
import React from 'react';
import { IoSearch } from "react-icons/io5";

function SearchBox({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm hover:border-blue-400 transition-all">
        <IoSearch className="text-gray-500 text-[18px]" />
        <input
          type="text"
          className="w-full text-sm text-gray-700 focus:outline-none"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export default SearchBox;
