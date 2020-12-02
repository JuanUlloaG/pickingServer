import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { MongoError } from "mongodb";
import { config } from "./config";
import Conect, { Connection, Request as TediusRequest, TYPES, ConnectionConfig } from "tedious";



module.exports = {
    initDB: function (res: Response, req: Request) {
        return new Promise(function (resolve, reject) {
            try {
                mongoose.connect(config.mongo.conectionString, { useUnifiedTopology: true, connectTimeoutMS: 10000, useNewUrlParser: true }, (err: MongoError) => {
                    if (err) {
                        reject(err.message)
                    } else {
                        let cont = 0;
                        mongoose.connection.db.listCollections().toArray((error: any, collections: any) => {
                            if (error) reject(error.message)
                            if (collections) {
                                resolve(true)

                            }
                        })
                    }
                })
            } catch (error) {
                console.log(error.message)
            }
        })
    },
    conectionToSql: function (res: Response, req: Request) {
        return new Promise(function (resolve, reject) {
            try {
                var connection: any;
                connection = new Connection(config.sqlConfig);
                connection.on('connect', function (err: Error) {
                    if (err) {
                        reject(err.message)
                    } else {
                        console.log("Connected To Sql");
                        resolve(true)
                    }
                });
            } catch (error) {
                console.log(error.message)
            }
        })
    },
    executeStatement: function executeQuery() {

    },
    executeProcedure: function (procedureName: string, params: Array<any>) {
        return new Promise(function (resolve, reject) {
            try {
                var conections: any = {}
                var request: any = {}
                params.map((data, index) => {
                    var connection: any;
                    conections[index] = new Connection(config.sqlConfig)
                    // connection = new Connection(config.sqlConfig);
                    conections[index].connect(function (errConn: Error) {
                        if (errConn) {
                            conections[index].close();
                            reject(errConn)
                        }

                        request[index] = new TediusRequest(procedureName, function (err: Error) {
                            if (err) {
                                conections[index].close();
                                reject(err)
                            }
                        });

                        let Keys = Object.keys(data)
                        Keys.map((key: any) => {
                            if (key == "FecAgendada" || key == "InicioPicking" || key == "FinPicking" || key == "FechaCompraCliente" || key == "FechaEventoOMS" || key == "FechaEntregaReal" || key == "FechaRecepcionDelivery") {
                                request[index].addParameter(key, TYPES.DateTime, data[key])
                            } else if (key == "UnSolicitadas" || key == "EsReagendamiento") {
                                request[index].addParameter(key, TYPES.Int, data[key])
                            } else {
                                request[index].addParameter(key, TYPES.VarChar, data[key])
                            }
                        })
                        conections[index].callProcedure(request[index]);
                        request[index].on('doneProc', function () {
                            conections[index].close();
                        });
                    });
                })
                resolve(true)
            } catch (error) {
                console.log(error)
            }
        })
    },
    
    insertDB: function (form: any, obj: any) {
        return new Promise(function (resolve, reject) {
            const newObj = new form(obj)
            newObj
                .save(function (err: Error, document: Document) {
                    if (err) reject(err.message)
                    else {
                        resolve(document)
                    }
                })
        })
    },
    insertManyDB: async function (form: any, obj: any) {
        return new Promise(function (resolve, reject) {
            form.insertMany(obj, function (err: any, docs: any) {
                if (err) {
                    reject(err.message)
                }
                else {
                    resolve(docs)
                }
            })
        })
    },
    findOneDB: async function (form: any, query: any, select: string, sort: any, populate: any, req: any, res: any) {
        return new Promise(function (resolve, reject) {
            form
                .findById(query)
                .sort(sort)
                .select(select)
                .populate(populate)
                .exec(function (err: Error, document: Document) {
                    if (err) reject(err.message)
                    else {
                        resolve(document)
                    }
                })
        })
    },
    findDocuments: async function (form: any, query: any, select: string, sort: any, populate: string, fields: string, limit: number, req: any, res: any) {
        return new Promise(function (resolve, reject) {
            form
                .find(query)
                .sort(sort)
                .select(select)
                .limit(limit)
                .populate(populate)
                .exec(function (err: Error, documents: Document) {
                    if (err) reject(err.message)
                    else {
                        resolve(documents)
                    }
                })
        })
    },
    findDocumentsOrdesPopulate: async function (form: any, query: any, select: string, sort: any, populate: object, fields: string, limit: number, req: any, res: any) {
        return new Promise(function (resolve, reject) {
            form
                .find(query)
                .sort(sort)
                .select(select)
                .limit(limit)
                .populate(populate)
                .exec(function (err: Error, documents: Document) {
                    if (err) reject(err.message)
                    else {
                        resolve(documents)
                    }
                })
        })
    },
    findDocumentsMultiPopulate: async function (form: any, query: any, select: string, sort: any, populate: object, populate1: object, populate2: object, populate3: object, populate4: object, populate5: object, populate6: object, fields: string, limit: number, req: any, res: any) {
        return new Promise(function (resolve, reject) {
            form
                .find(query)
                .sort(sort)
                .select(select)
                .limit(limit)
                .populate(populate)
                .populate(populate1)
                .populate(populate2)
                .populate(populate3)
                .populate(populate4)
                .populate(populate5)
                .populate(populate6)
                .exec(function (err: Error, documents: Document) {
                    if (err) reject(err.message)
                    else {
                        resolve(documents)
                    }
                })
        })
    },
    findOneAndUpdateDB: async function (form: any, query: any, update: any, req: any, res: any) {
        return new Promise(function (resolve, reject) {
            try {
                form
                    .findOneAndUpdate(
                        query,
                        { $set: update },
                        { new: true }
                    )
                    .exec(function (err: Error, documents: any) {
                        if (err) reject(err.message)
                        else {
                            resolve(documents)
                        }
                    })
            }
            catch (err) {
                reject(err.message)
            }
        })
    },
    updateManyDB: async function (form: any, query: any, update: any, req: any, res: any) {
        return new Promise(function (resolve, reject) {
            form
                .updateMany(
                    query,
                    { $set: update },
                    { multi: true }
                )
                .exec(function (err: Error, documents: any) {
                    if (err) reject(err.message)
                    else {
                        resolve(documents)
                    }
                })
        })
    },
}

