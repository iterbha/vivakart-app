import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, writeBatch
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Plus, Trash2, Package, Store, ShoppingBag, LogOut, ChevronDown, ChevronUp, Zap } from 'lucide-react';

const GROCERY_SEED = [
  { name: 'Basmati Rice', unit: '5 kg', price: 450, emoji: '🌾', cat: 'Grains' },
  { name: 'Wheat Flour (Aata)', unit: '10 kg', price: 380, emoji: '🌾', cat: 'Grains' },
  { name: 'Sugar', unit: '5 kg', price: 250, emoji: '🧂', cat: 'Essentials' },
  { name: 'Refined Oil', unit: '5 L', price: 850, emoji: '🫙', cat: 'Oils' },
  { name: 'Mustard Oil', unit: '5 L', price: 950, emoji: '🫙', cat: 'Oils' },
  { name: 'Arhar Dal', unit: '5 kg', price: 750, emoji: '🫘', cat: 'Dals' },
  { name: 'Chana Dal', unit: '5 kg', price: 600, emoji: '🫘', cat: 'Dals' },
  { name: 'Tea (Chai Patti)', unit: '1 kg', price: 280, emoji: '🍵', cat: 'Essentials' },
  { name: 'Salt', unit: '1 kg', price: 25, emoji: '🧂', cat: 'Essentials' },
  { name: 'Turmeric Powder', unit: '200 g', price: 60, emoji: '🟡', cat: 'Spices' },
  { name: 'Red Chilli Powder', unit: '200 g', price: 55, emoji: '🌶️', cat: 'Spices' },
  { name: 'Coriander Powder', unit: '200 g', price: 45, emoji: '🟤', cat: 'Spices' },
  { name: 'Garam Masala', unit: '100 g', price: 70, emoji: '🌿', cat: 'Spices' },
  { name: 'Moong Dal', unit: '5 kg', price: 680, emoji: '🫘', cat: 'Dals' },
  { name: 'Urad Dal', unit: '5 kg', price: 720, emoji: '🫘', cat: 'Dals' },
  { name: 'Sooji (Semolina)', unit: '1 kg', price: 55, emoji: '🌾', cat: 'Grains' },
  { name: 'Besan', unit: '1 kg', price: 80, emoji: '🟡', cat: 'Grains' },
  { name: 'Poha', unit: '1 kg', price: 60, emoji: '🌾', cat: 'Grains' },
  { name: 'Onion', unit: '5 kg', price: 180, emoji: '🧅', cat: 'Vegetables' },
  { name: 'Potato', unit: '5 kg', price: 120, emoji: '🥔', cat: 'Vegetables' },
  { name: 'Tomato', unit: '2 kg', price: 80, emoji: '🍅', cat: 'Vegetables' },
  { name: 'Garlic', unit: '500 g', price: 90, emoji: '🧄', cat: 'Vegetables' },
  { name: 'Ginger', unit: '500 g', price: 80, emoji: '🫚', cat: 'Vegetables' },
  { name: 'Soap (Lux)', unit: '4 pcs', price: 120, emoji: '🧼', cat: 'Daily Needs' },
  { name: 'Washing Powder', unit: '1 kg', price: 95, emoji: '🫧', cat: 'Daily Needs' },
  { name: 'Biscuits (Parle-G)', unit: '10 packs', price: 100, emoji: '🍪', cat: 'Snacks' },
  { name: 'Namkeen Mix', unit: '1 kg', price: 220, emoji: '🥨', cat: 'Snacks' },
  { name: 'Milk Powder', unit: '500 g', price: 280, emoji: '🥛', cat: 'Essentials' },
];

