import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project credentials
// Get them from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper: fetch all products
export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw error
  return data
}

// Helper: add product
export async function addProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single()
  if (error) throw error
  return data
}

// Helper: update product
export async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// Helper: delete product
export async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// Helper: insert order with items
export async function insertOrder(orderData, items) {
  // Insert the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single()
  if (orderError) throw orderError

  // Insert order items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_name: item.product_name,
    price: item.price,
    quantity: item.quantity,
  }))
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
  if (itemsError) throw itemsError

  return order
}

// Helper: fetch all orders with items
export async function fetchOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// Helper: delete order (cascade deletes items if FK set)
export async function deleteOrder(id) {
  // Delete items first
  await supabase.from('order_items').delete().eq('order_id', id)
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) throw error
}

// Helper: upload product image to Supabase Storage
// Requires a public bucket named 'product-images' in your Supabase project
export async function uploadProductImage(file) {
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false })

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName)

  return data.publicUrl
}
