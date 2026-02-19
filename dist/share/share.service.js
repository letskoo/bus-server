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
exports.ShareService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const driver_service_1 = require("../driver/driver.service");
const trip_automation_service_1 = require("../trip/trip-automation.service");
const notification_constants_1 = require("../notification/notification.constants");
const crypto_1 = require("crypto");
let ShareService = class ShareService {
    constructor(prisma, driverService, tripAutomationService) {
        this.prisma = prisma;
        this.driverService = driverService;
        this.tripAutomationService = tripAutomationService;
    }
    distanceMeters(lat1, lon1, lat2, lon2) {
        const R = 6371000;
        const toRad = (v) => (v * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    etaMinutes(distMeters) {
        const ARRIVE_RADIUS_M = 80;
        if (distMeters <= ARRIVE_RADIUS_M)
            return 0;
        const SPEED_KMH = 25;
        const speedMps = (SPEED_KMH * 1000) / 3600;
        const etaSeconds = distMeters / speedMps;
        return Math.max(1, Math.ceil(etaSeconds / 60));
    }
    newToken() {
        return (0, crypto_1.randomBytes)(18).toString('base64url');
    }
    async createToken(routeId, ttlMinutes, driverId) {
        var _a;
        const route = await this.prisma.route.findUnique({
            where: { id: routeId },
            select: { id: true, organizationId: true, driverId: true },
        });
        if (!route)
            throw new common_1.NotFoundException('Route not found');
        const ttl = Math.max(1, Math.min(120, ttlMinutes !== null && ttlMinutes !== void 0 ? ttlMinutes : notification_constants_1.SHARE_TOKEN_TTL_MINUTES_DEFAULT));
        const expiresAt = new Date(Date.now() + ttl * 60 * 1000);
        const token = this.newToken();
        const resolvedDriverId = (_a = driverId !== null && driverId !== void 0 ? driverId : route.driverId) !== null && _a !== void 0 ? _a : null;
        await this.prisma.shareToken.create({
            data: {
                token,
                organizationId: route.organizationId,
                routeId: route.id,
                driverId: resolvedDriverId,
                expiresAt,
            },
        });
        return { token, expiresAt };
    }
    async getShareByToken(token) {
        const row = await this.prisma.shareToken.findUnique({
            where: { token },
            select: { routeId: true, expiresAt: true },
        });
        if (!row)
            throw new common_1.NotFoundException('Share token not found');
        if (row.expiresAt.getTime() < Date.now()) {
            throw new common_1.ForbiddenException('Share token expired');
        }
        return this.getShareData(row.routeId);
    }
    async getShareData(routeId) {
        const route = await this.prisma.route.findUnique({
            where: { id: routeId },
            select: { id: true, name: true, organizationId: true },
        });
        if (!route)
            throw new common_1.NotFoundException('Route not found');
        const trip = await this.prisma.trip.findFirst({
            where: { routeId, status: 'RUNNING' },
            orderBy: { startedAt: 'desc' },
            select: {
                id: true,
                status: true,
                type: true,
                startedAt: true,
                currentStopId: true,
            },
        });
        if (!trip)
            throw new common_1.NotFoundException('Running trip not found');
        const location = await this.driverService.findLocation(routeId);
        const nextStop = await this.tripAutomationService.getNextStop(trip.id, routeId);
        let etaMin = 0;
        if (location && nextStop) {
            const dist = this.distanceMeters(location.latitude, location.longitude, nextStop.latitude, nextStop.longitude);
            etaMin = this.etaMinutes(dist);
        }
        return { route, trip, location, nextStop, etaMin };
    }
};
exports.ShareService = ShareService;
exports.ShareService = ShareService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        driver_service_1.DriverService,
        trip_automation_service_1.TripAutomationService])
], ShareService);
//# sourceMappingURL=share.service.js.map