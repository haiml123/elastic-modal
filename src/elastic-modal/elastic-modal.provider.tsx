import React, {
    memo,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef
} from "react"
import {useImmerReducer} from "use-immer";

import {publish, subscribe} from "./eventManager";
import Overlay from "./overlay";
import {useHandlerOnEvent} from "./hooks";
import {getPopupOption, isDefined, validateUnit} from "./utlis";
import MinimizePlugin from "./extra-plugins/minimize.plugin";
import DraggingPlugin from "./extra-plugins/dragging.plugin";
import ResizePlugin from "./extra-plugins/resize.plugin";
import {PopoverPlugin} from "./extra-plugins/popover.plugin";
import {CorePlugin} from "./core-plugins/core.plugin";
import {FocusTrapPlugin} from "./core-plugins/focus-trap.plugin";
import {
    ElasticModalAction,
    ElasticModalContext,
    ElasticModalOptions,
    ElasticModalProps, ElasticPlugin, EventProps, Nullable, OnSizeChangedPayload, PluginRegistry,
    Position,
    Size, Undefinable
} from "../types";
import {elasticModalReducer} from "./elastic-modal.reducer";
import {BROWSER_EVENTS, ElasticPopupEvents, STORE_ACTIONS} from "./elastic-modal.types";

let dispatch: React.Dispatch<any> = () => {
    throw new Error('No dispatch method detected, did you embed your app with NiceModal.Provider?');
};
let counter = 0;
let zIndex = 999999;
let pmIdInc = 0;
const pluggableModalId = Symbol('PluggableModalId');

const initialState: ElasticModalContext = {modals: {}, stack: [], options: {}};
const ElasticModalManagerContext = React.createContext<ElasticModalContext>(initialState);
const ElasticModalContextId = React.createContext('');

const MODAL_REGISTRY: any = {};
const PLUGINS_REGISTRY = new Map<string, PluginRegistry>();

registerPlugin<CorePlugin>('core', new CorePlugin(), 1);
registerPlugin<MinimizePlugin>('minimize', new MinimizePlugin(), 2)
registerPlugin<DraggingPlugin>('dragging', new DraggingPlugin({excludeTargets: ['resizer', 'minimize-state-1', 'minimize-state-2']}), 3)
registerPlugin<ResizePlugin>('resizer', new ResizePlugin(), 4)
registerPlugin<PopoverPlugin>('popover', new PopoverPlugin(), 5)
registerPlugin<FocusTrapPlugin>('focusTrap', new FocusTrapPlugin({excludeTargets: '.minimize-state-1'}), 6);


function registerPlugin<T extends ElasticPlugin>(key: string, plugin: T, priority: number = 1): void {
    PLUGINS_REGISTRY.set(key, {key ,plugin, priority});
}

function getId(): string {
    pmIdInc++;
    return `pm_${pmIdInc}`;
}

export const getModalId = (modal: any) => {
    if (typeof modal === 'string') return modal as string;
    if (!modal[pluggableModalId]) {
        modal[pluggableModalId] = getId();
    }
    return modal[pluggableModalId];
}

function isRegistered(id: string): boolean {
    return !!MODAL_REGISTRY[id];
}

function register<P, O>(id: string, comp: any, props?: Undefinable<P>, options?: Undefinable<O>): void {
    if(isRegistered(id)) {
        MODAL_REGISTRY[id].props = props || {};
    } else {
        // write error if comp is undefined
        MODAL_REGISTRY[id] = { comp: comp, props, id };
    }
    if(options) {
        MODAL_REGISTRY[id].options = options;
    }
}

function unregister(id: string): void {
    delete MODAL_REGISTRY[id];
}


/** CORE POPUP METHODS START **/
export function show<T, O>(modal: any, args?: Undefinable<T>, options?: any) {
    const pmId = getModalId(modal);
    register(pmId, modal, args, options);
    ElasticModalDispatcher<{id: string, args: Undefinable<T>, options: O}>(STORE_ACTIONS.SHOW, {id: pmId, args, options});
    publish<undefined>(pmId, ElasticPopupEvents.ON_SHOW);
    runPlugins<void, {id: string, args: Undefinable<T>}>(ElasticPopupEvents.ON_SHOW, {id: pmId, args});
}

