import { applyDecorators } from '@nestjs/common';
import { IsDateString, registerDecorator, ValidationOptions } from 'class-validator';

const MIN_AGE = 13;

function BirthdayAgeConstraint(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'birthdayAgeConstraint',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: string): boolean {
          if (!value) return true; // handled by @IsOptional / @IsDateString
          const date = new Date(value);
          if (isNaN(date.getTime())) return false;

          const now = new Date();
          if (date > now) return false;

          const minAge = new Date();
          minAge.setFullYear(minAge.getFullYear() - MIN_AGE);
          return date <= minAge;
        },
        defaultMessage(): string {
          return `Birthday must be in the past and user must be at least ${MIN_AGE} years old`;
        },
      },
    });
  };
}

/**
 * Validates birthday value:
 * - must be a valid ISO date string
 * - must not be in the future
 * - user must be at least 13 years old
 */
export const IsBirthdayValid = () => applyDecorators(IsDateString(), BirthdayAgeConstraint());
