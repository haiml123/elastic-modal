import {
    Fragment
} from "react"
import {isDefined} from "../utlis";
import {ElasticModalOptions, ElasticPlugin} from "../../types";

class ResizePlugin implements ElasticPlugin {
    targetRef: any = null;
    resizeDirection: any = null;
    x: number = 0;
    y: number = 0;
    options: any = {};
    changeCords: any = () => {
    };

    constructor() {
    }

    onOptionsChanged(options: any, globalOptions: ElasticModalOptions) {
        this.options = options;
    }

    onInit(ev: any) {
        this.changeCords = ev.changeCords;
        this.mountStyles('resize-plugin', `
            .resizer {
                cursor: n-resize;
                height: 10px;
                position: absolute;
            }
            .top-resize {
                width: 100%;
                top: -5px;
                right: 0;
                cursor: n-resize;
            }
            .bottom-resize {
                right: 0;
                bottom: 0;
                width: 100%;
                cursor: n-resize;
            }
            .left-resize {
                top: 0;
                left: -5px;
                height: 100%;
                width: 10px;
                cursor: w-resize;
            }
            .right-resize {
                top: 0;
                right: -5px;
                height: 100%;
                width: 10px;
                cursor: w-resize;
            }
             .top-left-resize {
                top: -5px;
                left: -5px;
                width: 15px;
                height: 15px;
                cursor: nw-resize;
            }
            .top-right-resize {
                top: -5px;
                right: -5px;
                width: 15px;
                height: 15px;
                cursor: ne-resize;
            }
             .bottom-right-resize {
                bottom: -5px;
                right: -5px;
                width: 15px;
                height: 15px;
                cursor: nw-resize;
            }
             .bottom-left-resize {
                bottom: -5px;
                left: -5px;
                width: 15px;
                height: 15px;
                cursor: ne-resize;
            }
        `)
    }

    onMouseMoveCallback = this.onMouseMove.bind(this);

    mountStyles(id: string, stylesStr: any) {
        if (!document.getElementById(id)) {
            const styleTag = document.createElement('style');
            styleTag.id = id;
            styleTag.textContent = stylesStr;
            document.head.appendChild(styleTag);
        }
    }

    onMouseUp(ev: MouseEvent) {
        if (this.targetRef) {
            const {width, height, top, left} = this.targetRef.getBoundingClientRect();
            this.changeCords(this.targetRef.id, {top, left}, {width, height});
            this.targetRef.classList.remove('no-transition');
        }
        document.removeEventListener('mousemove', this.onMouseMoveCallback);
    }

    onMouseDown(ev: any) {
        this.resizeDirection = ev.target.getAttribute('data-direction');
        if (this.resizeDirection && ev.event.target.classList.contains('resizer')) {
            this.x = ev.event.pageX;
            this.y = ev.event.pageY;
            this.targetRef = ev.event.target.closest('.popup-wrapper');
            this.targetRef.classList.add('no-transition');
            ev.event.preventDefault();
            ev.event.stopPropagation();
            document.addEventListener('mousemove', this.onMouseMoveCallback);
            document.addEventListener('mouseup', this.onMouseUp.bind(this), {once: true});
        }
    }

    funcResizing(pageX: number, pageY: number) {
        const offsetX = pageX - this.x;
        const offsetY = pageY - this.y;
        this.y = pageY;
        this.x = pageX;
        if (this.targetRef) {
            const domRec = this.targetRef.getBoundingClientRect();
            let minWidth = 200;
            let minHeight = 100;
            let height, width, top, left;

            if (this.resizeDirection === 'top-resize') {
                top = domRec.y + offsetY;
                height = domRec.height - offsetY;
            } else if (this.resizeDirection === 'bottom-resize') {
                height = domRec.height + offsetY;
            } else if (this.resizeDirection === 'left-resize') {
                left = domRec.left + offsetX;
                width = domRec.width - offsetX;
            } else if (this.resizeDirection === 'right-resize') {
                width = domRec.width + offsetX;
            } else if (this.resizeDirection === 'bottom-right-resize') {
                height = domRec.height + offsetY;
                width = domRec.width + offsetX;
            } else if (this.resizeDirection === 'bottom-left-resize') {
                left = domRec.left + offsetX;
                width = domRec.width - offsetX;
                height = domRec.height + offsetY;
            } else if (this.resizeDirection === 'top-left-resize') {
                top = domRec.y + offsetY;
                height = domRec.height - offsetY;
                left = domRec.left + offsetX;
                width = domRec.width - offsetX;
            } else if (this.resizeDirection === 'top-right-resize') {
                top = domRec.y + offsetY;
                height = domRec.height - offsetY;
                width = domRec.width + offsetX;
            }
            this.targetRef.style.height = isDefined(height) ? height + 'px' : this.targetRef.style.height;
            this.targetRef.style.width = isDefined(width) ? width + 'px' : this.targetRef.style.width;
            this.targetRef.style.top = isDefined(top) ? top + 'px' : this.targetRef.style.top;
            this.targetRef.style.left = isDefined(left) ? left + 'px' : this.targetRef.style.left;

        }
    }

    onMouseMove(ev: MouseEvent) {
        this.funcResizing(ev.pageX, ev.pageY);
    }

    onWrapperCreated(comp: any) {
        return (
            <Fragment>
                {comp}
                {comp.props.show &&
                (<Fragment>
                    <div data-direction="top-resize" className="resizer top-resize"></div>
                    <div data-direction="bottom-resize" className="resizer bottom-resize"></div>
                    <div data-direction="left-resize" className="resizer left-resize"></div>
                    <div data-direction="right-resize" className="resizer right-resize"></div>
                    <div data-direction="top-left-resize" className="resizer top-left-resize"></div>
                    <div data-direction="bottom-left-resize" className="resizer bottom-left-resize"></div>
                    <div data-direction="top-right-resize" className="resizer top-right-resize"></div>
                    <div data-direction="bottom-right-resize" className="resizer bottom-right-resize"></div>
                </Fragment>)
                }
            </Fragment>
        );
    }
}

export default ResizePlugin;