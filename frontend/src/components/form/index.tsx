import { type JSX, type ParentComponent } from "solid-js";

const dateRegex = /\d+-\d+-\d+T/

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
        event.stopPropagation();

        const form = event.target as HTMLFormElement;
        form.method = "dialog";
        const formData = new FormData(form);
        formData.forEach((value, key) => {
            // Update local date strings to ISO strings.
            if (dateRegex.test(value.toString())) {
                formData.set(key, new Date(value.toString()).toISOString());
            }
        })

        try {
            if (props.onSubmit) {
                await props.onSubmit(formData);
            } else {
                const response = await fetch(props.action, {
                    method: props.method,
                    body: props.method.toLowerCase() !== "get"
                        // @ts-expect-error formData does still work even when the type is not included.
                        ? new URLSearchParams(formData)
                        : undefined,
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
