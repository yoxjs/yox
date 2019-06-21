import ExpressionNode from '../../../yox-expression-compiler/src/node/Node';
import Branch from './Branch';
import Else from './Else';
import If from './If';
/**
 * else if 节点
 */
export default interface ElseIf extends Branch {
    expr: ExpressionNode;
    prev?: If | ElseIf;
    next?: ElseIf | Else;
}
//# sourceMappingURL=ElseIf.d.ts.map