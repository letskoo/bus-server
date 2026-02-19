"use strict";
// src/driver/driver.controller.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverController = void 0;
const common_1 = require("@nestjs/common");
const driver_service_1 = require("./driver.service");
const update_location_dto_1 = require("./dto/update-location.dto");
let DriverController = class DriverController {
    constructor(driverService) {
        this.driverService = driverService;
    }
    upsertLocation(dto) {
        return this.driverService.upsertLocation(dto);
    }
    getLocation(routeId) {
        return this.driverService.getLocation(Number(routeId));
    }
};
exports.DriverController = DriverController;
__decorate([
    (0, common_1.Post)('location'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_location_dto_1.UpdateLocationDto]),
    __metadata("design:returntype", void 0)
], DriverController.prototype, "upsertLocation", null);
__decorate([
    (0, common_1.Get)('location/:routeId'),
    __param(0, (0, common_1.Param)('routeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DriverController.prototype, "getLocation", null);
exports.DriverController = DriverController = __decorate([
    (0, common_1.Controller)('driver'),
    __metadata("design:paramtypes", [driver_service_1.DriverService])
], DriverController);
//# sourceMappingURL=driver.controller.js.map