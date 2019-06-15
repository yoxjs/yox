import Property from './Property';
import Attribute from './Attribute';
import Directive from './Directive';
import * as type from '../type';
import Yox from '../interface/Yox';
import TransitionHooks from '../hooks/Transition';
export default interface VNode {
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
//# sourceMappingURL=VNode.d.ts.map