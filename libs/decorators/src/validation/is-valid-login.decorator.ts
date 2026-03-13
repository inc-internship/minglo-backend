import { applyDecorators } from '@nestjs/common';
import { Matches } from 'class-validator';
import { IsStringWithTrim } from '@app/decorators/validation/is-string-with-trim';

type Params = {
  min: number;
  max: number;
  regex: RegExp;
  regexMessage: string;
};

/**
 * Validates login value:
 * - trims whitespace
 * - checks length
 * - validates against a custom regex with a custom message
 *
 * @param param Object with `min`, `max`, `regex`, and `message`
 */
export const IsValidLogin = ({ min, max, regex, regexMessage }: Params) =>
  applyDecorators(
    IsStringWithTrim(min, max),
    Matches(regex, {
      message: regexMessage,
    }),
  );
