import * as env from '../../yox-common/src/util/env';
import * as array from '../../yox-common/src/util/array';
import * as generator from '../../yox-common/src/util/generator';
import * as nodeType from './nodeType';
export function generate(node, renderIdentifier, renderMemberKeypath, renderMemberLiteral, renderCall, holder, depIgnore, stack, inner) {
    let value, isSpecialNode = env.FALSE, generateChildNode = function (node) {
        return generate(node, renderIdentifier, renderMemberKeypath, renderMemberLiteral, renderCall, holder, depIgnore, stack, env.TRUE);
    };
    switch (node.type) {
        case nodeType.LITERAL:
            value = generator.toString(node.value);
            break;
        case nodeType.UNARY:
            value = node.operator + generateChildNode(node.node);
            break;
        case nodeType.BINARY:
            value = generateChildNode(node.left)
                + node.operator
                + generateChildNode(node.right);
            break;
        case nodeType.TERNARY:
            value = generateChildNode(node.test)
                + generator.QUESTION
                + generateChildNode(node.yes)
                + generator.COLON
                + generateChildNode(node.no);
            break;
        case nodeType.ARRAY:
            const items = node.nodes.map(generateChildNode);
            value = generator.toArray(items);
            break;
        case nodeType.OBJECT:
            const fields = [];
            array.each(node.keys, function (key, index) {
                array.push(fields, generator.toString(key)
                    + generator.COLON
                    + generateChildNode(node.values[index]));
            });
            value = generator.toObject(fields);
            break;
        case nodeType.IDENTIFIER:
            isSpecialNode = env.TRUE;
            const identifier = node;
            value = generator.toCall(renderIdentifier, [
                generator.toString(identifier.name),
                identifier.lookup ? generator.TRUE : env.UNDEFINED,
                identifier.offset > 0 ? generator.toString(identifier.offset) : env.UNDEFINED,
                holder ? generator.TRUE : env.UNDEFINED,
                depIgnore ? generator.TRUE : env.UNDEFINED,
                stack ? stack : env.UNDEFINED
            ]);
            break;
        case nodeType.MEMBER:
            isSpecialNode = env.TRUE;
            const { lead, keypath, nodes, lookup, offset } = node, stringifyNodes = nodes ? nodes.map(generateChildNode) : [];
            if (lead.type === nodeType.IDENTIFIER) {
                // 只能是 a[b] 的形式，因为 a.b 已经在解析时转换成 Identifier 了
                value = generator.toCall(renderIdentifier, [
                    generator.toCall(renderMemberKeypath, [
                        generator.toString(lead.name),
                        generator.toArray(stringifyNodes)
                    ]),
                    lookup ? generator.TRUE : env.UNDEFINED,
                    offset > 0 ? generator.toString(offset) : env.UNDEFINED,
                    holder ? generator.TRUE : env.UNDEFINED,
                    depIgnore ? generator.TRUE : env.UNDEFINED,
                    stack ? stack : env.UNDEFINED
                ]);
            }
            else if (nodes) {
                // "xx"[length]
                // format()[a][b]
                value = generator.toCall(renderMemberLiteral, [
                    generateChildNode(lead),
                    env.UNDEFINED,
                    generator.toArray(stringifyNodes),
                    holder ? generator.TRUE : env.UNDEFINED
                ]);
            }
            else {
                // "xx".length
                // format().a.b
                value = generator.toCall(renderMemberLiteral, [
                    generateChildNode(lead),
                    generator.toString(keypath),
                    env.UNDEFINED,
                    holder ? generator.TRUE : env.UNDEFINED,
                ]);
            }
            break;
        default:
            isSpecialNode = env.TRUE;
            const { args } = node;
            value = generator.toCall(renderCall, [
                generateChildNode(node.name),
                args.length
                    ? generator.toArray(args.map(generateChildNode))
                    : env.UNDEFINED,
                holder ? generator.TRUE : env.UNDEFINED
            ]);
            break;
    }
    // 不需要 value holder
    if (!holder) {
        return value;
    }
    // 内部的临时值，且 holder 为 true
    if (inner) {
        return isSpecialNode
            ? value + '.' + env.RAW_VALUE
            : value;
    }
    // 最外层的值，且 holder 为 true
    return isSpecialNode
        ? value
        : generator.toObject([env.RAW_VALUE + generator.COLON + value]);
}
