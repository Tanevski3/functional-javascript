const pipe /*from "lodash/fp/flow" */ = (...fns) => (x) =>
  fns.reduce((y, f) => f(y), x);
const map = (arr) => (fn) => arr.reduce((p, c) => [...p, fn(c)], []);
const log = console.log;
const section = (title = 'Test', fun = () => {}) =>
  pipe(log(`~~|${title.toUpperCase()}|~~`), fun());
const composeSimple = (f, g) => (x) => f(g(x));
const reduce = (reducer, initial, arr) => {
  let acc = initial;
  for (let i = 0; i < arr.length; i++) {
    acc = reducer(acc, arr[i]);
  }
  return acc;
};
const filter = (fn, arr) =>
  reduce((acc, curr) => (fn(curr) ? acc.concat([curr]) : acc), [], arr);
const compose = (...fns) => (x) => fns.reduceRight((y, f) => f(y), x);
const composeWithReduce = (...fns) => (x) =>
  fns.reverse().reduce((y, f) => f(y), x);
const flip = (fn) => (a) => (b) => fn(b)(a);
const curry = (f, arr = []) => (...args) =>
  ((a) => (a.length === f.length ? f(...a) : curry(f, a)))([...arr, ...args]);
const flatMap = (values, fn) =>
  values
    .map(fn)
    .reduce((acc, curr) => Array.prototype.concat.apply(acc, curr), []);
const trace = (label) => (value) => {
  console.info(`${label}: ${value}`);
  return value;
};
// const composeMap = (...ms) => ms.reduce((f, g) => (x) => g(x).map(f));
// const composePromises = (...ms) => ms.reduce((f, g) => (x) => g(x).then(f));
const composeM = (flatMap) => (...ms) =>
  ms.reduce((f, g) => (x) => g(x)[flatMap](f));

const composePromises = composeM('then');
const composeMap = composeM('map');
const composeFlatMap = composeM('flatMap');
const arrToObj = ([key, value]) => ({ [key]: value });
const withConstructor = (constructor) => (o) => ({
  // create the delegate [[Prototype]]
  __proto__: {
    // add the constructor prop to the new [[Prototype]]
    constructor,
  },
  // mix all o's props into the new object
  ...o,
});
const view = (lens, store) => lens.view(store);
const set = (lens, value, store) => lens.set(value, store);
const over = (lens, f, store) => set(lens, f(view(lens, store)), store);
const uppercase = (x) => x.toUpperCase();

section('Function Composition', () => {
  const g = (n) => n + 1;
  const f = (n) => n * 2;

  const doStuff = (x) => {
    const afterG = g(x);
    const afterF = f(afterG);

    return afterF;
  };

  log(3, doStuff(20));

  //   const wait = (time) =>
  //     new Promise((resolve, reject) => setTimeout(resolve, time));

  //   wait(300)
  //     .then(() => 20)
  //     .then(g)
  //     .then(f)
  //     .then((value) => log(4, 'value after 300 ms: ' + value));

  const doStuffBetter = (x) => f(g(x));
  log(4, doStuffBetter(20));

  const trace = (label) => (value) => {
    log(`${label}: ${value}`);
    return value;
  };

  const doStuffDebug = (x) => {
    const afterG = g(x);
    trace('after g')(afterG);
    const afterF = f(afterG);
    trace('after f')(afterF);
    return afterF;
  };

  doStuffDebug(20);

  const doStuffBetterWithPipe = pipe(g, trace('after g'), f, trace('after f'));

  log(5, doStuffBetterWithPipe(20));

  console.log(5, 'Initials');
  const name = 'Marjan Tanevski';

  const upperCase = (x) => x.toUpperCase();
  const split = (x) => x.split(' ');
  const head = (x) => x[0] + '.';
  const join = (x) => x.join(' ');

  const initials = pipe(upperCase, split, (arr) => map(arr)(head), join);

  log(5, initials(name));
  log(5, name);
});

section('Object Composition', () => {
  const a = {
    a: 'a',
  };

  const b = {
    b: 'b',
  };

  const c = { ...a, ...b };
  log(9, c);
});

