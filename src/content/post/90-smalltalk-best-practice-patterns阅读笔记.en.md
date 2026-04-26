---
title: "Reading Notes on Smalltalk Best Practice Patterns"
publishDate: "2025-12-07T16:33:08Z"
updatedDate: "2025-12-07T16:52:11Z"
tags: ["读书笔记"]
description: "Hi everyone, I'm luckySnail, and I'd like to share a great book on object-oriented programming: \"Smalltalk Best Practice Patterns\". This book distills object-oriented design and coding patterns from the Smalltalk programming language, but it's applicable to other languages as well.\n\nThe author of this book is Kent Beck, a renowned American software engineer and writer, and an important figure in the field of software development."
---

Hi everyone, I'm luckySnail, sharing a great book on object-oriented programming: *Smalltalk Best Practice Patterns*. This book distills object-oriented design and coding patterns from the **Smalltalk** programming language, but they apply to other languages as well.

The author of this book is **Kent Beck**, a renowned American software engineer, author, and one of the key pioneers in software development. Born in Silicon Valley, his father was an electrical engineer. Influenced by his family environment, he pursued a career in computing and earned a master's degree in computer science. He is one of the **fathers of Agile development**, inventor of **TDD (Test-Driven Development)**, founder of **Extreme Programming (XP)**, and also served as an engineering coach at Facebook (Meta). He proposed the influential idea: **Code is a liability** – code is a liability.

Below I'll first summarize the programming essence from the book, then share some excerpts.

> The original book uses Smalltalk; here I've translated patterns into JavaScript.

## Programming Tips

#### 1. Core Mindset: Code is written for teammates (and your future self)

