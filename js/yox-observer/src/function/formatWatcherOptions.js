import * as is from '../../../yox-common/src/util/is';
import * as env from '../../../yox-common/src/util/env';
import * as logger from '../../../yox-common/src/util/logger';
// 避免频繁创建对象
const optionsHolder = {
    watcher: env.EMPTY_FUNCTION
};
/**
 * 格式化 watch options
 *
 * @param options
 */
export default function (options, immediate) {
    if (is.func(options)) {
        optionsHolder.watcher = options;
        optionsHolder.immediate = immediate === env.TRUE;
        return optionsHolder;
    }
    if (options && options.watcher) {
        return options;
    }
    if (process.env.NODE_ENV === 'development') {
        logger.fatal(`watcher should be a function or object.`);
    }
}
