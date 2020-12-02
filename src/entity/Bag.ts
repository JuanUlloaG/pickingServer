import mongoose, { Schema, Document } from "mongoose";
import { CompanyInterface } from "./Company";
import { OrderBagsInterface } from "./OrderBags";

export interface BagNumberInterface extends Document {
    bag: OrderBagsInterface['_id'],
    numberBag: number
}

const BagNumberSchema: Schema = new Schema({
    bag: { type: Schema.Types.ObjectId, required: false, ref: "OrderBag", default: null, autopopulate: true },
    numberBag: { type: Number, required: true, default: 0 }
});

const BagNumber = mongoose.model<BagNumberInterface>("BagNumber", BagNumberSchema, "bagNumber");
export default BagNumber;