import type { Validator } from "@local901/validator";

export type VType<T extends Validator> = T extends Validator<infer I> ? I : never;