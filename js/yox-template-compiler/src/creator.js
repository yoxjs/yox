import * as env from '../../yox-common/src/util/env';
import * as keypathUtil from '../../yox-common/src/util/keypath';
import * as nodeType from './nodeType';
export function createAttribute(name) {
    return {
        type: nodeType.ATTRIBUTE,
        isStatic: env.TRUE,
        name,
    };
}
export function createDirective(ns, name, value, expr, children) {
    return {
        type: nodeType.DIRECTIVE,
        ns,
        name,
        key: keypathUtil.join(ns, name),
        value,
        expr,
        children,
    };
}
export function createProperty(name, hint, value, expr, children) {
    return {
        type: nodeType.PROPERTY,
        isStatic: env.TRUE,
        name,
        hint,
        value,
        expr,
        children,
    };
}
export function createEach(from, to, equal, index) {
    return {
        type: nodeType.EACH,
        from,
        to,
        equal,
        index,
        isComplex: env.TRUE,
    };
}
export function createElement(tag, isSvg, isComponent) {
    // 是 svg 就不可能是组件
    // 加这个判断的原因是，svg 某些标签含有 连字符 和 大写字母，比较蛋疼
    if (isSvg) {
        isComponent = env.FALSE;
    }
    return {
        type: nodeType.ELEMENT,
        tag,
        isSvg,
        isStyle: tag === 'style',
        // 只有 <option> 没有 value 属性时才为 true
        isOption: env.FALSE,
        isComponent,
        isStatic: !isComponent && tag !== env.RAW_SLOT,
    };
}
export function createElse() {
    return {
        type: nodeType.ELSE,
    };
}
export function createElseIf(expr) {
    return {
        type: nodeType.ELSE_IF,
        expr,
    };
}
export function createExpression(expr, safe) {
    return {
        type: nodeType.EXPRESSION,
        expr,
        safe,
        isLeaf: env.TRUE,
    };
}
export function createIf(expr) {
    return {
        type: nodeType.IF,
        expr,
    };
}
export function createImport(name) {
    return {
        type: nodeType.IMPORT,
        name,
        isComplex: env.TRUE,
        isLeaf: env.TRUE,
    };
}
export function createPartial(name) {
    return {
        type: nodeType.PARTIAL,
        name,
        isComplex: env.TRUE,
    };
}
export function createSpread(expr, binding) {
    return {
        type: nodeType.SPREAD,
        expr,
        binding,
        isLeaf: env.TRUE,
    };
}
export function createText(text) {
    return {
        type: nodeType.TEXT,
        text,
        isStatic: env.TRUE,
        isLeaf: env.TRUE,
    };
}
