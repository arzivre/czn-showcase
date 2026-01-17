import { createServerFn } from "@tanstack/react-start";
import { protectedFunctionMiddleware } from "../middleware/auth";

export const basePostFunction = createServerFn({ method: 'POST' }).middleware([
    protectedFunctionMiddleware,
]);
