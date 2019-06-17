import * as config from '../../yox-config/src/config';
import isDef from '../../yox-common/src/function/isDef';
import isUndef from '../../yox-common/src/function/isUndef';
import * as env from '../../yox-common/src/util/env';
import * as array from '../../yox-common/src/util/array';
import * as string from '../../yox-common/src/util/string';
import * as object from '../../yox-common/src/util/object';
import * as generator from '../../yox-common/src/util/generator';
import * as exprGenerator from '../../yox-expression-compiler/src/generator';
import * as exprNodeType from '../../yox-expression-compiler/src/nodeType';
import * as nodeType from './nodeType';
/**
 * 这里的难点在于处理 Element 的 children，举个例子：
 *
 * ['1', _x(expr), _l(expr, index, generate), _x(expr) ? ['1', _x(expr), _l(expr, index, generate)] : y]
 *
 * children 用数组表示，其中表达式求出的值可能是任意类型，比如数组或对象，我们无法控制表达式的值最终会是什么类型
 *
 * 像 each 或 import 这样的语法，内部其实会产生一个 vnode 数组，这里就出现了两个难点：
 *
 * 1. 如何区分 each 或其他语法产生的数组和表达式求值的数组
 * 2. 如何避免频繁的创建数组
 *
 * 我能想到的解决方案是，根据当前节点类型，如果是元素，则确保 children 的每一项的值序列化后都是函数调用的形式
 *
 * 这样能确保是从左到右依次执行，也就便于在内部创建一个公共数组，执行一个函数就收集一个值，而不管那个值到底是什么类型
 *
 */
