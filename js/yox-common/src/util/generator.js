import isDef from '../function/isDef';
import * as env from './env';
import * as array from './array';
export const TRUE = '!0';
export const FALSE = '!1';
export const COMMA = ',';
export const COLON = ':';
export const PLUS = '+';
export const AND = '&&';
export const QUESTION = '?';
export const NOT = '!';
export const EMPTY = '""';
/**
 * 目的是 保证调用参数顺序稳定，减少运行时判断
 */
function trimArgs(list) {
    let args = [], removable = env.TRUE;
    array.each(list, function (arg) {
        if (isDef(arg)) {
            removable = env.FALSE;
            array.unshift(args, arg);
        }
        else if (!removable) {
            array.unshift(args, FALSE);
        }
    }, env.TRUE);
    return args;
}
export function toObject(fields) {
    return `{${array.join(fields, COMMA)}}`;
}
export function toArray(items) {
    return `[${array.join(items, COMMA)}]`;
}
export function toCall(name, args) {
    return `${name}(${array.join(trimArgs(args), COMMA)})`;
}
export function toString(value) {
    return JSON.stringify(value);
}
