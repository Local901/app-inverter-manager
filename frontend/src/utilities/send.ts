
export function sendJson(
    url: string,
    method: string,
    callback?: (response: Response) => Promise<void> | void,
    mapper?: (key: string, value: FormDataEntryValue | null, formDate: FormData) => unknown,
): (data: FormData) => Promise<void> {
    return async (data) => {
        const body: Record<string, unknown> = {};

        for (const key of data.keys()) {
            const path = key.split(".");
            let current = body;

            for (let i = 0; i < path.length - 1; i++) {
                const section = path[i];
                if (!(current[section] === undefined || typeof current[section] === "object")) {
                    throw new Error(`Path collision: Section ${section} in path ${key} was already used for something else.`);
                }
                current = (current[section] ??= {}) as Record<string, unknown>;
            }
            const property = path.pop() as string; // The list is always one element long.
            let value = data.get(key);
            if (mapper) {
                // @ts-expect-error Not correct type.
                value = mapper(key, value, data);
            }
            current[property] = value;
        }

        const response = await fetch(url, {
            method,
            body: JSON.stringify(body),
            headers: new Headers({
                "Content-Type": "application/json",
            }),
        });

        await callback?.(response);
    }
}
