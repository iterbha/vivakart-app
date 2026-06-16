import React, { useState, useEffect } from 'react';
import {
  Home, ShoppingCart, Package, User, Search, MapPin, Clock, Plus, Minus,
  ChevronLeft, ChevronRight, Star, Truck, CheckCircle2, Phone, Calendar,
  Users, Globe, Store, Sparkles, Receipt, Tag, IndianRupee, ArrowRight,
  PartyPopper, Cake, Heart, Flower2, Circle, LogOut
} from 'lucide-react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import AuthScreen from './AuthScreen';
import AdminPanel from './AdminPanel';

const ADMIN_EMAILS = ['itvertuvm@gmail.com'];

// ============================================================================
// DATA: Villages, Shops, Products
// ============================================================================
const VILLAGES = [
  { id: 1, name: 'Kundri', hindi: 'कुंदरी', pin: '811313' },
  { id: 2, name: 'Sankuraha', hindi: 'संकुराहा', pin: '811313' },
  { id: 3, name: 'Kharsari Nichli Tola', hindi: 'खरसारी निचली टोला', pin: '811313' },
  { id: 4, name: 'Kharsari Upraili Tola', hindi: 'खरसारी उपराली टोला', pin: '811313' },
  { id: 5, name: 'Harla', hindi: 'हरला', pin: '811313' },
  { id: 6, name: 'Mahugain', hindi: 'महुगाईं', pin: '811313' },
  { id: 7, name: 'Pyarepur', hindi: 'प्यारेपुर', pin: '811313' },
  { id: 8, name: 'Chandwara', hindi: 'चंदवारा', pin: '811313' },
];

const SHOPS = [
  { id: 1, name: 'Sharma General Store', hindi: 'शर्मा जनरल स्टोर', type: 'Grocery & Provisions', rating: 4.5, address: 'Main Market, Jamui', pin: '811307', emoji: '🏪', tag: 'Popular' },
  { id: 2, name: 'Verma Wholesale Mart', hindi: 'वर्मा होलसेल मार्ट', type: 'Bulk Grocery', rating: 4.7, address: 'Station Road, Jamui', pin: '811307', emoji: '📦', tag: 'Wholesale' },
  { id: 3, name: 'Mishra Party Bhandar', hindi: 'मिश्रा पार्टी भंडार', type: 'Party & Function Supplies', rating: 4.3, address: 'Bazaar Chowk, Jamui', pin: '811307', emoji: '🎉', tag: 'Functions' },
  { id: 4, name: 'Anand Mithai Bhandar', hindi: 'आनंद मिठाई भंडार', type: 'Sweets & Namkeen', rating: 4.8, address: 'Mahavir Chowk, Jamui', pin: '811307', emoji: '🍡', tag: 'Top Rated' },
  { id: 5, name: 'Kumar Sabzi Mandi', hindi: 'कुमार सब्ज़ी मंडी', type: 'Vegetables & Fruits', rating: 4.4, address: 'Old Market, Jamui', pin: '811307', emoji: '🥬', tag: 'Fresh' },
];

const PRODUCTS = {
  1: [
    { id: 101, name: 'Basmati Rice', unit: '5 kg', price: 450, emoji: '🌾', cat: 'Grains' },
    { id: 102, name: 'Wheat Flour (Aata)', unit: '10 kg', price: 380, emoji: '🌾', cat: 'Grains' },
    { id: 103, name: 'Sugar', unit: '5 kg', price: 250, emoji: '🧂', cat: 'Essentials' },
    { id: 104, name: 'Refined Oil', unit: '5 L', price: 850, emoji: '🫙', cat: 'Oils' },
    { id: 105, name: 'Mustard Oil', unit: '5 L', price: 950, emoji: '🫙', cat: 'Oils' },
    { id: 106, name: 'Arhar Dal', unit: '5 kg', price: 750, emoji: '🫘', cat: 'Dals' },
    { id: 107, name: 'Chana Dal', unit: '5 kg', price: 600, emoji: '🫘', cat: 'Dals' },
    { id: 108, name: 'Tea (Chai Patti)', unit: '1 kg', price: 280, emoji: '🍵', cat: 'Essentials' },
  ],
  2: [
    { id: 201, name: 'Bulk Rice', unit: '25 kg', price: 2100, emoji: '🌾', cat: 'Bulk Grains' },
    { id: 202, name: 'Bulk Aata', unit: '25 kg', price: 900, emoji: '🌾', cat: 'Bulk Grains' },
    { id: 203, name: 'Bulk Sugar', unit: '25 kg', price: 1200, emoji: '🧂', cat: 'Bulk Essentials' },
    { id: 204, name: 'Bulk Mixed Dal', unit: '10 kg', price: 1450, emoji: '🫘', cat: 'Bulk Dals' },
    { id: 205, name: 'Bulk Oil Tin', unit: '15 L', price: 2400, emoji: '🛢️', cat: 'Bulk Oils' },
    { id: 206, name: 'Bulk Onion', unit: '25 kg', price: 750, emoji: '🧅', cat: 'Bulk Vegetables' },
  ],
  3: [
    { id: 301, name: 'Paper Plates', unit: '100 pcs', price: 250, emoji: '🍽️', cat: 'Disposables' },
    { id: 302, name: 'Disposable Glass', unit: '100 pcs', price: 150, emoji: '🥤', cat: 'Disposables' },
    { id: 303, name: 'Disposable Spoons', unit: '100 pcs', price: 90, emoji: '🥄', cat: 'Disposables' },
    { id: 304, name: 'Decoration Lights', unit: '10 m', price: 350, emoji: '💡', cat: 'Decoration' },
    { id: 305, name: 'Marigold Garland', unit: 'Per piece', price: 80, emoji: '💐', cat: 'Decoration' },
    { id: 306, name: 'Banana Leaf Pattal', unit: '50 pcs', price: 200, emoji: '🍃', cat: 'Traditional' },
    { id: 307, name: 'Disposable Bowl', unit: '100 pcs', price: 220, emoji: '🥣', cat: 'Disposables' },
  ],
  4: [
    { id: 401, name: 'Besan Laddoo', unit: '1 kg', price: 320, emoji: '🍡', cat: 'Sweets' },
    { id: 402, name: 'Kaju Barfi', unit: '1 kg', price: 720, emoji: '🍢', cat: 'Premium Sweets' },
    { id: 403, name: 'Gulab Jamun', unit: '1 kg', price: 280, emoji: '🟤', cat: 'Sweets' },
    { id: 404, name: 'Namkeen Mix', unit: '1 kg', price: 220, emoji: '🥨', cat: 'Namkeen' },
    { id: 405, name: 'Imarti', unit: '1 kg', price: 260, emoji: '🍩', cat: 'Sweets' },
  ],
  5: [
    { id: 501, name: 'Onion', unit: '5 kg', price: 180, emoji: '🧅', cat: 'Vegetables' },
    { id: 502, name: 'Potato', unit: '5 kg', price: 120, emoji: '🥔', cat: 'Vegetables' },
    { id: 503, name: 'Tomato', unit: '2 kg', price: 80, emoji: '🍅', cat: 'Vegetables' },
    { id: 504, name: 'Green Chilli', unit: '500 g', price: 40, emoji: '🌶️', cat: 'Vegetables' },
    { id: 505, name: 'Ginger', unit: '500 g', price: 80, emoji: '🫚', cat: 'Vegetables' },
    { id: 506, name: 'Coriander Leaves', unit: '250 g', price: 30, emoji: '🌿', cat: 'Herbs' },
  ],
};

