import { NextFunction, Request, Response } from "express";
const jwt = require('jsonwebtoken');
const { insertDB, insertManyDB, findDocuments } = require("../config/db")
import Service from "../entity/Services";
import { schemaState } from "../entity/Services";
import Ajv from 'ajv';
import { ObjectId } from "mongodb";
var ajv = new Ajv({ allErrors: true });

try {
    var validate = ajv.compile(schemaState)
} catch (error) {
}


export class ServiceControllers {

    // private userRepository = getRepository(User);

    async all(request: Request, response: Response, next: NextFunction, app: any) {
        findDocuments(Service, {}, "", {}, '', '', 0, null, null).then((findResult: Array<any>) => {
            response.json({
                data: findResult,
                message: "Listado de Servicios",
                success: true
            });
        }).catch((err: Error) => {
            response.json({
                message: err.message,
                success: false
            });
        });

    }

    async saludotest(request: Request, response: Response, next: NextFunction, app: any) {
        return 'holasoyjuan'
    }


    async one(request: Request, response: Response, next: NextFunction, app: any) {
        return null
    }

    async save(request: Request, response: Response, next: NextFunction, app: any) {
        const { services } = request.body
        let servicesToSave: Array<{ key: string, desc: string, typeDelivery: string }> = []
        let servicesNotSave: Array<{ key: string, desc: string, typeDelivery: string }> = []
        services.map((service: { key: string, desc: string, typeDelivery: string }) => {
            let _service = service
            let valid = validate(_service)
            if (valid) {
                servicesToSave.push(_service)
            } else {
                servicesNotSave.push(_service)
            }
        })

        if (servicesToSave.length > 0) {
            insertManyDB(Service, servicesToSave).then((result: any) => {
                response.json({
                    message: 'Se crearon los servicios de forma exitosa',
                    data: result,
                    stateNotSave: servicesNotSave,
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
                message: "Los estados no cumplen con los requisitos",
                data: servicesNotSave,
                success: false
            });
        }

    }

    async remove(request: Request, response: Response, next: NextFunction, app: any) {

    }
}