"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config");
const tedious_1 = require("tedious");
module.exports = {
    initDB: function (res, req) {
        return new Promise(function (resolve, reject) {
            try {
                mongoose_1.default.connect(config_1.config.mongo.conectionString, { useUnifiedTopology: true, connectTimeoutMS: 10000, useNewUrlParser: true }, (err) => {
                    if (err) {
                        reject(err.message);
                    }
                    else {
                        let cont = 0;
                        mongoose_1.default.connection.db.listCollections().toArray((error, collections) => {
                            if (error)
                                reject(error.message);
                            if (collections) {
                                resolve(true);
                            }
                        });
                    }
                });
            }
            catch (error) {
                console.log(error.message);
            }
        });
    },
    conectionToSql: function (res, req) {
        return new Promise(function (resolve, reject) {
            try {
                var connection;
                connection = new tedious_1.Connection(config_1.config.sqlConfig);
                connection.on('connect', function (err) {
                    if (err) {
                        reject(err.message);
                    }
                    else {
                        console.log("Connected To Sql");
                        resolve(true);
                    }
                });
            }
            catch (error) {
                console.log(error.message);
            }
        });
    },
    executeStatement: function executeQuery() {
    },
    executeProcedure: function (procedureName, params) {
        return new Promise(function (resolve, reject) {
            try {
                var conections = {};
                var request = {};
                params.map((data, index) => {
                    var connection;
                    conections[index] = new tedious_1.Connection(config_1.config.sqlConfig);
                    // connection = new Connection(config.sqlConfig);
                    conections[index].connect(function (errConn) {
                        if (errConn) {
                            conections[index].close();
                            reject(errConn);
                        }
                        request[index] = new tedious_1.Request(procedureName, function (err) {
                            if (err) {
                                conections[index].close();
                                reject(err);
                            }
                        });
                        let Keys = Object.keys(data);
                        Keys.map((key) => {
                            if (key == "FecAgendada" || key == "InicioPicking" || key == "FinPicking" || key == "FechaCompraCliente" || key == "FechaEventoOMS" || key == "FechaEntregaReal" || key == "FechaRecepcionDelivery") {
                                request[index].addParameter(key, tedious_1.TYPES.DateTime, data[key]);
                            }
                            else if (key == "UnSolicitadas" || key == "EsReagendamiento") {
                                request[index].addParameter(key, tedious_1.TYPES.Int, data[key]);
                            }
                            else {
                                request[index].addParameter(key, tedious_1.TYPES.VarChar, data[key]);
                            }
                        });
                        conections[index].callProcedure(request[index]);
                        request[index].on('doneProc', function () {
                            conections[index].close();
                        });
                    });
                });
                resolve(true);
            }
            catch (error) {
                console.log(error);
            }
        });
    },
    insertDB: function (form, obj) {
        return new Promise(function (resolve, reject) {
            const newObj = new form(obj);
            newObj
                .save(function (err, document) {
                if (err)
                    reject(err.message);
                else {
                    resolve(document);
                }
            });
        });
    },
    insertManyDB: async function (form, obj) {
        return new Promise(function (resolve, reject) {
            form.insertMany(obj, function (err, docs) {
                if (err) {
                    reject(err.message);
                }
                else {
                    resolve(docs);
                }
            });
        });
    },
    findOneDB: async function (form, query, select, sort, populate, req, res) {
        return new Promise(function (resolve, reject) {
            form
                .findById(query)
                .sort(sort)
                .select(select)
                .populate(populate)
                .exec(function (err, document) {
                if (err)
                    reject(err.message);
                else {
                    resolve(document);
                }
            });
        });
    },
    findDocuments: async function (form, query, select, sort, populate, fields, limit, req, res) {
        return new Promise(function (resolve, reject) {
            form
                .find(query)
                .sort(sort)
                .select(select)
                .limit(limit)
                .populate(populate)
                .exec(function (err, documents) {
                if (err)
                    reject(err.message);
                else {
                    resolve(documents);
                }
            });
        });
    },
    findDocumentsOrdesPopulate: async function (form, query, select, sort, populate, fields, limit, req, res) {
        return new Promise(function (resolve, reject) {
            form
                .find(query)
                .sort(sort)
                .select(select)
                .limit(limit)
                .populate(populate)
                .exec(function (err, documents) {
                if (err)
                    reject(err.message);
                else {
                    resolve(documents);
                }
            });
        });
    },
    findDocumentsMultiPopulate: async function (form, query, select, sort, populate, populate1, populate2, populate3, populate4, populate5, populate6, fields, limit, req, res) {
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
                .exec(function (err, documents) {
                if (err)
                    reject(err.message);
                else {
                    resolve(documents);
                }
            });
        });
    },
    findOneAndUpdateDB: async function (form, query, update, req, res) {
        return new Promise(function (resolve, reject) {
            try {
                form
                    .findOneAndUpdate(query, { $set: update }, { new: true })
                    .exec(function (err, documents) {
                    if (err)
                        reject(err.message);
                    else {
                        resolve(documents);
                    }
                });
            }
            catch (err) {
                reject(err.message);
            }
        });
    },
    updateManyDB: async function (form, query, update, req, res) {
        return new Promise(function (resolve, reject) {
            form
                .updateMany(query, { $set: update }, { multi: true })
                .exec(function (err, documents) {
                if (err)
                    reject(err.message);
                else {
                    resolve(documents);
                }
            });
        });
    },
};