- **Once and Only Once (DRY - Don't Repeat Yourself):**
    If you see copy-pasted code in two functions, extract it.
    - *JS Practice:* Use modules (`import/export`) to extract common utility functions, or extract parent classes / composition logic.
- **Lots of Little Pieces:**
    Don't write a "god function" with hundreds of lines. Break large functions into many small, single-purpose functions.
    - *JS Practice:* Don't cram too much logic into one file; use ES Modules to split files.
- **Intention over Implementation:**
    Function names should tell the caller *what it does*, not *how it does it*.
    - *Bad:* `processUserArrayLoop()` (describes implementation details)
    - *Good:* `notifyActiveUsers()` (describes business intent)
#### 2. Function Design: Make logic flow like prose
- **Composed Method:**
    A top-level business function should act like a "table of contents." It only calls other step functions and should not contain specific `for` loops or complex `if` details.
```javascript
        // Bad
        async function checkout(cart) {
          if (cart.length === 0) return;
          let total = 0;
          for (const item of cart) { total += item.price; }
          await api.charge(total);
          // ... dozens of lines of code
        }
        
        // Good (Composed Method)
        async function checkout(cart) {
          if (isEmpty(cart)) return; // Guard Clause
          const total = calculateTotal(cart);
          await chargeCustomer(total);
          await emailReceipt(cart);
        }
```
        
- **Complete Creation Method:**
    Don't create an "empty object" and let the caller fill data line by line. Provide a factory function or constructor that takes all necessary parameters at once and returns a ready-to-use object.
    - *JS Practice:* Use factory functions or a class constructor.
    - *Example:* `const user = User.createValidUser(name, email);` instead of `const u = new User(); u.name = ...;`
#### 3. Logic Control: Say goodbye to callback hell and nesting
- **Guard Clause:**
    Don't wrap main logic in deeply nested `if` blocks. If a condition is not met (e.g., parameters are empty or an error occurs) at the beginning of a function, `return` early.
```javascript
        // Bad
        function process(user) {
          if (user) {
            if (user.isActive) {
              // do something...
            }
          }
        }
        
        // Good
        function process(user) {
          if (!user || !user.isActive) return;
          // do something...
        }
```
- **Polymorphism over Switch:**
    If you find yourself writing a `switch (type)` or many `if (type === 'A')`, try using polymorphism or the strategy pattern with an object.
    - *JS Practice:* Use an object literal map instead of a switch.
    - *Example:*
```javascript
        const handlers = {
          'A': handleTypeA,
          'B': handleTypeB
        };
        const run = handlers[type] || defaultHandler;
        run();
```
#### 4. Variable Usage: Let data speak
- **Explaining Temporary Variable:**
    If an `if` condition has a long chain of `&&` and `||`, assign it to a boolean variable and use the variable name to explain the condition.
    - *JS Example:*
```javascript
// Bad
if (platform.toUpperCase().indexOf('MAC') > -1 && browser.type === 'Chrome' && version > 80) { ... }
// Good
const isModernMacChrome = /* ... */;
if (isModernMacChrome) { ... }
```
- **Role Suggesting Name:**
    Variable names should indicate their role in the current context. This is especially important in JavaScript, a dynamically typed language.
    - *Bad:* `const arr = []` (just says the type)
    - *Good:* `const activeUsers = []` (says the role)
#### 5. Array Operations: Ditch for loops
One of Smalltalk's proudest features is collection operations, which correspond to modern JavaScript's Array methods. Whenever possible, use higher-order functions instead of manual loops.
- **Enumeration:**
    - Smalltalk: `do:` -> JavaScript: `.forEach()` or `for...of` (for side effects).
- **Transformation:**
    - Smalltalk: `collect:` -> JavaScript: `.map()`.
    - *Scenario:* Convert a list of user objects into a list of user IDs.
- **Filtering:**
    - Smalltalk: `select:` / `reject:` -> JavaScript: `.filter()`.
    - *Scenario:* Keep only users who are adults.
- **Searching:**
    - Smalltalk: `detect:` -> JavaScript: `.find()`.
    - *Scenario:* Find the first person named "Admin" in a list.
- **Reduction:**
    - Smalltalk: `inject:into:` -> JavaScript: `.reduce()`.
    - *Scenario:* Calculate the total amount of a shopping cart.
- **Emptiness:**
    - Smalltalk: `isEmpty` -> JavaScript: Wrap a utility function `isEmpty(arr)` or encapsulate the `.length === 0` check in a domain object. Don't scatter `.length === 0` checks all over the code; the semantics are not intuitive.

Below are advanced patterns for **object interaction, state management, and code organization**. These patterns are very useful when building complex JavaScript applications (especially with OOP-style code in React, Vue, or Node.js).
#### 1. Execute Around Method
**Core idea:**
When a pair of operations must appear together (e.g., "open/close", "begin/end", "lock/unlock"), don't force the caller to manually manage both steps — they might forget the second step. Provide a method that takes a function as a parameter and automatically handles the "cleanup" work inside.
**JavaScript Practice:**
Use JavaScript's higher-order functions to encapsulate this pattern.
- **Bad (prone to resource leaks):**
 ```javascript
    const db = new DatabaseConnection();
    await db.open();
    try {
      await db.query('SELECT * ...');
      // If an error occurs here, close() might never be called, or you'd need to write a repetitive finally
    } finally {
      await db.close();
    }
```    
- **Good (Execute Around):**
```javascript
    // Define this general pattern in a class
    class Database {
      // Takes a block (function)
      async execute(action) {
        const connection = await this.open();
        try {
          return await action(connection); // Execute the passed logic
        } finally {
          await this.close(); // Guarantee cleanup
        }
      }
    }
    
    // The caller's code becomes extremely clean
    await db.execute(async (conn) => {
      await conn.query('SELECT * ...');
    });
```
#### 2. Pluggable Behavior
**Core idea:**
When some logic in an object needs to vary, don't write a bunch of subclasses or complex switch statements. You can store a variable inside the object that holds a function or strategy object. When that logic needs to be executed, simply call that variable.
This is the "strategy pattern" or simple "callback injection."
- **Bad (hardcoded logic):**
```javascript
    class Button {
      onClick() {
        if (this.type === 'submit') { this.submitForm(); }
        else if (this.type === 'reset') { this.resetForm(); }
      }
    }
```
- **Good (Pluggable Selector / Block):**
```javascript
    class Button {
      constructor(action) {
        this.action = action; // Store a function
      }
    
      onClick() {
        // Execute the stored behavior directly; Button doesn't need to know the specific business logic
        if (this.action) this.action();
      }
    }
    
    // "Plug in" behavior when using
    const submitBtn = new Button(() => form.submit());
    const logBtn = new Button(() => console.log('Clicked'));
```

#### 3. Delegation over Inheritance
**Core idea:**
If you want to reuse code from another class but don't want to inherit from it (because you don't need all its methods or you already inherit from another class), store an instance of that class as a property of your own, then "delegate" tasks to it.
Composition over Inheritance.
- **Scenario**: You have a `UserList` class and want it to have some array functionality (like `filter`), but you don't want to inherit from `Array`.
- **JS Example**:
```javascript
class UserList {
   constructor() {
     this.users = []; // Hold an array internally (Common State)
   }
   add(user) {
    // Simple Delegation: directly tell the internal users to do it
      this.users.push(user);
    }
   // You can add your own logic before/after delegation
   filterActive() {
     return this.users.filter(u => u.isActive);
    }
}
```

