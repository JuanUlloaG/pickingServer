import express, { request, response } from 'express';
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
import { config } from "./config/config";
import { Request, Response, NextFunction } from "express";
import Company from "./entity/Company";
import User from "./entity/User";
import Orders from "./entity/Orders";
import OrderBags from "./entity/OrderBags";
import { Routes } from "./routes";
const validation = require("./middleware/middleware")
import { OrdersController } from "./controller/OrdersController";
const { initDB, insertDB, conectionToSql, executeStatement } = require("./config/db")
const cors = require('cors')
import { createMailer } from "./controller/MailController";
let app = express();
let orderController = new OrdersController()

app.use(cors());
// 1
app.set('key', config.key);
// 2

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin, X-Requested-With, Content-Type, Accept, content-type, application/json, Authorization');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.use(bodyParser.urlencoded({ extended: true }));
// 3
app.use(bodyParser.json());

function checkUser(req: Request, res: Response, next: NextFunction) {
    if (req.path === "/users/auth" || req.path === "/users" || req.path === "/company" || req.path === "/order/save" || req.path === "/shop/save" || req.path === "/" || req.path === "/ordersTest" || req.path === "/orders/vtex") {
        next();
    } else {
        const token = (<any>req).headers['access-token'];
        if (token) {
            jwt.verify(token, app.get('key'), (err: any, decoded: any) => {
                if (err) {
                    return res.json({ message: 'Token inválida' });
                } else {
                    (<any>req).decoded = decoded;
                    next();
                }
            });
        } else {
            res.send({
                message: 'Token no proveída.'
            });
        }
    }
}


app.all("*", checkUser)

Routes.forEach(route => {
    (app as any)[route.method](route.route, (req: Request, res: Response, next: NextFunction) => {
        const result = (new (route.controller as any))[route.action](req, res, next, app);
        if (result instanceof Promise) {
            result.then(result => result !== null && result !== undefined ? res.status(200).send(result) : undefined);

        } else if (result !== null && result !== undefined) {
            res.status(500).json(result);
        }
    });
});

// createMailer()


// conectionToSql().then((result: any) => {
// console.log("Picking server on! happy hacking 👨🏾‍💻")
initDB().then((result: any) => {
    app.listen(3000, () => {
        console.log("Picking server on! happy hacking 👨🏾‍💻")
        orderController.getOrdersClients()
    })
}).catch((err: Error) => {
    console.log(err)
});
// }).catch((err: Error) => {
//     console.log(err)
// });






