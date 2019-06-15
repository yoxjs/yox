import ExpressionNode from '../../../yox-expression-compiler/src/node/Node';
import Node from './Node';
/**
 * 延展操作 节点
 */
export default interface Spread extends Node {
    expr: ExpressionNode;
    binding?: boolean;
}
//# sourceMappingURL=Spread.d.ts.map