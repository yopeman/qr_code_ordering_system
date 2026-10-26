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
  const adminResult = await db.collection("admins").insertOne({
    email: "admin@qrcos.com",
    password: null, // Null to demonstrate password setup modal on first login
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log("Seeded Admin: admin@qrcos.com (password: null - onboarding mode)");

  // 2. Create Demo Restaurants
  const bistroResult = await db.collection("restaurants").insertOne({
    name: "Bistro Delight",
    slug: "bistro-delight",
    password: null, // Null to demonstrate restaurant owner onboarding
    description: "Artisanal Mediterranean bistro offering farm-fresh ingredients and wood-fired specialties.",
    detail: [
      { key: "Cuisine", value: "Mediterranean & Italian" },
      { key: "Phone", value: "+1 (555) 234-5678" },
      { key: "WiFi", value: "BistroGuest / freshpasta" },
      { key: "Hours", value: "11:00 AM - 11:00 PM" },
    ],
    logoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop",
    expiredAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    status: "active",
    telegramChat: process.env.TELEGRAM_CHANNEL || "@post_timir_content",
    config: [
      { feeName: "VAT", type: "percent", amount: 15 },
      { feeName: "Service Charge", type: "fixed", amount: 2.5 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const burgerResult = await db.collection("restaurants").insertOne({
    name: "Burger Craft",
    slug: "burger-craft",
    password: null,
    description: "Handcrafted gourmet smash burgers, loaded truffle fries, and signature milkshakes.",
    detail: [
      { key: "Cuisine", value: "American Gourmet Burgers" },
      { key: "Phone", value: "+1 (555) 987-6543" },
      { key: "WiFi", value: "CraftBurger_5G / smashit2026" },
      { key: "Hours", value: "12:00 PM - Midnight" },
    ],
    logoUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&h=200&fit=crop",
    expiredAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    status: "active",
    telegramChat: process.env.TELEGRAM_CHANNEL || "@post_timir_content",
    config: [
      { feeName: "Sales Tax", type: "percent", amount: 8.5 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const bistroId = bistroResult.insertedId;
  const burgerId = burgerResult.insertedId;

  console.log("Seeded Restaurants: bistro-delight & burger-craft");

  // 3. Create Menus for Bistro Delight
  const bistroMenus = [
    {
      restaurantId: bistroId,
      category: "Starters",
      name: "Truffle Burrata Bruschetta",
      description: "Crispy sourdough topped with creamy pugliese burrata, heirloom cherry tomatoes, basil, and black truffle oil.",
      price: 14.5,
      detail: [
        { key: "Calories", value: "420 kcal" },
        { key: "Vegetarian", value: "Yes" },
        { key: "Allergens", value: "Dairy, Gluten" },
      ],
      imgUrls: [
        "https://images.unsplash.com/photo-1592417817098-8f3d69109853?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1506280754576-f6fa8a873550?w=600&h=400&fit=crop",
      ],
      visibility: "public",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      restaurantId: bistroId,
      category: "Mains",
      name: "Wood-Fired Wild Salmon",
      description: "Pan-roasted Atlantic salmon served over saffron risotto, grilled asparagus, and lemon-dill emulsified butter.",
      price: 26.0,
      detail: [
        { key: "Calories", value: "680 kcal" },
        { key: "Protein", value: "48g" },
        { key: "Allergens", value: "Fish, Dairy" },
      ],
      imgUrls: [
        "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop",
      ],
      visibility: "public",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      restaurantId: bistroId,
      category: "Mains",
      name: "Handmade Tagliatelle al Tartufo",
      description: "Fresh egg pasta twirled in creamy Parmigiano Reggiano fonduta, shaved summer truffles, and cracked black pepper.",
      price: 22.5,
      detail: [
        { key: "Calories", value: "610 kcal" },
        { key: "Vegetarian", value: "Yes" },
        { key: "Allergens", value: "Dairy, Gluten, Eggs" },
      ],
      imgUrls: [
        "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&h=400&fit=crop",
      ],
      visibility: "public",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      restaurantId: bistroId,
      category: "Drinks",
      name: "San Pellegrino Blood Orange",
      description: "Sparkling Italian citrus beverage with real fruit juice and delicate bubbles.",
      price: 4.5,
      detail: [{ key: "Volume", value: "330 ml" }],
      imgUrls: [
        "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&h=400&fit=crop",
      ],
      visibility: "public",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      restaurantId: bistroId,
      category: "Desserts",
      name: "Classic Espresso Tiramisu",
      description: "Savoiardi ladyfingers soaked in dark roast espresso, layered with whipped mascarpone cream and dusted with Valrhona cocoa.",
      price: 9.0,
      detail: [
        { key: "Calories", value: "380 kcal" },
        { key: "Vegetarian", value: "Yes" },
      ],
      imgUrls: [
        "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=400&fit=crop",
      ],
      visibility: "public",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const insertedBistroMenus = await db.collection("menus").insertMany(bistroMenus);

  // 4. Create Menus for Burger Craft
  const burgerMenus = [
    {
      restaurantId: burgerId,
      category: "Burgers",
      name: "The Double Smoked Bacon Smash",
      description: "Two 100% Angus beef patties smashed with caramelized onions, thick-cut applewood bacon, aged cheddar, and house smoky mayo.",
      price: 15.5,
      detail: [
        { key: "Calories", value: "850 kcal" },
        { key: "Allergens", value: "Gluten, Dairy" },
      ],
      imgUrls: [
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
      ],
      visibility: "public",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      restaurantId: burgerId,
      category: "Sides",
      name: "Parmesan Truffle Fries",
      description: "Hand-cut Idaho potatoes tossed in white truffle oil, rosemary sea salt, and grated 24-month aged parmesan.",
      price: 7.5,
      detail: [
        { key: "Calories", value: "420 kcal" },
        { key: "Vegetarian", value: "Yes" },
      ],
      imgUrls: [
        "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=400&fit=crop",
      ],
      visibility: "public",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      restaurantId: burgerId,
      category: "Drinks",
      name: "Salted Caramel Shake",
      description: "Hand-spun Madagascar vanilla gelato with fleur de sel caramel drizzle and whipped cream.",
      price: 6.5,
      detail: [{ key: "Calories", value: "540 kcal" }],
      imgUrls: [
        "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&h=400&fit=crop",
      ],
      visibility: "public",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await db.collection("menus").insertMany(burgerMenus);
  console.log("Seeded Menus for both restaurants.");

  // 5. Create a sample initial order for Bistro Delight
  const firstMenuId = insertedBistroMenus.insertedIds[0];
  const secondMenuId = insertedBistroMenus.insertedIds[1];

  await db.collection("orders").insertOne({
    restaurantId: bistroId,
    table: "12",
    customerName: "Alex Morgan",
    notes: "Please extra lemon slices with the salmon.",
    details: [
      {
        menuId: firstMenuId,
        name: "Truffle Burrata Bruschetta",
        quantity: 1,
        unitPrice: 14.5,
        subtotalPrice: 14.5,
      },
      {
        menuId: secondMenuId,
        name: "Wood-Fired Wild Salmon",
        quantity: 2,
        unitPrice: 26.0,
        subtotalPrice: 52.0,
      },
    ],
    fees: [
      { feeName: "VAT", type: "percent", rate: 15, calculatedAmount: 9.98 },
      { feeName: "Service Charge", type: "fixed", rate: 2.5, calculatedAmount: 2.5 },
    ],
    subtotal: 66.5,
    totalPrice: 78.98,
    status: "pending",
    telegramMessageId: null,
    orderedAt: new Date(),
    startPreparingAt: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Seeded sample order on Table 12.");
  console.log("\nDatabase seeding completed successfully!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
