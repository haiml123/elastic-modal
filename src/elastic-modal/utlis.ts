
// Our hook
import {useEffect, useState} from "react";
import { Position } from "../types";

export default function useDebounce(value: any, delay: number) {
    // State and setters for debounced value
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(
        () => {
            // Set debouncedValue to value (passed in) after the specified delay
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);
            return () => {
                clearTimeout(handler);
            };
        },
        // Only re-call effect if value changes
        // You could also add the "delay" var to inputs array if you ...
        // ... need to be able to change that dynamically.
        [value, delay]
    );

    return debouncedValue;
}

export function moveToEndOfStack<T>(arr: T[], target: T): T[] {
    const index = arr.findIndex((elem) => elem === target);
    if(index > -1) {
        arr.splice(index, 1);
    }
    arr.push(target);
    return arr;
}

export function removeFromStack<T>(arr: T[], target: T): T[] {
    const index = arr.findIndex((elem) => elem === target);
    if(index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}

export function moveEndToStartStack<T>(arr: T[]): T[] {
    if(arr) {
        // @ts-ignore
        arr.unshift(arr.pop());
    }
    return arr;
}


export const getPopupBoundary = (keepTooltipInside: string | Boolean) => {
    // add viewport
    let boundingBox = {
        top: 0,
        left: 0,
        /* eslint-disable-next-line no-undef */
        width: window.innerWidth,
        /* eslint-disable-next-line no-undef */
        height: window.innerHeight,
    };
    if (typeof keepTooltipInside === 'string') {
        /* eslint-disable-next-line no-undef */
        const selector = document.querySelector(keepTooltipInside);
        if (process.env.NODE_ENV !== 'production') {
            if (selector === null)
                throw new Error(
                    `${keepTooltipInside} selector does not exist : keepTooltipInside must be a valid html selector 'class' or 'Id'  or a boolean value`
                );
        }
        if (selector !== null) boundingBox = selector.getBoundingClientRect();
    }

    return boundingBox;
};

export function isDefined(v: any): boolean {
   return v !== undefined && v !== null;
}

export function isString(v: any): boolean {
    return typeof v == "string";
}

export function isNumber(v: any): boolean {
    return !isNaN(v);
}

export function validateUnit(size: number | string): string | number {
    let validSize = size;
    if(isNumber(size)) {
        validSize = `${size}px`;
    }
    return validSize;
}

export function isOptionsPositionChanged(prevOptions: any, options: any): boolean {
    return !prevOptions || (((isDefined(options.position.top) && prevOptions.position.top !== options.position.top) ||
        (isDefined(options.position.left) && prevOptions.position.left !== options.position.left)));
}

export function isPosChanged(p1: Position, p2: Position): boolean {
    return !p1 || !!(p2 && p1.top !== p2.top) || !!(p2 && p1.top !== p2.top);
}

export function getPopupOption(key: string, popup: any, globalOptions: any) {
    return popup && popup.options && isDefined(popup.options[key]) ? popup.options[key] : globalOptions && globalOptions[key];
}