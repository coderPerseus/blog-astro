---
title: "Ten Common Mistakes React Beginners Make"
publishDate: "2023-06-27T00:00:00.000Z"
tags: ["React","bug"]
description: "Introduces common problems encountered by newcomers to React when writing code, and provides solutions."
---

This is a share from a front-end developer I follow — excellent content that deserves to be seen by more people. The original is in English, and I’ve translated it. Hope it helps React developers.

During recent development, when dealing with complex state management and side effects, I often fail to think through all possible scenarios, leading to some inexplicable bugs. If you’re in the same boat, read on — you’ll definitely gain something new. Here’s the main content:

“A few years ago, I taught React at a local coding bootcamp, and I noticed a few things that caught students off guard. People kept falling into the same pitfalls! In this tutorial, we’ll explore 8 of the most common traps. You’ll learn how to work around them, and hopefully avoid a lot of frustration. To keep this blog post light and flowing, we won’t dive too deep into the reasons behind these traps. This is more of a quick reference. Let’s look at the common issues!

> ##### Target Audience
>
> This article is for developers who already have a basic understanding of React but are still in the early stages of their learning journey.

### 1\. Using 0 as a condition

OK, let’s start with one of the most common traps. I’ve actually encountered this in production apps!

Check out the following code:

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

Our goal is to conditionally display a shopping list. If there’s at least one item in the array, we should render a `ShoppingList` element. Otherwise, we shouldn’t render anything. **However, we end up seeing a stray `0` in the UI!**

This happens because `items.length` evaluates to `0`. Since `0` is a falsy value in JavaScript, the `&&` operator short-circuits, and the entire expression resolves to `0`. It’s effectively like we did this:

```
function App() {
  return (
    <div>
      {0}
    </div>
  );
}

```

Unlike other falsy values (like `''`, `null`, `false`, etc.), the number `0` is a valid value in JSX. After all, in many cases we do want to print the number `0`!

**How to fix it:** Our expression should use a “pure” boolean (true/false):

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

`items.length > 0` will always evaluate to `true` or `false`, so we’ll never have any issues. Alternatively, we could use a ternary expression:

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

Both options are perfectly valid — it’s a matter of **personal taste**.

### 2\. Incorrectly mutating state

Let’s continue with our shopping list example. Suppose we can add new items:

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

You’ll see this:

