import React, { useState, useEffect } from 'react';
import { 
  Language, 
  ActiveView, 
  FlowerProduct, 
  CartItem, 
  Order, 
  PaymentMethod, 
  PriceTier,
  BouquetRecipeItem
} from './types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from './data/initialData';
import { Header } from './components/Header';
import { POSCatalog } from './components/POSCatalog';
import { SalesReport } from './components/SalesReport';
import { AdminPanel } from './components/AdminPanel';
import { ReceiptModal } from './components/ReceiptModal';
import { APKDownloadModal } from './components/APKDownloadModal';
import { QuickCheckoutModal, CheckoutOrderItem } from './components/QuickCheckoutModal';
import { BouquetBuilderModal } from './components/BouquetBuilderModal';

export default function App() {
  // Localization & Direction
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('comaiit_lang');
    return (saved as Language) || 'ar';
  });

  // Current active view
  const [activeView, setActiveView] = useState<ActiveView>('pos');

  // Stock Visibility Control
  const [showStock, setShowStock] = useState<boolean>(() => {
    const saved = localStorage.getItem('comaiit_show_stock');
    return saved !== null ? saved === 'true' : true;
  });

  // Flower Inventory Products
  const [products, setProducts] = useState<FlowerProduct[]>(() => {
    const saved = localStorage.getItem('comaiit_products_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved products', e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  // Sales Orders Ledger
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('comaiit_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved orders', e);
      }
    }
    return INITIAL_ORDERS;
  });

  // Current Customer Order Tray (Allows adding multiple items with standard & offer prices for 1 customer)
  const [cart, setCart] = useState<CartItem[]>([]);

  // Modals State
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isAPKModalOpen, setIsAPKModalOpen] = useState(false);
  const [isBouquetBuilderOpen, setIsBouquetBuilderOpen] = useState(false);

  // Checkout Items State (Handles single item Buy Now or multi-item customer order with Cash/Card/Split)
  const [isQuickCheckoutOpen, setIsQuickCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CheckoutOrderItem[]>([]);

  // Admin Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Sync RTL / LTR document attributes when language changes
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('comaiit_lang', lang);
  }, [lang]);

  // Persist products and orders to localStorage
  useEffect(() => {
    localStorage.setItem('comaiit_products_v2', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('comaiit_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('comaiit_show_stock', String(showStock));
  }, [showStock]);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const handleToggleStock = () => {
    setShowStock((prev) => !prev);
  };

  // Add Item to Customer Order Tray (Preserves distinct Standard vs Discounted price tiers for the same customer)
  const handleAddToCustomerOrder = (
    product: FlowerProduct,
    priceTier: PriceTier,
    quantity: number
  ) => {
    const unitPrice =
      priceTier === 'standard' ? product.standardPrice : product.discountedPrice;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.productId === product.id && item.priceTier === priceTier
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        const newItem: CartItem = {
          id: `${product.id}-${priceTier}-${Date.now()}`,
          productId: product.id,
          nameAr: product.nameAr,
          nameEn: product.nameEn,
          priceTier,
          unitPrice,
          quantity,
          imageUrl: product.imageUrl,
        };
        return [...prevCart, newItem];
      }
    });
  };

  const handleRemoveCustomerOrderItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const handleClearCustomerOrder = () => {
    setCart([]);
  };

  // Checkout Multi-Item Customer Order
  const handleCheckoutCustomerOrder = () => {
    if (cart.length === 0) return;
    setCheckoutItems(
      cart.map((it) => ({
        productId: it.productId,
        nameAr: it.nameAr,
        nameEn: it.nameEn,
        priceTier: it.priceTier,
        unitPrice: it.unitPrice,
        quantity: it.quantity,
        imageUrl: it.imageUrl,
      }))
    );
    setIsQuickCheckoutOpen(true);
  };

  // Buy Now clicked on a single card
  const handleTriggerBuyNow = (
    product: FlowerProduct,
    tier: PriceTier,
    quantity: number
  ) => {
    const unitPrice =
      tier === 'standard' ? product.standardPrice : product.discountedPrice;
    setCheckoutItems([
      {
        productId: product.id,
        nameAr: product.nameAr,
        nameEn: product.nameEn,
        priceTier: tier,
        unitPrice,
        quantity,
        imageUrl: product.imageUrl,
      },
    ]);
    setIsQuickCheckoutOpen(true);
  };

  // Confirm Order Execution (Handles Single, Multi-Item, Cash, Card, and Split Payment)
  const handleConfirmOrder = (
    items: CheckoutOrderItem[],
    paymentMethod: PaymentMethod,
    cashAmount?: number,
    cardAmount?: number
  ) => {
    const grossTotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const subtotal = grossTotal / 1.15;
    const taxAmount = grossTotal - subtotal;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `CMT-${randomSuffix}`;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      date: dateStr,
      timestamp: timeStr,
      items: items.map((it) => ({
        productId: it.productId,
        nameAr: it.nameAr,
        nameEn: it.nameEn,
        quantity: it.quantity,
        priceTier: it.priceTier,
        unitPrice: it.unitPrice,
        lineTotal: it.unitPrice * it.quantity,
      })),
      subtotal,
      taxAmount,
      total: grossTotal,
      paymentMethod,
      cashReceived: cashAmount,
      cardAmount: cardAmount,
      changeGiven:
        paymentMethod === 'cash' && cashAmount && cashAmount >= grossTotal
          ? cashAmount - grossTotal
          : 0,
      cashierName: lang === 'ar' ? 'فهد السبيعي (الكاشير)' : 'Fahad (Cashier)',
    };

    // Deduct stock levels for all items purchased
    setProducts((prev) =>
      prev.map((prod) => {
        const matchingPurchases = items.filter((it) => it.productId === prod.id);
        if (matchingPurchases.length > 0) {
          const totalSold = matchingPurchases.reduce((s, it) => s + it.quantity, 0);
          return {
            ...prod,
            stock: Math.max(0, prod.stock - totalSold),
          };
        }
        return prod;
      })
    );

    // Clear customer tray cart
    setCart([]);

    // Save order into ledger (Admin Panel)
    setOrders((prev) => [newOrder, ...prev]);

    // Open Receipt Modal
    setActiveReceiptOrder(newOrder);
    setIsReceiptModalOpen(true);
  };

  // Bouquet Builder Actions
  const handleSaveBouquetToCatalog = (newBouquetData: Omit<FlowerProduct, 'id'>) => {
    const newBouquet: FlowerProduct = {
      ...newBouquetData,
      id: `bq-${Date.now()}`,
    };
    setProducts((prev) => [newBouquet, ...prev]);
  };

  const handleDirectBuyBouquet = (
    bouquetItem: FlowerProduct,
    tier: PriceTier,
    quantity: number,
    recipe: BouquetRecipeItem[]
  ) => {
    // Deduct individual flower stems used in the recipe
    setProducts((prev) =>
      prev.map((prod) => {
        const recipeItem = recipe.find((r) => r.flowerId === prod.id);
        if (recipeItem) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - recipeItem.stemsCount * quantity),
          };
        }
        return prod;
      })
    );

    const unitPrice =
      tier === 'standard' ? bouquetItem.standardPrice : bouquetItem.discountedPrice;

    // Open Checkout for this custom bouquet
    setCheckoutItems([
      {
        productId: bouquetItem.id,
        nameAr: bouquetItem.nameAr,
        nameEn: bouquetItem.nameEn,
        priceTier: tier,
        unitPrice,
        quantity,
        imageUrl: bouquetItem.imageUrl,
      },
    ]);
    setIsQuickCheckoutOpen(true);
  };

  // Admin Management Operations
  const handleAuthenticateAdmin = (pin: string) => {
    if (pin === '1234' || pin === '0000') {
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleAddProduct = (newProdData: Omit<FlowerProduct, 'id'>) => {
    const newProduct: FlowerProduct = {
      ...newProdData,
      id: `flw-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updated: FlowerProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleQuickRestock = (id: string, amount: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: p.stock + amount } : p))
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f8] text-stone-800">
      {/* Header Navigation with Icon-Only Controls */}
      <Header
        lang={lang}
        onToggleLang={handleToggleLang}
        activeView={activeView}
        onChangeView={setActiveView}
        showStock={showStock}
        onToggleStock={handleToggleStock}
        onOpenAPKModal={() => setIsAPKModalOpen(true)}
        cartCount={cart.reduce((s, it) => s + it.quantity, 0)}
        onOpenAdminAuth={() => {
          setActiveView('admin');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {activeView === 'pos' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
            {/* Flowers Catalog with Multi-Item Customer Tray, 1-10 buttons, and Buy Now */}
            <POSCatalog
              products={products}
              lang={lang}
              showStock={showStock}
              customerOrder={cart}
              onRemoveCustomerOrderItem={handleRemoveCustomerOrderItem}
              onClearCustomerOrder={handleClearCustomerOrder}
              onCheckoutCustomerOrder={handleCheckoutCustomerOrder}
              onBuyNow={handleTriggerBuyNow}
              onOpenBouquetBuilder={() => setIsBouquetBuilderOpen(true)}
            />
          </div>
        )}

        {activeView === 'sales' && (
          <SalesReport
            orders={orders}
            lang={lang}
            onViewReceipt={(order) => {
              setActiveReceiptOrder(order);
              setIsReceiptModalOpen(true);
            }}
          />
        )}

        {activeView === 'admin' && (
          <AdminPanel
            products={products}
            orders={orders}
            lang={lang}
            showStock={showStock}
            onToggleStock={handleToggleStock}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onQuickRestock={handleQuickRestock}
            isAuthenticated={isAdminAuthenticated}
            onAuthenticate={handleAuthenticateAdmin}
            onLogoutAdmin={() => setIsAdminAuthenticated(false)}
            onViewReceipt={(order) => {
              setActiveReceiptOrder(order);
              setIsReceiptModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Checkout Modal (Cash, Card, or Split Cash + Card) */}
      <QuickCheckoutModal
        isOpen={isQuickCheckoutOpen}
        onClose={() => setIsQuickCheckoutOpen(false)}
        lang={lang}
        items={checkoutItems}
        onConfirmOrder={handleConfirmOrder}
      />

      {/* Custom Bouquet Recipe Builder Modal */}
      <BouquetBuilderModal
        isOpen={isBouquetBuilderOpen}
        onClose={() => setIsBouquetBuilderOpen(false)}
        lang={lang}
        availableFlowers={products}
        onSaveBouquetToCatalog={handleSaveBouquetToCatalog}
        onDirectBuyBouquet={handleDirectBuyBouquet}
      />

      {/* Receipt Modal (Thermal Print, Print Accepted & Done to Admin) */}
      <ReceiptModal
        order={activeReceiptOrder}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        lang={lang}
        onConfirmDone={() => {
          setIsReceiptModalOpen(false);
        }}
      />

      {/* Android APK Download Modal */}
      <APKDownloadModal
        isOpen={isAPKModalOpen}
        onClose={() => setIsAPKModalOpen(false)}
        lang={lang}
      />
    </div>
  );
}
