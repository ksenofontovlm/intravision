export interface Product {
  id: number;
  name: string;
  price: number;
  quantityInStock: number;
  brandId: number;
  brand: Brand;
}

export interface Brand {
  id: number;
  name: string;
}

export interface Coin {
  id: number;
  denomination: number;
  quantity: number;
}

export interface Order {
  id: number;
  orderDate: string;
  totalAmount: number;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  brandName: string;
  unitPrice: number;
  quantity: number;
}

export interface CartItem {
  productId: number;
  quantity: number;
}