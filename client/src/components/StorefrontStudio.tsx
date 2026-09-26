import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Heart,
  Menu,
  Minus,
  Monitor,
  Plus,
  Search,
  ShoppingBag,
  Smartphone,
  X,
} from "lucide-react";
import assets from "../content/asset-library.json";

const assetByFilename = Object.fromEntries(assets.map((item) => [item.filename, item.storageUrl]));
const asset = (filename: string) => assetByFilename[filename] ?? "";

type Variant = { label: string; price: number; image: string; angle?: string };
type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  angle?: string;
  description: string;
  variants: Variant[];
};

type View = "home" | "collection" | "product" | "about";
type Device = "desktop" | "mobile";

const products: Product[] = [
  {
    id: "cleanser",
    name: "Gentle Cleanser",
    category: "Cleansers",
    price: 34,
    image: asset("solenne-gentle-cleanser-250ml-front.webp"),
    angle: asset("solenne-gentle-cleanser-250ml-angle.webp"),
    description: "A soft-lather cleanser for the first, unhurried step of your daily ritual.",
    variants: [
      { label: "150 ml", price: 24, image: asset("solenne-gentle-cleanser-150ml-front.webp") },
      { label: "250 ml", price: 34, image: asset("solenne-gentle-cleanser-250ml-front.webp"), angle: asset("solenne-gentle-cleanser-250ml-angle.webp") },
    ],
  },
  {
    id: "serum",
    name: "Hydrating Serum",
    category: "Serums & oils",
    price: 38,
    image: asset("solenne-hydrating-serum-30ml-front.webp"),
    angle: asset("solenne-hydrating-serum-angle.webp"),
    description: "Light, quick-absorbing moisture made for easy everyday layering.",
    variants: [
      { label: "30 ml", price: 38, image: asset("solenne-hydrating-serum-30ml-front.webp"), angle: asset("solenne-hydrating-serum-angle.webp") },
      { label: "50 ml", price: 54, image: asset("solenne-hydrating-serum-50ml-front.webp"), angle: asset("solenne-hydrating-serum-50ml-angle.webp") },
    ],
  },
  {
    id: "cream",
    name: "Barrier Cream",
    category: "Moisturizers",
    price: 42,
    image: asset("solenne-barrier-cream-50ml-front.webp"),
    angle: asset("solenne-barrier-cream-50ml-angle.webp"),
    description: "A cushiony final step that brings a little softness to your routine.",
    variants: [{ label: "50 ml", price: 42, image: asset("solenne-barrier-cream-50ml-front.webp"), angle: asset("solenne-barrier-cream-50ml-angle.webp") }],
  },
  {
    id: "oil",
    name: "Botanical Face Oil",
    category: "Serums & oils",
    price: 46,
    image: asset("solenne-botanical-face-oil-30ml-front.webp"),
    angle: asset("solenne-botanical-face-oil-30ml-angle.webp"),
    description: "A few considered drops to finish your evening ritual.",
    variants: [{ label: "30 ml", price: 46, image: asset("solenne-botanical-face-oil-30ml-front.webp"), angle: asset("solenne-botanical-face-oil-30ml-angle.webp") }],
  },
  {
    id: "set",
    name: "Daily Routine Set",
    category: "Sets",
    price: 89,
    image: asset("solenne-daily-routine-set.webp"),
    description: "Four botanical essentials, gathered together in one simple ritual.",
    variants: [{ label: "The set", price: 89, image: asset("solenne-daily-routine-set.webp") }],
  },
];