export const hide = (id: string, payload?: any) => {
    const response = {
        id,
        data: payload,
        show: (args: any)=> ElasticModalDispatcher(STORE_ACTIONS.SHOW, args),
        close: (args: any)=> ElasticModalDispatcher(STORE_ACTIONS.CLOSE, args)
    }
    ElasticModalDispatcher(STORE_ACTIONS.HIDE, { id });
    publish(id, ElasticPopupEvents.ON_HIDE, response);
    runPlugins(ElasticPopupEvents.ON_HIDE, response);
}

export const close = (id: string, payload?: any) => {
    ElasticModalDispatcher(STORE_ACTIONS.CLOSE, { id });
    publish(id, ElasticPopupEvents.ON_CLOSE, payload);
    runPlugins(ElasticPopupEvents.ON_CLOSE, { id, ...payload});
    unregister(id);
}

/** CORE POPUP\ METHODS END **/

/** STORE ACTIONS START**/

function ElasticModalDispatcher<T>(type: ElasticModalAction, payload: T): void {
    dispatch({type, payload});
}

function cordsAction(id: string, pos: Position, size: Size = null): void {
    ElasticModalDispatcher(STORE_ACTIONS.SET_CORDS, {pos, size, id})
}

function setMeta(id: string, meta: any): void {
    ElasticModalDispatcher(STORE_ACTIONS.SET_META, {meta, id})
}

/** STORE ACTIONS END**/


/** OPTIONS METHODS START **/

function getInitialOptions<T extends object>(options: T): ElasticModalOptions & T {
    return {
        showOverlay: true,
        closeOnOverlayClicked: true,
        overlayStyle: {},
        overlayClasses: '',
        onOverlayClicked: null, //global event for all modals,
        // popupStyle: {},
        // popupClasses: 'modal',
        // onPopupClosed: null,
        // onPopupOpened: null,
        // onPopupHovered: null,
        // onPopupClicked: null,
         ...options
    }
}

const mergedOptions = (id: string, options: any)=> {
    return {...MODAL_REGISTRY[id].options || {}, ...options};
}

/** OPTIONS METHODS END **/


/** PLUGINS METHODS START **/

function runPlugins<T, P>(action: string, payload: P, plugins: Nullable<PluginRegistry[]> = null, defaultValue: any = null): T {
    const defaultPlugins = getPluginList();
    console.log('runPlugins ', action, payload, plugins, defaultPlugins);
    return (plugins || defaultPlugins)
        .filter(({plugin}: any) => plugin && plugin[action])
        .sort((a, b)=> b.priority - a.priority)
        .reduce((value, {plugin})=> plugin[action](payload, value), defaultValue);
}

function getPluginsMethods(id: string, props: any) {
    return getPluginList().map(({plugin}: any)=> plugin).reduce((acc: any, value: any)=> {
        return value.public ? {...value.public({id, ...props}), ...acc} : acc;
    }, {});
}

function getPluginList() {
    return [...PLUGINS_REGISTRY.values() as any];
}

function pluginRegistryUpdated() {
    ElasticModalDispatcher(STORE_ACTIONS.PLUGINS_REGISTRY_UPDATED, {data: Date.now()});
}

function registerPlugins(plugins: ElasticPlugin[] | undefined) {
    if(plugins) {
        (plugins || []).forEach((plugin: any)=> {
            if(!PLUGINS_REGISTRY.has(plugin.key)) {
                PLUGINS_REGISTRY.set(plugin.key, plugin);
            }
        });
    }
    getPluginList().filter(({init}: any) => !init)
        // .sort((a, b)=> b.priority - a.priority)
        .forEach((p: any)=> {
        if(p.plugin.onInit) {
            p.plugin?.onInit({
                setMeta,
                changeCords: cordsAction,
            });
        }
        p.init = true;
    });
    pluginRegistryUpdated();
}

export function deregisterPlugin(key: string) {
    const pluginRegistry = PLUGINS_REGISTRY.get(key);
    if(pluginRegistry &&  pluginRegistry.plugin && pluginRegistry.plugin.onDestroy) {
        pluginRegistry.plugin.onDestroy();
    }
    PLUGINS_REGISTRY.delete(key);
    pluginRegistryUpdated();
}

function getPluginsGlobalViews() {
    return getPluginList().filter((pr: any) => pr && pr.plugin && pr.plugin.globalView).map((pr: any)=> pr.plugin.globalView());
}

