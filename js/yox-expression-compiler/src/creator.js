import toString from '../../yox-common/src/function/toString';
import * as env from '../../yox-common/src/util/env';
import * as array from '../../yox-common/src/util/array';
import * as keypathUtil from '../../yox-common/src/util/keypath';
import * as nodeType from './nodeType';
export function createArray(nodes, raw) {
    return {
        type: nodeType.ARRAY,
        raw,
        nodes,
    };
}
export function createBinary(left, operator, right, raw) {
    return {
        type: nodeType.BINARY,
        raw,
        left,
        operator,
        right,
    };
}
export function createCall(name, args, raw) {
    return {
        type: nodeType.CALL,
        raw,
        name,
        args,
    };
}
function createIdentifierInner(raw, name, lookup, offset) {
    return {
        type: nodeType.IDENTIFIER,
        raw,
        name,
        lookup,
        offset,
    };
}
function createMemberInner(raw, lead, keypath, nodes, lookup, offset) {
    return {
        type: nodeType.MEMBER,
        raw,
        lead,
        keypath,
        nodes,
        lookup,
        offset,
    };
}
export function createIdentifier(raw, name, isProp) {
    let lookup = env.TRUE, offset = 0;
    if (name === env.KEYPATH_CURRENT
        || name === env.KEYPATH_PARENT) {
        lookup = env.FALSE;
        if (name === env.KEYPATH_PARENT) {
            offset = 1;
        }
        name = env.EMPTY_STRING;
    }
    // 对象属性需要区分 a.b 和 a[b]
    // 如果不借用 Literal 无法实现这个判断
    // 同理，如果用了这种方式，就无法区分 a.b 和 a['b']，但是无所谓，这两种表示法本就一个意思
    return isProp
        ? createLiteral(name, raw)
        : createIdentifierInner(raw, name, lookup, offset);
}
export function createLiteral(value, raw) {
    return {
        type: nodeType.LITERAL,
        raw,
        value,
    };
}
export function createObject(keys, values, raw) {
    return {
        type: nodeType.OBJECT,
        raw,
        keys,
        values,
    };
}
export function createTernary(test, yes, no, raw) {
    return {
        type: nodeType.TERNARY,
        raw,
        test,
        yes,
        no,
    };
}
export function createUnary(operator, node, raw) {
    return {
        type: nodeType.UNARY,
        raw,
        operator,
        node,
    };
}
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
export function createMemberIfNeeded(raw, nodes) {
    let firstNode = nodes.shift(), { length } = nodes, lookup = env.TRUE, offset = 0;
    // member 要求至少两个节点
    if (length > 0) {
        // 处理剩下的 nodes
        // 这里要做两手准备：
        // 1. 如果全是 literal 节点，则编译时 join
        // 2. 如果不全是 literal 节点，则运行时 join
        let isLiteral = env.TRUE, staticNodes = [], runtimeNodes = [];
        array.each(nodes, function (node) {
            if (node.type === nodeType.LITERAL) {
                const literal = node;
                if (literal.raw === env.KEYPATH_PARENT) {
                    offset += 1;
                    return;
                }
                if (literal.raw !== env.KEYPATH_CURRENT) {
                    array.push(staticNodes, toString(literal.value));
                }
            }
            else {
                isLiteral = env.FALSE;
            }
            array.push(runtimeNodes, node);
        });
        // lookup 要求第一位元素是 Identifier，且它的 lookup 是 true 才为 true
        // 其他情况都为 false，如 "11".length 第一位元素是 Literal，不存在向上寻找的需求
        // 优化 1：计算 keypath
        //
        // 计算 keypath 的唯一方式是，第一位元素是 Identifier，后面都是 Literal
        // 否则就表示中间包含动态元素，这会导致无法计算静态路径
        // 如 a.b.c 可以算出 staticKeypath，而 a[b].c 则不行，因为 b 是动态的
        // 优化 2：计算 offset 并智能转成 Identifier
        //
        // 比如 xx 这样的表达式，应优化成 offset = 2，并转成 Identifier
        // 处理第一个节点
        if (firstNode.type === nodeType.IDENTIFIER) {
            const identifier = firstNode;
            lookup = identifier.lookup;
            offset += identifier.offset;
            let name = identifier.name;
            // 不是 KEYPATH_THIS 或 KEYPATH_PARENT
            if (name) {
                array.unshift(staticNodes, name);
            }
            // a.b.c
            if (isLiteral) {
                // 转成 Identifier
                name = array.join(staticNodes, keypathUtil.separator);
                firstNode = createIdentifierInner(name, name, lookup, offset);
            }
            // a[b]
            else {
                firstNode = createMemberInner(raw, firstNode, env.UNDEFINED, runtimeNodes, lookup, offset);
            }
        }
        else {
            // "xxx".length
            // format().a.b
            if (isLiteral) {
                firstNode = createMemberInner(raw, firstNode, array.join(staticNodes, keypathUtil.separator), env.UNDEFINED, lookup, offset);
            }
            // "xxx"[length]
            // format()[a]
            else {
                firstNode = createMemberInner(raw, firstNode, env.UNDEFINED, runtimeNodes, lookup, offset);
            }
        }
    }
    return firstNode;
}
