import { type IRouter } from "express";

export interface Controller {
    mount(router: IRouter): void;
}
