import { ProductModel } from "./product";

export interface OrderItem {
  productId: number;
  quantity: number;
  _productName?: string;
  _unitPrice?: number;
  _lineTotal?: number;
}

export type OrderStatus = "PENDING" | "PAID" | "CANCELLED";

export interface Order {
  id: number;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

let orders: Order[] = [];

function calculateTotal(items: OrderItem[]): number {
  return items.reduce((sum, it) => {
    const p = ProductModel.findById(it.productId);
    if (!p) return sum;
    return sum + p.price * it.quantity;
  }, 0);
}

export const OrderModel = {
  enrich(order: Order): Order {
    const items = order.items.map(it => {
      const p = ProductModel.findById(it.productId);
      return {
        ...it,
        _productName: p?.name,
        _unitPrice: p?.price,
        _lineTotal: p ? p.price * it.quantity : undefined,
      };
    });
    return { ...order, items };
  },

  findAll(): Order[] {
    return orders.map(o => this.enrich(o));
  },
  findById(id: number): Order | undefined {
    const o = orders.find(o => o.id === id);
    return o ? this.enrich(o) : undefined;
  },
  create(payload: { items: OrderItem[]; status?: OrderStatus }): Order | "OUT_OF_STOCK" | "NOT_FOUND" {
    for (const it of payload.items) {
      const p = ProductModel.findById(it.productId);
      if (!p) return "NOT_FOUND";
      if (p.stock < it.quantity) return "OUT_OF_STOCK";
    }

    for (const it of payload.items) {
      ProductModel.decreaseStock(it.productId, it.quantity);
    }

    const nextId = orders.length ? Math.max(...orders.map(o => o.id)) + 1 : 1;
    const now = new Date().toISOString();
    const total = calculateTotal(payload.items);
    const order: Order = {
      id: nextId,
      items: payload.items,
      total,
      status: payload.status ?? "PENDING",
      createdAt: now,
      updatedAt: now
    };
    orders.push(order);
    return order;
  },
  update(id: number, changes: Partial<Pick<Order, "items" | "status">>): Order | "NOT_FOUND" | "OUT_OF_STOCK" {
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) return "NOT_FOUND";

    if (changes.items) {
      const old = orders[idx];
      for (const it of old.items) {
        ProductModel.increaseStock(it.productId, it.quantity);
      }
      for (const it of changes.items) {
        const p = ProductModel.findById(it.productId);
        if (!p) return "NOT_FOUND";
        if (p.stock < it.quantity) return "OUT_OF_STOCK";
      }
      for (const it of changes.items) ProductModel.decreaseStock(it.productId, it.quantity);

      const total = calculateTotal(changes.items);
      orders[idx] = { ...old, items: changes.items, total, updatedAt: new Date().toISOString() };
    }

    if (changes.status) {
      orders[idx] = { ...orders[idx], status: changes.status, updatedAt: new Date().toISOString() };
    }

    return orders[idx];
  },
  delete(id: number): boolean {
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) return false;
    for (const it of orders[idx].items) {
      ProductModel.increaseStock(it.productId, it.quantity);
    }
    orders.splice(idx, 1);
    return true;
  },
  isProductReferenced(productId: number): boolean {
    return orders.some(o => o.items.some(it => it.productId === productId));
  }
};
