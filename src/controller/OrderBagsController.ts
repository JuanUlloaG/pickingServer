import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
const jwt = require('jsonwebtoken');
import OrderBags, { OrderBagsInterface } from "../entity/OrderBags";
import Orders, { OrderInterface } from "../entity/Orders";
import State, { StateInterface } from "../entity/State";
import { schemaBags } from "../entity/OrderBags";
import { sendEmail } from "./MailController";
const { initDB, insertDB, insertManyDB, findDocuments, findOneAndUpdateDB, executeProcedure, findOneDB } = require("../config/db")
import Ajv from 'ajv';
import { ObjectId } from "mongodb";
import History, { HistoryInterface } from "../entity/History";
import User, { UserInterface } from "../entity/User";
import { config } from "../config/config";
import { OrderInsertInterface } from "../entity/Procedures";
import Service, { ServicesInterface } from "../entity/Services";
import BagNumber, { BagNumberInterface } from "../entity/Bag";
import moment from "moment";
var ajv = new Ajv({ allErrors: true });

var validate = ajv.compile(schemaBags)

export class OrderBagsController {

    async index(request: Request, response: Response, next: NextFunction, app: any) {
    }

    async listAllBags(request: Request, response: Response, next: NextFunction, app: any) {
        try {
            const { number, account } = request.body
            let query: object;
            query = {
                "bags.bagNumber": number,
                "orderNumber": { $ne: null }
            }
            findDocuments(OrderBags, query, "", {}, 'orderNumber pickerId deliveryId', '', 0, null, null).then((result: Array<OrderBagsInterface>) => {
                let filterBag = result.filter((orderBag) => {
                    if (orderBag.orderNumber)
                        return orderBag.orderNumber.uid._id == account
                })
                let orderres = {}

                if (filterBag.length) orderres = Object.assign({}, filterBag[0])
                if (filterBag.length > 0) {
                    response.json({
                        message: 'Detalle de consulta',
                        data: filterBag[0],
                        success: true
                    });
                } else {
                    response.json({
                        message: 'Detalle de consulta: No se encontraron ordenes asociadas',
                        data: {},
                        success: true
                    });
                }
            }).catch((err: Error) => {
                response.json({
                    message: err,
                    success: false
                });
            });
        } catch (error) {
            response.json({
                message: error,
                success: false
            });
        }
    }

    async getNumber(request: Request, response: Response, next: NextFunction, app: any) {
        try {
            const { cantidad, ordersToPrint } = request.body
            console.log(ordersToPrint)
            let bagsNumbers: Array<{ bag: any, numberBag: number }> = []
            ordersToPrint.map((row: string) => {
                for (let index = 0; index < cantidad; index++) {
                    let numbebag: number = parseInt(moment().format("YYYYMMDDHHmmss")) + Math.floor(Math.random() * 1000)
                    bagsNumbers.push({ bag: null, numberBag: numbebag })
                }
            })

            if (cantidad) {
                insertManyDB(BagNumber, bagsNumbers).then((result: Array<BagNumberInterface>) => {
                    if (result) {
                        response.json({
                            message: 'Bultos generados de forma exitosa',
                            data: result.map((bagnumber) => { return bagnumber.numberBag }),
                            success: true
                        });
                    } else {
                        response.json({
                            message: 'Error al generar los numeros de bultos',
                            profileNotSave: [],
                            success: false
                        });
                    }
                }).catch((err: Error) => {
                    console.log(err)
                    response.json({
                        message: err,
                        success: false
                    });
                });
            } else {
                response.json({
                    message: `No se puede generar bultos para ${cantidad} ordenes`,
                    data: [],
                    success: true
                });
            }
        } catch (error) {
            console.log(error)
            response.json({
                message: error,
                success: false
            });
        }
    }

