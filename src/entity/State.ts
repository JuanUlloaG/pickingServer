import mongoose, { Schema, Document } from "mongoose";

export interface StateInterface extends Document {
    key: string;
    desc: string;
}

export const schemaState = {
    key: { type: "string" },
    desc: { type: "string" }
}

const CompanySchema: Schema = new Schema({
    key: { type: String, required: true },
    desc: { type: String, required: true }
});

const State = mongoose.model<StateInterface>("State", CompanySchema, "states");
export default State;