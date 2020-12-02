import mongoose, { Schema, Document } from "mongoose";

export interface ServicesInterface extends Document {
    key: string;
    desc: string;
    typeDelivery: string;
}

export const schemaState = {
    key: { type: "string" },
    desc: { type: "string" },
    typeDelivery: { type: "string" }
}

const CompanySchema: Schema = new Schema({
    key: { type: String, required: true },
    desc: { type: String, required: true },
    typeDelivery: { type: String, required: true }
});

const Service = mongoose.model<ServicesInterface>("Service", CompanySchema, "services");
export default Service;