const FUNCTION_TYPES = [
  { id: 'marriage', label: 'Marriage', hindi: 'शादी', icon: Heart, color: 'bg-rose-100 text-rose-700' },
  { id: 'birthday', label: 'Birthday', hindi: 'जन्मदिन', icon: Cake, color: 'bg-amber-100 text-amber-700' },
  { id: 'puja', label: 'Puja / Satyanarayan', hindi: 'पूजा', icon: Flower2, color: 'bg-orange-100 text-orange-700' },
  { id: 'mundan', label: 'Mundan / Naming', hindi: 'मुंडन', icon: Sparkles, color: 'bg-purple-100 text-purple-700' },
  { id: 'other', label: 'Other Function', hindi: 'अन्य', icon: PartyPopper, color: 'bg-emerald-100 text-emerald-700' },
];

// Translations (minimal toggle)
const T = {
  en: {
    appName: 'VIVAKART',
    tagline: 'Doorstep delivery for your celebrations',
    selectVillage: 'Select your village',
    panchayat: 'Kundri-Sankuraha Panchayat • Jamui, Bihar',
    home: 'Home', shops: 'Shops', cart: 'Cart', orders: 'Orders', profile: 'Profile',
    search: 'Search shops & items...',
    deliveryIn: 'Delivery in', threeHrs: '3 hours max',
    planningFunction: 'Planning a function?',
    functionSubtext: 'Order grocery & party supplies — delivered in 3 hours',
    browseCategories: 'Browse Categories',
    featuredShops: 'Wholesale Shops in Jamui',
    addToCart: 'Add',
    cartEmpty: 'Your cart is empty',
    cartEmptyHint: 'Start shopping to add items',
    cartTotal: 'Cart Total',
    proceedCheckout: 'Proceed to Checkout',
    functionDetails: 'Function Details',
    functionType: 'What is the occasion?',
    functionDate: 'Function Date',
    guestCount: 'Approximate Guests',
    deliveryAddress: 'Delivery Address',
    paymentMode: 'Payment Mode',
    upi: 'UPI (PhonePe, GPay, Paytm)',
    card: 'Credit / Debit Card',
    netbanking: 'Net Banking',
    cod: 'Cash on Delivery',
    placeOrder: 'Place Order',
    orderPlaced: 'Order Placed!',
    orderId: 'Order ID',
    arrivingBy: 'Arriving by',
    trackOrder: 'Track Order',
    continueShopping: 'Continue Shopping',
    noOrders: 'No orders yet',
    yourOrders: 'Your Orders',
    profileTitle: 'Profile & Settings',
    language: 'Language',
    changeVillage: 'Change Village',
    helpline: 'Helpline',
    selectLanguage: 'Select Language',
    chooseLanguageHint: 'Pick your preferred language',
    comingSoon: 'Coming Soon',
    moreLangsHint: 'Local Bihar languages (Bhojpuri, Maithili, Magahi, Angika) coming in v1.1',
  },
  hi: {
    appName: 'विवाकार्ट',
    tagline: 'आपके उत्सव के लिए डोरस्टेप डिलीवरी',
    selectVillage: 'अपना गाँव चुनें',
    panchayat: 'कुंदरी-संकुराहा पंचायत • जमुई, बिहार',
    home: 'होम', shops: 'दुकानें', cart: 'कार्ट', orders: 'ऑर्डर', profile: 'प्रोफाइल',
    search: 'दुकान या सामान खोजें...',
    deliveryIn: 'डिलीवरी', threeHrs: 'अधिकतम 3 घंटे',
    planningFunction: 'कोई फंक्शन है?',
    functionSubtext: 'किराना और पार्टी सामान मंगाएं — 3 घंटे में डिलीवरी',
    browseCategories: 'श्रेणियाँ देखें',
    featuredShops: 'जमुई की होलसेल दुकानें',
    addToCart: 'जोड़ें',
    cartEmpty: 'आपका कार्ट खाली है',
    cartEmptyHint: 'सामान जोड़ने के लिए खरीदारी शुरू करें',
    cartTotal: 'कुल राशि',
    proceedCheckout: 'चेकआउट पर जाएं',
    functionDetails: 'फंक्शन की जानकारी',
    functionType: 'कौन सा अवसर है?',
    functionDate: 'फंक्शन की तारीख',
    guestCount: 'अनुमानित मेहमान',
    deliveryAddress: 'डिलीवरी पता',
    paymentMode: 'भुगतान का तरीका',
    upi: 'UPI (PhonePe, GPay, Paytm)',
    card: 'क्रेडिट / डेबिट कार्ड',
    netbanking: 'नेट बैंकिंग',
    cod: 'कैश ऑन डिलीवरी',
    placeOrder: 'ऑर्डर करें',
    orderPlaced: 'ऑर्डर हो गया!',
    orderId: 'ऑर्डर ID',
    arrivingBy: 'पहुँचेगा',
    trackOrder: 'ऑर्डर ट्रैक करें',
    continueShopping: 'खरीदारी जारी रखें',
    noOrders: 'अभी कोई ऑर्डर नहीं',
    yourOrders: 'आपके ऑर्डर',
    profileTitle: 'प्रोफाइल और सेटिंग्स',
    language: 'भाषा',
    changeVillage: 'गाँव बदलें',
    helpline: 'हेल्पलाइन',
    selectLanguage: 'भाषा चुनें',
    chooseLanguageHint: 'अपनी पसंदीदा भाषा चुनें',
    comingSoon: 'जल्द आ रहा है',
    moreLangsHint: 'स्थानीय बिहार भाषाएं (भोजपुरी, मैथिली, मगही, अंगिका) v1.1 में आएंगी',
  },
};