    async listBags(request: Request, response: Response, next: NextFunction, app: any) {
        try {
            const { shopId, deliveryId } = request.body
            let query: any = {};
            query = {
                "shopId": mongoose.Types.ObjectId(shopId),
                "deliveryId": mongoose.Types.ObjectId(deliveryId),
                "delivery": false
            }

            let queryState = {
                "key": 4
            }

            if (shopId) {
                findDocuments(State, queryState, "", {}, '', '', 0, null, null).then((findResultState: Array<any>) => {
                    if (findResultState.length > 0) {
                        let stateIds: string;
                        stateIds = findResultState[0]._id
                        findDocuments(OrderBags, query, "", {}, 'orderNumber', '', 0, null, null).then((result: Array<any>) => {
                            if (result.length) {
                                let bagsResult = result.filter((bag) => {
                                    if (bag.orderNumber)
                                        return stateIds.toString() == bag.orderNumber.state._id.toString()
                                })
                                response.json({
                                    message: 'Listado de bultos a despachar',
                                    data: bagsResult,
                                    success: true
                                });
                            } else {
                                response.json({
                                    message: 'Listado de bultos a despachar',
                                    data: result,
                                    success: true
                                });
                            }
                        }).catch((err: Error) => {
                            response.json({
                                message: err.message,
                                success: false
                            });
                        });
                    } else {
                        response.json({
                            message: "Error al consultar estados, ",
                            success: false
                        });
                    }
                }).catch((err: Error) => {
                    response.json({
                        message: err.message,
                        success: false
                    });
                })
            } else {
                response.json({
                    message: "Listado de bultos necesita una tienda (Shop ID)",
                    success: false
                });
            }
        } catch (error) {
            response.json({
                message: error,
                success: false
            });
        }
    }

    async listBagsforTake(request: Request, response: Response, next: NextFunction, app: any) {
        try {
            const { shopId, account } = request.body
            let query: object;
            query = {
                "shopId": shopId,
                "deliveryId": null,
                "orderNumber": { $ne: null }
            }

            if (shopId) {
                findDocuments(Service, { key: "2" }, "", {}, '', '', 0, null, null).then((findResultSerives: Array<ServicesInterface>) => {
                    if (findResultSerives.length > 0) {
                        let serviceId = findResultSerives[0]._id;
                        findDocuments(OrderBags, query, "", {}, 'orderNumber', 'client orderNumber', 0, null, null).then((result: Array<OrderBagsInterface>) => {
                            if (result.length) {
                                let filterBag = result.filter((orderBag) => {
                                    if (orderBag.orderNumber)
                                        return (orderBag.orderNumber.uid._id.toString() === account.toString() && orderBag.orderNumber.service._id.toString() !== serviceId.toString())
                                })
                                response.json({
                                    message: 'Listado de bultos a despachar',
                                    data: filterBag,
                                    success: true
                                });
                            } else {
                                response.json({
                                    message: 'Listado de bultos a despachar',
                                    data: [],
                                    success: true
                                });
                            }
                        }).catch((err: Error) => {
                            response.json({
                                message: err,
                                success: false
                            });
                        });
                    } else {
                        response.json({
                            message: 'Error al listar bultos',
                            data: [],
                            success: true
                        });
                    }
                }).catch((err: Error) => {
                    response.json({
                        message: err,
                        success: false
                    });
                });

            } else {
                response.json({
                    message: "Listado de bultos necesita una tienda (Shop ID)",
                    success: false
                });
            }
        } catch (error) {
            response.json({
                message: error,
                success: false
            });
        }
    }

