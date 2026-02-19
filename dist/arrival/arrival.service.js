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
exports.ArrivalService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const notification_service_1 = require("../notification/notification.service");
const arrival_dto_1 = require("./dto/arrival.dto");
let ArrivalService = class ArrivalService {
    constructor(prisma, notificationService) {
        this.prisma = prisma;
        this.notificationService = notificationService;
    }
    async create({ routeId, stopId, mode }) {
        const route = await this.prisma.route.findUnique({
            where: { id: routeId },
            include: { organization: true },
        });
        if (!route)
            return { count: 0 };
        const stop = await this.prisma.stop.findFirst({ where: { id: stopId, routeId } });
        if (!stop)
            return { count: 0 };
        let targetStopId = null;
        let notificationType;
        let message;
        if (mode === arrival_dto_1.ArrivalMode.MANUAL) {
            targetStopId = stopId;
            notificationType = client_1.NotificationType.MANUAL;
            message = `[${route.organization.name}] 차량이 정류장에 도착했습니다.`;
        }
        else {
            const targetOrderNo = stop.orderNo + route.alertBeforeCnt;
            const targetStop = await this.prisma.stop.findFirst({
                where: { routeId, orderNo: targetOrderNo },
            });
            if (!targetStop)
                return { count: 0 };
            targetStopId = targetStop.id;
            notificationType = client_1.NotificationType.BEFORE_STOP;
            message = `[${route.organization.name}] 차량이 곧 도착합니다.`;
        }
        const students = await this.prisma.student.findMany({
            where: { stopId: targetStopId },
            select: { parentPhone: true },
        });
        if (students.length === 0)
            return { count: 0 };
        const results = await Promise.all(students.map((student) => this.notificationService.sendOnce({
            organizationId: route.organizationId,
            phone: student.parentPhone,
            message,
            type: notificationType,
            routeId,
            stopId: targetStopId,
        })));
        const count = results.filter((r) => !r.skipped).length;
        return { count };
    }
};
exports.ArrivalService = ArrivalService;
exports.ArrivalService = ArrivalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_service_1.NotificationService])
], ArrivalService);
//# sourceMappingURL=arrival.service.js.map