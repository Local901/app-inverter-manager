import { HttpError } from "./HttpError.js";

export class NotFound extends HttpError {
    public constructor() {
        super("Not found.", 404);
    }
}
