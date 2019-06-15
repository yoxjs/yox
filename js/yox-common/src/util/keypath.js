import * as env from './env';
import * as string from './string';
import isDef from '../function/isDef';
const dotPattern = /\./g, asteriskPattern = /\*/g, doubleAsteriskPattern = /\*\*/g, splitCache = {}, patternCache = {};
export const separator = '.';
/**
 * 判断 keypath 是否以 prefix 开头，如果是，返回匹配上的前缀长度，否则返回 -1
 *
 * @param keypath
 * @param prefix
 * @return
 */
export function match(keypath, prefix) {
    if (keypath === prefix) {
        return prefix.length;
    }
    prefix += separator;
    return string.startsWith(keypath, prefix)
        ? prefix.length
        : env.RAW_MINUS_ONE;
}
/**
 * 遍历 keypath 的每个部分
 *
 * @param keypath
 * @param callback 返回 false 可中断遍历
 */
export function each(keypath, callback) {
    // 判断字符串是因为 keypath 有可能是 toString
    // 而 splitCache.toString 是个函数
    const list = isDef(splitCache[keypath])
        ? splitCache[keypath]
        : (splitCache[keypath] = keypath.split(separator));
    for (let i = 0, lastIndex = list.length - 1; i <= lastIndex; i++) {
        if (callback(list[i], i === lastIndex) === env.FALSE) {
            break;
        }
    }
}
/**
 * 遍历 keypath 的每个部分
 *
 * @param keypath1
 * @param keypath2
 */
export function join(keypath1, keypath2) {
    return keypath1 && keypath2
        ? keypath1 + separator + keypath2
        : keypath1 || keypath2;
}
/**
 * 是否模糊匹配
 *
 * @param keypath
 */
export function isFuzzy(keypath) {
    return string.has(keypath, env.RAW_WILDCARD);
}
/**
 * 模糊匹配 keypath
 *
 * @param keypath
 * @param pattern
 */
export function matchFuzzy(keypath, pattern) {
    let cache = patternCache[pattern];
    if (!cache) {
        const str = pattern
            .replace(dotPattern, '\\.')
            .replace(asteriskPattern, '(\\w+)')
            .replace(doubleAsteriskPattern, '([\.\\w]+?)');
        cache = patternCache[pattern] = new RegExp(`^${str}$`);
    }
    const result = keypath.match(cache);
    if (result) {
        return result[1];
    }
}
