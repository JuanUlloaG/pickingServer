"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeController = void 0;
const jwt = require('jsonwebtoken');
const { initDB, insertDB, insertManyDB, findDocuments } = require("../config/db");
class HomeController {
    async index(request, response, next, app) {
        response.json({
            message: 'Picking server on! happy hacking 👨🏾‍💻',
            success: true
        });
    }
    async localByUser(request, response, next, app) {
    }
    async one(request, response, next, app) {
    }
    /*
      Metodo que recibe un array de ordenes para guardarlas en la base de datos
   */
    async save(request, response, next, app) {
    }
    async remove(request, response, next, app) {
    }
    async auth(request, response, next, app) {
    }
}
exports.HomeController = HomeController;
