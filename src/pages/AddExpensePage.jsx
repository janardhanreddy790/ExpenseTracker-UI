import { useState, useEffect } from "react";
import { createTransaction } from "../services/api";

export default function AddExpensePage() {
  const [refData, setRefData] = useState(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: "",
    subcategory: "",
    item: "",
    quantity: 1,
    unit: "",
    amount: "",
    currency: "EUR",
    paymentMethod: "",
    vendor: "",
    owner: "",
    notes: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reference-data`)
      .then((res) => res.json())
      .then((data) => {
        setRefData(data);
        // Pre-fill defaults
        setForm((prev) => ({
          ...prev,
          category: Object.keys(data.categories)[0],
          subcategory: "",
          unit: data.units[0],
          paymentMethod: data.paymentMethods[0],
          owner: data.owners[0],
        }));
      });
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await createTransaction(form);
      setMessage("✅ Transaction saved!");
      setForm({ ...form, amount: "", item: "", vendor: "", notes: "" });
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  }

  if (!refData) return <p>Loading form...</p>;

  const subcategories = form.category ? refData.categories[form.category] || [] : [];
  const items = form.subcategory ? refData.itemsBySubcategory[form.subcategory] || [] : [];

  return (
    <div>
      <h2 className="text-2xl font-semibold text-indigo-600">Add Transaction</h2>
      <p className="mt-2 text-gray-700">Fill details below ➕</p>
      {message && <p className="mt-4">{message}</p>}

      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-2 gap-4 bg-white p-6 rounded-xl shadow-md">
        {/* Date */}
        <input type="date" name="date" value={form.date} onChange={handleChange} className="border p-2 rounded" />

        {/* Category */}
        <select name="category" value={form.category} onChange={handleChange} className="border p-2 rounded" required>
          {Object.keys(refData.categories).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Subcategory */}
        <select name="subcategory" value={form.subcategory} onChange={handleChange} className="border p-2 rounded">
          <option value="">-- Select Subcategory --</option>
          {subcategories.map((sc) => (
            <option key={sc} value={sc}>{sc}</option>
          ))}
        </select>

        {/* Item */}
        <select name="item" value={items.includes(form.item) ? form.item : ""} onChange={handleChange} className="border p-2 rounded">
          <option value="">-- Select Item --</option>
          {items.map((it) => (
            <option key={it} value={it}>{it}</option>
          ))}
        </select>

        <input type="number" name="quantity" placeholder="Quantity" value={form.quantity} onChange={handleChange} className="border p-2 rounded" />
        <select name="unit" value={form.unit} onChange={handleChange} className="border p-2 rounded">
          {refData.units.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>

        <input type="number" name="amount" placeholder="Amount (€)" value={form.amount} onChange={handleChange} className="border p-2 rounded" required />
        <select name="currency" value={form.currency} onChange={handleChange} className="border p-2 rounded">
          <option value="EUR">EUR</option>
        </select>

        <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="border p-2 rounded">
          {refData.paymentMethods.map((pm) => (
            <option key={pm} value={pm}>{pm}</option>
          ))}
        </select>

        <input type="text" name="vendor" placeholder="Vendor" value={form.vendor} onChange={handleChange} className="border p-2 rounded" />

        <select name="owner" value={form.owner} onChange={handleChange} className="border p-2 rounded">
          {refData.owners.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>

        <input type="text" name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} className="border p-2 rounded col-span-2" />

        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 col-span-2">
          Save Transaction
        </button>
      </form>
    </div>
  );
}
