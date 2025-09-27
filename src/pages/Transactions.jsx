import { useEffect, useState } from "react";
import {
  getPagedTransactions,
  updateTransaction,
  deleteTransaction,
  deleteBulk,
} from "../services/api";

// 🎨 Category color mapping
const categoryColors = {
  "Groceries & Essentials": "bg-green-100 text-green-800",
  "Household & Utilities": "bg-yellow-100 text-yellow-800",
  "Shopping & Lifestyle": "bg-pink-100 text-pink-800",
  "Travel & Transport": "bg-blue-100 text-blue-800",
  "Health & Medical": "bg-red-100 text-red-800",
  "Bills & Subscriptions": "bg-purple-100 text-purple-800",
  "Entertainment & Leisure": "bg-orange-100 text-orange-800",
  "Financial & Services": "bg-gray-200 text-gray-800",
  "Gifts, Festivals & Social": "bg-indigo-100 text-indigo-800",
  "Loans": "bg-slate-200 text-slate-800",
  "Other / Miscellaneous": "bg-gray-100 text-gray-800",
};

export default function Transactions() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [selected, setSelected] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [bulkEdit, setBulkEdit] = useState(false);
  const [bulkForm, setBulkForm] = useState({});
  const [totalPages, setTotalPages] = useState(1);

  // 🔎 Filters
  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");

  useEffect(() => {
    loadData();
  }, [page, size, sortBy, sortDir, keyword, categoryFilter, vendorFilter]);

  async function loadData() {
    const params = new URLSearchParams({
      page,
      size,
      sortBy,
      sortDir,
    });
    if (keyword) params.append("keyword", keyword);
    if (categoryFilter) params.append("category", categoryFilter);
    if (vendorFilter) params.append("vendor", vendorFilter);

    const res = await fetch(
      `${
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
      }/api/transactions/paged?${params.toString()}`
    );
    const json = await res.json();
    setData(json.content || []);
    setTotalPages(json.totalPages || 1);
  }

  function toggleSelect(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function startEdit(tx) {
    setEditingId(tx.id);
    setEditForm({ ...tx });
  }

  async function saveEdit(id) {
    const updated = await updateTransaction(id, editForm);
    setData((prev) =>
      prev.map((row) => (row.id === updated.id ? updated : row))
    );
    setEditingId(null);
    setEditForm({});
  }

  async function handleDelete(id) {
    await deleteTransaction(id);
    setData((prev) => prev.filter((row) => row.id !== id));
  }

  async function handleBulkDelete() {
    await deleteBulk(selected);
    setData((prev) => prev.filter((row) => !selected.includes(row.id)));
    setSelected([]);
  }

  function handleChange(field, value) {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleBulkChange(id, field, value) {
    setBulkForm((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  }

  async function saveBulk() {
    const updates = selected.map((id) => ({ id, ...bulkForm[id] }));

    const res = await fetch(
      `${
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
      }/api/transactions/bulk`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }
    );

    if (!res.ok) throw new Error("Bulk update failed");
    const updated = await res.json();

    setData((prev) =>
      prev.map((row) => updated.find((u) => u.id === row.id) || row)
    );

    setBulkEdit(false);
    setSelected([]);
    setBulkForm({});
  }

  function toggleSort(field) {
    if (sortBy === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Transactions</h1>

      {/* 🔎 Filters */}
      <div className="mb-4 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search by keyword..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(0);
          }}
          className="border px-3 py-2 rounded-lg w-64 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(0);
          }}
          className="border px-3 py-2 rounded-lg shadow-sm"
        >
          <option value="">All Categories</option>
          <option value="Groceries & Essentials">Groceries</option>
          <option value="Household & Utilities">Household</option>
          <option value="Travel & Transport">Transport</option>
          <option value="Health & Medical">Health</option>
          <option value="Entertainment & Leisure">Entertainment</option>
        </select>
        <select
          value={vendorFilter}
          onChange={(e) => {
            setVendorFilter(e.target.value);
            setPage(0);
          }}
          className="border px-3 py-2 rounded-lg shadow-sm"
        >
          <option value="">All Vendors</option>
          <option value="Amazon">Amazon</option>
          <option value="Rewe">Rewe</option>
          <option value="Aldi">Aldi</option>
          <option value="DM">DM</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Bulk Actions */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={handleBulkDelete}
          disabled={!selected.length}
          className="px-3 py-1 bg-red-500 text-white rounded-lg shadow-sm disabled:opacity-50"
        >
          Bulk Delete ({selected.length})
        </button>
        <button
          onClick={() => setBulkEdit(true)}
          disabled={!selected.length}
          className="px-3 py-1 bg-blue-500 text-white rounded-lg shadow-sm disabled:opacity-50"
        >
          Bulk Edit ({selected.length})
        </button>
        {bulkEdit && (
          <button
            onClick={saveBulk}
            className="px-3 py-1 bg-green-500 text-white rounded-lg shadow-sm"
          >
            Save Bulk
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelected(e.target.checked ? data.map((d) => d.id) : [])
                  }
                  checked={selected.length === data.length && data.length > 0}
                />
              </th>
              <th className="p-3 cursor-pointer" onClick={() => toggleSort("date")}>
                Date {sortBy === "date" ? (sortDir === "desc" ? "↓" : "↑") : ""}
              </th>
              <th
                className="p-3 cursor-pointer"
                onClick={() => toggleSort("category")}
              >
                Category{" "}
                {sortBy === "category" ? (sortDir === "desc" ? "↓" : "↑") : ""}
              </th>
              <th className="p-3">Item</th>
              <th
                className="p-3 cursor-pointer"
                onClick={() => toggleSort("amount")}
              >
                Amount {sortBy === "amount" ? (sortDir === "desc" ? "↓" : "↑") : ""}
              </th>
              <th
                className="p-3 cursor-pointer"
                onClick={() => toggleSort("vendor")}
              >
                Vendor {sortBy === "vendor" ? (sortDir === "desc" ? "↓" : "↑") : ""}
              </th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((tx) => {
              const color =
                categoryColors[tx.category] || "bg-gray-100 text-gray-800";
              return (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(tx.id)}
                      onChange={() => toggleSelect(tx.id)}
                    />
                  </td>
                  <td className="p-3">{tx.date}</td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${color}`}
                    >
                      {tx.category}
                    </span>
                  </td>
                  <td className="p-3">{tx.item}</td>
                  <td className="p-3 font-medium">€{tx.amount?.toFixed(2)}</td>
                  <td className="p-3 text-gray-600">{tx.vendor}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => startEdit(tx)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination with Page Size */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPage(0);
            }}
            className="border rounded px-2 py-1"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
