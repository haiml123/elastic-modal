import {isDefined, isOptionsPositionChanged, isPosChanged} from "../utlis";
import React from "react";
import {ElasticModalProps, ElasticPlugin} from "../../types";


export class CorePlugin implements ElasticPlugin {
    lastPos = {top: null, left: null};

    constructor() {
    }

    onShow(pos: any) {
        // console.log('PositionPlugin', pos);
        // pos.changePos({x: 20, y: 20});
    }

    onCalcSize({id, popupRef, options, props}: any) {
        console.log('onCalcSize', id);
        return {
            width: 400,
            height: 400
        }
    }

    getPosition(position: any, size: any) {
        let left = position && isDefined(position.left) ? position.left : 'center';
        let top = position && isDefined(position.top) ? position.top : 'center';
        const height = window.innerHeight;
        const width = window.innerWidth;

        switch (left) {
            case 'left': {
                left = 0;
                break
            }
            case 'center': {
                left = (width / 2) - ((size.width || 0) / 2);
                break;
            }
            case 'right': {
                left = width - size.width;
                break;
            }
        }
        switch (top) {
            case 'top': {
                top = 0;
                break;
            }
            case 'center': {
                top = (height / 2) - ((size.height || 0) / 2);
                break;
            }
            case 'bottom': {
                top = height - size.height;
                break;
            }
        }
        return {left, top}
    }

    onSizeChanged(payload: any) {
        const {options, newSize} = payload;
        const {top, left} = options.position || {};
        let pos: any = {};
        if (isDefined(payload.top)) {
            pos.top = payload.top;
        } else {
            pos.top = top || 'center';
        }

        if (isDefined(payload.left)) {
            pos.left = payload.left;
        } else {
            pos.left = left || 'center';
        }
        const position = this.getPosition(pos, newSize);
        payload.changeCords(position);
    }

    onOptionsChanged(props: any) {
        const {options, prevOptions, width, height} = props;

        const position = this.getPosition(options.position, {width, height});
        console.log('check', this.lastPos, position);
        if ((props.options && props.options.position && (!this.lastPos || isPosChanged(this.lastPos, {
                top: parseInt(props.top),
                left: parseInt(props.left)
            })))
            || isOptionsPositionChanged(prevOptions, options)) {
            this.lastPos = position;
            props.changeCords(position);
            console.log('passed');
        } else {
            console.log('no changes');
        }
    }

    globalView(): React.FC<ElasticModalProps> {
        return (props: any) => {
            console.log('globalView', props);
            return null;

        }
    }
}
