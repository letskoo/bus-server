import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
const passport = require('passport');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  });

  // 🔥 세션
  app.use(
    session({
      secret: 'bus-secret',
      resave: false,
      saveUninitialized: false,
    }),
  );

  // 🔥 passport
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(process.env.PORT || 3000);
}

bootstrap();