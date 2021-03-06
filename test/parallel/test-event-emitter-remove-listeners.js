'use strict';
var common = require('../common');
var assert = require('assert');
var events = require('events');

var count = 0;

function listener1() {
  console.log('listener1');
  count++;
}

function listener2() {
  console.log('listener2');
  count++;
}

function remove1() {
  assert(0);
}

function remove2() {
  assert(0);
}

var e1 = new events.EventEmitter();
e1.on('hello', listener1);
e1.on('removeListener', common.mustCall(function(name, cb) {
  assert.equal(name, 'hello');
  assert.equal(cb, listener1);
}));
e1.removeListener('hello', listener1);
assert.deepStrictEqual([], e1.listeners('hello'));

var e2 = new events.EventEmitter();
e2.on('hello', listener1);
e2.on('removeListener', common.fail);
e2.removeListener('hello', listener2);
assert.deepStrictEqual([listener1], e2.listeners('hello'));

var e3 = new events.EventEmitter();
e3.on('hello', listener1);
e3.on('hello', listener2);
e3.once('removeListener', common.mustCall(function(name, cb) {
  assert.equal(name, 'hello');
  assert.equal(cb, listener1);
  assert.deepStrictEqual([listener2], e3.listeners('hello'));
}));
e3.removeListener('hello', listener1);
assert.deepStrictEqual([listener2], e3.listeners('hello'));
e3.once('removeListener', common.mustCall(function(name, cb) {
  assert.equal(name, 'hello');
  assert.equal(cb, listener2);
  assert.deepStrictEqual([], e3.listeners('hello'));
}));
e3.removeListener('hello', listener2);
assert.deepStrictEqual([], e3.listeners('hello'));

var e4 = new events.EventEmitter();
e4.on('removeListener', common.mustCall(function(name, cb) {
  if (cb !== remove1) return;
  this.removeListener('quux', remove2);
  this.emit('quux');
}, 2));
e4.on('quux', remove1);
e4.on('quux', remove2);
e4.removeListener('quux', remove1);

var e5 = new events.EventEmitter();
e5.on('hello', listener1);
e5.on('hello', listener2);
e5.once('removeListener', common.mustCall(function(name, cb) {
  assert.equal(name, 'hello');
  assert.equal(cb, listener1);
  assert.deepStrictEqual([listener2], e5.listeners('hello'));
  e5.once('removeListener', common.mustCall(function(name, cb) {
    assert.equal(name, 'hello');
    assert.equal(cb, listener2);
    assert.deepStrictEqual([], e5.listeners('hello'));
  }));
  e5.removeListener('hello', listener2);
  assert.deepStrictEqual([], e5.listeners('hello'));
}));
e5.removeListener('hello', listener1);
assert.deepStrictEqual([], e5.listeners('hello'));

const e6 = new events.EventEmitter();

const listener3 = common.mustCall(() => {
  e6.removeListener('hello', listener4);
}, 2);

const listener4 = common.mustCall(() => {}, 1);

e6.on('hello', listener3);
e6.on('hello', listener4);

// listener4 will still be called although it is removed by listener 3.
e6.emit('hello');
// This is so because the interal listener array at time of emit
// was [listener3,listener4]

// Interal listener array [listener3]
e6.emit('hello');

const e7 = new events.EventEmitter();

const listener5 = () => {};

e7.once('hello', listener5);
e7.on('removeListener', common.mustCall((eventName, listener) => {
  assert.strictEqual(eventName, 'hello');
  assert.strictEqual(listener, listener5);
}));
e7.emit('hello');
