import { useState } from "react";
import { createTransaction } from "../services/api";

export default function AddExpensePage() {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: "Groceries",
    subcategory: "",
    item: "",
    quantity: "",
    unit: "",
    amount: "",
    currency: "EUR",
    paymentMethod: "Card",
    vendor: "",
    owner: "",
    notes: "",
  });
  const [message, setMessage] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await createTransaction(form);
      setMessage("✅ Transaction saved!");
      setForm({ ...form, amount: "", item: "", notes: "" }); // reset some fields
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-indigo-600">Add Transaction</h2>
      <p className="mt-2 text-gray-700">Fill details below ➕</p>

      {message && <p className="mt-4">{message}</p>}

      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-2 gap-4 bg-white p-6 rounded-xl shadow-md">
        <input type="date" name="date" value={form.date} onChange={handleChange} className="border p-2 rounded" />
        <input type="text" name="category" placeholder="Category" value={form.category} onChange={handleChange} className="border p-2 rounded" />
        <input type="text" name="subcategory" placeholder="Subcategory" value={form.subcategory} onChange={handleChange} className="border p-2 rounded" />
        <input type="text" name="item" placeholder="Item" value={form.item} onChange={handleChange} className="border p-2 rounded" />
        <input type="number" step="0.01" name="quantity" placeholder="Quantity" value={form.quantity} onChange={handleChange} className="border p-2 rounded" />
        <input type="text" name="unit" placeholder="Unit (kg, pcs)" value={form.unit} onChange={handleChange} className="border p-2 rounded" />
        <input type="number" step="0.01" name="amount" placeholder="Amount (€)" value={form.amount} onChange={handleChange} className="border p-2 rounded" />
        <input type="text" name="currency" placeholder="Currency" value={form.currency} onChange={handleChange} className="border p-2 rounded" />
        <input type="text" name="paymentMethod" placeholder="Payment Method" value={form.paymentMethod} onChange={handleChange} className="border p-2 rounded" />
        <input type="text" name="vendor" placeholder="Vendor" value={form.vendor} onChange={handleChange} className="border p-2 rounded" />
        <input type="text" name="owner" placeholder="Owner" value={form.owner} onChange={handleChange} className="border p-2 rounded" />
        <input type="text" name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} className="border p-2 rounded col-span-2" />

        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 col-span-2">
          Save Transaction
        </button>
      </form>
    </div>
  );
}
