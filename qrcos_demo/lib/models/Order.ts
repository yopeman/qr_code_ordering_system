import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  menuId?: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotalPrice: number;
}

export interface IOrderFee {
  feeName: string;
  type: "percent" | "fixed";
  rate: number;
  calculatedAmount: number;
}

export type OrderStatus = "pending" | "preparing" | "completed";

export interface IOrder extends Document {
  restaurantId: mongoose.Types.ObjectId;
  table: string;
  customerName: string;
  notes: string;
  details: IOrderItem[];
  fees: IOrderFee[];
  subtotal: number;
  totalPrice: number;
  status: OrderStatus;
  telegramMessageId?: number;
  orderedAt: Date;
  startPreparingAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    menuId: { type: Schema.Types.ObjectId, ref: "Menu" },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    subtotalPrice: { type: Number, required: true },
  },
  { _id: false }
);

const OrderFeeSchema = new Schema<IOrderFee>(
  {
    feeName: { type: String, required: true },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    rate: { type: Number, required: true },
    calculatedAmount: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    table: {
      type: String,
      required: true,
      trim: true,
    },
    customerName: {
      type: String,
      default: "Guest",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
    },
    details: {
      type: [OrderItemSchema],
      required: true,
    },
    fees: {
      type: [OrderFeeSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "preparing", "completed"],
      default: "pending",
      index: true,
    },
    telegramMessageId: {
      type: Number,
      default: null,
    },
    orderedAt: {
      type: Date,
      default: Date.now,
    },
    startPreparingAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
