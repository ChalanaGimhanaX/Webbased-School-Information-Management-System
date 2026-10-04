import React from 'react';

const DataTable = ({ columns, data = [] }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-outline-variant/30">
      <table className="w-full text-left border-collapse">
        <thead className="bg-surface-container-low/70 border-b border-outline-variant/40">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="py-3 px-4 text-xs font-semibold text-outline uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-surface-container-lowest divide-y divide-outline-variant/20 font-body-sm text-on-surface">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-surface-container-low/60 transition-colors">
              {columns.map((col, colIndex) => (
                <td
                  key={colIndex}
                  className="py-3.5 px-4 text-sm text-on-surface"
                >
                  {col.cell ? col.cell(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="py-10 px-4 text-center text-sm text-outline"
              >
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[28px] opacity-40">folder_open</span>
                  <span>No data available</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
