import * as env from '../../yox-common/src/util/env';
export const unary = {
    '+': env.TRUE,
    '-': env.TRUE,
    '~': env.TRUE,
    '!': env.TRUE,
    '!!': env.TRUE,
};
// 参考 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
export const binary = {
    '*': 14,
    '/': 14,
    '%': 14,
    '+': 13,
    '-': 13,
    '<<': 12,
    '>>': 12,
    '>>>': 12,
    '<': 11,
    '<=': 11,
    '>': 11,
    '>=': 11,
    '==': 10,
    '!=': 10,
    '===': 10,
    '!==': 10,
    '&': 9,
    '^': 8,
    '|': 7,
    '&&': 6,
    '||': 5,
};
