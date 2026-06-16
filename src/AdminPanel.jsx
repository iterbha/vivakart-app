import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Plus, Trash2, Edit2, Check, X, Package, Store, ShoppingBag, LogOut, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminPanel({ user }) {
  const [tab, setTab] = useState('orders'); // orders | shops | products
  const [orders, setOrders] = useState([]);
  const [shops, setShops] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [shopForm, setShopForm] = useState({ name: '', hindi: '', type: '', address: '', pin: '', emoji: '', tag: '' });
  const [editingShop, setEditingShop] = useState(null);
  const [loading, setLoading] = useState(false);

  // Live orders feed
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('placedAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // Shops list
  useEffect(() => {
    if (tab === 'shops') loadShops();
  }, [tab]);

  const loadShops = async () => {
    const snap = await getDocs(collection(db, 'shops'));
    setShops(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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
    await loadShops();
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
          <div className="text-xs text-orange-100">{user?.phoneNumber}</div>
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
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-stone-800">Live Orders ({orders.length})</h2>
            </div>
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
                      <div className="text-xs text-stone-500 mt-0.5">{order.phone} • {order.village?.name}</div>
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
            {/* Add shop form */}
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

            {/* Shops list */}
            <div className="space-y-2">
              {shops.length === 0 && (
                <div className="bg-white rounded-2xl p-6 text-center text-stone-400 text-sm">No shops added yet</div>
              )}
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
      </div>
    </div>
  );
}
