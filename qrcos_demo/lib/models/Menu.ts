import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMenuDetail {
  key: string;
  value: string;
}

export interface IMenu extends Document {
  restaurantId: mongoose.Types.ObjectId;
  category: string;
  name: string;
  description: string;
  price: number;
  detail: IMenuDetail[];
  imgUrls: string[];
  visibility: "public" | "private";
  createdAt: Date;
  updatedAt: Date;
}

const MenuDetailSchema = new Schema<IMenuDetail>(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const MenuSchema = new Schema<IMenu>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    detail: {
      type: [MenuDetailSchema],
      default: [],
    },
    imgUrls: {
      type: [String],
      default: [],
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Menu: Model<IMenu> =
  mongoose.models.Menu || mongoose.model<IMenu>("Menu", MenuSchema);
