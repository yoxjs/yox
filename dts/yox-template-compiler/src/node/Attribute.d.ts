import ExpressionNode from '../../../yox-expression-compiler/src/node/Node';
import Branch from './Branch';
/**
 * 属性
 */
export default interface Attribute extends Branch {
    name: string;
    expr?: ExpressionNode;
    value?: any;
    binding?: boolean;
}
//# sourceMappingURL=Attribute.d.ts.map