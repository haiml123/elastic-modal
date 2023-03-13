import {useEffect} from "react";

export const useHandlerOnEvent = (eventName: string, elem: HTMLElement | Window | Document | null, handler: (e: any) => void, deps: any[], activeEvent = true) => {
    useEffect(() => {
        const target = elem || document;
        if (!activeEvent) return;
        const listener = (e: any) => {
            handler(e);
        };

        target.addEventListener(eventName, listener);

        return () => {
            if (!activeEvent) return;
            target.removeEventListener(eventName, listener);
        };
    }, deps);
};