function getPluginsByEventType() {
    const eventKeys = Object.values(BROWSER_EVENTS);
    const eventMap: any = eventKeys.reduce((acc, eventKey)=> Object.assign(acc, {[eventKey]: []}), {});
    PLUGINS_REGISTRY.forEach((pluginState: any)=> {
        for(const eventKey of eventKeys) {
            if(pluginState.plugin && pluginState.plugin[eventKey]) {
                eventMap[eventKey].push(pluginState);
            }
        }
    });
    return eventMap;
}

/** PLUGINS METHODS END **/

/** MAIN METHODS START **/
function getInitialState(globalOptions: ElasticModalOptions) {
    return {
        globalOptions: getInitialOptions(globalOptions),
        modals: {},
        stack: []
    }
}

export function useElasticModal<T, P>(modal?: any, args?: T, options?: Undefinable<P>) {
    let pmId: string = '';
    const contextPmId = useContext(ElasticModalContextId);
    if(!modal) {
        pmId = contextPmId;
    } else {
        pmId = getModalId(modal);
    }

    useEffect(() => {
        register(pmId, modal, args, options);
    }, [pmId, modal, args, options]);

    const onCallback = useCallback(
        (event: string, fn: Function, once: boolean) => subscribe(pmId, event, fn, once),
        [pmId]
    );


    const showCallback = useCallback(
        (args?: Record<string, unknown>, options?: any) => show(pmId, args, options),
        [pmId]
    );

    const hideCallback = useCallback(
        (payload?: any) => hide(pmId, payload),
        [pmId]
    );

    const closeCallback = useCallback(
        (payload?: any) => close(pmId, payload),
        [pmId]
    );


    return {
        id: pmId,
        args,
        on: onCallback,
        show: showCallback,
        hide: hideCallback,
        close: closeCallback,
    }
}

function onPopupSelected(popupRef: any, props: any, event: MouseEvent) {
    popupRef.style.zIndex = zIndex++;
    runPlugins(ElasticPopupEvents.OM_POPUP_SELECTED, {...props, popupRef, event});
    publish(props.id, ElasticPopupEvents.OM_POPUP_SELECTED, {...props, popupRef});
}

