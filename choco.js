/*!
 * @license choco.js Copyright(c) 2015 sasa+1
 * https://github.com/sasaplus1/choco.js
 * Released under the MIT license.
 */

/**
 * export to AMD/CommonJS/global.
 *
 * @param {Object} global global object.
 * @param {Function} factory factory method.
 */
(function(global, factory){
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    global.choco = factory();
  }
}((this || 0).self || global, function(){
  'use strict';

  var ID = '__choco_id',
      MAX_SAFE_INTEGER = (!Number.MAX_SAFE_INTEGER) ?
         Math.pow(2, 53) - 1 : Number.MAX_SAFE_INTEGER;

  var successSuffix = '-success',
      failureSuffix = '-failure';

  var warn = (function(){
    if (typeof console !== 'undefined') {
      if (typeof console.warn === 'object') {
        // IE8, IE9
        return function() {
          Function.prototype.apply.call(console.warn, console, arguments);
        };
      } else {
        // modern browsers
        return console.warn.bind(console);
      }
    } else {
      // old browsers and others
      return function() {};
    }
  }());

  /**
   * convert to Promise from EventEmitter.
   *
   * @param {EventEmitter} emitter emitter instance.
   * @param {String} event event name.
   * @param {Object} params argument object for emitter.
   */
  function choco(emitter, event, params) {
    var paramsType = typeof params;

    if (paramsType !== 'undefined' && paramsType !== 'object') {
      throw new TypeError('params must be an Object');
    }

    if (paramsType === 'object' && typeof params[ID] !== 'undefined') {
      throw new Error(ID + ' is reserved');
    }

    return new Promise(function(resolve, reject) {
      var id = Math.floor(Math.random() * MAX_SAFE_INTEGER),
          successEvent = event + successSuffix,
          failureEvent = event + failureSuffix,
          onSuccess, onFailure;

      if (paramsType === 'undefined') {
        params = {};
      }
      params[ID] = id;

      emitter.on(successEvent, onSuccess = function(result) {
        if (typeof result !== 'object') {
          return warn('result is not an Object');
        }
        if (typeof result[ID] !== 'number') {
          return warn(ID + ' is not a Number');
        }

        if (result[ID] !== id) {
          return;
        }

        emitter.removeListener(successEvent, onSuccess);
        emitter.removeListener(failureEvent, onFailure);

        // FIXME
        delete result[ID];

        resolve(result);
      });
      emitter.on(failureEvent, onFailure = function(result) {
        if (typeof result !== 'object') {
          return warn('result is not an Object');
        }
        if (typeof result[ID] !== 'number') {
          return warn(ID + ' is not a Number');
        }

        if (result[ID] !== id) {
          return;
        }

        emitter.removeListener(successEvent, onSuccess);
        emitter.removeListener(failureEvent, onFailure);

        // FIXME
        delete result[ID];

        reject(result);
      });

      emitter.emit(event, params);
    });
  }

  return choco;
}));