    async updateBag(request: Request, response: Response, next: NextFunction, app: any) {
        try {
            let queryState = { "key": 4 }
            findDocuments(State, queryState, "", {}, '', '', 0, null, null).then((findResultState: Array<StateInterface>) => {
                if (findResultState.length > 0) {
                    let stateId = findResultState[0]._id;
                    let stateDesc = findResultState[0].desc;
                    const { id, deliveryId, orderId } = request.body
                    let query = { "_id": mongoose.Types.ObjectId(id) }
                    let queryOrder = { "_id": mongoose.Types.ObjectId(orderId) }
                    let _updateOrder = { state: mongoose.Types.ObjectId(stateId), "deliveryId": mongoose.Types.ObjectId(deliveryId), deliveryName: "", bag: mongoose.Types.ObjectId(id), starDeliveryDate: new Date() }
                    let updateBag = { "deliveryId": mongoose.Types.ObjectId(deliveryId), "readyforDelivery": true }
                    if (id && deliveryId) {
                        findDocuments(User, { "_id": mongoose.Types.ObjectId(deliveryId) }, "", {}, '', '', 0, null, null).then((userResult: Array<UserInterface>) => {
                            if (userResult.length) {
                                _updateOrder.deliveryName = userResult[0].name
                                findOneAndUpdateDB(Orders, queryOrder, _updateOrder, null, null).then((updateOrder: OrderInterface) => {
                                    if (updateOrder) {
                                        findOneAndUpdateDB(OrderBags, query, updateBag, null, null).then((update: OrderBagsInterface) => {
                                            if (update) {
                                                let historyObj = {
                                                    state: mongoose.Types.ObjectId(stateId),
                                                    orderNumber: updateOrder.orderNumber,
                                                    order: mongoose.Types.ObjectId(updateOrder._id),
                                                    bag: mongoose.Types.ObjectId(id),
                                                    shop: mongoose.Types.ObjectId(updateOrder.shopId._id),
                                                    picker: mongoose.Types.ObjectId(updateOrder.pickerId._id),
                                                    delivery: mongoose.Types.ObjectId(deliveryId),
                                                    orderSnapShot: updateOrder,
                                                    dateHistory: new Date()
                                                }
                                                insertDB(History, historyObj).then((result: HistoryInterface) => {
                                                    if (result) {
                                                        findOneDB(Orders, orderId, "", {}, '', '', 0, null, null).then((OrderResult: OrderInterface) => {
                                                            if (OrderResult) {
                                                                // Procedimientos 
                                                                let event = Object.assign({}, config.paramEvent)
                                                                event.CuentaCliente = OrderResult.uid.name
                                                                event.OrderTrabajo = OrderResult.orderNumber.toString()
                                                                event.Estado = stateDesc
                                                                event.FechaEventoOMS = new Date()
                                                                let orderEvent = [];
                                                                orderEvent.push(event)
                                                                console.log("Event", event)
                                                                executeProcedure("[OMS].[InsertEvento]", orderEvent)
                                                                response.json({
                                                                    message: 'Orden Actualizada correctamente',
                                                                    data: update,
                                                                    success: true
                                                                });
                                                            } else {
                                                                response.json({
                                                                    message: 'Error al actualizar la orden',
                                                                    data: result,
                                                                    success: true
                                                                });
                                                            }
                                                        }).catch((err: Error) => { response.json({ message: err.message, success: false }); });
                                                    } else {
                                                        response.json({
                                                            message: 'Error al actualizar la orden',
                                                            data: result,
                                                            success: true
                                                        });
                                                    }
                                                }).catch((err: Error) => {
                                                    response.json({
                                                        message: "" + err.message,
                                                        success: false
                                                    });
                                                });
                                            } else {
                                                response.json({
                                                    message: "Error al actualizar Bulto: " + update,
                                                    success: false
                                                });
                                            }
                                        }).catch((err: Error) => {
                                            response.json({
                                                message: "" + err.message,
                                                success: false,
                                            });
                                        });
                                    } else {
                                        response.json({
                                            message: "Error al actualizar Bulto: " + updateOrder,
                                            success: false
                                        });
                                    }
                                }).catch((err: Error) => {
                                    response.json({
                                        message: "" + err.message,
                                        success: false
                                    });
                                });
                            } else {
                                response.json({
                                    message: "Error al tomar la orden, no se ha encontrado un usuario valido",
                                    success: false
                                });
                            }
                        }).catch((err: Error) => {
                            response.json({
                                message: "" + err.message,
                                success: false
                            });
                        });

                    } else {
                        response.json({
                            message: "Parametros Faltantes",
                            success: false
                        });
                    }
                } else {
                    response.json({
                        message: "Error al tomar la orden, no se ha encontrado un estado valido",
                        success: false
                    });
                }
            }).catch((err: Error) => {
                response.json({
                    message: "" + err.message,
                    success: false
                });
            });

        } catch (error) {
            response.json({
                message: "" + error,
                success: false
            });
        }
    }

