import { firstValueFrom, Observable } from 'rxjs';
import { DomainException } from './domain-exceptions';
import { DomainExceptionCode } from './domain-exception-codes.enum';

/* Разворачивает TCP-ответ микросервиса: доменные ошибки пробрасывает как DomainException,
   транспортные (сервис недоступен) — превращает в InternalServerError */
export async function tcpCall<T>(source: Observable<T>, unavailableMessage: string): Promise<T> {
  try {
    return await firstValueFrom(source);
  } catch (error) {
    const code = error?.code ?? error?.response?.code;
    const message = error?.message ?? error?.response?.message;
    if (code && message) {
      throw new DomainException({ code, message, extensions: error?.extensions ?? [] });
    }
    throw new DomainException({
      code: DomainExceptionCode.InternalServerError,
      message: unavailableMessage,
    });
  }
}

// TODO УДалить после деплоя fix payments 8 спринта
