/*eslint-env mocha*/ /*eslint dot-notation: [2, {"allowKeywords":false}]*/

(function(){

  'use strict';

  var assert, choco, EventEmitter;

  if (typeof exports === 'object') {
    assert = require('assert');
    choco = require('../choco');
    EventEmitter = require('events').EventEmitter;
  } else {
    assert = this.assert;
    choco = this.choco;
    EventEmitter = this.EventEmitter2;
  }

  describe('choco()', function() {

    describe('call resolve/reject', function() {

      var emitter;

      beforeEach(function() {
        emitter = new EventEmitter();
      });

      afterEach(function() {
        emitter = null;
      });

      it('should call resolve', function() {
        emitter.on('test', function(params) {
          params.result = 'success';
          emitter.emit('test-success', params);
        });

        return choco(emitter, 'test').then(function(result) {
          assert.deepEqual(result, { result: 'success' });
        });
      });

      it('should call reject', function() {
        emitter.on('test', function(params) {
          params.result = 'failure';
          emitter.emit('test-failure', params);
        });

        return choco(emitter, 'test')['catch'](function(err) {
          assert.deepEqual(err, { result: 'failure' });
        });
      });

      it('should call multiple resolve', function() {
        var values = [1, 2, 3];

        emitter.on('test', function(params) {
          params.result = params.value;

          setTimeout(function() {
            emitter.emit('test-success', params);
          }, Math.random() * 10 >> 0);
        });

        return Promise.all(values.map(function(value) {
          return choco(emitter, 'test', { value: value });
        })).then(function(results) {
          assert.deepEqual(results, [
            { result: 1, value: 1 },
            { result: 2, value: 2 },
            { result: 3, value: 3 }
          ]);
        });
      });

    });

    describe('throws error', function() {

      it('should throw error if params is not an Object', function() {
        assert['throws'](function() { choco(null, '', 1234); }, TypeError);
        assert['throws'](function() { choco(null, '', 'AA'); }, TypeError);
        assert['throws'](function() { choco(null, '', true); }, TypeError);
        assert['throws'](function() { choco(null, '', null); }, TypeError);
      });

      it('should throw error if params used reserved name', function() {
        assert['throws'](function() {
          choco(null, '', { '__choco_id': 1 });
        }, Error);
      });

    });

  });

}).call(this);