    //metodo donde se finaliza el despacho de la orden  
    async updateBagReceived(request: Request, response: Response, next: NextFunction, app: any) {
        try {
            let query = { "key": 5 }
            findDocuments(State, query, "", {}, '', '', 0, null, null).then((findResultState: Array<StateInterface>) => {
                if (findResultState.length > 0) {
                    let stateId = findResultState[0]._id;
                    let stateDesc = findResultState[0].desc;
                    const { id, comment, received, orderId } = request.body
                    if (id) {
                        let queryOrder = { "_id": mongoose.Types.ObjectId(orderId) }
                        let updateOrder = { state: mongoose.Types.ObjectId(stateId), endDeliveryDate: new Date(), received: received, comment: comment }
                        let query = { "_id": mongoose.Types.ObjectId(id) }
                        let update = { comment: comment, "delivery": true, received: received }
                        findOneAndUpdateDB(Orders, queryOrder, updateOrder, null, null).then((updateOrder: OrderInterface) => {
                            if (updateOrder) {
                                findOneAndUpdateDB(OrderBags, query, update, null, null).then((update: OrderBagsInterface) => {
                                    if (update) {
                                        findOneDB(Orders, orderId, "", {}, '', '', 0, null, null).then((OrderResult: OrderInterface) => {
                                            if (OrderResult) {
                                                let historyObj = {
                                                    state: mongoose.Types.ObjectId(stateId),
                                                    orderNumber: updateOrder.orderNumber,
                                                    order: mongoose.Types.ObjectId(OrderResult._id),
                                                    bag: mongoose.Types.ObjectId(id),
                                                    shop: mongoose.Types.ObjectId(OrderResult.shopId._id),
                                                    picker: mongoose.Types.ObjectId(OrderResult.pickerId._id),
                                                    delivery: mongoose.Types.ObjectId(OrderResult.deliveryId._id),
                                                    orderSnapShot: Object.assign({}, OrderResult.toJSON()),
                                                    dateHistory: new Date()
                                                }
                                                let param: object = {
                                                    "CuentaCliente": OrderResult.uid.name,
                                                    "OrderTrabajo": OrderResult.orderNumber,
                                                    "FechaEntregaReal": OrderResult.endDeliveryDate ? new Date(OrderResult.endDeliveryDate) : null,
                                                    "RUT_Delivery": OrderResult.deliveryId.rut,
                                                    "Nombre_Delivery": OrderResult.deliveryId.name,
                                                    "Apellido_Delivery": OrderResult.deliveryId.lastname,
                                                    "FechaRecepcionDelivery": new Date(),
                                                    "Estado": stateDesc,
                                                }
                                                insertDB(History, historyObj).then((result: HistoryInterface) => {
                                                    if (result) {
                                                        executeProcedure("[OMS].[Delivery]", [param])
                                                        let event = Object.assign({}, config.paramEvent)
                                                        event.CuentaCliente = OrderResult.uid.name
                                                        event.OrderTrabajo = OrderResult.orderNumber.toString()
                                                        event.Estado = stateDesc
                                                        event.FechaEventoOMS = new Date()
                                                        let orderEvent = [];
                                                        orderEvent.push(event)
                                                        executeProcedure("[OMS].[InsertEvento]", orderEvent)
                                                        response.json({
                                                            message: 'Orden entregada correctamente',
                                                            data: update,
                                                            success: true
                                                        });
                                                    } else {
                                                        response.json({
                                                            message: 'Error al actualizar la orden',
                                                            data: result,
                                                            success: true
                                                        });
                                                    }
                                                }).catch((err: Error) => {
                                                    response.json({
                                                        message: "" + err.message,
                                                        success: false
                                                    });
                                                });
                                            } else {
                                                response.json({
                                                    message: 'Error al actualizar la orden',
                                                    success: true
                                                });
                                            }
                                        }).catch((err: Error) => {
                                            response.json({
                                                message: "" + err.message,
                                                success: false
                                            });
                                        });

                                    } else {
                                        response.json({
                                            message: "Error al actualizar Bulto",
                                            success: false
                                        });
                                    }
                                }).catch((err: Error) => {
                                    response.json({
                                        message: "" + err,
                                        success: false
                                    });
                                });
                            } else {
                                response.json({
                                    message: "Error al actualizar Bulto: " + updateOrder,
                                    success: false
                                });
                            }

                        }).catch((err: Error) => {
                            response.json({
                                message: "" + err,
                                success: false
                            });
                        });
                    } else {
                        response.json({
                            message: "Debe proporcionar el id del bulto",
                            success: false
                        });
                    }
                } else {
                    response.json({
                        message: "Error al tomar la orden, no se ha encontrado un estado valido",
                        success: false
                    });
                }
            }).catch((err: Error) => {
                response.json({
                    message: "" + err,
                    success: false
                });
            });
        } catch (error) {
            response.json({
                message: "" + error.message,
                success: false
            });
        }
    }

