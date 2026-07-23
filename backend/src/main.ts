import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Динамическая настройка разрешенного фронтенд-домена (CORS & CSP)
  const allowedOrigin = process.env.FRONTEND_URL || '*';

  // Включение защитных заголовков HTTP с детально настроенной Content Security Policy (CSP)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:'],
          connectSrc: [
            "'self'",
            'http:',
            'https:',
            'ws:',
            'wss:',
            allowedOrigin !== '*' ? allowedOrigin : '',
          ].filter(Boolean),
          fontSrc: ["'self'", 'https:', 'data:'],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
    }),
  );

  app.enableCors({
    origin: allowedOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(
    `Backend server listening on port ${port} (CORS & CSP origin: ${allowedOrigin})`,
  );
}
bootstrap();
