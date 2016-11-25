
/**
 * 进入 `new Yox(options)` 之后立即触发，钩子函数会传入 `options` 数据。
 *
 * @type {string}
 */
export let INIT = 'init'

/**
 * 除了还没编译模板，其他该做的都做完了。
 *
 * @type {string}
 */
export let CREATE = 'create'

/**
 * 模板编译结束后触发。
 *
 * @type {string}
 */
export let COMPILE = 'compile'

/**
 * 组件加入 DOM 树后触发。
 *
 * @type {string}
 */
export let ATTACH = 'attach'

/**
 * 组件视图更新后触发。
 *
 * @type {string}
 */
export let UPDATE = 'update'

/**
 * 组件从 DOM 树移除之前触发。
 *
 * @type {string}
 */
export let DETACH = 'detach'
