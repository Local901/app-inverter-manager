import { Direction } from "../../types/Direction";
import { Stack } from "../stack";
import { Component } from "solid-js";
import { NavButton } from "../navButton";

export const NavBar: Component = () => {
    return <nav class="navbar">
        <Stack direction={Direction.Horizontal}>
            {/* <NavButton href="/">Home</NavButton> */}
            <NavButton href="/inverter">Inverter</NavButton>
            <NavButton href="/schedule">Schedule</NavButton>
            <div style={{ "flex-grow": 1 }}/>
        </Stack>
    </nav>
}

export const InverterNavBar: Component<{
    id: string;
}> = ({ id }) => {
    return <nav class="navbar">
        <Stack direction={Direction.Horizontal}>
            <NavButton href={`/inverter/${id}`}>Overview</NavButton>
            <div style={{ "flex-grow": 1 }}/>
            <NavButton href={`/inverter/${id}/settings`}>Settings</NavButton>
        </Stack>
    </nav>
}
