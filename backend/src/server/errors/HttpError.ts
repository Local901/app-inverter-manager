import { type Response } from "express";

export class HttpError extends Error {
    public readonly status: number;
    private readonly response: unknown;

    public constructor(message: unknown, status = 500) {
        if (typeof message === "string") {
            super(message);
        } else {
            super();
        }
        this.status = status;
        this.response = message;
    }

    public sendMessage(res: Response) {
        if (typeof this.response === "string") {
            res.status(this.status).send(this.response);
        } else {
            res.json(this.response);
        }
    }
}
