import { AnyZodObject, ZodError } from 'zod'

import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
  Type,
  ValidationError,
} from '@nestjs/common'

/**
 * A validation pipe from `zod` validation schema.
 *
 * @export
 * @class ZodValidatorPipe
 * @implements {PipeTransform}
 * @template T The type of the `zod` validation schema.
 */
export class ZodValidatorPipe<T extends AnyZodObject> implements PipeTransform {
  constructor(
    protected readonly input: T,
    protected readonly klass: Type<any>
  ) {}

  async transform(value: any, _metadata: ArgumentMetadata): Promise<any> {
    try {
      return await this.input.parseAsync(value, { async: true })
    }
    catch (error_) {
      const error = error_ as ZodError

      const message = error.issues.map(issue => {
        const property = String(issue.path[ issue.path.length - 1 ])
        return {
          property,
          value: issue.path.reduce((prev, curr) => {
            if (!prev) return
            if (typeof prev !== 'object') return
            return prev[ curr ]
          }, value),
          constraints: {
            [ issue.code ]: issue.message
          },
        } as ValidationError
      })

      throw new BadRequestException(message, 'Validation Exception')
    }
  }
}
