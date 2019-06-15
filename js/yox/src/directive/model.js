import debounce from '../../../yox-common/src/function/debounce';
import execute from '../../../yox-common/src/function/execute';
import toString from '../../../yox-common/src/function/toString';
import * as is from '../../../yox-common/src/util/is';
import * as env from '../../../yox-common/src/util/env';
import * as array from '../../../yox-common/src/util/array';
import * as domApi from '../../../yox-dom/src/dom';
import * as config from '../../../yox-config/src/config';
function debounceIfNeeded(fn, lazy) {
    // 应用 lazy
    return lazy && lazy !== env.TRUE
        ? debounce(fn, lazy)
        : fn;
}
const inputControl = {
    set(node, value) {
        node.value = toString(value);
    },
    sync(node, keypath, context) {
        context.set(keypath, node.value);
    },
    name: env.RAW_VALUE
}, radioControl = {
    set(node, value) {
        node.checked = node.value === toString(value);
    },
    sync(node, keypath, context) {
        if (node.checked) {
            context.set(keypath, node.value);
        }
    },
    name: 'checked'
}, checkboxControl = {
    set(node, value) {
        node.checked = is.array(value)
            ? array.has(value, node.value, env.FALSE)
            : !!value;
    },
    sync(node, keypath, context) {
        const value = context.get(keypath);
        if (is.array(value)) {
            if (node.checked) {
                context.append(keypath, node.value);
            }
            else {
                context.removeAt(keypath, array.indexOf(value, node.value, env.FALSE));
            }
        }
        else {
            context.set(keypath, node.checked);
        }
    },
    name: 'checked'
}, selectControl = {
    set(node, value) {
        array.each(array.toArray(node.options), node.multiple
            ? function (option) {
                option.selected = array.has(value, option.value, env.FALSE);
            }
            : function (option, index) {
                if (option.value == value) {
                    node.selectedIndex = index;
                    return env.FALSE;
                }
            });
    },
    sync(node, keypath, context) {
        const { options } = node;
        if (node.multiple) {
            const values = [];
            array.each(array.toArray(options), function (option) {
                if (option.selected) {
                    array.push(values, option.value);
                }
            });
            context.set(keypath, values);
        }
        else {
            context.set(keypath, options[node.selectedIndex].value);
        }
    },
    name: env.RAW_VALUE
}, inputTypes = {
    radio: radioControl,
    checkbox: checkboxControl,
};
export const once = env.TRUE;
export function bind(node, directive, vnode) {
    let { context, lazy, isComponent } = vnode, dataBinding = directive.binding, lazyValue = lazy && (lazy[config.DIRECTIVE_MODEL] || lazy[env.EMPTY_STRING]), set, sync, unbind;
    if (isComponent) {
        let component = node, viewBinding = component.$model;
        set = function (newValue) {
            if (set) {
                component.set(viewBinding, newValue);
            }
        };
        sync = debounceIfNeeded(function (newValue) {
            context.set(dataBinding, newValue);
        }, lazyValue);
        unbind = function () {
            component.unwatch(viewBinding, sync);
        };
        component.watch(viewBinding, sync);
    }
    else {
        let element = node, control = vnode.tag === 'select'
            ? selectControl
            : inputControl, 
        // checkbox,radio,select 监听的是 change 事件
        eventName = env.EVENT_CHANGE;
        if (control === inputControl) {
            const type = node.type;
            if (inputTypes[type]) {
                control = inputTypes[type];
            }
            // 如果是输入框，则切换成 model 事件
            // model 事件是个 yox-dom 实现的特殊事件
            // 不会在输入法组合文字过程中得到触发事件
            else if (lazyValue !== env.TRUE) {
                eventName = env.EVENT_MODEL;
            }
        }
        set = function (newValue) {
            if (set) {
                control.set(element, newValue);
            }
        };
        sync = debounceIfNeeded(function () {
            control.sync(element, dataBinding, context);
        }, lazyValue);
        unbind = function () {
            domApi.off(element, eventName, sync);
        };
        domApi.on(element, eventName, sync);
        control.set(element, directive.value);
    }
    // 监听数据，修改界面
    context.watch(dataBinding, set);
    vnode.data[directive.key] = function () {
        context.unwatch(dataBinding, set);
        set = env.UNDEFINED;
        unbind();
    };
}
export function unbind(node, directive, vnode) {
    execute(vnode.data[directive.key]);
}