    //metodo donde se finaliza el despacho de la orden  
    async updateBagStoreDelivery(request: Request, response: Response, next: NextFunction, app: any) {
        try {
            const { id, orderId, bags, state } = request.body
            let query = { "key": state }
            findDocuments(State, query, "", {}, '', '', 0, null, null).then((findResultState: Array<StateInterface>) => {
                if (findResultState.length > 0) {
                    let stateId = findResultState[0]._id;
                    let stateDesc = findResultState[0].desc;
                    if (id) {
                        let queryOrder = { "_id": mongoose.Types.ObjectId(orderId) }
                        let updateOrder: any = { state: mongoose.Types.ObjectId(stateId) }
                        let update: any = { bags }
                        if (state == 8) {
                            updateOrder['cancellDate'] = new Date()
                            update['delivery'] = false
                        }
                        if (state !== 8) {
                            updateOrder['endDeliveryDate'] = new Date()
                            update['delivery'] = true
                        }

                        let query = { "_id": mongoose.Types.ObjectId(id) }

                        findOneAndUpdateDB(Orders, queryOrder, updateOrder, null, null).then((updateOrder: OrderInterface) => {
                            if (updateOrder) {
                                findOneAndUpdateDB(OrderBags, query, update, null, null).then((update: OrderBagsInterface) => {
                                    if (update) {
                                        findOneDB(Orders, orderId, "", {}, '', '', 0, null, null).then((OrderResult: OrderInterface) => {
                                            if (OrderResult) {
                                                let historyObj = {
                                                    state: mongoose.Types.ObjectId(stateId),
                                                    orderNumber: updateOrder.orderNumber,
                                                    order: mongoose.Types.ObjectId(OrderResult._id),
                                                    bag: mongoose.Types.ObjectId(id),
                                                    shop: mongoose.Types.ObjectId(OrderResult.shopId._id),
                                                    picker: mongoose.Types.ObjectId(OrderResult.pickerId._id),
                                                    // delivery: mongoose.Types.ObjectId(OrderResult.deliveryId._id),
                                                    delivery: null,
                                                    orderSnapShot: Object.assign({}, OrderResult.toJSON()),
                                                    dateHistory: new Date()
                                                }
                                                let param: object = {
                                                    "CuentaCliente": OrderResult.uid.name,
                                                    "OrderTrabajo": OrderResult.orderNumber,
                                                    "FechaEntregaReal": OrderResult.endDeliveryDate ? new Date(OrderResult.endDeliveryDate) : null,
                                                    "RUT_Delivery": "",
                                                    "Nombre_Delivery": "",
                                                    "Apellido_Delivery": "",
                                                    "FechaRecepcionDelivery": new Date(),
                                                    "Estado": stateDesc,
                                                }
                                                insertDB(History, historyObj).then((result: HistoryInterface) => {
                                                    if (result) {
                                                        executeProcedure("[OMS].[Delivery]", [param])
                                                        let event = Object.assign({}, config.paramEvent)
                                                        event.CuentaCliente = OrderResult.uid.name
                                                        event.OrderTrabajo = OrderResult.orderNumber.toString()
                                                        event.Estado = stateDesc
                                                        event.FechaEventoOMS = new Date()
                                                        let orderEvent = [];
                                                        orderEvent.push(event)
                                                        console.log("Event", event)
                                                        executeProcedure("[OMS].[InsertEvento]", orderEvent)
                                                        let msg = "Orden entregada correctamente"
                                                        if (state == 8) msg = "Se ha cancelado la orden de forma exitosa"
                                                        response.json({
                                                            message: msg,
                                                            data: update,
                                                            success: true
                                                        });

                                                    } else {
                                                        response.json({
                                                            message: 'Error al entregar la orden, error asociado al ingreso del historial',
                                                            data: result,
                                                            success: true
                                                        });
                                                    }
                                                }).catch((err: Error) => {
                                                    response.json({
                                                        message: err.message,
                                                        success: false
                                                    });
                                                });
                                            } else {
                                                response.json({
                                                    message: 'Error al entregar la orden, error asociado a la busqueda de la orden',
                                                    success: true
                                                });
                                            }
                                        }).catch((err: Error) => {
                                            response.json({
                                                message: err.message,
                                                success: false
                                            });
                                        });
                                    } else {
                                        response.json({
                                            message: "Error al entregar la orden (error asociado al bulto)",
                                            success: false
                                        });
                                    }
                                }).catch((err: Error) => {
                                    response.json({
                                        message: err.message,
                                        success: false
                                    });
                                });
                            } else {
                                response.json({
                                    message: "Error al actualizar Bulto: " + updateOrder,
                                    success: false
                                });
                            }
                        }).catch((err: Error) => {
                            response.json({
                                message: err.message,
                                success: false
                            });
                        });
                    } else {
                        response.json({
                            message: "Debe proporcionar el id del bulto",
                            success: false
                        });
                    }
                } else {
                    response.json({
                        message: "Error al tomar la orden, no se ha encontrado un estado valido",
                        success: false
                    });
                }
            }).catch((err: Error) => {
                response.json({
                    message: err,
                    success: false
                });
            });
        } catch (error) {
            response.json({
                message: error.message,
                success: false
            });
        }
    }

