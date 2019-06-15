import * as array from './array';
import execute from '../function/execute';
import nextTick from '../function/nextTick';
let shared;
export default class NextTask {
    /**
     * 全局单例
     */
    static shared() {
        return shared || (shared = new NextTask());
    }
    constructor() {
        this.tasks = [];
    }
    /**
     * 在队尾添加异步任务
     */
    append(func, context) {
        const instance = this, { tasks } = instance;
        array.push(tasks, {
            fn: func,
            ctx: context
        });
        if (tasks.length === 1) {
            nextTick(function () {
                instance.run();
            });
        }
    }
    /**
     * 在队首添加异步任务
     */
    prepend(func, context) {
        const instance = this, { tasks } = instance;
        array.unshift(tasks, {
            fn: func,
            ctx: context
        });
        if (tasks.length === 1) {
            nextTick(function () {
                instance.run();
            });
        }
    }
    /**
     * 清空异步队列
     */
    clear() {
        this.tasks.length = 0;
    }
    /**
     * 立即执行异步任务，并清空队列
     */
    run() {
        const { tasks } = this;
        if (tasks.length) {
            this.tasks = [];
            array.each(tasks, function (task) {
                execute(task.fn, task.ctx);
            });
        }
    }
}
