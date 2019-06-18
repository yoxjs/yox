import API from '../../yox-type/src/util/API';
import { VNode } from '../../yox-type/src/vnode';
import { Yox } from '../../yox-type/src/class';
export declare function patch(api: API, vnode: VNode, oldVnode: VNode): void;
export declare function create(api: API, node: Node, context: Yox, keypath: string): VNode;
export declare function destroy(api: API, vnode: VNode, isRemove?: boolean): void;
//# sourceMappingURL=snabbdom.d.ts.map