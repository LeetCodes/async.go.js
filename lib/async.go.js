var async = require('async');
var _ = require('underscore');

/**
 * The go method.
 * @returns {unresolved}
 */
var asyncgo = function() {
  var self = this;

  // Get the arguments and method to call.
  var args = _.filter(_.values(arguments), function(arg) {
    return !!arg;
  });

  // Get the method.
  var method = args.shift();
  var show = true;

  // If the first argument is a boolean allow then to not display.
  if (typeof method==='boolean') {
    show = method;
    method = args.shift();
  }

  // Return the async.js signature.
  return function(done) {
    var value = null, i=0;

    // Iterate through each of the arguments.
    async.eachSeries(args, function(arg, done) {

      // If the argument is a function.
      if (typeof arg === 'function') {

        // Closure around the index...
        (function(index) {

          // Get the value returned from the function.
          value = arg.call(self, function(val) {

            // Set the argument and say we are done.
            args[index] = val;
            done();
          });

          // If they return a value, then say we are done.
          if (value !== undefined) {

            // Set the argument and say we are done.
            args[index] = value;
            done();
          }
        })(i++);
      }
      else {
        i++;
        done();
      }
    }, function(error) {

      // If they wish to show the methods, then log to console.
      if (show) {
        console.log(method + '(' + args.join(', ') + ')');
      }

      // Add the done function
      args.push(function() {
        done();
      });

      // Apply the method with arguments.
      var ref = asyncgo.getRef.call(self, method, args);
      ref[method].apply(ref, args);
    });
  };
};

// Allow them to change the reference.
asyncgo.getRef = function(method, args) {
  return this[method];
};

// Set the export.
module.exports = asyncgo;
