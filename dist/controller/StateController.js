"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateControllers = void 0;
const jwt = require('jsonwebtoken');
const { insertDB, insertManyDB, findDocuments } = require("../config/db");
const State_1 = __importDefault(require("../entity/State"));
const State_2 = require("../entity/State");
const ajv_1 = __importDefault(require("ajv"));
var ajv = new ajv_1.default({ allErrors: true });
try {
    var validate = ajv.compile(State_2.schemaState);
}
catch (error) {
}
class StateControllers {
    // private userRepository = getRepository(User);
    async findBy(request, response, next, app) {
        let queryState = { $or: [{ "key": 0 }, { "key": 2 }] };
        findDocuments(State_1.default, queryState, "", {}, '', '', 0, null, null).then((findResult) => {
            response.json({
                message: findResult,
                success: false
            });
        }).catch((err) => {
            response.json({
                message: err.message,
                success: false
            });
        });
    }
    async one(request, response, next, app) {
        return null;
    }
    comparer(otherArray) {
        return function (current) {
            return otherArray.filter(function (other) {
                return other.key == current.key;
            }).length == 0;
        };
    }
    async save(request, response, next, app) {
        const { states } = request.body;
        let statesToSave = [];
        let statesNotSave = [];
        let keys = [];
        states.map((state) => {
            keys.push(state.key);
            let _state = state;
            let valid = validate(_state);
            if (valid)
                statesToSave.push(_state);
            else {
                statesNotSave.push(_state);
            }
        });
        if (statesToSave.length > 0) {
            findDocuments(State_1.default, { 'key': { '$in': keys } }, "", {}, '', '', 0, null, null).then((findResult) => {
                if (findResult) {
                    let statesdef = [];
                    findResult.map((state) => { statesdef.push(state.key); });
                    let finishStates = statesToSave.filter((state) => !statesdef.includes(state.key.toString()));
                    let statesNoSaved = statesToSave.filter((state) => statesdef.includes(state.key.toString()));
                    if (finishStates.length > 0) {
                        insertManyDB(State_1.default, finishStates).then((result) => {
                            response.json({
                                message: `Se crearon los estados de forma exitosa`,
                                data: result,
                                stateNotSave: statesNoSaved,
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
                            message: `Los estados que intentas agregar ya existen`,
                            success: false,
                            data: statesNoSaved
                        });
                    }
                }
                else {
                    insertManyDB(State_1.default, statesToSave).then((result) => {
                        response.json({
                            message: 'Se crearon los estados de forma exitosa',
                            data: result,
                            stateNotSave: statesNotSave,
                            success: true
                        });
                    }).catch((err) => {
                        response.json({
                            message: err.message,
                            success: false
                        });
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
                message: "Los estados no cumplen con los requisitos",
                data: statesNotSave,
                success: false
            });
        }
    }
    async remove(request, response, next, app) {
    }
}
exports.StateControllers = StateControllers;
