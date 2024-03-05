import {
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';

/**
 * Validates that a string contains only alphanumeric characters and additional specified characters.
 * @param allowedChars Array of additional characters to allow in the validation.
 * @param validationOptions Options for the validation.
 * @returns Decorator function.
 */
export function IsAlphaNumeric(
  allowedChars: string[] = [],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAlphaNumeric',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          // Escape special regex characters in the allowed characters list
          const escapedChars = allowedChars.map((char) => `\\${char}`).join('');
          const regex = new RegExp(`^[a-zA-Z0-9 ${escapedChars}]+$`);
          return regex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${
            args.property
          } must contain only alphanumeric characters and the following additional characters: ${allowedChars.join(
            ', ',
          )}.`;
        },
      },
    });
  };
}
