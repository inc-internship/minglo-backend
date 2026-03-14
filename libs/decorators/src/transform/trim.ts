import { Transform, TransformFnParams } from 'class-transformer';

/* Декоратор для автоматического обрезания пробелов в начале и конце строки */
export const Trim = () => {
  return Transform(({ value }: TransformFnParams) => {
    return typeof value === 'string' ? value.trim() : value;
  });
};
