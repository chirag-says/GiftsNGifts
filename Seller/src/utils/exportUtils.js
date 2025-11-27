/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file (without extension)
 * @param {Array} columns - Array of { key, header } objects defining columns
 */
export const exportToCSV = (data, filename, columns) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Create header row
  const headers = columns.map(col => col.header).join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return columns.map(col => {
      let value = col.getValue ? col.getValue(item) : item[col.key];
      
      // Handle null/undefined
      if (value === null || value === undefined) value = '';
      
      // Convert to string and escape quotes
      value = String(value).replace(/"/g, '""');
      
      // Wrap in quotes if contains comma, newline, or quotes
      if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        value = `"${value}"`;
      }
      
      return value;
    }).join(',');
  });

  // Combine headers and rows
  const csv = [headers, ...rows].join('\n');
  
  // Create and download file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data to Excel-compatible CSV (with BOM for proper UTF-8)
 */
export const exportToExcel = (data, filename, columns) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Create header row
  const headers = columns.map(col => col.header).join('\t');
  
  // Create data rows (tab-separated for Excel)
  const rows = data.map(item => {
    return columns.map(col => {
      let value = col.getValue ? col.getValue(item) : item[col.key];
      
      // Handle null/undefined
      if (value === null || value === undefined) value = '';
      
      // Convert to string
      value = String(value);
      
      return value;
    }).join('\t');
  });

  // Combine headers and rows
  const content = [headers, ...rows].join('\n');
  
  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.xls`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Order export columns configuration
export const ORDER_EXPORT_COLUMNS = [
  { key: 'orderId', header: 'Order ID', getValue: (o) => o._id },
  { key: 'customer', header: 'Customer Name', getValue: (o) => o.shippingAddress?.name || '' },
  { key: 'email', header: 'Email', getValue: (o) => o.user?.email || '' },
  { key: 'phone', header: 'Phone', getValue: (o) => o.shippingAddress?.phone || '' },
  { key: 'address', header: 'Address', getValue: (o) => o.shippingAddress?.address || '' },
  { key: 'city', header: 'City', getValue: (o) => o.shippingAddress?.city || '' },
  { key: 'pincode', header: 'Pincode', getValue: (o) => o.shippingAddress?.pin || '' },
  { key: 'totalAmount', header: 'Total Amount', getValue: (o) => o.totalAmount || 0 },
  { key: 'status', header: 'Status', getValue: (o) => o.status || 'Pending' },
  { key: 'paymentId', header: 'Payment ID', getValue: (o) => o.paymentId || '' },
  { key: 'placedAt', header: 'Order Date', getValue: (o) => o.placedAt ? new Date(o.placedAt).toLocaleDateString('en-IN') : '' },
  { key: 'items', header: 'Items Count', getValue: (o) => o.items?.length || 0 },
];

// Dashboard stats export columns
export const DASHBOARD_STATS_COLUMNS = [
  { key: 'period', header: 'Period' },
  { key: 'orders', header: 'Total Orders' },
  { key: 'revenue', header: 'Revenue' },
];

// Recent orders export columns (simplified)
export const RECENT_ORDERS_COLUMNS = [
  { key: 'orderId', header: 'Order ID', getValue: (o) => o._id?.slice(-8).toUpperCase() },
  { key: 'customer', header: 'Customer', getValue: (o) => o.shippingAddress?.name || '' },
  { key: 'amount', header: 'Amount', getValue: (o) => o.totalAmount || 0 },
  { key: 'status', header: 'Status', getValue: (o) => o.status || 'Pending' },
  { key: 'date', header: 'Date', getValue: (o) => o.placedAt ? new Date(o.placedAt).toLocaleDateString('en-IN') : '' },
];