export default function AdminPanel({ user }) {
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [shopForm, setShopForm] = useState({ name: '', hindi: '', type: '', address: '', pin: '', emoji: '🏪', tag: '' });
  const [productForm, setProductForm] = useState({ name: '', unit: '', price: '', emoji: '📦', cat: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('placedAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (tab === 'shops' || tab === 'products') loadShops();
  }, [tab]);

  useEffect(() => {
    if (selectedShop) loadProducts(selectedShop.id);
  }, [selectedShop]);

  const loadShops = async () => {
    const snap = await getDocs(collection(db, 'shops'));
    setShops(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const loadProducts = async (shopId) => {
    const snap = await getDocs(collection(db, 'shops', shopId, 'products'));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleAddShop = async () => {
    if (!shopForm.name || !shopForm.type) return;
    setLoading(true);
    await addDoc(collection(db, 'shops'), { ...shopForm, rating: 4.5, createdAt: new Date() });
    setShopForm({ name: '', hindi: '', type: '', address: '', pin: '', emoji: '🏪', tag: '' });
    await loadShops();
    setLoading(false);
  };

  const handleDeleteShop = async (id) => {
    if (!window.confirm('Delete this shop?')) return;
    await deleteDoc(doc(db, 'shops', id));
    if (selectedShop?.id === id) setSelectedShop(null);
    await loadShops();
  };

  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.price || !selectedShop) return;
    setLoading(true);
    await addDoc(collection(db, 'shops', selectedShop.id, 'products'), {
      ...productForm,
      price: Number(productForm.price),
    });
    setProductForm({ name: '', unit: '', price: '', emoji: '📦', cat: '' });
    await loadProducts(selectedShop.id);
    setLoading(false);
  };

  const handleDeleteProduct = async (productId) => {
    await deleteDoc(doc(db, 'shops', selectedShop.id, 'products', productId));
    await loadProducts(selectedShop.id);
  };

  const handleSeedGrocery = async () => {
    if (!selectedShop) return;
    if (!window.confirm(`Add ${GROCERY_SEED.length} grocery items to ${selectedShop.name}?`)) return;
    setLoading(true);
    const batch = writeBatch(db);
    GROCERY_SEED.forEach(product => {
      const ref = doc(collection(db, 'shops', selectedShop.id, 'products'));
      batch.set(ref, product);
    });
    await batch.commit();
    await loadProducts(selectedShop.id);
    setLoading(false);
  };

  const handleUpdateOrder = async (id, status) => {
    await updateDoc(doc(db, 'orders', id), { status });
  };

  const STATUS_COLORS = {
    CONFIRMED: 'bg-blue-100 text-blue-700',
    PREPARING: 'bg-amber-100 text-amber-700',
    OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
    DELIVERED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-rose-600 text-white px-5 py-4 flex items-center justify-between shadow">
        <div>
          <div className="font-bold text-lg">VIVAKART Admin</div>
          <div className="text-xs text-orange-100">{user?.email}</div>
        </div>
        <button onClick={() => signOut(auth)} className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-xl text-sm font-semibold">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-stone-200 px-4 gap-1">
        {[
          { key: 'orders', label: 'Orders', icon: ShoppingBag },
          { key: 'shops', label: 'Shops', icon: Store },
          { key: 'products', label: 'Products', icon: Package },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition ${tab === key ? 'border-orange-500 text-orange-600' : 'border-transparent text-stone-500'}`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      <div className="p-4 max-w-2xl mx-auto">

        {/* ORDERS TAB */}
        {tab === 'orders' && (
          <div className="space-y-3">
            <h2 className="font-bold text-stone-800">Live Orders ({orders.length})</h2>
            {orders.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center text-stone-400">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No orders yet</p>
              </div>
            )}
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-stone-800 text-sm">#{order.id?.slice(-8)}</div>
                      <div className="text-xs text-stone-500 mt-0.5">{order.phone || order.email} • {order.village?.name}</div>
                      <div className="text-xs text-stone-500">{order.address}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-orange-600">₹{order.total}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[order.status] || 'bg-stone-100 text-stone-600'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map(s => (
                      <button
                        key={s}
                        onClick={() => handleUpdateOrder(order.id, s)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-semibold border transition ${order.status === s ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-stone-600 border-stone-200 hover:border-orange-300'}`}
                      >
                        {s.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="flex items-center gap-1 text-xs text-orange-500 font-semibold mt-2"
                  >
                    {expandedOrder === order.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {expandedOrder === order.id ? 'Hide items' : 'View items'}
                  </button>
                  {expandedOrder === order.id && (
                    <div className="mt-3 border-t border-stone-100 pt-3 space-y-1">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-stone-700">{item.product?.emoji} {item.product?.name} × {item.qty}</span>
                          <span className="text-stone-500">₹{item.product?.price * item.qty}</span>
                        </div>
                      ))}
                      {order.functionType && (
                        <div className="text-xs text-stone-400 mt-1">Function: {order.functionType} • Guests: {order.guestCount} • Date: {order.functionDate}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SHOPS TAB */}
        {tab === 'shops' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-orange-500" /> Add Wholesaler / Shop</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'name', placeholder: 'Shop Name (English)*' },
                  { key: 'hindi', placeholder: 'दुकान का नाम (Hindi)' },
                  { key: 'type', placeholder: 'Type (e.g. Grocery)*' },
                  { key: 'address', placeholder: 'Address' },
                  { key: 'pin', placeholder: 'PIN Code' },
                  { key: 'emoji', placeholder: 'Emoji (e.g. 🏪)' },
                  { key: 'tag', placeholder: 'Tag (e.g. Popular)' },
                ].map(({ key, placeholder }) => (
                  <input
                    key={key}
                    value={shopForm[key]}
                    onChange={e => setShopForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                  />
                ))}
              </div>
              <button
                onClick={handleAddShop}
                disabled={loading}
                className="mt-3 w-full bg-orange-500 text-white font-bold py-2.5 rounded-xl text-sm active:scale-95 transition disabled:opacity-60"
              >
                {loading ? 'Adding...' : 'Add Shop'}
              </button>
            </div>
            <div className="space-y-2">
              {shops.length === 0 && <div className="bg-white rounded-2xl p-6 text-center text-stone-400 text-sm">No shops added yet</div>}
              {shops.map(shop => (
                <div key={shop.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl shrink-0">{shop.emoji || '🏪'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-stone-800 text-sm truncate">{shop.name}</div>
                    <div className="text-xs text-stone-500">{shop.type} • {shop.address}</div>
                    {shop.tag && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">{shop.tag}</span>}
                  </div>
                  <button onClick={() => handleDeleteShop(shop.id)} className="text-red-400 hover:text-red-600 transition p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {tab === 'products' && (
          <div className="space-y-4">
            {/* Select Shop */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-stone-800 mb-2">Select Shop to Add Products</h3>
              <div className="flex flex-wrap gap-2">
                {shops.map(shop => (
                  <button
                    key={shop.id}
                    onClick={() => setSelectedShop(shop)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition ${selectedShop?.id === shop.id ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-stone-200 text-stone-700 hover:border-orange-300'}`}
                  >
                    {shop.emoji} {shop.name}
                  </button>
                ))}
                {shops.length === 0 && <p className="text-stone-400 text-sm">Add a shop first in the Shops tab</p>}
              </div>
            </div>

            {selectedShop && (
              <>
                {/* Add Product Form */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-stone-800 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-orange-500" /> Add Product to {selectedShop.emoji} {selectedShop.name}
                    </h3>
                    <button
                      onClick={handleSeedGrocery}
                      disabled={loading}
                      className="flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl active:scale-95 transition disabled:opacity-60"
                    >
                      <Zap className="w-3.5 h-3.5" /> Seed Grocery Items
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'name', placeholder: 'Product Name*' },
                      { key: 'unit', placeholder: 'Unit (e.g. 5 kg, 1 L)' },
                      { key: 'price', placeholder: 'Price in ₹*', type: 'number' },
                      { key: 'emoji', placeholder: 'Emoji (e.g. 🌾)' },
                      { key: 'cat', placeholder: 'Category (e.g. Grains)' },
                    ].map(({ key, placeholder, type }) => (
                      <input
                        key={key}
                        type={type || 'text'}
                        value={productForm[key]}
                        onChange={e => setProductForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleAddProduct}
                    disabled={loading}
                    className="mt-3 w-full bg-orange-500 text-white font-bold py-2.5 rounded-xl text-sm active:scale-95 transition disabled:opacity-60"
                  >
                    {loading ? 'Adding...' : 'Add Product'}
                  </button>
                </div>

                {/* Products List */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-stone-700 text-sm">Products ({products.length})</h3>
                  {products.length === 0 && <div className="bg-white rounded-2xl p-6 text-center text-stone-400 text-sm">No products yet — add some above</div>}
                  {products.map(p => (
                    <div key={p.id} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
                      <span className="text-2xl">{p.emoji}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-stone-800 text-sm">{p.name}</div>
                        <div className="text-xs text-stone-500">{p.unit} • {p.cat}</div>
                      </div>
                      <div className="text-orange-600 font-bold text-sm">₹{p.price}</div>
                      <button onClick={() => handleDeleteProduct(p.id)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
