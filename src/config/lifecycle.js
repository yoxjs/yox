
/**
 * 进入 `new Yox(options)` 之后立即触发，钩子函数会传入 `options`
 *
 * @type {string}
 */
export let BEFORE_CREATE = 'beforeCreate'

/**
 * 初始化结束，渲染模板之前触发
 *
 * @type {string}
 */
export let AFTER_CREATE = 'afterCreate'

/**
 * 模板编译，加入 DOM 树之前触发
 *
 * @type {string}
 */
export let BEFORE_MOUNT = 'beforeMount'

/**
 * 加入 DOM 树之后触发
 *
 * 这时可通过 `$el` 获取组件根元素
 *
 * @type {string}
 */
export let AFTER_MOUNT = 'afterMount'

/**
 * 视图更新之前触发
 *
 * @type {string}
 */
export let BEFORE_UPDATE = 'beforeUpdate'

/**
 * 视图更新之后触发
 *
 * @type {string}
 */
export let AFTER_UPDATE = 'afterUpdate'

/**
 * 销毁之前触发
 *
 * @type {string}
 */
export let BEFORE_DESTROY = 'beforeDestroy'

/**
 * 销毁之后触发
 *
 * @type {string}
 */
export let AFTER_DESTROY = 'afterDestroy'
