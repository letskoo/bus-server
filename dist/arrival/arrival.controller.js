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
exports.ArrivalController = void 0;
const common_1 = require("@nestjs/common");
const arrival_service_1 = require("./arrival.service");
const arrival_dto_1 = require("./dto/arrival.dto");
let ArrivalController = class ArrivalController {
    constructor(arrivalService) {
        this.arrivalService = arrivalService;
    }
    create(body) {
        return this.arrivalService.create(body);
    }
};
exports.ArrivalController = ArrivalController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [arrival_dto_1.ArrivalDto]),
    __metadata("design:returntype", void 0)
], ArrivalController.prototype, "create", null);
exports.ArrivalController = ArrivalController = __decorate([
    (0, common_1.Controller)('arrival'),
    __metadata("design:paramtypes", [arrival_service_1.ArrivalService])
], ArrivalController);
//# sourceMappingURL=arrival.controller.js.map