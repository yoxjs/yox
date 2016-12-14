
// 提升性能用的 cache
// 做成模块是为了给外部提供清除缓存的机会

/**
 * 编译模板的缓存
 *
 * @type {Object}
 */
export let templateParse = { }

/**
 * 解析表达式的缓存
 *
 * @type {Object}
 */
export let expressionParse = { }
