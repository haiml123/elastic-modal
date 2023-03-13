import React, {ReactNode} from "react";
import {ElasticModalState} from "./elastic-modal/elastic-modal.types";

export type Nullable<T> = T | null;
export type Undefinable<T> = T | undefined;

export type KeyValue = Record<string, unknown>;

export type styleField = Record<string, unknown>;

export type Position = Nullable<{
    top?:  Nullable<number>;
    left?: Nullable<number>;
}>;

export type Size = Nullable<{
    width?: number | string;
    height?: number | string;
}>;

export type ElasticModalAction = 'register' | 'show' | 'hide' | 'close' | 'setPosition' | 'setCord' | 'setCordBatch' | 'setMeta' | 'backdropClicked' | 'pluginsRegistryUpdated';

export type ElasticModalOptions = {
    showOverlay?: boolean,
    closeOnOverlayClicked?: boolean,
    overlayStyle?: styleField,
    overlayClasses?: string,
    onOverlayClicked?: Nullable<(e: MouseEvent) => void>, //global event for all modals,
    popupStyle?: styleField,
    popupClasses?: string,
    onPopupClosed?: Nullable<(e: MouseEvent) => void>,
    onPopupOpened?: Nullable<(e: MouseEvent) => void>,
    onPopupHovered?: Nullable<(e: MouseEvent) => void>,
    onPopupClicked?: Nullable<(e: MouseEvent) => void>,
}

export type ActionStore = {
    type: ElasticModalAction;
    payload?: any
}

export interface ElasticModalProps {
    children: ReactNode,
    plugins?: ElasticPlugin[],
    globalOptions?: ElasticModalOptions
}

export type MetaState = {
    viewState: number,
    showTop: boolean,
    showLeft: boolean,
    showWidth: boolean,
    showHeight: boolean
} & object;

export interface ElasticModalInstance {
    args: any;
    height: number;
    left: number;
    meta: MetaState;
    options: any;
    prevHeight: number
    prevLeft: number;
    prevOptions: any;
    prevShow: boolean
    prevTop: number
    prevWidth: number
    show: boolean
    top: number;
    visible: number;
    width: number;
}

export interface ElasticPlugin {
    onInit?: (payload: any)=> void;
    onMouseDown?: (ev: MouseEvent) => void;
    onMouseUp?: (ev: MouseEvent) => void;
    onScroll?: (ev: any) => void;
    onScreenResize?: (ev: any) => void;
    onShowRendered?: (onShowRendered: any) => void;
    onInitPosition?: (payload: any, prevValue: any) => void;
    onSizeChanged?: (payload: any) => void;
    onCalcSize?: (payload: any) => void;
    onShow?:(payload: any) => void;
    onPopupInitialShow?:(payload: any) => void;
    onHide?:(payload: any) => void;
    onClose?:(payload: any) => void;
    onOptionsChanged?:(options: any, globalOptions: ElasticModalOptions) => void;
    onWrapperCreated?:(payload: any) => void;
    onPopupSelected?:(payload: any) => void;
    onPopupDestroyed?:(payload: any) => void;
    globalView?: () => React.FC<ElasticModalProps>;
    onDestroy?: () => void;
}

export type PluginRegistry = {
    key: string;
    plugin: ElasticPlugin;
    priority: number;
}

export type ElasticModal = {
    id: string;
    visible: boolean,
    selected: boolean,
    pos: Position;
    size: Size;
    state: ElasticModalState;
    props: Record<string, unknown>;
    meta?: {
        [key: string]: any;
    }
}

export type ElasticModalMap = {
    [key: string] : ElasticModal
}


export type ElasticModalContext = {
    modals: ElasticModalMap;
    stack: string[];
    plugins?: any[];
    options: any;
}


export type PopupPosition =
    | 'top left'
    | 'top center'
    | 'top right'
    | 'right top'
    | 'right center'
    | 'right bottom'
    | 'bottom left'
    | 'bottom center'
    | 'bottom right'
    | 'left top'
    | 'left center'
    | 'left bottom'
    | 'center center';


//events payload:
export type OnSizeChangedPayload = {
    newSize: {width: number, height: number},
}


export type EventProps = {
    id: string,
    width: number,
    height: number,
    left: number,
    top: number,
    meta: any,
    args: any,
    options: object,
    prevOptions: object
}