export const createPopup = (Comp: React.ComponentType<any>, defaultOptions: any = {}): React.FC<any> => {
    return memo(({id, ...props}) => {
        console.log('CREATE POPUP ', id, props);
        const plugins = useMemo(()=> getPluginsMethods(id, props), [props]);
        const { show, hide, close } = useElasticModal(id);
        const popupRef = useRef<any>();
        const {width, height, left, top, meta, options, prevOptions, args, globalOptions} = props;
        const modalOptions = mergedOptions(id, options);
        console.log('_options_', globalOptions, options, modalOptions, MODAL_REGISTRY[id].options);
        const eventProps: EventProps = {
            id,
            width,
            height,
            left,
            top,
            meta,
            args,
            options: modalOptions,
            prevOptions
        }

        useLayoutEffect(()=> {
            console.log('CREATE POP:width-height' , width, height)
            if(isDefined(width)) {
                popupRef.current.style.width = validateUnit(width);
                popupRef.current.style.height = validateUnit(height);
                publish<OnSizeChangedPayload>(id, ElasticPopupEvents.ON_SIZE_CHANGED,{
                    newSize: {width, height},
                });

                console.log('getModalsToRender PROPS_', eventProps, args);
                runPlugins<void, any>(ElasticPopupEvents.ON_SIZE_CHANGED, {
                    newSize: {width, height},
                    ...eventProps,
                    popupRef: popupRef.current,
                    hide: (args: any)=> hide(args),
                    close: (args: any)=> close(args),
                    changeCords: (pos: Position, size: Size) => cordsAction(id, pos, size),
                });
            } else {
                const size = runPlugins<Size, EventProps & {popupRef: HTMLElement}>(ElasticPopupEvents.CALC_SIZE, {
                    popupRef: popupRef.current,
                    ...eventProps,
                });
                cordsAction(id, null, size);
            }

            return ()=> {
                // console.log('destroy', popupRef.current);
            }

        }, [width, height]);

        useLayoutEffect(()=> {
            console.log('CREATE POP:props.show' , props.show)
            if(props.show) {
                popupRef.current.style.zIndex = zIndex++;
                runPlugins<void, EventProps & {popupRef: HTMLElement}>(ElasticPopupEvents.OM_POPUP_INITIAL_SHOW, {
                    ...eventProps,
                    popupRef: popupRef.current
                });
                publish<EventProps & {popupRef: HTMLElement}>(props.id, ElasticPopupEvents.OM_POPUP_INITIAL_SHOW, {
                    ...eventProps,
                    popupRef: popupRef.current
                });
            }
            return ()=> {
                // runPlugins(PluggablePopupEvents.ON_POPUP_DESTROYED, {...props});
            }
        }, [props.show])

        useLayoutEffect(()=> {
            console.log('CREATE POP:props.top, left, props.show' , top, left, props.show)
            if(isDefined(props.top) && isDefined(props.left)) {
                popupRef.current.style.top = validateUnit(props.top);
                popupRef.current.style.left = validateUnit(props.left);
                publish(id, ElasticPopupEvents.ON_POSITION_CHANGED,{newPosition: {top: props.top, left: props.left}});
            } else {
                counter++;
                const defaultPos = runPlugins<Position, any>(ElasticPopupEvents.ON_INIT_POSITION, {
                    ...eventProps,
                    popupRef: popupRef.current,
                    show: (args: any)=> show(args),
                    hide: (args: any)=> hide(args),
                    close: (args: any)=> close(args),
                    changeCords: (pos: Position, size: Size) => cordsAction(id, pos, size),
                });
                cordsAction(id, defaultPos);

            }

            // SHOW
            if(props.show) {
                publish(id, ElasticPopupEvents.ON_SHOW_RENDERED, {
                    ...eventProps,
                    popupRef: popupRef.current,
                    show: (args: any)=> show(args),
                    hide: (args: any)=> hide(args),
                    close: (args: any)=> close(args),
                    changeCords: (pos: Position, size: Size) => cordsAction(id, pos, size),
                });

                runPlugins(ElasticPopupEvents.ON_SHOW_RENDERED, {
                    ...eventProps,
                    popupRef: popupRef.current,
                    show: (args: any)=> show(args, modalOptions),
                    hide: (args: any)=> hide(args),
                    close: (args: any)=> close(args),
                    changeCords: (pos: Position, size: Size) => cordsAction(id, pos, size),
                });
            }

            return ()=> {
                // console.log('destroy', popupRef.current);
            }

        }, [top, left, props.show]);


        useEffect(()=> {
            console.log('CREATE POP:props.options ' , props.options);
            runPlugins(ElasticPopupEvents.ON_OPTIONS_CHANGED, {
                ...eventProps,
                popupRef: popupRef.current,
                hide: (args: any)=> hide(args),
                close: (args: any)=> close(args),
                changeCords: (pos: Position, size: Size) => cordsAction(id, pos, size),
            });
        }, [props.options])

        const selectedCallback = useCallback((e: any)=> {
            onPopupSelected(popupRef.current, props, e);
        }, [id]);
        const popupClasses = `${modalOptions.popupClasses || ''} popup-wrapper popup`;
        const popupStyle = {...modalOptions.popupStyle || {}, position: 'fixed', display: 'flex', zIndex: props.order + 1};
        const CompWrapper: any = runPlugins(ElasticPopupEvents.ON_WRAPPER_CREATED, <Comp id={id} {...(props as any)} {...plugins}/>, null, <Comp id={id} {...(props as any)} {...plugins}/>);
        return (<ElasticModalContextId.Provider value={id}>
            <div onClick={(e)=> selectedCallback(e)} id={id} className={popupClasses} style={popupStyle} ref={popupRef}>
                {CompWrapper}
            </div>
        </ElasticModalContextId.Provider>);
    });
}

function getModalsToRender(modals: any = {}, globalOptions: ElasticModalOptions = {}) {
    const modalsToRender: any[] = [];
    Object.keys(modals)
        .filter((pmId) => !!modals[pmId] && modals[pmId].visible)
        .forEach((pmId)=> {
            const modal = modals[pmId];
            if (!MODAL_REGISTRY[pmId]) {
                console.warn(`No modal found for id: ${pmId}. Please check the id or if it is registered or declared via JSX.`);
                return;
            }  else {
                modalsToRender.push({
                    ...MODAL_REGISTRY[pmId],
                    modalState: modal,
                    globalOptions
                });
            }
        });
    return modalsToRender;
}

