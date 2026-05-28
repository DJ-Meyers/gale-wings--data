import { z, type ZodType } from "zod";

const uniqueArraySchema = <T extends ZodType>(schema: T) =>
    z.array(schema)
    .refine((items) => new Set(items).size === items.length, {
        message: 'All entries must be unique'
    })

export {
    uniqueArraySchema
}