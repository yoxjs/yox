# 指令

所有扩展功能都需要用指令实现，通过这种方式精简核心包的体积。

## 规范

指令是一个函数，调用时会传入一个对象，结构如下：

```js
{
    bind: function (node, directive, vnode) {

      // 当指令写在组件上，isComponent 为 true
      // 比如 <Dog o-x="x" />
      if (vnode.isComponent) {
        // node 是一个 Yox 实例
      }
      else {
        // node 是一个 DOM 元素
      }

      // 如果指令需要销毁，比如绑定了事件
      // 你要在 vnode.data[directive.key] 属性上绑定销毁需要用到的数据

      vnode.data[directive.key] = function () {
        // 销毁逻辑
      }

    },
    unbind: function (node, directive, vnode) {
      // 销毁它
      vnode.data[directive.key]()
    }
  }
}
```