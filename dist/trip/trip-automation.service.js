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
exports.TripAutomationService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let TripAutomationService = class TripAutomationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getNextStop(tripId, routeId) {
        const arrivedStops = await this.prisma.stopEvent.findMany({
            where: { tripId, type: client_1.StopEventType.ARRIVE },
            select: { stopId: true },
        });
        const arrivedStopIds = arrivedStops.map((s) => s.stopId);
        return this.prisma.stop.findFirst({
            where: {
                routeId,
                ...(arrivedStopIds.length > 0 ? { id: { notIn: arrivedStopIds } } : {}),
            },
            orderBy: { orderNo: 'asc' },
        });
    }
};
exports.TripAutomationService = TripAutomationService;
exports.TripAutomationService = TripAutomationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TripAutomationService);
//# sourceMappingURL=trip-automation.service.js.map