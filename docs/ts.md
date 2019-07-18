Yox 采用 `TypeScript` 开发，代码质量相比旧版（`JavaScript` 版本）有了质的提升。

> 强烈建议使用 `TypeScript` 开发项目，无论是什么类型、什么规模的项目。

### 定义组件

我们为 `TypeScript` 添加了一个 `Yox.define` 方法用于组件定义，它能正确地处理 `this`，并且可以识别 `methods` 定义的实例方法。

> 需要设置 `tsconfig` 的 `noImplicitThis` 为 `true`

以 `Button.ts` 组件举例，如下：

```js
import Yox from 'yox'

// 采用 .hbs 作为模板文件扩展名
// 直接获取各种编辑器对 Handlebars 的语法高亮支持（Yox 模板很像 Handlebars）
import template from './Button.hbs'

export default Yox.define({
  propTypes: {

  },
  template,
  data() {
    // this 指向 Yox 实例
    return {

    }
  },
  computed: {
    xxx() {
      // this 指向 Yox 实例
    },
    yyy: {
      get() {
        // this 指向 Yox 实例
      },
      set() {
        // this 指向 Yox 实例
      }
    }
  },
  events: {
    xxx(event, data) {
      // this 指向 Yox 实例
    }
  },
  watchers: {
    xxx(newValue, oldValue) {
      // this 指向 Yox 实例
    },
    yyy: {
      watcher(newValue, oldValue) {
        // this 指向 Yox 实例
      }
    }
  },
  ...
})
```