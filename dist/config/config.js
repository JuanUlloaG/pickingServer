"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    key: "miclaveultrasecreta123*",
    mongo: {
        conectionString: "mongodb://app-picking-dev2:NoyyhjzfxK7kXFbZ0Ca0VWbnA6FbHvpggpE9hRDRVkBBn58bglXM6xx81si6wffSDW9rDYmrVQg5fTQ7hffoEg==@app-picking-dev2.mongo.cosmos.azure.com:10255/picking-dev?ssl=true&appName=@app-picking-dev2@",
        user: "app-picking-dev2",
        pass: "NoyyhjzfxK7kXFbZ0Ca0VWbnA6FbHvpggpE9hRDRVkBBn58bglXM6xx81si6wffSDW9rDYmrVQg5fTQ7hffoEg==",
        dbname: "picking-dev2"
    },
    errorCodes: {
        "E_0": { code: 0, desc: "Error al actualizar el estatus del usuario" },
        "E_1": { code: 1, desc: "Usuario o Contraseña incorrecta" },
        "E_2": { code: 2, desc: "Usuario no registrado" },
        "E_3": { code: 3, desc: "Error al Buscar usuario" },
        "E_4": { code: 4, desc: "Error en proceso de logeo" },
    },
    profilesApp: ["2", "3"],
    profilesOms: ["5", "4", "0", "6"],
    sqlConfig: {
        server: 'srvreportes01pd.database.windows.net',
        authentication: {
            type: 'default',
            options: {
                userName: 'sessionadmin',
                password: 'SR2020..Pdxyz..' //update me
            }
        },
        options: {
            validateBulkLoadParameters: true,
            // If you are on Microsoft Azure, you need encryption:
            encrypt: true,
            database: 'SRReportPrimeDEV' //update me
        },
    },
    paramEvent: {
        "CuentaCliente": "companyName",
        "OrderTrabajo": "",
        "Estado": "",
        "FechaEventoOMS": new Date()
    },
    productTemplate: {
        "id": "",
        "barcode": "",
        "product": "",
        "units": 0,
        "location": 0,
        "description": "",
        "name": "",
        "image": ""
    },
    orderTemplate: {
        "orderNumber": "",
        "products": [Array],
        "client": {
            "rut": "",
            "name": "",
            "address": "",
            "rutTercero": "",
            "comuna": "",
            "ciudad": "",
            "long": "",
            "lat": "",
            "email": "",
            "cellphone": ""
        },
        "channel": "",
        "service": 1,
        "date": ""
    },
    ordersTemplate: {
        "uid": "",
        "orders": [Array]
    }
};
