# 简介

轻量、简单、好用、灵活的 MVVM 框架。

## 特性

* 比 Vue 更低的学习门槛，比 Vue 更小的文件体积（`runtime` 版本：Vue [63KB](https://github.com/vuejs/vue/blob/dev/dist/vue.runtime.min.js) Yox [31KB](https://github.com/yoxjs/yox/blob/master/dist/standard/runtime/yox.min.js)）
* 采用 `TypeScript` 开发，带来更好的工程化开发体验
* 设计上保持克制，没有语法糖，没有多余功能
* 高仿 [Handlebars](http://handlebarsjs.com/) 风格的模板引擎
* 提供面向指令的扩展机制
* 支持所有 `JavaScript` 环境，比如低版本 IE、各种小程序、React Native
* 作者前端生涯沉淀之作，长期维护，放心使用

## 多版本

Yox 提供两个大版本，如下：

* **standard**: 适合标准浏览器和 NodeJS
* **legacy**: 适合低端浏览器（IE6、IE7、IE8)

每个大版本分别提供四个小版本，如下：

* **dev**: 具有完整功能和丰富的报错信息，适合开发调试（Gzipped Size：20KB）
* **prod**: 不包含报错信息，相比 `runtime` 版本，此版本适合不在意性能的懒人（Gzipped Size：18KB）
* **runtime**：不包含报错信息和模板编译器，性能提升巨大，适合线上运行（Gzipped Size：11KB）
* **pure**：不包含报错信息和视图层代码，文件体积最小，适合全局数据存储和观察（Gzipped Size：6KB）

`pure` 版本的使用方式如下：

```js
var store = new Yox()

// 用作数据监听
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

// 覆盖 id 为 123 的所有用户信息
store.set('user.123', { ... })

// 修改 id 为 123 的用户的名称
store.set('user.123.name', 'new name')


// 用作 event bus
store
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
store.fire('login')
store.fire('logout')
```

## 定位

历经两年淬炼，Yox 浴火重生，它在保持功能完整的同时，做到了极致简单，可以说是市面上最简单的 MVVM 框架。