"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderBagsController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const jwt = require('jsonwebtoken');
const OrderBags_1 = __importDefault(require("../entity/OrderBags"));
const Orders_1 = __importDefault(require("../entity/Orders"));
const State_1 = __importDefault(require("../entity/State"));
const OrderBags_2 = require("../entity/OrderBags");
const { initDB, insertDB, insertManyDB, findDocuments, findOneAndUpdateDB, executeProcedure, findOneDB } = require("../config/db");
const ajv_1 = __importDefault(require("ajv"));
const History_1 = __importDefault(require("../entity/History"));
const User_1 = __importDefault(require("../entity/User"));
const config_1 = require("../config/config");
const Services_1 = __importDefault(require("../entity/Services"));
const Bag_1 = __importDefault(require("../entity/Bag"));
const moment_1 = __importDefault(require("moment"));
var ajv = new ajv_1.default({ allErrors: true });
var validate = ajv.compile(OrderBags_2.schemaBags);
class OrderBagsController {
    async index(request, response, next, app) {
    }
    async listAllBags(request, response, next, app) {
        try {
            const { number, account } = request.body;
            let query;
            query = {
                "bags.bagNumber": number,
                "orderNumber": { $ne: null }
            };
            findDocuments(OrderBags_1.default, query, "", {}, 'orderNumber pickerId deliveryId', '', 0, null, null).then((result) => {
                let filterBag = result.filter((orderBag) => {
                    if (orderBag.orderNumber)
                        return orderBag.orderNumber.uid._id == account;
                });
                let orderres = {};
                if (filterBag.length)
                    orderres = Object.assign({}, filterBag[0]);
                if (filterBag.length > 0) {
                    response.json({
                        message: 'Detalle de consulta',
                        data: filterBag[0],
                        success: true
                    });
                }
                else {
                    response.json({
                        message: 'Detalle de consulta: No se encontraron ordenes asociadas',
                        data: {},
                        success: true
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
    async getNumber(request, response, next, app) {
        try {
            const { cantidad, ordersToPrint } = request.body;
            console.log(ordersToPrint);
            let bagsNumbers = [];
            ordersToPrint.map((row) => {
                for (let index = 0; index < cantidad; index++) {
                    let numbebag = parseInt(moment_1.default().format("YYYYMMDDHHmmss")) + Math.floor(Math.random() * 1000);
                    bagsNumbers.push({ bag: null, numberBag: numbebag });
                }
            });
            if (cantidad) {
                insertManyDB(Bag_1.default, bagsNumbers).then((result) => {
                    if (result) {
                        response.json({
                            message: 'Bultos generados de forma exitosa',
                            data: result.map((bagnumber) => { return bagnumber.numberBag; }),
                            success: true
                        });
                    }
                    else {
                        response.json({
                            message: 'Error al generar los numeros de bultos',
                            profileNotSave: [],
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
                    message: `No se puede generar bultos para ${cantidad} ordenes`,
                    data: [],
                    success: true
                });
            }
        }
        catch (error) {
            console.log(error);
            response.json({
                message: error,
                success: false
            });
        }
    }
    async listBags(request, response, next, app) {
        try {
            const { shopId, deliveryId } = request.body;
            let query = {};
            query = {
                "shopId": mongoose_1.default.Types.ObjectId(shopId),
                "deliveryId": mongoose_1.default.Types.ObjectId(deliveryId),
                "delivery": false
            };
            let queryState = {
                "key": 4
            };
            if (shopId) {
                findDocuments(State_1.default, queryState, "", {}, '', '', 0, null, null).then((findResultState) => {
                    if (findResultState.length > 0) {
                        let stateIds;
                        stateIds = findResultState[0]._id;
                        findDocuments(OrderBags_1.default, query, "", {}, 'orderNumber', '', 0, null, null).then((result) => {
                            if (result.length) {
                                let bagsResult = result.filter((bag) => {
                                    if (bag.orderNumber)
                                        return stateIds.toString() == bag.orderNumber.state._id.toString();
                                });
                                response.json({
                                    message: 'Listado de bultos a despachar',
                                    data: bagsResult,
                                    success: true
                                });
                            }
                            else {
                                response.json({
                                    message: 'Listado de bultos a despachar',
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
                            message: "Error al consultar estados, ",
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
                    message: "Listado de bultos necesita una tienda (Shop ID)",
                    success: false
                });
            }
        }
        catch (error) {
            response.json({
                message: error,
                success: false
            });
        }
    }
    async listBagsforTake(request, response, next, app) {
        try {
            const { shopId, account } = request.body;
            let query;
            query = {
                "shopId": shopId,
                "deliveryId": null,
                "orderNumber": { $ne: null }
            };
            if (shopId) {
                findDocuments(Services_1.default, { key: "2" }, "", {}, '', '', 0, null, null).then((findResultSerives) => {
                    if (findResultSerives.length > 0) {
                        let serviceId = findResultSerives[0]._id;
                        findDocuments(OrderBags_1.default, query, "", {}, 'orderNumber', 'client orderNumber', 0, null, null).then((result) => {
                            if (result.length) {
                                let filterBag = result.filter((orderBag) => {
                                    if (orderBag.orderNumber)
                                        return (orderBag.orderNumber.uid._id.toString() === account.toString() && orderBag.orderNumber.service._id.toString() !== serviceId.toString());
                                });
                                response.json({
                                    message: 'Listado de bultos a despachar',
                                    data: filterBag,
                                    success: true
                                });
                            }
                            else {
                                response.json({
                                    message: 'Listado de bultos a despachar',
                                    data: [],
                                    success: true
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
                            message: 'Error al listar bultos',
                            data: [],
                            success: true
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
                    message: "Listado de bultos necesita una tienda (Shop ID)",
                    success: false
                });
            }
        }
        catch (error) {
            response.json({
                message: error,
                success: false
            });
        }
    }
    async updateBag(request, response, next, app) {
        try {
            let queryState = { "key": 4 };
            findDocuments(State_1.default, queryState, "", {}, '', '', 0, null, null).then((findResultState) => {
                if (findResultState.length > 0) {
                    let stateId = findResultState[0]._id;
                    let stateDesc = findResultState[0].desc;
                    const { id, deliveryId, orderId } = request.body;
                    let query = { "_id": mongoose_1.default.Types.ObjectId(id) };
                    let queryOrder = { "_id": mongoose_1.default.Types.ObjectId(orderId) };
                    let _updateOrder = { state: mongoose_1.default.Types.ObjectId(stateId), "deliveryId": mongoose_1.default.Types.ObjectId(deliveryId), deliveryName: "", bag: mongoose_1.default.Types.ObjectId(id), starDeliveryDate: new Date() };
                    let updateBag = { "deliveryId": mongoose_1.default.Types.ObjectId(deliveryId), "readyforDelivery": true };
                    if (id && deliveryId) {
                        findDocuments(User_1.default, { "_id": mongoose_1.default.Types.ObjectId(deliveryId) }, "", {}, '', '', 0, null, null).then((userResult) => {
                            if (userResult.length) {
                                _updateOrder.deliveryName = userResult[0].name;
                                findOneAndUpdateDB(Orders_1.default, queryOrder, _updateOrder, null, null).then((updateOrder) => {
                                    if (updateOrder) {
                                        findOneAndUpdateDB(OrderBags_1.default, query, updateBag, null, null).then((update) => {
                                            if (update) {
                                                let historyObj = {
                                                    state: mongoose_1.default.Types.ObjectId(stateId),
                                                    orderNumber: updateOrder.orderNumber,
                                                    order: mongoose_1.default.Types.ObjectId(updateOrder._id),
                                                    bag: mongoose_1.default.Types.ObjectId(id),
                                                    shop: mongoose_1.default.Types.ObjectId(updateOrder.shopId._id),
                                                    picker: mongoose_1.default.Types.ObjectId(updateOrder.pickerId._id),
                                                    delivery: mongoose_1.default.Types.ObjectId(deliveryId),
                                                    orderSnapShot: updateOrder,
                                                    dateHistory: new Date()
                                                };
                                                insertDB(History_1.default, historyObj).then((result) => {
                                                    if (result) {
                                                        findOneDB(Orders_1.default, orderId, "", {}, '', '', 0, null, null).then((OrderResult) => {
                                                            if (OrderResult) {
                                                                // Procedimientos 
                                                                let event = Object.assign({}, config_1.config.paramEvent);
                                                                event.CuentaCliente = OrderResult.uid.name;
                                                                event.OrderTrabajo = OrderResult.orderNumber.toString();
                                                                event.Estado = stateDesc;
                                                                event.FechaEventoOMS = new Date();
                                                                let orderEvent = [];
                                                                orderEvent.push(event);
                                                                console.log("Event", event);
                                                                executeProcedure("[OMS].[InsertEvento]", orderEvent);
                                                                response.json({
                                                                    message: 'Orden Actualizada correctamente',
                                                                    data: update,
                                                                    success: true
                                                                });
                                                            }
                                                            else {
                                                                response.json({
                                                                    message: 'Error al actualizar la orden',
                                                                    data: result,
                                                                    success: true
                                                                });
                                                            }
                                                        }).catch((err) => { response.json({ message: err.message, success: false }); });
                                                    }
                                                    else {
                                                        response.json({
                                                            message: 'Error al actualizar la orden',
                                                            data: result,
                                                            success: true
                                                        });
                                                    }
                                                }).catch((err) => {
                                                    response.json({
                                                        message: "" + err.message,
                                                        success: false
                                                    });
                                                });
                                            }
                                            else {
                                                response.json({
                                                    message: "Error al actualizar Bulto: " + update,
                                                    success: false
                                                });
                                            }
                                        }).catch((err) => {
                                            response.json({
                                                message: "" + err.message,
                                                success: false,
                                            });
                                        });
                                    }
                                    else {
                                        response.json({
                                            message: "Error al actualizar Bulto: " + updateOrder,
                                            success: false
                                        });
                                    }
                                }).catch((err) => {
                                    response.json({
                                        message: "" + err.message,
                                        success: false
                                    });
                                });
                            }
                            else {
                                response.json({
                                    message: "Error al tomar la orden, no se ha encontrado un usuario valido",
                                    success: false
                                });
                            }
                        }).catch((err) => {
                            response.json({
                                message: "" + err.message,
                                success: false
                            });
                        });
                    }
                    else {
                        response.json({
                            message: "Parametros Faltantes",
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
                    message: "" + err.message,
                    success: false
                });
            });
        }
        catch (error) {
            response.json({
                message: "" + error,
                success: false
            });
        }
    }
    //metodo donde se finaliza el despacho de la orden  
    async updateBagReceived(request, response, next, app) {
        try {
            let query = { "key": 5 };
            findDocuments(State_1.default, query, "", {}, '', '', 0, null, null).then((findResultState) => {
                if (findResultState.length > 0) {
                    let stateId = findResultState[0]._id;
                    let stateDesc = findResultState[0].desc;
                    const { id, comment, received, orderId } = request.body;
                    if (id) {
                        let queryOrder = { "_id": mongoose_1.default.Types.ObjectId(orderId) };
                        let updateOrder = { state: mongoose_1.default.Types.ObjectId(stateId), endDeliveryDate: new Date(), received: received, comment: comment };
                        let query = { "_id": mongoose_1.default.Types.ObjectId(id) };
                        let update = { comment: comment, "delivery": true, received: received };
                        findOneAndUpdateDB(Orders_1.default, queryOrder, updateOrder, null, null).then((updateOrder) => {
                            if (updateOrder) {
                                findOneAndUpdateDB(OrderBags_1.default, query, update, null, null).then((update) => {
                                    if (update) {
                                        findOneDB(Orders_1.default, orderId, "", {}, '', '', 0, null, null).then((OrderResult) => {
                                            if (OrderResult) {
                                                let historyObj = {
                                                    state: mongoose_1.default.Types.ObjectId(stateId),
                                                    orderNumber: updateOrder.orderNumber,
                                                    order: mongoose_1.default.Types.ObjectId(OrderResult._id),
                                                    bag: mongoose_1.default.Types.ObjectId(id),
                                                    shop: mongoose_1.default.Types.ObjectId(OrderResult.shopId._id),
                                                    picker: mongoose_1.default.Types.ObjectId(OrderResult.pickerId._id),
                                                    delivery: mongoose_1.default.Types.ObjectId(OrderResult.deliveryId._id),
                                                    orderSnapShot: Object.assign({}, OrderResult.toJSON()),
                                                    dateHistory: new Date()
                                                };
                                                let param = {
                                                    "CuentaCliente": OrderResult.uid.name,
                                                    "OrderTrabajo": OrderResult.orderNumber,
                                                    "FechaEntregaReal": OrderResult.endDeliveryDate ? new Date(OrderResult.endDeliveryDate) : null,
                                                    "RUT_Delivery": OrderResult.deliveryId.rut,
                                                    "Nombre_Delivery": OrderResult.deliveryId.name,
                                                    "Apellido_Delivery": OrderResult.deliveryId.lastname,
                                                    "FechaRecepcionDelivery": new Date(),
                                                    "Estado": stateDesc,
                                                };
                                                insertDB(History_1.default, historyObj).then((result) => {
                                                    if (result) {
                                                        executeProcedure("[OMS].[Delivery]", [param]);
                                                        let event = Object.assign({}, config_1.config.paramEvent);
                                                        event.CuentaCliente = OrderResult.uid.name;
                                                        event.OrderTrabajo = OrderResult.orderNumber.toString();
                                                        event.Estado = stateDesc;
                                                        event.FechaEventoOMS = new Date();
                                                        let orderEvent = [];
                                                        orderEvent.push(event);
                                                        executeProcedure("[OMS].[InsertEvento]", orderEvent);
                                                        response.json({
                                                            message: 'Orden entregada correctamente',
                                                            data: update,
                                                            success: true
                                                        });
                                                    }
                                                    else {
                                                        response.json({
                                                            message: 'Error al actualizar la orden',
                                                            data: result,
                                                            success: true
                                                        });
                                                    }
                                                }).catch((err) => {
                                                    response.json({
                                                        message: "" + err.message,
                                                        success: false
                                                    });
                                                });
                                            }
                                            else {
                                                response.json({
                                                    message: 'Error al actualizar la orden',
                                                    success: true
                                                });
                                            }
                                        }).catch((err) => {
                                            response.json({
                                                message: "" + err.message,
                                                success: false
                                            });
                                        });
                                    }
                                    else {
                                        response.json({
                                            message: "Error al actualizar Bulto",
                                            success: false
                                        });
                                    }
                                }).catch((err) => {
                                    response.json({
                                        message: "" + err,
                                        success: false
                                    });
                                });
                            }
                            else {
                                response.json({
                                    message: "Error al actualizar Bulto: " + updateOrder,
                                    success: false
                                });
                            }
                        }).catch((err) => {
                            response.json({
                                message: "" + err,
                                success: false
                            });
                        });
                    }
                    else {
                        response.json({
                            message: "Debe proporcionar el id del bulto",
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
                    message: "" + err,
                    success: false
                });
            });
        }
        catch (error) {
            response.json({
                message: "" + error.message,
                success: false
            });
        }
    }
    //metodo donde se finaliza el despacho de la orden  
    async updateBagStoreDelivery(request, response, next, app) {
        try {
            const { id, orderId, bags, state } = request.body;
            let query = { "key": state };
            findDocuments(State_1.default, query, "", {}, '', '', 0, null, null).then((findResultState) => {
                if (findResultState.length > 0) {
                    let stateId = findResultState[0]._id;
                    let stateDesc = findResultState[0].desc;
                    if (id) {
                        let queryOrder = { "_id": mongoose_1.default.Types.ObjectId(orderId) };
                        let updateOrder = { state: mongoose_1.default.Types.ObjectId(stateId) };
                        let update = { bags };
                        if (state == 8) {
                            updateOrder['cancellDate'] = new Date();
                            update['delivery'] = false;
                        }
                        if (state !== 8) {
                            updateOrder['endDeliveryDate'] = new Date();
                            update['delivery'] = true;
                        }
                        let query = { "_id": mongoose_1.default.Types.ObjectId(id) };
                        findOneAndUpdateDB(Orders_1.default, queryOrder, updateOrder, null, null).then((updateOrder) => {
                            if (updateOrder) {
                                findOneAndUpdateDB(OrderBags_1.default, query, update, null, null).then((update) => {
                                    if (update) {
                                        findOneDB(Orders_1.default, orderId, "", {}, '', '', 0, null, null).then((OrderResult) => {
                                            if (OrderResult) {
                                                let historyObj = {
                                                    state: mongoose_1.default.Types.ObjectId(stateId),
                                                    orderNumber: updateOrder.orderNumber,
                                                    order: mongoose_1.default.Types.ObjectId(OrderResult._id),
                                                    bag: mongoose_1.default.Types.ObjectId(id),
                                                    shop: mongoose_1.default.Types.ObjectId(OrderResult.shopId._id),
                                                    picker: mongoose_1.default.Types.ObjectId(OrderResult.pickerId._id),
                                                    // delivery: mongoose.Types.ObjectId(OrderResult.deliveryId._id),
                                                    delivery: null,
                                                    orderSnapShot: Object.assign({}, OrderResult.toJSON()),
                                                    dateHistory: new Date()
                                                };
                                                let param = {
                                                    "CuentaCliente": OrderResult.uid.name,
                                                    "OrderTrabajo": OrderResult.orderNumber,
                                                    "FechaEntregaReal": OrderResult.endDeliveryDate ? new Date(OrderResult.endDeliveryDate) : null,
                                                    "RUT_Delivery": "",
                                                    "Nombre_Delivery": "",
                                                    "Apellido_Delivery": "",
                                                    "FechaRecepcionDelivery": new Date(),
                                                    "Estado": stateDesc,
                                                };
                                                insertDB(History_1.default, historyObj).then((result) => {
                                                    if (result) {
                                                        executeProcedure("[OMS].[Delivery]", [param]);
                                                        let event = Object.assign({}, config_1.config.paramEvent);
                                                        event.CuentaCliente = OrderResult.uid.name;
                                                        event.OrderTrabajo = OrderResult.orderNumber.toString();
                                                        event.Estado = stateDesc;
                                                        event.FechaEventoOMS = new Date();
                                                        let orderEvent = [];
                                                        orderEvent.push(event);
                                                        console.log("Event", event);
                                                        executeProcedure("[OMS].[InsertEvento]", orderEvent);
                                                        let msg = "Orden entregada correctamente";
                                                        if (state == 8)
                                                            msg = "Se ha cancelado la orden de forma exitosa";
                                                        response.json({
                                                            message: msg,
                                                            data: update,
                                                            success: true
                                                        });
                                                    }
                                                    else {
                                                        response.json({
                                                            message: 'Error al entregar la orden, error asociado al ingreso del historial',
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
                                                    message: 'Error al entregar la orden, error asociado a la busqueda de la orden',
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
                                            message: "Error al entregar la orden (error asociado al bulto)",
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
                                    message: "Error al actualizar Bulto: " + updateOrder,
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
                            message: "Debe proporcionar el id del bulto",
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
    /*
      Metodo que recibe un array de bultos para guardarlas en la base de datos
   */
    async save(request, response, next, app) {
        try {
            let query = { "key": 3 };
            findDocuments(State_1.default, query, "", {}, '', '', 0, null, null).then((findResultState) => {
                if (findResultState.length > 0) {
                    let stateId = findResultState[0]._id;
                    let stateDesc = findResultState[0].desc;
                    const { orderNumber, bags, shopId, pickerId, partialBroken, totalBroken } = request.body;
                    let bag = { orderNumber, bags, shopId, pickerId };
                    let valid = validate(bag);
                    let unitsPicked = 0;
                    let unitsReplaced = 0;
                    let unitsBroken = 0;
                    let unitsDelivery = 0;
                    if (valid) {
                        bags.map((row) => {
                            row.products.map((bag) => {
                                unitsPicked = bag.unitsPicked + unitsPicked;
                                unitsReplaced = bag.unitsReplaced + unitsReplaced;
                                unitsBroken = bag.unitsBroken + unitsBroken;
                            });
                        });
                        bag.bags.map((bag) => {
                            return bag.products.map((bg) => {
                                bg['unitsDelivery'] = 0;
                                return bg;
                            });
                        });
                        bag.orderNumber = mongoose_1.default.Types.ObjectId(orderNumber);
                        bag.shopId = mongoose_1.default.Types.ObjectId(shopId);
                        bag.pickerId = mongoose_1.default.Types.ObjectId(pickerId);
                        let query = { "_id": mongoose_1.default.Types.ObjectId(orderNumber) };
                        let queryFind = { "orderNumber": mongoose_1.default.Types.ObjectId(orderNumber) };
                        let update = {
                            "pickerId": mongoose_1.default.Types.ObjectId(pickerId),
                            "bag": mongoose_1.default.Types.ObjectId(pickerId),
                            "shopId": mongoose_1.default.Types.ObjectId(shopId),
                            "state": mongoose_1.default.Types.ObjectId(stateId),
                            "endPickingDate": new Date(),
                            "pickerName": "",
                            "partialBroken": partialBroken,
                            "totalBroken": totalBroken
                        };
                        findDocuments(User_1.default, { "_id": mongoose_1.default.Types.ObjectId(pickerId) }, "", {}, '', '', 0, null, null).then((userResult) => {
                            if (userResult.length) {
                                findDocuments(OrderBags_1.default, queryFind, "", {}, '', '', 0, null, null).then((findResult) => {
                                    if (!findResult.length) {
                                        insertDB(OrderBags_1.default, bag).then((result) => {
                                            if (result) {
                                                update['bag'] = mongoose_1.default.Types.ObjectId(result._id);
                                                update.pickerName = userResult[0].name;
                                                findOneAndUpdateDB(Orders_1.default, query, update, null, null).then((update) => {
                                                    if (update) {
                                                        findOneDB(Orders_1.default, orderNumber, "", {}, '', '', 0, null, null).then((OrderResult) => {
                                                            if (OrderResult) {
                                                                let historyObj = {
                                                                    state: mongoose_1.default.Types.ObjectId(stateId),
                                                                    orderNumber: update.orderNumber,
                                                                    order: mongoose_1.default.Types.ObjectId(update._id),
                                                                    bag: mongoose_1.default.Types.ObjectId(OrderResult.bag._id),
                                                                    shop: mongoose_1.default.Types.ObjectId(shopId),
                                                                    picker: mongoose_1.default.Types.ObjectId(pickerId),
                                                                    delivery: null,
                                                                    orderSnapShot: Object.assign({}, OrderResult.toJSON()),
                                                                    dateHistory: new Date()
                                                                };
                                                                let param = {
                                                                    "CuentaCliente": OrderResult.uid.name,
                                                                    "OrderTrabajo": OrderResult.orderNumber,
                                                                    "RUT_Picker": OrderResult.pickerId.rut,
                                                                    "Nombre_Picker": OrderResult.pickerId.name,
                                                                    "Apellido_Picker": OrderResult.pickerId.lastname,
                                                                    "InicioPicking": OrderResult.startPickingDate ? new Date(OrderResult.startPickingDate) : null,
                                                                    "FinPicking": OrderResult.endPickingDate ? new Date(OrderResult.endPickingDate) : null,
                                                                    "UnPickeadasSolicitadas": unitsPicked,
                                                                    "UnQuebradas": unitsBroken,
                                                                    "UnidadesSustituidas": unitsReplaced,
                                                                    "Estado": stateDesc,
                                                                };
                                                                let msg = 'Orden guardada exitosamente';
                                                                if (OrderResult.service.key == "2")
                                                                    msg = "Orden guardada exitosamente, Se enviara un correo al cliente indicando que la orden se encuentra disponible para retiro";
                                                                insertDB(History_1.default, historyObj).then((result) => {
                                                                    if (result) {
                                                                        executeProcedure("[OMS].[PickingTerminado]", [param]);
                                                                        let event = Object.assign({}, config_1.config.paramEvent);
                                                                        event.CuentaCliente = OrderResult.uid.name;
                                                                        event.OrderTrabajo = OrderResult.orderNumber.toString();
                                                                        event.Estado = stateDesc;
                                                                        event.FechaEventoOMS = new Date();
                                                                        let orderEvent = [];
                                                                        orderEvent.push(event);
                                                                        console.log("Event", event);
                                                                        executeProcedure("[OMS].[InsertEvento]", orderEvent);
                                                                        response.json({
                                                                            message: msg,
                                                                            data: result,
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
                                                                    message: 'Error al Tomar la orden',
                                                                    data: result,
                                                                    success: true
                                                                });
                                                            }
                                                        }).catch((err) => {
                                                            response.json({
                                                                message: err.message,
                                                                success: false,
                                                            });
                                                        });
                                                    }
                                                    else {
                                                        response.json({
                                                            message: "Ha ocurrido un error al actualizar la orden",
                                                            success: false
                                                        });
                                                    }
                                                }).catch((err) => {
                                                    response.json({
                                                        message: err,
                                                        success: false,
                                                    });
                                                });
                                            }
                                            else {
                                                response.json({
                                                    message: "Ha ocurrido un error al actualizar la orden",
                                                    success: false
                                                });
                                            }
                                        }).catch((err) => {
                                            response.json({
                                                message: err.message,
                                                success: false,
                                                que: "sdads"
                                            });
                                        });
                                    }
                                    else {
                                        response.json({
                                            message: "No se puede agregar bolsa, orden ya tiene bulto(s) asignado(s)",
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
                                    message: "Error al tomar la orden, no se ha encontrado un usuario valido",
                                    success: false
                                });
                            }
                        }).catch((err) => {
                            response.json({
                                message: err,
                                success: false,
                            });
                        });
                    }
                    else {
                        response.json({
                            message: ajv.errorsText(validate.errors),
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
                    message: err.message,
                    success: false,
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
    async remove(request, response, next, app) {
    }
    async auth(request, response, next, app) {
    }
}
exports.OrderBagsController = OrderBagsController;
