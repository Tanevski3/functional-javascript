// var a = {
//   index: 1,
// };

// // later
// console.log(a); // ??

// // even later
// a.index++;
const foo = function () {
  console.log('B');
};
// a utility for timing out a Promise
function timeoutPromise(delay) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject('Timeout!');
    }, delay);
  });
}

// setup a timeout for `foo()`
Promise.race([
  foo(), // attempt `foo()`
  timeoutPromise(3000), // give it 3 seconds
]).then(
  function () {
    // `foo(..)` fulfilled in time!
  },
  function (err) {
    // either `foo()` rejected, or it just
    // didn't finish in time, so inspect
    // `err` to know which
  }
);
function undefer(promise) {
  promise.catch(function onRejected(reason) {
    throw reason;
  });
}
var p = Promise.reject('Oops');

// polyfill-safe guard check
if (!Promise.first) {
  Promise.first = function (prs) {
    return new Promise(function (resolve, reject) {
      // loop through all promises
      prs.forEach(function (pr) {
        // normalize the value
        Promise.resolve(pr)
          // whichever one fulfills first wins, and
          // gets to resolve the main promise
          .then(resolve);
      });
    });
  };
}

// polyfill-safe guard check
if (!Promise.observe) {
  Promise.observe = function (pr, cb) {
    // side-observe `pr`'s resolution
    pr.then(
      function fulfilled(msg) {
        // schedule callback async (as Job)
        Promise.resolve(msg).then(cb);
      },
      function rejected(err) {
        // schedule callback async (as Job)
        Promise.resolve(err).then(cb);
      }
    );

    // return original promise
    return pr;
  };
}

if (!Promise.map) {
  Promise.map = function (vals, cb) {
    // new promise that waits for all mapped promises
    return Promise.all(
      // note: regular array `map(..)`, turns
      // the array of values into an array of
      // promises
      vals.map(function (val) {
        // replace `val` with a new promise that
        // resolves after `val` is async mapped
        return new Promise(function (resolve) {
          cb(val, resolve);
        });
      })
    );
  };
}

// polyfill-safe guard check
if (!Promise.wrap) {
  Promise.wrap = function (fn) {
    return function () {
      var args = [].slice.call(arguments);

      return new Promise(function (resolve, reject) {
        fn.apply(
          null,
          args.concat(function (err, v) {
            if (err) {
              reject(err);
            } else {
              resolve(v);
            }
          })
        );
      });
    };
  };
}

// thanks to Benjamin Gruenbaum (@benjamingr on GitHub) for
// big improvements here!
function run(gen) {
  var args = [].slice.call(arguments, 1),
    it;

  // initialize the generator in the current context
  it = gen.apply(this, args);

  // return a promise for the generator completing
  return Promise.resolve().then(function handleNext(value) {
    // run to the next yielded value
    var next = it.next(value);

    return (function handleResult(next) {
      // generator has completed running?
      if (next.done) {
        return next.value;
      }
      // otherwise keep going
      else {
        return Promise.resolve(next.value).then(
          // resume the async loop on
          // success, sending the resolved
          // value back into the generator
          handleNext,

          // if `value` is a rejected
          // promise, propagate error back
          // into the generator for its own
          // error handling
          function handleErr(err) {
            return Promise.resolve(it.throw(err)).then(handleResult);
          }
        );
      }
    })(next);
  });
}

function thunkify(fn) {
  return function () {
    var args = [].slice.call(arguments);
    return function (cb) {
      args.push(cb);
      return fn.apply(null, args);
    };
  };
}
