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
exports.StudentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StudentService = class StudentService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        var _a;
        const { name, parentPhone, stopId } = data;
        if (!name || !parentPhone || !stopId) {
            throw new common_1.BadRequestException('name, parentPhone, stopId are required');
        }
        // stopId로부터 organizationId 추론 (Student는 route 관계가 없을 수 있음)
        const stop = await this.prisma.stop.findUnique({
            where: { id: stopId },
            select: { route: { select: { organizationId: true } } },
        });
        const organizationId = (_a = stop === null || stop === void 0 ? void 0 : stop.route) === null || _a === void 0 ? void 0 : _a.organizationId;
        if (!organizationId) {
            throw new common_1.BadRequestException('organizationId could not be resolved from stopId');
        }
        return this.prisma.student.create({
            data: {
                name,
                parentPhone,
                stop: { connect: { id: stopId } },
                organization: { connect: { id: organizationId } },
            },
        });
    }
    findAll(_params) {
        return this.prisma.student.findMany();
    }
    findOne(id) {
        return this.prisma.student.findUnique({ where: { id } });
    }
    async update(id, data) {
        return this.prisma.student.update({ where: { id }, data });
    }
    async remove(id) {
        return this.prisma.student.delete({ where: { id } });
    }
};
exports.StudentService = StudentService;
exports.StudentService = StudentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentService);
//# sourceMappingURL=student.service.js.map