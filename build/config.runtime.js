import create from './config.base'

// 删除模板编译器的压缩版本（要源码版本没啥用啊）
export default create('.runtime.js', 'runtime', true, false, 0)