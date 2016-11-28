
/**
 * 进入 `new Yox(options)` 之后立即触发，钩子函数会传入 `options` 数据。
 *
 * @type {string}
 */
export let INIT = 'onInit'

/**
 * 除了还没编译模板，其他该做的都做完了。
 *
 * @type {string}
 */
export let CREATE = 'onCreate'

/**
 * 模板编译结束后触发。
 *
 * @type {string}
 */
export let COMPILE = 'onCompile'

/**
 * 组件加入 DOM 树后触发。
 *
 * @type {string}
 */
export let ATTACH = 'onAttach'

/**
 * 不用计较底层实现，反正 ready 就是可用了
 *
 * @type {string}
 */
export let READY = 'onReady'

/**
 * 组件视图更新后触发。
 *
 * @type {string}
 */
export let UPDATE = 'onUpdate'

/**
 * 组件从 DOM 树移除之前触发。
 *
 * @type {string}
 */
export let DETACH = 'onDetach'

/**
 * 不用计较底层实现，反正 destroy 就是销毁了
 *
 * @type {string}
 */
export let DESTROY = 'onDestroy'
