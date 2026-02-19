"use strict";
// src/stop/stop.service.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StopService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StopService = class StopService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(data) {
        const { name, routeId, orderNo, lat, lng } = data;
        return this.prisma.stop.create({
            data: {
                name,
                routeId,
                orderNo,
                latitude: lat,
                longitude: lng,
            },
        });
    }
    findAll() {
        return this.prisma.stop.findMany({
            orderBy: { orderNo: 'asc' },
        });
    }
    findOne(id) {
        return this.prisma.stop.findUnique({
            where: { id },
        });
    }
    update(id, data) {
        const { name, orderNo, lat, lng } = data;
        return this.prisma.stop.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(orderNo !== undefined && { orderNo }),
                ...(lat !== undefined && { latitude: lat }),
                ...(lng !== undefined && { longitude: lng }),
            },
        });
    }
    remove(id) {
        return this.prisma.stop.delete({
            where: { id },
        });
    }
};
exports.StopService = StopService;
exports.StopService = StopService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StopService);
//# sourceMappingURL=stop.service.js.map