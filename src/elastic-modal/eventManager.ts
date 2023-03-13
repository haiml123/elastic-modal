const MODALS_EVENT_MANAGER: any = {};

export function subscribe(id: string, event: string, fn: Function, once: boolean = false) {
    let destroy = ()=> {};
    if(!MODALS_EVENT_MANAGER[id]) {
        MODALS_EVENT_MANAGER[id] = {[event]: []};
    }
    if(!MODALS_EVENT_MANAGER[id][event]) {
        MODALS_EVENT_MANAGER[id][event] = [];
    }
    if(!MODALS_EVENT_MANAGER[id][event].some(({callback}: {callback: Function}) => callback === fn)) {
        destroy = ()=> MODALS_EVENT_MANAGER[id][event] = MODALS_EVENT_MANAGER[id][event].filter(({callback}: {callback: Function}) => callback !== fn);
        MODALS_EVENT_MANAGER[id][event].push({callback: fn, once, destroy});
    }
    return destroy;
}

export function publish<T>(id: string, eventName: string, payload?: T) {
    if(MODALS_EVENT_MANAGER[id] && MODALS_EVENT_MANAGER[id][eventName]) {
        MODALS_EVENT_MANAGER[id][eventName].forEach(({callback, destroy, once}: {callback: Function, destroy: Function, once: boolean})=> {
            callback({...(payload || {}), eventName});
            if(once) {
                destroy();
            }
        });
    }
}

export function destroyAll(id: string): void {
    delete MODALS_EVENT_MANAGER[id];
}