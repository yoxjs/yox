轻量、简单、好用、灵活的 MVVM 框架。

> Yox 在保持功能完整的同时，做到了极致简单，可以说是市面上最简单的 MVVM 框架。

## 特性

* 比 Vue 更低的学习门槛，比 Vue 更好的兼容性，比 Vue 更小的文件体积（`runtime` 版本：Vue [63KB](https://github.com/vuejs/vue/blob/dev/dist/vue.runtime.min.js) Yox [31KB](https://github.com/yoxjs/yox/blob/master/dist/standard/runtime/yox.min.js)）
* 采用 `TypeScript` 开发，带来更好的工程化开发体验
* 无需记忆繁冗的语法糖和 API，脱离文档开发不是梦
* 高仿 [Handlebars](http://handlebarsjs.com/) 风格的模板引擎，借力 `.hbs` 文件的语法高亮
* 魔改 `Snabbdom` 实现的 `Virtual DOM`
* 提供面向指令的扩展机制
* 支持所有 `JavaScript` 环境，比如低版本 IE、各种小程序、React Native、NodeJS
* 作者前端生涯沉淀之作，纯个人作品，非 KPI 产物，长期维护，放心使用

## 多版本

`dist` 提供两个大版本，如下：

* **standard**: 适合标准浏览器和 NodeJS
* **legacy**: 适合低端浏览器（IE6、IE7、IE8)

每个大版本分别提供四个小版本，如下：

* **dev**: 具有**完整功能**和丰富的**报错信息**，适合开发调试（Gzipped Size：20KB）
* **prod**: 不包含**报错信息**，相比 `runtime` 版本，此版本适合不在意性能的懒人（Gzipped Size：18KB）
* **runtime**：不包含**报错信息**和**模板编译器**，性能提升巨大，适合线上运行（Gzipped Size：11KB）
* **pure**：不包含**报错信息**和**视图层代码**，文件体积最小，适合全局数据存储和观察（Gzipped Size：6KB）

## 适合人群

* 有过 `Handlebars`、`Hogan`、`BlazeJS`、`art-template` 等模板引擎的开发经验
* 希望通过一个框架搞定所有浏览器（包括低版本 IE 和移动端浏览器），节省学习和人力成本
* 不想学太多框架概念，快速上手开发
* 后端
