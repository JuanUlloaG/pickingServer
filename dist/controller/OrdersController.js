"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const xlsx_1 = __importDefault(require("xlsx"));
const jwt = require('jsonwebtoken');
const Orders_1 = __importDefault(require("../entity/Orders"));
const State_1 = __importDefault(require("../entity/State"));
const Services_1 = __importDefault(require("../entity/Services"));
const { insertDB, insertManyDB, findDocuments, findDocumentsMultiPopulate, findOneAndUpdateDB, findOneDB, updateManyDB, executeProcedure } = require("../config/db");
const moment_1 = __importDefault(require("moment"));
const requestify = require('requestify');
const History_1 = __importDefault(require("../entity/History"));
const Company_1 = __importDefault(require("../entity/Company"));
const User_1 = __importDefault(require("../entity/User"));
const config_1 = require("../config/config");
const OrderBags_1 = __importDefault(require("../entity/OrderBags"));
let start = 0;
// mongoose.set('debug', true);
class OrdersController {
    async updatePrintedOrders(request, response, next, app) {
        try {
            const { orders } = request.body;
            let ordersIds = [];
            orders.map((order) => {
                ordersIds.push(mongoose_1.default.Types.ObjectId(order));
            });
            let queryOrder = { '_id': { '$in': ordersIds } };
            let updateOrder = { printed: true };
            updateManyDB(Orders_1.default, queryOrder, updateOrder, null, null).then((updateOrder) => {
                if (updateOrder) {
                    response.json({
                        message: 'Ordenes actualizadas exitosamente',
                        data: updateOrder,
                        success: true
                    });
                }
                else {
                    response.json({
                        message: "Error al actualizar orden: " + updateOrder,
                        success: false
                    });
                }
            }).catch((err) => {
                response.json({
                    message: err,
                    success: false
                });
            });
        }
        catch (error) {
            response.json({
                message: error,
                success: false
            });
        }
    }
    async updateState(request, response, next, app) {
        try {
            const { id, state, date } = request.body;
            let queryOrder = { "_id": mongoose_1.default.Types.ObjectId(id) };
            let query = { "key": state };
            findDocuments(State_1.default, query, "", {}, '', '', 0, null, null).then((findResultState) => {
                if (findResultState.length > 0) {
                    let stateId = findResultState[0]._id;
                    const stateName = findResultState[0].desc;
                    let updateOrder = { state: mongoose_1.default.Types.ObjectId(stateId) };
                    if (state == 8) {
                        updateOrder['cancellDate'] = new Date();
                        // updateOrder['deliveryId'] = null
                        // updateOrder['bag'] = null
                        // updateOrder['pickerName'] = ""
                        // updateOrder['deliveryName'] = ""
                        // updateOrder['pickerId'] = null
                        // updateOrder['startPickingDate'] = null
                        // updateOrder['endPickingDate'] = null
                        // // updateOrder['starDeliveryDate'] = null
                        // updateOrder['endDeliveryDate'] = null
                        updateOrder['totalBroken'] = false;
                        updateOrder['partialBroken'] = false;
                    }
                    if (state == 1) {
                        updateOrder['bag'] = null;
                        updateOrder['pickerName'] = "";
                        updateOrder['pickerId'] = null;
                        updateOrder['startPickingDate'] = null;
                        updateOrder['endPickingDate'] = null;
                        updateOrder['totalBroken'] = false;
                        updateOrder['partialBroken'] = false;
                    }
                    if (date) {
                        updateOrder['realdatedelivery'] = new Date(date);
                        updateOrder['restocked'] = true;
                        updateOrder['deliveryId'] = null;
                        updateOrder['bag'] = null;
                        updateOrder['pickerName'] = "";
                        updateOrder['deliveryName'] = "";
                        updateOrder['pickerId'] = null;
                        updateOrder['startPickingDate'] = null;
                        updateOrder['endPickingDate'] = null;
                        updateOrder['starDeliveryDate'] = null;
                        updateOrder['endDeliveryDate'] = null;
                        updateOrder['totalBroken'] = false;
                        updateOrder['partialBroken'] = false;
                    }
                    findDocuments(Orders_1.default, queryOrder, "", {}, '', '', 0, null, null).then((OrderResult) => {
                        if (OrderResult.length > 0) {
                            let updateBag = { orderNumber: null };
                            let queryBag = { _id: mongoose_1.default.Types.ObjectId(OrderResult[0].bag._id) };
                            findOneAndUpdateDB(OrderBags_1.default, queryBag, updateBag, null, null).then((updateOrderBag) => {
                                if (updateOrderBag) {
                                    findOneAndUpdateDB(Orders_1.default, queryOrder, updateOrder, null, null).then((updateOrder) => {
                                        console.log(updateOrder);
                                        if (updateOrder) {
                                            let event = Object.assign({}, config_1.config.paramEvent);
                                            event.CuentaCliente = OrderResult[0].uid.name;
                                            event.OrderTrabajo = OrderResult[0].orderNumber.toString();
                                            event.Estado = stateName;
                                            event.FechaEventoOMS = new Date();
                                            let orderEvent = [];
                                            orderEvent.push(event);
                                            executeProcedure("[OMS].[InsertEvento]", orderEvent);
                                            response.json({
                                                message: 'Orden actualizada exitosamente',
                                                data: updateOrder,
                                                success: true
                                            });
                                        }
                                        else {
                                            response.json({
                                                message: "Error al actualizar ordens: " + updateOrder,
                                                success: false
                                            });
                                        }
                                    }).catch((err) => {
                                        console.log(err);
                                        response.json({
                                            message: err,
                                            success: false
                                        });
                                    });
                                }
                                else {
                                    response.json({
                                        message: "Error al actualizar orden:a " + updateOrder,
                                        success: false
                                    });
                                }
                            }).catch((err) => {
                                console.log(err);
                                response.json({
                                    message: err,
                                    success: false
                                });
                            });
                        }
                        else {
                            response.json({
                                message: "Error al actualizar orden: " + updateOrder,
                                success: false
                            });
                        }
                    }).catch((err) => {
                        console.log(err);
                        response.json({ message: err.message, success: false });
                    });
                }
                else {
                    response.json({
                        message: "Error al actualizar orden: " + findResultState,
                        success: false
                    });
                }
            }).catch((err) => {
                console.log(err);
                response.json({
                    message: err,
                    success: false
                });
            });
        }
        catch (error) {
            console.log(error);
            response.json({
                message: error.message,
                success: false
            });
        }
    }
    async updateReassignShop(request, response, next, app) {
        try {
            const { ids, shopId } = request.body;
            let arrayIds = [];
            ids.map((id) => {
                arrayIds.push({ "_id": mongoose_1.default.Types.ObjectId(id) });
            });
            let queryOrder = { '_id': { '$in': ids } };
            let updateOrder = {};
            updateOrder['shopId'] = mongoose_1.default.Types.ObjectId(shopId);
            updateManyDB(Orders_1.default, queryOrder, updateOrder, null, null).then((updateOrder) => {
                if (updateOrder) {
                    response.json({
                        message: 'Ordenes actualizada exitosamente',
                        data: updateOrder,
                        success: true
                    });
                }
                else {
                    response.json({
                        message: "Error al actualizar orden: " + updateOrder,
                        success: false
                    });
                }
            }).catch((err) => {
                response.json({
                    message: err,
                    success: false
                });
            });
        }
        catch (error) {
            response.json({
                message: error.message,
                success: false
            });
        }
    }
    async updateLogistic(request, response, next, app) {
        try {
            const { id, products } = request.body;
            let queryOrder = { "_id": mongoose_1.default.Types.ObjectId(id) };
            let query = { "key": 0 };
            findDocuments(State_1.default, query, "", {}, '', '', 0, null, null).then((findResultState) => {
                if (findResultState.length > 0) {
                    let stateId = findResultState[0]._id;
                    let updateOrder = { products: products, state: mongoose_1.default.Types.ObjectId(stateId) };
                    updateOrder['isInShop'] = true;
                    findOneAndUpdateDB(Orders_1.default, queryOrder, updateOrder, null, null).then((updateOrder) => {
                        if (updateOrder) {
                            response.json({
                                message: 'Orden actualizada exitosamente',
                                data: updateOrder,
                                success: true
                            });
                        }
                        else {
                            response.json({
                                message: "Error al actualizar orden: " + updateOrder,
                                success: false
                            });
                        }
                    }).catch((err) => {
                        response.json({
                            message: err,
                            success: false
                        });
                    });
                }
                else {
                    response.json({
                        message: "Error al actualizar orden: " + findResultState,
                        success: false
                    });
                }
            }).catch((err) => {
                response.json({
                    message: err,
                    success: false
                });
            });
        }
        catch (error) {
            response.json({
                message: error.message,
                success: false
            });
        }
    }
    async orders(request, response, next, app) {
        try {
            const { company, profile } = request.body;
            let query;
            let populate = '';
            if (profile == 2) {
                query = {
                    "uid": company,
                    "pickerId": { "$eq": null }
                };
            }
            else {
                query = {};
            }
            if (profile == 4)
                populate = 'bag deliveryId pickerId state service';
            findDocuments(Orders_1.default, query, "", {}, populate, '', 0, null, null).then((result) => {
                response.json({
                    message: 'Listado de ordenes',
                    data: result,
                    success: true
                });
            }).catch((err) => {
                response.json({
                    message: err,
                    success: false
                });
            });
        }
        catch (error) {
            response.json({
                message: error,
                success: false
            });
        }
    }
    async ordersTest(request, response, next, app) {
        try {
            let query;
            let populate = '';
            query = {};
            let _populate = {
                path: 'uid',
            };
            let _populate1 = {
                path: 'bag',
                populate: {
                    path: 'shopId'
                }
            };
            let _populate2 = {
                path: 'state',
            };
            let _populate3 = {
                path: 'deliveryId',
                populate: {
                    path: 'company'
                }
            };
            let _populate4 = {
                path: 'pickerId',
                populate: {
                    path: 'company'
                }
            };
            let _populate5 = {
                path: 'service',
            };
            let _populate6 = {
                path: 'shopId',
            };
            findDocumentsMultiPopulate(Orders_1.default, query, "", {}, _populate, _populate1, _populate2, _populate3, _populate4, _populate5, _populate6, '', 0, null, null).then((result) => {
                let ordersToReturn = [];
                result.map((order, index) => {
                    let shopname = "", pickername = "", pickerrut = "", pickercompany = "", deliveryname = "", deliveryrut = "", deliverycompany = "", bagdelivery = "", bagrecived = "", tienda = "", cliente = "";
                    let keys = Object.keys(order);
                    let orderReturn = {};
                    orderReturn['tercero'] = order.client.third;
                    orderReturn['clienteRut'] = order.client.rut;
                    orderReturn['clienteComuna'] = order.client.comuna;
                    orderReturn['clienteCiudad'] = order.client.ciudad;
                    orderReturn['clienteLongitud'] = order.client.long;
                    orderReturn['clienteLatitud'] = order.client.lat;
                    if (order.shopId)
                        shopname = order.shopId.number;
                    orderReturn['tienda'] = shopname;
                    if (order.pickerId)
                        pickername = order.pickerId.name;
                    orderReturn['pickerNombre'] = pickername;
                    if (order.pickerId)
                        pickerrut = order.pickerId.rut;
                    orderReturn['pickerRut'] = pickerrut;
                    if (order.pickerId)
                        pickercompany = order.pickerId.company.name;
                    orderReturn['pickerCuenta'] = pickercompany;
                    if (order.deliveryId)
                        deliveryname = order.deliveryId.name;
                    orderReturn['deliveryNombre'] = deliveryname;
                    if (order.deliveryId)
                        deliveryrut = order.deliveryId.rut;
                    orderReturn['deliveryRut'] = deliveryrut;
                    if (order.deliveryId)
                        deliverycompany = order.deliveryId.company.name;
                    orderReturn['deliveryCuenta'] = deliverycompany;
                    if (order.bag)
                        bagdelivery = order.bag.delivery;
                    orderReturn['bultoDelivery'] = bagdelivery;
                    if (order.bag)
                        bagrecived = order.bag.received;
                    orderReturn['bultoRecived'] = bagrecived;
                    orderReturn['numeroOrden'] = order.orderNumber;
                    if (order.uid)
                        cliente = order.uid.name;
                    orderReturn['cliente'] = cliente;
                    orderReturn['inicioPicking'] = order.startPickingDate;
                    orderReturn['finPicking'] = order.endPickingDate;
                    orderReturn['inicioDelivery'] = order.starDeliveryDate;
                    orderReturn['finDelivery'] = order.endDeliveryDate;
                    orderReturn['fechaCancelado'] = order.cancellDate;
                    orderReturn['fechaComromiso'] = order.realdatedelivery;
                    orderReturn['isInShop'] = order.isInShop;
                    orderReturn['restocked'] = order.restocked;
                    orderReturn['estadoId'] = order.state.key;
                    orderReturn['estadoDesc'] = order.state.desc;
                    orderReturn['servicioId'] = order.service.key;
                    orderReturn['servicioTipo'] = order.service.typeDelivery;
                    orderReturn['canal'] = order.channel;
                    orderReturn['fechaCompra'] = order.date;
                    orderReturn['turno'] = order.pickerWorkShift;
                    if (order.bag) {
                        //aqui se sacan los productos si hay un bulto hecho
                        order.bag.bags.map((bag) => {
                            bag.products.map((producto) => {
                                orderReturn['numeroBulto'] = producto.bagNumber;
                                orderReturn['productoUnidadesPicked'] = producto.unitsPicked;
                                orderReturn['productoUnidadesSusti'] = producto.unitsSubstitutes;
                                orderReturn['productoUnidadesBroke'] = producto.unitsBroken;
                                orderReturn['productoUnidadesReplace'] = producto.unitsReplaced;
                                orderReturn['productoRecepcion'] = '';
                                orderReturn['productoId'] = producto.id;
                                orderReturn['productoCodigoBarra'] = producto.barcode;
                                orderReturn['producto'] = producto.product;
                                orderReturn['productoUnidades'] = producto.units;
                                orderReturn['productoUbicacion'] = producto.location;
                                ordersToReturn.push(orderReturn);
                            });
                        });
                    }
                    else {
                        //aqui se sacan los productos si no hay un bulto hecho
                        order.products.map((producto) => {
                            orderReturn['numeroBulto'] = '';
                            orderReturn['productoUnidadesPicked'] = producto.unitsPicked;
                            orderReturn['productoUnidadesSusti'] = producto.unitsSubstitutes;
                            orderReturn['productoUnidadesBroke'] = producto.unitsBroken;
                            orderReturn['productoUnidadesReplace'] = producto.unitsReplaced;
                            orderReturn['productoRecepcion'] = producto.reception;
                            orderReturn['productoId'] = producto.id;
                            orderReturn['productoCodigoBarra'] = producto.barcode;
                            orderReturn['producto'] = producto.product;
                            orderReturn['productoUnidades'] = producto.units;
                            orderReturn['productoUbicacion'] = producto.location;
                            ordersToReturn.push(orderReturn);
                        });
                    }
                });
                response.json({
                    result: ordersToReturn
                });
            }).catch((err) => {
                response.json({
                    message: err.message,
                    success: false
                });
            });
        }
        catch (error) {
            response.json({
                message: error,
                success: false
            });
        }
    }
    async getOrderDetailById(request, response, next, app) {
        try {
            const { id } = request.body;
            let query;
            let populate = '';
            query = { "_id": mongoose_1.default.Types.ObjectId(id) };
            populate = 'bag pickerId deliveryId state service';
            findOneDB(Orders_1.default, query, "", {}, populate, null, null).then((result) => {
                if (Object.keys(result).length > 0) {
                    if (!result.client.comment)
                        result.set('client.comment', "Sin Comentarios", { strict: false });
                    let pickername = "";
                    let deliveryname = "";
                    let pickingDate = "";
                    let delilveryDateStart = "";
                    let delilveryDateEnd = "";
                    if (result.pickerId)
                        pickername = result.pickerId.name;
                    if (result.deliveryId)
                        deliveryname = result.deliveryId.name;
                    if (result.endPickingDate)
                        pickingDate = result.endPickingDate;
                    if (result.starDeliveryDate)
                        delilveryDateStart = result.starDeliveryDate;
                    if (result.endDeliveryDate)
                        delilveryDateEnd = result.endDeliveryDate;
                    const rows = [
                        this.createData('DateRange', result.date, pickingDate, delilveryDateStart, delilveryDateEnd, 0),
                        this.createData('AccessTime', result.date, pickingDate, delilveryDateStart, delilveryDateEnd, 1),
                        this.createData('Person', "", pickername, deliveryname, deliveryname, 2)
                    ];
                    if (!result.client.comment)
                        result.set('client.comment', "Sin Comentarios", { strict: false });
                    result.set('timeLine', [...rows], { strict: false });
                    response.json({
                        message: 'Detalle de la orden',
                        data: result,
                        success: true
                    });
                }
                else {
                    response.json({
                        message: 'No se encontro detalle de la orden',
                        data: result,
                        success: false
                    });
                }
            }).catch((err) => {
                response.json({
                    message: err,
                    success: false
                });
            });
        }
        catch (error) {
            response.json({
                message: error,
                success: false
            });
        }
    }
    async getOrderDetailBynumber(request, response, next, app) {
        try {
            const { orderNumber, company } = request.body;
            let query;
            let query_ = {};
            let populate = '';
            query = { "orderNumber": orderNumber };
            if (company)
                query['uid'] = mongoose_1.default.Types.ObjectId(company);
            populate = 'bag pickerId deliveryId state service';
            let queryState = { $or: [{ "key": 6 }, { "key": 7 }] };
            findDocuments(State_1.default, queryState, "", {}, '', '', 0, null, null).then((stateResult) => {
                let arrayQuery = [];
                if (stateResult.length > 0) {
                    stateResult.map((stat) => {
                        let stateId = stat._id;
                        arrayQuery.push(mongoose_1.default.Types.ObjectId(stateId));
                    });
                    query['state'] = { $in: arrayQuery };
                    findDocuments(Orders_1.default, query, "", {}, populate, '', 1, null, null).then((result) => {
                        if (result.length > 0) {
                            let newOrders = result.map((order, index) => {
                                if (!order.client.comment)
                                    order.set('client.comment', "Sin Comentarios", { strict: false });
                                let pickername = "";
                                let deliveryname = "";
                                let pickingDate = "";
                                let delilveryDateStart = "";
                                let delilveryDateEnd = "";
                                if (order.pickerId)
                                    pickername = order.pickerId.name;
                                if (order.deliveryId)
                                    deliveryname = order.deliveryId.name;
                                if (order.endPickingDate)
                                    pickingDate = order.endPickingDate;
                                if (order.starDeliveryDate)
                                    delilveryDateStart = order.starDeliveryDate;
                                if (order.endDeliveryDate)
                                    delilveryDateEnd = order.endDeliveryDate;
                                const rows = [
                                    this.createData('DateRange', order.date, pickingDate, delilveryDateStart, delilveryDateEnd, 0),
                                    this.createData('AccessTime', order.date, pickingDate, delilveryDateStart, delilveryDateEnd, 1),
                                    this.createData('Person', "", pickername, deliveryname, deliveryname, 2)
                                ];
                                if (!order.client.comment)
                                    order.set('client.comment', "Sin Comentarios", { strict: false });
                                order.set('timeLine', [...rows], { strict: false });
                                return order;
                            });
                            response.json({
                                message: 'Detalle de la orden',
                                data: newOrders[0],
                                success: true
                            });
                        }
                        else {
                            response.json({
                                message: 'No se encontro detalle de la orden',
                                data: result,
                                success: false
                            });
                        }
                    }).catch((err) => {
                        response.json({
                            message: err.message,
                            success: false
                        });
                    });
                }
                else {
                    response.json({
                        message: 'No se encontraron estados',
                        data: {},
                        success: false
                    });
                }
            }).catch((err) => {
                response.json({
                    message: err.message,
                    success: false
                });
            });
        }
        catch (error) {
            response.json({
                message: error,
                success: false
            });
        }
    }
    createData(name, compra, picking, delivery, reception, type) {
        if (type == 0) {
            if (compra) {
                let _compra = new Date(compra);
                let date = moment_1.default(compra, "YYYY-MM-DDTHH:MM:ss");
                compra = date.date() + '/' + (date.month() + 1) + '/' + date.year();
            }
            if (picking) {
                let _picking = new Date(picking);
                let date = moment_1.default(picking, "YYYY-MM-DDTHH:MM:ss");
                picking = date.date() + '/' + (date.month() + 1) + '/' + date.year();
            }
            if (delivery) {
                let _delivery = new Date(delivery);
                let date = moment_1.default(delivery, "YYYY-MM-DDTHH:MM:ss");
                delivery = date.date() + '/' + (date.month() + 1) + '/' + date.year();
            }
            if (reception) {
                let _reception = new Date(reception);
                let date = moment_1.default(reception, "YYYY-MM-DDTHH:MM:ss");
                reception = date.date() + '/' + (date.month() + 1) + '/' + date.year();
            }
        }
        if (type == 1) {
            if (compra) {
                let date = moment_1.default(compra, "YYYY-MM-DDTHH:MM:ss");
                let _compra = new Date(compra);
                compra = date.hours() + ':' + date.minutes();
            }
            if (picking) {
                let date = moment_1.default(picking, "YYYY-MM-DDTHH:MM:ss");
                let _picking = new Date(picking);
                picking = date.hours() + ':' + date.minutes();
            }
            if (delivery) {
                let date = moment_1.default(delivery, "YYYY-MM-DDTHH:MM:ss");
                let _delivery = new Date(delivery);
                delivery = date.hours() + ':' + date.minutes();
            }
            if (reception) {
                let date = moment_1.default(reception, "YYYY-MM-DDTHH:MM:ss");
                let _reception = new Date(reception);
                reception = date.hours() + ':' + date.minutes();
            }
        }
        return { name, compra, picking, delivery, reception };
    }
    async ordersForOmsFindSearchHome(request, response, next, app) {
        try {
            const { company, profile, query } = request.body;
            let _query;
            let query_ = {};
            let _populate1 = {};
            let _populate2 = {};
            let namePicker = "";
            let nameDelivery = "";
            let populate = '';
            let queryState;
            queryState = { $or: [{ "key": 2 }] };
            let arrayQuery = [];
            if (Object.keys(query).length > 0) {
                if (query.buyFromDate && query.buyToDate) {
                    let from = new Date(query.buyFromDate);
                    let to = new Date(query.buyToDate);
                    from.setHours(0);
                    from.setMinutes(0);
                    from.setSeconds(0);
                    to.setHours(23);
                    to.setMinutes(59);
                    to.setSeconds(59);
                    query_['date'] = {
                        $gte: from,
                        $lt: to
                    };
                }
                if (query.buyFromDate && !query.buyToDate) {
                    let from = new Date(query.buyFromDate);
                    let to = new Date();
                    from.setHours(0);
                    from.setMinutes(0);
                    from.setSeconds(0);
                    query_['date'] = {
                        $gte: from,
                        $lt: to
                    };
                }
                if (query.deliveryFromDate && query.deliveryToDate) {
                    let from = new Date(query.deliveryFromDate);
                    let to = new Date(query.deliveryToDate);
                    from.setHours(0);
                    from.setMinutes(0);
                    from.setSeconds(0);
                    to.setHours(23);
                    to.setMinutes(59);
                    to.setSeconds(59);
                    query_['realdatedelivery'] = {
                        $gte: from,
                        $lt: to
                    };
                }
                if (query.deliveryFromDate && !query.deliveryToDate) {
                    let from = new Date(query.deliveryFromDate);
                    let to = new Date();
                    from.setHours(0);
                    from.setMinutes(0);
                    from.setSeconds(0);
                    to.setHours(23);
                    to.setMinutes(59);
                    to.setSeconds(59);
                    query_['realdatedelivery'] = {
                        $gte: from,
                        $lt: to
                    };
                }
                if (query.rut) {
                    query_['client.rut'] = { $regex: new RegExp(query.rut, "i") };
                }
                if (query.orderNumber) {
                    query_['orderNumber'] = query.orderNumber;
                }
                if (query.service) {
                    query_['service'] = mongoose_1.default.Types.ObjectId(query.service);
                }
                if (query.shopId) {
                    query_['shopId'] = mongoose_1.default.Types.ObjectId(query.shopId);
                }
                if (query.pickerName) {
                    namePicker = query.pickerName;
                    query_['pickerName'] = { $regex: new RegExp(namePicker, "i") };
                }
                if (query.deliveryName) {
                    nameDelivery = query.deliveryName;
                    query_['deliveryName'] = { $regex: new RegExp(nameDelivery, "i") };
                }
            }
            if (company)
                query_['uid'] = mongoose_1.default.Types.ObjectId(company);
            findDocuments(Orders_1.default, query_, "", {}, '', 0, null, null).then((result) => {
                if (result.length) {
                    let newOrders = result.map((order, index) => {
                        let pickername = "";
                        let deliveryname = "";
                        let pickingDate = "";
                        let delilveryDateStart = "";
                        let delilveryDateEnd = "";
                        if (order.pickerId)
                            pickername = order.pickerId.name;
                        if (order.deliveryId)
                            deliveryname = order.deliveryId.name;
                        if (order.endPickingDate)
                            pickingDate = order.endPickingDate;
                        if (order.starDeliveryDate)
                            delilveryDateStart = order.starDeliveryDate;
                        if (order.endDeliveryDate)
                            delilveryDateEnd = order.endDeliveryDate;
                        const rows = [
                            this.createData('DateRange', order.date, pickingDate, delilveryDateStart, delilveryDateEnd, 0),
                            this.createData('AccessTime', order.date, pickingDate, delilveryDateStart, delilveryDateEnd, 1),
                            this.createData('Person', "", pickername, deliveryname, deliveryname, 2)
                        ];
                        if (!order.client.comment)
                            order.set('client.comment', "Sin Comentarios", { strict: false });
                        order.set('timeLine', [...rows], { strict: false });
                        return order;
                    });
                    response.json({
                        message: 'Listado de ordenes home',
                        data: newOrders,
                        success: true,
                        orders: result.length
                    });
                }
                else {
                    response.json({
                        message: 'Listado de ordenes home',
                        data: result,
                        success: true,
                        orders: result.length
                    });
                }
            }).catch((err) => {
                response.json({
                    message: err,
                    success: false,
                    data: []
                });
            });
        }
        catch (error) {
            response.json({
                message: error,
                success: false,
                data: []
            });
        }
    }
    async ordersForOms(request, response, next, app) {
        try {
            const { company, profile, state, query } = request.body;
            let _query;
            let query_ = {};
            let populate = 'bag pickerId deliveryId state service shopId';
            if (profile == 4)
                populate = 'bag pickerId deliveryId state service shopId';
            let queryState;
            queryState = { "key": 0 };
            if (state) {
                queryState = { "key": state };
            }
            findDocuments(State_1.default, queryState, "", {}, '', '', 0, null, null).then((stateResult) => {
                if (stateResult.length > 0) {
                    let stateId = stateResult[0]._id;
                    if (state) {
                        query_['state'] = mongoose_1.default.Types.ObjectId(stateId);
                    }
                    if (company) {
                        query_['uid'] = mongoose_1.default.Types.ObjectId(company);
                    }
                    findDocuments(Orders_1.default, query_, "", {}, populate, '', 0, null, null).then((result) => {
                        if (result.length) {
                            let newOrders = result.map((order, index) => {
                                let pickername = "";
                                let deliveryname = "";
                                let pickingDate = "";
                                let delilveryDateStart = "";
                                let delilveryDateEnd = "";
                                if (order.pickerId)
                                    pickername = order.pickerId.name;
                                if (order.deliveryId)
                                    deliveryname = order.deliveryId.name;
                                if (order.endPickingDate)
                                    pickingDate = order.endPickingDate;
                                if (order.starDeliveryDate)
                                    delilveryDateStart = order.starDeliveryDate;
                                if (order.endDeliveryDate)
                                    delilveryDateEnd = order.endDeliveryDate;
                                const rows = [
                                    this.createData('DateRange', order.date, pickingDate, delilveryDateStart, delilveryDateEnd, 0),
                                    this.createData('AccessTime', order.date, pickingDate, delilveryDateStart, delilveryDateEnd, 1),
                                    this.createData('Person', "", pickername, deliveryname, deliveryname, 2)
                                ];
                                if (!order.client.comment)
                                    order.set('client.comment', "Sin Comentarios", { strict: false });
                                order.set('timeLine', [...rows], { strict: false });
                                return order;
                            });
                            response.json({
                                message: 'Listado de ordenes',
                                data: newOrders,
                                success: true
                            });
                        }
                        else {
                            response.json({
                                message: 'Listado de ordenes',
                                data: result,
                                success: true
                            });
                        }
                    }).catch((err) => {
                        response.json({
                            message: err.message,
                            success: false
                        });
                    });
                }
                else {
                    response.json({
                        message: 'Error al listar ordernes',
                        success: false
                    });
                }
            }).catch((err) => {
                response.json({
                    message: err.message,
                    success: false
                });
            });
        }
        catch (error) {
            response.json({
                message: error,
                success: false
            });
        }
    }
    async ordersForOmsPrintLabel(request, response, next, app) {
        try {
            const { company, profile, state, query } = request.body;
            let _query;
            let query_ = {};
            let populate = 'bag pickerId deliveryId state service shopId';
            let queryState;
            queryState = { "key": { $in: [0, 1, 2, 3] } };
            if (Object.keys(query).length > 0) {
                if (query.orderNumber)
                    query_['orderNumber'] = query.orderNumber;
            }
            findDocuments(State_1.default, queryState, "", {}, '', '', 0, null, null).then((stateResult) => {
                if (stateResult.length > 0) {
                    let states = [];
                    stateResult.map((state) => {
                        states.push(mongoose_1.default.Types.ObjectId(state._id));
                    });
                    query_['state'] = { $in: states };
                    if (company) {
                        query_['uid'] = mongoose_1.default.Types.ObjectId(company);
                    }
                    findDocuments(Orders_1.default, query_, "", {}, populate, '', 0, null, null).then((result) => {
                        if (result.length) {
                            let newOrders = result.map((order, index) => {
                                let pickername = "";
                                let deliveryname = "";
                                let pickingDate = "";
                                let delilveryDateStart = "";
                                let delilveryDateEnd = "";
                                if (order.pickerId)
                                    pickername = order.pickerId.name;
                                if (order.deliveryId)
                                    deliveryname = order.deliveryId.name;
                                if (order.endPickingDate)
                                    pickingDate = order.endPickingDate;
                                if (order.starDeliveryDate)
                                    delilveryDateStart = order.starDeliveryDate;
                                if (order.endDeliveryDate)
                                    delilveryDateEnd = order.endDeliveryDate;
                                const rows = [
                                    this.createData('DateRange', order.date, pickingDate, delilveryDateStart, delilveryDateEnd, 0),
                                    this.createData('AccessTime', order.date, pickingDate, delilveryDateStart, delilveryDateEnd, 1),
                                    this.createData('Person', "", pickername, deliveryname, deliveryname, 2)
                                ];
                                if (!order.client.comment)
                                    order.set('client.comment', "Sin Comentarios", { strict: false });
                                order.set('timeLine', [...rows], { strict: false });
                                return order;
                            });
                            if (Object.keys(query).length > 0) {
                                if (query.hasOwnProperty('printed')) {
                                    newOrders = newOrders.filter((order) => {
                                        return order.printed == query.printed;
                                    });
                                }
                            }
                            response.json({
                                message: 'Listado de ordenes',
                                data: newOrders,
                                success: true
                            });
                        }
                        else {
                            response.json({
                                message: 'Listado de ordenes',
                                data: result,
                                success: true
                            });
                        }
                    }).catch((err) => {
                        response.json({
                            message: err.message,
                            success: false
                        });
                    });
                }
                else {
                    response.json({
                        message: 'Error al listar ordernes',
                        success: false
                    });
                }
            }).catch((err) => {
                response.json({
                    message: err.message,
                    success: false
                });
            });
        }
        catch (error) {
            response.json({
                message: error,
                success: false
            });
        }
    }
    async ordersForOmsCancelledExport(request, response, next, app) {
        try {
            const { company, profile, state, query } = request.body;
            let _query;
            let query_ = {};
            let populate = 'bag pickerId deliveryId state service shopId';
            if (profile == 4)
                populate = 'bag pickerId deliveryId state service shopId';
            let queryState;
            queryState = { "key": 8 };
            console.log("ids", query.ids);
            findDocuments(State_1.default, queryState, "", {}, '', '', 0, null, null).then((stateResult) => {
                if (stateResult.length > 0) {
                    let stateId = stateResult[0]._id;
                    if (query && Object.keys(query).length > 0) {
                        if (query.ids) {
                            if (query.ids.length > 0)
                                query_["_id"] = { $in: [...query.ids] };
                        }
                        if (query.shopId)
                            query_["shopId"] = mongoose_1.default.Types.ObjectId(query.shopId);
                        if (query.name)
                            query_["client.name"] = query.name;
                        if (query.address)
                            query_["client.address"] = query.address;
                    }
                    if (stateId)
                        query_["state"] = mongoose_1.default.Types.ObjectId(stateId);
                    findDocuments(Orders_1.default, query_, "", {}, populate, '', 0, null, null).then((result) => {
                        if (result.length) {
                            let newOrders = result.map((order, index) => {
                                let pickername = "";
                                let deliveryname = "";
                                let pickingDate = "";
                                let delilveryDateStart = "";
                                let delilveryDateEnd = "";
                                if (order.pickerId)
                                    pickername = order.pickerId.name;
                                if (order.deliveryId)
                                    deliveryname = order.deliveryId.name;
                                if (order.endPickingDate)
                                    pickingDate = order.endPickingDate;
                                if (order.starDeliveryDate)
                                    delilveryDateStart = order.starDeliveryDate;
                                if (order.endDeliveryDate)
                                    delilveryDateEnd = order.endDeliveryDate;
                                const rows = [
                                    this.createData('DateRange', order.date, pickingDate, delilveryDateStart, delilveryDateEnd, 0),
                                    this.createData('AccessTime', order.date, pickingDate, delilveryDateStart, delilveryDateEnd, 1),
                                    this.createData('Person', "", pickername, deliveryname, deliveryname, 2)
                                ];
                                if (!order.client.comment)
                                    order.set('client.comment', "Sin Comentarios", { strict: false });
                                order.set('timeLine', [...rows], { strict: false });
                                return order;
                            });
                            try {
                                let data = newOrders;
                                let headers = ["Número de Orden", "Nombre Cliente", "Télefono", "Correo", "Fecha de compra", "Fecha de cancelación", "Fecha de compromiso", "Canal", "Servicio", "Estado"];
                                let reportdata = data.map(field => {
                                    let file = `{
                      "Número de Orden":"${field.orderNumber}",
                      "Nombre Cliente":"${field.client.name}",
                      "Télefono":"${field.client.cellphone}",
                      "Correo":"${field.client.email}",
                      "Fecha de compra":"${moment_1.default(field.cancellDate).format("DD/MM/YYYY HH:mm")}",
                      "Fecha de cancelación":"${moment_1.default(field.date).format("DD/MM/YYYY HH:mm")}",
                      "Fecha de compromiso":"${moment_1.default(field.realdatedelivery).format("DD/MM/YYYY HH:mm")}",
                      "Canal":"${field.channel}",
                      "Servicio":"${field.service.desc}",
                      "Estado":"${field.state.desc}"
                    }`;
                                    return JSON.parse(file);
                                });
                                let wb = xlsx_1.default.utils.book_new();
                                let name = "Reporte_ordenes_canceladas.xlsx";
                                let xlsData = xlsx_1.default.utils.json_to_sheet(reportdata, {
                                    header: headers,
                                });
                                xlsx_1.default.utils.book_append_sheet(wb, xlsData, "Reporte");
                                xlsx_1.default.writeFile(wb, name);
                                response.download(name);
                            }
                            catch (err) {
                                response.json({
                                    message: err.message,
                                    success: false
                                });
                            }
                        }
                        else {
                            response.json({
                                message: 'Sin data para exportar',
                                success: false
                            });
                        }
                    }).catch((err) => {
                        response.json({
                            message: err.message,
                            success: false
                        });
                    });
                }
                else {
                    response.json({
                        message: 'Error al Exportar ordenes',
                        success: false
                    });
                }
            }).catch((err) => {
                response.json({
                    message: err.message,
                    success: false
                });
            });
        }
        catch (error) {
            response.json({
                message: error,
                success: false
            });
        }
    }
    async ordersForOmsCancelledSearch(request, response, next, app) {
        try {
            const { company, profile, state, query } = request.body;
            let _query;
            let query_ = {};
            let populate = 'bag pickerId deliveryId state service shopId';
            if (profile == 4)
                populate = 'bag pickerId deliveryId state service shopId';
            let queryState;
            queryState = { "key": 8 };
            findDocuments(State_1.default, queryState, "", {}, '', '', 0, null, null).then((stateResult) => {
                if (stateResult.length > 0) {
                    let stateId = stateResult[0]._id;
                    if (stateId)
                        query_['state'] = mongoose_1.default.Types.ObjectId(stateId);
                    if (query && Object.keys(query).length > 0) {
                        if (query.buyDate) {
                            let from = new Date(query.buyDate);
                            let to = new Date();
                            from.setHours(0);
                            from.setMinutes(0);
                            from.setSeconds(0);
                            to.setHours(23);
                            to.setMinutes(59);
                            to.setSeconds(59);
                            query_['date'] = {
                                $gte: from,
                                $lt: to
                            };
                        }
                        if (query.cancellDate) {
                            let from = new Date(query.cancellDate);
                            let to = new Date();
                            from.setHours(0);
                            from.setMinutes(0);
                            from.setSeconds(0);
                            to.setHours(23);
                            to.setMinutes(59);
                            to.setSeconds(59);
                            query_['cancellDate'] = {
                                $gte: from,
                                $lt: to
                            };
                        }
                        if (query.shopId)
                            query_['shopId'] = mongoose_1.default.Types.ObjectId(query.shopId);
                    }
                    findDocuments(Orders_1.default, query_, "", {}, populate, '', 0, null, null).then((result) => {
                        if (result.length) {
                            let newOrders = result.map((order, index) => {
                                let pickername = "";
                                let deliveryname = "";
                                let pickingDate = "";
                                let delilveryDateStart = "";
                                let delilveryDateEnd = "";
                                if (order.pickerId)
                                    pickername = order.pickerId.name;
                                if (order.deliveryId)
                                    deliveryname = order.deliveryId.name;
                                if (order.endPickingDate)
                                    pickingDate = order.endPickingDate;
                                if (order.starDeliveryDate)
                                    delilveryDateStart = order.starDeliveryDate;
                                if (order.endDeliveryDate)
                                    delilveryDateEnd = order.endDeliveryDate;
                                const rows = [
                                    this.createData('DateRange', order.date, pickingDate, delilveryDateStart, delilveryDateEnd, 0),
                                    this.createData('AccessTime', order.date, pickingDate, delilveryDateStart, delilveryDateEnd, 1),
                                    this.createData('Person', "", pickername, deliveryname, deliveryname, 2)
                                ];
                                if (!order.client.comment)
                                    order.set('client.comment', "Sin Comentarios", { strict: false });
                                order.set('timeLine', [...rows], { strict: false });
                                return order;
                            });
                            response.json({
                                message: 'Listado de ordenes',
                                data: newOrders,
                                success: true
                            });
                        }
                        else {
                            response.json({
                                message: 'Listado de ordenes',
                                data: result,
                                success: true
                            });
                        }
                    }).catch((err) => {
                        response.json({
                            message: err.message,
                            success: false
                        });
                    });
                }
                else {
                    response.json({
                        message: 'Error al listar ordernes',
                        success: false
                    });
                }
            }).catch((err) => {
                response.json({
                    message: err.message,
                    success: false
                });
            });
        }
        catch (error) {
            response.json({
                message: error,
                success: false
            });
        }
    }
    async ordersForOmsViewSearch(request, response, next, app) {
        try {
            const { company, profile, state, shopId, query } = request.body;
            let query_ = {};
            if (company) {
                query_["uid"] = mongoose_1.default.Types.ObjectId(company);
            }
            if (shopId) {
                query_["shopId"] = mongoose_1.default.Types.ObjectId(shopId);
            }
            let queryState;
            queryState = { "key": { $in: [5, 6, 7, 8] } };
            findDocuments(State_1.default, queryState, "", {}, '', '', 0, null, null).then((stateResult) => {
                if (stateResult.length > 0) {
                    let stateId = [];
                    stateResult.map((state) => {
                        stateId.push(mongoose_1.default.Types.ObjectId(state._id));
                    });
                    if (stateId)
                        query_['state'] = { $nin: stateId };
                    findDocuments(Orders_1.default, query_, "", {}, '', '', 0, null, null).then((result) => {
                        if (result.length) {
                            let newOrders = result.map((order, index) => {
                                let pickername = "";
                                let deliveryname = "";
                                let pickingDate = "";
                                let delilveryDateStart = "";
                                let delilveryDateEnd = "";
                                if (order.pickerId)
                                    pickername = order.pickerId.name;
                                if (order.deliveryId)
                                    deliveryname = order.deliveryId.name;
                                if (order.endPickingDate)
                                    pickingDate = order.endPickingDate;
                                if (order.starDeliveryDate)
                                    delilveryDateStart = order.starDeliveryDate;
                                if (order.endDeliveryDate)
                                    delilveryDateEnd = order.endDeliveryDate;
                                const rows = [
                                    this.createData('DateRange', order.date, pickingDate, delilveryDateStart, delilveryDateEnd, 0),
                                    this.createData('AccessTime', order.date, pickingDate, delilveryDateStart, delilveryDateEnd, 1),
                                    this.createData('Person', "", pickername, deliveryname, deliveryname, 2)
                                ];
                                if (!order.client.comment)
                                    order.set('client.comment', "Sin Comentarios", { strict: false });
                                order.set('timeLine', [...rows], { strict: false });
                                return order;
                            });
                            response.json({
                                message: 'Listado de ordenes',
                                data: newOrders,
                                success: true
                            });
                        }
                        else {
                            response.json({
                                message: 'Listado de ordenes',
                                data: result,
                                success: true
                            });
                        }
                    }).catch((err) => {
                        response.json({
                            message: err.message,
                            success: false
                        });
                    });
                }
                else { }
            }).catch((err) => {
                response.json({
                    message: err.message,
                    success: false
                });
            });
        }
        catch (error) {
            response.json({
                message: error,
                success: false
            });
        }
    }
    async ordersForOmsFindIncident(request, response, next, app) {
        try {
            const { company, shopId, orderNumber } = request.body;
            let _query;
            let _queryor;
            let query_ = {};
            let populate = 'bag pickerId deliveryId state service shopId';
            let queryState;
            queryState = { "key": { $in: [6, 7] } };
            findDocuments(State_1.default, queryState, "", {}, '', '', 0, null, null).then((stateResult) => {
                let arrayQuery = [];
                if (stateResult.length > 0) {
                    stateResult.map((stat) => {
                        let stateId = stat._id;
                        arrayQuery.push(mongoose_1.default.Types.ObjectId(stateId));
                    });
                    query_['state'] = { $in: arrayQuery };
                    if (company)
                        query_['uid'] = mongoose_1.default.Types.ObjectId(company);
                    if (shopId)
                        query_['shopId'] = mongoose_1.default.Types.ObjectId(shopId);
                    if (orderNumber)
                        query_['orderNumber'] = orderNumber;
                    console.log("update ", query_);
                    _queryor = { $or: [query_, { partialBroken: true }, { totalBroken: true }] };
                    findDocuments(Orders_1.default, _queryor, "", {}, populate, '', 0, null, null).then((result) => {
                        if (result.length) {
                            let newOrders = result.map((order, index) => {
                                let pickername = "";
                                let deliveryname = "";
                                let pickingDate = "";
                                let delilveryDateStart = "";
                                let delilveryDateEnd = "";
                                if (order.pickerId)
                                    pickername = order.pickerId.name;
                                if (order.deliveryId)
                                    deliveryname = order.deliveryId.name;
                                if (order.endPickingDate)
                                    pickingDate = order.endPickingDate;
                                if (order.starDeliveryDate)
                                    delilveryDateStart = order.starDeliveryDate;
                                if (order.endDeliveryDate)
                                    delilveryDateEnd = order.endDeliveryDate;
                                const rows = [
                                    this.createData('DateRange', order.date, pickingDate, delilveryDateStart, delilveryDateEnd, 0),
                                    this.createData('AccessTime', order.date, pickingDate, delilveryDateStart, delilveryDateEnd, 1),
                                    this.createData('Person', "", pickername, deliveryname, deliveryname, 2)
                                ];
                                if (!order.client.comment)
                                    order.set('client.comment', "Sin Comentarios", { strict: false });
                                order.set('timeLine', [...rows], { strict: false });
                                return order;
                            });
                            response.json({
                                message: 'Listado de ordenes',
                                data: newOrders,
                                success: true
                            });
                        }
                        else {
                            response.json({
                                message: 'Listado de ordenes',
                                data: result,
                                success: true
                            });
                        }
                    }).catch((err) => {
                        response.json({
                            message: err.message,
                            success: false
                        });
                    });
                }
                else {
                    response.json({
                        message: 'Error al listar ordernes',
                        success: false
                    });
                }
            }).catch((err) => {
                response.json({
                    message: err.message,
                    success: false
                });
            });
        }
        catch (error) {
            response.json({
                message: error,
                success: false
            });
        }
    }
    async ordersForOmsFindReset(request, response, next, app) {
        try {
            const { company, shopId } = request.body;
            let _query;
            let query_ = {};
            let populate = 'bag pickerId deliveryId state service shopId';
            let queryState;
            queryState = { "key": { $in: [1, 2] } };
            findDocuments(State_1.default, queryState, "", {}, '', '', 0, null, null).then((stateResult) => {
                let arrayQuery = [];
                if (stateResult.length > 0) {
                    stateResult.map((stat) => {
                        let stateId = stat._id;
                        arrayQuery.push(mongoose_1.default.Types.ObjectId(stateId));
                    });
                    query_['state'] = { $in: [...arrayQuery] };
                    if (company)
                        query_['uid'] = mongoose_1.default.Types.ObjectId(company);
                    if (shopId)
                        query_['shopId'] = mongoose_1.default.Types.ObjectId(shopId);
                    findDocuments(Orders_1.default, query_, "", {}, populate, '', 0, null, null).then((result) => {
                        if (result.length) {
                            let newOrders = result.map((order, index) => {
                                let pickername = "";
                                let deliveryname = "";
                                let pickingDate = "";
                                let delilveryDateStart = "";
                                let delilveryDateEnd = "";
                                if (order.pickerId)
                                    pickername = order.pickerId.name;
                                if (order.deliveryId)
                                    deliveryname = order.deliveryId.name;
                                if (order.endPickingDate)
                                    pickingDate = order.endPickingDate;
                                if (order.starDeliveryDate)
                                    delilveryDateStart = order.starDeliveryDate;
                                if (order.endDeliveryDate)
                                    delilveryDateEnd = order.endDeliveryDate;
                                const rows = [
                                    this.createData('DateRange', order.date, pickingDate, delilveryDateStart, delilveryDateEnd, 0),
                                    this.createData('AccessTime', order.date, pickingDate, delilveryDateStart, delilveryDateEnd, 1),
                                    this.createData('Person', "", pickername, deliveryname, deliveryname, 2)
                                ];
                                if (!order.client.comment)
                                    order.set('client.comment', "Sin Comentarios", { strict: false });
                                order.set('timeLine', [...rows], { strict: false });
                                return order;
                            });
                            response.json({
                                message: 'Listado de ordenes para resetear',
                                data: newOrders,
                                success: true
                            });
                        }
                        else {
                            response.json({
                                message: 'Listado de ordenes para resetear error',
                                data: result,
                                success: false
                            });
                        }
                    }).catch((err) => {
                        response.json({
                            message: err.message,
                            success: false
                        });
                    });
                }
                else {
                    response.json({
                        message: 'Error al listar ordernes',
                        success: false
                    });
                }
            }).catch((err) => {
                response.json({
                    message: err.message,
                    success: false
                });
            });
        }
        catch (error) {
            response.json({
                message: error,
                success: false
            });
        }
    }
    async ordersForOmsFindReassing(request, response, next, app) {
        try {
            const { company, shopId, query } = request.body;
            let _query;
            let query_ = {};
            let pickerName;
            let populate = 'bag pickerId deliveryId state service shopId';
            let queryState;
            queryState = { $or: [{ "key": 1 }] };
            console.log(query);
            findDocuments(State_1.default, queryState, "", {}, '', '', 0, null, null).then((stateResult) => {
                let arrayQuery = [];
                if (stateResult.length > 0) {
                    stateResult.map((stat) => {
                        let stateId = stat._id;
                        query_['state'] = mongoose_1.default.Types.ObjectId(stateId);
                    });
                    if (Object.keys(query).length > 0) {
                        console.log(query);
                        if (query.buyFromDate && query.buyToDate) {
                            let from = new Date(query.buyFromDate);
                            let to = new Date(query.buyToDate);
                            from.setHours(0);
                            from.setMinutes(0);
                            from.setSeconds(0);
                            to.setHours(23);
                            to.setMinutes(59);
                            to.setSeconds(59);
                            query_['date'] = {
                                "$gte": from,
                                "$lt": to
                            };
                        }
                        if (query.buyFromDate && !query.buyToDate) {
                            let from = new Date(query.buyFromDate);
                            let to = new Date();
                            from.setHours(0);
                            from.setMinutes(0);
                            from.setSeconds(0);
                            query_['date'] = {
                                "$gte": from,
                                "$lt": to,
                            };
                        }
                        if (query.deliveryFromDate && query.deliveryToDate) {
                            let from = new Date(query.deliveryFromDate);
                            let to = new Date(query.deliveryToDate);
                            from.setHours(0);
                            from.setMinutes(0);
                            from.setSeconds(0);
                            to.setHours(23);
                            to.setMinutes(59);
                            to.setSeconds(59);
                            query_['realdatedelivery'] = {
                                "$gte": from,
                                "$lt": to
                            };
                        }
                        console.log("object");
                        if (query.deliveryFromDate && !query.deliveryToDate) {
                            let from = new Date(query.deliveryFromDate);
                            let to = new Date();
                            from.setHours(0);
                            from.setMinutes(0);
                            from.setSeconds(0);
                            to.setHours(23);
                            to.setMinutes(59);
                            to.setSeconds(59);
                            query_['realdatedelivery'] = {
                                "$gte": from,
                                "$lt": to
                            };
                        }
                        if (query.name) {
                            pickerName = query.name;
                            query_['pickerName'] = { $regex: new RegExp(pickerName, "i") };
                        }
                        if (query.number) {
                            query_['orderNumber'] = { $regex: query.number };
                        }
                        if (query.service) {
                            query_['service'] = mongoose_1.default.Types.ObjectId(query.service);
                        }
                        if (query.shop) {
                            query_['shopId'] = mongoose_1.default.Types.ObjectId(query.shop);
                        }
                    }
                    if (company)
                        query_['uid'] = mongoose_1.default.Types.ObjectId(company);
                    console.log("holdas");
                    findDocuments(Orders_1.default, query_, "", {}, populate, '', 0, null, null).then((result) => {
                        if (result.length) {
                            let newOrders = result.map((order, index) => {
                                let pickername = "";
                                let deliveryname = "";
                                let pickingDate = "";
                                let delilveryDateStart = "";
                                let delilveryDateEnd = "";
                                if (order.pickerId)
                                    pickername = order.pickerId.name;
                                if (order.deliveryId)
                                    deliveryname = order.deliveryId.name;
                                if (order.endPickingDate)
                                    pickingDate = order.endPickingDate;
                                if (order.starDeliveryDate)
                                    delilveryDateStart = order.starDeliveryDate;
                                if (order.endDeliveryDate)
                                    delilveryDateEnd = order.endDeliveryDate;
                                const rows = [
                                    this.createData('DateRange', order.date, pickingDate, delilveryDateStart, delilveryDateEnd, 0),
                                    this.createData('AccessTime', order.date, pickingDate, delilveryDateStart, delilveryDateEnd, 1),
                                    this.createData('Person', "", pickername, deliveryname, deliveryname, 2)
                                ];
                                if (!order.client.comment)
                                    order.set('client.comment', "Sin Comentarios", { strict: false });
                                order.set('timeLine', [...rows], { strict: false });
                                return order;
                            });
                            response.json({
                                message: 'Listado de ordenes para resetear',
                                data: newOrders,
                                success: true
                            });
                        }
                        else {
                            response.json({
                                message: 'Listado de ordenes para resetear',
                                data: result,
                                success: true
                            });
                        }
                    }).catch((err) => {
                        response.json({
                            message: err.message,
                            success: false
                        });
                    });
                }
                else {
                    response.json({
                        message: 'Error al listar ordernes',
                        success: false
                    });
                }
            }).catch((err) => {
                response.json({
                    message: err.message,
                    success: false
                });
            });
        }
        catch (error) {
            response.json({
                message: error,
                success: false
            });
        }
    }
    async ordersForOmsFindSearchReset(request, response, next, app) {
        try {
            const { company, shopId, query } = request.body;
            let _query;
            let query_ = {};
            let populate = 'bag pickerId deliveryId state service shopId';
            let queryState;
            let pickerName;
            queryState = { "key": { $in: [1, 2] } };
            console.log("update", query);
            findDocuments(State_1.default, queryState, "", {}, '', '', 0, null, null).then((stateResult) => {
                let arrayQuery = [];
                if (stateResult.length > 0) {
                    stateResult.map((stat) => {
                        let stateId = stat._id;
                        query_['state'] = mongoose_1.default.Types.ObjectId(stateId);
                    });
                    if (Object.keys(query).length > 0) {
                        if (query.buyFromDate && query.buyToDate) {
                            let from = new Date(query.buyFromDate);
                            let to = new Date(query.buyToDate);
                            from.setHours(0);
                            from.setMinutes(0);
                            from.setSeconds(0);
                            to.setHours(23);
                            to.setMinutes(59);
                            to.setSeconds(59);
                            query_['date'] = {
                                $gte: from,
                                $lt: to
                            };
                        }
                        if (query.buyFromDate && !query.buyToDate) {
                            let from = new Date(query.buyFromDate);
                            let to = new Date();
                            from.setHours(0);
                            from.setMinutes(0);
                            from.setSeconds(0);
                            query_['date'] = {
                                $gte: from,
                                $lt: to
                            };
                        }
                        if (query.deliveryFromDate && query.deliveryToDate) {
                            let from = new Date(query.deliveryFromDate);
                            let to = new Date(query.deliveryToDate);
                            from.setHours(0);
                            from.setMinutes(0);
                            from.setSeconds(0);
                            to.setHours(23);
                            to.setMinutes(59);
                            to.setSeconds(59);
                            query_['realdatedelivery'] = {
                                $gte: from,
                                $lt: to
                            };
                        }
                        if (query.deliveryFromDate && !query.deliveryToDate) {
                            let from = new Date(query.deliveryFromDate);
                            let to = new Date();
                            from.setHours(0);
                            from.setMinutes(0);
                            from.setSeconds(0);
                            to.setHours(23);
                            to.setMinutes(59);
                            to.setSeconds(59);
                            query_['realdatedelivery'] = {
                                $gte: from,
                                $lt: to
                            };
                        }
                        if (query.name) {
                            pickerName = query.name;
                            query_['pickerName'] = { $regex: new RegExp(pickerName, "i") };
                        }
                        if (query.number) {
                            query_['orderNumber'] = { $regex: new RegExp(query.number, "i") };
                        }
                        if (query.service) {
                            query_['service'] = mongoose_1.default.Types.ObjectId(query.service);
                        }
                        if (query.shop) {
                            query_['shopId'] = mongoose_1.default.Types.ObjectId(query.shop);
                        }
                    }
                    if (company)
                        query_['uid'] = mongoose_1.default.Types.ObjectId(company);
                    findDocuments(Orders_1.default, query_, "", {}, populate, '', 0, null, null).then((result) => {
                        if (result.length) {
                            let newOrders = result.map((order, index) => {
                                let pickername = "";
                                let deliveryname = "";
                                let pickingDate = "";
                                let delilveryDateStart = "";
                                let delilveryDateEnd = "";
                                if (order.pickerId)
                                    pickername = order.pickerId.name;
                                if (order.deliveryId)
                                    deliveryname = order.deliveryId.name;
                                if (order.endPickingDate)
                                    pickingDate = order.endPickingDate;
                                if (order.starDeliveryDate)
                                    delilveryDateStart = order.starDeliveryDate;
                                if (order.endDeliveryDate)
                                    delilveryDateEnd = order.endDeliveryDate;
                                const rows = [
                                    this.createData('DateRange', order.date, pickingDate, delilveryDateStart, delilveryDateEnd, 0),
                                    this.createData('AccessTime', order.date, pickingDate, delilveryDateStart, delilveryDateEnd, 1),
                                    this.createData('Person', "", pickername, deliveryname, deliveryname, 2)
                                ];
                                if (!order.client.comment)
                                    order.set('client.comment', "Sin Comentarios", { strict: false });
                                order.set('timeLine', [...rows], { strict: false });
                                return order;
                            });
                            response.json({
                                message: 'Listado de ordenes para resetear',
                                data: newOrders,
                                success: true
                            });
                        }
                        else {
                            response.json({
                                message: 'Listado de ordenes para resetear',
                                data: result,
                                success: true
                            });
                        }
                    }).catch((err) => {
                        response.json({
                            message: err.message,
                            success: false
                        });
                    });
                }
                else {
                    response.json({
                        message: 'Error al listar ordernes',
                        success: false
                    });
                }
            }).catch((err) => {
                response.json({
                    message: err.message,
                    success: false
                });
            });
        }
        catch (error) {
            response.json({
                message: error,
                success: false
            });
        }
    }
    async ordersStorePickUp(request, response, next, app) {
        try {
            const { company, profile, query } = request.body;
            let _query;
            let query_ = {};
            let _populate1 = {};
            let _populate2 = {};
            let namePicker = "";
            let nameDelivery = "";
            let populate = '';
            let queryState;
            queryState = { "key": 3 };
            let arrayQuery = [];
            if (Object.keys(query).length > 0) {
                if (query.buyFromDate && query.buyToDate) {
                    let from = new Date(query.buyFromDate);
                    let to = new Date(query.buyToDate);
                    from.setHours(0);
                    from.setMinutes(0);
                    from.setSeconds(0);
                    to.setHours(23);
                    to.setMinutes(59);
                    to.setSeconds(59);
                    query_['date'] = {
                        $gte: from,
                        $lt: to
                    };
                }
                if (query.buyFromDate && !query.buyToDate) {
                    let from = new Date(query.buyFromDate);
                    let to = new Date();
                    from.setHours(0);
                    from.setMinutes(0);
                    from.setSeconds(0);
                    query_['date'] = {
                        $gte: from,
                        $lt: to
                    };
                }
                if (query.rutCliente) {
                    query_['client.rut'] = { $regex: new RegExp(query.rutCliente, "i") };
                }
                if (query.rutTercero) {
                    query_['client.rutTercero'] = { $regex: new RegExp(query.rutTercero, "i") };
                }
                if (query.orderNumber)
                    query_['orderNumber'] = query.orderNumber;
                if (query.email) {
                    query_['client.email'] = { $regex: new RegExp(query.email, "i") };
                }
            }
            if (company)
                query_['uid'] = mongoose_1.default.Types.ObjectId(company);
            findDocuments(State_1.default, queryState, "", {}, '', '', 0, null, null).then((stateResult) => {
                if (stateResult.length > 0) {
                    let stateId = stateResult[0]._id;
                    query_['state'] = mongoose_1.default.Types.ObjectId(stateId);
                    findDocuments(Services_1.default, { key: "2" }, "", {}, '', '', 0, null, null).then((findResultSerives) => {
                        if (findResultSerives.length > 0) {
                            let serviceId = findResultSerives[0]._id;
                            query_['service'] = mongoose_1.default.Types.ObjectId(serviceId);
                            findDocuments(Orders_1.default, query_, "", {}, '', 0, null, null).then((result) => {
                                if (result.length) {
                                    let newOrders = result.map((order, index) => {
                                        let pickername = "";
                                        let deliveryname = "";
                                        let pickingDate = "";
                                        let delilveryDateStart = "";
                                        let delilveryDateEnd = "";
                                        if (order.pickerId)
                                            pickername = order.pickerId.name;
                                        if (order.deliveryId)
                                            deliveryname = order.deliveryId.name;
                                        if (order.endPickingDate)
                                            pickingDate = order.endPickingDate;
                                        if (order.starDeliveryDate)
                                            delilveryDateStart = order.starDeliveryDate;
                                        if (order.endDeliveryDate)
                                            delilveryDateEnd = order.endDeliveryDate;
                                        const rows = [
                                            this.createData('DateRange', order.date, pickingDate, delilveryDateStart, delilveryDateEnd, 0),
                                            this.createData('AccessTime', order.date, pickingDate, delilveryDateStart, delilveryDateEnd, 1),
                                            this.createData('Person', "", pickername, deliveryname, deliveryname, 2)
                                        ];
                                        if (!order.client.comment)
                                            order.set('client.comment', "Sin Comentarios", { strict: false });
                                        order.set('timeLine', [...rows], { strict: false });
                                        return order;
                                    });
                                    response.json({
                                        message: 'Listado de ordenes store pickup',
                                        data: newOrders,
                                        success: true,
                                        orders: result.length
                                    });
                                }
                                else {
                                    response.json({
                                        message: 'Listado de ordenes store pickup',
                                        data: result,
                                        success: true,
                                        orders: result.length
                                    });
                                }
                            }).catch((err) => {
                                response.json({
                                    message: err,
                                    success: false,
                                    data: []
                                });
                            });
                        }
                        else {
                            response.json({
                                message: 'Error al listar los servicios',
                                data: [],
                                success: true,
                            });
                        }
                    }).catch((err) => {
                        response.json({
                            message: err,
                            success: false,
                            data: []
                        });
                    });
                }
                else {
                    response.json({
                        message: 'Error al listar los estados',
                        data: [],
                        success: true,
                    });
                }
            }).catch((err) => {
                response.json({
                    message: err,
                    success: false,
                    data: []
                });
            });
        }
        catch (error) {
            response.json({
                message: error,
                success: false,
                data: []
            });
        }
    }
    async leave(request, response, next, app) {
        try {
            let query = { "key": 1 };
            findDocuments(State_1.default, query, "", {}, '', '', 0, null, null).then((findResultState) => {
                if (findResultState.length > 0) {
                    let stateId = findResultState[0]._id;
                    const { id } = request.body;
                    if (id) {
                        let query = { "_id": mongoose_1.default.Types.ObjectId(id) };
                        let update = { "pickerId": null, startPickingDate: null, state: mongoose_1.default.Types.ObjectId(stateId), shopId: null, pickerName: "" };
                        findOneAndUpdateDB(Orders_1.default, query, update, null, null).then((update) => {
                            if (update) {
                                let historyObj = {
                                    state: mongoose_1.default.Types.ObjectId(stateId),
                                    orderNumber: update.orderNumber,
                                    order: mongoose_1.default.Types.ObjectId(update._id),
                                    bag: null,
                                    shop: null,
                                    picker: null,
                                    delivery: null,
                                    orderSnapShot: update,
                                    dateHistory: new Date()
                                };
                                insertDB(History_1.default, historyObj).then((result) => {
                                    if (result) {
                                        response.json({
                                            message: 'Orden dejada',
                                            data: update,
                                            success: true
                                        });
                                    }
                                    else {
                                        response.json({
                                            message: 'Error al Tomar la orden',
                                            data: result,
                                            success: true
                                        });
                                    }
                                }).catch((err) => {
                                    response.json({
                                        message: err.message,
                                        success: false
                                    });
                                });
                            }
                            else {
                                response.json({
                                    message: "Error al actualizar orden",
                                    success: false
                                });
                            }
                        }).catch((err) => {
                            response.json({
                                message: err,
                                success: false
                            });
                        });
                    }
                    else {
                        response.json({
                            message: "Debe proporcionar el id de la orden",
                            success: false
                        });
                    }
                }
                else {
                    response.json({
                        message: "Error al tomar la orden, no se ha encontrado un estado valido",
                        success: false
                    });
                }
            }).catch((err) => {
                response.json({
                    message: "Error al dejar la ordern: " + err.message,
                    success: false
                });
            });
        }
        catch (error) {
            response.json({
                message: error.message,
                success: false
            });
        }
    }
    async picked(request, response, next, app) {
        try {
            let query = { "key": 2 };
            findDocuments(State_1.default, query, "", {}, '', '', 0, null, null).then((findResultState) => {
                if (findResultState.length > 0) {
                    let stateId = findResultState[0]._id;
                    const stateName = findResultState[0].desc;
                    const { id, pickerId, shopId } = request.body;
                    if (id) {
                        let query = { "_id": mongoose_1.default.Types.ObjectId(id) };
                        let update = { "pickerId": mongoose_1.default.Types.ObjectId(pickerId), "pickerName": "", "startPickingDate": new Date(), "state": mongoose_1.default.Types.ObjectId(stateId), "shopId": mongoose_1.default.Types.ObjectId(shopId) };
                        let queryFind = { "_id": mongoose_1.default.Types.ObjectId(id) };
                        findDocuments(User_1.default, { "_id": mongoose_1.default.Types.ObjectId(pickerId) }, "", {}, '', '', 0, null, null).then((userResult) => {
                            if (userResult.length) {
                                findDocuments(Orders_1.default, queryFind, "", {}, '', '', 0, null, null).then((findResult) => {
                                    if (findResult.length > 0) {
                                        if (findResult[0].pickerId) {
                                            response.json({
                                                message: 'Orden Tomada',
                                                data: findResult[0],
                                                success: true
                                            });
                                        }
                                        else {
                                            update.pickerName = userResult[0].name;
                                            findOneAndUpdateDB(Orders_1.default, query, update, null, null).then((update) => {
                                                if (update) {
                                                    let historyObj = {
                                                        state: mongoose_1.default.Types.ObjectId(stateId),
                                                        orderNumber: update.orderNumber,
                                                        order: mongoose_1.default.Types.ObjectId(update._id),
                                                        bag: null,
                                                        shop: null,
                                                        picker: mongoose_1.default.Types.ObjectId(pickerId),
                                                        delivery: null,
                                                        orderSnapShot: update,
                                                        dateHistory: new Date()
                                                    };
                                                    insertDB(History_1.default, historyObj).then((result) => {
                                                        if (result) {
                                                            let event = Object.assign({}, config_1.config.paramEvent);
                                                            event.CuentaCliente = findResult[0].uid.name;
                                                            event.OrderTrabajo = findResult[0].orderNumber.toString();
                                                            event.Estado = stateName;
                                                            event.FechaEventoOMS = new Date();
                                                            let orderEvent = [];
                                                            orderEvent.push(event);
                                                            executeProcedure("[OMS].[InsertEvento]", orderEvent);
                                                            // let promiseEvent = orderEvent.map((event) => { return executeProcedure("[OMS].[InsertEvento]", event) })
                                                            response.json({
                                                                message: 'Orden Tomada',
                                                                data: update,
                                                                success: true
                                                            });
                                                            // Promise.all(promiseEvent).then((resultEvent) => {
                                                            //   if (resultEvent) {
                                                            //   } else {
                                                            //     response.json({ message: "Error al ingresar el evento, Ha ocurrido un error al ejecutar el procedimiento [OMS].[InsertEvento]", success: false });
                                                            //   }
                                                            // }).catch((err: Error) => { response.json({ message: err.message, success: false }); });
                                                        }
                                                        else {
                                                            response.json({
                                                                message: 'Error al Tomar la orden',
                                                                data: result,
                                                                success: true
                                                            });
                                                        }
                                                    }).catch((err) => {
                                                        response.json({
                                                            message: err.message,
                                                            success: false
                                                        });
                                                    });
                                                }
                                                else {
                                                    response.json({
                                                        message: "Error al tomar la orden",
                                                        success: false
                                                    });
                                                }
                                            }).catch((err) => {
                                                response.json({
                                                    message: err.message,
                                                    success: false
                                                });
                                            });
                                        }
                                    }
                                    else {
                                        response.json({
                                            message: "Error al tomar laa orden",
                                            success: false
                                        });
                                    }
                                }).catch((err) => {
                                    response.json({
                                        message: err.message,
                                        success: false
                                    });
                                });
                            }
                            else {
                                response.json({
                                    message: 'Error al econtrar usuario',
                                    data: update,
                                    success: true
                                });
                            }
                        }).catch((err) => {
                            response.json({
                                message: err.message,
                                success: false
                            });
                        });
                    }
                    else {
                        response.json({
                            message: "Debe proporcionar el id de la orden",
                            success: false
                        });
                    }
                }
                else {
                    response.json({
                        message: "Error al tomar la orden, no se ha encontrado un estado valido",
                        success: false
                    });
                }
            }).catch((err) => {
                response.json({
                    message: "Error al tomar la ordern: " + err.message,
                    success: false
                });
            });
        }
        catch (error) {
            response.json({
                message: error.message,
                success: false
            });
        }
    }
    async getOrdersForVtex(request, response, next, app) {
        try {
            const { OrderId } = request.body;
            if (OrderId) {
                console.log(request.body);
                const queryCompany = { name: "Pillin Test" };
                findDocuments(Company_1.default, queryCompany, "", {}, '', '', 0, null, null).then((CompanyResult) => {
                    if (CompanyResult.length > 0) {
                        const companyUID = CompanyResult[0]._id;
                        requestify.request(`https://srconsultores.vtexcommercestable.com.br/api/oms/pvt/orders/${OrderId}`, {
                            method: 'GET',
                            headers: {
                                'X-VTEX-API-AppToken': 'MRNIYXTVLTCWCVYWATKOOKYHHDEOXRGHYXHXLXALMKMPPMFVAJPJGRMBSGAUSEXTNVXFOALCTYCEYJSUYJNOBXBGLGEFWGTHMSBUPZHAYMQHPICJNGVJRJSQTRTHVFFM',
                                'X-VTEX-API-AppKey': 'vtexappkey-srconsultores-PPJDKQ',
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        }).then((respApiCall) => {
                            const { orderId, creationDate, items, origin, clientProfileData, shippingData } = respApiCall.getBody();
                            let ordersTemplate = Object.assign({}, config_1.config.ordersTemplate);
                            let orderTemplate = Object.assign({}, config_1.config.orderTemplate);
                            let productTemplate = Object.assign({}, config_1.config.productTemplate);
                            let products = [];
                            let orders = [];
                            orderTemplate.orderNumber = orderId;
                            orderTemplate.date = moment_1.default(creationDate).format("YYYY-MM-DDTHH:mm:ss");
                            orderTemplate.channel = origin;
                            orderTemplate.service = 0;
                            if (shippingData.selectedAddresses.addressType == "residential")
                                orderTemplate.service = 0;
                            if (shippingData.selectedAddresses.addressType == "pickup")
                                orderTemplate.service = 2;
                            items.map((product) => {
                                productTemplate.id = product.id;
                                productTemplate.units = product.quantity;
                                productTemplate.name = product.name;
                                productTemplate.location = 1;
                                productTemplate.barcode = product.refId;
                                productTemplate.product = product.name;
                                productTemplate.image = product.imageUrl;
                                productTemplate.description = product.name + " " + product.additionalInfo.brandName;
                                products.push(productTemplate);
                            });
                            orderTemplate.products = [...products];
                            orderTemplate.client.address = shippingData.address.street + " " + shippingData.address.number;
                            orderTemplate.client.comuna = shippingData.address.neighborhood;
                            orderTemplate.client.ciudad = shippingData.address.state;
                            orderTemplate.client.lat = "000";
                            orderTemplate.client.long = "000";
                            if (shippingData.address.geoCoordinates.length) {
                                orderTemplate.client.lat = shippingData.address.geoCoordinates[0];
                                orderTemplate.client.long = shippingData.address.geoCoordinates[1];
                            }
                            orderTemplate.client.rut = clientProfileData.document;
                            orderTemplate.client.cellphone = clientProfileData.phone;
                            orderTemplate.client.email = clientProfileData.email;
                            orderTemplate.client.name = clientProfileData.firstName + " " + clientProfileData.lastName;
                            orders.push(orderTemplate);
                            ordersTemplate.orders = [...orders];
                            ordersTemplate.uid = companyUID;
                            this.save(null, response, null, null, 1, ordersTemplate);
                        }).fail((response) => {
                            console.log(response.getCode());
                            response.getCode(); // Some error code such as, for example, 404
                            response.json({
                                code: response.getCode(),
                                message: response,
                                error: response,
                                success: false
                            });
                        });
                    }
                    else {
                        response.json({ message: "Error al ingresar las ordenes, no se han encontrado cuentas validas", success: false });
                    }
                }).catch((err) => { response.json({ message: err, success: false }); });
            }
        }
        catch (error) {
            console.log("TyC error:", error);
            response.json({
                error: error,
                code: error.code,
                message: error.message,
                success: false
            });
        }
    }
    async saveOrder(body, response) {
        try {
            let orders;
            orders = body.orders;
            findDocuments(Services_1.default, {}, "", {}, '', '', 0, null, null).then((ServicesResult) => {
                if (ServicesResult.length > 0) {
                    let query = { "key": 0 };
                    findDocuments(State_1.default, query, "", {}, '', '', 0, null, null).then((stateResult) => {
                        if (stateResult.length > 0) {
                            let stateId = stateResult[0]._id;
                            let stateDesc = stateResult[0].desc;
                            let _orders = [];
                            let history = [];
                            let orderNumbers = [];
                            let companyUID;
                            let ordersProcedure = [];
                            let ordersShop = [];
                            let findService;
                            orders.map((order, index) => {
                                // Aqui la logica para determinar la mejor hora de despacho
                                let deliveryDate = new Date();
                                deliveryDate.setHours(new Date(order.date).getHours() + Math.floor(Math.random() * 6) + 1);
                                // Fin logica para generar hora 
                                ServicesResult.map((service) => {
                                    if (service.key == order.service)
                                        findService = Object.assign(service);
                                });
                                let _order = {
                                    uid: mongoose_1.default.Types.ObjectId(body.uid),
                                    state: mongoose_1.default.Types.ObjectId(stateId),
                                    orderNumber: order.orderNumber + "",
                                    products: order.products,
                                    service: mongoose_1.default.Types.ObjectId(findService._id),
                                    channel: order.channel,
                                    client: order.client,
                                    date: new Date(order.date),
                                    realdatedelivery: deliveryDate,
                                    pickerWorkShift: "Mañana"
                                };
                                let historyObj = {
                                    state: mongoose_1.default.Types.ObjectId(stateId),
                                    orderNumber: order.orderNumber,
                                    order: null,
                                    bag: null,
                                    shop: null,
                                    picker: null,
                                    delivery: null,
                                    orderSnapShot: null,
                                    dateHistory: new Date()
                                };
                                orderNumbers.push(order.orderNumber);
                                companyUID = mongoose_1.default.Types.ObjectId(body.uid);
                                history.push(historyObj);
                                _orders.push(_order);
                            });
                            let orderfinalToInsert;
                            let orderfinalNotInsert;
                            let historyToInsert;
                            findDocuments(Company_1.default, { _id: companyUID }, "", {}, '', '', 0, null, null).then((CompanyResult) => {
                                if (CompanyResult.length > 0) {
                                    findDocuments(Orders_1.default, { 'uid': companyUID, orderNumber: { '$in': orderNumbers } }, "", {}, '', '', 0, null, null).then((OrdersFind) => {
                                        orderfinalToInsert = _orders.filter((order) => !OrdersFind.some((fillOrder) => order.orderNumber == fillOrder.orderNumber)); //filtramos ordenes para agregar, aqui obtenemos las ordenes a insertar
                                        orderfinalNotInsert = _orders.filter((order) => OrdersFind.some((fillOrder) => order.orderNumber == fillOrder.orderNumber)); //filtramos ordenes para agregar, aqui obtenemos las ordenes que no vamos a insertar
                                        historyToInsert = history.filter((history) => !OrdersFind.some((orders) => history.orderNumber == orders.orderNumber));
                                        if (orderfinalToInsert.length) {
                                            insertManyDB(Orders_1.default, orderfinalToInsert).then((result) => {
                                                if (result.length) {
                                                    result.map((order) => {
                                                        history.map((history) => {
                                                            if (order.orderNumber == history.orderNumber) {
                                                                history.order = mongoose_1.default.Types.ObjectId(order._id);
                                                                history.orderSnapShot = Object.assign({}, order.toJSON());
                                                            }
                                                        });
                                                        let serviceDesc = "";
                                                        let companyName = CompanyResult[0].name;
                                                        ServicesResult.map((service) => { if (service._id == order.service)
                                                            serviceDesc = service.desc; });
                                                        //Aqui empieza creacion de data para el BI
                                                        let param = {
                                                            "CuentaCliente": companyName,
                                                            "OrderTrabajo": order.orderNumber + "",
                                                            "NLocal": "",
                                                            "Local_Longitud": "-77.00000",
                                                            "Local_Latitud": "-33.77777",
                                                            "FecAgendada": order.realdatedelivery,
                                                            "FechaCompraCliente": order.date,
                                                            "UnSolicitadas": 5,
                                                            "Supervisor": "",
                                                            "RUT_Cliente": order.client.rut,
                                                            "Comuna_Cliente": order.client.comuna,
                                                            "Region_Cliente": order.client.ciudad,
                                                            "Longitud": "-77.00000",
                                                            "Latitud": "-77.00000",
                                                            "Estado": stateDesc,
                                                            "EsReagendamiento": 0,
                                                            "CanalVenta": order.channel,
                                                            "TipoDespacho": serviceDesc,
                                                        };
                                                        let paramShop = {
                                                            "CuentaCliente": companyName,
                                                            "OrderTrabajo": order.orderNumber + "",
                                                            "NLocal": "",
                                                            "Local_Longitud": "-77.00000",
                                                            "Local_Latitud": "-33.77777"
                                                        };
                                                        ordersShop.push(paramShop);
                                                        ordersProcedure.push(param);
                                                    });
                                                    insertManyDB(History_1.default, historyToInsert).then((resultHistory) => {
                                                        if (resultHistory) {
                                                            // let promisesOrders = ordersProcedure.map((order) => { return executeProcedure("[OMS].[IngresoOrder]", order) })
                                                            let promisesOrders = executeProcedure("[OMS].[IngresoOrder]", ordersProcedure);
                                                            let promisesOrdersShop = executeProcedure("[OMS].[InfoLocal]", ordersShop);
                                                            let jsonResponse = {
                                                                message: 'orden(es) creada(s) exitosamente',
                                                                ordersNotInsert: orderfinalToInsert,
                                                                data: resultHistory,
                                                                success: true
                                                            };
                                                            if (response)
                                                                response.json(jsonResponse);
                                                            else {
                                                                return jsonResponse;
                                                            }
                                                        }
                                                        else {
                                                            let jsonResponse = { message: "Error al ingresar las ordenes, Ha ocurrido algun error", success: false, resultHistory: resultHistory };
                                                            if (response)
                                                                response.json(jsonResponse);
                                                            else {
                                                                return jsonResponse;
                                                            }
                                                            // response.json({ message: "Error al ingresar las ordenes, Ha ocurrido algun error", success: false, resultHistory: resultHistory });
                                                        }
                                                    }).catch((err) => {
                                                        let jsonResponse = { message: err, success: false };
                                                        if (response)
                                                            response.json(jsonResponse);
                                                        else {
                                                            return jsonResponse;
                                                        }
                                                    });
                                                }
                                                else {
                                                    let jsonResponse = { message: "Error al ingresar las ordenes", success: false };
                                                    if (response)
                                                        response.json(jsonResponse);
                                                    else {
                                                        return jsonResponse;
                                                    }
                                                }
                                            }).catch((err) => {
                                                console.log(err);
                                                let jsonResponse = { message: err, success: false };
                                                if (response)
                                                    response.json(jsonResponse);
                                                else {
                                                    return jsonResponse;
                                                }
                                            });
                                        }
                                        else {
                                            let jsonResponse = {
                                                message: "Las ordenes que intentas agregar ya existen en el sistema",
                                                ordersInsert: orderfinalToInsert,
                                                ordersInsertCount: orderfinalToInsert.length,
                                                ordersRepeat: orderfinalNotInsert,
                                                ordersRepeatCount: orderfinalNotInsert.length,
                                                success: false
                                            };
                                            if (response)
                                                response.json(jsonResponse);
                                            else {
                                                return jsonResponse;
                                            }
                                        }
                                    }).catch((err) => {
                                        let jsonResponse = { message: err, success: false };
                                        if (response)
                                            response.json(jsonResponse);
                                        else {
                                            return jsonResponse;
                                        }
                                    });
                                }
                                else {
                                    let jsonResponse = { message: "Error al ingresar las ordenes, no se han encontrado cuentas validas", success: false };
                                    if (response)
                                        response.json(jsonResponse);
                                    else {
                                        return jsonResponse;
                                    }
                                }
                            }).catch((err) => {
                                let jsonResponse = { message: err.message, success: false };
                                if (response)
                                    response.json(jsonResponse);
                                else {
                                    return jsonResponse;
                                }
                            });
                        }
                        else {
                            let jsonResponse = { message: "Error al ingresar las ordenes, no se ha encontrado un estado valido", success: false };
                            if (response)
                                response.json(jsonResponse);
                            else {
                                return jsonResponse;
                            }
                        }
                    }).catch((err) => {
                        let jsonResponse = { message: err.message, success: false };
                        if (response)
                            response.json(jsonResponse);
                        else {
                            return jsonResponse;
                        }
                    });
                }
                else {
                    let jsonResponse = { message: "Error al ingresar las ordenes, no se ha encontrado un servicio valido", success: false };
                    if (response)
                        response.json(jsonResponse);
                    else {
                        return jsonResponse;
                    }
                }
            }).catch((err) => {
                let jsonResponse = { message: err.message, success: false };
                if (response)
                    response.json(jsonResponse);
                else {
                    return jsonResponse;
                }
            });
        }
        catch (error) {
            let jsonResponse = { message: error.message, success: false };
            if (response)
                response.json(jsonResponse);
            else {
                return jsonResponse;
            }
        }
    }
    /*
      Metodo que recibe un array de ordenes para guardarlas en la base de datos
    */
    async save(request, response, next, app, type = 0, body) {
        try {
            if (type == 1)
                return await this.saveOrder(body, response);
            if (type == 0)
                return await this.saveOrder(request.body, response);
        }
        catch (error) {
            if (response)
                response.json({ message: error.message, success: false });
            else {
                return { message: error.message, success: false };
            }
        }
    }
    async ordersToDelivery(request, response, next, app) {
        response.json({
            message: 'Listado de ordenes',
            data: [],
            success: true
        });
    }
    async updateNamesInOrdes(request, response, next, app) {
        findDocuments(Orders_1.default, {}, "", {}, '', '', 0, null, null).then((result) => {
            if (result) {
                result.map(async (order) => {
                    console.log("Consultando orden: ", order.orderNumber);
                    if (order.pickerId || order.deliveryId) {
                        if (order.pickerId) {
                            console.log("pickerId", order.pickerId);
                            findDocuments(User_1.default, { "_id": mongoose_1.default.Types.ObjectId(order.pickerId._id) }, "", {}, '', '', 0, null, null).then((userResult) => {
                                if (userResult.length) {
                                    let updateOrder = { pickerName: userResult[0].name };
                                    let queryOrder = { "_id": mongoose_1.default.Types.ObjectId(order._id) };
                                    findOneAndUpdateDB(Orders_1.default, queryOrder, updateOrder, null, null).then((updateOrder) => {
                                        console.log(updateOrder.pickerName);
                                    }).catch((err) => {
                                        response.json({
                                            message: err.message,
                                        });
                                    });
                                }
                            });
                        }
                        if (order.deliveryId) {
                            console.log("deliveryId", order.deliveryId);
                            findDocuments(User_1.default, { "_id": mongoose_1.default.Types.ObjectId(order.deliveryId._id) }, "", {}, '', '', 0, null, null).then((userResult) => {
                                if (userResult.length) {
                                    let updateOrder = { deliveryName: userResult[0].name };
                                    console.log(order._id);
                                    let queryOrder = { "_id": mongoose_1.default.Types.ObjectId(order._id) };
                                    findOneAndUpdateDB(Orders_1.default, queryOrder, updateOrder, null, null).then((updateOrder) => {
                                        console.log(updateOrder.deliveryName);
                                    }).catch((err) => {
                                        response.json({
                                            message: err.message,
                                        });
                                    });
                                }
                            });
                        }
                    }
                });
            }
            response.json({
                message: "Finalizo el proceso, algunas ordenes aun se estan ejecutando",
            });
        }).catch((err) => {
        });
    }
    removeDuplicates(arrayIn) {
        var arrayOut = [];
        arrayIn.forEach((item) => {
            try {
                if (JSON.stringify(arrayOut[arrayOut.length - 1].zone) !== JSON.stringify(item.zone)) {
                    arrayOut.push(item);
                }
            }
            catch (err) {
                arrayOut.push(item);
            }
        });
        return arrayOut;
    }
    async getOrdersClients() {
        let ordersToSave; //array de ordenes devueltas por prestashop
        setInterval(() => {
            const start = moment_1.default().hour(0).minute(0).second(0);
            const end = moment_1.default().hour(23).minute(59).second(59);
            let ordersresponse = [];
            const queryCompany = { name: "The Copper Company" };
            findDocuments(Company_1.default, queryCompany, "", {}, '', '', 0, null, null).then((CompanyResult) => {
                if (CompanyResult.length > 0) {
                    const companyUID = CompanyResult[0]._id;
                    console.log(companyUID);
                    let url = `https://4HK4ZVL5WLZ724FZ6S1IWZ7I42KZKKBA@sr1.ipxdigital.cl/api/orders?display=full&date=1&filter[date_add]=[${start.format("YYYY-MM-DD")}%20${start.format("HH:mm:ss")},${end.format("YYYY-MM-DD")}%20${end.format("HH:mm:ss")}]&output_format=JSON`;
                    requestify.request(url, { method: 'GET', headers: { Host: 'sr1.ipxdigital.cl', Authorization: 'Basic NEhLNFpWTDVXTFo3MjRGWjZTMUlXWjdJNDJLWktLQkE6' } }).then((response) => {
                        try {
                            const body = response.getBody();
                            if (!Array.isArray(body)) {
                                ordersToSave = response.getBody().orders;
                                const promises = ordersToSave.map((order, index) => {
                                    let ordersTemplate = Object.assign({}, config_1.config.ordersTemplate);
                                    let orderTemplate = Object.assign({}, config_1.config.orderTemplate);
                                    let productTemplate = Object.assign({}, config_1.config.productTemplate);
                                    let products = [];
                                    let orders = [];
                                    return new Promise((resolve, reject) => {
                                        let addressapi = `https://TXQQ1LZU2RJ9ZMDME9X9L4LC7JT1FXTA@sr1.ipxdigital.cl/api/addresses?display=full&filter[id]=[${order.id_address_delivery}]&output_format=JSON`;
                                        const config = {
                                            method: 'GET',
                                            headers: {
                                                Host: 'sr1.ipxdigital.cl',
                                                Authorization: 'Basic NEhLNFpWTDVXTFo3MjRGWjZTMUlXWjdJNDJLWktLQkE6'
                                            }
                                        };
                                        requestify.request(addressapi, config).then((response) => {
                                            const directions = response.getBody().addresses;
                                            orderTemplate.client.address = directions[0].address1;
                                            orderTemplate.client.ciudad = directions[0].city;
                                            orderTemplate.client.comuna = directions[0].city;
                                            orderTemplate.client.cellphone = directions[0].phone_mobile;
                                            let customerapi = `https://TXQQ1LZU2RJ9ZMDME9X9L4LC7JT1FXTA@sr1.ipxdigital.cl/api/customers?display=full&filter[id]=[${order.id_customer}]&output_format=JSON`;
                                            const configSReques = {
                                                method: 'GET',
                                                headers: { Host: 'sr1.ipxdigital.cl', Authorization: 'Basic NEhLNFpWTDVXTFo3MjRGWjZTMUlXWjdJNDJLWktLQkE6' }
                                            };
                                            requestify.request(customerapi, configSReques).then((response) => {
                                                orderTemplate.client.name = `${response.getBody().customers[0].firstname} ${response.getBody().customers[0].lastname}`;
                                                // Datos temporales que deben ser migrados a data obtenida desde prestashop
                                                orderTemplate.client.lat = "-33.4552837";
                                                orderTemplate.client.long = "-70.6586257";
                                                orderTemplate.client.email = "temporal@temporal.com";
                                                orderTemplate.client.rut = "000000000-0";
                                                if (response.getBody().customers.email)
                                                    orderTemplate.client.email = response.getBody().customers.email;
                                                // --------------------
                                                if (Array.isArray(order.associations.order_rows)) {
                                                    order.associations.order_rows.map((product) => {
                                                        let pdTemplate = Object.assign({}, productTemplate);
                                                        pdTemplate.barcode = '0';
                                                        pdTemplate.product = product.product_name;
                                                        pdTemplate.id = product.id;
                                                        pdTemplate.image = `https://sr1.ipxdigital.cl/img/p/${product.product_attribute_id}/${product.product_attribute_id}-cart_default.jpg`;
                                                        pdTemplate.location = 0;
                                                        pdTemplate.description = product.product_reference;
                                                        pdTemplate.name = product.product_name;
                                                        pdTemplate.units = product.product_quantity;
                                                        products.push(pdTemplate);
                                                    });
                                                }
                                                console.log(order.id);
                                                orderTemplate.products = [...products];
                                                orderTemplate.date = moment_1.default(order.date_add, "YYYY-MM-DD HH:mm:ss").format('YYYY-MM-DDTHH:mm:ss');
                                                orderTemplate.service = 1;
                                                orderTemplate.channel = 'Marketplace';
                                                orderTemplate.orderNumber = order.id;
                                                orders.push(orderTemplate);
                                                ordersTemplate.uid = companyUID;
                                                ordersTemplate.orders = [...this.removeDuplicates(orders)];
                                                resolve(ordersTemplate);
                                            }).catch((error) => {
                                                console.log(error);
                                                reject(error);
                                            });
                                        });
                                    }).catch((error) => { console.log("err:", error); });
                                });
                                Promise.all(promises).then((response) => {
                                    if (response.length) {
                                        let ordersArray = [];
                                        response.map((orders) => {
                                            orders.orders.map((unit) => {
                                                ordersArray.push(unit);
                                            });
                                        });
                                        const ordersToSave = { uid: response[0].uid, orders: ordersArray };
                                        this.save(null, null, null, null, 1, ordersToSave).then((result) => {
                                            console.log("Result", result);
                                        }).catch((err) => {
                                            console.log("Err", err);
                                        });
                                    }
                                });
                            }
                            else {
                                console.log("No hay ordenes para descargar! ");
                            }
                        }
                        catch (error) {
                            console.log(error);
                        }
                    });
                }
                else {
                    return { message: "Error al ingresar las ordenes, no se han encontrado cuentas validas", success: false };
                }
            }).catch((error) => { console.log("err:", error); });
            // }, 1 * 60 * 1000);
        }, 1 * 60 * 1000);
    }
}
exports.OrdersController = OrdersController;
