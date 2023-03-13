import React from "react";
import {ElasticModalProps} from "../../types";

export interface ElasticPlugin {
    onInit?: ()=> void;
    onMouseDown?: (ev: MouseEvent) => void;
    onShowRendered?: (onShowRendered: any) => void;
    onPopupSelected?: (payload: any) => void;
    onSizeChanged?: (payload: any) => void;
    onCalcSize?: (paylod: any) => void;
    onHide?:(payload: any) => void;
    onClosed?:(payload: any) => void;
    onOptionsChanged?:(payload: any) => void;
    globalView?: () => React.FC<ElasticModalProps>;
}

class DraggingPlugin {
    draggedId = null;
    draggedPop: any = null;
    changeCords = (id: string, pos: any, size: any = null) => {
    }
    shiftX = 0;
    shiftY = 0;


    onMouseMoveCallback = this.onMouseMove.bind(this);
    constructor(private options: any = {}) {
    }

    onInit({changeCords, setMeta, options}: any) {
        this.changeCords = changeCords;
    }

    moveAt(pageX: number, pageY: number) {
        this.draggedPop.style.left = pageX - this.shiftX + 'px';
        this.draggedPop.style.top = pageY - this.shiftY + 'px';
    }

    reset() {
        this.draggedId = null;
        this.draggedPop = null;
    }

    isValidTargetClass(target: HTMLElement) {
        const classSelectors = this.options && this.options.excludeTargets || [];
        return !classSelectors.some((classSelector: any)=> target.closest(`.${classSelector}`));
    }

    isHandler(target: HTMLElement) {
        const handlerTargets = this.options.handlerTargets || [];
        return !handlerTargets.length || handlerTargets.some((handlerClass: any)=> target.classList.contains(handlerClass));
    }

    onMouseDown(ev: any) {
        const { handlerTargets } = this.options || {};
        const isValidHandlerFn = handlerTargets && handlerTargets.length ? this.isHandler.bind(this) : this.isValidTargetClass.bind(this)
        if(ev.target && isValidHandlerFn(ev.target) && ev.popupId && ev.propRef) {
            this.draggedId = ev.popupId;
            this.draggedPop = ev.propRef;
            this.shiftX = ev.event.pageX - this.draggedPop.offsetLeft;
            this.shiftY = ev.event.pageY - this.draggedPop.offsetTop;
            this.draggedPop.classList.add('no-transition');
            document.addEventListener('mousemove', this.onMouseMoveCallback);
            document.addEventListener('mouseup', this.onMouseUp.bind(this), {once: true});
            this.moveAt(ev.event.pageX, ev.event.pageY);
        }
    }

    onMouseUp(ev: any) {
        if(this.draggedPop && this.draggedId) {
            this.draggedPop.classList.remove('no-transition');
            const top = this.draggedPop.style.top.replace(/\D/g, "");
            const left = this.draggedPop.style.left.replace(/\D/g, "");
            this.changeCords(this.draggedId, {top, left }, null);
        }
        this.draggedId = null;
        this.draggedPop = null;
        document.removeEventListener('mousemove', this.onMouseMoveCallback);
    }

    /**
     * We are changing html element directly for performance purposes. we will update pos on mouse up event
     * @param ev
     */
    onMouseMove(ev: any) {
        if(this.draggedPop) {
            this.moveAt(ev.pageX, ev.pageY);
        }
    }

    onClose() {
        this.reset();
    }
}


export default DraggingPlugin;