const templateInfo: Record<View, { label: string; kicker: string; title: string; description: string; anatomy: string[] }> = {
  home: {
    label: "Home page",
    kicker: "01 · FIRST IMPRESSION",
    title: "A home page gives the brand a point of view.",
    description: "Lead with one clear promise, one strong visual and one useful next step. Then show people where to go next.",
    anatomy: ["Announcement bar · one small confidence-builder", "Header · logo, navigation and an always-visible bag", "Hero · promise, supporting line, single primary action", "Featured collection · a short route into the catalogue", "Brand story · make the materials and point of view tangible", "Footer · help, policies and email capture"],
  },
  collection: {
    label: "Collection page",
    kicker: "02 · HELP THEM CHOOSE",
    title: "A collection page turns browsing into a shortlist.",
    description: "Name the edit, set expectations, then make products easy to scan, sort, filter and compare.",
    anatomy: ["Breadcrumb · show where this collection lives", "Collection intro · name, mood and context", "Filter + sort · put control in the shopper’s hands", "Product grid · consistent images, names and prices", "Quick add · a low-friction shortcut, without hiding details"],
  },
  product: {
    label: "Product page",
    kicker: "03 · MAKE THE DECISION EASY",
    title: "A product page answers the quiet questions.",
    description: "Put the product and its details side by side. Let the image, variant, price, benefits and action work together.",
    anatomy: ["Gallery · show the object clearly from useful angles", "Identity + price · make the exact item unambiguous", "Variants · show size and price before adding to bag", "Primary action · keep add-to-bag clear and reachable", "Details · explain use, materials, shipping and care"],
  },
  about: {
    label: "About page",
    kicker: "04 · MAKE IT MEAN SOMETHING",
    title: "An About page shows why the work looks this way.",
    description: "Connect the origin, materials and making choices to a simple invitation to explore the range.",
    anatomy: ["Point of view · one sentence to hold the page together", "Editorial image · texture and evidence rather than decoration", "Process · a few specific, honest choices", "Invitation · return naturally to the products"],
  },
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export default function StorefrontStudio() {
  const [view, setView] = useState<View>("home");
  const [device, setDevice] = useState<Device>("desktop");
  const [selectedProductId, setSelectedProductId] = useState("serum");
  const [variantByProduct, setVariantByProduct] = useState<Record<string, number>>({});
  const [imageAngle, setImageAngle] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [filter, setFilter] = useState("Everything");
  const [sort, setSort] = useState("Featured");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [storeQuery, setStoreQuery] = useState("");
  const [savedProductIds, setSavedProductIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? products[1];
  const selectedVariantIndex = Math.min(variantByProduct[selectedProduct.id] ?? 0, selectedProduct.variants.length - 1);
  const selectedVariant = selectedProduct.variants[selectedVariantIndex];
  const currentImage = imageAngle && selectedVariant.angle ? selectedVariant.angle : selectedVariant.image;
  const categories = ["Everything", "Cleansers", "Serums & oils", "Moisturizers", "Sets"];
  const filteredProducts = useMemo(() => {
    let list = products.filter((product) => filter === "Everything" || product.category === filter);
    if (storeQuery.trim()) list = list.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(storeQuery.trim().toLowerCase()));
    if (sort === "Price: low to high") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "Price: high to low") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "Name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [filter, sort, storeQuery]);

  const cartItems = Object.entries(cart).map(([key, count]) => {
    const [productId, variantValue] = key.split("|");
    const product = products.find((item) => item.id === productId)!;
    const variantIndex = Number(variantValue);
    const variant = product.variants[variantIndex] ?? product.variants[0];
    return { key, product, variant, count };
  });
  const cartCount = cartItems.reduce((sum, item) => sum + item.count, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.variant.price * item.count, 0);

  const notify = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 2200);
  };
  const addToBag = (product: Product, index = 0, count = 1) => {
    const key = `${product.id}|${index}`;
    setCart((current) => ({ ...current, [key]: (current[key] ?? 0) + count }));
    notify(`${product.name} added to your bag`);
  };
  const openProduct = (product: Product) => {
    setSelectedProductId(product.id);
    setVariantByProduct((current) => ({ ...current, [product.id]: current[product.id] ?? 0 }));
    setImageAngle(false);
    setQuantity(1);
    setView("product");
  };
  const updateCartItem = (key: string, delta: number) => {
    setCart((current) => {
      const next = { ...current };
      const updated = (next[key] ?? 0) + delta;
      if (updated <= 0) delete next[key]; else next[key] = updated;
      return next;
    });
  };
  const toggleSaved = (id: string) => setSavedProductIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const productCard = (product: Product) => (
    <article className="template-product-card" key={product.id}>
      <button className="template-product-image" onClick={() => openProduct(product)} aria-label={`View ${product.name}`}>
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="template-product-quick">View details <ArrowRight size={13} /></span>
      </button>
      <div className="template-product-meta"><div><span>{product.category}</span><h4>{product.name}</h4></div><button className={`template-heart ${savedProductIds.includes(product.id) ? "saved" : ""}`} onClick={() => toggleSaved(product.id)} aria-label={`${savedProductIds.includes(product.id) ? "Remove" : "Save"} ${product.name}`}><Heart size={15} fill={savedProductIds.includes(product.id) ? "currentColor" : "none"} /></button></div>
      <div className="template-product-price"><span>From {money(Math.min(...product.variants.map((variant) => variant.price)))}</span><button onClick={() => addToBag(product)} aria-label={`Quick add ${product.name}`}>Quick add <Plus size={12} /></button></div>
    </article>
  );

  return (
    <section className="storefront-studio" id="storefront-studio" aria-label="Responsive storefront-page templates">
      <div className="store-studio-heading">
        <div className="store-studio-kicker"><span /> A PRACTICAL STORE DESIGN WALKTHROUGH</div>
        <h2>How a storefront <em>actually works.</em></h2>
        <p>Switch between real page patterns, change the preview size, and see what each page needs to do. These examples use your SOLENNE products and imagery.</p>
      </div>

      <div className="store-studio-toolbar">
        <div className="store-template-tabs" role="tablist" aria-label="Choose storefront page template">
          {(["home", "collection", "product", "about"] as View[]).map((item) => <button key={item} role="tab" aria-selected={view === item} className={view === item ? "selected" : ""} onClick={() => { setView(item); setCartOpen(false); }}>{templateInfo[item].label}</button>)}
        </div>
        <div className="store-device-switch" aria-label="Preview size">
          <button className={device === "desktop" ? "selected" : ""} onClick={() => setDevice("desktop")} aria-pressed={device === "desktop"} aria-label="Preview desktop layout"><Monitor size={14} /><span>Desktop</span></button>
          <button className={device === "mobile" ? "selected" : ""} onClick={() => setDevice("mobile")} aria-pressed={device === "mobile"} aria-label="Preview mobile layout"><Smartphone size={14} /><span>Mobile</span></button>
        </div>
      </div>

      <div className="store-studio-explainer"><span>{templateInfo[view].kicker}</span><p>{templateInfo[view].description}</p></div>

      <div className="store-preview-stage">
        <div className={`store-preview-shell ${device === "mobile" ? "device-phone" : ""}`}>
          <div className="template-announcement"><span>Complimentary shipping on orders over $60</span><span>Thoughtful care, every day</span></div>
          <header className="template-store-header">
            <button className="template-mobile-menu" aria-label="Open menu" onClick={() => setView("collection")}><Menu size={17} /></button>
            <button className="template-wordmark" onClick={() => setView("home")}>SOLENNE</button>
            <nav className="template-shop-nav" aria-label="Store preview navigation">
              <button className={view === "collection" ? "active" : ""} onClick={() => setView("collection")}>Shop</button>
              <button onClick={() => setView("about")}>Our story</button>
              <button onClick={() => setView("collection")}>The ritual</button>
            </nav>
            <div className="template-head-tools">
              <button className="template-search-toggle" aria-label="Search products" onClick={() => setSearchOpen((open) => !open)}><Search size={16} /></button>
              <button className="template-bag" onClick={() => setCartOpen(true)} aria-label={`Open bag, ${cartCount} items`}><span>Bag</span><ShoppingBag size={16} /><b>{cartCount}</b></button>
            </div>
          </header>

          {searchOpen && <div className="template-search-bar"><Search size={15} /><input autoFocus value={storeQuery} onChange={(event) => { setStoreQuery(event.target.value); setView("collection"); }} placeholder="Search the ritual…" aria-label="Search store preview products" /><button onClick={() => { setStoreQuery(""); setSearchOpen(false); }} aria-label="Close search"><X size={15} /></button></div>}

          <div className="template-store-page">
            {view === "home" && <>
              <section className="template-home-hero">
                <div className="template-home-copy"><span>THE EVERYDAY RITUAL</span><h1>Simple routines.<br /><em>Calm skin.</em></h1><p>Four botanical essentials, and nothing you don’t need.</p><button onClick={() => setView("collection")}>Discover the ritual <ArrowRight size={14} /></button><small>MADE WITH INTENTION · DESIGNED FOR EVERY DAY</small></div>
                <div className="template-home-image"><img src={asset("solenne-hero-desktop.webp")} alt="The SOLENNE everyday skincare collection" /></div>
              </section>
              <div className="template-proof-strip"><span>PLANT-INSPIRED FORMULAS</span><i /><span>THOUGHTFUL PACKAGING</span><i /><span>A ROUTINE, NOT A RUSH</span></div>
              <section className="template-featured"><div className="template-section-heading"><div><span>THE SOLENNE EDIT</span><h2>Meet your new essentials.</h2></div><button onClick={() => setView("collection")}>Shop everything <ArrowRight size={13} /></button></div><div className="template-product-grid">{products.slice(0, 4).map(productCard)}</div></section>
              <section className="template-home-story"><img src={asset("solenne-routine-shelf.webp")} alt="SOLENNE products arranged for a daily routine" loading="lazy" /><div><span>LESS, WITH PURPOSE</span><h2>A slower kind<br />of skincare.</h2><p>Thoughtful steps. Clear choices. A small set of daily essentials made to work beautifully together.</p><button onClick={() => setView("about")}>Meet SOLENNE <ArrowRight size={13} /></button></div></section>
            </>}

            {view === "collection" && <>
              <div className="template-collection-banner"><img src={asset("solenne-collection-best-sellers.webp")} alt="SOLENNE best-selling skincare collection" /><div><span>THE SOLENNE EDIT · 05 ESSENTIALS</span><h1>Care, considered.</h1><p>Explore the daily essentials, gathered in one place.</p></div></div>
              <div className="template-collection-tools"><div className="template-collection-label"><span>SHOP</span><h2>All essentials <small>{filteredProducts.length}</small></h2></div><div className="template-filters" aria-label="Filter by product type">{categories.map((category) => <button key={category} className={filter === category ? "selected" : ""} onClick={() => setFilter(category)}>{category}</button>)}</div><label className="template-sort"><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products"><option>Featured</option><option>Price: low to high</option><option>Price: high to low</option><option>Name</option></select><ChevronDown size={13} /></label></div>
              {filteredProducts.length ? <div className="template-product-grid collection-grid">{filteredProducts.map(productCard)}</div> : <div className="template-no-products">No products in this edit. Try another filter.</div>}
            </>}

            {view === "product" && <>
              <div className="template-breadcrumb"><button onClick={() => setView("home")}>Home</button><span>/</span><button onClick={() => setView("collection")}>Shop</button><span>/</span><span>{selectedProduct.name}</span></div>
              <div className="template-product-detail">
                <div className="template-product-gallery"><div className="template-product-main-image"><img src={currentImage || selectedProduct.image} alt={`${selectedProduct.name}, ${imageAngle ? "alternate angle" : "front view"}`} /><span className="template-image-count">{imageAngle ? "02" : "01"} / {selectedVariant.angle ? "02" : "01"}</span></div><div className="template-thumbnails"><button className={!imageAngle ? "selected" : ""} onClick={() => setImageAngle(false)}><img src={selectedVariant.image} alt={`${selectedProduct.name} front view`} /></button>{selectedVariant.angle && <button className={imageAngle ? "selected" : ""} onClick={() => setImageAngle(true)}><img src={selectedVariant.angle} alt={`${selectedProduct.name} alternate view`} /></button>}</div></div>
                <div className="template-product-info"><div className="template-product-eyebrow">SOLENNE · {selectedProduct.category.toUpperCase()}</div><h1>{selectedProduct.name}</h1><div className="template-detail-price">{money(selectedVariant.price)} <span>USD</span></div><p className="template-detail-description">{selectedProduct.description}</p>
                  <label className="template-option-label">SIZE <span>{selectedVariant.label}</span></label><div className="template-variant-buttons">{selectedProduct.variants.map((variant, index) => <button key={variant.label} className={index === selectedVariantIndex ? "selected" : ""} onClick={() => { setVariantByProduct((current) => ({ ...current, [selectedProduct.id]: index })); setImageAngle(false); }}><span>{variant.label}</span><small>{money(variant.price)}</small></button>)}</div>
                  <div className="template-qty-add"><div className="template-quantity" aria-label="Quantity"><button onClick={() => setQuantity((count) => Math.max(1, count - 1))} aria-label="Decrease quantity"><Minus size={13} /></button><span>{quantity}</span><button onClick={() => setQuantity((count) => count + 1)} aria-label="Increase quantity"><Plus size={13} /></button></div><button className="template-add-button" onClick={() => addToBag(selectedProduct, selectedVariantIndex, quantity)}>Add to bag · {money(selectedVariant.price * quantity)} <ArrowRight size={14} /></button></div>
                  <p className="template-shipping-note"><Check size={13} /> Complimentary shipping over $60</p><details className="template-product-detail-accordion" open><summary>How it fits your ritual <ChevronDown size={14} /></summary><p>{selectedProduct.description} Use as part of the routine that feels right for you.</p></details><details className="template-product-detail-accordion"><summary>Details & ingredients <ChevronDown size={14} /></summary><p>Simple directions, a clear ingredient list and straightforward product-care information belong here.</p></details><details className="template-product-detail-accordion"><summary>Shipping & returns <ChevronDown size={14} /></summary><p>Set expectations clearly: dispatch timing, shipping options and the returns policy.</p></details>
                </div>
              </div>
              <section className="template-featured template-you-may-like"><div className="template-section-heading"><div><span>COMPLETE YOUR RITUAL</span><h2>Make room for one more.</h2></div></div><div className="template-product-grid">{products.filter((product) => product.id !== selectedProduct.id).slice(0, 3).map(productCard)}</div></section>
            </>}

            {view === "about" && <>
              <section className="template-about-hero"><div><span>OUR POINT OF VIEW</span><h1>Simple routines.<br /><em>Thoughtful by nature.</em></h1><p>SOLENNE is a small botanical skincare concept built around useful essentials, calm design and everyday rituals.</p><button onClick={() => setView("collection")}>Explore the essentials <ArrowRight size={14} /></button></div><img src={asset("solenne-about-hero.webp")} alt="SOLENNE brand story and botanical skincare" /></section>
              <section className="template-about-process"><img src={asset("solenne-about-process.webp")} alt="A close look at the SOLENNE making process" /><div><span>MADE WITH INTENTION</span><h2>Keep the good.<br />Skip the noise.</h2><p>Tell the specific story: how the formula is designed, why each step belongs, and what the packaging is made to do.</p><button onClick={() => setView("collection")}>Find your ritual <ArrowRight size={13} /></button></div></section>
              <section className="template-about-values"><span>OUR GUIDING PRINCIPLES</span><div><article><b>01</b><h3>Useful first</h3><p>Every product earns its place in the routine.</p></article><article><b>02</b><h3>Clear by design</h3><p>Helpful information should feel easy to find.</p></article><article><b>03</b><h3>Make less matter</h3><p>Intentional choices, reflected in the small details.</p></article></div></section>
            </>}
          </div>
          <footer className="template-store-footer"><button className="template-footer-wordmark" onClick={() => setView("home")}>SOLENNE</button><div className="template-footer-links"><button onClick={() => setView("collection")}>Shop skincare</button><button onClick={() => setView("about")}>Our story</button><button onClick={() => setView("about")}>Contact & policies</button></div><p>A daily ritual, made simple.</p></footer>

          {notice && <div className="template-toast" role="status"><Check size={14} /> {notice}</div>}
          {cartOpen && <div className="template-cart-overlay" role="presentation" onClick={() => setCartOpen(false)}><section className="template-cart-drawer" role="dialog" aria-modal="true" aria-labelledby="template-cart-title" onClick={(event) => event.stopPropagation()}><div className="template-cart-heading"><div><span>YOUR SOLENNE EDIT</span><h2 id="template-cart-title">Your bag <small>({cartCount})</small></h2></div><button onClick={() => setCartOpen(false)} aria-label="Close bag"><X size={18} /></button></div>{cartItems.length ? <><div className="template-cart-items">{cartItems.map((item) => <article className="template-cart-item" key={item.key}><img src={item.variant.image} alt={item.product.name} /><div><span>{item.product.category}</span><h3>{item.product.name}</h3><p>{item.variant.label} · {money(item.variant.price)}</p><div className="template-cart-qty"><button onClick={() => updateCartItem(item.key, -1)} aria-label={`Remove one ${item.product.name}`}><Minus size={11} /></button><span>{item.count}</span><button onClick={() => updateCartItem(item.key, 1)} aria-label={`Add one ${item.product.name}`}><Plus size={11} /></button></div></div><strong>{money(item.variant.price * item.count)}</strong></article>)}</div><div className="template-cart-summary"><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><p>{subtotal >= 60 ? "Your order qualifies for complimentary shipping." : `You're ${money(60 - subtotal)} from complimentary shipping.`}</p><button onClick={() => notify("Preview only · checkout can be connected in the next build stage")}>Continue to checkout <ArrowRight size={14} /></button><small>Taxes and shipping are calculated at checkout.</small></div></> : <div className="template-cart-empty"><span className="template-empty-bag"><ShoppingBag size={22} /></span><h3>Your bag is taking it slow.</h3><p>When something feels right, it will be waiting here.</p><button onClick={() => { setCartOpen(false); setView("collection"); }}>Explore the essentials <ArrowRight size={13} /></button></div>}</section></div>}
        </div>
      </div>

      <div className="store-page-anatomy"><div><span>WHY THIS PAGE WORKS</span><h3>{templateInfo[view].title}</h3></div><ol>{templateInfo[view].anatomy.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}</ol></div>
      <div className="store-studio-back"><span>TRY IT:</span><button onClick={() => setView(view === "home" ? "collection" : view === "collection" ? "product" : view === "product" ? "about" : "home")}>Explore the {view === "home" ? "collection" : view === "collection" ? "product page" : view === "product" ? "About page" : "home page"} layout <ArrowRight size={13} /></button><button onClick={() => setDevice(device === "desktop" ? "mobile" : "desktop")}>Switch to {device === "desktop" ? "mobile" : "desktop"} preview <ArrowRight size={13} /></button></div>
    </section>
  );
}
