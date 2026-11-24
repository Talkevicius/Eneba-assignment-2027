export interface User {
  id: number
  name: string
  email: string
}

export interface ApiEnvelope<T> {
  data: T
}

export interface Banner {
  id: number
  title: string
  subtitle: string | null
  image_url: string
  target_url: string | null
  display_order: number
  starts_at: string | null
  ends_at: string | null
}

export interface ProductCategory {
  id: number
  name: string
  slug: string
}

export interface ProductOffer {
  id: number
  seller: { id: number; name: string; rating: string | null }
  platform: { id: number; name: string; slug: string }
  region: { id: number; name: string; code: string }
  price: string
  original_price: string | null
  currency: string
}

export interface Product {
  id: number
  title: string
  slug: string
  description: string
  image_url: string
  developer: string | null
  publisher: string | null
  release_date: string | null
  category: ProductCategory
  starting_price?: string
  currency?: string
  sales_count?: number
  offers?: ProductOffer[]
}

export interface PaginatedProducts {
  data: Product[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    per_page: number
    total: number
  }
}

export interface AuthResponse {
  user: User
  token: string
  token_type: 'Bearer'
}

export interface CurrentUserResponse {
  user: User
}

export interface ApiValidationErrors {
  [field: string]: string[]
}

export interface ApiErrorResponse {
  message: string
  errors?: ApiValidationErrors
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegistrationDetails extends LoginCredentials {
  name: string
}

export interface CheckoutRequest {
  items: Array<{
    offer_id: number
    quantity: number
  }>
}

export interface CheckoutOrderItem {
  id: number
  product_title: string
  seller_name: string
  unit_price: string
  currency: string
  digital_key: string | null
}

export interface CheckoutResponse {
  id: number
  total: string
  currency: string
  payment_status: 'successful'
  created_at: string
  items: CheckoutOrderItem[]
}

export interface OrderSummary {
  id: number
  total: string
  currency: string
  payment_status: string
  created_at: string
}

export interface PaginatedOrders {
  data: OrderSummary[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    per_page: number
    total: number
  }
}

export interface OrderItemDetails {
  id: number
  product_title: string
  seller_name: string
  unit_price: string
  currency: string
  digital_key?: string | null
}

export interface OrderDetails extends OrderSummary {
  items: OrderItemDetails[]
}
