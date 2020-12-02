"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyControllers = void 0;
const jwt = require('jsonwebtoken');
const mongoose_1 = __importDefault(require("mongoose"));
const { initDB, insertDB, findOneDB, findDocuments, findOneAndUpdateDB, updateManyDB } = require("../config/db");
const State_1 = __importDefault(require("../entity/State"));
const Company_1 = __importDefault(require("../entity/Company"));
const User_1 = __importDefault(require("../entity/User"));
const Shop_1 = __importDefault(require("../entity/Shop"));
const Orders_1 = __importDefault(require("../entity/Orders"));
class CompanyControllers {
    async all(request, response, next, app) {
        try {
            let { profile, company, query } = request.body;
            console.log("object", request.body);
            let _query = {};
            let populate = '';
            let queryState = { "key": 10 };
            findDocuments(State_1.default, queryState, "", {}, '', '', 0, null, null).then((findResult) => {
                if (findResult.length > 0) {
                    let stateId = findResult[0]._id;
                    if (Object.keys(query).length > 0) {
                        _query["condition"] = { "$ne": mongoose_1.default.Types.ObjectId(stateId) };
                        if (query.rut) {
                            _query["rut"] = { $regex: query.rut };
                        }
                        if (query.name) {
                            _query["name"] = { $regex: new RegExp(query.name, "i") };
                        }
                    }
                    else {
                        _query = {
                            "condition": { "$ne": mongoose_1.default.Types.ObjectId(stateId) }
                        };
                    }
                    if (company) {
                        _query['_id'] = mongoose_1.default.Types.ObjectId(company);
                    }
                    populate = 'condition';
                    findDocuments(Company_1.default, _query, "", {}, populate, '', 0, null, null).then((result) => {
                        if (result.length > 0) {
                            response.json({
                                message: 'Listado de cuentas',
                                data: result,
                                success: true
                            });
                        }
                        else {
                            response.json({
                                message: 'Listado de cuentas',
                                data: result,
                                success: true
                            });
                        }
                    }).catch((err) => {
                        response.json({
                            message: err.message,
                            success: false,
                            data: []
                        });
                    });
                }
                else {
                    response.json({
                        message: "Error al traer cuentas",
                        success: false,
                        data: []
                    });
                }
            }).catch((err) => {
                response.json({
                    message: err.message,
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
    async update(request, response, next, app) {
        try {
            const { id, name, email, phone, rut } = request.body;
            if (id) {
                if (name !== "" && email !== "" && phone !== "" && rut !== "") {
                    let update = { name, email, phone, rut };
                    let query;
                    query = { '_id': mongoose_1.default.Types.ObjectId(id) };
                    findOneAndUpdateDB(Company_1.default, query, update, null, null).then((result) => {
                        if (result) {
                            response.json({
                                message: `Cuenta "${result.name}" editada correctamente`,
                                data: result,
                                success: true
                            });
                        }
                        else {
                            response.json({
                                message: "Error al actualizar cuenta",
                                success: false,
                                data: result
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
                        message: "Error al actualizar cuenta, no puedes dejar en blanco la informacion de la cuenta",
                        success: false,
                        data: []
                    });
                }
            }
            else {
                response.json({
                    message: "Error al actualizar cuenta, el dentificador de la cuenta es erroneo",
                    success: false,
                    data: []
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
    async deleteAccount(request, response, next, app) {
        try {
            const { id } = request.body;
            let query;
            query = { '_id': mongoose_1.default.Types.ObjectId(id) };
            let queryState = { "key": 10 };
            if (id) {
                findDocuments(State_1.default, queryState, "", {}, '', '', 0, null, null).then((findResult) => {
                    if (findResult.length > 0) {
                        let stateId = findResult[0]._id;
                        let update = { 'condition': mongoose_1.default.Types.ObjectId(stateId) };
                        findOneAndUpdateDB(Company_1.default, query, update, null, null).then((result) => {
                            if (result) {
                                let state = { 'condition': mongoose_1.default.Types.ObjectId(stateId), state: false };
                                let queryUser = { 'company': mongoose_1.default.Types.ObjectId(id) };
                                updateManyDB(User_1.default, queryUser, state, null, null).then((result) => {
                                    if (result) {
                                        let stateShop = { 'condition': mongoose_1.default.Types.ObjectId(stateId) };
                                        let queryShop = { 'company': mongoose_1.default.Types.ObjectId(id) };
                                        updateManyDB(Shop_1.default, queryShop, stateShop, null, null).then((result) => {
                                            if (result) {
                                                let stateOrder = { 'condition': mongoose_1.default.Types.ObjectId(stateId) };
                                                let queryOrder = { 'uid': mongoose_1.default.Types.ObjectId(id) };
                                                updateManyDB(Orders_1.default, queryOrder, stateOrder, null, null).then((result) => {
                                                    if (result) {
                                                        response.json({
                                                            message: 'Se ha eliminado la cuenta correctamente',
                                                            data: result,
                                                            success: true
                                                        });
                                                    }
                                                    else {
                                                        response.json({
                                                            message: "Error al eliminar cuenta",
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
                                                    message: "Error al eliminar cuenta",
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
                                            message: "Error al eliminar cuenta",
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
                                    message: "Error al eliminar cuenta",
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
                            message: "Error al eliminar la cuenta, no se ha encontrado un estado valido",
                            success: false
                        });
                    }
                }).catch((err) => {
                    response.json({
                        message: `Error al eliminar la cuenta, no se ha encontrado un estado valido ${err.message}`,
                        success: false
                    });
                });
            }
            else {
                response.json({
                    message: "Error al eliminar la cuenta, el identificador es invalido",
                    success: false
                });
            }
        }
        catch (error) {
            response.json({
                message: `Error al eliminar la cuenta, ${error}`,
                success: false
            });
        }
    }
    async save(request, response, next, app) {
        const { name, phone, email, rut } = request.body;
        let queryState = { "key": 9 };
        findDocuments(State_1.default, queryState, "", {}, '', '', 0, null, null).then((findResult) => {
            if (findResult.length > 0) {
                let stateId = findResult[0]._id;
                let _company = { name, rut, email, phone, 'condition': mongoose_1.default.Types.ObjectId(stateId) };
                insertDB(Company_1.default, _company).then((result) => {
                    response.json({
                        message: `Se ha creado la cuenta: "${name}" de manera exitosa`,
                        data: result,
                        success: true
                    });
                }).catch((err) => {
                    response.json({
                        message: err.message,
                        success: false
                    });
                });
            }
            else {
                response.json({
                    message: `Error al crear la cuenta: "${name}" no se ha encontrado estado valido.`,
                    success: false
                });
            }
        }).catch((err) => {
            response.json({
                message: `Error al crear la cuenta: ${err.message}`,
                success: false
            });
        });
    }
    async ordersToDelivery(request, response, next, app) {
        response.json({
            message: 'Listado de clientes',
            data: [],
            success: true
        });
    }
    async remove(request, response, next, app) {
    }
    async auth(request, response, next, app) {
    }
}
exports.CompanyControllers = CompanyControllers;
