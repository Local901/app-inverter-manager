import { type JSX, type ParentComponent } from "solid-js";

export const Form: ParentComponent<{
    action: string,
    method: string,
    class?: string,
    uploadFiles?: boolean,
    onSubmit?: (formData: FormData) => Promise<void>,
    postSubmit?: (error?: Error) => void | Promise<void>,
    defaultBehavior?: boolean;
}> = (props) => {
    const onSubmit: JSX.EventHandler<HTMLFormElement, SubmitEvent> = async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        try {
            if (props.onSubmit) {
                await props.onSubmit(formData);
            } else {
                const response = await fetch(props.action, {
                    method: props.method,
                });
            }
            props.postSubmit?.();
        } catch (e) {
            props.postSubmit?.(e as Error | undefined);
        }
    }

    return <form
        class={props.class}
        action={props.action}
        method={props.method.toLowerCase() !== "get" ? "post" : "get"}
        enctype={props.uploadFiles ? "multipart/form-data" : undefined}
        onSubmit={props.defaultBehavior ? undefined : onSubmit}
    >
        {props.children}
    </form>
}
