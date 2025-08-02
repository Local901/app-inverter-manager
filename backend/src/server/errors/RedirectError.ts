import { HttpError } from "./HttpError.js";
import { type Response } from "express";

export class redirectError extends HttpError {
    public constructor(public readonly href: string) {
        super("", 302);
    }

    public override sendMessage(res: Response) {
        res.redirect(this.href);
    }
}
