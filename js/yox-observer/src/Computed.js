import execute from '../../yox-common/src/function/execute';
import * as is from '../../yox-common/src/util/is';
import * as env from '../../yox-common/src/util/env';
import * as array from '../../yox-common/src/util/array';
import * as object from '../../yox-common/src/util/object';
/**
 * 计算属性
 *
 * 可配置 cache、deps、get、set 等
 */
export default class Computed {
    /**
     * 对外的构造器，把用户配置的计算属性对象转换成内部对象
     *
     * @param keypath
     * @param observer
     * @param options
     */
    static build(keypath, observer, options) {
        let cache = env.TRUE, sync = env.TRUE, deps = [], getter, setter;
        if (is.func(options)) {
            getter = options;
        }
        else if (is.object(options)) {
            if (is.boolean(options.cache)) {
                cache = options.cache;
            }
            if (is.boolean(options.sync)) {
                sync = options.sync;
            }
            // 因为可能会修改 deps，所以这里创建一个新的 deps，避免影响外部传入的 deps
            if (is.array(options.deps)) {
                deps = object.copy(options.deps);
            }
            if (is.func(options.get)) {
                getter = options.get;
            }
            if (is.func(options.set)) {
                setter = options.set;
            }
        }
        if (getter) {
            return new Computed(keypath, sync, cache, deps, observer, getter, setter);
        }
    }
    constructor(keypath, sync, cache, deps, observer, getter, setter) {
        const instance = this;
        instance.keypath = keypath;
        instance.cache = cache;
        instance.deps = deps;
        instance.context = observer.context;
        instance.observer = observer;
        instance.getter = getter;
        instance.setter = setter;
        instance.unique = {};
        instance.watcher = function ($0, $1, $2) {
            // 计算属性的依赖变了会走进这里
            const oldValue = instance.value, newValue = instance.get(env.TRUE);
            if (newValue !== oldValue) {
                observer.diff(keypath, newValue, oldValue);
            }
        };
        instance.watcherOptions = {
            sync,
            watcher: instance.watcher
        };
        if (instance.fixed = !array.falsy(deps)) {
            array.each(deps, function (dep) {
                observer.watch(dep, instance.watcherOptions);
            });
        }
    }
    /**
     * 读取计算属性的值
     *
     * @param force 是否强制刷新缓存
     */
    get(force) {
        const instance = this, { getter, context } = instance;
        // 禁用缓存
        if (!instance.cache) {
            instance.value = execute(getter, context);
        }
        // 减少取值频率，尤其是处理复杂的计算规则
        else if (force || !object.has(instance, env.RAW_VALUE)) {
            // 如果写死了依赖，则不需要收集依赖
            if (instance.fixed) {
                instance.value = execute(getter, context);
            }
            else {
                // 清空上次收集的依赖
                instance.unbind();
                // 开始收集新的依赖
                const lastComputed = Computed.current;
                Computed.current = instance;
                instance.value = execute(getter, context);
                // 绑定新的依赖
                instance.bind();
                Computed.current = lastComputed;
            }
        }
        return instance.value;
    }
    set(value) {
        const { setter, context } = this;
        if (setter) {
            setter.call(context, value);
        }
    }
    /**
     * 添加依赖
     *
     * 这里只是为了保证依赖唯一，最后由 bind() 实现绑定
     *
     * @param dep
     */
    add(dep) {
        this.unique[dep] = env.TRUE;
    }
    /**
     * 绑定依赖
     */
    bind() {
        const { unique, deps, observer, watcherOptions } = this;
        object.each(unique, function (_, dep) {
            array.push(deps, dep);
            observer.watch(dep, watcherOptions);
        });
        // 用完重置
        // 方便下次收集依赖
        this.unique = {};
    }
    /**
     * 解绑依赖
     */
    unbind() {
        const { deps, observer, watcher } = this;
        array.each(deps, function (dep) {
            observer.unwatch(dep, watcher);
        }, env.TRUE);
        deps.length = 0;
    }
}
