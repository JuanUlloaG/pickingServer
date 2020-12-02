import { NextFunction, Request, Response } from "express";
const jwt = require('jsonwebtoken');
import mongoose from "mongoose";
const { initDB, insertDB, findOneDB, findDocuments, findOneAndUpdateDB, updateManyDB } = require("../config/db");
import State from "../entity/State";
import Company from "../entity/Company";
import User from "../entity/User";
import Shop from "../entity/Shop";
import Order from "../entity/Orders";

export class CompanyControllers {

    async all(request: Request, response: Response, next: NextFunction, app: any) {
        try {
            let { profile, company, query } = request.body
            console.log("object", request.body)
            let _query: any = {};
            let populate: string = '';
            let queryState = { "key": 10 }
            findDocuments(State, queryState, "", {}, '', '', 0, null, null).then((findResult: Array<any>) => {
                if (findResult.length > 0) {
                    let stateId = findResult[0]._id;
                    if (Object.keys(query).length > 0) {
                        _query["condition"] = { "$ne": mongoose.Types.ObjectId(stateId) }
                        if (query.rut) {
                            _query["rut"] = { $regex: query.rut }
                        }
                        if (query.name) {
                            _query["name"] = { $regex: new RegExp(query.name, "i") }
                        }

                    } else {
                        _query = {
                            "condition": { "$ne": mongoose.Types.ObjectId(stateId) }
                        }
                    }
                    if (company) {
                        _query['_id'] = mongoose.Types.ObjectId(company)
                    }
                    populate = 'condition'
                    findDocuments(Company, _query, "", {}, populate, '', 0, null, null).then((result: Array<any>) => {
                        if (result.length > 0) {
                            response.json({
                                message: 'Listado de cuentas',
                                data: result,
                                success: true
                            });
                        } else {
                            response.json({
                                message: 'Listado de cuentas',
                                data: result,
                                success: true
                            });
                        }
                    }).catch((err: Error) => {
                        response.json({
                            message: err.message,
                            success: false,
                            data: []
                        });
                    });
                } else {
                    response.json({
                        message: "Error al traer cuentas",
                        success: false,
                        data: []
                    });
                }
            }).catch((err: Error) => {
                response.json({
                    message: err.message,
                    success: false,
                    data: []
                });
            });
        } catch (error) {
            response.json({
                message: error,
                success: false,
                data: []
            });
        }
    }

    async update(request: Request, response: Response, next: NextFunction, app: any) {
        try {
            const { id, name, email, phone, rut } = request.body
            if (id) {
                if (name !== "" && email !== "" && phone !== "" && rut !== "") {
                    let update = { name, email, phone, rut }
                    let query: object;
                    query = { '_id': mongoose.Types.ObjectId(id) }
                    findOneAndUpdateDB(Company, query, update, null, null).then((result: any) => {
                        if (result) {
                            response.json({
                                message: `Cuenta "${result.name}" editada correctamente`,
                                data: result,
                                success: true
                            });
                        } else {
                            response.json({
                                message: "Error al actualizar cuenta",
                                success: false,
                                data: result
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
                        message: "Error al actualizar cuenta, no puedes dejar en blanco la informacion de la cuenta",
                        success: false,
                        data: []
                    });
                }
            } else {
                response.json({
                    message: "Error al actualizar cuenta, el dentificador de la cuenta es erroneo",
                    success: false,
                    data: []
                });
            }
        } catch (error) {
            response.json({
                message: error,
                success: false
            });
        }
    }

    async deleteAccount(request: Request, response: Response, next: NextFunction, app: any) {
        try {
            const { id } = request.body
            let query: object;
            query = { '_id': mongoose.Types.ObjectId(id) }
            let queryState = { "key": 10 }
            if (id) {
                findDocuments(State, queryState, "", {}, '', '', 0, null, null).then((findResult: Array<any>) => {
                    if (findResult.length > 0) {
                        let stateId = findResult[0]._id;
                        let update = { 'condition': mongoose.Types.ObjectId(stateId) }
                        findOneAndUpdateDB(Company, query, update, null, null).then((result: any) => {
                            if (result) {
                                let state = { 'condition': mongoose.Types.ObjectId(stateId), state: false }
                                let queryUser = { 'company': mongoose.Types.ObjectId(id) }
                                updateManyDB(User, queryUser, state, null, null).then((result: any) => {
                                    if (result) {
                                        let stateShop = { 'condition': mongoose.Types.ObjectId(stateId) }
                                        let queryShop = { 'company': mongoose.Types.ObjectId(id) }
                                        updateManyDB(Shop, queryShop, stateShop, null, null).then((result: any) => {
                                            if (result) {
                                                let stateOrder = { 'condition': mongoose.Types.ObjectId(stateId) }
                                                let queryOrder = { 'uid': mongoose.Types.ObjectId(id) }
                                                updateManyDB(Order, queryOrder, stateOrder, null, null).then((result: any) => {
                                                    if (result) {
                                                        response.json({
                                                            message: 'Se ha eliminado la cuenta correctamente',
                                                            data: result,
                                                            success: true
                                                        });
                                                    } else {
                                                        response.json({
                                                            message: "Error al eliminar cuenta",
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
                                                    message: "Error al eliminar cuenta",
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
                                            message: "Error al eliminar cuenta",
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
                                    message: "Error al eliminar cuenta",
                                    success: false
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
                            message: "Error al eliminar la cuenta, no se ha encontrado un estado valido",
                            success: false
                        });
                    }
                }).catch((err: Error) => {
                    response.json({
                        message: `Error al eliminar la cuenta, no se ha encontrado un estado valido ${err.message}`,
                        success: false
                    });
                })
            } else {
                response.json({
                    message: "Error al eliminar la cuenta, el identificador es invalido",
                    success: false
                });
            }
        } catch (error) {
            response.json({
                message: `Error al eliminar la cuenta, ${error}`,
                success: false
            });
        }
    }

    async save(request: Request, response: Response, next: NextFunction, app: any) {
        const { name, phone, email, rut } = request.body
        let queryState = { "key": 9 }
        findDocuments(State, queryState, "", {}, '', '', 0, null, null).then((findResult: Array<any>) => {
            if (findResult.length > 0) {
                let stateId = findResult[0]._id;
                let _company = { name, rut, email, phone, 'condition': mongoose.Types.ObjectId(stateId) }
                insertDB(Company, _company).then((result: any) => {
                    response.json({
                        message: `Se ha creado la cuenta: "${name}" de manera exitosa`,
                        data: result,
                        success: true
                    });
                }).catch((err: Error) => {
                    response.json({
                        message: err.message,
                        success: false
                    });
                });
            } else {
                response.json({
                    message: `Error al crear la cuenta: "${name}" no se ha encontrado estado valido.`,
                    success: false
                });
            }
        }).catch((err: Error) => {
            response.json({
                message: `Error al crear la cuenta: ${err.message}`,
                success: false
            });
        });
    }

    async ordersToDelivery(request: Request, response: Response, next: NextFunction, app: any) {
        response.json({
            message: 'Listado de clientes',
            data: [],
            success: true
        });
    }

    async remove(request: Request, response: Response, next: NextFunction, app: any) {

    }

    async auth(request: Request, response: Response, next: NextFunction, app: any) {

    }
}