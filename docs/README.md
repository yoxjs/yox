# 简介

轻量、简单、好用、灵活的 MVVM 框架。

## 特性

* 超级轻量，体积只有 Vue 的一半
* 采用 `TypeScript` 开发，类型系统完备
* 简单易学，脱离文档不是梦
* 功能恰好，不多不少
* 支持所有 `JavaScript` 环境，比如低版本 IE、各种小程序、React Native

## 多版本

Yox 提供两个大版本，如下：

* **standard**: 适合标准浏览器和 NodeJS
* **legacy**: 适合低版本 IE 浏览器，最低支持 IE6

每个大版本分别提供四个小版本，如下：

* **dev**: 具有完整功能和丰富的报错信息，适合开发调试
* **prod**: 不包含报错信息，相比 `runtime` 版本，此版本适合不在意性能的懒人
* **runtime**：不包含报错信息和模板编译器，文件体积减少三分之一，性能提升巨大，适合线上运行
* **pure**：不包含报错信息和视图层代码，文件体积最小，适合全局数据存储和观察

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

## 缘起

技术圈流传甚广的一句话是“别更新了，老子学不动了”，虽是笑话，却反映出一个问题：框架为什么总要更新呢？

如果更新是修复 Bug，我自然欣然接受，但我不希望看到框架频繁地升级，尤其是断崖式升级，否则每当发布新版本时，我就会很纠结，跟随升级的代价不小，放弃升级则好像落后于时代。

框架为什么要升级呢，好像每年不升级一次就是不思进取，甚至让人感觉框架已经不再维护，入坑需谨慎。

我们来看 jQuery 近十年的发展，大版本只有 1、2、3。即使是大版本，对于大部分开发者来说也是透明的。这就证明一个库或框架，如果它专注于一个领域，它的内核应该是非常稳定的。

此外，我对框架还有一个核心诉求，它必须支持主流浏览器。所谓的主流指的是，工作中必须兼容的浏览器，无论 PC 端或移动端。

如果不支持主流浏览器，势必要在 N 个框架之间切换，切换真的没有什么意义，工具而已，好用为什么要换呢？

我找不到这样的框架，于是就写了 Yox。
