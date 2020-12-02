import { NextFunction, Request, Response } from "express";
const jwt = require('jsonwebtoken');
const { insertDB, insertManyDB, findDocuments } = require("../config/db")
import State from "../entity/State";
import { schemaState } from "../entity/State";
import Ajv from 'ajv';
import { ObjectId } from "mongodb";
var ajv = new Ajv({ allErrors: true });

try {
    var validate = ajv.compile(schemaState)
} catch (error) {
}


export class StateControllers {

    // private userRepository = getRepository(User);

    async findBy(request: Request, response: Response, next: NextFunction, app: any) {
        let queryState = { $or: [{ "key": 0 }, { "key": 2 }] }
        findDocuments(State, queryState, "", {}, '', '', 0, null, null).then((findResult: Array<any>) => {
            response.json({
                message: findResult,
                success: false
            });
        }).catch((err: Error) => {
            response.json({
                message: err.message,
                success: false
            });
        });

    }

    async one(request: Request, response: Response, next: NextFunction, app: any) {
        return null
    }

    comparer(otherArray: any) {
        return function (current: any) {
            return otherArray.filter(function (other: any) {
                return other.key == current.key
            }).length == 0;
        }
    }

    async save(request: Request, response: Response, next: NextFunction, app: any) {
        const { states } = request.body
        let statesToSave: Array<{ key: string, desc: string }> = []
        let statesNotSave: Array<{ key: string, desc: string }> = []
        let keys: Array<any> = []
        states.map((state: { key: string, desc: string }) => {
            keys.push(state.key)
            let _state = state
            let valid = validate(_state)
            if (valid) statesToSave.push(_state)
            else { statesNotSave.push(_state) }
        })

        if (statesToSave.length > 0) {
            findDocuments(State, { 'key': { '$in': keys } }, "", {}, '', '', 0, null, null).then((findResult: Array<any>) => {
                if (findResult) {
                    let statesdef: Array<any> = []
                    findResult.map((state) => { statesdef.push(state.key) })
                    let finishStates = statesToSave.filter((state) => !statesdef.includes(state.key.toString()))
                    let statesNoSaved = statesToSave.filter((state) => statesdef.includes(state.key.toString()))
                    if (finishStates.length > 0) {
                        insertManyDB(State, finishStates).then((result: any) => {
                            response.json({
                                message: `Se crearon los estados de forma exitosa`,
                                data: result,
                                stateNotSave: statesNoSaved,
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
                            message: `Los estados que intentas agregar ya existen`,
                            success: false,
                            data: statesNoSaved
                        });
                    }
                } else {
                    insertManyDB(State, statesToSave).then((result: any) => {
                        response.json({
                            message: 'Se crearon los estados de forma exitosa',
                            data: result,
                            stateNotSave: statesNotSave,
                            success: true
                        });
                    }).catch((err: Error) => {
                        response.json({
                            message: err.message,
                            success: false
                        });
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
                message: "Los estados no cumplen con los requisitos",
                data: statesNotSave,
                success: false
            });
        }

    }

    async remove(request: Request, response: Response, next: NextFunction, app: any) {

    }
}