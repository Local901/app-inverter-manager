import type { Request, RequestHandler, Response } from "express";
import { HttpError } from "../errors/HttpError.js";
import { ValidationError } from "@local901/validator";

export type Query = Record<string, undefined | string | Array<string>>;

export function JsonEndpoint<
    PARAMS extends Record<string, unknown> = {},
    QUERY extends Query = {},
    BODY = unknown,
    RESPONSE = unknown,
>(
    handler: (req: Request<PARAMS, RESPONSE, BODY, QUERY>, res: Response<RESPONSE>) => Promise<void | RESPONSE> | void | RESPONSE,
): RequestHandler {
    return async (req, res, next) => {
        try {
            const response = await handler(req as Request<PARAMS, RESPONSE, BODY, QUERY>, res);
            if (res.headersSent) {
                return;
            }
            if (response === undefined) {
                res.end();
                return;
            }
            res.json(response);
        } catch (e) {
            if (!res.headersSent) {
                if (e instanceof HttpError) {
                    e.sendMessage(res);
                    if (!res.headersSent) {
                        next();
                    }
                    return;
                }
                if (e instanceof ValidationError) {
                    res.status(401).json(e.toJson());
                    return;
                }
            }
            if (!res.headersSent && e instanceof HttpError) {
                e.sendMessage(res);
                if (!res.headersSent) {
                    next();
                }
                return;
            }
            console.error(e);
            next(e);
        }
    }
}
