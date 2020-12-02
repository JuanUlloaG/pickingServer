"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const config_1 = require("./config/config");
const routes_1 = require("./routes");
const validation = require("./middleware/middleware");
const OrdersController_1 = require("./controller/OrdersController");
const { initDB, insertDB, conectionToSql, executeStatement } = require("./config/db");
const cors = require('cors');
let app = express_1.default();
let orderController = new OrdersController_1.OrdersController();
app.use(cors());
// 1
app.set('key', config_1.config.key);
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
function checkUser(req, res, next) {
    if (req.path === "/users/auth" || req.path === "/users" || req.path === "/company" || req.path === "/order/save" || req.path === "/shop/save" || req.path === "/" || req.path === "/ordersTest" || req.path === "/orders/vtex") {
        next();
    }
    else {
        const token = req.headers['access-token'];
        if (token) {
            jwt.verify(token, app.get('key'), (err, decoded) => {
                if (err) {
                    return res.json({ message: 'Token inválida' });
                }
                else {
                    req.decoded = decoded;
                    next();
                }
            });
        }
        else {
            res.send({
                message: 'Token no proveída.'
            });
        }
    }
}
app.all("*", checkUser);
routes_1.Routes.forEach(route => {
    app[route.method](route.route, (req, res, next) => {
        const result = (new route.controller)[route.action](req, res, next, app);
        if (result instanceof Promise) {
            result.then(result => result !== null && result !== undefined ? res.status(200).send(result) : undefined);
        }
        else if (result !== null && result !== undefined) {
            res.status(500).json(result);
        }
    });
});
// createMailer()
// conectionToSql().then((result: any) => {
// console.log("Picking server on! happy hacking 👨🏾‍💻")
initDB().then((result) => {
    app.listen(3000, () => {
        console.log("Picking server on! happy hacking 👨🏾‍💻");
        orderController.getOrdersClients();
    });
}).catch((err) => {
    console.log(err);
});
// }).catch((err: Error) => {
//     console.log(err)
// });
