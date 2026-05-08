import { ValidationError } from '@nestjs/common';
import { Extension } from 'libs/exceptions/src/index';

/* функция использует рекурсию для обхода объекта children при вложенных полях, при валидации */
export const errorFormatter = (errors: ValidationError[], errorMessage?: any): Extension[] => {
  const errorsForResponse = errorMessage || [];

  for (const error of errors) {
    if (!error.constraints && error.children?.length) {
      errorFormatter(error.children, errorsForResponse);
    } else if (error.constraints) {
      const constrainKeys = Object.keys(error.constraints);

      for (const key of constrainKeys) {
        errorsForResponse.push({
          message: error.constraints[key]
            ? `${error.constraints[key]}; Received value: ${error?.value}`
            : '',
          field: error.property,
        });
      }
    }
  }

  return errorsForResponse;
};
