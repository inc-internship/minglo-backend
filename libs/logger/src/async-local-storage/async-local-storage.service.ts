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
