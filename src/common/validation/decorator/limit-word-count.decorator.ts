import {
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';

/**
 * Limit word count validation decorator
 * @param limit
 * @param validationOptions
 * @returns
 */
export function LimitWordCount(
  limit: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'limitWordCount',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [limit],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [limit] = args.constraints;
          if (typeof value !== 'string') return false;
          const words = value.trim().split(/\s+/); // split by space
          return words.length <= limit;
        },
        defaultMessage(args: ValidationArguments) {
          const [limit] = args.constraints;
          return `Word count must not exceed ${limit} words.`;
        },
      },
    });
  };
}
