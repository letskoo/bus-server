"use strict";
// src/stop/stop.controller.ts
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
exports.StopController = void 0;
const common_1 = require("@nestjs/common");
const stop_service_1 = require("./stop.service");
const create_stop_dto_1 = require("./dto/create-stop.dto");
const update_stop_dto_1 = require("./dto/update-stop.dto");
let StopController = class StopController {
    constructor(stopService) {
        this.stopService = stopService;
    }
    create(createStopDto) {
        return this.stopService.create(createStopDto);
    }
    findAll() {
        return this.stopService.findAll();
    }
    findOne(id) {
        return this.stopService.findOne(+id);
    }
    update(id, updateStopDto) {
        return this.stopService.update(+id, updateStopDto);
    }
    remove(id) {
        return this.stopService.remove(+id);
    }
};
exports.StopController = StopController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_stop_dto_1.CreateStopDto]),
    __metadata("design:returntype", void 0)
], StopController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StopController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StopController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_stop_dto_1.UpdateStopDto]),
    __metadata("design:returntype", void 0)
], StopController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StopController.prototype, "remove", null);
exports.StopController = StopController = __decorate([
    (0, common_1.Controller)('stops'),
    __metadata("design:paramtypes", [stop_service_1.StopService])
], StopController);
//# sourceMappingURL=stop.controller.js.map