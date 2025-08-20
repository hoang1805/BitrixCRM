import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function UniqueByField<T = any>(
  field: keyof T,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'uniqueByField',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [field],
      validator: {
        validate(value: any[], args: ValidationArguments) {
          if (!Array.isArray(value)) return false;

          const fieldName = args.constraints[0] as string;
          const values = value
            .map((item) => item?.[fieldName])
            .filter((v) => v !== undefined && v !== null);

          return new Set(values).size === values.length;
        },
        defaultMessage(args: ValidationArguments) {
          const fieldName = args.constraints[0];
          return `Each ${fieldName} in ${args.property} must be unique`;
        },
      },
    });
  };
}
