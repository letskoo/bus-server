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
exports.ShareController = void 0;
const common_1 = require("@nestjs/common");
const share_service_1 = require("./share.service");
let ShareController = class ShareController {
    constructor(shareService) {
        this.shareService = shareService;
    }
    // 30분 토큰 발급(원장/기사 공용)
    createToken(body) {
        return this.shareService.createToken(Number(body.routeId), body.ttlMinutes ? Number(body.ttlMinutes) : undefined, body.driverId ? Number(body.driverId) : undefined);
    }
    // 토큰으로 조회(만료 시 차단)
    getShare(token) {
        return this.shareService.getShareByToken(token);
    }
    // 내부(관리자) 디버깅: routeId로 강제 조회(필요하면 쓰고, 프론트엔 안 붙여도 됨)
    getShareByRoute(routeId) {
        return this.shareService.getShareData(routeId);
    }
};
exports.ShareController = ShareController;
__decorate([
    (0, common_1.Post)('token'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShareController.prototype, "createToken", null);
__decorate([
    (0, common_1.Get)(':token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShareController.prototype, "getShare", null);
__decorate([
    (0, common_1.Get)('route/:routeId'),
    __param(0, (0, common_1.Param)('routeId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ShareController.prototype, "getShareByRoute", null);
exports.ShareController = ShareController = __decorate([
    (0, common_1.Controller)('share'),
    __metadata("design:paramtypes", [share_service_1.ShareService])
], ShareController);
//# sourceMappingURL=share.controller.js.map