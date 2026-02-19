"use strict";
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
exports.RouteController = void 0;
const common_1 = require("@nestjs/common");
const route_service_1 = require("./route.service");
const create_route_dto_1 = require("./dto/create-route.dto");
const update_route_dto_1 = require("./dto/update-route.dto");
let RouteController = class RouteController {
    constructor(routeService) {
        this.routeService = routeService;
    }
    create(body) {
        return this.routeService.create(body);
    }
    findAll(organizationId) {
        const parsed = organizationId ? Number(organizationId) : undefined;
        return this.routeService.findAll(parsed);
    }
    findOne(id) {
        return this.routeService.findOne(id);
    }
    update(id, body) {
        return this.routeService.update(id, body);
    }
    remove(id) {
        return this.routeService.remove(id);
    }
};
exports.RouteController = RouteController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_route_dto_1.CreateRouteDto]),
    __metadata("design:returntype", void 0)
], RouteController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RouteController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RouteController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_route_dto_1.UpdateRouteDto]),
    __metadata("design:returntype", void 0)
], RouteController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RouteController.prototype, "remove", null);
exports.RouteController = RouteController = __decorate([
    (0, common_1.Controller)('routes'),
    __metadata("design:paramtypes", [route_service_1.RouteService])
], RouteController);
//# sourceMappingURL=route.controller.js.map