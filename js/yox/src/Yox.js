import isDef from '../../yox-common/src/function/isDef';
import isUndef from '../../yox-common/src/function/isUndef';
import execute from '../../yox-common/src/function/execute';
import CustomEvent from '../../yox-common/src/util/CustomEvent';
import Emitter from '../../yox-common/src/util/Emitter';
import NextTask from '../../yox-common/src/util/NextTask';
import * as is from '../../yox-common/src/util/is';
import * as env from '../../yox-common/src/util/env';
import * as array from '../../yox-common/src/util/array';
import * as string from '../../yox-common/src/util/string';
import * as object from '../../yox-common/src/util/object';
import * as logger from '../../yox-common/src/util/logger';
import * as config from '../../yox-config/src/config';
import * as snabbdom from '../../yox-snabbdom/src/snabbdom';
import * as templateCompiler from '../../yox-template-compiler/src/compiler';
import * as templateGenerator from '../../yox-template-compiler/src/generator';
import * as templateRender from '../../yox-template-compiler/src/renderer';
import * as domApi from '../../yox-dom/src/dom';
import Observer from '../../yox-observer/src/Observer';
import * as event from './directive/event';
import * as model from './directive/model';
import * as binding from './directive/binding';
import hasSlot from './filter/hasSlot';
const globalDirectives = {}, globalTransitions = {}, globalComponents = {}, globalPartials = {}, globalFilters = {}, compileCache = {}, LOADER_QUEUE = '$queue', TEMPLATE_COMPUTED = '$' + env.RAW_TEMPLATE, selectorPattern = /^[#.][-\w+]+$/;
export default class Yox {
    constructor(options) {
        const instance = this, $options = options || env.EMPTY_OBJECT;
        // 一进来就执行 before create
        execute($options[config.HOOK_BEFORE_CREATE], instance, $options);
        execute(Yox[config.HOOK_BEFORE_CREATE], env.UNDEFINED, $options);
        instance.$options = $options;
        let { data, props, vnode, propTypes, computed, events, methods, watchers, extensions, } = $options;
        if (extensions) {
            object.extend(instance, extensions);
        }
        // 数据源，默认值仅在创建组件时启用
        const source = props ? object.copy(props) : {};
        if (propTypes) {
            object.each(propTypes, function (rule, key) {
                let value = source[key];
                if (process.env.NODE_ENV === 'development') {
                    checkProp(key, value, rule);
                }
                if (isUndef(value)) {
                    value = rule.value;
                    if (isDef(value)) {
                        source[key] = rule.type === env.RAW_FUNCTION
                            ? value
                            : is.func(value)
                                ? value()
                                : value;
                    }
                }
            });
        }
        // 先放 props
        // 当 data 是函数时，可以通过 this.get() 获取到外部数据
        const observer = instance.$observer = new Observer(source, instance);
        if (computed) {
            object.each(computed, function (options, keypath) {
                observer.addComputed(keypath, options);
            });
        }
        // 后放 data
        if (process.env.NODE_ENV === 'development') {
            if (vnode && is.object(data)) {
                logger.warn(`child component's data should be a function which return an object.`);
            }
        }
        const extend = is.func(data) ? execute(data, instance, options) : data;
        if (is.object(extend)) {
            object.each(extend, function (value, key) {
                if (process.env.NODE_ENV === 'development') {
                    if (object.has(source, key)) {
                        logger.warn(`"${key}" is already defined as a prop. Use prop default value instead.`);
                    }
                }
                source[key] = value;
            });
        }
        if (methods) {
            object.each(methods, function (method, name) {
                if (process.env.NODE_ENV === 'development') {
                    if (instance[name]) {
                        logger.fatal(`method "${name}" is conflicted with built-in methods.`);
                    }
                }
                instance[name] = method;
            });
        }
        // 监听各种事件
        // 支持命名空间
        instance.$emitter = new Emitter(env.TRUE);
        if (events) {
            instance.on(events);
        }
        if (process.env.NODE_ENV !== 'pure') {
            let placeholder = env.UNDEFINED, { el, root, model, parent, context, replace, template, transitions, components, directives, partials, filters, slots, } = $options;
            if (model) {
                instance.$model = model;
            }
            // 把 slots 放进数据里，方便 get
            if (slots) {
                object.extend(source, slots);
            }
            // 检查 template
            if (is.string(template)) {
                // 传了选择器，则取对应元素的 html
                if (selectorPattern.test(template)) {
                    placeholder = domApi.find(template);
                    if (placeholder) {
                        template = domApi.html(placeholder);
                        placeholder = env.UNDEFINED;
                    }
                    else if (process.env.NODE_ENV === 'development') {
                        logger.fatal(`selector "${template}" can't match an element.`);
                    }
                }
            }
            else {
                template = env.UNDEFINED;
            }
            // 检查 el
            if (el) {
                if (is.string(el)) {
                    const selector = el;
                    if (selectorPattern.test(selector)) {
                        placeholder = domApi.find(selector);
                        if (process.env.NODE_ENV === 'development') {
                            if (!placeholder) {
                                logger.fatal(`selector "${selector}" can't match an element.`);
                            }
                        }
                    }
                    else if (process.env.NODE_ENV === 'development') {
                        logger.fatal(`"el" option should be a selector.`);
                    }
                }
                else {
                    placeholder = el;
                }
                if (!replace) {
                    domApi.append(placeholder, placeholder = domApi.createComment(env.EMPTY_STRING));
                }
            }
            // 根组件
            if (root) {
                instance.$root = root;
            }
            // 当前组件的直接父组件
            if (parent) {
                instance.$parent = parent;
            }
            // 当前组件是被哪个组件渲染出来的
            // 因为有 slot 机制，$context 不一定等于 $parent
            if (context) {
                instance.$context = context;
            }
            setFlexibleOptions(instance, env.RAW_TRANSITION, transitions);
            setFlexibleOptions(instance, env.RAW_COMPONENT, components);
            setFlexibleOptions(instance, env.RAW_DIRECTIVE, directives);
            setFlexibleOptions(instance, env.RAW_PARTIAL, partials);
            setFlexibleOptions(instance, env.RAW_FILTER, filters);
            // 当存在模板和计算属性时
            // 因为这里把模板当做一种特殊的计算属性
            // 因此模板这个计算属性的优先级应该最高
            if (template) {
                // 拷贝一份，避免影响外部定义的 watchers
                const newWatchers = watchers
                    ? object.copy(watchers)
                    : {};
                newWatchers[TEMPLATE_COMPUTED] = {
                    // 模板一旦变化，立即刷新
                    sync: env.TRUE,
                    watcher: function (vnode) {
                        instance.update(vnode, instance.$vnode);
                    }
                };
                // 当模板的依赖变了，则重新创建 virtual dom
                observer.addComputed(TEMPLATE_COMPUTED, {
                    // 当模板依赖变化时，异步通知模板更新
                    sync: env.FALSE,
                    get: function () {
                        return instance.render();
                    }
                });
                afterCreateHook(instance, newWatchers);
                // 编译模板
                // 在开发阶段，template 是原始的 html 模板
                // 在产品阶段，template 是编译后且经过 stringify 的字符串
                // 当然，这个需要外部自己控制传入的 template 是什么
                // Yox.compile 会自动判断 template 是否经过编译
                instance.$template = Yox.compile(template);
                if (!vnode) {
                    if (process.env.NODE_ENV === 'development') {
                        if (!placeholder) {
                            logger.fatal('"el" option is required for root component.');
                        }
                    }
                    vnode = snabbdom.create(domApi, placeholder, instance, env.EMPTY_STRING);
                }
                instance.update(instance.get(TEMPLATE_COMPUTED), vnode);
                return;
            }
            else if (process.env.NODE_ENV === 'development') {
                if (placeholder || vnode) {
                    logger.fatal('"template" option is required.');
                }
            }
        }
        afterCreateHook(instance, watchers);
    }
    /**
     * 安装插件
     *
     * 插件必须暴露 install 方法
     */
    static use(plugin) {
        plugin.install(Yox);
    }
    /**
     * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
     */
    static nextTick(task, context) {
        NextTask.shared().append(task, context);
    }
    /**
     * 编译模板，暴露出来是为了打包阶段的模板预编译
     */
    static compile(template, stringify) {
        if (process.env.NODE_ENV !== 'pure') {
            if (process.env.NODE_ENV !== 'runtime') {
                if (!templateGenerator.hasGenerated(template)) {
                    // 未编译，常出现在开发阶段
                    if (!compileCache[template]) {
                        const nodes = templateCompiler.compile(template);
                        if (process.env.NODE_ENV === 'development') {
                            if (nodes.length !== 1) {
                                logger.fatal(`"template" should have just one root element.`);
                            }
                        }
                        compileCache[template] = templateGenerator.generate(nodes[0]);
                    }
                    template = compileCache[template];
                    if (stringify) {
                        return template;
                    }
                }
            }
            return new Function(`return ${template}`)();
        }
        else {
            return env.EMPTY_STRING;
        }
    }
    static directive(name, directive) {
        if (process.env.NODE_ENV !== 'pure') {
            if (is.string(name) && !directive) {
                return getResource(globalDirectives, name);
            }
            setResource(globalDirectives, name, directive);
        }
    }
    static transition(name, transition) {
        if (process.env.NODE_ENV !== 'pure') {
            if (is.string(name) && !transition) {
                return getResource(globalTransitions, name);
            }
            setResource(globalTransitions, name, transition);
        }
    }
    static component(name, component) {
        if (process.env.NODE_ENV !== 'pure') {
            if (is.string(name) && !component) {
                return getResource(globalComponents, name);
            }
            setResource(globalComponents, name, component);
        }
    }
    static partial(name, partial) {
        if (process.env.NODE_ENV !== 'pure') {
            if (is.string(name) && !partial) {
                return getResource(globalPartials, name);
            }
            setResource(globalPartials, name, partial, Yox.compile);
        }
    }
    static filter(name, filter) {
        if (process.env.NODE_ENV !== 'pure') {
            if (is.string(name) && !filter) {
                return getResource(globalFilters, name);
            }
            setResource(globalFilters, name, filter);
        }
    }
    /**
     * 添加计算属性
     */
    addComputed(keypath, computed) {
        return this.$observer.addComputed(keypath, computed);
    }
    /**
     * 删除计算属性
     */
    removeComputed(keypath) {
        this.$observer.removeComputed(keypath);
    }
    /**
     * 取值
     */
    get(keypath, defaultValue, depIgnore) {
        return this.$observer.get(keypath, defaultValue, depIgnore);
    }
    /**
     * 设值
     */
    set(keypath, value) {
        // 组件经常有各种异步改值，为了避免组件销毁后依然调用 set
        // 这里判断一下，至于其他方法的异步调用就算了，业务自己控制吧
        const { $observer } = this;
        if ($observer) {
            $observer.set(keypath, value);
        }
    }
    /**
     * 监听事件
     */
    on(type, listener) {
        return addEvents(this, type, listener);
    }
    /**
     * 监听一次事件
     */
    once(type, listener) {
        return addEvents(this, type, listener, env.TRUE);
    }
    /**
     * 取消监听事件
     */
    off(type, listener) {
        this.$emitter.off(type, listener);
        return this;
    }
    /**
     * 发射事件
     */
    fire(type, data, downward) {
        // 外部为了使用方便，fire(type) 或 fire(type, data) 就行了
        // 内部为了保持格式统一
        // 需要转成 Event，这样还能知道 target 是哪个组件
        let instance = this, event = type instanceof CustomEvent ? type : new CustomEvent(type), args = [event], isComplete;
        // 告诉外部是谁发出的事件
        if (!event.target) {
            event.target = instance;
        }
        // 比如 fire('name', true) 直接向下发事件
        if (is.object(data)) {
            array.push(args, data);
        }
        else if (data === env.TRUE) {
            downward = env.TRUE;
        }
        isComplete = instance.$emitter.fire(event.type, args);
        if (isComplete) {
            const { $parent, $children } = instance;
            if (downward) {
                if ($children) {
                    event.phase = CustomEvent.PHASE_DOWNWARD;
                    array.each($children, function (child) {
                        return isComplete = child.fire(event, data, env.TRUE);
                    });
                }
            }
            else if ($parent) {
                event.phase = CustomEvent.PHASE_UPWARD;
                isComplete = $parent.fire(event, data);
            }
        }
        return isComplete;
    }
    /**
     * 监听数据变化
     */
    watch(keypath, watcher, immediate) {
        this.$observer.watch(keypath, watcher, immediate);
        return this;
    }
    /**
     * 取消监听数据变化
     */
    unwatch(keypath, watcher) {
        this.$observer.unwatch(keypath, watcher);
        return this;
    }
    /**
     * 加载组件，组件可以是同步或异步，最后会调用 callback
     *
     * @param name 组件名称
     * @param callback 组件加载成功后的回调
     */
    loadComponent(name, callback) {
        if (process.env.NODE_ENV !== 'pure') {
            if (!loadComponent(this.$components, name, callback)) {
                const hasComponent = loadComponent(globalComponents, name, callback);
                if (process.env.NODE_ENV === 'development') {
                    if (!hasComponent) {
                        logger.error(`Component [${name}] is not found.`);
                    }
                }
            }
        }
    }
    /**
     * 创建子组件
     *
     * @param options 组件配置
     * @param vnode 虚拟节点
     */
    createComponent(options, vnode) {
        if (process.env.NODE_ENV !== 'pure') {
            const instance = this;
            options = object.copy(options);
            options.root = instance.$root || instance;
            options.parent = instance;
            options.context = vnode.context;
            options.vnode = vnode;
            options.replace = env.TRUE;
            let { props, slots, directives } = vnode, model = directives && directives[config.DIRECTIVE_MODEL];
            if (model) {
                if (!props) {
                    props = {};
                }
                const key = options.model || config.MODEL_PROP_DEFAULT;
                props[key] = model.value;
                options.model = key;
            }
            if (props) {
                options.props = props;
            }
            if (slots) {
                options.slots = slots;
            }
            const child = new Yox(options);
            array.push(instance.$children || (instance.$children = []), child);
            const node = child.$el;
            if (node) {
                vnode.node = node;
            }
            else if (process.env.NODE_ENV === 'development') {
                logger.fatal(`The root element of [Component ${vnode.tag}] is not found.`);
            }
            return child;
        }
        else {
            return this;
        }
    }
    directive(name, directive) {
        if (process.env.NODE_ENV !== 'pure') {
            const instance = this, { $directives } = instance;
            if (is.string(name) && !directive) {
                return getResource($directives, name, Yox.directive);
            }
            setResource($directives || (instance.$directives = {}), name, directive);
        }
    }
    transition(name, transition) {
        if (process.env.NODE_ENV !== 'pure') {
            const instance = this, { $transitions } = instance;
            if (is.string(name) && !transition) {
                return getResource($transitions, name, Yox.transition);
            }
            setResource($transitions || (instance.$transitions = {}), name, transition);
        }
    }
    component(name, component) {
        if (process.env.NODE_ENV !== 'pure') {
            const instance = this, { $components } = instance;
            if (is.string(name) && !component) {
                return getResource($components, name, Yox.component);
            }
            setResource($components || (instance.$components = {}), name, component);
        }
    }
    partial(name, partial) {
        if (process.env.NODE_ENV !== 'pure') {
            const instance = this, { $partials } = instance;
            if (is.string(name) && !partial) {
                return getResource($partials, name, Yox.partial);
            }
            setResource($partials || (instance.$partials = {}), name, partial, Yox.compile);
        }
    }
    filter(name, filter) {
        if (process.env.NODE_ENV !== 'pure') {
            const instance = this, { $filters } = instance;
            if (is.string(name) && !filter) {
                return getResource($filters, name, Yox.filter);
            }
            setResource($filters || (instance.$filters = {}), name, filter);
        }
    }
    /**
     * 对于某些特殊场景，修改了数据，但是模板的依赖中并没有这一项
     * 而你非常确定需要更新模板，强制刷新正是你需要的
     */
    forceUpdate(data) {
        if (process.env.NODE_ENV !== 'pure') {
            const instance = this, { $vnode, $observer } = instance, { computed } = $observer;
            if ($vnode && computed) {
                const template = computed[TEMPLATE_COMPUTED], oldValue = template.get();
                if (data) {
                    instance.set(data);
                }
                // 当前可能正在进行下一轮更新
                $observer.nextTask.run();
                // 没有更新模板，强制刷新
                if (!data && oldValue === template.get()) {
                    instance.update(template.get(env.TRUE), $vnode);
                }
            }
        }
    }
    /**
     * 把模板抽象语法树渲染成 virtual dom
     */
    render() {
        if (process.env.NODE_ENV !== 'pure') {
            const instance = this;
            return templateRender.render(instance, instance.$template, object.merge(instance.$filters, globalFilters), object.merge(instance.$partials, globalPartials), object.merge(instance.$directives, globalDirectives), object.merge(instance.$transitions, globalTransitions));
        }
    }
    /**
     * 更新 virtual dom
     *
     * @param vnode
     * @param oldVnode
     */
    update(vnode, oldVnode) {
        if (process.env.NODE_ENV !== 'pure') {
            let instance = this, { $vnode, $options } = instance, afterHook;
            // 每次渲染重置 refs
            // 在渲染过程中收集最新的 ref
            // 这样可避免更新时，新的 ref，在前面创建，老的 ref 却在后面删除的情况
            instance.$refs = {};
            if ($vnode) {
                execute($options[config.HOOK_BEFORE_UPDATE], instance);
                execute(Yox[config.HOOK_BEFORE_UPDATE], env.UNDEFINED, instance);
                snabbdom.patch(domApi, vnode, oldVnode);
                afterHook = config.HOOK_AFTER_UPDATE;
            }
            else {
                execute($options[config.HOOK_BEFORE_MOUNT], instance);
                execute(Yox[config.HOOK_BEFORE_MOUNT], env.UNDEFINED, instance);
                snabbdom.patch(domApi, vnode, oldVnode);
                instance.$el = vnode.node;
                afterHook = config.HOOK_AFTER_MOUNT;
            }
            instance.$vnode = vnode;
            // 跟 nextTask 保持一个节奏
            // 这样可以预留一些优化的余地
            Yox.nextTick(function () {
                if (instance.$vnode) {
                    execute($options[afterHook], instance);
                    execute(Yox[afterHook], env.UNDEFINED, instance);
                }
            });
        }
    }
    /**
     * 校验组件参数
     *
     * @param props
     */
    checkProps(props) {
        if (process.env.NODE_ENV === 'development') {
            const instance = this;
            object.each(props, function (value, key) {
                instance.checkProp(key, value);
            });
        }
    }
    checkProp(key, value) {
        if (process.env.NODE_ENV === 'development') {
            const { propTypes } = this.$options;
            if (propTypes) {
                const rule = propTypes[key];
                if (rule) {
                    checkProp(key, value, rule);
                }
            }
        }
    }
    /**
     * 销毁组件
     */
    destroy() {
        const instance = this, { $parent, $options, $emitter, $observer } = instance;
        execute($options[config.HOOK_BEFORE_DESTROY], instance);
        execute(Yox[config.HOOK_BEFORE_DESTROY], env.UNDEFINED, instance);
        if (process.env.NODE_ENV !== 'pure') {
            const { $vnode } = instance;
            if ($parent && $parent.$children) {
                array.remove($parent.$children, instance);
            }
            if ($vnode) {
                // virtual dom 通过判断 parent.$vnode 知道宿主组件是否正在销毁
                instance.$vnode = env.UNDEFINED;
                snabbdom.destroy(domApi, $vnode, !$parent);
            }
        }
        $emitter.off();
        $observer.destroy();
        execute($options[config.HOOK_AFTER_DESTROY], instance);
        execute(Yox[config.HOOK_AFTER_DESTROY], env.UNDEFINED, instance);
        object.clear(instance);
    }
    /**
     * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
     */
    nextTick(task) {
        this.$observer.nextTask.append(task, this);
    }
    /**
     * 取反 keypath 对应的数据
     *
     * 不管 keypath 对应的数据是什么类型，操作后都是布尔型
     */
    toggle(keypath) {
        return this.$observer.toggle(keypath);
    }
    /**
     * 递增 keypath 对应的数据
     *
     * 注意，最好是整型的加法，如果涉及浮点型，不保证计算正确
     *
     * @param keypath 值必须能转型成数字，如果不能，则默认从 0 开始递增
     * @param step 步进值，默认是 1
     * @param max 可以递增到的最大值，默认不限制
     */
    increase(keypath, step, max) {
        return this.$observer.increase(keypath, step, max);
    }
    /**
     * 递减 keypath 对应的数据
     *
     * 注意，最好是整型的减法，如果涉及浮点型，不保证计算正确
     *
     * @param keypath 值必须能转型成数字，如果不能，则默认从 0 开始递减
     * @param step 步进值，默认是 1
     * @param min 可以递减到的最小值，默认不限制
     */
    decrease(keypath, step, min) {
        return this.$observer.decrease(keypath, step, min);
    }
    /**
     * 在数组指定位置插入元素
     *
     * @param keypath
     * @param item
     * @param index
     */
    insert(keypath, item, index) {
        return this.$observer.insert(keypath, item, index);
    }
    /**
     * 在数组尾部添加元素
     *
     * @param keypath
     * @param item
     */
    append(keypath, item) {
        return this.$observer.append(keypath, item);
    }
    /**
     * 在数组首部添加元素
     *
     * @param keypath
     * @param item
     */
    prepend(keypath, item) {
        return this.$observer.prepend(keypath, item);
    }
    /**
     * 通过索引移除数组中的元素
     *
     * @param keypath
     * @param index
     */
    removeAt(keypath, index) {
        return this.$observer.removeAt(keypath, index);
    }
    /**
     * 直接移除数组中的元素
     *
     * @param keypath
     * @param item
     */
    remove(keypath, item) {
        return this.$observer.remove(keypath, item);
    }
    /**
     * 拷贝任意数据，支持深拷贝
     *
     * @param data
     * @param deep
     */
    copy(data, deep) {
        return this.$observer.copy(data, deep);
    }
}
/**
 * core 版本
 */
Yox.version = process.env.NODE_VERSION;
/**
 * 方便外部共用的通用逻辑，特别是写插件，减少重复代码
 */
Yox.is = is;
Yox.array = array;
Yox.object = object;
Yox.string = string;
Yox.logger = logger;
Yox.Event = CustomEvent;
Yox.Emitter = Emitter;
const toString = Object.prototype.toString;
function matchType(value, type) {
    return type === 'numeric'
        ? is.numeric(value)
        : string.lower(toString.call(value)) === `[object ${type}]`;
}
function checkProp(key, value, rule) {
    // 传了数据
    if (isDef(value)) {
        const type = rule.type;
        // 如果不写 type 或 type 不是 字符串 或 数组
        // 就当做此规则无效，和没写一样
        if (type) {
            // 自定义函数判断是否匹配类型
            // 自己打印警告信息吧
            if (is.func(type)) {
                type(key, value);
            }
            else {
                let matched = env.FALSE;
                // type: 'string'
                if (!string.falsy(type)) {
                    matched = matchType(value, type);
                }
                // type: ['string', 'number']
                else if (!array.falsy(type)) {
                    array.each(type, function (item) {
                        if (matchType(value, item)) {
                            matched = env.TRUE;
                            return env.FALSE;
                        }
                    });
                }
                if (!matched) {
                    logger.warn(`The type of prop "${key}" expected to be "${type}", but is "${value}".`);
                }
            }
        }
        else {
            logger.warn(`The prop "${key}" in propTypes has no type.`);
        }
    }
    // 没传值但此项是必传项
    else if (rule.required) {
        logger.warn(`The prop "${key}" is marked as required, but its value is not found.`);
    }
}
function afterCreateHook(instance, watchers) {
    if (watchers) {
        instance.watch(watchers);
    }
    execute(instance.$options[config.HOOK_AFTER_CREATE], instance);
    execute(Yox[config.HOOK_AFTER_CREATE], env.UNDEFINED, instance);
}
function setFlexibleOptions(instance, key, value) {
    if (is.func(value)) {
        instance[key](execute(value, instance));
    }
    else if (is.object(value)) {
        instance[key](value);
    }
}
function addEvent(instance, type, listener, once) {
    const options = {
        fn: listener,
        ctx: instance
    };
    if (once) {
        options.max = 1;
    }
    instance.$emitter.on(type, options);
}
function addEvents(instance, type, listener, once) {
    if (is.string(type)) {
        addEvent(instance, type, listener, once);
    }
    else {
        object.each(type, function (value, key) {
            addEvent(instance, key, value, once);
        });
    }
    return instance;
}
function loadComponent(data, name, callback) {
    if (data && data[name]) {
        const component = data[name];
        // 注册的是异步加载函数
        if (is.func(component)) {
            let loader = component, queue = loader[LOADER_QUEUE];
            if (queue) {
                array.push(queue, callback);
            }
            else {
                queue = component[LOADER_QUEUE] = [callback];
                loader(function (options) {
                    loader[LOADER_QUEUE] = env.UNDEFINED;
                    data[name] = options;
                    array.each(queue, function (callback) {
                        callback(options);
                    });
                });
            }
        }
        // 不是异步加载函数，直接同步返回
        else {
            callback(component);
        }
        return env.TRUE;
    }
}
function getResource(data, name, lookup) {
    if (data && data[name]) {
        return data[name];
    }
    else if (lookup) {
        return lookup(name);
    }
}
function setResource(data, name, value, formatValue) {
    if (is.string(name)) {
        data[name] = formatValue ? formatValue(value) : value;
    }
    else {
        object.each(name, function (value, key) {
            data[key] = formatValue ? formatValue(value) : value;
        });
    }
}
if (process.env.NODE_ENV !== 'pure') {
    Yox['dom'] = domApi;
    // 全局注册内置指令
    Yox.directive({ event, model, binding });
    // 全局注册内置过滤器
    Yox.filter({ hasSlot });
}
