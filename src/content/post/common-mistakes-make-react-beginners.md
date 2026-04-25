---
title: "React 新手常犯的十个错误"
publishDate: "2023-06-27T00:00:00.000Z"
tags: ["React","bug"]
description: "介绍了刚入门 React 的新人，在编写代码的时候遇到一些常见问题，并给出了解决方案。"
---

这是我关注的一位前端开发者的分享，分享的非常棒！值得被更多人看到，原文英文版本，我做了翻译，希望对 React 开发者有所帮助。

在我最近开发的时候，在遇到复杂状态管理和副作用的时候，就会经常不能完全想到所有可能发生的情况，导致一些莫名其妙的 bug，如果你也是，那看完吧，一定有新的收获。以下是正文部分：

“几年前，我在当地的一个编码训练营教 React，我注意到有一些事情让学生措手不及。人们不断掉进同一个坑里！在本教程中，我们将探索 8 个最常见的陷阱。您将学习如何绕过它们，并希望能够避免很多挫败感。为了保持这篇博客文章轻松流畅，我们不会过多探讨这些陷阱背后的原因。这更像是一个快速参考。下面看下常见的问题吧！

> ##### 目标受众
>
> 这篇文章是为那些对React基础知识已经有所了解，但在他们的学习旅程中仍然处于初级阶段的开发者编写的。

### 1\. 使用 0 作为判断依据

好的，我们从其中一个最普遍的陷阱开始。我在一些生产应用程序中实际遇到过这个问题！

请看下以下代码：

```
// react app.js
import React from 'react';
import ShoppingList from './ShoppingList';

function App() {
  const [items, setItems] = React.useState([]);

  return (
    <div>
      {items.length && <ShoppingList items={items} />}
    </div>
  );
}

export default App;

```

```
// ShoppingList.js
import React from 'react';

function ShoppingList({ items }) {
  return (
    <>
      <h1>Shopping List</h1>
      <ul>
        {items.map((item, index) => {
          // NOTE: We shouldn't use “index” as the key!
          // This is covered later in this post 😄
          return (
            <li key={index}>
              {item}
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default ShoppingList

```

我们的目标是有条件地显示一个购物清单。如果数组中至少有1个项目，我们应该渲染一个ShoppingList元素。否则，我们不应该渲染任何内容。**然而，我们最终在 UI 中得到一个随机的 `0` ！**

发生这种情况是因为 `items.length` 的计算结果为 `0` 。由于 0 在 JavaScript 中是一个虚假值，因此 `&&` 运算符短路，整个表达式解析为 `0` 。实际上，就好像我们这样做了一样：

```
function App() {
  return (
    <div>
      {0}
    </div>
  );
}

```

与其他假值（如''、null、false等）不同，数字0是JSX中的一个有效值。毕竟，在许多情况下，我们确实希望打印数字0！

**如何修复：** 我们的表达式应该使用一个“纯粹”的布尔值（true/false）：

```
function App() {
  const [items, setItems] = React.useState([]);
return (
    <div>
      {items.length > 0 && (
        <ShoppingList items={items} />
      )}
    </div>
  );
}

```

`items.length > 0` 将始终计算为 `true` 或 `false` ，因此我们永远不会有任何问题。或者，我们可以使用三元表达式：

```
function App() {
  const [items, setItems] = React.useState([]);
return (
    <div>
      {items.length
        ? <ShoppingList items={items} />
        : null}
    </div>
  );
}

```

这两种选择都是完全有效的，这取决于**个人品味**。

### 2\. 不正确使用状态

让我们继续使用我们的购物清单示例。假设我们能够添加新项目：

```
// app.js
import React from 'react';
import ShoppingList from './ShoppingList';
import NewItemForm from './NewItemForm';

function App() {
  const [items, setItems] = React.useState([
    'apple',
    'banana',
  ]);

  function handleAddItem(value) {
    items.push(value);
    setItems(items);
  }

  return (
    <div>
      {items.length > 0 && <ShoppingList items={items} />}
      <NewItemForm handleAddItem={handleAddItem} />
    </div>
  )
}

export default App;

```

