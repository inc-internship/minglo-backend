import { applyDecorators } from '@nestjs/common';
import { IsEmail, IsString } from 'class-validator';
import { Trim } from '@app/decorators/transform';

/**
 * Validates email value:
 * - trims whitespace
 * - validates email value
 */
export const IsValidEmail = () => applyDecorators(Trim(), IsString(), IsEmail());