section('The Rise and Fall and Rise of Functional Programming', () => {
  const double = (n) => n * 2;
  const inc = (n) => n + 1;

  const transform = composeSimple(double, inc);

  log(14, transform(3));
});

section('Pure Functions', () => {
  // indeterministic factors
  // referrentially transparent

  const addToCart = (cart, item, quantity) => {
    return {
      ...cart,
      items: cart.items.concat([
        {
          item,
          quantity,
        },
      ]),
    };
  };

  const originalCart = {
    items: [],
  };

  const newCart = addToCart(originalCart, {
    name: 'Computer',
    price: '1495',
  });

  log(31, 'originalCart: ' + JSON.stringify(originalCart));
  log(31, 'newCart: ' + JSON.stringify(newCart));
});

section('Functional Programming', () => {
  // indeterministic factors
  // referrentially transparent
  // fp: we express what to do rather than how to do it
  // Pure functions
  // Function composition (combining two or more functions to produce a new function or perform some computation)
  // Avoid shared state*, mutating state, side effects
  // Declarative vs. imperative
  // How: Imperative code frequently utilizes statements
  // What/Data Flow: Declarative code relies more on expressions: 2 * 2, Math.max(1,2), {...a, ...b, ...c}
  /**
   * Functional programming favors:
        • Pure functions over shared state and side effects
        • Immutability over mutable data
        What is Functional Programming? 42
        • Function composition over imperative flow control
        • Generic utilities that act on many data types over object methods that only operate on their
        colocated data
        • Declarative over imperative code (what to do, rather than how to do it)
        • Expressions over statements
   */
});

section('Higher Order Functions', () => {
  const censor = (words) => filter((word) => word.length !== 4, words);
  const censored = censor(['Marjan', 'Filip', 'Tato', 'Mama']);

  log(58, censored);
});

section('Curry and Function composition', () => {
  const add = (a) => (b) => a + b;

  log(59, add(2)(3));

  const inc = add(1);

  log(61, inc(3));

  /**
   * But the real power of curried functions is that they simplify function composition. A function
     can take any number of inputs, but can only return a single output. In order for functions to be
     composable, the output type must align with the expected input type
   */
  const g = (n) => n + 1;
  const f = (n) => n * 2;

  const trace = (label) => (value) => {
    log(68, `${label}: ${value}`);
    return value;
  };

  pipe(g, trace('after g'), f, trace('after f'));
});

section('Abstraction & Composition', () => {
  const map = (f) => (arr) => arr.map(f);

  const f = (n) => n * 2;

  const doubleAll = map(f);

  console.log(75, doubleAll([1, 2, 3]));
});

section('Reduce', () => {
  let gather = compose(
    (x) => x + 1,
    (x) => x * 2
  );

  console.log(77, gather(1));

  gather = composeWithReduce(
    (x) => x + 1,
    (x) => x * 2
  );
  console.log(77, gather(1));
});

section('Functors', () => {
  const map = curry((fn, mappable) => mappable.map(fn));

  const double = (n) => n * 2;

  const mdouble = map(double);

  mdouble([4]).map((x) => log(91, x));
});

// section('Monads', async () => {
//   const echo = (n) => (x) => Array.from({ length: n }).fill(x);

//   // map
//   log(94, [1, 2, 3].map(echo(3)));
//   // monad - type lifting
//   log(94, flatMap([1, 2, 3], echo(3)));

//   const label = 'API call composition';

//   // a => Promise(b)
//   const getUserById = (id) =>
//     id === 3 ? Promise.resolve({ name: 'Kurt', role: 'Author' }) : undefined;
//   // b => Promise(c)
//   const hasPermission = ({ role }) => Promise.resolve(role === 'Author');

//   // Try to compose them. Warning: this will fail.
//   const authUser = compose(hasPermission, getUserById);

//   authUser(3).then(trace(label));

//   const authUserPromise = composePromises(hasPermission, getUserById);

//   await authUserPromise(3).then(trace(label));

//   const Monad = (value) => ({
//     flatMap: (f) => f(value),
//     map(f) {
//       return this.flatMap((a) => Monad.of(f(a)));
//     },
//   });
//   Monad.of = (x) => Monad(x);

