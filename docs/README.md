# 简介

轻量、简单、好用的 MVVM 框架。

> 理念：简单比强大更有生命力。

## 特性

* 超级轻量，体积只有 Vue 的一半
* 采用 `typescript` 开发，类型系统完备
* 简单易学，脱离文档不是梦
* 功能恰好，不多不少
* 支持低版本 IE
* 支持 NodeJS

## 多版本

Yox 提供两个大版本，如下：

* **standard**: 适合标准浏览器和 NodeJS
* **legacy**: 适合低版本 IE 浏览器，最低支持 IE6

每个大版本下面，还有四个小版本，如下：

* **dev**: 具有完整功能和丰富的报错信息，适合开发调试
* **prod**: 不包含报错信息，相比 `runtime` 版本，此版本更适合不在乎性能的懒人
* **runtime**：不包含报错信息和模板编译器，文件体积减少三分之一，性能提升巨大，适合线上运行
* **pure**：不包含报错信息和视图层代码，文件体积最小，适合全局数据存储和观察

`pure` 版本的使用方式如下：

```js
var store = new Yox()

// 监听数据变化
store.watch(
  'user.*.name',
  function (newValue, oldValue, keypath) {
    console.log(`${keypath} 的 name 从 ${oldValue} 变成了 ${newValue}`)
  }
)

// 覆盖 id 为 123 的所有用户信息
store.set('user.123', { ... })

// 修改 id 为 123 的用户的名称
store.set('user.123.name', 'new name')
```

## 定位

历经两年淬炼，Yox 浴火重生，它在保持功能完整的同时，做到了极致简单，可以说是市面上最简单的 MVVM 框架。