#### 4. Indirect Variable Access
**Core idea:**
Even inside a class, should you directly access a property (e.g., `this.count`) or use a getter method (e.g., `this.getCount()`)?
The book's suggestion: for flexibility, prefer indirect access (i.e., getters/setters). This way, if you later want to change "directly reading a variable" to "lazy initialization," you only need to modify the getter in one place, not every reference point in the class.

- **Direct Access (simple but rigid):**
```javascript
class Circle {
  constructor(radius) {
    this.radius = radius;
  }
  area() {
    // If `radius` later becomes computed, this line has to change too
    return Math.PI * (this.radius * this.radius);
  }
}
```

- **Indirect Access (flexible):**
```javascript
class Circle {
  constructor(radius) {
    this._radius = radius;
  }

  // Getter Method
  get radius() {
    return this._radius;
  }

  area() {
    // Use the getter, not this._radius directly
    return Math.PI * (this.radius * this.radius);
  }
}
```

**Guidance:** When you use the `get` keyword in JS, you are practicing this pattern. It allows you to add logging, validation, or lazy loading to `radius` in the future without breaking the `area()` method.

#### 5. Converter Method
**Core idea:**
If you need to convert an object to another format, provide a method that starts with `as`. This makes the intent of conversion very clear.
In JS, we often have `toJSON`, `toString`, `toArray`, etc.
- **JS Example**:
```javascript
class User {
  // ... properties include id, name, passwordHash ...

  // Converter Method
  asDTO() {
    // Return a new object containing only the data needed by the frontend
    return {
      id: this.id,
      name: this.name
    };
  }
}

// Usage
res.json(user.asDTO());
```

#### 6. Cascade / Chaining
**Core idea:**
If you need to send multiple messages (call multiple methods) to the same object consecutively, use a specific format or design to avoid repeating the receiver's name.
In JS, this is usually done by making methods `return this` (Fluent Interface).
- **Bad (repeating receiver):**
```javascript
const config = new Config();
config.setUrl('http://api.com');
config.setTimeout(5000);
config.setRetries(3);
```
- **Good (Cascade / Chaining):**
```javascript
class Config {
  setUrl(url) {
    this.url = url;
    return this; // Interesting Return Value: return self
  }
  setTimeout(time) {
    this.timeout = time;
    return this;
  }
  // ...
}

// Usage
const config = new Config()
  .setUrl('http://api.com')
  .setTimeout(5000)
  .setRetries(3);
```
#### 7. Lookup Cache
**Core idea:**
If you have a computation or lookup process that is very time-consuming (e.g., `detect` or `select`) and the data doesn't change frequently, use a Dictionary (in JS, a `Map` or object) as a cache. On read, first check the cache; if not present, compute and store.
**JavaScript Practice:**
Simple memoization.
```javascript
class ProductService {
  constructor() {
    this.products = [...]; // Assume lots of data
    this.cache = new Map(); // Lookup Cache
  }

  getProduct(id) {
    // If in cache, return directly
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }
    // Complex lookup logic
    const product = this.products.find(p => p.id === id);

    // Store in cache
    this.cache.set(id, product);
    return product;
  }
}
```

The following patterns cover everything from micro-level code formatting to macro-level object interaction design.
### 1. Behavior & Messages
This section is about how objects communicate elegantly.
- **Decomposing Message:**
    - When you have a complex task, don't write a long block of code directly. Send a message to yourself (`self`) to break the task into smaller steps. This is like splitting a large program into subroutines, which helps clarify thinking.
