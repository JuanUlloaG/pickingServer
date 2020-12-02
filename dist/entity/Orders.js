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
const OrderSchema = new mongoose_1.Schema({
    uid: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Company", autopopulate: true },
    shopId: { type: mongoose_1.Schema.Types.ObjectId, required: false, ref: "Shop", default: null, autopopulate: true },
    pickerId: { type: mongoose_1.Schema.Types.ObjectId, required: false, ref: "User", default: null, autopopulate: true },
    deliveryId: { type: mongoose_1.Schema.Types.ObjectId, required: false, ref: "User", default: null, autopopulate: true },
    bag: { type: mongoose_1.Schema.Types.ObjectId, required: false, ref: "OrderBag", default: null, autopopulate: true },
    state: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "State", autopopulate: true },
    service: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Service", autopopulate: true },
    pickerName: { type: String, required: false, default: '' },
    deliveryName: { type: String, required: false, default: '' },
    orderNumber: { type: String, required: true },
    channel: { type: String, required: true },
    received: { type: String, required: false, default: "" },
    comment: { type: String, required: false, default: "" },
    partialBroken: { type: Boolean, required: false, default: false },
    totalBroken: { type: Boolean, required: false, default: false },
    products: [{
            id: { type: String, required: true },
            barcode: { type: String, required: true },
            product: { type: String, required: true },
            units: { type: Number, required: true },
            unitsPicked: { type: Number, required: false, default: 0 },
            unitsSubstitutes: { type: Number, required: false, default: 0 },
            unitsBroken: { type: Number, required: false, default: 0 },
            unitsReplaced: { type: Number, required: false, default: 0 },
            description: { type: String, required: true },
            image: { type: String, required: true },
            location: { type: Number, required: true },
            reception: { type: Boolean, required: false, default: false },
        }],
    client: {
        rut: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        cellphone: { type: String, required: true },
        address: { type: String, required: true },
        third: { type: String, required: false, default: "" },
        rutTercero: { type: String, required: false, default: "" },
        comment: { type: String, required: false, default: "" },
        comuna: { type: String, required: true },
        ciudad: { type: String, required: true },
        long: { type: String, required: true },
        lat: { type: String, required: true }
    },
    date: { type: Date, required: true },
    startPickingDate: { type: Date, required: false, default: null },
    endPickingDate: { type: Date, required: false, default: null },
    starDeliveryDate: { type: Date, required: false, default: null },
    endDeliveryDate: { type: Date, required: false, default: null },
    cancellDate: { type: Date, required: false, default: null },
    realdatedelivery: { type: Date, required: false, default: null },
    pickerWorkShift: { type: String, required: true },
    isInShop: { type: Boolean, required: false, default: false },
    restocked: { type: Boolean, required: false, default: false },
    printed: { type: Boolean, required: false, default: false },
    checked: { type: Boolean, required: false, default: false }
});
OrderSchema.plugin(require('mongoose-autopopulate'));
const Order = mongoose_1.default.model("Order", OrderSchema, "orders");
exports.default = Order;
