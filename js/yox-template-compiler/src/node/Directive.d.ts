import ExpressionNode from '../../../yox-expression-compiler/src/node/Node';
import Branch from './Branch';
/**
 * 指令
 */
export default interface Directive extends Branch {
    ns: string;
    name: string;
    key: string;
    expr?: ExpressionNode;
    value?: string | number | boolean;
}
//# sourceMappingURL=Directive.d.ts.map