const ElasticModalsList = ({modals}: any) => {
    return (
        <>
            {modals.map((t: any, index: number) =>  {
                return  (
                    <t.comp className='popup-main' key={t.id} id={t.id} {...t.props || {}} {...{globalOptions :t.globalOptions}} {...t.modalState} order={index}  />
                )
            })}
        </>
    );
};

export const ElasticModalProvider: React.FC<ElasticModalProps> = ({ children, plugins, globalOptions }: ElasticModalProps) => {
    const overlayRef = useRef();

    const [state, dispatcher] = useImmerReducer(elasticModalReducer, globalOptions as any,  getInitialState);

    dispatch = dispatcher;

    const popupOptions = state.globalOptions  || {};

    useMemo(()=> registerPlugins(plugins), [plugins]);

    const PluginsByEvent = useMemo(()=> getPluginsByEventType(), [plugins]);

    useHandlerOnEvent('resize', window, (event: Event)=> {
        runPlugins(ElasticPopupEvents.ON_SCREEN_RESIZE, {event, ...state}, PluginsByEvent[ElasticPopupEvents.ON_SCREEN_RESIZE]);
    }, [plugins, state], !!PluginsByEvent[ElasticPopupEvents.ON_SCREEN_RESIZE].length);

    useHandlerOnEvent('mousedown', document, (event: Event)=> {
        const propRef = (event.target as Element).closest('.popup-wrapper');
        const popupId = propRef && propRef.id;
        runPlugins(ElasticPopupEvents.ON_MOUSE_DOWN, {event, ...state, popupId, target: event.target, propRef}, PluginsByEvent[ElasticPopupEvents.ON_MOUSE_DOWN]);
    }, [plugins, state, popupOptions], !!PluginsByEvent[ElasticPopupEvents.ON_MOUSE_DOWN].length);

    useHandlerOnEvent('scroll', window, (event: Event)=> {
        const propRef = event.target;
        runPlugins(ElasticPopupEvents.ON_SCROLL, { event, ...state, target: event.target, propRef }, PluginsByEvent[ElasticPopupEvents.ON_SCROLL]);
    }, [plugins, state, popupOptions], !!PluginsByEvent[ElasticPopupEvents.ON_SCROLL].length);


    console.log('getModalsToRender', state);
    const modalsToRender = getModalsToRender(state.modals, popupOptions);
    const onBackdropClicked = useCallback((e: MouseEvent)=> {
        const selectedId = state.stack.length ? state.stack[state.stack.length - 1] : '';
        const closeOnOverlayClicked = getPopupOption('closeOnOverlayClicked', state.modals[selectedId], popupOptions);

        popupOptions && popupOptions.onOverlayClicked && popupOptions.onOverlayClicked(e, overlayRef.current);
        if(closeOnOverlayClicked) {
            if(selectedId) {
                ElasticModalDispatcher(STORE_ACTIONS.CLOSE, { id: selectedId });
                publish(selectedId, ElasticPopupEvents.ON_CLOSE, { id: selectedId });
                runPlugins(selectedId, ElasticPopupEvents.ON_CLOSE);
            }
        }
    }, [popupOptions, state.stack]);

    const overlayProps = {
        overlayStyle: popupOptions.overlayStyle,
        overlayClasses: popupOptions.overlayClasses,
    }
    const selectedId = state.stack.length ? state.stack[state.stack.length - 1] : '';
    const selectedModal = state.modals[selectedId];
    const showOverlay = isDefined(selectedModal) && isDefined(selectedModal.options) && isDefined(selectedModal.options.showOverlay) ? selectedModal.options.showOverlay : popupOptions.showOverlay;

    return (
        <ElasticModalManagerContext.Provider value={state}>
            {children}
           <ElasticModalsList modals={modalsToRender} />
            {modalsToRender.length && showOverlay ?
                <Overlay
                    ref={overlayRef} {...overlayProps}
                    onBackdropClicked={onBackdropClicked}
                /> : ''}
            {getPluginsGlobalViews().map((GlobalComp: any, index: number)=> {
                return <GlobalComp key={index} {...popupOptions} />
            })}

        </ElasticModalManagerContext.Provider>
    );
}

/** MAIN METHODS END **/