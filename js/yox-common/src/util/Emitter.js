import execute from '../function/execute';
import * as is from './is';
import * as env from './env';
import * as array from './array';
import * as object from './object';
import * as string from './string';
import * as logger from './logger';
import CustomEvent from './CustomEvent';
export default class Emitter {
    constructor(ns) {
        this.ns = ns || env.FALSE;
        this.listeners = {};
    }
    /**
     * 发射事件
     *
     * @param bullet 事件或事件名称
     * @param data 事件数据
     */
    fire(type, args, filter) {
        let instance = this, { name, ns } = parseNamespace(instance.ns, type), list = instance.listeners[name], isComplete = env.TRUE;
        if (list) {
            // 避免遍历过程中，数组发生变化，比如增删了
            list = object.copy(list);
            // 判断是否是发射事件
            // 如果 args 的第一个参数是 CustomEvent 类型，表示发射事件
            // 因为事件处理函数的参数列表是 (event, data)
            const event = args && args[0] instanceof CustomEvent
                ? args[0]
                : env.UNDEFINED;
            array.each(list, function (options, _) {
                // 命名空间不匹配
                if (!matchNamespace(ns, options)
                    // 在 fire 过程中被移除了
                    || !array.has(list, options)
                    // 传了 filter，则用 filter 判断是否过滤此 options
                    || (filter && !filter(type, args, options))) {
                    return;
                }
                // 为 event 对象加上当前正在处理的 listener
                // 这样方便业务层移除事件绑定
                // 比如 on('xx', function) 这样定义了匿名 listener
                // 在这个 listener 里面获取不到当前 listener 的引用
                // 为了能引用到，有时候会先定义 var listener = function,
                // 然后再 on('xx', listener) 这样其实是没有必要的
                if (event) {
                    event.listener = options.fn;
                }
                let result = execute(options.fn, options.ctx, args);
                if (event) {
                    event.listener = env.UNDEFINED;
                }
                // 执行次数
                options.num = options.num ? (options.num + 1) : 1;
                // 注册的 listener 可以指定最大执行次数
                if (options.num === options.max) {
                    instance.off(type, options.fn);
                }
                // 如果没有返回 false，而是调用了 event.stop 也算是返回 false
                if (event) {
                    if (result === env.FALSE) {
                        event.prevent().stop();
                    }
                    else if (event.isStoped) {
                        result = env.FALSE;
                    }
                }
                if (result === env.FALSE) {
                    return isComplete = env.FALSE;
                }
            });
        }
        return isComplete;
    }
    /**
     * 注册监听
     *
     * @param type
     * @param listener
     */
    on(type, listener) {
        const instance = this, { listeners } = instance, options = is.func(listener)
            ? { fn: listener }
            : listener;
        if (is.object(options) && is.func(options.fn)) {
            const { name, ns } = parseNamespace(instance.ns, type);
            options.ns = ns;
            array.push(listeners[name] || (listeners[name] = []), options);
        }
        else if (process.env.NODE_ENV === 'development') {
            logger.fatal(`Invoke emitter.on(type, listener) failed.`);
        }
    }
    /**
     * 取消监听
     *
     * @param type
     * @param listener
     */
    off(type, listener) {
        const instance = this, { listeners } = instance;
        if (type) {
            const { name, ns } = parseNamespace(instance.ns, type), matchListener = createMatchListener(listener), each = function (list, name) {
                array.each(list, function (options, index) {
                    if (matchListener(options) && matchNamespace(ns, options)) {
                        list.splice(index, 1);
                    }
                }, env.TRUE);
                if (!list.length) {
                    delete listeners[name];
                }
            };
            if (name) {
                if (listeners[name]) {
                    each(listeners[name], name);
                }
            }
            else if (ns) {
                object.each(listeners, each);
            }
        }
        else {
            // 清空
            instance.listeners = {};
            // 在开发阶段进行警告，比如传了 type 进来，type 是个空值
            // 但你不知道它是空值
            if (process.env.NODE_ENV === 'development') {
                if (arguments.length > 0) {
                    logger.warn(`emitter.off(type) is invoked, but the "type" argument is undefined or null.`);
                }
            }
        }
    }
    /**
     * 是否已监听某个事件
     *
     * @param type
     * @param listener
     */
    has(type, listener) {
        let instance = this, { listeners } = instance, { name, ns } = parseNamespace(instance.ns, type), result = env.TRUE, matchListener = createMatchListener(listener), each = function (list) {
            array.each(list, function (options) {
                if (matchListener(options) && matchNamespace(ns, options)) {
                    return result = env.FALSE;
                }
            });
            return result;
        };
        if (name) {
            if (listeners[name]) {
                each(listeners[name]);
            }
        }
        else if (ns) {
            object.each(listeners, each);
        }
        return !result;
    }
}
/**
 * 把事件类型解析成命名空间格式
 *
 * @param ns
 * @param type
 */
function parseNamespace(ns, type) {
    const result = {
        name: type,
        ns: env.EMPTY_STRING,
    };
    if (ns) {
        const index = string.indexOf(type, '.');
        if (index >= 0) {
            result.name = string.slice(type, 0, index);
            result.ns = string.slice(type, index + 1);
        }
    }
    return result;
}
function matchTrue(options) {
    return env.TRUE;
}
/**
 * 外部会传入 Function 或 EmitterOptions 或 空
 *
 * 这里根据传入值的不同类型，创建不同的判断函数
 *
 * 如果传入的是 EmitterOptions，则全等判断
 *
 * 如果传入的是 Function，则判断函数是否全等
 *
 * 如果传入的是空，则直接返回 true
 *
 * @param listener
 */
function createMatchListener(listener) {
    return is.func(listener)
        ? function (options) {
            return listener === options.fn;
        }
        : matchTrue;
}
/**
 * 判断 options 是否能匹配命名空间
 *
 * 如果 namespace 和 options.ns 都不为空，则需完全匹配
 *
 * 如果他们两个其中任何一个为空，则不判断命名空间
 *
 * @param namespace
 * @param options
 */
function matchNamespace(namespace, options) {
    const { ns } = options;
    return ns && namespace
        ? ns === namespace
        : env.TRUE;
}