//   Monad(21)
//     .map((x) => x * 2)
//     .map((x) => log(100, x));

//   Promise.resolve(21)
//     .then((x) => x * 2)
//     .then((x) => log(100, x));
// });

section('Object Compositions', () => {
  const objs = [{ a: 'a', b: 'ab' }, { b: 'b' }, { c: 'c', b: 'cb' }];

  const assign = (a, b) => ({ ...a, ...b });
  console.log(122, [{ a: 'a' }, { b: 'b' }].reduce(assign));

  // aggregates:
  //• Arrays
  // • Maps
  // • Sets
  // • Graphs
  // • Trees
  //  – DOM nodes (a DOM node may contain child nodes)
  //  – UI components (a component may contain child components)
  // • Composite pattern
  // or when single item share the interface of multiple items

  const collection = (a, e) => a.concat([e]);

  const a = objs.reduce(collection, []);

  log(
    123,
    'collection aggregation',
    a,
    a[1].b,
    a[2].c,
    `enumerable keys: ${Object.keys(a)}`
  );

  const pair = (a, b) => [b, a];

  const l = objs.reduceRight(pair, []);

  log(124, 'linked list aggregation', l, `enumerable keys: ${Object.keys(l)}`);

  const concatenate = (a, o) => ({ ...a, ...o });
  // State reducers (e.g., Redux)
  // Functional mixins

  const c = objs.reduce(concatenate, {});

  log(125, 'concatenation', c, `enumerable keys: ${Object.keys(c)}`);

  const delegate = (a, b) => Object.assign(Object.create(a), b);

  const d = objs.reduceRight(delegate, {});

  log(127, 'delegation', d, `enumerable keys: ${Object.keys(d)}`);

  // delegation { a: 'a', b: 'ab' } enumerable keys: a,b

  log(127, d.b, d.c); // ab c

  // objects are passed as parameters to other objects (dependency injection)
});

section('Factory', () => {
  // Set up some functional mixins
  const withFlying = (o) => {
    let isFlying = false;
    return {
      ...o,
      fly() {
        isFlying = true;
        return this;
      },
      land() {
        isFlying = false;
        return this;
      },
      isFlying: () => isFlying,
    };
  };

  const withBattery = ({ capacity }) => (o) => {
    let percentCharged = 100;
    return {
      ...o,
      draw(percent) {
        const remaining = percentCharged - percent;
        percentCharged = remaining > 0 ? remaining : 0;
        return this;
      },
      getCharge: () => percentCharged,
      getCapacity() {
        return capacity;
      },
    };
  };

  const createDrone = ({ capacity = '3000mAh' }) =>
    pipe(
      withFlying,
      withBattery({ capacity }),
      withConstructor(createDrone)
    )({});

  const myDrone = createDrone({ capacity: '5500mAh' });

  log(
    138,
    `
   can fly: ${myDrone.fly().isFlying() === true}
   can land: ${myDrone.land().isFlying() === false}
   battery capacity: ${myDrone.getCapacity()}
   battery status: ${myDrone.draw(50).getCharge()}%
   battery drained: ${myDrone.draw(75).getCharge()}%
   `
  );

  log(
    138,
    `
   constructor linked: ${myDrone.constructor === createDrone}
   `
  );
});

section('Functional Mixins', () => {
  // Set up some functional mixins
  const withLogging = (logger) => (o) =>
    Object.assign({}, o, {
      log(text = '') {
        logger(text);
      },
    });

  // const withConfig = (config) => (
  //   o = { log: (text = '') => console.log(text) }
  // ) =>
  //   Object.assign({}, o, {
  //     get(key = '') {
  //       return config[key] == ''
  //         ? this.log(`Missing config key: ${key}`)
  //         : config[key];
  //     },
  //   });

  // const createConfig = ({ initialConfig, logger }) =>
  //   pipe(withLogging(logger), withConfig(initialConfig))({});

  const addConfig = (config) => (o) =>
    Object.assign({}, o, {
      get(key) {
        return config[key] == undefined
          ? this.log(`Mising config key: ${key}`)
          : config[key];
      },
    });

  const withConfig = ({ initialConfig, logger }) => (o) =>
    pipe(withLogging(logger), addConfig(initialConfig))(o);

  const createConfig = ({ initialConfig, logger }) =>
    withConfig({ initialConfig, logger })({});

  const initialConfig = {
    host: 'localhost',
  };

  const logger = console.log.bind(console);

  const config = createConfig({ initialConfig, logger });

  log(149, config.get('host'));
  config.get('notThere');
});

