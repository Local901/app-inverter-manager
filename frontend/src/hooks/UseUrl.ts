import { createSignal } from "solid-js"

const [url, setUrl] = createSignal(new URL(window.location.href));

const resetUrl = () => {
    if (url().href === window.location.href) {
        return;
    }
    setUrl(new URL(window.location.href));
}

window.addEventListener("hashchange", (event) => {
    setUrl(new URL(event.newURL));
});
window.addEventListener("popstate", resetUrl);
window.addEventListener("click", resetUrl);

export function useUrl() { return url; }
