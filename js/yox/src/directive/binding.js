import isDef from '../../../yox-common/src/function/isDef';
import execute from '../../../yox-common/src/function/execute';
import * as env from '../../../yox-common/src/util/env';
import * as keypathUtil from '../../../yox-common/src/util/keypath';
import * as domApi from '../../../yox-dom/src/dom';
export const once = env.TRUE;
export function bind(node, directive, vnode) {
    // binding 可能是模糊匹配
    // 比如延展属性 {{...obj}}，这里 binding 会是 `obj.*`
    let binding = directive.binding, 
    // 提前判断好是否是模糊匹配，避免 watcher 频繁执行判断逻辑
    isFuzzy = keypathUtil.isFuzzy(binding), watcher = function (newValue, _, keypath) {
        if (watcher) {
            const name = isFuzzy
                ? keypathUtil.matchFuzzy(keypath, binding)
                : directive.name;
            if (vnode.isComponent) {
                const component = node;
                component.checkProp(name, newValue);
                component.set(name, newValue);
            }
            else {
                const element = node;
                if (isDef(directive.hint)) {
                    domApi.prop(element, name, newValue);
                }
                else {
                    domApi.attr(element, name, newValue);
                }
            }
        }
    };
    vnode.context.watch(binding, watcher);
    vnode.data[directive.key] = function () {
        vnode.context.unwatch(binding, watcher);
        watcher = env.UNDEFINED;
    };
}
export function unbind(node, directive, vnode) {
    execute(vnode.data[directive.key]);
}
