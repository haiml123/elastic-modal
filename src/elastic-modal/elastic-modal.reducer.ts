import {isDefined, moveEndToStartStack, moveToEndOfStack, removeFromStack} from "./utlis";
import {ActionStore} from "../types";
import {STORE_ACTIONS} from "./elastic-modal.types";


export function validateExistence(modals: any, id: string) {
    if(id && !modals[id]) {
        modals[id] = {meta: {}};
    }
}

export function setCords(modal: any, pos: any, size: any) {
    if(!modal) return;

    if(pos) {
        if(isDefined(pos.top)) {
            modal.prevTop = modal.top;
            modal.top = pos.top;
        }
        if(isDefined(pos.left)) {
            modal.prevLeft = modal.left;
            modal.left = pos.left;
        }
    }
    if(size) {
        if(isDefined(size.width)) {
            modal.prevWidth = modal.width;
            modal.width = size.width;
        }
        if(isDefined(size.height)) {
            modal.prevHeight = modal.height;
            modal.height = size.height;
        }
    }
}

export function elasticModalReducer(draft: any = {}, action: ActionStore) {
    const modals = draft.modals;
    const { id } = action.payload;
    if(id) {
        validateExistence(modals, id);
    }
    switch (action.type) {
        case STORE_ACTIONS.REGISTER: {
            const { options } = action.payload;
            break;
        }
        case STORE_ACTIONS.SHOW: {
            const { args, options } = action.payload;
            modals[id].prevShow =  modals[id].show;
            modals[id].show = true;
            modals[id].prevOptions = modals[id].options;
            modals[id].options = { ...modals[id].options, ...options };
            modals[id].args = args;
            modals[id].visible = true;
            draft.stack = moveToEndOfStack(draft.stack, id);
            break;
        }
        case STORE_ACTIONS.HIDE: {
            const { args } = action.payload;
            modals[id].show = false;
            // modals[id].props = args;
            modals[id].visible = false;
            draft.stack = moveEndToStartStack(draft.stack);
            break;
        }
        case STORE_ACTIONS.CLOSE: {
            const { id } = action.payload;
            delete draft.modals[id];
            draft.stack = removeFromStack(draft.stack, id);
            break;
        }
        case STORE_ACTIONS.BACKDROP_CLICKED: {
            const selectedId = draft.pop();
            delete modals[selectedId];
            break;
        }
        case STORE_ACTIONS.SET_CORDS: {
            const { pos, size } = action.payload;
            setCords(modals[id], pos, size);
            break;
        }

        case STORE_ACTIONS.SET_CORDS_BATCH: {
            const { transactions } = action.payload;
            (transactions || []).forEach(({id, pos, size}: any)=> {
                setCords(modals[id], pos, size);
            });
            break;
        }

        case STORE_ACTIONS.SET_POSITION: {
            const { pos } = action.payload;
            if(pos) {
                modals[id].prevPos = modals[id].pos;
                modals[id].pos = pos;
            } else {
                //show error
            }
            break;
        }
        case STORE_ACTIONS.SET_META: {
            const { meta } = action.payload;
            for(const k in meta) {
                if(k == 'show') {
                    modals[id][k] = meta[k];
                } else {
                    modals[id].meta[k] = meta[k];
                }
            }
            break;
        }
    }
    return draft;
}