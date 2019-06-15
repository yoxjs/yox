import Node from './Node';
import Keypath from './Keypath';
/**
 * Member 节点
 */
export default interface Member extends Keypath {
    lead: Node;
    nodes: Node[] | void;
    keypath: string | void;
}
//# sourceMappingURL=Member.d.ts.map