const CATEGORIES = [
  { id: 'grocery', label: 'Grocery', hindi: 'किराना', emoji: '🛒', shopIds: [1] },
  { id: 'bulk', label: 'Bulk / Wholesale', hindi: 'थोक', emoji: '📦', shopIds: [2] },
  { id: 'party', label: 'Party Supplies', hindi: 'पार्टी सामान', emoji: '🎉', shopIds: [3] },
  { id: 'sweets', label: 'Sweets & Snacks', hindi: 'मिठाई', emoji: '🍡', shopIds: [4] },
  { id: 'veg', label: 'Vegetables', hindi: 'सब्ज़ी', emoji: '🥬', shopIds: [5] },
];

// ============================================================================
// MAIN APP
// ============================================================================
export default function App() {
  const [authUser, setAuthUser] = useState(undefined); // undefined = loading, null = not logged in
  const [screen, setScreen] = useState('splash'); // splash, villageSelect, home, shops, products, cart, checkout, confirm, track, orders, profile
  const [lang, setLang] = useState('en');
  const [village, setVillage] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => setAuthUser(user ?? null));
    return unsub;
  }, []);
  const [cart, setCart] = useState({}); // { productId: { product, shopId, qty } }
  const [currentShop, setCurrentShop] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [orderDetails, setOrderDetails] = useState({
    functionType: '',
    functionDate: '',
    guestCount: '',
    address: '',
    paymentMode: 'upi',
  });
  const [completedOrder, setCompletedOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [previousScreen, setPreviousScreen] = useState('home');

  const openLanguage = () => {
    setPreviousScreen(screen);
    setScreen('language');
  };

  const t = T[lang];

  // Cart helpers
  const addToCart = (product, shopId) => {
    setCart(prev => {
      const existing = prev[product.id];
      return { ...prev, [product.id]: { product, shopId, qty: (existing?.qty || 0) + 1 } };
    });
  };
  const updateQty = (productId, delta) => {
    setCart(prev => {
      const item = prev[productId];
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: { ...item, qty: newQty } };
    });
  };
  const cartItems = Object.values(cart);
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  // ETA helpers
  const getETA = () => {
    const now = new Date();
    const eta = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    return eta.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Place order — saves to Firestore
  const placeOrder = async () => {
    const order = {
      id: 'UB' + Date.now().toString().slice(-8),
      placedAt: new Date(),
      eta: getETA(),
      items: cartItems,
      total: cartTotal,
      village: village,
      phone: authUser?.phoneNumber || '',
      uid: authUser?.uid || '',
      ...orderDetails,
      status: 'CONFIRMED',
      statusIdx: 0,
    };
    try {
      await addDoc(collection(db, 'orders'), { ...order, placedAt: Timestamp.now() });
    } catch {
      // still show confirm even if offline
    }
    setCompletedOrder(order);
    setOrderHistory(prev => [order, ...prev]);
    setCart({});
    setScreen('confirm');
  };

  // ===== AUTH GUARD =====
  if (authUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-rose-600">
        <div className="text-white text-center">
          <div className="text-5xl mb-4">🛒</div>
          <div className="font-bold text-xl">VIVAKART</div>
        </div>
      </div>
    );
  }
  if (authUser === null) {
    return <AuthScreen onAuthSuccess={user => setAuthUser(user)} lang={lang} />;
  }
  if (ADMIN_EMAILS.includes(authUser.email)) {
    return <AdminPanel user={authUser} />;
  }

  // ===== RENDER PHONE FRAME =====
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-0 md:p-6">
      {/* Phone Frame - on desktop shows as phone; on mobile fills screen */}
      <div className="w-full md:w-[420px] md:max-w-[420px] md:rounded-[2.5rem] md:shadow-2xl md:border-8 md:border-stone-900 md:overflow-hidden bg-stone-50 relative" style={{ minHeight: '100vh', maxHeight: '100vh' }}>
        <div className="h-screen md:h-[860px] flex flex-col bg-stone-50 relative overflow-hidden">
          {/* Status Bar Mock (desktop only) */}
          <div className="hidden md:flex justify-between items-center px-6 py-1.5 text-xs font-medium bg-stone-50 text-stone-800">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <Circle className="w-2 h-2 fill-current" />
              <Circle className="w-2 h-2 fill-current" />
              <span className="ml-1">VIVAKART</span>
            </span>
            <span>100%</span>
          </div>

          {/* Screen Router */}
          <div className="flex-1 overflow-y-auto pb-20">
            {screen === 'splash' && <SplashScreen onContinue={() => setScreen('villageSelect')} lang={lang} setLang={setLang} t={t} openLanguage={openLanguage} />}
            {screen === 'villageSelect' && <VillageSelectScreen onSelect={(v) => { setVillage(v); setScreen('home'); }} t={t} lang={lang} />}
            {screen === 'home' && <HomeScreen t={t} lang={lang} village={village} setScreen={setScreen} setActiveCategory={setActiveCategory} setLang={setLang} setCurrentShop={setCurrentShop} openLanguage={openLanguage} />}
            {screen === 'shops' && <ShopsScreen t={t} lang={lang} activeCategory={activeCategory} setCurrentShop={setCurrentShop} setScreen={setScreen} setActiveCategory={setActiveCategory} />}
            {screen === 'products' && currentShop && <ProductsScreen t={t} lang={lang} shop={currentShop} cart={cart} addToCart={addToCart} updateQty={updateQty} onBack={() => setScreen('shops')} />}
            {screen === 'cart' && <CartScreen t={t} lang={lang} cartItems={cartItems} cartTotal={cartTotal} updateQty={updateQty} onCheckout={() => setScreen('checkout')} setScreen={setScreen} />}
            {screen === 'checkout' && <CheckoutScreen t={t} lang={lang} cartTotal={cartTotal} village={village} orderDetails={orderDetails} setOrderDetails={setOrderDetails} onPlace={placeOrder} onBack={() => setScreen('cart')} eta={getETA()} />}
            {screen === 'confirm' && completedOrder && <ConfirmScreen t={t} lang={lang} order={completedOrder} onTrack={() => setScreen('track')} onContinue={() => setScreen('home')} />}
            {screen === 'track' && completedOrder && <TrackScreen t={t} lang={lang} order={completedOrder} onBack={() => setScreen('orders')} />}
            {screen === 'orders' && <OrdersScreen t={t} lang={lang} orders={orderHistory} onView={(o) => { setCompletedOrder(o); setScreen('track'); }} />}
            {screen === 'profile' && <ProfileScreen t={t} lang={lang} setLang={setLang} village={village} setScreen={setScreen} openLanguage={openLanguage} authUser={authUser} />}
            {screen === 'language' && <LanguageScreen t={t} currentLang={lang} setLang={setLang} onBack={() => setScreen(previousScreen)} />}
          </div>

          {/* Bottom Nav (hidden on splash/village select) */}
          {!['splash', 'villageSelect', 'confirm', 'language'].includes(screen) && (
            <BottomNav t={t} screen={screen} setScreen={setScreen} cartCount={cartCount} />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SCREEN: Splash
// ============================================================================
function SplashScreen({ onContinue, lang, setLang, t, openLanguage }) {
  return (
    <div className="h-full flex flex-col items-center justify-between p-8 bg-gradient-to-b from-orange-500 via-rose-500 to-rose-700 text-white">
      <div className="flex justify-end w-full pt-4">
        <button onClick={openLanguage} className="flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1.5 rounded-full text-sm font-medium border border-white/30">
          <Globe className="w-4 h-4" />
          {lang === 'en' ? 'Language' : 'भाषा'}
        </button>
      </div>

      <div className="flex flex-col items-center text-center flex-1 justify-center">
        <div className="w-28 h-28 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center mb-6 border-2 border-white/40 shadow-2xl">
          <span className="text-6xl">🎊</span>
        </div>
        <h1 className="text-4xl font-bold mb-2 tracking-tight">{t.appName}</h1>
        <p className="text-rose-100 text-base leading-snug max-w-xs">{t.tagline}</p>
        
        <div className="mt-10 flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-2.5 rounded-full border border-white/30">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">{lang === 'en' ? 'FREE delivery within 3 hours' : '3 घंटे में मुफ़्त डिलीवरी'}</span>
        </div>
      </div>

      <button 
        onClick={onContinue} 
        className="w-full bg-white text-rose-700 font-bold py-4 rounded-2xl text-lg shadow-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition mb-4"
      >
        {lang === 'en' ? 'Get Started' : 'शुरू करें'}
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// ============================================================================
// SCREEN: Village Selection
// ============================================================================
function VillageSelectScreen({ onSelect, t, lang }) {
  return (
    <div className="p-5 pb-8">
      <div className="mb-6 pt-2">
        <div className="flex items-center gap-2 text-orange-600 mb-1">
          <MapPin className="w-5 h-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">{lang === 'en' ? 'Step 1 of 1' : 'चरण 1 / 1'}</span>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 leading-tight">{t.selectVillage}</h1>
        <p className="text-sm text-stone-600 mt-1">{t.panchayat}</p>
      </div>

      <div className="space-y-2.5">
        {VILLAGES.map(v => (
          <button 
            key={v.id} 
            onClick={() => onSelect(v)}
            className="w-full bg-white border border-stone-200 hover:border-orange-400 hover:bg-orange-50 rounded-2xl p-4 text-left transition active:scale-[0.98] flex items-center justify-between"
          >
            <div>
              <div className="font-semibold text-stone-900">{lang === 'en' ? v.name : v.hindi}</div>
              <div className="text-xs text-stone-500 mt-0.5">PIN {v.pin}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SCREEN: Home
// ============================================================================
function HomeScreen({ t, lang, village, setScreen, setActiveCategory, setLang, setCurrentShop, openLanguage }) {
  return (
    <div className="pb-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-rose-600 px-5 pt-6 pb-12 text-white rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setScreen('villageSelect')} className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <div className="text-left">
              <div className="text-xs text-orange-100 leading-none">{lang === 'en' ? 'Deliver to' : 'डिलीवरी'}</div>
              <div className="font-bold text-sm leading-tight">{lang === 'en' ? village?.name : village?.hindi} <ChevronRight className="w-3.5 h-3.5 inline rotate-90" /></div>
            </div>
          </button>
          <button onClick={openLanguage} className="bg-white/20 backdrop-blur p-2 rounded-full">
            <Globe className="w-4 h-4" />
          </button>
        </div>

        <h1 className="text-2xl font-bold leading-snug">{t.planningFunction}</h1>
        <p className="text-sm text-orange-50 mt-1">{t.functionSubtext}</p>

        <div className="mt-4 bg-white rounded-2xl p-1 flex items-center shadow-lg">
          <Search className="w-5 h-5 text-stone-400 ml-3" />
          <input 
            type="text" 
            placeholder={t.search}
            className="flex-1 px-3 py-2.5 outline-none text-sm text-stone-800 bg-transparent"
          />
        </div>
      </div>

      {/* 3-hour promise ribbon */}
      <div className="mx-5 -mt-6 bg-emerald-600 text-white rounded-2xl p-3.5 shadow-lg flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-xl">
          <Truck className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm flex items-center gap-1.5">
            {lang === 'en' ? 'FREE delivery' : 'मुफ़्त डिलीवरी'} 
            <span className="bg-amber-400 text-emerald-900 text-[10px] font-bold px-1.5 py-0.5 rounded">{lang === 'en' ? 'Within 3 hrs' : '3 घंटे में'}</span>
          </div>
          <div className="text-xs text-emerald-50">{lang === 'en' ? 'From Jamui wholesale shops to your doorstep' : 'जमुई की होलसेल दुकानों से आपके घर तक'}</div>
        </div>
      </div>

      {/* Categories */}
      <div className="mt-6 px-5">
        <h2 className="font-bold text-stone-900 mb-3 text-base">{t.browseCategories}</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {CATEGORIES.map(c => (
            <button 
              key={c.id}
              onClick={() => { setActiveCategory(c); setScreen('shops'); }}
              className="bg-white border border-stone-200 rounded-2xl p-3 flex flex-col items-center hover:border-orange-300 hover:bg-orange-50 transition active:scale-95"
            >
              <span className="text-3xl mb-1">{c.emoji}</span>
              <span className="text-xs font-medium text-stone-800 text-center leading-tight">{lang === 'en' ? c.label : c.hindi}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Shops */}
      <div className="mt-6 px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-stone-900 text-base">{t.featuredShops}</h2>
          <button onClick={() => { setActiveCategory(null); setScreen('shops'); }} className="text-xs text-orange-600 font-semibold">
            {lang === 'en' ? 'See all' : 'सभी देखें'}
          </button>
        </div>
        <div className="space-y-2.5">
          {SHOPS.slice(0, 3).map(s => (
            <button 
              key={s.id} 
              onClick={() => { setCurrentShop(s); setScreen('products'); }}
              className="w-full bg-white border border-stone-200 rounded-2xl p-3.5 flex items-center gap-3 text-left hover:border-orange-300 transition active:scale-[0.99]"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-rose-100 rounded-xl flex items-center justify-center text-3xl shrink-0">
                {s.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-stone-900 text-sm truncate">{lang === 'en' ? s.name : s.hindi}</div>
                <div className="text-xs text-stone-500 truncate">{s.type}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-0.5 text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    <Star className="w-3 h-3 fill-current" /> {s.rating}
                  </span>
                  <span className="text-xs text-stone-500 flex items-center gap-0.5">
                    <Clock className="w-3 h-3" /> 2-3 hrs
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SCREEN: Shops list
// ============================================================================
function ShopsScreen({ t, lang, activeCategory, setCurrentShop, setScreen, setActiveCategory }) {
  const shopsToShow = activeCategory 
    ? SHOPS.filter(s => activeCategory.shopIds.includes(s.id))
    : SHOPS;

  return (
    <div className="p-5">
      <div className="flex items-center gap-3 mb-5 pt-2">
        <button onClick={() => { setActiveCategory(null); setScreen('home'); }} className="p-2 -ml-2">
          <ChevronLeft className="w-5 h-5 text-stone-700" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-stone-900">
            {activeCategory ? (lang === 'en' ? activeCategory.label : activeCategory.hindi) : (lang === 'en' ? 'All Shops' : 'सभी दुकानें')}
          </h1>
          <p className="text-xs text-stone-500">{lang === 'en' ? 'Wholesale shops in Jamui • PIN 811307' : 'जमुई की होलसेल दुकानें • PIN 811307'}</p>
        </div>
      </div>

      <div className="space-y-3">
        {shopsToShow.map(s => (
          <button 
            key={s.id} 
            onClick={() => { setCurrentShop(s); setScreen('products'); }}
            className="w-full bg-white border border-stone-200 rounded-2xl p-4 flex items-start gap-3 text-left hover:border-orange-300 transition active:scale-[0.99]"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-rose-100 rounded-2xl flex items-center justify-center text-4xl shrink-0">
              {s.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold text-stone-900 text-sm leading-tight">{lang === 'en' ? s.name : s.hindi}</div>
                {s.tag && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 shrink-0">{s.tag}</span>}
              </div>
              <div className="text-xs text-stone-600 mt-0.5">{s.type}</div>
              <div className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {s.address}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center gap-0.5 text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                  <Star className="w-3 h-3 fill-current" /> {s.rating}
                </span>
                <span className="text-xs text-stone-600 flex items-center gap-0.5 font-medium">
                  <Clock className="w-3 h-3" /> 2-3 hrs
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SCREEN: Products of a shop
// ============================================================================
function ProductsScreen({ t, lang, shop, cart, addToCart, updateQty, onBack }) {
  const products = PRODUCTS[shop.id] || [];
  const categories = [...new Set(products.map(p => p.cat))];

  return (
    <div>
      {/* Shop header */}
      <div className="bg-gradient-to-br from-orange-500 to-rose-600 text-white px-5 pt-4 pb-5">
        <button onClick={onBack} className="p-2 -ml-2 mb-2">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl">
            {shop.emoji}
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-lg leading-tight">{lang === 'en' ? shop.name : shop.hindi}</h1>
            <div className="text-xs text-orange-50 mt-0.5">{shop.type}</div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="flex items-center gap-0.5 text-xs bg-white/20 px-1.5 py-0.5 rounded">
                <Star className="w-3 h-3 fill-current" /> {shop.rating}
              </span>
              <span className="text-xs flex items-center gap-0.5">
                <Truck className="w-3 h-3" /> 2-3 hrs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Products by category */}
      <div className="px-5 py-4 space-y-5">
        {categories.map(cat => (
          <div key={cat}>
            <h3 className="font-bold text-stone-900 text-sm mb-2.5">{cat}</h3>
            <div className="space-y-2">
              {products.filter(p => p.cat === cat).map(p => {
                const inCart = cart[p.id];
                return (
                  <div key={p.id} className="bg-white border border-stone-200 rounded-2xl p-3 flex items-center gap-3">
                    <div className="w-14 h-14 bg-stone-50 rounded-xl flex items-center justify-center text-3xl shrink-0">
                      {p.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-stone-900 text-sm leading-tight">{p.name}</div>
                      <div className="text-xs text-stone-500 mt-0.5">{p.unit}</div>
                      <div className="font-bold text-stone-900 text-sm mt-1 flex items-center">
                        <IndianRupee className="w-3.5 h-3.5" />{p.price}
                      </div>
                    </div>
                    {inCart ? (
                      <div className="flex items-center bg-orange-500 text-white rounded-xl">
                        <button onClick={() => updateQty(p.id, -1)} className="p-2 active:bg-orange-600 rounded-l-xl">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-sm min-w-[24px] text-center">{inCart.qty}</span>
                        <button onClick={() => updateQty(p.id, 1)} className="p-2 active:bg-orange-600 rounded-r-xl">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => addToCart(p, shop.id)} 
                        className="bg-orange-500 text-white font-bold text-xs px-4 py-2 rounded-xl active:bg-orange-600 active:scale-95 transition"
                      >
                        {t.addToCart} +
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SCREEN: Cart
// ============================================================================
function CartScreen({ t, lang, cartItems, cartTotal, updateQty, onCheckout, setScreen }) {
  if (cartItems.length === 0) {
    return (
      <div className="p-5 flex flex-col items-center justify-center text-center" style={{ minHeight: '60vh' }}>
        <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-4">
          <ShoppingCart className="w-12 h-12 text-stone-400" />
        </div>
        <h2 className="font-bold text-stone-900 text-lg">{t.cartEmpty}</h2>
        <p className="text-stone-500 text-sm mt-1">{t.cartEmptyHint}</p>
        <button onClick={() => setScreen('home')} className="mt-6 bg-orange-500 text-white font-bold px-6 py-3 rounded-xl">
          {lang === 'en' ? 'Browse Shops' : 'दुकानें देखें'}
        </button>
      </div>
    );
  }

  // Group by shop
  const byShop = cartItems.reduce((acc, item) => {
    if (!acc[item.shopId]) acc[item.shopId] = [];
    acc[item.shopId].push(item);
    return acc;
  }, {});

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold text-stone-900 mb-4 pt-2">{lang === 'en' ? 'Your Cart' : 'आपका कार्ट'}</h1>

      {Object.entries(byShop).map(([shopId, items]) => {
        const shop = SHOPS.find(s => s.id === parseInt(shopId));
        return (
          <div key={shopId} className="bg-white border border-stone-200 rounded-2xl p-4 mb-3">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Store className="w-4 h-4 text-orange-600" />
              <span className="font-semibold text-sm text-stone-900">{lang === 'en' ? shop.name : shop.hindi}</span>
            </div>
            {items.map(item => (
              <div key={item.product.id} className="flex items-center gap-3 py-3 border-b border-stone-50 last:border-0">
                <span className="text-2xl">{item.product.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-stone-900 text-sm">{item.product.name}</div>
                  <div className="text-xs text-stone-500">{item.product.unit} • ₹{item.product.price}</div>
                </div>
                <div className="flex items-center bg-orange-100 text-orange-700 rounded-lg">
                  <button onClick={() => updateQty(item.product.id, -1)} className="p-1.5 active:bg-orange-200">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-xs min-w-[20px] text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.product.id, 1)} className="p-1.5 active:bg-orange-200">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="font-bold text-sm text-stone-900 min-w-[60px] text-right">
                  ₹{item.product.price * item.qty}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* Bill */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-3">
        <h3 className="font-bold text-stone-900 text-sm mb-3">{lang === 'en' ? 'Bill Details' : 'बिल विवरण'}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-stone-600">
            <span>{lang === 'en' ? 'Items total' : 'सामान कुल'}</span>
            <span>₹{cartTotal}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>{lang === 'en' ? 'Delivery fee' : 'डिलीवरी शुल्क'}</span>
            <span className="flex items-center gap-1.5">
              <span className="line-through text-stone-400 text-xs">₹30</span>
              <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-1.5 py-0.5 rounded">FREE</span>
            </span>
          </div>
          <div className="flex justify-between font-bold text-stone-900 text-base pt-2 border-t border-stone-100">
            <span>{t.cartTotal}</span>
            <span>₹{cartTotal}</span>
          </div>
        </div>
      </div>

      <button 
        onClick={onCheckout}
        className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl text-base shadow-lg active:bg-orange-600 active:scale-[0.98] transition flex items-center justify-center gap-2"
      >
        {t.proceedCheckout}
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// ============================================================================
// SCREEN: Checkout
// ============================================================================
function CheckoutScreen({ t, lang, cartTotal, village, orderDetails, setOrderDetails, onPlace, onBack, eta }) {
  const canPlace = orderDetails.functionType && orderDetails.functionDate && orderDetails.guestCount && orderDetails.address;

  return (
    <div className="p-5">
      <div className="flex items-center gap-3 mb-4 pt-2">
        <button onClick={onBack} className="p-2 -ml-2">
          <ChevronLeft className="w-5 h-5 text-stone-700" />
        </button>
        <h1 className="text-xl font-bold text-stone-900">{lang === 'en' ? 'Checkout' : 'चेकआउट'}</h1>
      </div>

      {/* ETA badge */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 mb-4 flex items-center gap-3">
        <div className="bg-emerald-600 text-white p-2 rounded-xl">
          <Clock className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-emerald-700 font-medium">{lang === 'en' ? 'Estimated delivery' : 'अनुमानित डिलीवरी'}</div>
          <div className="font-bold text-emerald-900 text-base">{lang === 'en' ? 'By' : ''} {eta}</div>
          <div className="text-xs text-emerald-600">{lang === 'en' ? 'Within 3 hours from now' : 'अभी से 3 घंटे के अंदर'}</div>
        </div>
      </div>

      {/* Function type */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-3">
        <label className="font-bold text-stone-900 text-sm flex items-center gap-2 mb-3">
          <PartyPopper className="w-4 h-4 text-orange-600" /> {t.functionType}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {FUNCTION_TYPES.map(f => {
            const Icon = f.icon;
            const selected = orderDetails.functionType === f.id;
            return (
              <button 
                key={f.id}
                onClick={() => setOrderDetails(prev => ({ ...prev, functionType: f.id }))}
                className={`p-2.5 rounded-xl border-2 transition flex flex-col items-center gap-1 ${selected ? 'border-orange-500 bg-orange-50' : 'border-stone-200 bg-white'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${f.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-medium text-stone-800 text-center leading-tight">
                  {lang === 'en' ? f.label : f.hindi}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Function date + guests */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-3 grid grid-cols-2 gap-3">
        <div>
          <label className="font-semibold text-stone-700 text-xs flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-orange-600" /> {t.functionDate}
          </label>
          <input 
            type="date"
            value={orderDetails.functionDate}
            onChange={e => setOrderDetails(prev => ({ ...prev, functionDate: e.target.value }))}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-orange-500"
          />
        </div>
        <div>
          <label className="font-semibold text-stone-700 text-xs flex items-center gap-1.5 mb-1.5">
            <Users className="w-3.5 h-3.5 text-orange-600" /> {t.guestCount}
          </label>
          <input 
            type="number"
            placeholder="e.g. 100"
            value={orderDetails.guestCount}
            onChange={e => setOrderDetails(prev => ({ ...prev, guestCount: e.target.value }))}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Address */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-3">
        <label className="font-bold text-stone-900 text-sm flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-orange-600" /> {t.deliveryAddress}
        </label>
        <div className="text-xs text-stone-500 mb-2">
          {lang === 'en' ? village?.name : village?.hindi}, PIN {village?.pin}, Kundri-Sankuraha Panchayat, Jamui
        </div>
        <textarea 
          rows={2}
          placeholder={lang === 'en' ? 'House details, landmark, mobile no.' : 'घर का विवरण, पहचान, मोबाइल नंबर'}
          value={orderDetails.address}
          onChange={e => setOrderDetails(prev => ({ ...prev, address: e.target.value }))}
          className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-orange-500 resize-none"
        />
      </div>

      {/* Payment */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-4">
        <label className="font-bold text-stone-900 text-sm mb-3 block">{t.paymentMode}</label>
        <div className="space-y-2">
          {[
            { id: 'upi', label: t.upi, emoji: '📱' },
            { id: 'card', label: t.card, emoji: '💳' },
            { id: 'netbanking', label: t.netbanking, emoji: '🏦' },
            { id: 'cod', label: t.cod, emoji: '💵' },
          ].map(p => (
            <button 
              key={p.id}
              onClick={() => setOrderDetails(prev => ({ ...prev, paymentMode: p.id }))}
              className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition ${orderDetails.paymentMode === p.id ? 'border-orange-500 bg-orange-50' : 'border-stone-200 bg-white'}`}
            >
              <span className="text-2xl">{p.emoji}</span>
              <span className="font-semibold text-sm text-stone-900 flex-1 text-left">{p.label}</span>
              <div className={`w-5 h-5 rounded-full border-2 ${orderDetails.paymentMode === p.id ? 'border-orange-500 bg-orange-500' : 'border-stone-300'}`}>
                {orderDetails.paymentMode === p.id && <CheckCircle2 className="w-full h-full text-white" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Total + Place Order */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-stone-500">{t.cartTotal}</div>
          <div className="font-bold text-xl text-stone-900">₹{cartTotal}</div>
        </div>
        <button 
          onClick={onPlace}
          disabled={!canPlace}
          className={`font-bold px-6 py-3.5 rounded-2xl text-sm shadow-lg flex items-center gap-2 transition ${canPlace ? 'bg-orange-500 text-white active:bg-orange-600 active:scale-95' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
        >
          {t.placeOrder}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      {!canPlace && (
        <p className="text-xs text-rose-600 text-center">
          {lang === 'en' ? 'Please fill all function details to proceed' : 'कृपया सभी विवरण भरें'}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// SCREEN: Order Confirmation
// ============================================================================
function ConfirmScreen({ t, lang, order, onTrack, onContinue }) {
  return (
    <div className="p-5 flex flex-col items-center text-center" style={{ minHeight: '90vh' }}>
      <div className="mt-12 w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-5 animate-pulse">
        <CheckCircle2 className="w-14 h-14 text-emerald-600" />
      </div>
      
      <h1 className="text-2xl font-bold text-stone-900 mb-1">{t.orderPlaced}</h1>
      <p className="text-stone-500 text-sm mb-6">{lang === 'en' ? 'Your order has been confirmed' : 'आपका ऑर्डर कन्फर्म हो गया है'}</p>

      <div className="w-full bg-gradient-to-br from-orange-500 to-rose-600 text-white rounded-2xl p-5 mb-4 shadow-xl">
        <div className="text-xs text-orange-100 uppercase tracking-wider">{t.arrivingBy}</div>
        <div className="text-4xl font-bold mt-1">{order.eta}</div>
        <div className="text-xs text-orange-100 mt-1">
          {lang === 'en' ? 'Within 3 hours • Could be earlier!' : '3 घंटे के अंदर • जल्दी भी हो सकता है'}
        </div>
      </div>

      <div className="w-full bg-white border border-stone-200 rounded-2xl p-4 mb-4 text-left">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-stone-500">{t.orderId}</span>
          <span className="font-bold text-stone-900 text-sm">{order.id}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-stone-500">{lang === 'en' ? 'Items' : 'कुल सामान'}</span>
          <span className="font-semibold text-stone-900 text-sm">{order.items.length} {lang === 'en' ? 'items' : ''}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-stone-500">{lang === 'en' ? 'Amount' : 'राशि'}</span>
          <span className="font-bold text-stone-900 text-sm">₹{order.total}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-stone-500">{lang === 'en' ? 'Payment' : 'भुगतान'}</span>
          <span className="font-semibold text-stone-900 text-sm">{t[order.paymentMode] || order.paymentMode}</span>
        </div>
      </div>

      <div className="w-full space-y-2">
        <button 
          onClick={onTrack}
          className="w-full bg-orange-500 text-white font-bold py-3.5 rounded-2xl text-base shadow-lg active:bg-orange-600 active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          <Truck className="w-5 h-5" /> {t.trackOrder}
        </button>
        <button 
          onClick={onContinue}
          className="w-full bg-white border border-stone-200 text-stone-900 font-semibold py-3 rounded-2xl text-sm"
        >
          {t.continueShopping}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// SCREEN: Order Tracking
// ============================================================================
function TrackScreen({ t, lang, order, onBack }) {
  const [statusIdx, setStatusIdx] = useState(order.statusIdx || 0);
  
  useEffect(() => {
    if (statusIdx < 3) {
      const timer = setTimeout(() => setStatusIdx(s => Math.min(s + 1, 3)), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusIdx]);

  const stages = [
    { label: lang === 'en' ? 'Order Confirmed' : 'ऑर्डर कन्फर्म', desc: lang === 'en' ? 'Shop received your order' : 'दुकान ने ऑर्डर ले लिया', icon: CheckCircle2 },
    { label: lang === 'en' ? 'Being Packed' : 'पैकिंग हो रही है', desc: lang === 'en' ? 'Shopkeeper is preparing items' : 'दुकानदार सामान तैयार कर रहा है', icon: Package },
    { label: lang === 'en' ? 'Out for Delivery' : 'डिलीवरी पर निकला', desc: lang === 'en' ? 'Rider is on the way' : 'राइडर रास्ते में है', icon: Truck },
    { label: lang === 'en' ? 'Delivered' : 'पहुँच गया', desc: lang === 'en' ? 'Order delivered to your address' : 'ऑर्डर आपके पते पर डिलीवर हो गया', icon: Home },
  ];

  return (
    <div className="p-5">
      <div className="flex items-center gap-3 mb-4 pt-2">
        <button onClick={onBack} className="p-2 -ml-2">
          <ChevronLeft className="w-5 h-5 text-stone-700" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-stone-900">{lang === 'en' ? 'Track Order' : 'ऑर्डर ट्रैक करें'}</h1>
          <p className="text-xs text-stone-500">{order.id}</p>
        </div>
      </div>

      {/* ETA card */}
      <div className="bg-gradient-to-br from-orange-500 to-rose-600 text-white rounded-2xl p-5 mb-5 shadow-lg">
        <div className="flex items-center gap-2 text-orange-100 text-xs mb-1">
          <Clock className="w-3.5 h-3.5" /> {t.arrivingBy}
        </div>
        <div className="text-3xl font-bold">{order.eta}</div>
        <div className="text-xs text-orange-100 mt-1">
          {statusIdx < 3 ? (lang === 'en' ? 'Your order is on the way' : 'आपका ऑर्डर रास्ते में है') : (lang === 'en' ? 'Delivered ✓' : 'डिलीवर हो गया ✓')}
        </div>
      </div>

      {/* Status timeline */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-4">
        <h3 className="font-bold text-stone-900 text-sm mb-4">{lang === 'en' ? 'Order Status' : 'ऑर्डर स्थिति'}</h3>
        <div className="space-y-0">
          {stages.map((s, idx) => {
            const Icon = s.icon;
            const done = idx <= statusIdx;
            const isLast = idx === stages.length - 1;
            return (
              <div key={idx} className="flex gap-3 relative">
                {/* line */}
                {!isLast && (
                  <div className={`absolute left-[19px] top-10 bottom-0 w-0.5 ${idx < statusIdx ? 'bg-emerald-500' : 'bg-stone-200'}`} />
                )}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
                  <div className={`font-semibold text-sm ${done ? 'text-stone-900' : 'text-stone-400'}`}>{s.label}</div>
                  <div className={`text-xs mt-0.5 ${done ? 'text-stone-600' : 'text-stone-400'}`}>{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery contact */}
      {statusIdx >= 2 && (
        <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">🛵</div>
          <div className="flex-1">
            <div className="font-semibold text-stone-900 text-sm">Ramesh Kumar</div>
            <div className="text-xs text-stone-500">{lang === 'en' ? 'Your delivery rider' : 'आपका डिलीवरी राइडर'}</div>
          </div>
          <button className="bg-emerald-500 text-white p-2.5 rounded-xl">
            <Phone className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SCREEN: Orders History
// ============================================================================
function OrdersScreen({ t, lang, orders, onView }) {
  if (orders.length === 0) {
    return (
      <div className="p-5 flex flex-col items-center justify-center text-center" style={{ minHeight: '60vh' }}>
        <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-4">
          <Receipt className="w-12 h-12 text-stone-400" />
        </div>
        <h2 className="font-bold text-stone-900 text-lg">{t.noOrders}</h2>
        <p className="text-stone-500 text-sm mt-1">{lang === 'en' ? 'Your orders will appear here' : 'आपके ऑर्डर यहाँ दिखेंगे'}</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold text-stone-900 mb-4 pt-2">{t.yourOrders}</h1>
      <div className="space-y-3">
        {orders.map(o => (
          <button 
            key={o.id} 
            onClick={() => onView(o)}
            className="w-full bg-white border border-stone-200 rounded-2xl p-4 text-left active:scale-[0.99] transition"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-bold text-stone-900 text-sm">{o.id}</div>
                <div className="text-xs text-stone-500">{o.items.length} items • ₹{o.total}</div>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                {lang === 'en' ? 'In Progress' : 'चल रहा है'}
              </span>
            </div>
            <div className="text-xs text-stone-600 flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> {lang === 'en' ? 'Arriving by' : 'पहुँचेगा'} {o.eta}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SCREEN: Profile
// ============================================================================
function ProfileScreen({ t, lang, setLang, village, setScreen, openLanguage, authUser }) {
  return (
    <div className="p-5">
      <h1 className="text-xl font-bold text-stone-900 mb-4 pt-2">{t.profileTitle}</h1>

      <div className="bg-gradient-to-br from-orange-500 to-rose-600 rounded-2xl p-5 text-white mb-4">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
          <User className="w-8 h-8" />
        </div>
        <div className="font-bold text-lg">{authUser?.phoneNumber || (lang === 'en' ? 'Guest User' : 'अतिथि उपयोगकर्ता')}</div>
        <div className="text-xs text-orange-100 mt-0.5 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {lang === 'en' ? village?.name : village?.hindi}, PIN {village?.pin}
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden mb-3">
        <button onClick={openLanguage} className="w-full p-4 flex items-center gap-3 border-b border-stone-100 active:bg-stone-50">
          <Globe className="w-5 h-5 text-orange-600" />
          <span className="flex-1 text-left font-medium text-stone-900 text-sm">{t.language}</span>
          <span className="text-xs text-stone-500">{lang === 'en' ? 'English' : 'हिंदी'}</span>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>
        <button onClick={() => setScreen('villageSelect')} className="w-full p-4 flex items-center gap-3 border-b border-stone-100 active:bg-stone-50">
          <MapPin className="w-5 h-5 text-orange-600" />
          <span className="flex-1 text-left font-medium text-stone-900 text-sm">{t.changeVillage}</span>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>
        <button className="w-full p-4 flex items-center gap-3 border-b border-stone-100 active:bg-stone-50">
          <Phone className="w-5 h-5 text-orange-600" />
          <span className="flex-1 text-left font-medium text-stone-900 text-sm">{t.helpline}</span>
          <span className="text-xs text-stone-500">+91 9XXXXXXXXX</span>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>
        <button onClick={() => signOut(auth)} className="w-full p-4 flex items-center gap-3 active:bg-stone-50 text-red-500">
          <LogOut className="w-5 h-5" />
          <span className="flex-1 text-left font-medium text-sm">{lang === 'en' ? 'Sign Out' : 'साइन आउट'}</span>
        </button>
      </div>

      <div className="text-center text-xs text-stone-400 mt-6">
        VIVAKART v0.1 • Demo Prototype<br />
        Made for Kundri-Sankuraha Panchayat
      </div>
    </div>
  );
}

// ============================================================================
// SCREEN: Language Selection
// ============================================================================
function LanguageScreen({ t, currentLang, setLang, onBack }) {
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', region: 'International', available: true, emoji: '🌐' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', region: 'भारत • India', available: true, emoji: '🇮🇳' },
    { code: 'bh', name: 'Bhojpuri', nativeName: 'भोजपुरी', region: 'बिहार • Bihar', available: false, emoji: '🪷' },
    { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', region: 'बिहार • Bihar', available: false, emoji: '🪷' },
    { code: 'mag', name: 'Magahi', nativeName: 'मगही', region: 'जमुई क्षेत्र • Jamui Region', available: false, emoji: '🪷' },
    { code: 'ang', name: 'Angika', nativeName: 'अंगिका', region: 'जमुई • Jamui', available: false, emoji: '🪷' },
  ];

  return (
    <div className="p-5 pb-20">
      <div className="flex items-center gap-3 mb-5 pt-2">
        <button onClick={onBack} className="p-2 -ml-2">
          <ChevronLeft className="w-5 h-5 text-stone-700" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-stone-900">{t.selectLanguage}</h1>
          <p className="text-xs text-stone-500">{t.chooseLanguageHint}</p>
        </div>
      </div>

      <div className="space-y-2">
        {languages.map(l => {
          const isSelected = currentLang === l.code;
          return (
            <button
              key={l.code}
              onClick={() => {
                if (l.available) {
                  setLang(l.code);
                  onBack();
                }
              }}
              disabled={!l.available}
              className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3 text-left transition
                ${isSelected ? 'border-orange-500 bg-orange-50' : 'border-stone-200 bg-white'}
                ${!l.available ? 'opacity-60' : 'active:scale-[0.99] hover:border-orange-300'}
              `}
            >
              <span className="text-3xl">{l.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-stone-900 text-base">{l.nativeName}</div>
                <div className="text-xs text-stone-500 truncate">{l.name} • {l.region}</div>
              </div>
              {isSelected && (
                <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              )}
              {!l.available && (
                <span className="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded shrink-0">
                  {t.comingSoon}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-stone-400 mt-6 text-center leading-relaxed px-4">
        {t.moreLangsHint}
      </p>
    </div>
  );
}

// ============================================================================
// BOTTOM NAV
// ============================================================================
function BottomNav({ t, screen, setScreen, cartCount }) {
  const items = [
    { id: 'home', icon: Home, label: t.home },
    { id: 'shops', icon: Store, label: t.shops },
    { id: 'cart', icon: ShoppingCart, label: t.cart, badge: cartCount },
    { id: 'orders', icon: Receipt, label: t.orders },
    { id: 'profile', icon: User, label: t.profile },
  ];
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-2 py-2 flex justify-around shadow-2xl">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = screen === item.id || (item.id === 'shops' && screen === 'products');
        return (
          <button 
            key={item.id} 
            onClick={() => setScreen(item.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition relative ${isActive ? 'text-orange-600' : 'text-stone-400'}`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'fill-orange-100' : ''}`} />
            <span className="text-[10px] font-semibold">{item.label}</span>
            {item.badge > 0 && (
              <span className="absolute -top-0.5 right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
