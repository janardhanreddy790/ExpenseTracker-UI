import { useEffect, useState } from "react";
import {
  getPagedTransactions,
  updateTransaction,
  deleteTransaction,
  deleteBulk,
} from "../services/api";

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
    // Build query params for filters
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>

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
          className="border px-3 py-2 rounded w-64"
        />
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(0);
          }}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Categories</option>
          <option value="Groceries">Groceries</option>
          <option value="Household">Household</option>
          <option value="Transport">Transport</option>
          <option value="Health">Health</option>
          <option value="Entertainment">Entertainment</option>
        </select>
        <select
          value={vendorFilter}
          onChange={(e) => {
            setVendorFilter(e.target.value);
            setPage(0);
          }}
          className="border px-3 py-2 rounded"
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
          className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-50"
        >
          Bulk Delete ({selected.length})
        </button>
        <button
          onClick={() => setBulkEdit(true)}
          disabled={!selected.length}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Bulk Edit ({selected.length})
        </button>
        {bulkEdit && (
          <button
            onClick={saveBulk}
            className="px-3 py-1 bg-green-500 text-white rounded"
          >
            Save Bulk
          </button>
        )}
      </div>

      {/* Table */}
      <table className="min-w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">
              <input
                type="checkbox"
                onChange={(e) =>
                  setSelected(e.target.checked ? data.map((d) => d.id) : [])
                }
                checked={selected.length === data.length && data.length > 0}
              />
            </th>
            <th className="p-2 cursor-pointer" onClick={() => toggleSort("date")}>
              Date {sortBy === "date" ? (sortDir === "desc" ? "↓" : "↑") : ""}
            </th>
            <th
              className="p-2 cursor-pointer"
              onClick={() => toggleSort("category")}
            >
              Category{" "}
              {sortBy === "category" ? (sortDir === "desc" ? "↓" : "↑") : ""}
            </th>
            <th className="p-2">Item</th>
            <th
              className="p-2 cursor-pointer"
              onClick={() => toggleSort("amount")}
            >
              Amount {sortBy === "amount" ? (sortDir === "desc" ? "↓" : "↑") : ""}
            </th>
            <th
              className="p-2 cursor-pointer"
              onClick={() => toggleSort("vendor")}
            >
              Vendor {sortBy === "vendor" ? (sortDir === "desc" ? "↓" : "↑") : ""}
            </th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((tx) => (
            <tr key={tx.id} className="border-b">
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={selected.includes(tx.id)}
                  onChange={() => toggleSelect(tx.id)}
                />
              </td>

              {bulkEdit && selected.includes(tx.id) ? (
                <>
                  <td className="p-2">{tx.date}</td>
                  <td className="p-2">
                    <input
                      type="text"
                      defaultValue={tx.category}
                      onChange={(e) =>
                        handleBulkChange(tx.id, "category", e.target.value)
                      }
                      className="border rounded px-2 py-1"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      defaultValue={tx.item}
                      onChange={(e) =>
                        handleBulkChange(tx.id, "item", e.target.value)
                      }
                      className="border rounded px-2 py-1"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      defaultValue={tx.amount}
                      onChange={(e) =>
                        handleBulkChange(tx.id, "amount", e.target.value)
                      }
                      className="border rounded px-2 py-1"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      defaultValue={tx.vendor}
                      onChange={(e) =>
                        handleBulkChange(tx.id, "vendor", e.target.value)
                      }
                      className="border rounded px-2 py-1"
                    />
                  </td>
                  <td className="p-2 text-gray-500">Bulk Editing</td>
                </>
              ) : editingId === tx.id ? (
                <>
                  <td className="p-2">
                    <input
                      type="date"
                      value={editForm.date || ""}
                      onChange={(e) => handleChange("date", e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={editForm.category || ""}
                      onChange={(e) => handleChange("category", e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={editForm.item || ""}
                      onChange={(e) => handleChange("item", e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={editForm.amount || ""}
                      onChange={(e) => handleChange("amount", e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={editForm.vendor || ""}
                      onChange={(e) => handleChange("vendor", e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => saveEdit(tx.id)}
                      className="text-green-600 mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-gray-600"
                    >
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="p-2">{tx.date}</td>
                  <td className="p-2">{tx.category}</td>
                  <td className="p-2">{tx.item}</td>
                  <td className="p-2">€{tx.amount?.toFixed(2)}</td>
                  <td className="p-2">{tx.vendor}</td>
                  <td className="p-2">
                    <button
                      onClick={() => startEdit(tx)}
                      className="text-blue-600 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

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
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
