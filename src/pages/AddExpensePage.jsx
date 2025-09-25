import { useState, useEffect } from "react";
import { createTransaction, getReferenceData } from "../services/api";

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
    getReferenceData().then((data) => {
      setRefData(data);
      setForm((prev) => ({
        ...prev,
        category: Object.keys(data.categories)[0] || "",
        unit: data.units[0] || "",
        paymentMethod: data.paymentMethods[0] || "",
        owner: data.owners[0] || "",
      }));
    });
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "category") {
      setForm((prev) => ({ ...prev, category: value, subcategory: "", item: "" }));
      return;
    }
    if (name === "subcategory") {
      setForm((prev) => ({ ...prev, subcategory: value, item: "" }));
      return;
    }
    setForm({ ...form, [name]: value });
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
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-indigo-600">Add Transaction</h2>
      {message && <p className="mt-4">{message}</p>}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4 bg-white p-6 rounded-xl shadow-md"
      >
        <input type="date" name="date" value={form.date} onChange={handleChange} className="border p-2 rounded" />
        <select name="category" value={form.category} onChange={handleChange} className="border p-2 rounded">
          {Object.keys(refData.categories).map((c) => <option key={c}>{c}</option>)}
        </select>
        <select name="subcategory" value={form.subcategory} onChange={handleChange} className="border p-2 rounded">
          <option value="">-- Select Subcategory --</option>
          {subcategories.map((sc) => <option key={sc}>{sc}</option>)}
        </select>
        <div className="col-span-2 flex flex-col">
          <select
            name="item"
            value={items.includes(form.item) ? form.item : ""}
            onChange={handleChange}
            className="border p-2 rounded mb-2"
          >
            <option value="">-- Select Item --</option>
            {items.map((it) => <option key={it}>{it}</option>)}
          </select>
          <input type="text" name="item" value={form.item} onChange={handleChange} placeholder="Or type custom item" className="border p-2 rounded" />
        </div>
        <input type="number" name="quantity" value={form.quantity} onChange={handleChange} className="border p-2 rounded" />
        <select name="unit" value={form.unit} onChange={handleChange} className="border p-2 rounded">
          {refData.units.map((u) => <option key={u}>{u}</option>)}
        </select>
        <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="Amount (€)" className="border p-2 rounded" />
        <select name="currency" value={form.currency} onChange={handleChange} className="border p-2 rounded"><option value="EUR">EUR</option></select>
        <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="border p-2 rounded">
          {refData.paymentMethods.map((pm) => <option key={pm}>{pm}</option>)}
        </select>
        <input type="text" name="vendor" value={form.vendor} onChange={handleChange} placeholder="Vendor" className="border p-2 rounded" />
        <select name="owner" value={form.owner} onChange={handleChange} className="border p-2 rounded">
          {refData.owners.map((o) => <option key={o}>{o}</option>)}
        </select>
        <input type="text" name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" className="border p-2 rounded col-span-2" />
        <button type="submit" className="col-span-2 bg-indigo-600 text-white px-4 py-2 rounded-lg">Save Transaction</button>
      </form>
    </div>
  );
}
