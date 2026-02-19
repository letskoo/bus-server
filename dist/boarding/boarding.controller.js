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
exports.BoardingController = void 0;
const common_1 = require("@nestjs/common");
const boarding_service_1 = require("./boarding.service");
const create_boarding_log_dto_1 = require("./dto/create-boarding-log.dto");
let BoardingController = class BoardingController {
    constructor(boardingService) {
        this.boardingService = boardingService;
    }
    create(body) {
        return this.boardingService.create(body);
    }
    findAll(routeId) {
        const parsed = routeId ? Number(routeId) : undefined;
        return this.boardingService.findAll(parsed);
    }
};
exports.BoardingController = BoardingController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_boarding_log_dto_1.CreateBoardingLogDto]),
    __metadata("design:returntype", void 0)
], BoardingController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('routeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BoardingController.prototype, "findAll", null);
exports.BoardingController = BoardingController = __decorate([
    (0, common_1.Controller)('boardings'),
    __metadata("design:paramtypes", [boarding_service_1.BoardingService])
], BoardingController);
//# sourceMappingURL=boarding.controller.js.map