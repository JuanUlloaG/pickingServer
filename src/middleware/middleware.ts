const express = require('express');
import {NextFunction, Request, Response} from "express";
const rutasProtegidas = express.Router(); 
const {jwt, decoded } = require('jsonwebtoken');
// import { IGetUserAuthInfoRequest } from "../types/index"


module.exports = {
    validation:function(req:Request, res:Response, next:NextFunction, app:any) {
     if(req.path === "/users/auth"){
        next();
    }else{
        const token = (<any>req).headers['access-token'];
        if (token) {
        jwt.verify(token, app.get('llave'), (err:any, decoded:any) => {      
            if (err) {
                return res.json({ message: 'Token inválida' });    
            } else {
                (<any>req).decoded = decoded;    
                return next();
            }
        });
        } else {
            return res.send({ 
                message: 'Token no proveída.' 
            });
        }
    }
        
    }
}