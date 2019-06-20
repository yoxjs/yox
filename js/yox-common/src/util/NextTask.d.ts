import { Task, NextTaskInterface } from '../../../yox-type/src/type';
export default class NextTask implements NextTaskInterface {
    /**
     * 全局单例
     */
    static shared(): NextTask;
    /**
     * 异步队列
     */
    tasks: Task[];
    constructor();
    /**
     * 在队尾添加异步任务
     */
    append(func: Function, context?: any): void;
    /**
     * 在队首添加异步任务
     */
    prepend(func: Function, context?: any): void;
    /**
     * 清空异步队列
     */
    clear(): void;
    /**
     * 立即执行异步任务，并清空队列
     */
    run(): void;
}
//# sourceMappingURL=NextTask.d.ts.map