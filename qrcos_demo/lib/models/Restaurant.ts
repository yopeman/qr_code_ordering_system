import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRestaurantDetail {
  key: string;
  value: string;
}

export interface IRestaurantConfig {
  feeName: string;
  type: "percent" | "fixed";
  amount: number;
}

export interface IRestaurant extends Document {
  name: string;
  slug: string;
  password: string | null;
  description: string;
  detail: IRestaurantDetail[];
  logoUrl: string;
  expiredAt?: Date | null;
  status: "active" | "inactive" | "suspended";
  telegramChat: string;
  config: IRestaurantConfig[];
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantDetailSchema = new Schema<IRestaurantDetail>(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const RestaurantConfigSchema = new Schema<IRestaurantConfig>(
  {
    feeName: { type: String, required: true },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    amount: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, default: null }, // Nullable: triggers initial onboarding setup
    description: { type: String, default: "" },
    detail: { type: [RestaurantDetailSchema], default: [] },
    logoUrl: { type: String, default: "" },
    expiredAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true,
    },
    telegramChat: { type: String, default: "" },
    config: { type: [RestaurantConfigSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

export const Restaurant: Model<IRestaurant> =
  mongoose.models.Restaurant || mongoose.model<IRestaurant>("Restaurant", RestaurantSchema);
