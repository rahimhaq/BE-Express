export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

let products: Product[] = [
  { id: 1, name: "Pensil", price: 2000, stock: 100, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 2, name: "Buku Tulis", price: 5000, stock: 50, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const ProductModel = {
  findAll(): Product[] {
    return products;
  },
  findById(id: number): Product | undefined {
    return products.find(p => p.id === id);
  },
  create(data: Omit<Product, "id" | "createdAt" | "updatedAt">): Product {
    const nextId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const now = new Date().toISOString();
    const item: Product = { id: nextId, createdAt: now, updatedAt: now, ...data };
    products.push(item);
    return item;
  },
  update(id: number, changes: Partial<Omit<Product, "id" | "createdAt">>): Product | undefined {
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    const now = new Date().toISOString();
    products[idx] = { ...products[idx], ...changes, updatedAt: now };
    return products[idx];
  },
  delete(id: number): boolean {
    const before = products.length;
    products = products.filter(p => p.id !== id);
    return products.length < before;
  },
  decreaseStock(id: number, qty: number): boolean {
    const p = this.findById(id);
    if (!p || p.stock < qty) return false;
    p.stock -= qty;
    p.updatedAt = new Date().toISOString();
    return true;
  },
  increaseStock(id: number, qty: number): boolean {
    const p = this.findById(id);
    if (!p) return false;
    p.stock += qty;
    p.updatedAt = new Date().toISOString();
    return true;
  }
};
