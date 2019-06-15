/**
 * 遍历数组
 *
 * @param array
 * @param callback 返回 false 可停止遍历
 * @param reversed 是否逆序遍历
 */
export declare function each<T>(array: T[], callback: (item: T, index: number, length: number) => boolean | void, reversed?: boolean): void;
/**
 * 往后加
 *
 * @param array
 * @param target
 */
export declare function push<T>(array: T[], target: T | T[]): void;
/**
 * 往前加
 *
 * @param array
 * @param target
 */
export declare function unshift<T>(array: T[], target: T | T[]): void;
/**
 * 数组项在数组中的位置
 *
 * @param array 数组
 * @param target 数组项
 * @param strict 是否全等判断，默认是全等
 * @return 如果未找到，返回 -1
 */
export declare function indexOf<T>(array: T[], target: T, strict?: boolean): number;
/**
 * 获取数组最后一项
 *
 * @param array 数组
 * @return
 */
export declare function last<T>(array: T[]): T | void;
/**
 * 弹出数组最后一项
 *
 * 项目里用的太多，仅用于节省字符...
 *
 * @param array 数组
 * @return 弹出的数组项
 */
export declare function pop<T>(array: T[]): T | void;
/**
 * 删除数组项
 *
 * @param array 数组
 * @param item 待删除项
 * @param strict 是否全等判断，默认是全等
 * @return 删除的数量
 */
export declare function remove<T>(array: T[], target: T, strict?: boolean): number;
/**
 * 数组是否包含 item
 *
 * @param array 数组
 * @param target 可能包含的数组项
 * @param strict 是否全等判断，默认是全等
 * @return
 */
export declare function has<T>(array: T[], target: T, strict?: boolean): boolean;
/**
 * 把类数组转成数组
 *
 * @param array 类数组
 * @return
 */
export declare function toArray<T>(array: T[] | ArrayLike<T>): T[];
/**
 * 把数组转成对象
 *
 * @param array 数组
 * @param key 数组项包含的字段名称，如果数组项是基本类型，可不传
 * @param value
 * @return
 */
export declare function toObject(array: any[], key?: string | null, value?: any): Object;
/**
 * 把数组合并成字符串
 *
 * @param array
 * @param separator
 * @return
 */
export declare function join(array: string[], separator: string): string;
/**
 * 用于判断长度大于 0 的数组
 *
 * @param array
 * @return
 */
export declare function falsy(array: any): boolean;
//# sourceMappingURL=array.d.ts.map