section('Why Not Classes', () => {
  const createUser = ({
    userName = 'Anonymous',
    avatar = 'anon.png',
  } = {}) => ({
    userName,
    avatar,
    constructor: createUser,
  });
  createUser.of = createUser;

  // testing .of and .constructor:
  const empty = ({ constructor } = {}) =>
    constructor.of ? constructor.of() : undefined;
  const foo = createUser({ userName: 'Empty', avatar: 'me.png' });

  log(
    152,
    empty(foo), // { avatar: "anon.png", userName: "Anonymous" }
    foo.constructor === createUser.of, // true
    createUser.of === createUser // true
  );
  // better way
  //   const createUser = ({
  //     userName = 'Anonymous',
  //     avatar = 'anon.png',
  //   } = {}) => ({
  //     __proto__: {
  //       constructor: createUser,
  //     },
  //     userName,
  //     avatar,
  //   });
});

section('Composable Custom Data Types', () => {
  const t = (value) => {
    const add = (n) => t(value + n);

    return Object.assign(add, {
      toString: () => `t(${value})`,
      valueOf: () => value,
    });
  };

  // Sugar to kick off the pipeline with an initial value:
  const add = (...fns) => pipe(...fns)(t(0));

  const sum = add(t(2), t(4), t(-1));

  log(171, sum.toString());
});

section('Lenses', () => {
  const lensProp = (prop) => ({
    view: (store) => store[prop],
    set: (value, store) => ({
      ...store,
      [prop]: value,
    }),
  });

  const fooStore = {
    a: 'foo',
    b: 'bar',
  };

  const aLens = lensProp('a');
  const bLens = lensProp('b');

  const a = view(aLens, fooStore);
  const b = view(bLens, fooStore);
  log(171, a, b);

  const bazStore = set(aLens, 'baz', fooStore);

  log(171, view(aLens, bazStore));

  log(172, over(aLens, uppercase, fooStore));

  const id = (x) => x;
  const lens = aLens;
  const a1 = over(lens, id, fooStore);
  const b1 = fooStore;

  log(172, a1, b1);
  log(172, a1 !== b1);
});

section('Transducers', () => {
  const map = (f) => (step) => (a, c) => step(a, f(c));

  const filter = (predicate) => (step) => (a, c) =>
    predicate(c) ? step(a, c) : a;

  const isEven = (n) => n % 2 === 0;
  const double = (n) => n * 2;

  const doubleEvens = compose(filter(isEven), map(double));

  const arrayConcat = (a, c) => a.concat([c]);

  const xform = doubleEvens(arrayConcat);

  const result = [1, 2, 3, 4, 5, 6].reduce(xform, []); // [4, 8, 12]

  log(183, result);

  const transduce = curry((step, initial, xform, foldable) =>
    foldable.reduce(xform(step), initial)
  );
});

section('Mocks', () => {
  const express = () => ({
    get: (url, fn) => fn({}, { send: () => {} }),
    listen: (port, fn) => fn({}),
  });
  const hello = (req, res) => res.send('Hello World!');
  // expectation:
  {
    const expected = 'Hello World!';
    const msg = `should call .send() with ${expected}`;

    const res = {
      send: (actual) => {
        if (actual !== expected) {
          throw new Error(`NOT OK ${msg}`);
        }
        log(221, `OK: ${msg}`);
      },
    };

    hello({}, res);
  }

  const handleListen = (log, port) => () =>
    console.log(221, `Example app listening on port ${port}!`);

  const port = 3000;

  const app = express();

  app.get('/', hello);

  app.listen(port, handleListen(port, log));
});
