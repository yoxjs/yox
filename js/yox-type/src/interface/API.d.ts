import SpecialEventHooks from '../hooks/SpecialEvent';
import * as type from '../type';
export default interface API {
    createElement(tag: string, isSvg?: boolean): Element;
    createText(text: string): Text;
    createComment(text: string): Comment;
    prop(node: HTMLElement, name: string, value?: string | number | boolean): string | number | boolean | void;
    removeProp(node: HTMLElement, name: string, hint?: type.hint): void;
    attr(node: HTMLElement, name: string, value?: string): string | void;
    removeAttr(node: HTMLElement, name: string): void;
    before(parentNode: Node, node: Node, beforeNode: Node): void;
    append(parentNode: Node, node: Node): void;
    replace(parentNode: Node, node: Node, oldNode: Node): void;
    remove(parentNode: Node, node: Node): void;
    parent(node: Node): Node | void;
    next(node: Node): Node | void;
    find(selector: string): Element | void;
    tag(node: Node): string | void;
    text(node: Node, text?: string, isStyle?: boolean, isOption?: boolean): string | void;
    html(node: Element, html?: string, isStyle?: boolean, isOption?: boolean): string | void;
    addClass(node: HTMLElement, className: string): void;
    removeClass(node: HTMLElement, className: string): void;
    on(node: HTMLElement | Window | Document, type: string, listener: type.listener): void;
    off(node: HTMLElement | Window | Document, type: string, listener: type.listener): void;
    addSpecialEvent(type: string, hooks: SpecialEventHooks): void;
}
//# sourceMappingURL=API.d.ts.map