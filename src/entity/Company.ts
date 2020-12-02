import mongoose, { Schema, Document } from "mongoose";
import { StateInterface } from "./State";


export interface CompanyInterface extends Document {
    name: string;
    rut: string;
    email: string,
    phone: string,
    address?: string,
    condition: StateInterface['_id'],
}

const CompanySchema: Schema = new Schema({
    rut: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: false, default: '' },
    condition: { type: Schema.Types.ObjectId, required: false, ref: "State" },
});

const Company = mongoose.model<CompanyInterface>("Company", CompanySchema, "companies");
export default Company;