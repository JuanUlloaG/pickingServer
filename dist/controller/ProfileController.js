"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilesController = void 0;
const jwt = require('jsonwebtoken');
const { initDB, insertDB, findOneDB, findDocuments, insertManyDB } = require("../config/db");
const Profile_1 = __importDefault(require("../entity/Profile"));
const ajv_1 = __importDefault(require("ajv"));
var ajv = new ajv_1.default({ allErrors: true });
class ProfilesController {
    // private userRepository = getRepository(User);
    async all(request, response, next, app) {
        try {
            const { company } = request.body;
            let query = {};
            let populate = '';
            if (company) {
                query = { 'key': { "$ne": 0 } };
            }
            findDocuments(Profile_1.default, query, "", {}, populate, '', 0, null, null).then((result) => {
                response.json({
                    message: 'Listado de perfiles',
                    data: result,
                    success: true
                });
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
    async one(request, response, next, app) {
        return null;
    }
    async save(request, response, next, app) {
        const { profiles } = request.body;
        let profilesToSave = [];
        let profilesNotSave = [];
        profiles.map((profile) => {
            profilesToSave.push(profile);
        });
        if (profilesToSave.length > 0) {
            insertManyDB(Profile_1.default, profilesToSave).then((result) => {
                response.json({
                    message: 'Se crearon los estados de forma exitosa',
                    data: result,
                    profileNotSave: profilesNotSave,
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
                data: profilesNotSave,
                success: false
            });
        }
    }
    async remove(request, response, next, app) {
    }
}
exports.ProfilesController = ProfilesController;