    /*
      Metodo que recibe un array de bultos para guardarlas en la base de datos
   */
    async save(request: Request, response: Response, next: NextFunction, app: any) {
        try {
            let query = { "key": 3 }
            findDocuments(State, query, "", {}, '', '', 0, null, null).then((findResultState: Array<StateInterface>) => {
                if (findResultState.length > 0) {
                    let stateId = findResultState[0]._id;
                    let stateDesc = findResultState[0].desc;
                    const { orderNumber, bags, shopId, pickerId, partialBroken, totalBroken } = request.body
                    let bag = { orderNumber, bags, shopId, pickerId }
                    let valid = validate(bag)
                    let unitsPicked = 0
                    let unitsReplaced = 0
                    let unitsBroken = 0
                    let unitsDelivery = 0
                    if (valid) {
                        bags.map((row: any) => {
                            row.products.map((bag: any) => {
                                unitsPicked = bag.unitsPicked + unitsPicked
                                unitsReplaced = bag.unitsReplaced + unitsReplaced
                                unitsBroken = bag.unitsBroken + unitsBroken
                            })
                        })
                        bag.bags.map((bag: any) => {
                            return bag.products.map((bg: any) => {
                                bg['unitsDelivery'] = 0
                                return bg
                            })
                        })
                        bag.orderNumber = mongoose.Types.ObjectId(orderNumber)
                        bag.shopId = mongoose.Types.ObjectId(shopId)
                        bag.pickerId = mongoose.Types.ObjectId(pickerId)

                        let query = { "_id": mongoose.Types.ObjectId(orderNumber) }
                        let queryFind = { "orderNumber": mongoose.Types.ObjectId(orderNumber) }
                        let update = {
                            "pickerId": mongoose.Types.ObjectId(pickerId),
                            "bag": mongoose.Types.ObjectId(pickerId),
                            "shopId": mongoose.Types.ObjectId(shopId),
                            "state": mongoose.Types.ObjectId(stateId),
                            "endPickingDate": new Date(),
                            "pickerName": "",
                            "partialBroken": partialBroken,
                            "totalBroken": totalBroken
                        }
                        findDocuments(User, { "_id": mongoose.Types.ObjectId(pickerId) }, "", {}, '', '', 0, null, null).then((userResult: Array<UserInterface>) => {
                            if (userResult.length) {
                                findDocuments(OrderBags, queryFind, "", {}, '', '', 0, null, null).then((findResult: Array<OrderBagsInterface>) => {
                                    if (!findResult.length) {
                                        insertDB(OrderBags, bag).then((result: OrderBagsInterface) => {
                                            if (result) {
                                                update['bag'] = mongoose.Types.ObjectId(result._id)
                                                update.pickerName = userResult[0].name
                                                findOneAndUpdateDB(Orders, query, update, null, null).then((update: OrderInterface) => {
                                                    if (update) {
                                                        findOneDB(Orders, orderNumber, "", {}, '', '', 0, null, null).then((OrderResult: OrderInterface) => {
                                                            if (OrderResult) {
                                                                let historyObj = {
                                                                    state: mongoose.Types.ObjectId(stateId),
                                                                    orderNumber: update.orderNumber,
                                                                    order: mongoose.Types.ObjectId(update._id),
                                                                    bag: mongoose.Types.ObjectId(OrderResult.bag._id),
                                                                    shop: mongoose.Types.ObjectId(shopId),
                                                                    picker: mongoose.Types.ObjectId(pickerId),
                                                                    delivery: null,
                                                                    orderSnapShot: Object.assign({}, OrderResult.toJSON()),
                                                                    dateHistory: new Date()
                                                                }
                                                                let param: object = {
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
                                                                }
                                                                let msg = 'Orden guardada exitosamente'
                                                                if (OrderResult.service.key == "2") msg = "Orden guardada exitosamente, Se enviara un correo al cliente indicando que la orden se encuentra disponible para retiro"
                                                                insertDB(History, historyObj).then((result: HistoryInterface) => {
                                                                    if (result) {
                                                                        executeProcedure("[OMS].[PickingTerminado]", [param])
                                                                        let event = Object.assign({}, config.paramEvent)
                                                                        event.CuentaCliente = OrderResult.uid.name
                                                                        event.OrderTrabajo = OrderResult.orderNumber.toString()
                                                                        event.Estado = stateDesc
                                                                        event.FechaEventoOMS = new Date()
                                                                        let orderEvent = [];
                                                                        orderEvent.push(event)
                                                                        console.log("Event", event)
                                                                        executeProcedure("[OMS].[InsertEvento]", orderEvent)
                                                                        response.json({
                                                                            message: msg,
                                                                            data: result,
                                                                            success: true
                                                                        });

                                                                    } else {
                                                                        response.json({
                                                                            message: 'Error al Tomar la orden',
                                                                            data: result,
                                                                            success: true
                                                                        });
                                                                    }
                                                                }).catch((err: Error) => {
                                                                    response.json({
                                                                        message: err.message,
                                                                        success: false
                                                                    });
                                                                });
                                                            } else {
                                                                response.json({
                                                                    message: 'Error al Tomar la orden',
                                                                    data: result,
                                                                    success: true
                                                                });
                                                            }
                                                        }).catch((err: Error) => {
                                                            response.json({
                                                                message: err.message,
                                                                success: false,
                                                            });
                                                        })
                                                    } else {
                                                        response.json({
                                                            message: "Ha ocurrido un error al actualizar la orden",
                                                            success: false
                                                        });
                                                    }
                                                }).catch((err: Error) => {
                                                    response.json({
                                                        message: err,
                                                        success: false,
                                                    });
                                                });
                                            } else {
                                                response.json({
                                                    message: "Ha ocurrido un error al actualizar la orden",
                                                    success: false
                                                });
                                            }
                                        }).catch((err: Error) => {
                                            response.json({
                                                message: err.message,
                                                success: false,
                                                que: "sdads"
                                            });
                                        });
                                    } else {
                                        response.json({
                                            message: "No se puede agregar bolsa, orden ya tiene bulto(s) asignado(s)",
                                            success: false
                                        });
                                    }
                                }).catch((err: Error) => {
                                    response.json({
                                        message: err.message,
                                        success: false
                                    });
                                });
                            } else {
                                response.json({
                                    message: "Error al tomar la orden, no se ha encontrado un usuario valido",
                                    success: false
                                });
                            }
                        }).catch((err: Error) => {
                            response.json({
                                message: err,
                                success: false,
                            });
                        });
                    } else {
                        response.json({
                            message: ajv.errorsText(validate.errors),
                            success: false
                        });
                    }
                } else {
                    response.json({
                        message: "Error al tomar la orden, no se ha encontrado un estado valido",
                        success: false
                    });
                }

            }).catch((err: Error) => {
                response.json({
                    message: err.message,
                    success: false,
                });
            });

        } catch (error) {
            response.json({
                message: error.message,
                success: false
            });
        }
    }

    async remove(request: Request, response: Response, next: NextFunction, app: any) {
    }

    async auth(request: Request, response: Response, next: NextFunction, app: any) {
    }
}