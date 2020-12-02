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
const HistorySchema = new mongoose_1.Schema({
    order: { type: mongoose_1.Schema.Types.ObjectId, required: false, ref: "Order", autopopulate: true },
    bag: { type: mongoose_1.Schema.Types.ObjectId, required: false, ref: "OrderBag", default: null, autopopulate: true },
    shop: { type: mongoose_1.Schema.Types.ObjectId, required: false, ref: "Shop", default: null, autopopulate: true },
    picker: { type: mongoose_1.Schema.Types.ObjectId, required: false, ref: "User", default: null, autopopulate: true },
    delivery: { type: mongoose_1.Schema.Types.ObjectId, required: false, ref: "User", default: null, autopopulate: true },
    state: { type: mongoose_1.Schema.Types.ObjectId, required: false, ref: "State", default: null, autopopulate: true },
    orderNumber: { type: String, required: true },
    orderSnapShot: { type: Object, required: true },
    dateHistory: { type: Date, required: true, default: new Date() },
});
const History = mongoose_1.default.model("History", HistorySchema, "history");
exports.default = History;
