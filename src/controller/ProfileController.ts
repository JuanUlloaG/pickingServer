import { NextFunction, Request, Response } from "express";
const jwt = require('jsonwebtoken');
import mongoose from "mongoose";
const { initDB, insertDB, findOneDB, findDocuments, insertManyDB } = require("../config/db");
import Profile from "../entity/Profile";
import { schemaProfile } from "../entity/Profile";
import Ajv from 'ajv';
import { ObjectId } from "mongodb";
var ajv = new Ajv({ allErrors: true });



export class ProfilesController {

    // private userRepository = getRepository(User);

    async all(request: Request, response: Response, next: NextFunction, app: any) {
        try {
            const { company } = request.body
            let query: object = {};
            let populate: string = '';
            if (company) {
                query = { 'key': { "$ne": 0 } }
            }

            findDocuments(Profile, query, "", {}, populate, '', 0, null, null).then((result: any) => {
                response.json({
                    message: 'Listado de perfiles',
                    data: result,
                    success: true
                });
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

    async one(request: Request, response: Response, next: NextFunction, app: any) {
        return null
    }

    async save(request: Request, response: Response, next: NextFunction, app: any) {
        const { profiles } = request.body
        let profilesToSave: Array<{ key: string, description: string }> = []
        let profilesNotSave: Array<{ key: string, description: string }> = []
        profiles.map((profile: { key: string, description: string }) => {
            profilesToSave.push(profile)
        })

        if (profilesToSave.length > 0) {
            insertManyDB(Profile, profilesToSave).then((result: any) => {
                response.json({
                    message: 'Se crearon los estados de forma exitosa',
                    data: result,
                    profileNotSave: profilesNotSave,
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
                data: profilesNotSave,
                success: false
            });
        }

    }

    async remove(request: Request, response: Response, next: NextFunction, app: any) {

    }
}