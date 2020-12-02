import mongoose, { Schema, Document } from "mongoose";

export interface ProfileInterface extends Document {
    key: string;
    description: string;
}

export const schemaProfile = {
    key: { type: "string", required: "false" },
    description: { type: "string", required: "false" }
}

const CompanySchema: Schema = new Schema({
    key: { type: String, required: true },
    description: { type: String, required: true }
});

const Profile = mongoose.model<ProfileInterface>("Profile", CompanySchema, "profiles");
export default Profile;