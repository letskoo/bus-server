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
exports.TripService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TripService = class TripService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapType(input) {
        const v = String(input || '').toUpperCase();
        // 외부 입력 호환
        if (v === 'GO')
            return client_1.TripType.PICKUP;
        if (v === 'RETURN')
            return client_1.TripType.DROPOFF;
        // 정식 enum
        if (v === 'PICKUP')
            return client_1.TripType.PICKUP;
        if (v === 'DROPOFF')
            return client_1.TripType.DROPOFF;
        throw new common_1.BadRequestException('type must be one of: GO, RETURN, PICKUP, DROPOFF');
    }
    async start(routeId, type) {
        if (!routeId)
            throw new common_1.BadRequestException('routeId is required');
        const tripType = this.mapType(type);
        // route -> organizationId 추론 (Trip 스키마에서 organizationId 필수)
        const route = await this.prisma.route.findUnique({
            where: { id: routeId },
            select: { organizationId: true },
        });
        if (!(route === null || route === void 0 ? void 0 : route.organizationId)) {
            throw new common_1.BadRequestException('invalid routeId (cannot resolve organizationId)');
        }
        const exists = await this.prisma.trip.findFirst({
            where: { routeId, type: tripType, status: client_1.TripStatus.RUNNING },
            select: { id: true },
        });
        if (exists) {
            throw new common_1.ConflictException('Trip already running for this route and type');
        }
        return this.prisma.trip.create({
            data: {
                organizationId: route.organizationId,
                routeId,
                type: tripType,
                status: client_1.TripStatus.RUNNING,
            },
        });
    }
    async end(tripId) {
        const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
        if (!trip)
            throw new common_1.BadRequestException('trip not found');
        if (trip.status === client_1.TripStatus.ENDED)
            return trip;
        return this.prisma.trip.update({
            where: { id: tripId },
            data: { status: client_1.TripStatus.ENDED, endedAt: new Date() },
        });
    }
    async getActive(routeId, type) {
        if (!routeId)
            throw new common_1.BadRequestException('routeId is required');
        const where = { routeId, status: client_1.TripStatus.RUNNING };
        if (type)
            where.type = this.mapType(type);
        return this.prisma.trip.findFirst({ where });
    }
};
exports.TripService = TripService;
exports.TripService = TripService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TripService);
//# sourceMappingURL=trip.service.js.map