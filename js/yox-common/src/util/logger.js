import * as env from './env';
import toString from '../function/toString';
export const DEBUG = 1;
export const INFO = 2;
export const WARN = 3;
export const ERROR = 4;
export const FATAL = 5;
/**
 * 是否有原生的日志特性，没有必要单独实现
 */
const nativeConsole = typeof console !== env.RAW_UNDEFINED ? console : env.NULL, 
/**
 * 当前是否是源码调试，如果开启了代码压缩，empty function 里的注释会被干掉
 */
level = /yox/.test(toString(env.EMPTY_FUNCTION)) ? DEBUG : WARN, 
/**
 * console 样式前缀
 */
stylePrefix = '%c';
/**
 * 全局调试开关
 */
function getLevel() {
    if (env.WINDOW) {
        const logLevel = env.WINDOW['YOX_LOG_LEVEL'];
        if (logLevel >= DEBUG && logLevel <= FATAL) {
            return logLevel;
        }
    }
    return level;
}
function getStyle(backgroundColor) {
    return `background-color:${backgroundColor};border-radius:12px;color:#fff;font-size:10px;padding:3px 6px;`;
}
/**
 * 打印 debug 日志
 *
 * @param msg
 */
export function debug(msg, tag) {
    if (nativeConsole && getLevel() <= DEBUG) {
        nativeConsole.log(stylePrefix + (tag || 'Yox debug'), getStyle('#999'), msg);
    }
}
/**
 * 打印 info 日志
 *
 * @param msg
 */
export function info(msg, tag) {
    if (nativeConsole && getLevel() <= INFO) {
        nativeConsole.log(stylePrefix + (tag || 'Yox info'), getStyle('#2db7f5'), msg);
    }
}
/**
 * 打印 warn 日志
 *
 * @param msg
 */
export function warn(msg, tag) {
    if (nativeConsole && getLevel() <= WARN) {
        nativeConsole.warn(stylePrefix + (tag || 'Yox warn'), getStyle('#f90'), msg);
    }
}
/**
 * 打印 error 日志
 *
 * @param msg
 */
export function error(msg, tag) {
    if (nativeConsole && getLevel() <= ERROR) {
        nativeConsole.error(stylePrefix + (tag || 'Yox error'), getStyle('#ed4014'), msg);
    }
}
/**
 * 致命错误，中断程序
 *
 * @param msg
 */
export function fatal(msg, tag) {
    if (getLevel() <= FATAL) {
        throw new Error(`[${tag || 'Yox fatal'}]: ${msg}`);
    }
}
