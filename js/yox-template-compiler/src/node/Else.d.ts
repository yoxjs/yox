import Branch from './Branch';
import ElseIf from './ElseIf';
import If from './If';
/**
 * else 节点
 */
export default interface Else extends Branch {
    prev?: If | ElseIf;
}
//# sourceMappingURL=Else.d.ts.map