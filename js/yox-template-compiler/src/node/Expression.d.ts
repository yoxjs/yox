import ExpressionNode from '../../../yox-expression-compiler/src/node/Node';
import Node from './Node';
/**
 * 表达式节点
 */
export default interface Expression extends Node {
    expr: ExpressionNode;
    safe: boolean;
}
//# sourceMappingURL=Expression.d.ts.map