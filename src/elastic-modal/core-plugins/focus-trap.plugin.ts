import {ElasticPlugin} from "../../types";

const focusableSelectors = [
    'input',
    'select',
    'textarea',
    'a[href]',
    'button',
    '[tabindex]',
    'audio[controls]',
    'video[controls]',
    '[contenteditable]:not([contenteditable="false"])',
];

export class FocusTrapPlugin implements ElasticPlugin {
    private stack: any[] = [];
    private refLastFocus: HTMLElement | null = null;
    private popup: {elem?: HTMLElement | null, initial?: any, id?: string | null} = {};
    private onTabClickedCallback = this.onTabClicked.bind(this);
    constructor(private focusOptions: any = {}) {
        this.onInit();
    }

    onInit() {
        document.addEventListener('keydown', this.onTabClickedCallback);
    }

    onShowRendered(props: any) {
        // debugger;
        console.log('trap:onPopupInitialShow');
        this.focus(props.popupRef);
    }

    onPopupSelected(payload: any) {
      const popup = this.stack.find(popup => popup.elem === payload.popupRef);
      if(popup && popup.elem.contains(document.activeElement)) {
          popup.initial = document.activeElement;
      }
    }

    // onPopupDestroyed(props: any) {
    //     this.popup = {elem: null, initial: null};
    //     this.refLastFocus?.focus();
    // }

    isValidFocus(elem: HTMLElement) {
       return !elem.contains(document.activeElement)
           && !(this.focusOptions && this.focusOptions.excludeTargets && elem.querySelector(this.focusOptions.excludeTargets));
    }

    focus(elem: HTMLElement) {
        console.log('trap:focusfocus');
        if(this.isValidFocus(elem)) {
            const allTabbingElements = this.getAllTabbingElements(elem);
            if (allTabbingElements[0]) {
                this.savePreviousFocus();
                allTabbingElements[0].focus();
                this.stack = this.stack.filter((pop)=> pop && pop.elem !== elem);
                this.stack.push({
                    elem,
                    id: elem.id,
                    initial: null
                });
            }
        } else if(elem.contains(document.activeElement)) {
            this.stack = this.stack.filter((pop)=> pop && pop.elem !== elem);
            this.stack.push({
                elem,
                id: elem.id,
                initial: document.activeElement
            });
        }
    }

    getLastPopup() {
        return this.stack && this.stack[this.stack.length -1] || null;
    }

    onClosed({id}: {id: string}) {
        this.stack = this.stack.filter((popup) => popup.id !== id);
        const prevPop = this.getLastPopup();
        if(prevPop && prevPop.elem) {
            if(prevPop.initial) {
                prevPop.initial.focus();
            } else {
                this.focus(prevPop.elem);
            }
        }
        if(!this.stack.length && this.refLastFocus) {
            this.refLastFocus?.focus();
        }
    }

    onHide(payload: {id: string}) {
        this.onClosed(payload);
    }

    onTabClicked(ev: any) {
        const popup = this.stack.find(pop => pop.elem.contains(ev.target));
        this.tabTrappingKey(ev, popup && popup.elem);
    }

     isHidden(node: any) {
        // offsetParent being null will allow detecting cases where an element is invisible or inside an invisible element,
        // as long as the element does not use position: fixed. For them, their visibility has to be checked directly as well.
        return (
            node.offsetParent === null || getComputedStyle(node).visibility === 'hidden'
        );
    }

     getCheckedRadio(nodes: any, form: any) {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].checked && nodes[i].form === form) {
                return nodes[i];
            }
        }
    }

     isNotRadioOrTabbableRadio(node: any) {
        if (node.tagName !== 'INPUT' || node.type !== 'radio' || !node.name) {
            return true;
        }
        const radioScope = node.form || node.ownerDocument;
        const radioSet = radioScope.querySelectorAll(
            'input[type="radio"][name="' + node.name + '"]'
        );
        const checked = this.getCheckedRadio(radioSet, node.form);
        return checked === node || (checked === undefined && radioSet[0] === node);
    }

     getAllTabbingElements(parentElem: any) {
        const currentActiveElement = document.activeElement;
        const tabbableNodes = parentElem.querySelectorAll(focusableSelectors.join(','));
        const onlyTabbable = [];
        for (let i = 0; i < tabbableNodes.length; i++) {
            const node = tabbableNodes[i];
            if (
                currentActiveElement === node ||
                (!node.disabled &&
                    this.getTabindex(node) > -1 &&
                    !this.isHidden(node) &&
                    this.isNotRadioOrTabbableRadio(node))
            ) {
                onlyTabbable.push(node);
            }
        }
        return onlyTabbable;
    }

     tabTrappingKey(event: any, parentElem: any) {
        if(!parentElem) {
            return false;
        }
        // check if current event keyCode is tab
        if (!event || event.key !== 'Tab') return;

        if (!parentElem || !parentElem.contains) {
            return false;
        }

        if (!parentElem.contains(event.target)) {
            return false;
        }

        const allTabbingElements = this.getAllTabbingElements(parentElem);
        const firstFocusableElement = allTabbingElements[0];
        const lastFocusableElement = allTabbingElements[allTabbingElements.length - 1];

        if (event.shiftKey && event.target === firstFocusableElement) {
            lastFocusableElement.focus();
            event.preventDefault();
            return true;
        } else if (!event.shiftKey && event.target === lastFocusableElement) {
            firstFocusableElement.focus();
            event.preventDefault();
            return true;
        }
        return false;
    }

    getTabindex(node: any) {
        const tabindexAttr = parseInt(node.getAttribute('tabindex'), 10);

        if (!isNaN(tabindexAttr)) return tabindexAttr;
        // Browsers do not return tabIndex correctly for contentEditable nodes;
        // so if they don't have a tabindex attribute specifically set, assume it's 0.

        if (this.isContentEditable(node)) return 0;
        return node.tabIndex;
    }

    isContentEditable(node: any) {
        return node.getAttribute('contentEditable');
    }

    savePreviousFocus() {
        if (
            focusableSelectors.findIndex((selector) => document.activeElement?.matches(selector)) !== -1) {
            this.refLastFocus = document.activeElement as HTMLElement;
        }
    };

}