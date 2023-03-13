import {validateUnit} from "../utlis";
import {ElasticPlugin} from "../../types";


export class PopoverPlugin implements ElasticPlugin {
    changeCords = (id: string, pos: any, size: any)=> {}
    constructor() {
    }

    onInit(ev: any) {
        this.changeCords = ev.changeCords;
    }

    onScroll(ev: any) {
        console.log('scroll', ev);
    }

    onSizeChanged(ev: any) {
        this.onShowRendered(ev);
    }

    getPosition(position = 'top left', targetRec: any, popupRec: any) {
        let top = 0;
        let left = 0;
        const [posTop, posLeft] = position.split(' ');

        switch (position) {
            case 'top left': {
                top = targetRec.top - popupRec.height;
                left = targetRec.left;
                break;
            }
            case 'top right': {
                top = targetRec.top - popupRec.height;
                left = targetRec.left - popupRec.width + targetRec.width;
                break;
            }
            case 'top center': {
                top = targetRec.top - popupRec.height;
                left = (targetRec.left + targetRec.width / 2) - popupRec.width / 2;
                break;
            }

            case 'right top': {
                top = targetRec.top;
                left = targetRec.left + targetRec.width;
                break;
            }
            case 'right center': {
                top = targetRec.top - popupRec.height / 2;
                left = targetRec.left + targetRec.width;
                break;
            }
            case 'right bottom': {
                top = targetRec.top - popupRec.height + targetRec.height;
                left = targetRec.left + targetRec.width;
                break;
            }


            case 'left top': {
                top = targetRec.top;
                left = targetRec.left - popupRec.width;
                break;
            }
            case 'left center': {
                top = targetRec.top - popupRec.height / 2;
                left = targetRec.left - popupRec.width;
                break;
            }
            case 'left bottom': {
                top = targetRec.top - popupRec.height + targetRec.height;
                left = targetRec.left - popupRec.width;
                break;
            }

            case 'bottom left': {
                top = targetRec.top + targetRec.height;
                left = targetRec.left;
                break;
            }
            case 'bottom center': {
                top = targetRec.top + targetRec.height;
                left = (targetRec.left + targetRec.width / 2) - popupRec.width / 2;
                break;
            }
            case 'bottom right': {
                top = targetRec.top + targetRec.height;
                left = targetRec.left - popupRec.width + targetRec.width;
                break;
            }

            case 'center center': {
                top = targetRec.top - popupRec.height / 2;
                left = (targetRec.left + targetRec.width / 2) - popupRec.width / 2;
                break;
            }

        }

        if(top < 0) {
            top = 0;
        }
        if(left < 0) {
            left = 0;
        }

        return {top, left};
    }

    onShowRendered(ev: any) {
        if(ev.target) {
            const popupRec = ev.popupRef.getBoundingClientRect();
            const targetRec = ev.target.getBoundingClientRect();
            const pos = this.getPosition('center center', targetRec, popupRec);
            this.changeCords(ev.id, pos, null);
        }
        console.log('popOVER', ev);
    }

    onInitPosition(payload: any, prevValue: any) {

        const {options} = payload || {};
        if(options.target) {
            const rect = options.target.getBoundingClientRect();
            return {
                top: validateUnit(rect.top),
                left: validateUnit(rect.left)
            }
        }
        return prevValue;
    }

}