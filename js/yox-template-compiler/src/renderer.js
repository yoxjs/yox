import * as config from '../../yox-config/src/config';
import isDef from '../../yox-common/src/function/isDef';
import isUndef from '../../yox-common/src/function/isUndef';
import execute from '../../yox-common/src/function/execute';
import toString from '../../yox-common/src/function/toString';
import * as is from '../../yox-common/src/util/is';
import * as env from '../../yox-common/src/util/env';
import * as array from '../../yox-common/src/util/array';
import * as object from '../../yox-common/src/util/object';
import * as logger from '../../yox-common/src/util/logger';
import * as keypathUtil from '../../yox-common/src/util/keypath';
import globalHolder from '../../yox-common/src/util/holder';
import CustomEvent from '../../yox-common/src/util/CustomEvent';
function setPair(target, name, key, value) {
    const data = target[name] || (target[name] = {});
    data[key] = value;
}
const KEY_DIRECTIVES = 'directives';
export function render(context, template, filters, partials, directives, transitions) {
    let $scope = { $keypath: env.EMPTY_STRING }, $stack = [$scope], $vnode, vnodeStack = [], localPartials = {}, findValue = function (stack, index, key, lookup, depIgnore, defaultKeypath) {
        let scope = stack[index], keypath = keypathUtil.join(scope.$keypath, key), value = stack, holder = globalHolder;
        // 如果最后还是取不到值，用回最初的 keypath
        if (isUndef(defaultKeypath)) {
            defaultKeypath = keypath;
        }
        // 如果取的是 scope 上直接有的数据，如 $keypath
        if (isDef(scope[key])) {
            value = scope[key];
        }
        // 如果取的是数组项，则要更进一步
        else if (isDef(scope.$item)) {
            scope = scope.$item;
            // 到这里 scope 可能为空
            // 比如 new Array(10) 然后遍历这个数组，每一项肯定是空
            // 取 this
            if (key === env.EMPTY_STRING) {
                value = scope;
            }
            // 取 this.xx
            else if (scope != env.NULL && isDef(scope[key])) {
                value = scope[key];
            }
        }
        if (value === stack) {
            // 正常取数据
            value = context.get(keypath, stack, depIgnore);
            if (value === stack) {
                if (lookup && index > 0) {
                    if (process.env.NODE_ENV === 'development') {
                        logger.debug(`"${keypath}" can't be found in the current context, start looking up.`);
                    }
                    return findValue(stack, index - 1, key, lookup, depIgnore, defaultKeypath);
                }
                // 到头了，最后尝试过滤器
                const result = object.get(filters, key);
                if (result) {
                    holder = result;
                    holder.keypath = key;
                }
                else {
                    holder.value = env.UNDEFINED;
                    holder.keypath = defaultKeypath;
                }
                return holder;
            }
        }
        holder.value = value;
        holder.keypath = keypath;
        return holder;
    }, createEventListener = function (type) {
        return function (event, data) {
            // 事件名称相同的情况，只可能是监听 DOM 事件，比如写一个 Button 组件
            // <button on-click="click"> 纯粹的封装了一个原生 click 事件
            if (type !== event.type) {
                event = new CustomEvent(type, event);
            }
            context.fire(event, data);
        };
    }, createMethodListener = function (name, args, stack) {
        return function (event, data) {
            const method = context[name];
            if (event instanceof CustomEvent) {
                let result = env.UNDEFINED;
                if (args) {
                    const scope = array.last(stack);
                    if (scope) {
                        scope.$event = event;
                        scope.$data = data;
                        result = execute(method, context, args(stack));
                        scope.$event =
                            scope.$data = env.UNDEFINED;
                    }
                }
                else {
                    result = execute(method, context, data ? [event, data] : event);
                }
                return result;
            }
            else {
                execute(method, context, args ? args(stack) : env.UNDEFINED);
            }
        };
    }, createGetter = function (getter, stack) {
        return function () {
            return getter(stack);
        };
    }, renderTextVnode = function (text) {
        const vnodeList = array.last(vnodeStack);
        if (vnodeList) {
            const lastVnode = array.last(vnodeList);
            if (lastVnode && lastVnode.isText) {
                lastVnode.text += text;
            }
            else {
                const textVnode = {
                    isText: env.TRUE,
                    text,
                    context,
                    keypath: $scope.$keypath,
                };
                array.push(vnodeList, textVnode);
            }
        }
    }, renderAttributeVnode = function (name, value) {
        if ($vnode.isComponent) {
            setPair($vnode, 'props', name, value);
        }
        else {
            setPair($vnode, 'nativeAttrs', name, { name, value });
        }
    }, renderPropertyVnode = function (name, hint, value) {
        setPair($vnode, 'nativeProps', name, { name, value, hint });
    }, renderLazyVnode = function (name, value) {
        setPair($vnode, 'lazy', name, value);
    }, renderTransitionVnode = function (name) {
        $vnode.transition = transitions[name];
        if (process.env.NODE_ENV === 'development') {
            if (!$vnode.transition) {
                logger.fatal(`Transition "${name}" can't be found.`);
            }
        }
    }, renderBindingVnode = function (name, holder, hint) {
        const key = keypathUtil.join(config.DIRECTIVE_BINDING, name);
        setPair($vnode, KEY_DIRECTIVES, key, {
            ns: config.DIRECTIVE_BINDING,
            name,
            key,
            hooks: directives[config.DIRECTIVE_BINDING],
            binding: holder.keypath,
            hint,
        });
        return holder.value;
    }, renderModelVnode = function (holder) {
        setPair($vnode, KEY_DIRECTIVES, config.DIRECTIVE_MODEL, {
            ns: config.DIRECTIVE_MODEL,
            name: env.EMPTY_STRING,
            key: config.DIRECTIVE_MODEL,
            value: holder.value,
            binding: holder.keypath,
            hooks: directives[config.DIRECTIVE_MODEL]
        });
    }, renderEventMethodVnode = function (name, key, value, method, args) {
        setPair($vnode, KEY_DIRECTIVES, key, {
            ns: config.DIRECTIVE_EVENT,
            name,
            key,
            value,
            hooks: directives[config.DIRECTIVE_EVENT],
            handler: createMethodListener(method, args, $stack)
        });
    }, renderEventNameVnode = function (name, key, value, event) {
        setPair($vnode, KEY_DIRECTIVES, key, {
            ns: config.DIRECTIVE_EVENT,
            name,
            key,
            value,
            hooks: directives[config.DIRECTIVE_EVENT],
            handler: createEventListener(event)
        });
    }, renderDirectiveVnode = function (name, key, value, method, args, getter) {
        const hooks = directives[name];
        if (process.env.NODE_ENV === 'development') {
            if (!hooks) {
                logger.fatal(`Directive ${name} can't be found.`);
            }
        }
        setPair($vnode, KEY_DIRECTIVES, key, {
            ns: config.DIRECTIVE_CUSTOM,
            name,
            key,
            value,
            hooks,
            getter: getter ? createGetter(getter, $stack) : env.UNDEFINED,
            handler: method ? createMethodListener(method, args, $stack) : env.UNDEFINED,
        });
    }, renderSpreadVnode = function (holder) {
        const { value, keypath } = holder;
        // 如果为 null 或 undefined，则不需要 warn
        if (value != env.NULL) {
            // 数组也算一种对象，要排除掉
            if (is.object(value) && !is.array(value)) {
                object.each(value, function (value, key) {
                    setPair($vnode, 'props', key, value);
                });
                if (keypath) {
                    const key = keypathUtil.join(config.DIRECTIVE_BINDING, keypath);
                    setPair($vnode, KEY_DIRECTIVES, key, {
                        ns: config.DIRECTIVE_BINDING,
                        name: env.EMPTY_STRING,
                        key,
                        hooks: directives[config.DIRECTIVE_BINDING],
                        binding: keypathUtil.join(keypath, env.RAW_WILDCARD),
                    });
                }
            }
        }
    }, renderElementVnode = function (vnode, tag, attrs, childs, slots) {
        if (tag) {
            const componentName = context.get(tag);
            if (process.env.NODE_ENV === 'development') {
                if (!componentName) {
                    logger.warn(`Dynamic component "${tag}" can't be found.`);
                }
            }
            vnode.tag = componentName;
        }
        if (attrs) {
            $vnode = vnode;
            attrs();
            $vnode = env.UNDEFINED;
        }
        // childs 和 slots 不可能同时存在
        if (childs) {
            vnodeStack.push(vnode.children = []);
            childs();
            array.pop(vnodeStack);
        }
        else if (slots) {
            const renderSlots = {};
            object.each(slots, function (slot, name) {
                vnodeStack.push([]);
                slot();
                const vnodes = array.pop(vnodeStack);
                renderSlots[name] = vnodes.length ? vnodes : env.UNDEFINED;
            });
            vnode.slots = renderSlots;
        }
        vnode.context = context;
        vnode.keypath = $scope.$keypath;
        const vnodeList = array.last(vnodeStack);
        if (vnodeList) {
            array.push(vnodeList, vnode);
        }
        return vnode;
    }, renderExpressionIdentifier = function (name, lookup, offset, holder, depIgnore, stack) {
        const myStack = stack || $stack, result = findValue(myStack, myStack.length - ((offset || 0) + 1), name, lookup, depIgnore);
        return holder ? result : result.value;
    }, renderExpressionMemberKeypath = function (identifier, runtimeKeypath) {
        array.unshift(runtimeKeypath, identifier);
        return array.join(runtimeKeypath, keypathUtil.separator);
    }, renderExpressionMemberLiteral = function (value, staticKeypath, runtimeKeypath, holder) {
        if (isDef(runtimeKeypath)) {
            staticKeypath = array.join(runtimeKeypath, keypathUtil.separator);
        }
        const match = object.get(value, staticKeypath);
        globalHolder.keypath = env.UNDEFINED;
        globalHolder.value = match ? match.value : env.UNDEFINED;
        return holder ? globalHolder : globalHolder.value;
    }, renderExpressionCall = function (fn, args, holder) {
        globalHolder.keypath = env.UNDEFINED;
        // 当 holder 为 true, args 为空时，args 会传入 false
        globalHolder.value = execute(fn, context, args || env.UNDEFINED);
        return holder ? globalHolder : globalHolder.value;
    }, 
    // <slot name="xx"/>
    renderSlot = function (name, defaultRender) {
        const vnodeList = array.last(vnodeStack), vnodes = context.get(name);
        if (vnodeList) {
            if (vnodes) {
                array.each(vnodes, function (vnode) {
                    array.push(vnodeList, vnode);
                    vnode.slot = name;
                    vnode.parent = context;
                });
            }
            else if (defaultRender) {
                defaultRender();
            }
        }
    }, 
    // {{#partial name}}
    //   xx
    // {{/partial}}
    renderPartial = function (name, render) {
        localPartials[name] = render;
    }, 
    // {{> name}}
    renderImport = function (name) {
        if (localPartials[name]) {
            localPartials[name]();
        }
        else {
            const partial = partials[name];
            if (partial) {
                partial(renderExpressionIdentifier, renderExpressionMemberKeypath, renderExpressionMemberLiteral, renderExpressionCall, renderTextVnode, renderAttributeVnode, renderPropertyVnode, renderLazyVnode, renderTransitionVnode, renderBindingVnode, renderModelVnode, renderEventMethodVnode, renderEventNameVnode, renderDirectiveVnode, renderSpreadVnode, renderElementVnode, renderSlot, renderPartial, renderImport, renderEach, toString);
            }
            else if (process.env.NODE_ENV === 'development') {
                logger.fatal(`Partial "${name}" can't be found.`);
            }
        }
    }, eachHandler = function (generate, item, key, keypath, index, length) {
        const lastScope = $scope, lastStack = $stack;
        // each 会改变 keypath
        $scope = { $keypath: keypath };
        $stack = lastStack.concat($scope);
        // 避免模板里频繁读取 list.length
        if (isDef(length)) {
            $scope.$length = length;
        }
        // 业务层是否写了 expr:index
        if (index) {
            $scope[index] = key;
        }
        // 无法通过 context.get($keypath + key) 读取到数据的场景
        // 必须把 item 写到 scope
        if (!keypath) {
            $scope.$item = item;
        }
        generate();
        $scope = lastScope;
        $stack = lastStack;
    }, renderEach = function (generate, from, to, equal, index) {
        const fromValue = from.value, fromKeypath = from.keypath;
        if (to) {
            let toValue = to.value, count = 0;
            if (fromValue < toValue) {
                if (equal) {
                    for (let i = fromValue; i <= toValue; i++) {
                        eachHandler(generate, i, count++, env.EMPTY_STRING, index);
                    }
                }
                else {
                    for (let i = fromValue; i < toValue; i++) {
                        eachHandler(generate, i, count++, env.EMPTY_STRING, index);
                    }
                }
            }
            else {
                if (equal) {
                    for (let i = fromValue; i >= toValue; i--) {
                        eachHandler(generate, i, count++, env.EMPTY_STRING, index);
                    }
                }
                else {
                    for (let i = fromValue; i > toValue; i--) {
                        eachHandler(generate, i, count++, env.EMPTY_STRING, index);
                    }
                }
            }
        }
        else {
            if (is.array(fromValue)) {
                for (let i = 0, length = fromValue.length; i < length; i++) {
                    eachHandler(generate, fromValue[i], i, fromKeypath
                        ? keypathUtil.join(fromKeypath, env.EMPTY_STRING + i)
                        : env.EMPTY_STRING, index, length);
                }
            }
            else if (is.object(fromValue)) {
                for (let key in fromValue) {
                    eachHandler(generate, fromValue[key], key, fromKeypath
                        ? keypathUtil.join(fromKeypath, key)
                        : env.EMPTY_STRING, index);
                }
            }
        }
    };
    return template(renderExpressionIdentifier, renderExpressionMemberKeypath, renderExpressionMemberLiteral, renderExpressionCall, renderTextVnode, renderAttributeVnode, renderPropertyVnode, renderLazyVnode, renderTransitionVnode, renderBindingVnode, renderModelVnode, renderEventMethodVnode, renderEventNameVnode, renderDirectiveVnode, renderSpreadVnode, renderElementVnode, renderSlot, renderPartial, renderImport, renderEach, toString);
}
