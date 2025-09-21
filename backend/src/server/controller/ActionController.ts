import { type IRouter, type RequestHandler, Router } from "express";
import type { Controller } from "./Controller.js";
import type { ActionRepository } from "../../repository/ActionRepository.js";
import { JsonEndpoint } from "../endpoints/JsonEndpoint.js";
import { ActionTypes, actionConfig } from "../../config/Action.js";
import type { ActionCreationInfo } from "../../types/Action.js";
import { NotFound } from "../errors/NotFound.js";
import { v } from "@local901/validator";
import { redirectError } from "../errors/RedirectError.js";

const idValidator = v.object({
    id: v.string({ regex: /^[1-9][0-9]*|0$/ }),
});

const createActionParams = v.object({
    type: v.string<ActionTypes>({ enum: ActionTypes }),
})

export class ActionController implements Controller {
    public constructor(private readonly actionRepository: ActionRepository) {}

    private getAction(): RequestHandler {
        return JsonEndpoint<{ id: string }>(async (req) => {
            if (!idValidator.validate(req.params)) {
                throw new NotFound();
            }

            const action = await this.actionRepository.getAction(Number.parseInt(req.params.id));
            if (!action) {
                throw new NotFound();
            }

            return action.getMessage(action.activeFrom, action.activeUntil);
        });
    }
    
    private createAction(): RequestHandler {
        return JsonEndpoint<{ type: string }, {}, Record<keyof ActionCreationInfo, string>>(async (req) => {
            if (!createActionParams.validate(req.params)) {
                throw new NotFound();
            }

            const id = Number.parseInt(req.body.inverterId);
            const type = req.params.type;

            await this.actionRepository.createAction({
                inverterId: id,
                action: type,
                value: Number.parseInt(req.body.value),
                repeatWeekly: req.body.repeatWeekly === "true",
                activeFrom: new Date(req.body.activeFrom),
                activeUntil: new Date(req.body.activeUntil),
            });

            throw new redirectError(`/inverter/${id}`)
        });
    }

    private deleteAction(): RequestHandler {
        return JsonEndpoint<{ id: string }, {}, { from?: string, to?: string }>((req) => {
            if (!idValidator.validate(req.params)) {
                throw new NotFound();
            }

            const id = Number.parseInt(req.params.id);

            if (req.body.to) {
                this.actionRepository.splitAction(id, req.body.from ? new Date(req.body.from) : new Date(), new Date(req.body.to))
            } else {
                this.actionRepository.endActionAt(id, req.body.from ? new Date(req.body.from) : new Date());
            }
        });
    }

    /** @inheritdoc */
    public mount(router: IRouter): void {
        const actionRouter = Router();
        
        actionRouter.get(/\/(?<id>\d+)\/?$/, this.getAction());
        actionRouter.delete(/\/(?<id>\d+)\/?$/, this.deleteAction());
        actionRouter.post(/\/create\/(?<type>.+)\/?$/, this.createAction());
        actionRouter.post(/\/delete\/(?<id>.+)\/?$/, this.deleteAction());


        actionRouter.get("/types", JsonEndpoint(() => Object.keys(actionConfig)));
        
        router.use("/action", actionRouter);
    }
}
