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

const COLORS = ["#6366F1", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#14B8A6"];

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
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>

      {/* By Category */}
      <div className="bg-white p-4 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">Expenses by Category</h2>
        {categoryData.length > 0 ? (
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
                {categoryData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No data available</p>
        )}
      </div>

      {/* Top Vendors */}
      <div className="bg-white p-4 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">Top Vendors</h2>
        {vendorData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vendorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vendor" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No data available</p>
        )}
      </div>

      {/* Top Items */}
      <div className="bg-white p-4 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">Top Items</h2>
        {itemData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={itemData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="item" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No data available</p>
        )}
      </div>
    </div>
  );
}
