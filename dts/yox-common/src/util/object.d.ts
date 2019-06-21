import { data, ValueHolder } from '../../../yox-type/src/type';
/**
 * 获取对象的 key 的数组
 *
 * @param object
 * @return
 */
export declare function keys(object: data): string[];
/**
 * 排序对象的 key
 *
 * @param object
 * @param desc 是否逆序，默认从小到大排序
 * @return
 */
export declare function sort(object: data, desc?: boolean): string[];
/**
 * 遍历对象
 *
 * @param object
 * @param callback 返回 false 可停止遍历
 */
export declare function each(object: data, callback: (value: any, key: string) => boolean | void): void;
/**
 * 清空对象所有的键值对
 *
 * @param object
 */
export declare function clear(object: data): void;
/**
 * 扩展对象
 *
 * @return
 */
export declare function extend(original: data, object: data): data;
/**
 * 合并对象
 *
 * @return
 */
export declare function merge(object1: data | void, object2: data | void): data | void;
/**
 * 拷贝对象
 *
 * @param object
 * @param deep 是否需要深拷贝
 * @return
 */
export declare function copy(object: any, deep?: boolean): any;
/**
 * 从对象中查找一个 keypath
 *
 * 返回值是空时，表示没找到值
 *
 * @param object
 * @param keypath
 * @return
 */
export declare function get(object: any, keypath: string): ValueHolder | undefined;
/**
 * 为对象设置一个键值对
 *
 * @param object
 * @param keypath
 * @param value
 * @param autofill 是否自动填充不存在的对象，默认自动填充
 */
export declare function set(object: data, keypath: string, value: any, autofill?: boolean): void;
/**
 * 对象是否包含某个 key
 *
 * @param object
 * @param key
 * @return
 */
export declare function has(object: data, key: string | number): boolean;
/**
 * 是否是空对象
 *
 * @param object
 * @return
 */
export declare function falsy(object: any): boolean;
//# sourceMappingURL=object.d.ts.map