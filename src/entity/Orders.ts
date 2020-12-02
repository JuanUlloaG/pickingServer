import mongoose, { Schema, Document } from "mongoose";
import { UserInterface } from "./User";
import { CompanyInterface } from "./Company";
import { ShopInterface } from "./Shop"
import { OrderBagsInterface } from "./OrderBags"
import { StateInterface } from "./State"
import { ServicesInterface } from "./Services"



export interface OrderInterface extends Document {
    uid: CompanyInterface['_id'],//identificador unico de la comñia/cliente/ 
    orderNumber: number,//Numero de orden
    shopId?: ShopInterface['_id'],
    pickerId?: UserInterface['_id'],
    deliveryId?: UserInterface['_id'],
    bag: OrderBagsInterface['_id'],
    state: StateInterface['_id'],
    service: ServicesInterface['_id'],
    received?: string,
    comment?: string,
    pickerName?: string,
    deliveryName?: string,
    partialBroken?: Boolean,
    totalBroken?: Boolean,
    products: [{
        id: number,
        barcode: number,
        product: string,
        units: number,
        image: string,
        location: number,//1 o 0
        description: string,
        reception: Boolean,
        unitsPicked?: number,
        unitsSubstitutes?: number,
        unitsBroken?: number,
        unitsReplaced?: number,
    }],
    client: {//Quien hizo la compra
        rut: string,
        name: string,
        cellphone: string,
        email: string,
        address: string,
        comuna: string,
        comment: string,
        third: string,
        rutTercero: string,
        ciudad: string,
        long: number,
        lat: number
    },
    channel: { key: string, description: string },
    date: Date,
    startPickingDate?: Date,
    endPickingDate?: Date,
    starDeliveryDate?: Date,
    endDeliveryDate?: Date,
    realdatedelivery?: Date,//fecha de promesa generada con el algoritmo de localizacion
    pickerWorkShift: string,
    cancellDate?: Date,
    isInShop: Boolean,
    checked: Boolean,
    printed: Boolean,
    restocked: Boolean,
    timeLine?: Array<any>,
}

const OrderSchema: Schema = new Schema({
    uid: { type: Schema.Types.ObjectId, required: true, ref: "Company", autopopulate: true },
    shopId: { type: Schema.Types.ObjectId, required: false, ref: "Shop", default: null, autopopulate: true },
    pickerId: { type: Schema.Types.ObjectId, required: false, ref: "User", default: null, autopopulate: true },
    deliveryId: { type: Schema.Types.ObjectId, required: false, ref: "User", default: null, autopopulate: true },
    bag: { type: Schema.Types.ObjectId, required: false, ref: "OrderBag", default: null, autopopulate: true },
    state: { type: Schema.Types.ObjectId, required: true, ref: "State", autopopulate: true },
    service: { type: Schema.Types.ObjectId, required: true, ref: "Service", autopopulate: true },
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
OrderSchema.plugin(require('mongoose-autopopulate'))
const Order = mongoose.model<OrderInterface>("Order", OrderSchema, "orders");
export default Order;