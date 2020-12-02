"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceControllers = void 0;
const jwt = require('jsonwebtoken');
const { insertDB, insertManyDB, findDocuments } = require("../config/db");
const Services_1 = __importDefault(require("../entity/Services"));
const Services_2 = require("../entity/Services");
const ajv_1 = __importDefault(require("ajv"));
var ajv = new ajv_1.default({ allErrors: true });
try {
    var validate = ajv.compile(Services_2.schemaState);
}
catch (error) {
}
class ServiceControllers {
    // private userRepository = getRepository(User);
    async all(request, response, next, app) {
        findDocuments(Services_1.default, {}, "", {}, '', '', 0, null, null).then((findResult) => {
            response.json({
                data: findResult,
                message: "Listado de Servicios",
                success: true
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
    async save(request, response, next, app) {
        const { services } = request.body;
        let servicesToSave = [];
        let servicesNotSave = [];
        services.map((service) => {
            let _service = service;
            let valid = validate(_service);
            if (valid) {
                servicesToSave.push(_service);
            }
            else {
                servicesNotSave.push(_service);
            }
        });
        if (servicesToSave.length > 0) {
            insertManyDB(Services_1.default, servicesToSave).then((result) => {
                response.json({
                    message: 'Se crearon los servicios de forma exitosa',
                    data: result,
                    stateNotSave: servicesNotSave,
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
                message: "Los estados no cumplen con los requisitos",
                data: servicesNotSave,
                success: false
            });
        }
    }
    async remove(request, response, next, app) {
    }
}
exports.ServiceControllers = ServiceControllers;