- **Send Back:**
    - When you delegate a task to another object, if that object needs some of your information, it will send a message back to you. Don't fear this back-and-forth; it's normal collaboration between objects.
- **Extending vs. Modifying Super:**
    - **Extending:** If you want to add functionality on top of a parent class, override the method and call `super` inside it.
    - **Modifying:** If you want to change the parent class's behavior, you can still override it, but not calling `super` or calling it in a specific position means you've altered the original logic flow.
- **Collecting Parameter:**
    - If you need to collect results from multiple methods (e.g., traversing a tree and collecting all nodes), don't have each method return a collection and then merge them. Instead, create a collection object and pass it as a parameter to all methods; let them add their results into it.
#### 2. State & Variables
This section is about handling object data.
- **Creation Parameter Method:**
    - **Guidance:** When initializing an object and you need to set multiple variables, don't write a bunch of `setX:`, `setY:` methods. Create a single method (e.g., `setX:y:`) that sets all related variables at once, and use that opportunity to perform initialization checks.
- **Default Value Method:**
    - **Guidance:** If a variable has a default value, don't hard-code that value in the initialization method. Create a dedicated method (e.g., `defaultColor`) that returns the value. This allows subclasses to easily change the default by overriding this small method.
- **Constant Method:**
    - **Guidance:** Avoid global constant pools. If a class needs a constant (e.g., π or a fixed configuration value), write a method that returns that value.
- **Boolean Property Setting Method:**
    - For boolean properties (like a toggle), don't just provide `setSwitch: true/false`. Provide more semantic methods like `turnOn` and `turnOff`, or `makeVisible` / `makeInvisible`.
- **Reusing Temporary Variables:**
    - **Guidance:** Usually we want to avoid reusing variables, but if you are dealing with state that changes on each read (like a stream) or expressions with side effects, store the result in a temporary variable so you can reuse it later without re-executing the side effect.
#### 3. Advanced Collection Usage
Beyond basic iteration, the book introduces some specific collection patterns.
- **Stack & Queue:**
    - **Guidance:** Smalltalk (and many modern language standard libraries) doesn't have a dedicated Stack class. Use `OrderedCollection` (or an array/list) to simulate them.
        - **Stack:** `addLast:` (push), `removeLast` (pop).
        - **Queue:** `addLast:` (enqueue), `removeFirst` (dequeue).
- **Parsing Stream:**
    - **Guidance:** If you are writing a parser, don't pass the stream object as a parameter between every method. Store the stream as an instance variable in the parser object, so all methods can share the current parsing position.
- **Concatenating Stream:**
    - **Guidance:** When you need to concatenate many strings or collections, don't repeatedly use `+` or `,` (concatenation operators), as this creates many intermediate garbage objects. Use a `Stream` (in JS, similar to a `StringBuilder` or `Array.join`) to build the result efficiently.
- **Searching Literal:**
    - **Guidance:** If you need to check whether a value is one of several specific values (e.g., `isVowel`), don't write a long chain of `if (a == 'a' || a == 'e' ...)`. Create a collection (literal array) containing those values and ask it `includes:`.
        - *Example:* `^#('a' 'e' 'i' 'o' 'u') includes: aChar`.

#### 4. Formatting
This section is about making code visually more readable.
- **Inline Message Pattern:**
    - **Guidance:** To save vertical space, try to keep method parameter definitions on one line rather than one per line (unless there are many parameters). Let the reader see the method body at a glance.
- **Type Suggesting Parameter Name:**
    - **Guidance:** Parameter names should hint at their type. For example, `at: index` suggests the index is an integer, `at: key` suggests the key could be any object. Use naming styles like `aString`, `anInteger`.
- **Rectangular Block:**
    - **Guidance:** For closures (Block/Lambda), if the content is simple, put it on one line. If complex, use indentation to make it look like a rectangle, so the eye can quickly identify the scope of the code block.
- **Conditional Expression:**
    - **Guidance:** Leverage the fact that control structures (like if-else) return values.
        - *Bad:* `if (test) { return 1; } else { return 2; }`
        - *Good:* `return test ? 1 : 2;` (or in Smalltalk, directly return the result of the if expression). The intent is "return one of two values," not "execute one of two paths."
