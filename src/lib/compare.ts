import { z } from "zod";

export function equals(a: z.AnyZodObject, b: z.AnyZodObject): boolean {
  if (a.shape === undefined || b.shape === undefined) {
    return false;
  }

  const aKeys = Object.keys(a.shape);
  const bKeys = Object.keys(b.shape);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  for (let i = 0; i < aKeys.length; i++) {
    const aKey = aKeys[i];

    const aType = a.shape[aKey];
    const bType = b.shape[aKey];

    if (bType === undefined) {
      return false;
    }

    if (aType instanceof z.ZodObject && bType instanceof z.ZodObject) {
      if (!equals(aType, bType)) {
        return false;
      }
    } else if (aType instanceof z.ZodArray && bType instanceof z.ZodArray) {
      if (!equals(aType.element, bType.element)) {
        return false;
      }
    } else if (
      !(aType instanceof z.ZodString && bType instanceof z.ZodString) &&
      !(aType instanceof z.ZodNumber && bType instanceof z.ZodNumber) &&
      !(aType instanceof z.ZodBoolean && bType instanceof z.ZodBoolean)
    ) {
      return false;
    }
  }

  return true;
}