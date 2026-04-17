import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DomainException, DomainExceptionCode } from '@app/exceptions';
import { errorFormatter } from '@app/utils';

export function pipesSetup(app: INestApplication) {
  //Глобальный пайп для валидации и трансформации входящих данных.
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
        exposeDefaultValues: true,
      },
      whitelist: true,
      stopAtFirstError: true,
      forbidNonWhitelisted: true,
      //Преобразуем ошибки класс валидатора в DomainException
      exceptionFactory: (errors) => {
        const formattedErrors = errorFormatter(errors);

        throw new DomainException({
          code: DomainExceptionCode.ValidationError,
          message: 'Validation failed',
          extensions: formattedErrors,
        });
      },
    }),
  );
}
