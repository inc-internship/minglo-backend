# Инструкция по внедрению логгера (Winston + New Relic) в NestJS-проект

## Оглавление

1. [Что получится в итоге](#1-что-получится-в-итоге)
2. [Зависимости](#2-зависимости)
3. [Переменные окружения](#3-переменные-окружения)
4. [Структура файлов](#структура-файлов)
5. [Конфигурация — выбери один из двух подходов](#4-конфигурация--выбери-один-из-двух-подходов)
   - Подход 1: configuration.ts
   - Подход 2: LoggerConfig с валидацией (4а)
6. [AsyncLocalStorageService](#5-asynclocalstorageservice)
7. [RequestContextMiddleware](#6-requestcontextmiddleware)
8. [WinstonService](#7-winstonservice)
9. [CustomLogger](#8-customlogger)
10. [LoggerModule](#9-loggermodule)
11. [AllExceptionsFilter](#10-allexceptionsfilter)
12. [AppModule](#11-appmodule)
13. [main.ts](#12-maints)
14. [Использование в контроллерах и use-cases](#13-использование-в-контроллерах-и-use-cases)
15. [Регистрация AsyncLocalStorageService в дочерних модулях](#14-регистрация-asynclocalstorageservice-в-дочерних-модулях)
16. [New Relic — newrelic.js](#15-new-relic--newrelicjs)
17. [Полная схема потока запроса](#16-полная-схема-потока-запроса)
18. [Частые ошибки](#17-частые-ошибки)

---

## 1. Что получится в итоге

Каждый лог в системе будет автоматически содержать:
- `requestId` — уникальный ID запроса, сквозной через весь стек (контроллер → use-case → репозиторий → фильтр ошибок)
- `sourceName` — имя класса, из которого вызван лог
- `functionName` — имя метода (передаётся вручную при вызове)
- `serviceName` — имя микросервиса (задаётся один раз при старте)

В `DEVELOPMENT` логи пишутся в консоль. В `PRODUCTION` — в консоль **и** в New Relic через HTTP transport.

---

## 2. Зависимости

```bash
pnpm add winston winston-transport newrelic @nestjs/config class-validator class-transformer
pnpm add -D @types/newrelic
```

> `@nestjs/config` — нужен для `ConfigModule` и `ConfigService`.
> `class-validator` и `class-transformer` — нужны для `LoggerConfig` (раздел 4а). Если используешь только подход из раздела 4 — можно не ставить.

---

## 3. Переменные окружения

Добавить в `.env`:

```env
ENV=DEVELOPMENT          # DEVELOPMENT | STAGING | PRODUCTION | TEST
PORT=3000

LOGGER_HOST=log-api.newrelic.com
LOGGER_URL_PATH=/log/v1?Api-Key=YOUR_NEW_RELIC_LICENSE_KEY
LOGGER_LEVEL=debug       # trace | debug | info | warn | error | fatal
```

> `LOGGER_HOST` и `LOGGER_URL_PATH` используются только когда `ENV=PRODUCTION`.

---

## Структура файлов

В монорепе весь логгер живёт в отдельной библиотеке (`libs/logger`). Каждый микросервис импортирует из неё через path alias `@app/logger`. Ни один файл логгера не дублируется между приложениями.

```
libs/
└── logger/
    ├── tsconfig.lib.json
    └── src/
        ├── index.ts                          # публичный экспорт библиотеки
        ├── async-local-storage/
        │   └── async-local-storage.service.ts   # раздел 5
        ├── middleware/
        │   └── request-context.middleware.ts     # раздел 6
        ├── logger.config.ts                  # раздел 4а (рекомендуется для монорепы)
        ├── winston.service.ts                # раздел 7
        ├── logger.service.ts                 # раздел 8
        └── logger.module.ts                  # раздел 9

apps/
├── users/                                    # микросервис 1
│   └── src/
│       ├── settings/
│       │   └── configuration.ts             # раздел 4 (только если подход 1)
│       ├── common/
│       │   └── exceptions/
│       │       └── exception.filter.ts      # раздел 10 — остаётся в каждом приложении
│       ├── app.module.ts                    # раздел 11
│       └── main.ts                          # раздел 12
└── orders/                                  # микросервис 2 — подключает ту же библиотеку
    └── src/
        ├── app.module.ts
        └── main.ts
```

---

## Создание библиотеки

### Шаг 1 — Сгенерировать библиотеку через Nest CLI

```bash
nest g library logger
```

CLI автоматически:
- создаёт папку `libs/logger/src/`
- добавляет запись в `nest-cli.json`
- добавляет path alias в `tsconfig.json`
- создаёт `libs/logger/tsconfig.lib.json`

### Шаг 2 — Проверить nest-cli.json

После команды выше в `nest-cli.json` должна появиться запись:

```json
{
  "monorepo": true,
  "projects": {
    "users": {
      "type": "application",
      "root": "apps/users",
      "entryFile": "main",
      "sourceRoot": "apps/users/src",
      "compilerOptions": { "tsConfigPath": "apps/users/tsconfig.app.json" }
    },
    "orders": {
      "type": "application",
      "root": "apps/orders",
      "entryFile": "main",
      "sourceRoot": "apps/orders/src",
      "compilerOptions": { "tsConfigPath": "apps/orders/tsconfig.app.json" }
    },
    "logger": {
      "type": "library",
      "root": "libs/logger",
      "entryFile": "index",
      "sourceRoot": "libs/logger/src",
      "compilerOptions": { "tsConfigPath": "libs/logger/tsconfig.lib.json" }
    }
  }
}
```

### Шаг 3 — Проверить tsconfig.json

CLI добавит path aliases — убедись что они есть:

```json
{
  "compilerOptions": {
    "paths": {
      "@app/logger": ["libs/logger/src"],
      "@app/logger/*": ["libs/logger/src/*"]
    }
  }
}
```

Эти алиасы позволяют любому приложению монорепы писать:
```typescript
import { CustomLogger } from '@app/logger';
import { RequestContextMiddleware } from '@app/logger/middleware/request-context.middleware';
```

### Шаг 4 — Создать index.ts библиотеки

```typescript
// libs/logger/src/index.ts
// Публичный API библиотеки — всё что нужно приложениям

export * from './logger.module';
export * from './logger.service';
export * from './async-local-storage/async-local-storage.service';
export * from './middleware/request-context.middleware';
export * from './logger.config'; // если используешь подход 4а
```

> Всё что не экспортировано из `index.ts` — внутренняя деталь библиотеки. `WinstonService` намеренно не экспортируется — приложения не должны его использовать напрямую.

---

## 4. Конфигурация — выбери один из двух подходов

> **Важно:** разделы 4 и 4а описывают два **альтернативных** способа конфигурации логгера. Выбери один и следуй только ему. Смешивать не нужно.
>
> - **Раздел 4** — через `configuration.ts` в каждом приложении. **В монорепе не рекомендуется:** библиотека вынуждена импортировать `ConfigurationType` из конкретного приложения, что создаёт жёсткую связь (`libs/logger` зависит от `apps/users`). Подходит только если в проекте нет монорепы или все микросервисы гарантированно используют одинаковую конфигурацию.
> - **Раздел 4а** — через `LoggerConfig` с валидацией. **Рекомендуется для монорепы:** библиотека использует `ConfigService<any>` без зависимости от конкретного `ConfigurationType`. Каждый микросервис может иметь свою конфигурацию — логгер работает одинаково везде.

### Подход 1 — configuration.ts

Типизированная конфигурация из `process.env`. Вся система зависит от `ConfigService<ConfigurationType>`.

```typescript
// apps/users/src/settings/configuration.ts  ← остаётся в каждом приложении, не в библиотеке

enum Environments {
  DEVELOPMENT = 'DEVELOPMENT',
  STAGING = 'STAGING',
  PRODUCTION = 'PRODUCTION',
  TEST = 'TEST',
}

export type EnvironmentVariable = { [key: string]: string | undefined };
export type ConfigurationType = ReturnType<typeof getConfig>;

const getConfig = (
  environmentVariables: EnvironmentVariable,
  currentEnvironment: Environments,
) => {
  return {
    apiSettings: {
      PORT: Number.parseInt(environmentVariables.PORT || '3000'),
    },

    loggerEnvironmentSettings: {
      HOST: environmentVariables.LOGGER_HOST,
      URL_PATH: environmentVariables.LOGGER_URL_PATH,
      LOGGER_LEVEL: environmentVariables.LOGGER_LEVEL,
    },

    environmentSettings: {
      currentEnv: currentEnvironment,
      isProduction: currentEnvironment === Environments.PRODUCTION,
      isNonProduction:
        currentEnvironment !== Environments.PRODUCTION,
    },
  };
};

export default () => {
  const environmentVariables = process.env;
  const currentEnvironment = environmentVariables.ENV as Environments;
  return getConfig(environmentVariables, currentEnvironment);
};
```

**Зачем:** `WinstonService` и `AllExceptionsFilter` читают настройки через `ConfigService`. Типизация через `ConfigurationType` даёт автодополнение и защиту от опечаток в ключах.

После создания этого файла переходи к разделу 5. Разделы 7 и 9 написаны под этот подход.

---

### Подход 2 — LoggerConfig (раздел 4а)

> Это альтернатива разделу выше. Если выбрал подход 1 — пропусти этот раздел и иди к разделу 5.

Вместо `configuration.ts` с `loggerEnvironmentSettings` создаётся отдельный Injectable-класс `LoggerConfig`. Преимущества:

- Валидация переменных при старте приложения — если `LOGGER_HOST` не задан в продакшне, приложение упадёт сразу с понятной ошибкой
- `@ValidateIf` — условная валидация (например, хост нужен только в продакшне)
- Класс инжектируется напрямую в `WinstonService` — не нужен `ConfigService` внутри сервиса

### Шаг 1 — Установить зависимости для валидации

```bash
pnpm add class-validator class-transformer
```

### Шаг 2 — Создать LoggerConfig

```typescript
// libs/logger/src/logger.config.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IsBoolean,
  IsEnum,
  IsString,
  ValidateIf,
  validateSync,
} from 'class-validator';

// Если в проекте нет общей утилиты валидации — используй этот inline-вариант.
// Если есть configValidationUtility из @app/dynamic-config — замени validateSync на него.
function validateConfig(config: object) {
  const errors = validateSync(config as object, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(
      `[LoggerConfig] Validation failed:\n${errors
        .map((e) => Object.values(e.constraints || {}).join(', '))
        .join('\n')}`,
    );
  }
}

enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

@Injectable()
export class LoggerConfig {
  // Уровень логирования — обязателен всегда
  @IsEnum(LogLevel, {
    message:
      'Set env variable LOGGER_LEVEL. Allowed values: trace, debug, info, warn, error, fatal',
  })
  loggerLevel: string;

  // isProduction нужен для ValidateIf — сам по себе не env-переменная
  @IsBoolean()
  isProduction: boolean;

  // Хост New Relic — нужен только в продакшне
  @ValidateIf((o) => o.isProduction)
  @IsString({
    message: 'Set env variable LOGGER_HOST (New Relic endpoint host), example: log-api.newrelic.com',
  })
  loggerHost: string;

  // Путь New Relic — нужен только в продакшне
  @ValidateIf((o) => o.isProduction)
  @IsString({
    message:
      'Set env variable LOGGER_URL_PATH (New Relic endpoint path), example: /log/v1?Api-Key=YOUR_KEY',
  })
  loggerUrlPath: string;

  // ConfigService<any, true>:
  //   any    — не привязываемся к ConfigurationType, LoggerConfig самодостаточен
  //   true   — второй параметр означает что get() возвращает T (не T | undefined).
  //            В реальности переменная может не быть задана — защита через validateConfig ниже.
  constructor(private configService: ConfigService<any, true>) {
    const env = this.configService.get('ENV');

    this.isProduction = env === 'PRODUCTION';
    this.loggerLevel = this.configService.get('LOGGER_LEVEL') || 'debug';
    this.loggerHost = this.configService.get('LOGGER_HOST');
    this.loggerUrlPath = this.configService.get('LOGGER_URL_PATH');

    // Валидация при старте — если что-то не так, приложение упадёт сразу
    validateConfig(this);
  }
}
```

> Если в проекте используется `configValidationUtility` из `@app/dynamic-config` — замени `validateConfig(this)` на `configValidationUtility.validateConfig(this)`. Логика та же, только утилита общая.

### Шаг 3 — Обновить WinstonService — принимать LoggerConfig вместо ConfigService

```typescript
// libs/logger/src/winston.service.ts
import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import * as Transport from 'winston-transport';
import { LoggerConfig } from './logger.config'; // локальный импорт внутри библиотеки

const customLevels = {
  levels: { trace: 5, debug: 4, info: 3, warn: 2, error: 1, fatal: 0 },
};

const timeFormat = 'YYYY-MM-DD HH:mm:ss';
const { combine, prettyPrint, timestamp, errors, colorize } = winston.format;

@Injectable()
export class WinstonService {
  private logger: winston.Logger;

  constructor(
    private loggerConfig: LoggerConfig, // ← вместо ConfigService
    private serviceName: string,
  ) {
    const consoleTransport = new winston.transports.Console({
      format: combine(
        timestamp({ format: timeFormat }),
        errors({ stack: true }),
        prettyPrint(),
        colorize({ all: true, colors: { trace: 'yellow' } }),
      ),
    });

    const transports: Transport[] = [consoleTransport];

    if (loggerConfig.isProduction) {
      transports.push(
        new winston.transports.Http({
          host: loggerConfig.loggerHost,
          path: loggerConfig.loggerUrlPath,
          ssl: true,
        }),
      );
    }

    this.logger = winston.createLogger({
      format: winston.format.timestamp({ format: timeFormat }),
      level: loggerConfig.loggerLevel,
      levels: customLevels.levels,
      transports,
      defaultMeta: { serviceName: this.serviceName },
    });
  }

  trace(message: string, requestId: string | null, functionName?: string, sourceName?: string) {
    this.logger.log('trace', message, { sourceName, functionName, requestId });
  }

  debug(message: string, requestId: string | null, functionName?: string, sourceName?: string) {
    this.logger.debug(message, { sourceName, functionName, requestId });
  }

  info(message: string, requestId: string | null, functionName?: string, sourceName?: string) {
    this.logger.info(message, { sourceName, functionName, requestId });
  }

  warn(message: string, requestId: string | null, functionName?: string, sourceName?: string) {
    this.logger.warn(message, { sourceName, functionName, requestId });
  }

  error(message: string, requestId: string | null, functionName?: string, sourceName?: string, stack?: string) {
    this.logger.error(message, { sourceName, functionName, requestId, stack });
  }

  fatal(message: string, requestId: string | null, functionName?: string, sourceName?: string, stack?: string) {
    this.logger.log('fatal', message, { sourceName, functionName, requestId, stack });
  }
}
```

### Шаг 4 — Обновить LoggerModule — добавить LoggerConfig как провайдер

```typescript
// libs/logger/src/logger.module.ts
import { DynamicModule, Global, Module } from '@nestjs/common';
import { CustomLogger } from './logger.service';
import { WinstonService } from './winston.service';
import { LoggerConfig } from './logger.config';
import { AsyncLocalStorageService } from './async-local-storage/async-local-storage.service';

@Global()
@Module({})
export class LoggerModule {
  static forRoot(serviceName: string): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        CustomLogger,
        AsyncLocalStorageService,
        LoggerConfig, // ← регистрируем; ConfigService инжектируется автоматически
        {
          provide: WinstonService,
          useFactory: (loggerConfig: LoggerConfig) => {
            return new WinstonService(loggerConfig, serviceName);
          },
          inject: [LoggerConfig], // ← теперь зависим от LoggerConfig, а не ConfigService
        },
      ],
      exports: [CustomLogger],
    };
  }
}
```

**Ничего больше менять не нужно** — `AppModule`, `main.ts`, контроллеры и use-cases остаются как есть.

### Сравнение двух подходов

| | `configuration.ts` (раздел 4) | `LoggerConfig` (этот раздел) |
|---|---|---|
| Валидация при старте | Нет | Да — `validateSync` |
| Ошибка при отсутствии переменной | Молча `undefined` | Приложение падает с понятным сообщением |
| Условная валидация (`@ValidateIf`) | Нет | Да |
| Зависимость в `WinstonService` | `ConfigService` | `LoggerConfig` |
| Сложность | Проще | Чуть больше кода, но надёжнее |

В продакшне предпочтительнее `LoggerConfig` — если забыть задать `LOGGER_HOST`, приложение не стартует и не даст неявно сломанный транспорт.

---

## 5. AsyncLocalStorageService

Хранит данные запроса (в первую очередь `requestId`) изолированно для каждого параллельного запроса — без передачи через параметры функций.

```typescript
// libs/logger/src/async-local-storage/async-local-storage.service.ts
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

// Создаётся ОДИН РАЗ на уровне модуля файла — синглтон Node.js.
// Все экземпляры класса ссылаются на это единственное хранилище.
const asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

@Injectable()
export class AsyncLocalStorageService {
  private asyncLocalStorage = asyncLocalStorage;

  // Запускает новый изолированный "карман" и выполняет весь запрос внутри него
  start(callback: () => void) {
    this.asyncLocalStorage.run(new Map(), () => {
      callback();
    });
  }

  // Возвращает "карман" текущего запроса
  getStore(): Map<string, any> | undefined {
    return this.asyncLocalStorage.getStore();
  }
}
```

**Зачем `const` вне класса:** NestJS может создать несколько экземпляров `AsyncLocalStorageService` (в разных модулях), но все они будут работать с одним физическим `AsyncLocalStorage`. Middleware пишет `requestId` через один экземпляр, `CustomLogger` читает через другой — и всё равно получает правильный ID.

---

## 6. RequestContextMiddleware

Запускается первым на каждый запрос. Инициализирует "карман" и кладёт туда `requestId`.

```typescript
// libs/logger/src/middleware/request-context.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AsyncLocalStorageService } from '../async-local-storage/async-local-storage.service';

export const REQUEST_ID_KEY = 'requestId';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private asyncLocalStorageService: AsyncLocalStorageService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    // Читаем из заголовка или генерируем новый UUID
    let requestId = req.headers['x-request-id'] as string;
    if (!requestId) {
      requestId = crypto.randomUUID();
      req.headers['x-request-id'] = requestId;
    }

    // Эхом возвращаем клиенту — он увидит ID в ответе
    res.setHeader('X-Request-Id', requestId);

    // Весь запрос (контроллер, use-case, репозиторий) выполняется ВНУТРИ этого start()
    // Поэтому getStore() в любом месте приложения вернёт правильный карман
    this.asyncLocalStorageService.start(() => {
      const store = this.asyncLocalStorageService.getStore();
      if (store) {
        store.set(REQUEST_ID_KEY, requestId);
      }
      next();
    });
  }
}
```

**Ключевой момент:** `next()` вызывается **внутри** колбека `start()`. Это означает весь последующий pipeline запроса выполняется внутри AsyncLocalStorage-контекста. Если вызвать `next()` снаружи — `getStore()` везде будет возвращать `undefined`.

---

## 7. WinstonService

Нижний уровень — физически пишет логи куда нужно. Конфигурируется один раз при старте.

> **Подход 1 (configuration.ts):** используй код ниже. Обрати внимание: `ConfigurationType` будет импортироваться из конкретного приложения — это coupling, который не рекомендуется в монорепе.
> **Подход 2 (LoggerConfig):** этот файл уже показан в разделе 4а, Шаг 3. Используй ту версию — она принимает `LoggerConfig` вместо `ConfigService`. Методы `trace/debug/info/warn/error/fatal` одинаковы в обоих подходах — скопируй их из кода ниже.

```typescript
// libs/logger/src/winston.service.ts
import * as winston from 'winston';
import * as Transport from 'winston-transport';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
// ВНИМАНИЕ: этот импорт создаёт зависимость библиотеки от конкретного приложения.
// В монорепе лучше использовать подход 4а (LoggerConfig) чтобы избежать этого.
import { ConfigurationType } from '../../../apps/users/src/settings/configuration';

// Кастомные уровни: trace и fatal не входят в winston по умолчанию
const customLevels = {
  levels: {
    trace: 5,
    debug: 4,
    info: 3,
    warn: 2,
    error: 1,
    fatal: 0,
  },
};

const timeFormat = 'YYYY-MM-DD HH:mm:ss';
const { combine, prettyPrint, timestamp, errors, colorize } = winston.format;

@Injectable()
export class WinstonService {
  private logger: winston.Logger;

  constructor(
    private configService: ConfigService<ConfigurationType, true>,
    private serviceName: string, // передаётся из LoggerModule.forRoot()
  ) {
    const loggerSettings = this.configService.get('loggerEnvironmentSettings', {
      infer: true,
    });

    const consoleTransport = new winston.transports.Console({
      format: combine(
        timestamp({ format: timeFormat }),
        errors({ stack: true }),
        prettyPrint(),
        colorize({ all: true, colors: { trace: 'yellow' } }),
      ),
    });

    const transports: Transport[] = [consoleTransport]; // консоль — всегда

    const isProduction = this.configService.get('environmentSettings', {
      infer: true,
    }).isProduction;

    if (isProduction) {
      // HTTP transport — только в проде, отправляет каждый лог в New Relic
      const httpTransport = new winston.transports.Http({
        host: loggerSettings.HOST,
        path: loggerSettings.URL_PATH,
        ssl: true,
      });
      transports.push(httpTransport);
    }

    this.logger = winston.createLogger({
      format: winston.format.timestamp({ format: timeFormat }),
      level: loggerSettings.LOGGER_LEVEL,
      levels: customLevels.levels,
      transports,
      defaultMeta: { serviceName: this.serviceName },
    });
  }

  trace(message: string, requestId: string | null, functionName?: string, sourceName?: string) {
    this.logger.log('trace', message, { sourceName, functionName, requestId });
  }

  debug(message: string, requestId: string | null, functionName?: string, sourceName?: string) {
    this.logger.debug(message, { sourceName, functionName, requestId });
  }

  info(message: string, requestId: string | null, functionName?: string, sourceName?: string) {
    this.logger.info(message, { sourceName, functionName, requestId });
  }

  warn(message: string, requestId: string | null, functionName?: string, sourceName?: string) {
    this.logger.warn(message, { sourceName, functionName, requestId });
  }

  error(message: string, requestId: string | null, functionName?: string, sourceName?: string, stack?: string) {
    this.logger.error(message, { sourceName, functionName, requestId, stack });
  }

  fatal(message: string, requestId: string | null, functionName?: string, sourceName?: string, stack?: string) {
    this.logger.log('fatal', message, { sourceName, functionName, requestId, stack });
  }
}
```

**Зачем `serviceName` через конструктор:** `LoggerModule.forRoot('my-service-name')` передаёт строку через фабрику. Так в каждом логе в New Relic будет поле `serviceName`, и можно фильтровать логи по микросервису.

---

## 8. CustomLogger

Единственный класс, который инжектируется в твой код. Фасад над WinstonService.

```typescript
// libs/logger/src/logger.service.ts
import {
  ConsoleLogger,
  ConsoleLoggerOptions,
} from '@nestjs/common/services/console-logger.service';
import { Injectable, Scope } from '@nestjs/common';
import { WinstonService } from './winston.service';
import { AsyncLocalStorageService } from './async-local-storage/async-local-storage.service';
import { REQUEST_ID_KEY } from './middleware/request-context.middleware';

// TRANSIENT: каждый раз при инжекции — новый экземпляр.
// Нужно потому что каждый класс вызывает setContext(ClassName) —
// при синглтоне контекст постоянно перезаписывался бы.
@Injectable({ scope: Scope.TRANSIENT })
export class CustomLogger extends ConsoleLogger {
  constructor(
    context: string,
    options: ConsoleLoggerOptions,
    private winstonLogger: WinstonService,
    private asyncLocalStorageService: AsyncLocalStorageService,
  ) {
    super(context, {
      ...options,
      logLevels: ['verbose', 'debug', 'log', 'warn', 'error', 'fatal'],
    });
  }

  private getRequestId(): string | null {
    return this.asyncLocalStorageService.getStore()?.get(REQUEST_ID_KEY) || null;
  }

  private getSourceContext(): string | undefined {
    return this.context;
  }

  private getStack(error: any): string | undefined {
    const stack = error?.stack;
    if (stack) {
      return `${stack?.split('\n')[1]}`;
    }
  }

  trace(message: string, functionName?: string) {
    super.verbose(message, this.getSourceContext() || functionName);
    this.winstonLogger.trace(message, this.getRequestId(), functionName, this.getSourceContext());
  }

  debug(message: string, functionName?: string) {
    super.debug(message, this.getSourceContext() || functionName);
    this.winstonLogger.debug(message, this.getRequestId(), functionName, this.getSourceContext());
  }

  log(message: string, functionName?: string) {
    super.log(message, this.getSourceContext() || functionName);
    this.winstonLogger.info(message, this.getRequestId(), functionName, this.getSourceContext());
  }

  warn(message: string, functionName?: string) {
    super.warn(message, this.getSourceContext() || functionName);
    this.winstonLogger.warn(message, this.getRequestId(), functionName, this.getSourceContext());
  }

  error(error: any, functionName?: string) {
    const jsonError = error instanceof Error ? JSON.stringify(error) : error;
    const stack = this.getStack(error);
    const fullErrorMessage = `${error?.message ? `msg: ${error?.message}; ` : ''} fullError: ${jsonError}`;

    super.error(error, stack, this.getSourceContext() || functionName);
    this.winstonLogger.error(fullErrorMessage, this.getRequestId(), functionName, this.getSourceContext(), stack);
  }

  fatal(message: string, functionName?: string, stack?: string) {
    super.fatal(message, this.getSourceContext() || functionName);
    this.winstonLogger.fatal(message, this.getRequestId(), functionName, this.getSourceContext(), stack);
  }
}
```

**Что происходит при каждом вызове `logger.log(...):`**
1. `super.log(...)` — NestJS ConsoleLogger: красивый цветной вывод в терминал
2. `winstonLogger.info(...)` — Winston: пишет в транспорты + автоматически подтягивает `requestId` из AsyncLocalStorage

---

## 9. LoggerModule

`@Global()` — делает `CustomLogger` доступным во всех модулях без явного импорта.

> **Подход 1 (configuration.ts):** используй код ниже.
> **Подход 2 (LoggerConfig):** используй версию из раздела 4а, Шаг 4.

```typescript
// libs/logger/src/logger.module.ts
import { DynamicModule, Global, Module } from '@nestjs/common';
import { CustomLogger } from './logger.service';
import { WinstonService } from './winston.service';
import { AsyncLocalStorageService } from './async-local-storage/async-local-storage.service';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../../apps/users/src/settings/configuration'; // coupling!

@Global()
@Module({})
export class LoggerModule {
  // forRoot принимает имя сервиса — появится в каждом логе как поле serviceName
  static forRoot(serviceName: string): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        CustomLogger,
        AsyncLocalStorageService,
        {
          provide: WinstonService,
          useFactory: (configService: ConfigService<ConfigurationType, true>) => {
            return new WinstonService(configService, serviceName);
          },
          inject: [ConfigService],
        },
      ],
      exports: [CustomLogger], // экспортируем только CustomLogger, WinstonService скрыт
    };
  }
}
```

**Почему `AsyncLocalStorageService` не экспортируется из `LoggerModule`:** Его нужно регистрировать в каждом модуле отдельно — но благодаря синглтону на уровне файла, все экземпляры работают с одним хранилищем. Подробнее см. раздел 14.

---

## 10. AllExceptionsFilter

Глобальный фильтр — ловит все исключения, включая непредвиденные. Логирует через `CustomLogger`, чтобы ошибки попали в New Relic с `requestId`.

```typescript
// apps/users/src/common/exceptions/exception.filter.ts  ← остаётся в каждом приложении
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomLogger } from '@app/logger'; // импорт из библиотеки через alias

const getDefaultResponseHttpBody = (status: number) => ({
  statusCode: status,
  timestamp: new Date().toISOString(),
  path: null,
  message: 'Some error occurred',
  errorDescription: null,
});

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private isNonProduction: boolean,
    private logger: CustomLogger,
  ) {
    this.logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    // Логируем ВСЕ исключения — и ожидаемые HttpException, и неожиданные ошибки
    this.logger.error(exception, 'All exception filter');

    try {
      const isHttpException = exception instanceof HttpException;
      const exceptionResponse = isHttpException
        ? (exception.getResponse() as ExceptionResponseType)
        : null;
      const message = isHttpException
        ? exception?.message
        : exception?.message || 'Some error';
      const errorDescription = Array.isArray(exceptionResponse?.message)
        ? exceptionResponse?.message
        : null;

      const status = isHttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

      // В non-production — полные детали ошибки
      // В production для 500 — только общее сообщение (не раскрываем внутренности)
      if (this.isNonProduction || status !== HttpStatus.INTERNAL_SERVER_ERROR) {
        response.status(status).json({
          ...getDefaultResponseHttpBody(status),
          path: request.url,
          message,
          errorDescription,
        });
        return;
      }

      response
        .status(status)
        .json(getDefaultResponseHttpBody(HttpStatus.INTERNAL_SERVER_ERROR));
    } catch (error) {
      // Fallback: если сам логгер упал — console.log как последний рубеж
      console.log('ALL EXCEPTIONS CATCH:', error);
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(getDefaultResponseHttpBody(HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }
}

type ExceptionResponseType = {
  statusCode: number;
  message: { message: string; field: string }[];
  error: string;
};
```

---

## 11. AppModule

```typescript
// apps/users/src/app.module.ts  ← каждый микросервис настраивает это у себя
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './settings/configuration';
// Все импорты логгера — из библиотеки через alias, не из локальных папок
import { LoggerModule, RequestContextMiddleware, AsyncLocalStorageService } from '@app/logger';

@Module({
  imports: [
    // 1. ConfigModule — глобальный, должен быть первым
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // 2. LoggerModule — глобальный, передаём имя микросервиса (появится в каждом логе)
    LoggerModule.forRoot('USERS-SERVICE'),

    // ... остальные модули
  ],
  providers: [
    // AsyncLocalStorageService нужен для RequestContextMiddleware в AppModule
    AsyncLocalStorageService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestContextMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL }); // на ВСЕ маршруты
  }
}
```

Второй микросервис подключает ту же библиотеку — только `serviceName` другой:

```typescript
// apps/orders/src/app.module.ts
import { LoggerModule, RequestContextMiddleware, AsyncLocalStorageService } from '@app/logger';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    LoggerModule.forRoot('ORDERS-SERVICE'), // ← другое имя, всё остальное то же
  ],
  providers: [AsyncLocalStorageService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
```

**Важно:** `LoggerModule.forRoot()` должен идти **после** `ConfigModule.forRoot()`, потому что `LoggerConfig` / `WinstonService` зависят от `ConfigService`.

---

## 12. main.ts

```typescript
// apps/users/src/main.ts  ← у каждого микросервиса свой main.ts

// ПЕРВАЯ СТРОКА — до любых импортов NestJS/TypeScript
// New Relic агент должен быть загружен раньше всего остального
require('newrelic');

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from './settings/configuration';
import { CustomLogger } from '@app/logger'; // из библиотеки
import { AllExceptionsFilter } from './common/exceptions/exception.filter'; // локально в приложении

async function bootstrap() {
  // bufferLogs: true — NestJS буферизует логи до момента app.useLogger()
  // Без этого системные логи при старте идут через стандартный ConsoleLogger
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const configService = app.get(ConfigService<ConfigurationType, true>);
  const environmentSettings = configService.get('environmentSettings', { infer: true });
  const apiSettings = configService.get('apiSettings', { infer: true });

  // app.resolve() а не app.get() — потому что CustomLogger имеет scope TRANSIENT
  const logger = await app.resolve(CustomLogger);
  logger.setContext('NEST_INIT');

  // После этой строки ВСЕ системные логи NestJS тоже идут через CustomLogger → Winston → New Relic
  app.useLogger(logger);

  // Глобальный фильтр — resolve() по той же причине (TRANSIENT scope)
  const allExceptionLogger = await app.resolve(CustomLogger);
  app.useGlobalFilters(
    new AllExceptionsFilter(environmentSettings.isNonProduction, allExceptionLogger),
  );

  await app.listen(apiSettings.PORT);
}
bootstrap();
```

**Зачем `app.resolve()` вместо `app.get()`:** `CustomLogger` имеет `Scope.TRANSIENT` — каждый раз создаётся новый экземпляр. `app.get()` для transient-провайдеров не работает корректно, нужен `app.resolve()`.

**Зачем `bufferLogs: true`:** NestJS пишет логи при инициализации модулей (маппинг роутов, старт). Если `useLogger` вызвать позже, эти ранние логи ушли бы через стандартный консольный логгер — мимо Winston и New Relic. `bufferLogs` держит их в памяти до вызова `useLogger()`.

---

## 13. Использование в контроллерах и use-cases

```typescript
// apps/users/src/modules/users/users.controller.ts
import { CustomLogger } from '@app/logger'; // импорт из библиотеки — одинаков во всех микросервисах

// Контроллер
@Controller('users')
export class UsersController {
  constructor(private logger: CustomLogger) {
    // setContext задаёт sourceName для всех последующих логов этого экземпляра
    this.logger.setContext(UsersController.name);
  }

  @Post()
  createUser(@Body() dto: CreateUserDto) {
    this.logger.log('Creating user', UsersController.prototype.createUser.name);
    // Второй аргумент — functionName — помогает найти конкретный метод в логах
    return this.commandBus.execute(new CreateUserCommand(dto));
  }
}

// Use-case
@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(private logger: CustomLogger) {
    this.logger.setContext(CreateUserUseCase.name);
  }

  execute(command: CreateUserCommand) {
    this.logger.debug('Executing use case', 'execute');
    // ...
  }
}
```

**Доступные методы:**
```
logger.trace(message, functionName?)  — самый подробный уровень
logger.debug(message, functionName?)  — отладка
logger.log(message, functionName?)    — info (соответствует winston.info)
logger.warn(message, functionName?)   — предупреждение
logger.error(error, functionName?)    — ошибка (принимает Error или строку)
logger.fatal(message, functionName?)  — критическая ошибка
```

---

## 14. Регистрация AsyncLocalStorageService в дочерних модулях

`AsyncLocalStorageService` **не экспортируется** из `LoggerModule`. Поэтому каждый модуль, который напрямую инжектирует его (например, репозитории с прямым доступом к requestId), должен добавить его в `providers`:

```typescript
import { AsyncLocalStorageService } from '@app/logger'; // импорт из библиотеки

@Module({
  providers: [
    MyService,
    AsyncLocalStorageService, // ← добавить если нужен прямой доступ
  ],
})
export class MyModule {}
```

**Важно:** это НЕ создаёт отдельное хранилище. Все экземпляры `AsyncLocalStorageService` используют одну переменную `asyncLocalStorage`, объявленную на уровне файла. Смотри раздел 5.

Если `AsyncLocalStorageService` нужен только внутри `CustomLogger` (то есть ты его не инжектируешь напрямую в свои классы) — добавлять в `providers` модуля не нужно, `LoggerModule` уже сам его регистрирует.

---

## 15. New Relic — newrelic.js

В монорепе `newrelic.js` создаётся в корне **каждого приложения** (не в корне монорепы и не в библиотеке). Каждый микросервис — отдельный процесс Node.js со своим агентом и своим `app_name`.

```
apps/
├── users/
│   └── newrelic.js    # app_name: 'USERS-SERVICE'
└── orders/
    └── newrelic.js    # app_name: 'ORDERS-SERVICE'
```

Создать в корне **каждого приложения** `newrelic.js`:

```javascript
// newrelic.js
'use strict';

exports.config = {
  app_name: ['MY-SERVICE-NAME'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY || 'your-license-key-here',
  logging: {
    level: 'info',
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*',
    ],
  },
};
```

**Два независимых пути в New Relic:**
1. **NR Agent** (этот файл) — автоматически собирает метрики HTTP-запросов, трейсы, необработанные ошибки. Работает в любом окружении.
2. **Winston HTTP transport** — явные логи с `requestId`, `sourceName`, `functionName`. Активируется только при `ENV=PRODUCTION`.

---

## 16. Полная схема потока запроса

```
POST /users  (заголовок X-Request-Id: abc-123 или без него)
    │
    ▼
RequestContextMiddleware
  - читает или генерирует requestId = "abc-123"
  - AsyncLocalStorage.run(Map{ requestId: "abc-123" }, () => {
    │
    ▼
  UsersController.createUser()
    - logger.log("Creating user", "createUser")
      → super.log(...)           // NestJS ConsoleLogger: цветной вывод в терминал
      → WinstonService.info(     // Winston:
          "Creating user",
          requestId: "abc-123",  // ← автоматически из AsyncLocalStorage
          functionName: "createUser",
          sourceName: "UsersController"
        )
    │
    ▼
  CreateUserUseCase.execute()
    - logger.debug("Executing", "execute")
      → WinstonService.debug(..., requestId: "abc-123")
    - throw new Error("Unexpected error")
    │
    ▼
  AllExceptionsFilter.catch()
    - logger.error(exception, "All exception filter")
      → WinstonService.error(..., requestId: "abc-123")
    - response: HTTP 500
  })

Клиент получает: заголовок X-Request-Id: abc-123
```

В логах три записи с одинаковым `requestId: "abc-123"` — можно найти весь путь запроса.

---

## 17. Частые ошибки

**`getStore()` возвращает `undefined`**
— `next()` вызван вне колбека `asyncLocalStorageService.start()`. Проверь middleware.

**`CustomLogger` не инжектируется — ошибка при старте**
— Убедись что `LoggerModule.forRoot()` подключён в `AppModule` и что `ConfigModule` идёт перед ним.

**Логи при старте NestJS не попадают в Winston**
— Добавь `bufferLogs: true` в `NestFactory.create()` и вызови `app.useLogger(logger)` до `app.listen()`.

**`app.get(CustomLogger)` бросает ошибку**
— `CustomLogger` имеет `Scope.TRANSIENT`. Используй `await app.resolve(CustomLogger)`.

**`require('newrelic')` не в первой строке**
— New Relic агент должен быть загружен до любых других модулей. Даже одна строка `import` перед ним может нарушить перехват HTTP-запросов агентом.

**Дважды вижу одинаковые логи в консоли**
— Это нормально. `super.log()` (NestJS ConsoleLogger) и `WinstonService` (Console transport) — два независимых вывода. В продакшене можно отключить один из них, убрав Console transport из Winston.

---

## 18. Адаптация для minglo-blog (этот проект)

Раздел 12 инструкции описывает «эталонный» `main.ts`. В этом проекте архитектура отличается в трёх местах.

### 12a. `import` вместо `require` для New Relic

Инструкция требует `require('newrelic')` первой строкой. В проекте используется:

```typescript
import newrelic from 'newrelic';
```

Это допустимо, потому что TypeScript компилирует монорепу в CommonJS, и `import` как первая строка файла становится первым `require()` в скомпилированном JS. **Важно:** нельзя добавлять никакой другой `import` выше этой строки.

### 12b. Фильтры исключений — через `ExceptionsModule`, а не через `app.useGlobalFilters()`

В инструкции фильтры регистрируются вручную в `main.ts`:

```typescript
const allExceptionLogger = await app.resolve(CustomLogger);
app.useGlobalFilters(
  new AllExceptionsFilter(environmentSettings.isNonProduction, allExceptionLogger),
);
```

В этом проекте фильтры (`AllHttpExceptionsFilter`, `DomainHttpExceptionsFilter`) уже подключены через `ExceptionsModule` в `AppModule`:

```typescript
// libs/exceptions/src/exceptions.module.ts
{ provide: APP_FILTER, useClass: AllHttpExceptionsFilter },
{ provide: APP_FILTER, useClass: DomainHttpExceptionsFilter },
```

Поэтому в `main.ts` **ничего дополнительного регистрировать не нужно** — фильтры уже работают глобально.

### 12c. Проблема: `isNonProduction` не инжектируется при `useClass`

Оба фильтра ожидают в конструкторе:

```typescript
constructor(
  private isNonProduction: boolean,  // примитив — NestJS не умеет это инжектировать автоматически
  private logger: CustomLogger,
)
```

При регистрации через `useClass` NestJS пытается разрешить зависимости через DI. `boolean` — не провайдер, поэтому такая конфигурация **не работает** и при старте приложения упадёт с ошибкой.

**Решение:** заменить `useClass` на `useFactory` в `ExceptionsModule`, чтобы передавать `isNonProduction` явно:

```typescript
// libs/exceptions/src/exceptions.module.ts
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllHttpExceptionsFilter } from '@app/exceptions/filters/all-exceptions.filter';
import { DomainHttpExceptionsFilter } from '@app/exceptions/filters/domain-exceptions.filter';
import { CoreConfig } from '../../../apps/minglo-blog/src/core/core.config'; // или через провайдер
import { CustomLogger } from '@app/logger';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useFactory: (coreConfig: CoreConfig, logger: CustomLogger) => {
        return new AllHttpExceptionsFilter(coreConfig.isNonProduction, logger);
      },
      inject: [CoreConfig, CustomLogger],
    },
    {
      provide: APP_FILTER,
      useFactory: (coreConfig: CoreConfig, logger: CustomLogger) => {
        return new DomainHttpExceptionsFilter(coreConfig.isNonProduction, logger);
      },
      inject: [CoreConfig, CustomLogger],
    },
  ],
})
export class ExceptionsModule {}
```

> `CustomLogger` доступен без импорта `LoggerModule` в `ExceptionsModule`, потому что `LoggerModule` объявлен `@Global()`. Нужно только убедиться что в `AppModule` `LoggerModule.forRoot(...)` стоит **до** `ExceptionsModule`.

Либо — другой вариант — убрать `isNonProduction` из конструктора фильтра и получать его напрямую из инжектируемого `CoreConfig` внутри фильтра:

```typescript
// libs/exceptions/src/filters/all-exceptions.filter.ts
@Catch()
export class AllHttpExceptionsFilter implements ExceptionFilter {
  constructor(
    private coreConfig: CoreConfig,  // ← вместо boolean
    private logger: CustomLogger,
  ) {
    this.logger.setContext(AllHttpExceptionsFilter.name);
  }

  catch(exception: any, host: ArgumentsHost): void {
    // this.coreConfig.isNonProduction вместо this.isNonProduction
  }
}
```

В этом случае `useClass` снова работает корректно, и `ExceptionsModule` возвращается к простой форме.

### Итоговое состояние `main.ts` для этого проекта

Всё что нужно для логгера в `main.ts` уже реализовано:

```
✅  import newrelic from 'newrelic'         — первая строка
✅  { bufferLogs: true }                    — в NestFactory.create()
✅  await app.resolve(CustomLogger)         — TRANSIENT, нужен resolve()
✅  logger.setContext('NEST_INIT')
✅  app.useLogger(logger)
✅  AllHttpExceptionsFilter                 — через ExceptionsModule (после фикса DI)
✅  DomainHttpExceptionsFilter              — через ExceptionsModule (после фикса DI)
```

Единственное что осталось сделать — исправить `ExceptionsModule` (или сами фильтры), чтобы `isNonProduction` разрешался через DI, а не передавался как примитив в `useClass`.