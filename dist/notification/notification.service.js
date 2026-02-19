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
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const alimtalk_provider_1 = require("./providers/alimtalk.provider");
const sms_provider_1 = require("./providers/sms.provider");
const notification_constants_1 = require("./notification.constants");
let NotificationService = class NotificationService {
    constructor(prisma, alimtalkProvider, smsProvider) {
        this.prisma = prisma;
        this.alimtalkProvider = alimtalkProvider;
        this.smsProvider = smsProvider;
    }
    buildLogMessage(message, routeId, stopId) {
        return `${message} (route:${routeId}, stop:${stopId})`;
    }
    async hasPoints(organizationId, need) {
        var _a;
        const org = await this.prisma.organization.findUnique({
            where: { id: organizationId },
            select: { points: true },
        });
        return ((_a = org === null || org === void 0 ? void 0 : org.points) !== null && _a !== void 0 ? _a : 0) >= need;
    }
    async deductPoints(organizationId, amount, reason) {
        const org = await this.prisma.organization.update({
            where: { id: organizationId },
            data: { points: { decrement: amount } },
            select: { points: true },
        });
        await this.prisma.pointTransaction.create({
            data: {
                organizationId,
                amount: -amount,
                balanceAfter: org.points,
                reason,
            },
        });
        return org.points;
    }
    async sendOnce(data) {
        const logMessage = this.buildLogMessage(data.message, data.routeId, data.stopId);
        const cutoff = new Date(Date.now() - 5 * 60 * 1000);
        const exists = await this.prisma.notificationLog.findFirst({
            where: {
                phone: data.phone,
                type: data.type,
                message: logMessage,
                createdAt: { gte: cutoff },
            },
            select: { id: true },
        });
        if (exists) {
            return { sent: false, skipped: true, reason: 'DUPLICATE' };
        }
        // 1) 알림톡 우선(10P). 포인트 없으면 자동발송 불가.
        const needAlimtalk = notification_constants_1.NOTIFICATION_POINTS.ALIMTALK;
        const canAlimtalk = await this.hasPoints(data.organizationId, needAlimtalk);
        if (!canAlimtalk) {
            return { sent: false, skipped: true, reason: 'NO_POINTS' };
        }
        const alim = await this.alimtalkProvider.send(data.phone, data.message);
        if (alim.ok) {
            await this.deductPoints(data.organizationId, needAlimtalk, `ALIMTALK:${client_1.NotificationType[data.type]}`);
            await this.prisma.notificationLog.create({
                data: {
                    organizationId: data.organizationId,
                    routeId: data.routeId,
                    stopId: data.stopId,
                    phone: data.phone,
                    message: logMessage,
                    type: data.type,
                    channel: client_1.NotificationChannel.ALIMTALK,
                    costPoints: needAlimtalk,
                },
            });
            return { sent: true, skipped: false, channel: 'ALIMTALK', costPoints: needAlimtalk };
        }
        // 2) 카톡 미설치(NO_KAKAO)일 때만 SMS(50P) fallback
        if (alim.reason === 'NO_KAKAO') {
            const needSms = notification_constants_1.NOTIFICATION_POINTS.SMS;
            const canSms = await this.hasPoints(data.organizationId, needSms);
            if (!canSms) {
                return { sent: false, skipped: true, reason: 'NO_POINTS' };
            }
            const smsSent = await this.smsProvider.send(data.phone, data.message);
            if (!smsSent) {
                return { sent: false, skipped: true, reason: 'PROVIDER_FAIL' };
            }
            await this.deductPoints(data.organizationId, needSms, `SMS:${client_1.NotificationType[data.type]}`);
            await this.prisma.notificationLog.create({
                data: {
                    organizationId: data.organizationId,
                    routeId: data.routeId,
                    stopId: data.stopId,
                    phone: data.phone,
                    message: logMessage,
                    type: data.type,
                    channel: client_1.NotificationChannel.SMS,
                    costPoints: needSms,
                },
            });
            return { sent: true, skipped: false, channel: 'SMS', costPoints: needSms };
        }
        return { sent: false, skipped: true, reason: 'PROVIDER_FAIL' };
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        alimtalk_provider_1.AlimtalkProvider,
        sms_provider_1.SmsProvider])
], NotificationService);
//# sourceMappingURL=notification.service.js.map