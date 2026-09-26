export type DietTag = "vegetarian" | "vegan" | "gluten-free" | "spicy" | "popular";

export type Dish = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  tags: DietTag[];
  calories: number;
  prepMinutes: number;
  rating: number;
  sold: number;
  available: boolean;
};

export const CATEGORIES = [
  { id: "popular", name: "Popular", emoji: "\u2b50" },
  { id: "starters", name: "Starters", emoji: "\ud83e\udd57" },
  { id: "mains", name: "Mains", emoji: "\ud83c\udf5d" },
  { id: "bowls", name: "Bowls & Salads", emoji: "\ud83e\udd5b" },
  { id: "desserts", name: "Desserts", emoji: "\ud83c\udf70" },
  { id: "drinks", name: "Drinks", emoji: "\ud83e\udd5f" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const MENU: Dish[] = [
  {
    id: "bruschetta",
    name: "Tomato Bruschetta",
    description:
      "Grilled sourdough rubbed with garlic, topped with heirloom tomatoes, basil oil and aged balsamic.",
    price: 510,
    category: "starters",
    image: "\ud83c\udf5e",
    tags: ["vegetarian", "popular"],
    calories: 320,
    prepMinutes: 8,
    rating: 4.7,
    sold: 412,
    available: true,
  },
  {
    id: "calamari",
    name: "Crispy Calamari",
    description:
      "Lightly flour-dusted squid rings with lemon aioli, smoked paprika and parsley.",
    price: 720,
    category: "starters",
    image: "\ud83e\udd90",
    tags: ["popular"],
    calories: 480,
    prepMinutes: 12,
    rating: 4.5,
    sold: 356,
    available: true,
  },
  {
    id: "burrata",
    name: "Burrata & Figs",
    description:
      "Creamy burrata with honey-roasted figs, prosciutto, toasted hazelnuts and arugula.",
    price: 810,
    category: "starters",
    image: "\ud83c\udf5e",
    tags: ["vegetarian", "gluten-free"],
    calories: 410,
    prepMinutes: 6,
    rating: 4.8,
    sold: 288,
    available: true,
  },
  {
    id: "mushroom-arancini",
    name: "Truffle Arancini",
    description:
      "Saffron risotto balls filled with mozzarella and wild mushroom, black truffle dip.",
    price: 660,
    category: "starters",
    image: "\ud83c\udf5b",
    tags: ["vegetarian", "popular"],
    calories: 520,
    prepMinutes: 10,
    rating: 4.6,
    sold: 331,
    available: true,
  },
  {
    id: "ribeye",
    name: "Grilled Ribeye",
    description:
      "300g dry-aged ribeye, herb butter, hand-cut chips and watercress salad.",
    price: 1920,
    category: "mains",
    image: "\ud83c\udf56",
    tags: ["gluten-free", "popular"],
    calories: 890,
    prepMinutes: 22,
    rating: 4.9,
    sold: 502,
    available: true,
  },
  {
    id: "salmon",
    name: "Pan-Seared Salmon",
    description:
      "Atlantic salmon with lemon beurre blanc, charred asparagus and new potatoes.",
    price: 1470,
    category: "mains",
    image: "\ud83e\udd80",
    tags: ["gluten-free"],
    calories: 640,
    prepMinutes: 18,
    rating: 4.7,
    sold: 274,
    available: true,
  },
  {
    id: "pasta",
    name: "Truffle Tagliatelle",
    description:
      "Hand-rolled pasta with black truffle cream, aged parmesan and toasted breadcrumbs.",
    price: 1140,
    category: "mains",
    image: "\ud83c\udf5d",
    tags: ["vegetarian", "popular"],
    calories: 720,
    prepMinutes: 14,
    rating: 4.8,
    sold: 445,
    available: true,
  },
  {
    id: "chicken-curry",
    name: "Coconut Chicken Curry",
    description:
      "Free-range chicken in a coconut, lemongrass and kaffir lime curry with jasmine rice.",
    price: 1050,
    category: "mains",
    image: "\ud83c\udf5b",
    tags: ["gluten-free", "spicy"],
    calories: 780,
    prepMinutes: 16,
    rating: 4.5,
    sold: 198,
    available: false,
  },
  {
    id: "veggie-bowl",
    name: "Harvest Grain Bowl",
    description:
      "Quinoa, roasted pumpkin, avocado, hummus and pomegranate with a lemon tahini dressing.",
    price: 840,
    category: "bowls",
    image: "\ud83e\udd5b",
    tags: ["vegan", "gluten-free"],
    calories: 560,
    prepMinutes: 10,
    rating: 4.6,
    sold: 233,
    available: true,
  },
  {
    id: "caesar",
    name: "Chicken Caesar",
    description:
      "Cos lettuce, grilled chicken, aged parmesan, sourdough croutons and Caesar dressing.",
    price: 780,
    category: "bowls",
    image: "\ud83e\udd57",
    tags: ["popular"],
    calories: 610,
    prepMinutes: 9,
    rating: 4.4,
    sold: 389,
    available: true,
  },
  {
    id: "poke",
    name: "Salmon Poke Bowl",
    description:
      "Sushi rice, cubed salmon, edamame, mango, cucumber and a spicy ponzu glaze.",
    price: 990,
    category: "bowls",
    image: "\ud83c\udf5a",
    tags: ["gluten-free", "spicy"],
    calories: 540,
    prepMinutes: 8,
    rating: 4.7,
    sold: 312,
    available: true,
  },
  {
    id: "tiramisu",
    name: "Classic Tiramisu",
    description:
      "Espresso-soaked savoiardi, mascarpone cream and a dusting of Valrhona cocoa.",
    price: 480,
    category: "desserts",
    image: "\ud83c\udf70",
    tags: ["vegetarian", "popular"],
    calories: 420,
    prepMinutes: 4,
    rating: 4.9,
    sold: 467,
    available: true,
  },
  {
    id: "panna-cotta",
    name: "Vanilla Panna Cotta",
    description:
      "Madagascan vanilla bean panna cotta with macerated berries and a basil syrup.",
    price: 450,
    category: "desserts",
    image: "\ud83e\udd5b",
    tags: ["vegetarian", "gluten-free"],
    calories: 340,
    prepMinutes: 3,
    rating: 4.5,
    sold: 176,
    available: true,
  },
  {
    id: "lemon-tart",
    name: "Lemon Meringue Tart",
    description: "Sharp lemon curd, torched Italian meringue and a buttery shortcrust base.",
    price: 510,
    category: "desserts",
    image: "\ud83c\udf6f",
    tags: ["vegetarian"],
    calories: 460,
    prepMinutes: 3,
    rating: 4.6,
    sold: 142,
    available: true,
  },
  {
    id: "espresso",
    name: "Double Espresso",
    description: "Two ristretto shots with a thick, hazelnut crema.",
    price: 210,
    category: "drinks",
    image: "☕",
    tags: ["vegan", "popular"],
    calories: 5,
    prepMinutes: 2,
    rating: 4.8,
    sold: 621,
    available: true,
  },
  {
    id: "matcha",
    name: "Iced Matcha Latte",
    description: "Ceremonial matcha whisked with oat milk over ice, lightly sweetened.",
    price: 330,
    category: "drinks",
    image: "\ud83c\udf75",
    tags: ["vegan"],
    calories: 160,
    prepMinutes: 4,
    rating: 4.5,
    sold: 254,
    available: true,
  },
  {
    id: "house-lemonade",
    name: "House Lemonade",
    description: "Fresh-pressed lemon, cane sugar and a hint of fresh mint.",
    price: 270,
    category: "drinks",
    image: "\ud83c\udf5b",
    tags: ["vegan", "gluten-free"],
    calories: 120,
    prepMinutes: 3,
    rating: 4.3,
    sold: 187,
    available: true,
  },
];

export const SERVICE_FEE_RATE = 0.08;
export const TAX_RATE = 0.09;
export const FREE_DELIVERY_THRESHOLD = 1500;
export const DELIVERY_FEE = 240;

export const formatPrice = (amount: number) =>
  `${amount.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;
