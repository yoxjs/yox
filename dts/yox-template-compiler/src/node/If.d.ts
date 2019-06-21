import ExpressionNode from '../../../yox-expression-compiler/src/node/Node';
import Branch from './Branch';
import ElseIf from './ElseIf';
import Else from './Else';
/**
 * if 节点
 */
export default interface If extends Branch {
    expr: ExpressionNode;
    stub?: boolean;
    next?: ElseIf | Else;
}
//# sourceMappingURL=If.d.ts.map