import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/qrcos_demo";

async function seed() {
  console.log("Connecting to MongoDB:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  const db = mongoose.connection.db;

  // Clear existing collections
  await db.collection("admins").deleteMany({});
  await db.collection("restaurants").deleteMany({});
  await db.collection("menus").deleteMany({});
  await db.collection("orders").deleteMany({});

  console.log("Cleared existing data.");

  // 1. Create Demo Admin (password null as per spec to trigger initial password setup)
  await db.collection("admins").insertOne({
    email: "admin@qrcos.com",
    password: null, // Null to demonstrate password setup modal on first login
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log("Seeded Admin: admin@qrcos.com (password: null - onboarding mode)");

  // 2. Create Flagship Ethiopian Restaurants
  // Restaurant A: Habesha Traditional Restaurant (Flagship)
  const habeshaResult = await db.collection("restaurants").insertOne({
    name: "Habesha Traditional Restaurant",
    slug: "habesha-restaurant",
    password: null, // Null to demonstrate restaurant owner onboarding
    description: "Authentic Ethiopian dining celebrating heritage recipes, sizzling clay pot tibs, slow-cooked doro wat, and traditional coffee ceremonies.",
    detail: [
      { key: "Cuisine", value: "Authentic Ethiopian Traditional" },
      { key: "Location", value: "Bole Medhanialem, Addis Ababa" },
      { key: "Phone", value: "+251 91 123 4567" },
      { key: "WiFi", value: "HabeshaGuest / selam2026" },
      { key: "Hours", value: "08:00 AM - 11:00 PM" },
    ],
    logoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop",
    expiredAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    status: "active",
    telegramChat: "",
    config: [
      { feeName: "VAT", type: "percent", amount: 15 },
      { feeName: "Service Charge", type: "fixed", amount: 50 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Restaurant B: Bole Cafe & Roastery
  const boleCafeResult = await db.collection("restaurants").insertOne({
    name: "Bole Cafe & Roastery",
    slug: "bole-cafe",
    password: null,
    description: "Modern Addis cafe roastery serving legendary Ethiopian macchiatos, fresh breakfast chechebsa, artisanal pastries, and freshly squeezed fruit juices.",
    detail: [
      { key: "Cuisine", value: "Cafe, Pastry & Ethiopian Breakfast" },
      { key: "Location", value: "Atlas / Bole Road, Addis Ababa" },
      { key: "Phone", value: "+251 92 345 6789" },
      { key: "WiFi", value: "BoleCafe_5G / addis2026" },
      { key: "Hours", value: "07:00 AM - 10:00 PM" },
    ],
    logoUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&h=200&fit=crop",
    expiredAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    status: "active",
    telegramChat: "",
    config: [
      { feeName: "VAT", type: "percent", amount: 15 },
      { feeName: "Service Charge", type: "fixed", amount: 25 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Restaurant C: Bistro Delight Addis (maintained so legacy bookmarks work seamlessly)
  const bistroResult = await db.collection("restaurants").insertOne({
    name: "Bistro Delight Addis",
    slug: "bistro-delight",
    password: null,
    description: "Contemporary Addis Ababa bistro blending modern cuisine with Ethiopian favorites, specialty mocktails, and stone-baked artisan pizzas.",
    detail: [
      { key: "Cuisine", value: "Ethiopian & Contemporary Fusion" },
      { key: "Location", value: "Kazanchis, Addis Ababa" },
      { key: "Phone", value: "+251 93 456 7890" },
      { key: "WiFi", value: "BistroAddis / pasta2026" },
      { key: "Hours", value: "11:00 AM - 11:00 PM" },
    ],
    logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop",
    expiredAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    status: "active",
    telegramChat: "",
    config: [
      { feeName: "VAT", type: "percent", amount: 15 },
      { feeName: "Service Charge", type: "fixed", amount: 50 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const habeshaId = habeshaResult.insertedId;
  const boleCafeId = boleCafeResult.insertedId;
  const bistroId = bistroResult.insertedId;

  console.log("Seeded Restaurants: habesha-restaurant, bole-cafe & bistro-delight");

  // 3. Create Authentic Ethiopian Menus for Habesha Traditional Restaurant
  const habeshaMenus = [
    {
      restaurantId: habeshaId,
      category: "Tibs & Grills",
      name: "Special Beef Tibs (ስፔሻል ጥብስ)",
      description: "Tender prime beef cubes sautéed with fresh rosemary, jalapeño (karia), sliced onions, and aromatic spiced clarified butter (niter kibbeh), served with warm fresh injera.",
      price: 520.0,
      detail: [
        { key: "Spice", value: "Medium (መካከለኛ)" },
        { key: "Meat", value: "Prime Beef (የበሬ)" },
        { key: "Portion", value: "1 Person" },
        { key: "Calories", value: "620 kcal" },
      ],
      imgUrls: [
        "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop",
      ],
      visibility: "public",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      restaurantId: habeshaId,
      category: "Traditional Wats",
      name: "Traditional Doro Wat (የሀገር ቤት ዶሮ ወጥ)",
      description: "Ethiopia's celebrated festive chicken stew, slow-cooked for hours in rich berbere, garlic, ginger, and herbal niter kibbeh, served with hard-boiled egg and ayib cottage cheese.",
      price: 650.0,
      detail: [
        { key: "Spice", value: "Traditional Hot (ያቃጥላል)" },
        { key: "Accompaniments", value: "Boiled Egg & Fresh Ayib" },
        { key: "Calories", value: "710 kcal" },
      ],
      imgUrls: [
        "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&h=400&fit=crop",
      ],
      visibility: "public",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      restaurantId: habeshaId,
      category: "Traditional Wats",
      name: "Special Kitfo (ክትፎ ስፔሻል)",
      description: "Finely minced prime lean beef warmed gently with fragrant mitmita and seasoned niter kibbeh, served alongside freshly steamed gomen (collard greens), ayib, and kocho.",
      price: 580.0,
      detail: [
        { key: "Preparation", value: "Leb-Leb (Warm / Medium-Rare)" },
        { key: "Sides", value: "Kocho, Ayib & Gomen" },
        { key: "Calories", value: "590 kcal" },
      ],
      imgUrls: [
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
      ],
      visibility: "public",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      restaurantId: habeshaId,
      category: "Fasting & Veg",
      name: "Yetsom Beyaynetu (የጾም በያይነቱ)",
      description: "Grand vegetarian feast with rich shiro wat, spiced misir (red lentils), kik alicha (yellow split peas), fosolia (green beans & carrots), keysir (beetroot), and steamed greens on fresh injera.",
      price: 340.0,
      detail: [
        { key: "Fasting", value: "100% Vegan (የጾም)" },
        { key: "Dishes", value: "6 Variety Stews + Salad" },
        { key: "Calories", value: "480 kcal" },
      ],
      imgUrls: [
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop",
      ],
      visibility: "public",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      restaurantId: habeshaId,
      category: "Fasting & Veg",
      name: "Special Shiro Tegabino (ሽሮ ተጋቢኖ)",
      description: "Sizzling clay pot of spiced chickpea stew infused with garlic, ginger, and jalapeños, bubbling hot and served with fresh rolled injera.",
      price: 240.0,
      detail: [
        { key: "Serving", value: "Sizzling Clay Pot" },
        { key: "Fasting", value: "Fasting & Vegan Friendly" },
      ],
      imgUrls: [
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop",
      ],
      visibility: "public",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      restaurantId: habeshaId,
      category: "Drinks",
      name: "Layered Spris Juice (ስፕሪስ ጁስ)",
      description: "Classic Ethiopian fresh juice layered with creamy Hass avocado, ripe tropical mango, and fresh papaya, served with lime wedge.",
      price: 140.0,
      detail: [
        { key: "Fruits", value: "Avocado, Mango, Papaya" },
        { key: "Sugar", value: "100% Natural Fresh Fruit" },
      ],
      imgUrls: [
        "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&h=400&fit=crop",
      ],
      visibility: "public",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      restaurantId: habeshaId,
      category: "Drinks",
      name: "Ethiopian Coffee Ceremony (የቡና ስነስርዓት)",
      description: "Freshly roasted and clay-pot brewed organic Ethiopian highland Arabica coffee served in traditional ceramic sini cups with popcorn.",
      price: 80.0,
      detail: [
        { key: "Coffee", value: "Highland Organic Arabica" },
        { key: "Sides", value: "Fresh Popcorn (ፈንድሻ)" },
      ],
      imgUrls: [
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&h=400&fit=crop",
      ],
      visibility: "public",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const insertedHabeshaMenus = await db.collection("menus").insertMany(habeshaMenus);

  // 4. Create Menus for Bole Cafe & Roastery
  const boleCafeMenus = [
    {
      restaurantId: boleCafeId,
      category: "Coffee & Tea",
      name: "Special Macchiato (ማኪያቶ)",
      description: "Signature Ethiopian layered double espresso topped with velvety steamed milk foam, crafted from dark-roasted Sidama beans.",
      price: 75.0,
      detail: [
        { key: "Roast", value: "Medium-Dark Sidama" },
        { key: "Milk", value: "Whole Steamed Milk" },
      ],
      imgUrls: [
        "https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&h=400&fit=crop",
      ],
      visibility: "public",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      restaurantId: boleCafeId,
      category: "Breakfast",
      name: "Chechebsa with Honey & Kibbeh (ጨጨብሳ)",
      description: "Warm shredded kitta flatbread lightly tossed with fragrant berbere, niter kibbeh, and pure Ethiopian highland honey, served with yogurt.",
      price: 220.0,
      detail: [
        { key: "Honey", value: "Pure Highland Honey" },
        { key: "Spice", value: "Mild Sweet & Savory" },
      ],
      imgUrls: [
        "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop",
      ],
      visibility: "public",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      restaurantId: boleCafeId,
      category: "Breakfast",
      name: "Special Fasting Firfir (የጾም ፍርፍር)",
      description: "Spiced tomato, garlic, and berbere soaked injera stew tossed with diced fresh jalapeño and served with whole green chili.",
      price: 180.0,
      detail: [
        { key: "Fasting", value: "100% Vegan (የጾም)" },
        { key: "Spice", value: "Medium Hot" },
      ],
      imgUrls: [
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=400&fit=crop",
      ],
      visibility: "public",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await db.collection("menus").insertMany(boleCafeMenus);

  // 5. Create Menus for Bistro Delight Addis
  const bistroMenus = [
    {
      restaurantId: bistroId,
      category: "Mains",
      name: "Sizzling Prime Beef Tibs",
      description: "Prime beef cubes seared over open flame with rosemary, onions, and jalapeños, served with choice of injera or sourdough bread.",
      price: 480.0,
      detail: [
        { key: "Meat", value: "Beef" },
        { key: "Spice", value: "Medium" },
      ],
      imgUrls: [
        "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop",
      ],
      visibility: "public",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      restaurantId: bistroId,
      category: "Drinks",
      name: "Fresh Mango Avocado Spris",
      description: "Thick fresh mango and avocado layered with a splash of fresh passion fruit.",
      price: 150.0,
      detail: [{ key: "Size", value: "400 ml" }],
      imgUrls: [
        "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&h=400&fit=crop",
      ],
      visibility: "public",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await db.collection("menus").insertMany(bistroMenus);
  console.log("Seeded Menus for all restaurants.");

  // 6. Create sample realistic Ethiopian order for Habesha Traditional Restaurant
  const firstMenuId = insertedHabeshaMenus.insertedIds[0]; // Special Beef Tibs
  const secondMenuId = insertedHabeshaMenus.insertedIds[4]; // Special Shiro Tegabino
  const thirdMenuId = insertedHabeshaMenus.insertedIds[5]; // Layered Spris Juice

  await db.collection("orders").insertOne({
    restaurantId: habeshaId,
    table: "4",
    customerName: "Abebe Kebede",
    notes: "እባክዎ ጥብሱ ለብ ያለ ይሁን፣ ሚጥሚጣና ቃሪያ በጎን ጨምሩበት (Medium well tibs with extra mitmita and karia on the side)",
    details: [
      {
        menuId: firstMenuId,
        name: "Special Beef Tibs (ስፔሻል ጥብስ)",
        quantity: 1,
        unitPrice: 520.0,
        subtotalPrice: 520.0,
      },
      {
        menuId: secondMenuId,
        name: "Special Shiro Tegabino (ሽሮ ተጋቢኖ)",
        quantity: 1,
        unitPrice: 240.0,
        subtotalPrice: 240.0,
      },
      {
        menuId: thirdMenuId,
        name: "Layered Spris Juice (ስፕሪስ ጁስ)",
        quantity: 2,
        unitPrice: 140.0,
        subtotalPrice: 280.0,
      },
    ],
    fees: [
      { feeName: "VAT", type: "percent", rate: 15, calculatedAmount: 156.0 },
      { feeName: "Service Charge", type: "fixed", rate: 50.0, calculatedAmount: 50.0 },
    ],
    subtotal: 1040.0,
    totalPrice: 1246.0,
    status: "pending",
    telegramMessageId: null,
    orderedAt: new Date(),
    startPreparingAt: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Seeded sample order on Table 4 (Abebe Kebede - 1246.00 ETB).");
  console.log("\nDatabase seeding completed successfully!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
