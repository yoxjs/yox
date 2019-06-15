import ExpressionNode from '../../../yox-expression-compiler/src/node/Node';
import Branch from './Branch';
import Attribute from './Attribute';
import Directive from './Directive';
import Property from './Property';
import If from './If';
import Spread from './Spread';
/**
 * 元素节点
 */
export default interface Element extends Branch {
    tag: string;
    isSvg: boolean;
    isStyle: boolean;
    isOption: boolean;
    isComponent: boolean;
    slot?: string;
    name?: string;
    ref?: Attribute;
    key?: Attribute;
    html?: ExpressionNode;
    attrs?: (Attribute | Property | Directive | If | Spread)[];
}
//# sourceMappingURL=Element.d.ts.map