```
// ShoppingList.js
import React from 'react';

function ShoppingList({ items }) {
  return (
    <>
      <h1>Shopping List</h1>
      <ul>
        {items.map((item, index) => {
          // NOTE: We shouldn't use “index” as the key!
          // This is covered later in this post 😄
          return (
            <li key={index}>
              {item}
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default ShoppingList;

```

```
// NewItemFrom.js
import React from 'react';

function NewItemForm({ handleAddItem }) {
  const [value, setValue] = React.useState('');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        handleAddItem(value);
        setValue('');
      }}
    >
      {/* We'll touch on this ID stuff later too! */}
      <label htmlFor="new-item-input">
        Item:
      </label>
      <input
        value={value}
        onChange={event => setValue(event.target.value)}
      />
      <button>
        Add Item
      </button>
    </form>
  );
}

export default NewItemForm;

```

可看到如下：

![image-20230623130414761](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/3bf4b338ff594eeeb865752f4f9daf31~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

每当用户提交一个新项目时，`handleAddItem`函数会被调用。不幸的是，它目前无法正常工作！当我们输入一个项目并提交表单时，该项目并没有被添加到购物清单中。

**问题** 出在我们违反了React中可能是最重要的规则之一：我们修改了**状态**的值。具体来说，问题是这一行：

```
// app.js
function handleAddItem(value) {
  items.push(value);
  setItems(items);
}

```

React 依靠**状态变量的身份**（也就是这里的 useState hooks）来判断状态何时发生了变化。当我们把一个项目推到数组中时，我们不会改变该数组的身份，所以 React 无法判断这个值已经改变。

**如何修复：** 我们需要创建一个全新的数组。以下是我的做法：

```
// app.js
function handleAddItem(value) {
  const nextItems = [...items, value]; // 不知道有人看过我之前的文章不，这里也是遵守 react 的不可变性原则
  setItems(nextItems);
}

```

与其修改现有的数组，我选择从头开始创建一个新的数组。这个新数组包含了与原数组完全相同的所有项（借助展开语法...），以及新添加的项。这里的区别在于**修改现有项**与**创建新项**之间的差异。当我们将一个值传递给像 setCount 这样的**状态设置函数**时，它需要是一个**新的实体**。**对象也是如此：**

```
// ❌ Mutates an existing object
function handleChangeEmail(nextEmail) {
  user.email = nextEmail;
  setUser(user);
}
// ✅ Creates a new object
function handleChangeEmail(email) {
  const nextUser = { ...user, email: nextEmail };
  setUser(nextUser);
}

```

基本上，... 语法是一种将数组/对象中的所有内容复制/粘贴到全新实体中的方式。这确保一切正常运作。

### 3\. 不生成密钥

以下是您之前可能看到的警告：

> Warning: Each child in a list should have a unique "key" prop.
>
> 警告：列表中的每个子元素应该有一个唯一的 "key" 属性。

最常见的情况是在对数据进行映射时发生此错误。以下是一个违反此规则的示例：

```
// app.js
import React from 'react';
import ShoppingList from './ShoppingList';
import NewItemForm from './NewItemForm';

function App() {
  const [items, setItems] = React.useState([
    'apple',
    'banana',
    'carrot',
  ]);

  function handleAddItem(value) {
    const nextItems = [...items, value]
    setItems(nextItems);
  }

  return (
    <div>
      {items.length > 0 && <ShoppingList items={items} />}
      <NewItemForm handleAddItem={handleAddItem} />
    </div>
  )
}

export default App;

```

```
// ShoppingList.js
import React from 'react';

function ShoppingList({ items }) {
  return (
    <ul>
      {items.map((item) => {
        return (
          <li>{item}</li>
        );
      })}
    </ul>
  );
}

export default ShoppingList;

```

```
// NewItemForm.js
import React from 'react';
function NewItemForm({ handleAddItem }) {
  const [value, setValue] = React.useState('');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        handleAddItem(value);
        setValue('');
      }}
    >
      {/* We'll touch on this ID stuff later too! */}
      <label htmlFor="new-item-input">
        Item:
      </label>
      <input
        value={value}
        onChange={event => setValue(event.target.value)}
      />
      <button>
        Add Item
      </button>
    </form>
  );
}

export default NewItemForm;

```

你会看到：

![image-20230623132957917](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/bac5be80c2d04ca3a30266874079e80a~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

每当我们渲染一个元素数组时，我们需要为 React 提供额外的上下文信息，以便它能够识别每个项。关键是，这个标识符需要是唯一的。许多在线资源会建议使用数组索引来解决这个问题：

```
// ShoppingList.js
function ShoppingList({ items }) {
  return (
    <ul>
      {items.map((item, index) => {
        return (
          <li key={index}>{item}</li>
        );
      })}
    </ul>
  );
}

```

我不认为这是一个好的建议。这种方法有时可以工作，但在其他情况下可能会引发一些严重的问题。随着对 React 工作原理的更深入理解，您将能够在每个具体情况下判断是否可以使用这种方法，但老实说，我认为以一种始终安全的方式解决问题会更容易。这样，您就不必担心它！

**下面是计划：** 每当向列表中添加新项时，我们将为其生成一个唯一的ID：

```
// app.js
function handleAddItem(value) {
  const nextItem = {
    id: crypto.randomUUID(),
    label: value,
  };
  const nextItems = [...items, nextItem];
  setItems(nextItems);
}

```

`crypto.randomUUID`是内置于浏览器中的方法（它不是第三方包）。它在所有主要浏览器中都可用。它与加密货币无关。该方法生成一个类似于 `d9bb3c4c-0459-48b9-a94c-7ca3963f7bd0` 的唯一字符串。通过在用户提交表单时动态生成一个 ID，我们确保购物清单中的每个项都具有唯一的 ID。以下是如何将其应用为键的方法：

```
// ShoppingList.js
function ShoppingList({ items }) {
  return (
    <ul>
      {items.map((item, index) => {
        return (
          <li key={item.id}>
            {item.label}
          </li>
        );
      })}
    </ul>
  );
}

```

重要的是，我们希望在状态更新时生成ID，而不是这样做：

```
// ❌ This is a bad idea
<li key={crypto.randomUUID()}>
  {item.label}
</li>

```

在 JSX 中这样生成会导致键在**每次渲染时发生变化**。当键发生变化时，React将销毁并重新创建这些元素，这可能对**性能产生重大负面影响**。这种模式——在创建数据时生成键——可以应用于各种情况。例如，下面是我在从服务器获取数据时创建唯一ID的方式：

```
const [data, setData] = React.useState(null);
async function retrieveData() {
  const res = await fetch('/api/data');
  const json = await res.json();
  // The moment we have the data, we generate
  // an ID for each item:
  const dataWithId = json.data.map(item => {
    return {
      ...item,
      id: crypto.randomUUID(),
    };
  });
  // Then we update the state with
  // this augmented data:
  setData(dataWithId);
}

```

### 4\. 缺少空格

这是我在网络上经常看到的一个非常让人困惑的问题。

```
import React from 'react';

function App() {
  return (
    <p>
      Welcome to Corpitech.com!
      <a href="/login">Log in to continue</a>
    </p>
  );
}

export default App;

```

你会看到：![image-20230623133756836](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/24ad0c9df1d14578b7edb81c0b88607a~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

注意到这两个句子被混在一起了：

![image-20230623133859746](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/d199f5422dc04f3099300fb8a46e56de~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

这是因为 **JSX 编译器**（将我们编写的 JSX 转换为适用于浏览器的 JavaScript 的工具）**无法真正区分语法上的空格和我们为缩进/代码可读性而添加的空格**。

**如何修复它：** 我们需要在文本和锚点标记之间添加一个**显式的空格字符**：

```
<p>
  Welcome to Corpitech.com!
  {' '}
  <a href="/login">Log in to continue</a>
</p>

```

一个小小的专业技巧：如果您使用 `Prettier`，它会自动为您添加这些空格字符！只需确保让它进行格式化（不要提前将内容拆分为多行）。

> 为什么 React 团队没有解决这个问题？
>
> 当我第一次了解到这种策略时，我也觉得有些凌乱。为什么 React 团队不能修复它，使其按照我们的预期工作呢？！我后来意识到这个问题并没有完美的解决方案。如果 React 开始将缩进解释为语法上的空格，可以解决这个问题，但也会引入一系列其他问题。最终，尽管它看起来有些笨拙，但我认为这是正确的决定。这是最不糟糕的选择！

### 5\. 在修改状态后访问它

这个问题在某个时刻都会让人措手不及。在我在一家本地编程训练营教授时，我已经记不清有多少次有人因为这个问题向我求助了。下面是一个最简单的计数器应用程序：点击按钮会增加计数。看看你能否发现问题所在：

```
import React from 'react';

function App() {
  const [count, setCount] = React.useState(0);

  function handleClick() {
    setCount(count + 1);

    console.log({ count });
  }

  return (
    <button onClick={handleClick}>
      {count}
    </button>
  );
}

export default App;

```

你会看到：

![image-20230623134419724](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/dba119edd43b4c6b815cc6f970ced7d5~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

在增加计数状态变量后，我们将其值记录到控制台。令人奇怪的是，它记录了错误的值：

![image-20230623134525645](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/f63ae0958c8748dfb21f089eb9903445~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

问题出在这里：React 中的状态设置函数（例如 setCount）是异步的。 这是有问题的代码是这里：

```
function handleClick() {
  setCount(count + 1);
  console.log({ count });
}

```

很容易错误地认为 setCount 函数类似于赋值，好像这样做是等同于这样的操作：

```
count = count + 1;
console.log({ count });

```

然而，React 并不是这样构建的。当我们调用 setCount 时，我们并没有重新赋值给一个变量，而是安排了一个更新操作。

对于我们完全理解这个概念可能需要一些时间，但下面的解释或许有助于更好地理解：我们无法重新赋值给 count 变量，因为它是一个常量！

```
// Uses `const`, not `let`, and so it can't be reassigned
const [count, setCount] = React.useState(0);
count = count + 1; // Uncaught TypeError:
                   // Assignment to constant variable

```

那么我们应该如何修复这个问题呢？幸运的是，我们已经知道这个值应该是什么。我们需要将它存储在一个变量中，以便我们可以访问它：

```
function handleClick() { // 再次验证不可变性重要性，使用新的变量记录最新的状态
  const nextCount = count + 1;
  setCount(nextCount);
  // Use `nextCount` whenever we want
  // to reference the new value:
  console.log({ nextCount });
}

```

我喜欢在这种情况下使用“next”前缀（比如nextCount、nextItems、nextEmail等）。这样对我来说更清晰，我们不是更新当前值，而是安排下一个值。

### 6\. 返回多个元素

有时，一个组件需要返回多个顶级元素。例如：

```
// app.js
import React from 'react';
import LabeledInput from './LabeledInput';

function App() {
  const [name, setName] = React.useState('');

  return (
    <LabeledInput
      id="name"
      label="Your name"
      value={name}
      onChange={(event) => setName(event.target.value)}
    />
  );
}

export default App;

```

```
// LabeledInput.js
function LabeledInput({ id, label, ...delegated }) {
  return (
    <label htmlFor={id}>
      {label}
    </label>
    <input
      id={id}
      {...delegated}
    />
  );
}

export default LabeledInput;

```

你会看到：

![image-20230623135153465](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/cadab96d750449c6bf52be148e09b3d4~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

我们希望我们的 LabeledInput 组件返回两个元素：一个 `<label>` 和一个 `<input>`。令人沮丧的是，我们遇到了一个错误：

![image-20230623135238318](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/b802f8d28d4f48d19710a90aa35820cb~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

这是因为 JSX 编译为普通的 JavaScript。下面是在浏览器中运行时这段代码的样子：

```
function LabeledInput({ id, label, ...delegated }) {
  return (
    React.createElement('label', { htmlFor: id }, label)
    React.createElement('input', { id: id, ...delegated })
  );
}

```

在 JavaScript 中，我们不能像这样返回多个值。这也是为什么这种写法不起作用的原因：

```
function addTwoNumbers(a, b) {
  return (
    "the answer is"
    a + b
  );
}

```

我们该如何修复呢？很长一段时间以来，标准做法是将这两个元素包装在一个包裹标签中，比如 `<div>`：

```
function LabeledInput({ id, label, ...delegated }) {
  return (
    <div>
      <label htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        {...delegated}
      />
    </div>
  );
}

```

通过将 `<label>` 和 `<input>` 包装在 `<div>` 中，我们只返回一个顶层元素！以下是它在普通的 JavaScript 中的样子：

```
function LabeledInput({ id, label, ...delegated }) {
  return React.createElement(
    'div',
    {},
    React.createElement('label', { htmlFor: id }, label),
    React.createElement('input', { id: id, ...delegated })
  );
}

```

JSX 是一个很棒的抽象，但它常常会掩盖关于 JavaScript 的基本真理。我认为，查看 JSX 如何转换为普通的 JavaScript，以了解实际发生的情况往往是有帮助的。通过这种新的方法，我们返回一个单独的元素，而该元素包含两个子元素。问题解决了！但我们可以使用片段（fragments）进一步改进这个解决方案：

```
function LabeledInput({ id, label, ...delegated }) {
  return (
    <React.Fragment>
      <label htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        {...delegated}
      />
    </React.Fragment>
  );
}

```

`React.Fragment`是一个专门用来解决这个问题的React组件。它允许我们将多个顶级元素捆绑在一起，而不会影响DOM。这非常棒：这意味着我们不会在标记中加入不必要的`<div>`。它还有一个便捷的简写方式，我们可以像这样编写片段：

```
function LabeledInput({ id, label, ...delegated }) {
  return (
    <>
      <label htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        {...delegated}
      />
    </>
  );
}

```

我喜欢这里的符号意义：React团队选择使用一个空的HTML标签`<>`来表示片段不会产生任何实际的标记。

### 7\. 从不受控制变为受控制状态

让我们来看一个典型的表单示例，将一个输入与React状态绑定起来：

```
import React from 'react';

function App() {
  const [email, setEmail] = React.useState();

  return (
    <form>
      <label htmlFor="email-input">
        Email address
      </label>
      <input
        id="email-input"
        type="email"
        value={email}
        onChange={event => setEmail(event.target.value)}
      />
    </form>
  );
}

export default App;

```

你会看到：

![image-20230623140328986](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/82b13e18fb9a4749a83c20c557b3449c~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

如果你在这个输入框中开始输入，你会注意到控制台上会出现一个警告：

![image-20230623140357471](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/78399c44527746348f9be53bcfab3cd2~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

解决方法如下：我们需要将 `email` 状态初始化为空字符串：

```
const [email, setEmail] = React.useState('');

```

当我们设置value属性时，我们告诉 React 我们希望这是一个受控输入框。但是，这只有在我们传递一个定义的值时才起作用！通过将email初始化为空字符串，**我们确保 value 永远不会被设置为undefined**。

> 受控输入
>
> 如果您想详细了解为什么这是必要的，以及什么是“受控输入”，我们将在我最近发布的教程中深入探讨这些想法：[React中的数据绑定](https://link.juejin.cn/?target=https%3A%2F%2Fwww.joshwcomeau.com%2Freact%2Fdata-binding%2F 'https://www.joshwcomeau.com/react/data-binding/')

JSX 被设计得看起来很像 HTML，但它们之间有一些令人惊讶的差异，往往会让人措手不及。大多数差异都有很好的文档记录，而且控制台的警告通常非常具体和有帮助。例如，如果你意外使用 class 而不是className，React会准确告诉你问题所在。但有一个微妙的差异经常让人困惑：style属性。在HTML中，style是以字符串的形式表示的：

```
<button style="color: red; font-size: 1.25rem">
  Hello World
</button>

```

但是，在 JSX 中，我们需要将其指定为一个对象，并带有驼峰属性名称。在下面的代码中，我试图做到这一点，但出现了错误。你能找出错误吗？

```
import React from 'react';

function App() {
  return (
    <button
      style={ color: 'red', fontSize: '1.25rem' }
    >
      Hello World
    </button>
  );
}

export default App;

```

你会看到：

![image-20230623140901535](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/28fa19ffac9646038b3c3ee0e5fcbb91~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

问题是我需要使用**双波浪线**，如下所示：

```
<button
  // "{{", instead of "{":
  style={{ color: 'red', fontSize: '1.25rem' }}
>
  Hello World
</button>

```

为了理解为什么这样是必要的，我们需要稍微了解一下这个语法。在JSX中，我们使用花括号来创建一个表达式插槽。我们可以在这个插槽中放置任何有效的JavaScript表达式。例如：

```
<button className={isPrimary ? 'btn primary' : 'btn'}>

```

无论我们在{}中放置什么，都将被视为JavaScript进行求值，并将结果设置为该属性的值。className将是'btn primary'或'btn'。对于style，我们首先需要创建一个表达式插槽，然后将一个JavaScript对象传递到这个插槽中。我认为如果我们将对象提取到一个变量中，会更清晰明了：

```
// 1. Create the style object:
const btnStyles = { color: 'red', fontSize: '1.25rem' };
// 2. Pass that object to the `style` attribute:
<button style={btnStyles}>
  Hello World
</button>
// Or, we can do it all in 1 step:
<button style={{ color: 'red', fontSize: '1.25rem' }}>

```

外层的花括号创建了JSX中的"表达式插槽"。内层的花括号创建了一个JavaScript对象，用于保存我们的样式。

### 8\. 异步的 effect 函数

假设我们有一个函数，在挂载时从 API 中获取一些用户数据。我们将使用 useEffect 钩子，并希望使用 await 关键字。以下是我第一次尝试的代码：

```
// app.js
import React from 'react';
import UserProfile from './UserProfile';

function App() {
  return (
    <UserProfile userId="abc123" />
  );
}

export default App;

```

```
// UserProfile.js
import React from 'react';
import { API } from './constants';

function UserProfile({ userId }) {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const url = `${API}/get-profile?id=${userId}`;
    const res = await fetch(url);
    const json = await res.json();

    setUser(json.user);
  }, [userId]);

  if (!user) {
    return 'Loading…';
  }

  return (
    <section>
      <dl>
        <dt>Name</dt>
        <dd>{user.name}</dd>
        <dt>Email</dt>
        <dd>{user.email}</dd>
      </dl>
    </section>
  );
}

export default UserProfile;

```

```
// constants.js
export const API = 'https://jor-test-api.vercel.app/api';

```

你会看到：

![image-20230623141348771](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/21cd98d1e5e442508154784aa3064191~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

不幸的是，我们收到一个错误：

![image-20230623141402587](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/64ca8115286e48bfa8a83db139c63246~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

**这是修正的方法：** 我们需要在 effect 中创建一个单独的异步函数：

```
React.useEffect(() => {
  // Create an async function...
  async function runEffect() {
    const url = `${API}/get-profile?id=${userId}`;
    const res = await fetch(url);
    const json = await res.json();
    setUser(json);
  }
  // ...and then invoke it:
  runEffect();
}, [userId]);

```

为了理解为什么需要这个变通方法，值得考虑一下 async 关键字的实际作用。例如，你会猜测下面这个函数返回什么？

```
async function greeting() {
  return "Hello world!";
}

```

乍一看，似乎很明显：它返回字符串`"Hello world!"`！但实际上，这个函数返回一个 Promise。这个 Promise 解析为字符串 `"Hello world!"`。这是一个问题，因为 useEffect 钩子并不期望我们返回一个 Promise！它期望我们返回无值（就像我们上面的示例中所做的），或者返回一个清除函数。清除函数远超出了本教程的范围，但它们非常重要。大多数的 effect 都会有一些拆除逻辑，我们需要尽快将其提供给 React，这样 React 就可以在**依赖项更改或组件卸载时**调用它。 通过使用"单独的异步函数"策略，我们仍然可以立即返回一个清除函数：

```
React.useEffect(() => {
  async function runEffect() {
    // Effect logic here
  }
  runEffect();
  return () => {
    // Cleanup logic here
  }
}, [userId]);

```

你可以将这个函数命名为任何你喜欢的名称，但我喜欢使用通用名称 runEffect。它清晰地表明它包含了主要的 effect 逻辑。

### 9\. 培养直觉 （经验）

一开始，我们在这个教程中看到的很多修复方法似乎相当随意。为什么我们需要提供一个唯一的键（key）？为什么我们无法在改变状态后访问它？为什么useEffect如此棘手？React一直以来都相当棘手，尤其是现在使用hooks时更是如此。需要一段时间才能理解一切。我在2015年开始使用React，还记得当时想：“这玩意太酷了，但我完全不知道它是如何工作的。” 😅从那时起，我逐渐构建了自己关于React的思维模型，一块一块地拼凑。我经历了一系列的顿悟，每一次顿悟都使我的思维模型更加坚实、更加完善。我开始理解React为什么会以这种方式工作。我发现自己不必记住任意的规则；相反，我可以依靠自己的直觉。很难言喻 React 对我来说变得更加有趣了！在过去的一年里，我一直在开发一门名为《React的乐趣》的交互式自学在线课程。这是一门面向初学者的课程，旨在帮助你建立对React工作原理的直觉，以便用它构建丰富、动态的Web应用程序。我的课程与其他课程不同；你不会坐在那里看我连续几个小时地编码。《React的乐趣》结合了许多不同的媒体形式：视频、交互式文章、挑战性练习、以真实世界为灵感的项目，甚至还有一两个小游戏。《React的乐趣》将在几个月内发布。你可以在课程主页上了解更多信息，并注册接收更新：[《react的乐趣》](https://link.juejin.cn/?target=https%3A%2F%2Fwww.joyofreact.com%2F 'https://www.joyofreact.com/')

” END

我想补充两个我最近开发遇到的问题，

0.  第一个就是 useState 的异步问题，当我们setState后如果立刻取值 state 得到的可能不是最新的值，这真的很坑人，
1.  第二个是 在React 中，如果想要立刻获取到最新的值，你可以使用 useRef 进行同步，但是它不能更新UI视图，所以一定要记得使用 state 去触发页面 UI 更新，
2.  当面临列表数据，并且页面渲染复杂时候，一定要记得给组件使用 React.memo 包裹，当props更新的时候才重新渲染页面，这样就能避免不必要的刷新

文章很长，需要花10~15分钟才能看完，认真看完的同学，你真的好厉害，也希望你在 React 的开发者寻找到自己的最佳实践

原文链接： [常见的React初学者错误](https://link.juejin.cn/?target=https%3A%2F%2Fwww.joshwcomeau.com%2Freact%2Fcommon-beginner-mistakes%2F 'https://www.joshwcomeau.com/react/common-beginner-mistakes/')
