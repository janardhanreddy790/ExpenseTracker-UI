import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  getSummaryByCategory,
  getTopVendors,
  getTopItems,
} from "../services/api";

// 🎨 Category colors (consistent with Summary + Transactions)
const categoryColors = {
  "Groceries & Essentials": "#10B981", // green
  "Household & Utilities": "#F59E0B", // yellow
  "Shopping & Lifestyle": "#EC4899", // pink
  "Travel & Transport": "#3B82F6", // blue
  "Health & Medical": "#EF4444", // red
  "Bills & Subscriptions": "#8B5CF6", // purple
  "Entertainment & Leisure": "#FB923C", // orange
  "Financial & Services": "#6B7280", // gray
  "Gifts, Festivals & Social": "#6366F1", // indigo
  "Loans": "#94A3B8", // slate
  "Other / Miscellaneous": "#9CA3AF", // gray
};

// 🎨 Generic palette for vendors & items
const palette = [
  "#6366F1", // indigo
  "#F59E0B", // amber
  "#10B981", // emerald
  "#EF4444", // red
  "#8B5CF6", // violet
  "#14B8A6", // teal
  "#FB923C", // orange
  "#3B82F6", // blue
  "#EC4899", // pink
  "#6B7280", // gray
];

// 🛠️ Custom Legend Renderer
function CustomLegend({ payload }) {
  return (
    <ul className="flex flex-wrap gap-4 mt-2 text-sm">
      {payload.map((entry, index) => (
        <li key={index} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          ></span>
          <span className="text-gray-800">{entry.value}</span>
          {entry.payload.total !== undefined && (
            <span className="text-gray-500">— €{entry.payload.total}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function Analytics() {
  const [categoryData, setCategoryData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [itemData, setItemData] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const categories = await getSummaryByCategory();
        setCategoryData(categories || []);

        const vendors = await getTopVendors();
        setVendorData(vendors || []);

        const items = await getTopItems();
        setItemData(items || []);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="p-6 space-y-10 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>

      {/* By Category */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">Expenses by Category</h2>
        {categoryData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label
                >
                  {categoryData.map((entry, index) => {
                    const color =
                      categoryColors[entry.category] ||
                      palette[index % palette.length];
                    return <Cell key={index} fill={color} />;
                  })}
                </Pie>
                <Tooltip />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </>
        ) : (
          <p className="text-gray-500">No data available</p>
        )}
      </div>

      {/* Top Vendors */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">Top Vendors</h2>
        {vendorData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vendorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vendor" />
                <YAxis />
                <Tooltip />
                <Legend content={<CustomLegend />} />
                <Bar dataKey="total">
                  {vendorData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={palette[index % palette.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        ) : (
          <p className="text-gray-500">No data available</p>
        )}
      </div>

      {/* Top Items */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">Top Items</h2>
        {itemData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={itemData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="item" />
                <YAxis />
                <Tooltip />
                <Legend content={<CustomLegend />} />
                <Bar dataKey="total">
                  {itemData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={palette[index % palette.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        ) : (
          <p className="text-gray-500">No data available</p>
        )}
      </div>
    </div>
  );
}
