import { createContext, useContext } from "react";

/** False while the intro curtain is covering the page; hero animations wait for it to lift. */
export const IntroContext = createContext<boolean>(true);
export const useIntroReady = () => useContext(IntroContext);
