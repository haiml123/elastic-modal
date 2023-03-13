import React, {ReactElement} from "react";
import {ElasticModalAction, ElasticModalProps, PopupPosition} from "../types";

export const enum ElasticModalState {
    NONE,
    HIDE,
    OPENED,
    CLOSED
}

export const POSITION_TYPES: PopupPosition[] = [
    'top left',
    'top center',
    'top right',
    'right top',
    'right center',
    'right bottom',
    'bottom left',
    'bottom center',
    'bottom right',
    'left top',
    'left center',
    'left bottom',
    'center center',
];

export const ElasticPopupEvents = {
    ON_INIT: 'onInit',
    CALC_SIZE: 'onCalcSize',
    ON_SCROLL: 'onScroll',
    ON_MOUSE_DOWN: 'onMouseDown',
    ON_MOUSE_UP: 'onMouseUp',
    ON_SCREEN_RESIZE: 'onScreenResize',
    ON_SHOW: 'onShow',
    ON_SHOW_RENDERED: 'onShowRendered',
    ON_HIDE: 'onHide',
    ON_CLOSE: 'onClose',
    ON_POSITION_CHANGED: 'onPositionChanged',
    ON_INIT_POSITION: 'onInitPosition',
    ON_SIZE_CHANGED: 'onSizeChanged',
    ON_WRAPPER_CREATED: 'onWrapperCreated',
    ON_OPTIONS_CHANGED: 'onOptionsChanged',
    OM_POPUP_INITIAL_SHOW: 'onPopupInitialShow',
    OM_POPUP_SELECTED: 'onPopupSelected',
    ON_POPUP_DESTROYED: 'onPopupDestroyed'
}

export const BROWSER_EVENTS = {
    ON_MOUSE_DOWN: 'onMouseDown',
    ON_SCREEN_RESIZE: 'onScreenResize',
    ON_MOUSE_UP: 'onMouseUp',
    ON_MOUSE_MOVE: 'onMouseMove',
    ON_SCROLL: 'onScroll'
}

export const STORE_ACTIONS: {[key: string] : ElasticModalAction} = {
    REGISTER: 'register',
    SHOW: 'show',
    HIDE: 'hide',
    CLOSE: 'close',
    SET_POSITION: 'setPosition',
    SET_CORDS: 'setCord',
    SET_CORDS_BATCH: 'setCordBatch',
    SET_META: 'setMeta',
    BACKDROP_CLICKED: 'backdropClicked',
    PLUGINS_REGISTRY_UPDATED: 'pluginsRegistryUpdated',
}
