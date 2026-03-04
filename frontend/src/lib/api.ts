export type StatusResponse = {
  app: string;
  status: string;
  time: string;
};

export type Potion = {
  id: number;
  code: string;
  name: string;
  price: number;
  stock: number;
};

export type Customer = {
  id: number;
  email: string;
  displayName: string;
};

export type OrderSummary = {
  orderId: number;
  customerEmail: string;
  customerName: string;
  status: string;
  totalAmount: number;
  itemCount: number;
};

export type CreateCustomerRequest = {
  email: string;
  displayName: string;
};

export type CreateOrderRequest = {
  customerEmail: string;
  items: Array<{
    potionCode: string;
    quantity: number;
  }>;
};

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`${init?.method ?? "GET"} ${path} failed (${response.status}): ${raw || response.statusText}`);
  }

  if (!raw) {
    return {} as T;
  }

  return JSON.parse(raw) as T;
}

export const api = {
  status: () => requestJson<StatusResponse>("/api/status"),
  potions: () => requestJson<Potion[]>("/api/potions"),
  customers: () => requestJson<Customer[]>("/api/customers"),
  orders: () => requestJson<OrderSummary[]>("/api/orders"),
  createCustomer: (payload: CreateCustomerRequest) =>
    requestJson<Customer>("/api/customers", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  createOrder: (payload: CreateOrderRequest) =>
    requestJson<OrderSummary>("/api/orders", {
      method: "POST",
      body: JSON.stringify(payload)
    })
};
