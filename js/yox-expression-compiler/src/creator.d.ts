import Node from './node/Node';
import Identifier from './node/Identifier';
import Literal from './node/Literal';
import Member from './node/Member';
import Ternary from './node/Ternary';
import Binary from './node/Binary';
import Unary from './node/Unary';
import Call from './node/Call';
import ArrayNode from './node/Array';
import ObjectNode from './node/Object';
export declare function createArray(nodes: Node[], raw: string): ArrayNode;
export declare function createBinary(left: Node, operator: string, right: Node, raw: string): Binary;
export declare function createCall(name: Node, args: Node[], raw: string): Call;
export declare function createIdentifier(raw: string, name: string, isProp?: boolean): Identifier | Literal;
export declare function createLiteral(value: any, raw: string): Literal;
export declare function createObject(keys: string[], values: Node[], raw: string): ObjectNode;
export declare function createTernary(test: Node, yes: Node, no: Node, raw: string): Ternary;
export declare function createUnary(operator: string, node: Node, raw: string): Unary;
/**
 * 通过判断 nodes 来决定是否需要创建 Member
 *
 * 创建 Member 至少需要 nodes 有两个元素
 *
 * nodes 元素类型没有限制，可以是 Identifier、Literal、Call，或是别的完整表达式
 *
 * @param raw
 * @param nodes
 */
export declare function createMemberIfNeeded(raw: string, nodes: Node[]): Node | Identifier | Member;
//# sourceMappingURL=creator.d.ts.map