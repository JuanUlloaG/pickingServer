import { UserController } from "./controller/UserController";
import { OrdersController } from "./controller/OrdersController";
import { CompanyControllers } from "./controller/CompanyController";
import { ShopController } from "./controller/ShopController";
import { HomeController } from "./controller/HomeController";
import { OrderBagsController } from "./controller/OrderBagsController";
import { StateControllers } from "./controller/StateController";
import { ServiceControllers } from "./controller/ServicesController";
import { ProfilesController } from "./controller/ProfileController";

export const Routes = [
    {
        method: "get",
        route: "/",
        controller: HomeController,
        action: "index"
    },
    {
        method: "get",
        route: "/users",
        controller: UserController,
        action: "all"
    },
    {
        method: "get",
        route: "/users/:id",
        controller: UserController,
        action: "one"
    },
    {
        method: "post",
        route: "/users",
        controller: UserController,
        action: "save"
    },
    {
        method: "post",
        route: "/users/list",
        controller: UserController,
        action: "all"
    },
    {
        method: "post",
        route: "/users/update",
        controller: UserController,
        action: "update"
    },
    {
        method: "post",
        route: "/users/delete",
        controller: UserController,
        action: "deleteUser"
    },
    {
        method: "post",
        route: "/users/updateState",
        controller: UserController,
        action: "active"
    },
    {
        method: "delete",
        route: "/users/:id",
        controller: UserController,
        action: "remove"
    },
    {
        method: "post",
        route: "/users/auth",
        controller: UserController,
        action: "auth"
    },
    {
        method: "post",
        route: "/orders",
        controller: OrdersController,
        action: "orders"
    },
    {
        method: "post",
        route: "/orders/vtex",
        controller: OrdersController,
        action: "getOrdersForVtex"
    },
    {
        method: "post",
        route: "/orders/upName",
        controller: OrdersController,
        action: "updateNamesInOrdes"
    },
    {
        method: "post",
        route: "/order/updatePrint",
        controller: OrdersController,
        action: "updatePrintedOrders"
    },
    {
        method: "get",
        route: "/ordersTest",
        controller: OrdersController,
        action: "ordersTest"
    },
    {
        method: "post",
        route: "/orders/list",
        controller: OrdersController,
        action: "ordersForOms"
    },
    {
        method: "post",
        route: "/orders/list/print",
        controller: OrdersController,
        action: "ordersForOmsPrintLabel"
    },
    {
        method: "post",
        route: "/orders/list/pickUp",
        controller: OrdersController,
        action: "ordersStorePickUp"
    },
    {
        method: "post",
        route: "/orders/list/cancelled",
        controller: OrdersController,
        action: "ordersForOmsCancelledSearch"
    },
    {
        method: "post",
        route: "/orders/list/cancelled/export",
        controller: OrdersController,
        action: "ordersForOmsCancelledExport"
    },
    {
        method: "post",
        route: "/orders/list/view",
        controller: OrdersController,
        action: "ordersForOmsViewSearch"
    },
    {
        method: "post",
        route: "/orders/list/incident",
        controller: OrdersController,
        action: "ordersForOmsFindIncident"
    },
    {
        method: "post",
        route: "/orders/list/reassign",
        controller: OrdersController,
        action: "ordersForOmsFindReassing"
    },
    {
        method: "post",
        route: "/orders/list/reset",
        controller: OrdersController,
        action: "ordersForOmsFindReset"
    },
    {
        method: "post",
        route: "/orders/list/resetSearch",
        controller: OrdersController,
        action: "ordersForOmsFindSearchReset"
    },
    {
        method: "post",
        route: "/orders/list/homeSearch",
        controller: OrdersController,
        action: "ordersForOmsFindSearchHome"
    },
    {
        method: "post",
        route: "/orders/detail",
        controller: OrdersController,
        action: "getOrderDetailById"
    },
    {
        method: "post",
        route: "/orders/detail/number",
        controller: OrdersController,
        action: "getOrderDetailBynumber"
    },
    {
        method: "post",
        route: "/orders/save",
        controller: OrdersController,
        action: "save"
    },
    {
        method: "post",
        route: "/orders/take",
        controller: OrdersController,
        action: "picked"
    },
    {
        method: "post",
        route: "/orders/leave",
        controller: OrdersController,
        action: "leave"
    },
    {
        method: "post",
        route: "/order/update/state",
        controller: OrdersController,
        action: "updateState"
    },
    {
        method: "post",
        route: "/order/update/logistic",
        controller: OrdersController,
        action: "updateLogistic"
    },
    {
        method: "post",
        route: "/order/update/shop",
        controller: OrdersController,
        action: "updateReassignShop"
    },
    {
        method: "get",
        route: "/orders/delivery",
        controller: OrdersController,
        action: "ordersToDelivery"
    },
    {
        method: "get",
        route: "/orders/prestashop/clients",
        controller: OrdersController,
        action: "getOrdersClients"
    },
    {
        method: "post",
        route: "/account",
        controller: CompanyControllers,
        action: "save"
    },
    {
        method: "post",
        route: "/account/list",
        controller: CompanyControllers,
        action: "all"
    },
    {
        method: "post",
        route: "/account/update",
        controller: CompanyControllers,
        action: "update"
    },
    {
        method: "post",
        route: "/account/delete",
        controller: CompanyControllers,
        action: "deleteAccount"
    },
    {
        method: "post",
        route: "/shop/list",
        controller: ShopController,
        action: "all"
    },
    {
        method: "post",
        route: "/shop",
        controller: ShopController,
        action: "save"
    },
    {
        method: "post",
        route: "/shop/update",
        controller: ShopController,
        action: "shopUpdate"
    },
    {
        method: "post",
        route: "/shop/delete",
        controller: ShopController,
        action: "shopDelete"
    },
    {
        method: "post",
        route: "/shop/user",
        controller: ShopController,
        action: "localByUser"
    },
    {
        method: "post",
        route: "/orderBags/save",
        controller: OrderBagsController,
        action: "save"
    },
    {
        method: "post",
        route: "/orderBags/list",
        controller: OrderBagsController,
        action: "listBags"
    },
    {
        method: "post",
        route: "/orderBags/getNumber",
        controller: OrderBagsController,
        action: "getNumber"
    },
    {
        method: "post",
        route: "/orderBags/list/all",
        controller: OrderBagsController,
        action: "listAllBags"
    },
    {
        method: "post",
        route: "/orderBags/listTake",
        controller: OrderBagsController,
        action: "listBagsforTake"
    },
    {
        method: "post",
        route: "/orderBags/update",
        controller: OrderBagsController,
        action: "updateBag"
    },
    {
        method: "post",
        route: "/orderBags/update/received",
        controller: OrderBagsController,
        action: "updateBagReceived"
    },
    {
        method: "post",
        route: "/orderBags/update/storepickup",
        controller: OrderBagsController,
        action: "updateBagStoreDelivery"
    },
    {
        method: "post",
        route: "/bagNumber",
        controller: OrderBagsController,
        action: "getNumber"
    },
    {
        method: "post",
        route: "/state/save",
        controller: StateControllers,
        action: "save"
    },
    {
        method: "post",
        route: "/state/find",
        controller: StateControllers,
        action: "findBy"
    },
    {
        method: "post",
        route: "/profiles/save",
        controller: ProfilesController,
        action: "save"
    },
    {
        method: "post",
        route: "/profiles/list",
        controller: ProfilesController,
        action: "all"
    },
    {
        method: "post",
        route: "/services/save",
        controller: ServiceControllers,
        action: "save"
    },
    {
        method: "post",
        route: "/services/list",
        controller: ServiceControllers,
        action: "all"
    }
];