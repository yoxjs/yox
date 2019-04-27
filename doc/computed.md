计算属性借鉴了 Vue 的设计，如下：

```js
{
    computed: {
        // 如果是函数，当作 getter
        propA: function () {

        },

        // 如果需要 getter 和 setter
        // 必须单独定义
        propB: {
            // 是否开启缓存，默认开启
            cache: true,
            // 指定依赖，跳过自动分析，默认会自动分析依赖
            deps: [ ],
            // getter 函数
            get: function () {

            },
            // setter 函数
            set: function (value) {

            }
        }
    }
}
```

## 缓存

计算属性的 `getter` 函数求值后，会把结果缓存起来，只有当计算属性的依赖发生变化时，才会清除缓存。

如果不希望开启缓存，可关闭。

```js
{
    computed: {
        propA: {
            cache: false,
            get: function () {

            }
        }
    }
}
```

## 依赖

计算属性的依赖是通过分析 `getter` 函数得到的。

进入 `getter` 函数之前，我们会准备一个新数组。

在 `getter` 函数的执行过程中，所有的 `get(keypath)` 会被当做计算属性的依赖，只有这些依赖发生了变化，计算属性的缓存才会被清除。

理解这个概念非常重要，下面我们以“全选”为例，形象地讲解，这是计算属性非常典型的应用场景。

```html
<div>
    <label>
        <input type="checkbox" model="allChecked">
        全选
    </label>
    {{#each list}}
        <input type="checkbox" model="checked">
    {{/each}}
</div>
```

```js
{
    data: {
        list: [
            { checked: false },
            { checked: false }
        ]
    },
    computed: {
        allChecked: {
            get: function () {
                var list = this.get('list');
                for (var i = 0, len = list.length; i < len; i++) {
                    if (!list[i].checked) {
                        return false;
                    }
                }
                return len > 0;
            },
            set: function (allChecked) {
                var list = this.get('list');
                var data = { };
                for (var i = 0, len = list.length; i < len; i++) {
                    data['list.' + i + '.checked'] = allChecked;
                }
                this.set(data);
            }
        }
    }
}
```

从 `allChecked` 的 `getter` 函数可以看出，它的依赖只有 `list`。

模板中每个单选的 `checkbox` 只会修改对应列表项的 `checked` 数据。注意，这里只是修改了列表项，而没有修改 `list`，因此 `allChecked` 的依赖（`list`）并没有发生变化。

如果希望修改列表项的 `checked` 能影响 `allChecked`，有三种方式：

* 关闭缓存
* 指定依赖
* `getter` 函数明确获取真正的依赖，即列表项的 `checked`

关闭缓存前面已经讲过，这种方式比较简单粗暴。

指定依赖最后会讲，下面我们讲解第三种方式。

稍微调整 `getter` 函数：

```js
{
    allChecked: {
        get: function () {
            // 如果 list 被替换了，allChecked 也要重新计算
            // 因此 list 也是依赖，这里必须 get 一下
            var list = this.get('list');
            for (var i = 0, len = list.length; i < len; i++) {
                // 读取列表项依赖
                if (!this.get('list.' + i + '.checked')) {
                    return false;
                }
            }
            return len > 0;
        }
    }
}
```

也许你认为这段代码已经可以正常工作了，但是，这里的问题在于，如果 `list` 是一个空数组，这里获取到的依赖只有 `list`，因为循环一次都没进去。

在这种情况下，如果对数组进行增删操作，是无法正常工作的，因为它的依赖没变化，可是你直觉上又认为它的依赖是 `list` 和它每一项的 `checked`。

这里我们给出的方案是：为计算属性配置依赖。这样就会跳过自动分析，直接获取到你想要的依赖。

```js
{
    allChecked: {
        deps: ['list', 'list.*.checked'],
        get: function () {

        }
    }
}
```