// 是否要执行 join 操作
const joinStack = [], 
// 是否正在收集子节点
collectStack = [], nodeGenerator = {}, RENDER_EXPRESSION_IDENTIFIER = 'a', RENDER_EXPRESSION_MEMBER_KEYPATH = 'b', RENDER_EXPRESSION_MEMBER_LITERAL = 'c', RENDER_EXPRESSION_CALL = 'd', RENDER_TEXT_VNODE = 'e', RENDER_ATTRIBUTE_VNODE = 'f', RENDER_PROPERTY_VNODE = 'g', RENDER_LAZY_VNODE = 'h', RENDER_TRANSITION_VNODE = 'i', RENDER_BINDING_VNODE = 'j', RENDER_MODEL_VNODE = 'k', RENDER_EVENT_METHOD_VNODE = 'l', RENDER_EVENT_NAME_VNODE = 'm', RENDER_DIRECTIVE_VNODE = 'n', RENDER_SPREAD_VNODE = 'o', RENDER_ELEMENT_VNODE = 'p', RENDER_SLOT = 'q', RENDER_PARTIAL = 'r', RENDER_IMPORT = 's', RENDER_EACH = 't', TO_STRING = 'u', ARG_STACK = 'v', CODE_RETURN = 'return ';
// 序列化代码的前缀
let codePrefix, 
// 表达式求值是否要求返回字符串类型
isStringRequired;
function renderExpression(expr, holder, depIgnore, stack) {
    return exprGenerator.generate(expr, RENDER_EXPRESSION_IDENTIFIER, RENDER_EXPRESSION_MEMBER_KEYPATH, RENDER_EXPRESSION_MEMBER_LITERAL, RENDER_EXPRESSION_CALL, holder, depIgnore, stack);
}
function stringifyObject(obj) {
    const fields = [];
    object.each(obj, function (value, key) {
        if (isDef(value)) {
            array.push(fields, generator.toString(key) + generator.COLON + value);
        }
    });
    return generator.toObject(fields);
}
function stringifyFunction(result, arg) {
    return `${env.RAW_FUNCTION}(${arg || env.EMPTY_STRING}){${result || env.EMPTY_STRING}}`;
}
function stringifyGroup(code) {
    return `(${code})`;
}
function stringifyExpression(expr, toString) {
    const value = renderExpression(expr);
    return toString
        ? generator.toCall(TO_STRING, [
            value
        ])
        : value;
}
function stringifyExpressionVnode(expr, toString) {
    return generator.toCall(RENDER_TEXT_VNODE, [
        stringifyExpression(expr, toString)
    ]);
}
function stringifyExpressionArg(expr) {
    return renderExpression(expr, env.FALSE, env.FALSE, ARG_STACK);
}
function stringifyValue(value, expr, children) {
    if (isDef(value)) {
        return generator.toString(value);
    }
    // 只有一个表达式时，保持原始类型
    if (expr) {
        return stringifyExpression(expr);
    }
    // 多个值拼接时，要求是字符串
    if (children) {
        isStringRequired = children.length > 1;
        return stringifyChildren(children);
    }
}
function stringifyChildren(children, isComplex) {
    // 如果是复杂节点的 children，则每个 child 的序列化都是函数调用的形式
    // 因此最后可以拼接为 fn1(), fn2(), fn3() 这样依次调用，而不用再多此一举的使用数组，因为在 renderer 里也用不上这个数组
    // children 大于一个时，才有 join 的可能，单个值 jion 啥啊...
    const isJoin = children.length > 1 && !isComplex;
    array.push(joinStack, isJoin);
    const value = array.join(children.map(function (child) {
        return nodeGenerator[child.type](child);
    }), isJoin ? generator.PLUS : generator.COMMA);
    array.pop(joinStack);
    return value;
}
function stringifyConditionChildren(children, isComplex) {
    if (children) {
        const result = stringifyChildren(children, isComplex);
        return children.length > 1 && isComplex
            ? stringifyGroup(result)
            : result;
    }
}
function stringifyIf(node, stub) {
    let { children, isComplex, next } = node, test = stringifyExpression(node.expr), yes = stringifyConditionChildren(children, isComplex), no, result;
    if (next) {
        no = next.type === nodeType.ELSE
            ? stringifyConditionChildren(next.children, next.isComplex)
            : stringifyIf(next, stub);
    }
    // 到达最后一个条件，发现第一个 if 语句带有 stub，需创建一个注释标签占位
    else if (stub) {
        no = renderElement(stringifyObject({
            isComment: generator.TRUE,
            text: generator.EMPTY,
        }));
    }
    if (isDef(yes) || isDef(no)) {
        const isJoin = array.last(joinStack);
        if (isJoin) {
            if (isUndef(yes)) {
                yes = generator.EMPTY;
            }
            if (isUndef(no)) {
                no = generator.EMPTY;
            }
        }
        if (isUndef(no)) {
            result = test + generator.AND + yes;
        }
        else if (isUndef(yes)) {
            result = generator.NOT + test + generator.AND + no;
        }
        else {
            result = test + generator.QUESTION + yes + generator.COLON + no;
        }
        // 如果是连接操作，因为 ?: 优先级最低，因此要加 ()
        return isJoin
            ? stringifyGroup(result)
            : result;
    }
    return generator.EMPTY;
}
function renderElement(data, tag, attrs, childs, slots) {
    return generator.toCall(RENDER_ELEMENT_VNODE, [data, tag, attrs, childs, slots]);
}
function getComponentSlots(children) {
    const result = {}, slots = {}, addSlot = function (name, nodes) {
        if (!array.falsy(nodes)) {
            name = config.SLOT_DATA_PREFIX + name;
            array.push(slots[name] || (slots[name] = []), nodes);
        }
    };
    array.each(children, function (child) {
        // 找到具名 slot
        if (child.type === nodeType.ELEMENT) {
            const element = child;
            if (element.slot) {
                addSlot(element.slot, element.tag === env.RAW_TEMPLATE
                    ? element.children
                    : [element]);
                return;
            }
        }
        // 匿名 slot，名称统一为 children
        addSlot(config.SLOT_NAME_DEFAULT, [child]);
    });
    object.each(slots, function (children, name) {
        // 强制为复杂节点，因为 slot 的子节点不能用字符串拼接的方式来渲染
        result[name] = stringifyFunction(stringifyChildren(children, env.TRUE));
    });
    if (!object.falsy(result)) {
        return stringifyObject(result);
    }
}
nodeGenerator[nodeType.ELEMENT] = function (node) {
    let { tag, isComponent, isSvg, isStyle, isOption, isStatic, isComplex, name, ref, key, html, attrs, children } = node, data = {}, outputTag, outputAttrs = [], outputChilds, outputSlots;
    if (tag === env.RAW_SLOT) {
        const args = [generator.toString(config.SLOT_DATA_PREFIX + name)];
        if (children) {
            array.push(args, stringifyFunction(stringifyChildren(children, env.TRUE)));
        }
        return generator.toCall(RENDER_SLOT, args);
    }
    array.push(collectStack, env.FALSE);
    if (attrs) {
        array.each(attrs, function (attr) {
            array.push(outputAttrs, nodeGenerator[attr.type](attr));
        });
    }
    // 如果以 $ 开头，表示动态组件
    if (string.codeAt(tag) === 36) {
        outputTag = generator.toString(string.slice(tag, 1));
    }
    else {
        data.tag = generator.toString(tag);
    }
    if (isSvg) {
        data.isSvg = generator.TRUE;
    }
    if (isStyle) {
        data.isStyle = generator.TRUE;
    }
    if (isOption) {
        data.isOption = generator.TRUE;
    }
    if (isStatic) {
        data.isStatic = generator.TRUE;
    }
    if (ref) {
        data.ref = stringifyValue(ref.value, ref.expr, ref.children);
    }
    if (key) {
        data.key = stringifyValue(key.value, key.expr, key.children);
    }
    if (html) {
        data.html = stringifyExpression(html, env.TRUE);
    }
    if (isComponent) {
        data.isComponent = generator.TRUE;
        if (children) {
            collectStack[collectStack.length - 1] = env.TRUE;
            outputSlots = getComponentSlots(children);
        }
    }
    else if (children) {
        isStringRequired = env.TRUE;
        collectStack[collectStack.length - 1] = isComplex;
        outputChilds = stringifyChildren(children, isComplex);
        if (isComplex) {
            outputChilds = stringifyFunction(outputChilds);
        }
        else {
            data.text = outputChilds;
            outputChilds = env.UNDEFINED;
        }
    }
    array.pop(collectStack);
    return renderElement(stringifyObject(data), outputTag, array.falsy(outputAttrs)
        ? env.UNDEFINED
        : stringifyFunction(array.join(outputAttrs, generator.COMMA)), outputChilds, outputSlots);
};
nodeGenerator[nodeType.ATTRIBUTE] = function (node) {
    const value = node.binding
        ? generator.toCall(RENDER_BINDING_VNODE, [
            generator.toString(node.name),
            renderExpression(node.expr, env.TRUE, env.TRUE)
        ])
        : stringifyValue(node.value, node.expr, node.children);
    return generator.toCall(RENDER_ATTRIBUTE_VNODE, [
        generator.toString(node.name),
        value
    ]);
};
nodeGenerator[nodeType.PROPERTY] = function (node) {
    const value = node.binding
        ? generator.toCall(RENDER_BINDING_VNODE, [
            generator.toString(node.name),
            renderExpression(node.expr, env.TRUE, env.TRUE),
            generator.toString(node.hint)
        ])
        : stringifyValue(node.value, node.expr, node.children);
    return generator.toCall(RENDER_PROPERTY_VNODE, [
        generator.toString(node.name),
        generator.toString(node.hint),
        value
    ]);
};
nodeGenerator[nodeType.DIRECTIVE] = function (node) {
    const { ns, name, key, value, expr } = node;
    if (ns === config.DIRECTIVE_LAZY) {
        return generator.toCall(RENDER_LAZY_VNODE, [
            generator.toString(name),
            generator.toString(value)
        ]);
    }
    // <div transition="name">
    if (ns === env.RAW_TRANSITION) {
        return generator.toCall(RENDER_TRANSITION_VNODE, [
            generator.toString(value)
        ]);
    }
    // <input model="id">
    if (ns === config.DIRECTIVE_MODEL) {
        return generator.toCall(RENDER_MODEL_VNODE, [
            renderExpression(expr, env.TRUE, env.TRUE)
        ]);
    }
    let renderName = RENDER_DIRECTIVE_VNODE, args = [
        generator.toString(name),
        generator.toString(key),
        generator.toString(value),
    ];
    // 尽可能把表达式编译成函数，这样对外界最友好
    //
    // 众所周知，事件指令会编译成函数，对于自定义指令来说，也要尽可能编译成函数
    //
    // 比如 o-tap="method()" 或 o-log="{'id': '11'}"
    // 前者会编译成 handler（调用方法），后者会编译成 getter（取值）
    if (expr) {
        // 如果表达式明确是在调用方法，则序列化成 method + args 的形式
        if (expr.type === exprNodeType.CALL) {
            if (ns === config.DIRECTIVE_EVENT) {
                renderName = RENDER_EVENT_METHOD_VNODE;
            }
            // compiler 保证了函数调用的 name 是标识符
            array.push(args, generator.toString(expr.name.name));
            // 为了实现运行时动态收集参数，这里序列化成函数
            if (!array.falsy(expr.args)) {
                // args 函数在触发事件时调用，调用时会传入它的作用域，因此这里要加一个参数
                array.push(args, stringifyFunction(CODE_RETURN + generator.toArray(expr.args.map(stringifyExpressionArg)), ARG_STACK));
            }
        }
        // 不是调用方法，就是事件转换
        else if (ns === config.DIRECTIVE_EVENT) {
            renderName = RENDER_EVENT_NAME_VNODE;
            array.push(args, generator.toString(expr.raw));
        }
        else if (ns === config.DIRECTIVE_CUSTOM) {
            // 取值函数
            // getter 函数在触发事件时调用，调用时会传入它的作用域，因此这里要加一个参数
            if (expr.type !== exprNodeType.LITERAL) {
                array.push(args, env.UNDEFINED); // method
                array.push(args, env.UNDEFINED); // args
                array.push(args, stringifyFunction(CODE_RETURN + stringifyExpressionArg(expr), ARG_STACK));
            }
        }
    }
    return generator.toCall(renderName, args);
};
nodeGenerator[nodeType.SPREAD] = function (node) {
    return generator.toCall(RENDER_SPREAD_VNODE, [
        renderExpression(node.expr, env.TRUE, node.binding)
    ]);
};
nodeGenerator[nodeType.TEXT] = function (node) {
    const result = generator.toString(node.text);
    if (array.last(collectStack) && !array.last(joinStack)) {
        return generator.toCall(RENDER_TEXT_VNODE, [
            result
        ]);
    }
    return result;
};
nodeGenerator[nodeType.EXPRESSION] = function (node) {
    // 强制保留 isStringRequired 参数，减少运行时判断参数是否存在
    // 因为还有 stack 参数呢，各种判断真的很累
    if (array.last(collectStack) && !array.last(joinStack)) {
        return stringifyExpressionVnode(node.expr, isStringRequired);
    }
    return stringifyExpression(node.expr, isStringRequired);
};
nodeGenerator[nodeType.IF] = function (node) {
    return stringifyIf(node, node.stub);
};
nodeGenerator[nodeType.EACH] = function (node) {
    return generator.toCall(RENDER_EACH, [
        // compiler 保证了 children 一定有值
        stringifyFunction(stringifyChildren(node.children, node.isComplex)),
        renderExpression(node.from, env.TRUE),
        node.to ? renderExpression(node.to, env.TRUE) : env.UNDEFINED,
        node.equal ? generator.TRUE : env.UNDEFINED,
        node.index ? generator.toString(node.index) : env.UNDEFINED
    ]);
};
nodeGenerator[nodeType.PARTIAL] = function (node) {
    return generator.toCall(RENDER_PARTIAL, [
        generator.toString(node.name),
        // compiler 保证了 children 一定有值
        stringifyFunction(stringifyChildren(node.children, node.isComplex))
    ]);
};
nodeGenerator[nodeType.IMPORT] = function (node) {
    return generator.toCall(RENDER_IMPORT, [
        generator.toString(node.name)
    ]);
};
export function generate(node) {
    if (!codePrefix) {
        codePrefix = `function(${array.join([
            RENDER_EXPRESSION_IDENTIFIER,
            RENDER_EXPRESSION_MEMBER_KEYPATH,
            RENDER_EXPRESSION_MEMBER_LITERAL,
            RENDER_EXPRESSION_CALL,
            RENDER_TEXT_VNODE,
            RENDER_ATTRIBUTE_VNODE,
            RENDER_PROPERTY_VNODE,
            RENDER_LAZY_VNODE,
            RENDER_TRANSITION_VNODE,
            RENDER_BINDING_VNODE,
            RENDER_MODEL_VNODE,
            RENDER_EVENT_METHOD_VNODE,
            RENDER_EVENT_NAME_VNODE,
            RENDER_DIRECTIVE_VNODE,
            RENDER_SPREAD_VNODE,
            RENDER_ELEMENT_VNODE,
            RENDER_SLOT,
            RENDER_PARTIAL,
            RENDER_IMPORT,
            RENDER_EACH,
            TO_STRING,
        ], generator.COMMA)}){${CODE_RETURN}`;
    }
    return codePrefix + nodeGenerator[node.type](node) + '}';
}
