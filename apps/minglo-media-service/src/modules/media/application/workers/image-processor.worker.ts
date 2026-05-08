import sharp from 'sharp';
import { Readable } from 'node:stream';

export default ({ port }) => {
  const inputStream = new Readable({
    read() {},
  });

  const processor = sharp();

  const mainPipeline = processor.clone().resize(800).webp({ quality: 80 });
  const thumbPipeline = processor.clone().resize(300).webp({ quality: 60 });

  mainPipeline.on('data', (chunk) => port.postMessage({ type: 'MAIN_DATA', chunk }));
  mainPipeline.on('end', () => port.postMessage({ type: 'MAIN_END' }));

  thumbPipeline.on('data', (chunk) => port.postMessage({ type: 'THUMB_DATA', chunk }));
  thumbPipeline.on('end', () => port.postMessage({ type: 'THUMB_END' }));

  port.on('message', (msg) => {
    if (msg.type === 'DATA') {
      inputStream.push(msg.chunk);
    } else if (msg.type === 'END') {
      inputStream.push(null);
    }
  });

  inputStream.pipe(processor);

  port.postMessage({ type: 'READY' });
};
