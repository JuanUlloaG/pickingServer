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
exports.schemaBags = void 0;
const mongoose_1 = __importStar(require("mongoose"));
/*
    
*/
exports.schemaBags = {
    orderNumber: { type: "string", required: "false" },
    shopId: { type: "string" },
    pickerId: { type: "string", required: "false" },
    deliveryId: { type: "string", required: "false" },
    readyforDelivery: { type: "boolean", required: "false" },
    received: { type: "string", required: "false" },
    delivery: { type: "boolean", required: "false" },
    comment: { type: "string", required: "false" },
    bags: [
        {
            bagNumber: { type: "string" },
            products: [
                {
                    id: { type: "string" },
                    barcode: { type: "string" },
                    product: { type: "string" },
                    units: { type: "number" },
                    unitsPicked: { type: "number" },
                    unitsSubstitutes: { type: "number" },
                    unitsBroken: { type: "number" },
                    unitsReplaced: { type: "number" },
                    unitsDelivery: { type: "number", required: "false" },
                    description: { type: "string" },
                    image: { type: "string" },
                    location: { type: "number" },
                    delivery: { type: "boolean" },
                }
            ]
        }
    ]
};
const OrderBagsSchema = new mongoose_1.Schema({
    orderNumber: { type: mongoose_1.Schema.Types.ObjectId, required: false, ref: "Order", autopopulate: true },
    shopId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Shop", autopopulate: true },
    pickerId: { type: mongoose_1.Schema.Types.ObjectId, required: false, ref: "User", default: null, autopopulate: true },
    deliveryId: { type: mongoose_1.Schema.Types.ObjectId, required: false, ref: "User", default: null, autopopulate: true },
    readyforDelivery: { type: Boolean, required: false, default: false },
    delivery: { type: Boolean, required: false, default: false },
    received: { type: String, required: false, default: "" },
    comment: { type: String, required: false, default: "" },
    bags: [
        {
            bagNumber: { type: String, required: true },
            products: [
                {
                    id: { type: String, required: true },
                    barcode: { type: String, required: true },
                    product: { type: String, required: true },
                    units: { type: Number, required: true },
                    unitsPicked: { type: Number, required: true },
                    unitsSubstitutes: { type: Number, required: true },
                    unitsBroken: { type: Number, required: true },
                    unitsReplaced: { type: Number, required: true },
                    unitsDelivery: { type: Number, required: false, default: 0 },
                    description: { type: String, required: true },
                    image: { type: String, required: true },
                    location: { type: Number, required: true },
                    delivery: { type: Boolean, required: false, default: false },
                }
            ]
        }
    ]
});
const OrderBags = mongoose_1.default.model("OrderBag", OrderBagsSchema, "orderbags");
exports.default = OrderBags;
