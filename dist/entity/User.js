"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
/*
    Los perfiles que actualmente manejamos son
    2: Picker
    4: Moto o Delivery
 */
const UserSchema = new mongoose_1.Schema({
    password: { type: String, required: true },
    rut: { type: String, required: true },
    name: { type: String, required: true },
    lastName: { type: String, required: false },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    profile: { type: mongoose_1.Schema.Types.ObjectId, required: false, ref: "Profile" },
    condition: { type: mongoose_1.Schema.Types.ObjectId, required: false, ref: "State" },
    state: { type: Boolean, required: true },
    company: { type: mongoose_1.Schema.Types.ObjectId, required: false, ref: "Company" }
});
const User = mongoose_1.default.model("User", UserSchema, "users");
exports.default = User;
