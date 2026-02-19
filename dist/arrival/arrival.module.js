"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrivalModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const notification_module_1 = require("../notification/notification.module");
const arrival_controller_1 = require("./arrival.controller");
const arrival_service_1 = require("./arrival.service");
let ArrivalModule = class ArrivalModule {
};
exports.ArrivalModule = ArrivalModule;
exports.ArrivalModule = ArrivalModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, notification_module_1.NotificationModule],
        controllers: [arrival_controller_1.ArrivalController],
        providers: [arrival_service_1.ArrivalService],
    })
], ArrivalModule);
//# sourceMappingURL=arrival.module.js.map