import React, {memo, useCallback, useEffect, useLayoutEffect, useRef} from "react";
import {useState} from "react";
import {isOptionsPositionChanged} from "../utlis";
import {ElasticPlugin} from "../../types";
import {show, useElasticModal} from "../elastic-modal.provider";


const enum POPUP_STATE {
    NONE,
    MINIMIZE,
    MAXIMIZE,
    DEFAULT
}


class MinimizePlugin implements ElasticPlugin {
    stack = new Set<string>();
    updateStack = (v: any) => {
    };
    changeCords = (id: string, pos: any, size: any) => {
    }
    setMeta = (id: string, meta: any) => {
    }
    options: any = {};
    winHeight = 0;
    winWidth = 0;

    constructor() {
    }

    onInit({changeCords, setMeta, options}: any) {
        this.changeCords = changeCords;
        this.setMeta = setMeta;
        this.options = options;
        this.setWinSize();
    }

    onScreenResize(ev: any) {
        // console.log('screenResize', ev);
        this.setWinSize();
        this.reArrangeMinimize();
    }

    onMouseDown(ev: any) {
        // console.log('onMouseDown', ev);
    }

    setWinSize() {
        this.winHeight = window.innerHeight;
        this.winWidth = window.innerWidth;
    }

    minimize(props: any) {
        const {id, width, height, left, top, meta} = props;

        if (!this.stack.has(id)) {
            const splitTo = this.stack.size;
            const newWidth = this.winWidth / (splitTo < 6 ? 6 : splitTo);
            const taken = splitTo * newWidth;
            let showTop = top;
            let showLeft = left;
            let showWidth = width;
            let showHeight = height;
            if (meta.viewState === POPUP_STATE.MAXIMIZE) {
                showTop = meta.showTop;
                showLeft = meta.showLeft;
                showWidth = meta.showWidth;
                showHeight = meta.showHeight;
            }
            this.stack.add(id);
            this.setMeta(id, {viewState: POPUP_STATE.MINIMIZE, showTop, showLeft, showWidth, showHeight, show: false});
            this.changeCords(id, {left: taken, top: this.winHeight - 30}, {width: newWidth, height: 30});
        }
    }

    expand(props: any) {
        const {id, width, height, left, top, meta} = props;

        this.stack.delete(id);

        if (meta.viewState === POPUP_STATE.DEFAULT) {
            let showTop = top;
            let showLeft = left;
            let showWidth = width;
            let showHeight = height;
            this.changeCords(id, {top: 0, left: 0}, {width: '100%', height: '100%'});
            this.setMeta(id, {viewState: POPUP_STATE.MAXIMIZE, showTop, showLeft, showWidth, showHeight, show: true});
        } else if(meta.viewState === POPUP_STATE.MAXIMIZE) {
            let newTop = meta.showTop;
            let newLeft = meta.showLeft;
            let newWidth = meta.showWidth;
            let newHeight = meta.showHeight;
            this.changeCords(id, {top: newTop, left: newLeft}, {width: newWidth, height: newHeight});
            this.setMeta(id, {viewState: POPUP_STATE.DEFAULT});
        } else {
            show(id);
        }
    }

    // TODO
    maximize(id: string) {
    }

    onShowRendered(props: any) {
        const {id, meta} = props;

        this.stack.delete(id);
        if(meta.viewState !== POPUP_STATE.MAXIMIZE) {
            const top = meta.showTop;
            const left = meta.showLeft;
            const width = meta.showWidth;
            const height = meta.showHeight;
            this.changeCords(id, {top, left}, {width, height});
            this.setMeta(id, {viewState: POPUP_STATE.DEFAULT, showTop: null, showLeft: null, showWidth: null, showHeight: null});
        }
        this.reArrangeMinimize();
    }

    reArrangeMinimize() {
        const splitTo = this.stack.size;
        const width = this.winWidth / (splitTo < 6 ? 6 : splitTo);
        const minimizedIds = [...this.stack.values() as any];
        for (let i = 0, taken = 0; i < minimizedIds.length; i++, taken += width) {
            const id = minimizedIds[i];
            // TODO change to batch
            this.changeCords(id, {left: taken, top: this.winHeight - 30}, {width: width, height: 30});
        }
    }

