import type { Component } from "solid-js";

const PostButton: Component<{
    href: string,
    value: string,
    disabled?: boolean,
}> = (props) => {
    return <form action={props.href} method="post" style={{
        display: "inline-block",
    }}>
        <input class="button submit-button post-button" type="submit" value={props.value} disabled={props.disabled}/>
    </form>
}

export default PostButton;
