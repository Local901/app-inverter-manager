import type { Validator } from "@local901/validator/Validator";
import { createResource, type ResourceReturn } from "solid-js";

export function validateFetchOne<T>(url: string | URL | (() => (string | URL)), validator: Validator<T>, init?: RequestInit): ResourceReturn<T | undefined> {
    return createResource(async () => {
        try {
            const response = await fetch(typeof url === "function" ? url() : url, init);
            if (!response.ok) {
                return undefined;
            }

            const obj = await response.json();
            if (!validator.validate(obj)) {
                return undefined;
            }
            return obj;
        } catch {
            return undefined;
        }
    });
}

export function validateFetchMany<T>(url: string | URL | (() => (string | URL)), validator: Validator<T>, init?: RequestInit): ResourceReturn<T[] | undefined> {
    return createResource(async () => {
        try {
            const response = await fetch(typeof url === "function" ? url() : url, init);
            if (!response.ok) {
                return undefined;
            }

            const arr = await response.json();
            if (!Array.isArray(arr) || arr.some((i) => !validator.validate(i))) {
                return undefined;
            }
            return arr;
        } catch {
            return undefined;
        }
    });
}
