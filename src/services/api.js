// src/services/api.js
const BASE = import.meta.env.VITE_API_BASE_URL || "";

export const API = {
  listTransactions: "/api/transactions",
  createTransaction: "/api/transactions",
  deleteTransaction: (id) => `/api/transactions/${id}`,
};

async function http(path, { method = "GET", body, headers } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  // 👇 Only parse JSON for non-DELETE requests
  if (method === "DELETE") {
    return null;
  }

  if (res.status === 204) return null;
  const text = await res.text();
  if (!text || !text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const listTransactions = () => http(API.listTransactions);

export const createTransaction = (payload) =>
  http(API.createTransaction, { method: "POST", body: payload });

export const deleteTransaction = (id) =>
  http(API.deleteTransaction(id), { method: "DELETE" });
