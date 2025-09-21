
export async function send(url: string, method: string, body: Record<string, unknown>): Promise<void> {
    await fetch(url, {
        method,
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
        },
    });
}
