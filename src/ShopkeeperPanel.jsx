import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, onSnapshot, query, orderBy, updateDoc, doc, getDocs, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { ShoppingBag, LogOut, ChevronDown, ChevronUp, Store, Bell } from 'lucide-react';

const STATUS_STEPS = ['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const STATUS_COLORS = {
  CONFIRMED:        'bg-blue-100 text-blue-700',
  PREPARING:        'bg-amber-100 text-amber-700',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
  DELIVERED:        'bg-emerald-100 text-emerald-700',
  CANCELLED:        'bg-red-100 text-red-700',
};

export default function ShopkeeperPanel({ user, shop }) {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('active'); // active | delivered | all

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('placedAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Filter orders that contain items from this shop
      const mine = all.filter(order =>
        order.items?.some(item => String(item.shopId) === String(shop.id))
      );
      setOrders(mine);
    });
    return unsub;
  }, [shop.id]);

  const handleNextStatus = async (order) => {
    const idx = STATUS_STEPS.indexOf(order.status);
    if (idx < STATUS_STEPS.length - 1) {
      await updateDoc(doc(db, 'orders', order.id), {
        status: STATUS_STEPS[idx + 1],
        statusIdx: idx + 1,
      });
    }
  };

  const filtered = orders.filter(o => {
    if (filter === 'active') return o.status !== 'DELIVERED' && o.status !== 'CANCELLED';
    if (filter === 'delivered') return o.status === 'DELIVERED';
    return true;
  });

  const activeCount = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;

  const nextStatusLabel = (status) => {
    const idx = STATUS_STEPS.indexOf(status);
    if (idx < 0 || idx >= STATUS_STEPS.length - 1) return null;
    return STATUS_STEPS[idx + 1].replace(/_/g, ' ');
  };

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-rose-600 text-white px-5 py-4 shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">
              {shop.emoji || '🏪'}
            </div>
            <div>
              <div className="font-bold text-base leading-tight">{shop.name}</div>
              <div className="text-xs text-orange-100">{shop.type}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <div className="bg-white text-orange-600 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                <Bell className="w-3 h-3" /> {activeCount} new
              </div>
            )}
            <button onClick={() => signOut(auth)} className="bg-white/20 p-2 rounded-xl">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white border-b border-stone-200 px-4 gap-1">
        {[
          { key: 'active', label: `Active (${activeCount})` },
          { key: 'delivered', label: 'Delivered' },
          { key: 'all', label: 'All Orders' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition ${filter === key ? 'border-orange-500 text-orange-600' : 'border-transparent text-stone-500'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-stone-400">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-medium">{filter === 'active' ? 'No active orders' : 'No orders yet'}</p>
            <p className="text-xs mt-1">New orders will appear here instantly</p>
          </div>
        )}

        {filtered.map(order => {
          const myItems = order.items?.filter(item => String(item.shopId) === String(shop.id)) || [];
          const myTotal = myItems.reduce((sum, i) => sum + (i.product?.price * i.qty), 0);
          const next = nextStatusLabel(order.status);

          return (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4">
                {/* Order Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-bold text-stone-800">#{order.id?.slice(-6)}</div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      {order.village?.name || 'Unknown village'} • {order.address?.slice(0, 30)}...
                    </div>
                    <div className="text-xs text-stone-500">{order.phone || order.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600 text-lg">₹{myTotal}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[order.status] || 'bg-stone-100 text-stone-600'}`}>
                      {order.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <button
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  className="flex items-center gap-1 text-xs text-orange-500 font-semibold mb-3"
                >
                  {expanded === order.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {myItems.length} items • tap to {expanded === order.id ? 'hide' : 'view'}
                </button>

                {expanded === order.id && (
                  <div className="bg-stone-50 rounded-xl p-3 mb-3 space-y-2">
                    {myItems.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.product?.emoji}</span>
                          <div>
                            <div className="text-sm font-medium text-stone-800">{item.product?.name}</div>
                            <div className="text-xs text-stone-500">{item.product?.unit} × {item.qty}</div>
                          </div>
                        </div>
                        <div className="font-bold text-stone-700 text-sm">₹{item.product?.price * item.qty}</div>
                      </div>
                    ))}
                    <div className="border-t border-stone-200 pt-2 flex justify-between">
                      <span className="text-xs font-semibold text-stone-600">Your Items Total</span>
                      <span className="font-bold text-orange-600">₹{myTotal}</span>
                    </div>
                    <div className="text-xs text-stone-500">
                      Payment: <span className="font-semibold capitalize">{order.paymentMode === 'cod' ? '💵 Cash on Delivery' : '💳 Online Paid'}</span>
                      {order.paymentId && <span className="ml-1 text-emerald-600">✓ {order.paymentId.slice(0, 12)}...</span>}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {next && order.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleNextStatus(order)}
                    className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl text-sm active:scale-95 transition"
                  >
                    Mark as: {next} →
                  </button>
                )}
                {order.status === 'DELIVERED' && (
                  <div className="w-full bg-emerald-50 text-emerald-700 font-bold py-3 rounded-xl text-sm text-center">
                    ✅ Order Delivered
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