![image-20230623130414761](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/3bf4b338ff594eeeb865752f4f9daf31~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

Whenever a user submits a new item, the `handleAddItem` function is called. Unfortunately, it doesn’t work correctly right now! When we type an item and submit the form, the item doesn’t get added to the shopping list.

**The problem** is that we’ve violated one of the most important rules in React: we mutated the **state** value. Specifically, the issue is this line:

```
// app.js
function handleAddItem(value) {
  items.push(value);
  setItems(items);
}

```

React relies on the **identity of state variables** (i.e., the useState hooks here) to determine when state has changed. When we push an item into the array, we don’t change the array’s identity, so React can’t tell that the value has changed.

**How to fix it:** We need to create a brand-new array. Here’s how I do it:

```
// app.js
function handleAddItem(value) {
  const nextItems = [...items, value]; // If you've seen my previous posts, this also follows React's immutability principle
  setItems(nextItems);
}

```

Instead of mutating the existing array, I choose to create a new array from scratch. This new array contains all the same items as the original (thanks to the spread syntax `...`) plus the new item. The difference here is **mutating an existing item** vs. **creating a new item**. When we pass a value to a **state setter function** like `setCount`, it needs to be a **new entity**. The same applies to **objects**:

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

Basically, the `...` syntax is a way to copy/paste everything from an array/object into a brand-new entity. This ensures everything works correctly.

### 3\. Not providing keys

Here’s a warning you’ve probably seen before:

> Warning: Each child in a list should have a unique "key" prop.

This error most commonly occurs when mapping over data. Here’s an example that violates this rule:

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

You’ll see:

![image-20230623132957917](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/bac5be80c2d04ca3a30266874079e80a~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

Whenever we render an array of elements, we need to give React extra context so it can identify each item. The key point is that this identifier needs to be unique. Many online resources suggest using the array index to solve this:

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

I don’t think this is good advice. This approach sometimes works, but it can cause serious problems in other situations. As you gain a deeper understanding of how React works, you’ll be able to judge on a case-by-case basis whether this approach is safe, but honestly, I think it’s easier to solve it in a way that’s always safe. That way, you don’t have to worry about it!

**Here’s the plan:** Whenever we add a new item to the list, we’ll generate a unique ID for it:

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

`crypto.randomUUID` is a built-in browser method (it’s not a third-party package). It’s available in all major browsers. It has nothing to do with cryptocurrency. This method generates a unique string like `d9bb3c4c-0459-48b9-a94c-7ca3963f7bd0`. By generating an ID on the fly when the user submits the form, we ensure every item in the shopping list has a unique ID. Here’s how to apply it as a key:

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

Importantly, we want to generate the ID when the state is updated, not like this:

```
// ❌ This is a bad idea
<li key={crypto.randomUUID()}>
  {item.label}
</li>

```

Generating it in JSX like that would cause the key to change **on every render**. When keys change, React will destroy and recreate those elements, which can have a **significant negative impact on performance**. This pattern — generating keys when data is created — can be applied in many scenarios. For example, here’s how I create unique IDs when fetching data from a server:

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

### 4\. Missing whitespace

This is a confusing issue I often see online.

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

You’ll see: ![image-20230623133756836](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/24ad0c9df1d14578b7edb81c0b88607a~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

Notice the two sentences are merged together:

![image-20230623133859746](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/d199f5422dc04f3099300fb8a46e56de~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

This is because **the JSX compiler** (the tool that transforms our JSX into JavaScript for the browser) **can’t really distinguish between syntactical whitespace and the whitespace we add for indentation/code readability**.

**How to fix it:** We need to add an **explicit space character** between the text and the anchor tag:

```
<p>
  Welcome to Corpitech.com!
  {' '}
  <a href="/login">Log in to continue</a>
</p>

```

A little pro tip: If you use `Prettier`, it will automatically add these space characters for you! Just make sure to let it format (don’t split the content into multiple lines prematurely).

> Why doesn’t the React team fix this?
>
> When I first learned about this workaround, I also thought it was messy. Why can’t the React team fix it so it works as we expect?! I later realized there is no perfect solution. If React started treating indentation as syntactical whitespace, it would solve this problem but introduce a whole host of other issues. Ultimately, even though it looks clumsy, I think it was the right decision. It’s the least bad option!

### 5\. Accessing state immediately after updating it

This one catches everyone off guard at some point. When I taught at a local coding bootcamp, I lost count of how many people came to me with this problem. Here’s a simple counter app: clicking the button increments the count. See if you can spot the issue:

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

You’ll see:

![image-20230623134419724](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/dba119edd43b4c6b815cc6f970ced7d5~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

After incrementing the count state variable, we log its value to the console. Strangely, it logs the wrong value:

![image-20230623134525645](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/f63ae0958c8748dfb21f089eb9903445~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

The problem is here: **State setter functions in React (e.g., setCount) are asynchronous.** The problematic code is this:

```
function handleClick() {
  setCount(count + 1);
  console.log({ count });
}

```

It’s easy to mistakenly think that the setCount function is like an assignment, as if we were doing:

```
count = count + 1;
console.log({ count });

```

But React isn’t built that way. When we call setCount, we’re not reassigning a variable; we’re scheduling an update.

It might take a while to fully grasp this concept, but this explanation might help: We can’t reassign the `count` variable because it’s a constant!

```
// Uses `const`, not `let`, and so it can't be reassigned
const [count, setCount] = React.useState(0);
count = count + 1; // Uncaught TypeError:
                   // Assignment to constant variable

```

So how should we fix this? Fortunately, we already know what the new value should be. We need to store it in a variable so we can access it:

```
function handleClick() { // Once again, demonstrating the importance of immutability, using a new variable to hold the latest state
  const nextCount = count + 1;
  setCount(nextCount);
  // Use `nextCount` whenever we want
  // to reference the new value:
  console.log({ nextCount });
}

```

I like using the “next” prefix in these cases (like nextCount, nextItems, nextEmail, etc.). It makes it clearer to me that we’re not updating the current value, but scheduling the next value.

### 6\. Returning multiple elements

Sometimes a component needs to return multiple top-level elements. For example:

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

You’ll see:

![image-20230623135153465](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/cadab96d750449c6bf52be148e09b3d4~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

We want our `LabeledInput` component to return two elements: a `<label>` and an `<input>`. Frustratingly, we get an error:

![image-20230623135238318](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/b802f8d28d4f48d19710a90aa35820cb~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

This is because JSX compiles into plain JavaScript. Here’s what this code looks like when it runs in the browser:

```
function LabeledInput({ id, label, ...delegated }) {
  return (
    React.createElement('label', { htmlFor: id }, label)
    React.createElement('input', { id: id, ...delegated })
  );
}

```

In JavaScript, we can’t return multiple values like this. That’s also why this doesn’t work:

```
function addTwoNumbers(a, b) {
  return (
    "the answer is"
    a + b
  );
}

```

How do we fix it? For a long time, the standard approach was to wrap the two elements in a wrapper tag like `<div>`:

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

By wrapping `<label>` and `<input>` in a `<div>`, we only return one top-level element! Here’s what it looks like in plain JavaScript:

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

JSX is a great abstraction, but it often conceals fundamental truths about JavaScript. I think it’s often helpful to look at how JSX is converted to plain JavaScript to understand what’s actually happening. With this new approach, we return a single element that contains two children. Problem solved! But we can improve this solution further using fragments:

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

`React.Fragment` is a React component specifically designed to solve this problem. It allows us to bundle multiple top-level elements together without affecting the DOM. This is great: it means we don’t add unnecessary `<div>`s to our markup. It also has a convenient shorthand, where we can write fragments like this:

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

I love the symbolism here: the React team chose to use an empty HTML tag `<>` to indicate that fragments don’t produce any actual markup.

### 7\. Going from uncontrolled to controlled state

Let’s look at a typical form example, binding an input to React state:

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

You’ll see:

![image-20230623140328986](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/82b13e18fb9a4749a83c20c557b3449c~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

If you start typing in this input, you’ll notice a warning in the console:

![image-20230623140357471](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/78399c44527746348f9be53bcfab3cd2~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

The fix is simple: we need to initialize the `email` state to an empty string:

```
const [email, setEmail] = React.useState('');

```

When we set the `value` prop, we tell React we want this to be a controlled input. But this only works if we pass a defined value! By initializing `email` to an empty string, **we ensure that `value` is never set to `undefined`**.

> Controlled inputs
>
> If you want to know more about why this is necessary and what “controlled inputs” are, I dive into these ideas in my recent tutorial: [Data Binding in React](https://www.joshwcomeau.com/react/data-binding/)

### 8\. Async effect functions

Suppose we have a function that fetches some user data from an API on mount. We’ll use the `useEffect` hook and want to use the `await` keyword. Here’s my first attempt:

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

You’ll see:

![image-20230623141348771](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/21cd98d1e5e442508154784aa3064191~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

Unfortunately, we get an error:

![image-20230623141402587](https://blog-1304565468.cos.ap-shanghai.myqcloud.com/work/64ca8115286e48bfa8a83db139c63246~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

**Here’s the fix:** We need to create a separate async function inside the effect:

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

To understand why this workaround is needed, it’s worth considering what the `async` keyword actually does. For example, what do you think this function returns?

```
async function greeting() {
  return "Hello world!";
}

```

At first glance, it seems obvious: it returns the string `"Hello world!"`! But actually, this function returns a Promise. That Promise resolves to the string `"Hello world!"`. This is a problem because the `useEffect` hook doesn’t expect us to return a Promise! It expects us to return either nothing (like we do in our example above) or a cleanup function. Cleanup functions are far beyond the scope of this tutorial, but they’re very important. Most effects have some teardown logic, and we need to provide it to React as soon as possible so React can call it **when dependencies change or the component unmounts**. By using the “separate async function” strategy, we can still immediately return a cleanup function:

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

You can name this function whatever you like, but I prefer to use the generic name `runEffect`. It clearly indicates that it contains the main effect logic.

### 9\. Building intuition (Experience)

At first, many of the fixes we’ve seen in this tutorial might seem quite arbitrary. Why do we need to provide a unique key? Why can’t we access state right after changing it? Why is useEffect so tricky?

React has always been a bit tricky, especially now with hooks. It takes a while to understand everything. I started using React in 2015, and I remember thinking, “This is so cool, but I have no idea how it works.” 😅 Since then, I’ve gradually built my mental model of React, piece by piece. I’ve had a series of “aha” moments, each one making my mental model more solid and complete. I began to understand why React works the way it does. I found that I didn’t have to memorize arbitrary rules; instead, I could rely on my intuition. It’s hard to describe, but React has become much more fun for me!

Over the past year, I’ve been working on an interactive self-paced online course called “The Joy of React”. It’s a beginner-friendly course designed to help you build an intuition for how React works so you can build rich, dynamic web applications with it. My course is different from others; you won’t sit there watching me code for hours. “The Joy of React” combines many different media: videos, interactive articles, challenge exercises, real-world-inspired projects, and even a mini-game or two.

“The Joy of React” will be released in a few months. You can learn more on the course homepage and sign up for updates: [The Joy of React](https://www.joyofreact.com/)

END

I’d like to add two issues I’ve encountered recently during development:

0. First, the async nature of `useState`. After calling `setState`, if you try to read the state immediately, you might not get the latest value. It’s really frustrating.
1. Second, in React, if you need to immediately get the latest value, you can use `useRef` for synchronous access, but it won’t trigger a UI update. So remember to use state to trigger page UI updates.
2. When dealing with list data and complex page rendering, always remember to wrap components with `React.memo`. This ensures they only re-render when their props change, avoiding unnecessary re-renders.

This article is quite long; it takes about 10–15 minutes to read through. If you’ve read it all carefully, you’re really impressive. Hope you find your own best practices as a React developer.

Original article: [Common Beginner Mistakes in React](https://www.joshwcomeau.com/react/common-beginner-mistakes/)
