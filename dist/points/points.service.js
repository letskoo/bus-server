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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PointsService = class PointsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBalance(organizationId) {
        const org = await this.prisma.organization.findUnique({
            where: { id: organizationId },
            select: { id: true, name: true, points: true },
        });
        if (!org)
            throw new common_1.NotFoundException('Organization not found');
        return org;
    }
    async adjust(organizationId, amount, reason) {
        const org = await this.prisma.organization.findUnique({
            where: { id: organizationId },
            select: { points: true },
        });
        if (!org)
            throw new common_1.NotFoundException('Organization not found');
        const next = org.points + amount;
        if (next < 0) {
            throw new Error('points cannot be negative');
        }
        const updated = await this.prisma.organization.update({
            where: { id: organizationId },
            data: { points: next },
            select: { id: true, name: true, points: true },
        });
        await this.prisma.pointTransaction.create({
            data: {
                organizationId,
                amount,
                balanceAfter: updated.points,
                reason,
            },
        });
        return updated;
    }
    async history(organizationId, take = 50) {
        return this.prisma.pointTransaction.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
            take,
        });
    }
};
exports.PointsService = PointsService;
exports.PointsService = PointsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PointsService);
//# sourceMappingURL=points.service.js.map