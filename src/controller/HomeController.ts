import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
const jwt = require('jsonwebtoken');
const { initDB, insertDB, insertManyDB, findDocuments } = require("../config/db")


export class HomeController {

    async index(request: Request, response: Response, next: NextFunction, app: any) {
        response.json({
            message: 'Picking server on! happy hacking 👨🏾‍💻',
            success: true
        });
    }

    async localByUser(request: Request, response: Response, next: NextFunction, app: any) {
    }

    async one(request: Request, response: Response, next: NextFunction, app: any) {
    }

    /*
      Metodo que recibe un array de ordenes para guardarlas en la base de datos
   */
    async save(request: Request, response: Response, next: NextFunction, app: any) {
    }

    async remove(request: Request, response: Response, next: NextFunction, app: any) {
    }

    async auth(request: Request, response: Response, next: NextFunction, app: any) {
    }
}