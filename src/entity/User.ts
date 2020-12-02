import mongoose, { Schema, Document } from "mongoose";
import { CompanyInterface } from "./Company";
import { ProfileInterface } from "./Profile";
import { StateInterface } from "./State";

export interface UserInterface extends Document {
    name: string;
    lastname: string;
    rut: string;
    password: string;
    email: string,
    phone: string,
    profile: ProfileInterface['_id'],
    state: boolean,
    company?: CompanyInterface['_id'],
    condition: StateInterface['_id'],
}


/*
    Los perfiles que actualmente manejamos son 
    2: Picker
    4: Moto o Delivery
 */

const UserSchema: Schema = new Schema({
    password: { type: String, required: true },
    rut: { type: String, required: true },
    name: { type: String, required: true },
    lastName: { type: String, required: false },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    profile: { type: Schema.Types.ObjectId, required: false, ref: "Profile" },
    condition: { type: Schema.Types.ObjectId, required: false, ref: "State" },
    state: { type: Boolean, required: true },
    company: { type: Schema.Types.ObjectId, required: false, ref: "Company" }
});

const User = mongoose.model<UserInterface>("User", UserSchema, "users");
export default User;