import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { OrganizationModule } from './organization/organization.module';
import { RouteModule } from './route/route.module';
import { StopModule } from './stop/stop.module';
import { StudentModule } from './student/student.module';
import { TripModule } from './trip/trip.module';
import { DriverModule } from './driver/driver.module';
import { NotificationModule } from './notification/notification.module';
import { ShareModule } from './share/share.module';
import { WebModule } from './web/web.module';
import { BoardingModule } from './boarding/boarding.module';
import { ArrivalModule } from './arrival/arrival.module';
import { PointsModule } from './points/points.module';
import { TemporaryModule } from './temporary/temporary.module';

@Module({
  imports: [
    PrismaModule,
    OrganizationModule,
    RouteModule,
    StopModule,
    StudentModule,
    TripModule,
    DriverModule,
    NotificationModule,
    ShareModule,
    WebModule,
    BoardingModule,
    ArrivalModule,
    PointsModule,
    TemporaryModule,
  ],
})
export class AppModule {}