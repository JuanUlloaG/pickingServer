"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const rutasProtegidas = express.Router();
const { jwt, decoded } = require('jsonwebtoken');
// import { IGetUserAuthInfoRequest } from "../types/index"
module.exports = {
    validation: function (req, res, next, app) {
        if (req.path === "/users/auth") {
            next();
        }
        else {
            const token = req.headers['access-token'];
            if (token) {
                jwt.verify(token, app.get('llave'), (err, decoded) => {
                    if (err) {
                        return res.json({ message: 'Token inválida' });
                    }
                    else {
                        req.decoded = decoded;
                        return next();
                    }
                });
            }
            else {
                return res.send({
                    message: 'Token no proveída.'
                });
            }
        }
    }
};
