export declare const DEBUG = 1;
export declare const INFO = 2;
export declare const WARN = 3;
export declare const ERROR = 4;
export declare const FATAL = 5;
/**
 * 打印 debug 日志
 *
 * @param msg
 */
export declare function debug(msg: string, tag?: string): void;
/**
 * 打印 info 日志
 *
 * @param msg
 */
export declare function info(msg: string, tag?: string): void;
/**
 * 打印 warn 日志
 *
 * @param msg
 */
export declare function warn(msg: string, tag?: string): void;
/**
 * 打印 error 日志
 *
 * @param msg
 */
export declare function error(msg: string, tag?: string): void;
/**
 * 致命错误，中断程序
 *
 * @param msg
 */
export declare function fatal(msg: string, tag?: string): void;
//# sourceMappingURL=logger.d.ts.map