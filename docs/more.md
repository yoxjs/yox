Yox 的主场景是视图层的 MVVM 框架，但它的能力绝不仅于此。

MVVM 最大的特点是内部有一套完整的响应式机制，也就是观察者模式（或发布订阅模式）。

观察者模式可以做的事情非常多，比如全局事件管理器、全局数据管理器，这是与浏览器环境**完全解耦**的特性。

> 为此，我们特地提供了 `pure` 版本，它不包含任何视图层代码。

你可以把 Yox 用于任何 `JavaScript` 环境，包括 `NodeJS`、`React Native`、各种小程序，甚至最近新出的 `QuickJS` 和 `Hermes` 引擎。

> 新引擎很有可能不支持某些 `JavaScript` 特性，比如 `Hermes` 引擎不支持反射（其中包括 Proxy）。Yox 不涉及任何高级 API，因此能轻松胜任所有环境。

```js
// 全局事件管理器
var eventBus = new Yox()

// 支持链式调用
eventBus
.on(
  'login',
  function () {
    console.log('用户已登入')
  }
)
.on(
  'logout',
  function () {
    console.log('用户已登出')
  }
)

// 发射事件
eventBus.fire('login')
eventBus.fire('logout')


// 全局数据管理器
var store = new Yox()

// 支持链式调用
store
.watch(
  'user.*.name',
  function (newValue, oldValue, keypath) {
    console.log(`${keypath} 的 name 从 ${oldValue} 变成了 ${newValue}`)
  }
)
.watch(
  'user.*.age',
  function (newValue, oldValue, keypath) {
    console.log(`${keypath} 的 age 从 ${oldValue} 变成了 ${newValue}`)
  }
)

// 覆盖 id 为 123 的用户的全部信息
store.set('user.123', { ... })

// 修改 id 为 123 的用户的名称
store.set('user.123.name', 'new name')
```