    onHide(props: any) {
        if(props.id) {
            this.stack.delete(props.id);
        }
    }

    onClose(props: any) {
        if (props.id) {
            this.stack.delete(props.id);
        }
    }

    public(props: any) {
        const minimize = this.minimize.bind(this);
        const maximize = this.maximize.bind(this);
        const expand = this.expand.bind(this);
        return {
            minimizer: {
                getStack: () => this.stack.values(),
                minimize: () => minimize(props),
                // maximize: () => maximize(props),
                expand: () => expand(props)
            }
        }
    }

    onAttributesSet(payload: any, attrs: any) {
        const attributes = attrs || {};
        attributes['minimize-state'] = payload.viewState;
        return attributes;
    }

    static PopupHeader = (props: any) => {
        const {id, hide, show, close} = useElasticModal();
        const {meta} = props;
        const title = props.title;
            const headerClass = `minimize-header minimize-state-${meta.viewState || POPUP_STATE.DEFAULT}`
        return (
            <div className={headerClass}>
                <span className="minimize-title">{title}</span>
                <div className="minimize-btn-wrapper">
                    {props.viewState !== 1 &&
                    <div onClick={() => props.minimizer.minimize()} className="minimize-btn">
                        <img
                            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAyIj48cGF0aCBmaWxsPSIjZmZmIiBkPSJNOCAwaDdhMSAxIDAgMCAxIDAgMkgxYTEgMSAwIDAgMSAwLTJoN3oiLz48L3N2Zz4="/>
                    </div>
                    }
                    <div onClick={() => props.minimizer.expand()} className="minimize-btn">
                        <img
                            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9IiNmZmYiIHZpZXdCb3g9IjAgMCA5NiA5NiI+PHBhdGggZD0iTTIwIDcxLjMxMUMxNS4zNCA2OS42NyAxMiA2NS4yMyAxMiA2MFYyMGMwLTYuNjMgNS4zNy0xMiAxMi0xMmg0MGM1LjIzIDAgOS42NyAzLjM0IDExLjMxMSA4SDI0Yy0yLjIxIDAtNCAxLjc5LTQgNHY1MS4zMTF6Ii8+PHBhdGggZD0iTTkyIDc2VjM2YzAtNi42My01LjM3LTEyLTEyLTEySDQwYy02LjYzIDAtMTIgNS4zNy0xMiAxMnY0MGMwIDYuNjMgNS4zNyAxMiAxMiAxMmg0MGM2LjYzIDAgMTItNS4zNyAxMi0xMnptLTUyIDRjLTIuMjEgMC00LTEuNzktNC00VjM2YzAtMi4yMSAxLjc5LTQgNC00aDQwYzIuMjEgMCA0IDEuNzkgNCA0djQwYzAgMi4yMS0xLjc5IDQtNCA0SDQweiIvPjwvc3ZnPg=="/>
                    </div>
                    <div onClick={() => hide()} className="minimize-btn">
                        <img
                            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xIC0xIDE4IDE4Ij48cGF0aCBmaWxsPSIjZmZmIiBkPSJtMS42MTMuMjEuMDk0LjA4M0w4IDYuNTg1IDE0LjI5My4yOTNsLjA5NC0uMDgzYTEgMSAwIDAgMSAxLjQwMyAxLjQwM2wtLjA4My4wOTRMOS40MTUgOGw2LjI5MiA2LjI5M2ExIDEgMCAwIDEtMS4zMiAxLjQ5N2wtLjA5NC0uMDgzTDggOS40MTVsLTYuMjkzIDYuMjkyLS4wOTQuMDgzQTEgMSAwIDAgMSAuMjEgMTQuMzg3bC4wODMtLjA5NEw2LjU4NSA4IC4yOTMgMS43MDdBMSAxIDAgMCAxIDEuNjEzLjIxeiIvPjwvc3ZnPg=="/>
                    </div>
                </div>
            </div>
        )
    };
}


export default MinimizePlugin;
