import React from 'react';

const AdminSearchFilter = ({
  searchTerm,
  onSearchChange,
  filters = [],
  onFilterChange,
  placeholder = 'Tìm kiếm...',
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none"
          />
        </div>

        {/* Filters */}
        {filters.map((filter) => (
          <div key={filter.key} className="md:w-48">
            <select
              value={filter.value}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-history-red focus:border-transparent outline-none"
            >
              <option value="">{filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSearchFilter;
