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
var DriverService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let DriverService = DriverService_1 = class DriverService {
    constructor(prisma) {
        this.prisma = prisma;
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
    async createDriver(organizationId, name, phone) {
        return this.prisma.driver.create({
            data: { organizationId, name, phone },
        });
    }
    async listDrivers(organizationId) {
        return this.prisma.driver.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateDriver(id, data) {
        return this.prisma.driver.update({
            where: { id },
            data,
        });
    }
    async deleteDriver(id) {
        return this.prisma.driver.delete({ where: { id } });
    }
    async getNextStopForTrip(tripId, routeId) {
        const arrived = await this.prisma.stopEvent.findMany({
            where: { tripId, type: client_1.StopEventType.ARRIVE },
            select: { stopId: true },
        });
        const arrivedStopIds = arrived.map((a) => a.stopId);
        return this.prisma.stop.findFirst({
            where: {
                routeId,
                ...(arrivedStopIds.length > 0 ? { id: { notIn: arrivedStopIds } } : {}),
            },
            orderBy: { orderNo: 'asc' },
        });
    }
    scheduleAutoConfirm(tripId, routeId, stopId) {
        const key = `${tripId}:${stopId}`;
        if (DriverService_1.autoConfirmTimers.has(key))
            return;
        const t = setTimeout(async () => {
            DriverService_1.autoConfirmTimers.delete(key);
            await this.autoConfirmBoarding(tripId, routeId, stopId);
        }, 45000);
        DriverService_1.autoConfirmTimers.set(key, t);
    }
    async autoConfirmBoarding(tripId, routeId, stopId) {
        const arrive = await this.prisma.stopEvent.findFirst({
            where: { tripId, stopId, type: client_1.StopEventType.ARRIVE },
            select: { id: true },
        });
        if (!arrive)
            return;
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
            select: { type: true },
        });
        if (!trip)
            return;
        const autoStatus = trip.type === client_1.TripType.DROPOFF ? client_1.BoardingStatus.NOT_BOARDED : client_1.BoardingStatus.BOARDED;
        const students = await this.prisma.student.findMany({
            where: { stopId },
            select: { id: true },
        });
        if (students.length === 0)
            return;
        for (const s of students) {
            const exists = await this.prisma.boardingLog.findFirst({
                where: { routeId, stopId, studentId: s.id, tripId },
                select: { id: true },
            });
            if (exists)
                continue;
            await this.prisma.boardingLog.create({
                data: {
                    routeId,
                    stopId,
                    studentId: s.id,
                    tripId,
                    status: autoStatus,
                    mode: client_1.BoardingMode.AUTO,
                },
            });
        }
    }
    async upsertLocation(data) {
        const { routeId, lat, lng } = data;
        const location = await this.prisma.driverLocation.upsert({
            where: { routeId },
            update: { latitude: lat, longitude: lng },
            create: { routeId, latitude: lat, longitude: lng },
        });
        const trip = await this.prisma.trip.findFirst({
            where: { routeId, status: client_1.TripStatus.RUNNING },
            orderBy: { startedAt: 'desc' },
            select: { id: true },
        });
        if (!trip)
            return location;
        const nextStop = await this.getNextStopForTrip(trip.id, routeId);
        if (!nextStop)
            return location;
        const ARRIVE_RADIUS_M = 80;
        const dist = this.distanceMeters(lat, lng, nextStop.latitude, nextStop.longitude);
        if (dist <= ARRIVE_RADIUS_M) {
            const exists = await this.prisma.stopEvent.findFirst({
                where: { tripId: trip.id, stopId: nextStop.id, type: client_1.StopEventType.ARRIVE },
                select: { id: true },
            });
            if (!exists) {
                await this.prisma.stopEvent.create({
                    data: { tripId: trip.id, stopId: nextStop.id, type: client_1.StopEventType.ARRIVE },
                });
                await this.prisma.trip.update({
                    where: { id: trip.id },
                    data: { currentStopId: nextStop.id },
                });
                this.scheduleAutoConfirm(trip.id, routeId, nextStop.id);
            }
        }
        return location;
    }
    async findLocation(routeId) {
        return this.prisma.driverLocation.findUnique({ where: { routeId } });
    }
    async getLocation(routeId) {
        return this.findLocation(routeId);
    }
};
exports.DriverService = DriverService;
DriverService.autoConfirmTimers = new Map();
exports.DriverService = DriverService = DriverService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DriverService);
//# sourceMappingURL=driver.service.js.map