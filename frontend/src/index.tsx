import { Router, Route } from "@solidjs/router";
import { render } from "solid-js/web";
import { HomePage } from "./page/Home";
import { Center } from "./components/center";
import { Stack } from "./components/stack";
import { Direction } from "./types/Direction";
import { NavBar } from "./components/navbar";
import { InvertersPage } from "./page/Inverters";
import { InverterPage } from "./page/Inverter";
import { InverterSettingsPage } from "./page/InverterSettings";

const container = document.querySelector("#root");

if (!container) {
    throw new Error("No container found with id 'root'");
}

void render(() => (
    <Center height="100%">
        <Stack direction={Direction.Vertical} height="100%">
            <NavBar/>
            <main style={{ "flex-grow": 1 }}>
                <Router>
                    <Route path="/" component={HomePage}/>
                    <Route path="/inverter" component={InvertersPage}/>
                    <Route path="/inverter/:id" component={InverterPage}/>
                    <Route path="/inverter/:id/settings" component={InverterSettingsPage}/>
                </Router>
            </main>
        </Stack>
    </Center>
), container);
