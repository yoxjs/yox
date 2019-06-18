import * as type from './type';
import { Yox, TransitionHooks, DirectiveHooks } from './class';
export interface Attribute {
    readonly name: string;
    readonly value: string;
}
export interface Property {
    readonly name: string;
    readonly value: any;
    readonly hint: type.hint;
}
export interface Directive {
    readonly ns: string;
    readonly name: string;
    readonly key: string;
    readonly value?: string | number | boolean;
    readonly hooks: DirectiveHooks;
    readonly getter?: type.getter | void;
    readonly handler?: type.listener | void;
    readonly binding?: string | void;
    readonly hint?: type.hint | void;
}
export interface VNode {
    data: type.data;
    node: Node;
    parent?: Yox;
    slot?: string;
    readonly keypath: string;
    readonly context: Yox;
    readonly tag?: string | void;
    readonly isComponent?: boolean;
    readonly isComment?: boolean;
    readonly isText?: boolean;
    readonly isSvg?: boolean;
    readonly isStyle?: boolean;
    readonly isOption?: boolean;
    readonly isStatic?: boolean;
    readonly props?: type.data;
    readonly slots?: Record<string, VNode[]>;
    readonly nativeProps?: Record<string, Property>;
    readonly nativeAttrs?: Record<string, Attribute>;
    readonly directives?: Record<string, Directive>;
    readonly lazy?: Record<string, type.lazy>;
    readonly transition?: TransitionHooks;
    readonly ref?: string;
    readonly key?: string;
    readonly text?: string;
    readonly html?: string;
    readonly children?: VNode[];
}
//# sourceMappingURL=vnode.d.ts.map