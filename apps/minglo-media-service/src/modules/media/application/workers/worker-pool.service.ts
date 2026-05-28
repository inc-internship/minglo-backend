import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Piscina from 'piscina';
import { join } from 'path';
import { PassThrough, Readable } from 'node:stream';
import { MessageChannel } from 'node:worker_threads';

@Injectable()
export class WorkerPoolService implements OnModuleDestroy {
  private readonly pool: Piscina;
  constructor() {
    this.pool = new Piscina({
      filename: join(__dirname, '../../workers/image-processor.worker.js'),
    });
  }
  async processImage(fileStream: Readable) {
    const { port1, port2 } = new MessageChannel();

    const mainStream = new PassThrough();
    const thumbStream = new PassThrough();

    let finished = 0;
    const checkDone = () => {
      finished++;
      if (finished === 2) port1.close();
    };

    this.pool.run({ port: port2 }, { transferList: [port2] });

    port1.on('message', (msg) => {
      switch (msg.type) {
        case 'READY':
          fileStream.on('data', (chunk) => port1.postMessage({ type: 'DATA', chunk }));
          fileStream.on('end', () => port1.postMessage({ type: 'END' }));
          break;
        case 'MAIN_DATA':
          mainStream.write(msg.chunk);
          break;
        case 'THUMB_DATA':
          thumbStream.write(msg.chunk);
          break;
        case 'MAIN_END':
          mainStream.end();
          checkDone();
          break;
        case 'THUMB_END':
          thumbStream.end();
          checkDone();
          break;
        case 'ERROR': {
          const error = new Error(msg.message || 'Worker error');
          mainStream.destroy(error);
          thumbStream.destroy(error);
          port1.close();
          break;
        }
      }
    });

    fileStream.on('error', (err) => {
      port1.postMessage({ type: 'CANCEL', reason: err.message });
      mainStream.destroy(err);
      thumbStream.destroy(err);
    });

    return {
      main: mainStream,
      thumb: thumbStream,
    };
  }

  async onModuleDestroy() {
    await this.pool.destroy();
  }
}
