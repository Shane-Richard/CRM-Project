import React from 'react';
import { ChevronRight, ChevronLeft, MoreHorizontal } from 'lucide-react';

/**
 * Generic DataTable Component
 * 
 * Props:
 * - columns: Array of objects defining columns structure [{ key: 'id', title: 'ID', render: (row) => ... }]
 * - data: Array of data objects to display
 * - isLoading: Boolean to show loading state
 * - onRowClick: Function to handle row clicks
 */
const DataTable = ({ 
  columns = [], 
  data = [], 
  isLoading = false,
  onRowClick 
}) => {
  
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-white rounded-lg border border-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="w-full p-8 text-center bg-white rounded-lg border border-gray-100">
        <p className="text-gray-500">No data available to display.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.title}
                </th>
              ))}
              {/* Optional Actions Column Placeholder if needed */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr 
                key={row.id || rowIndex} 
                onClick={() => onRowClick && onRowClick(row)}
                className={`group hover:bg-surface transition-colors duration-150 cursor-pointer ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((column, colIndex) => (
                  <td 
                    key={`${row.id || rowIndex}-${column.key || colIndex}`} 
                    className="px-6 py-4 whitespace-nowrap text-sm text-text"
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer Placeholder */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(data.length, 10)}</span> of <span className="font-medium">{data.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
