import mongoose, { Schema, Document } from "mongoose";
import { UserInterface } from "./User";
import { ShopInterface } from "./Shop"
import { OrderInterface } from "./Orders"
import { OrderBagsInterface } from "./OrderBags"
import { StateInterface } from "./State"


export interface HistoryInterface extends Document {
    order: OrderInterface['_id'];
    bag?: OrderBagsInterface['_id'];
    shop?: ShopInterface['_id'];
    picker?: UserInterface['_id'],
    delivery?: UserInterface['_id'],
    state: StateInterface['_id'],
    orderNumber: string,
    orderSnapShot: object,
    dateHistory: Date,
}

const HistorySchema: Schema = new Schema({
    order: { type: Schema.Types.ObjectId, required: false, ref: "Order", autopopulate: true },
    bag: { type: Schema.Types.ObjectId, required: false, ref: "OrderBag", default: null, autopopulate: true },
    shop: { type: Schema.Types.ObjectId, required: false, ref: "Shop", default: null, autopopulate: true },
    picker: { type: Schema.Types.ObjectId, required: false, ref: "User", default: null, autopopulate: true },
    delivery: { type: Schema.Types.ObjectId, required: false, ref: "User", default: null, autopopulate: true },
    state: { type: Schema.Types.ObjectId, required: false, ref: "State", default: null, autopopulate: true },
    orderNumber: { type: String, required: true },
    orderSnapShot: { type: Object, required: true },
    dateHistory: { type: Date, required: true, default: new Date() },
});

const History = mongoose.model<HistoryInterface>("History", HistorySchema, "history");
export default History;