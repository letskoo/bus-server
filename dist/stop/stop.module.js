"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StopModule = void 0;
const common_1 = require("@nestjs/common");
const stop_controller_1 = require("./stop.controller");
const stop_service_1 = require("./stop.service");
let StopModule = class StopModule {
};
exports.StopModule = StopModule;
exports.StopModule = StopModule = __decorate([
    (0, common_1.Module)({
        controllers: [stop_controller_1.StopController],
        providers: [stop_service_1.StopService],
    })
], StopModule);
//# sourceMappingURL=stop.module.js.map