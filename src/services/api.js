const BASE = import.meta.env.VITE_API_BASE_URL || "";

export const API = {
  listTransactions: "/api/transactions",
  createTransaction: "/api/transactions",
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
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export const listTransactions = () => http(API.listTransactions);

export const createTransaction = (payload) =>
  http(API.createTransaction, { method: "POST", body: payload });