- **Yourself:**
    - **Guidance:** When you use cascade messages (chaining) to configure an object, and the last method returns something other than the object itself, but you need the object, append `yourself` (returns `self`) at the end. This ensures the whole expression evaluates to the object you are configuring.
- **Interesting Return Value:**
    - **Guidance:** Only explicitly return a value if the caller actually needs it. Otherwise, return the object itself (in Smalltalk) or `void`, so the caller doesn't have to guess the meaning of the return value.

Together, these patterns form a complete coding philosophy: **Clarity** over **Efficiency** (unless there is a performance bottleneck), **Communication** over **Brevity.**

## Original Excerpts

1)
“All bottlenecks in software development ultimately stem from the limitations of human communication.”

Original: "The bottlenecks throughout development come from limitations in human communication."

2)
The secret of programming experts often lies in the simple habits that beginners tend to overlook.

Original: "This book is about the simple things experienced, successful Smalltalkers do that beginners don't."

3)
Coding is the process of waking your fuzzy, comfortable ideas in the harsh dawn of reality.

Original: "Coding is where your fuzzy comfortable ideas awaken in the harsh dawn of reality."

4)
Code doesn't lie. If you're not listening, you won't hear the truths it tells.

Original: "Code doesn't lie. If you're not listening, you won't hear the truths it tells."

5)
You have to think about how someone will read your code, not just how a computer will interpret it.

Original: "You have to think about how someone will read your code, not just how a computer will interpret it."

6)
Patterns are a literary form for capturing and transmitting common practice.

Original: "Patterns are a literary form for capturing and transmitting common practice."

7)
No other topic generates more heat and less light than code formatting.

Original: "No other topic generates more heat and less light than code formatting."

8)
In a program written with good style everything is said once and only once.

Original: "In a program written with good style everything is said once and only once."

9)
Don't put two rates of change together.

Original: "Don't put two rates of change together."

10)
Divide your program into methods that perform one identifiable task.

Original: "Divide your program into methods that perform one identifiable task."

11)
Any use of `super` reduces the flexibility of the resulting code.

Original: "Any use of super reduces the flexibility of the resulting code."

12)
You’re creating a vocabulary, not writing a program. Be a poet for a moment.

Original: "You’re creating a vocabulary, not writing a program. Be a poet for a moment."

13)
Behavior is the more important to get right... No longer is your system a slave of its representation.

Original: "Behavior is the more important to get right... No longer is your system a slave of its representation."

14)
Instance variables... say, once and for all and out in the open, 'here's what I'm modeling with this object'.

Original: "Instance variables... say, once and for all and out in the open, 'here's what I'm modeling with this object'."

15)
If... all of a sudden your program gets balky... it's talking. It's telling you there is something important missing.

Original: "If... all of a sudden your program gets balky... it's talking. It's telling you there is something important missing."

16)
Some of the biggest improvements come from figuring out how to eliminate:
- Duplicate code (even little bits of it)
- Conditional logic
- Complex methods
- Structural code, where one object treats another as a data structure

*Original:* Some of the biggest improvements come from figuring out how to eliminate:
- Duplicate code (even little bits of it)
- Conditional logic
- Complex methods
- Structural code, where one object treats another as a data structure

17)
Messages take time... If all you were worried about was how fast your program would run, you would arrange all of your code in a single method. This radical approach to performance tuning invokes enormous human costs, and ignores the realities of performance tuning well-structured code, which often results in several order-of-magnitude improvements.

*Original:* "Messages take time... If all you were worried about was how fast your program would run, you would arrange all of your code in a single method. This radical approach to performance tuning invokes enormous human costs, and ignores the realities of performance tuning well-structured code, which often results in several order-of-magnitude improvements."

## References

1.  Original book: http://stephane.ducasse.free.fr/FreeBooks/BestSmalltalkPractices/Draft-Smalltalk%20Best%20Practice%20Patterns%20Kent%20Beck.pdf
2.  Chinese version: https://aistudio.google.com/app/prompts/1VR1QBKwZgJ549pr-AX3fvxuO9jsH7JbC
3.  notebookLM analysis: https://notebooklm.google.com/notebook/ca2d4c1c-c427-4daa-a750-df4988b2e3ab
