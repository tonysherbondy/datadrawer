//import Ember from 'ember';
import {Variable, Expression, Environment} from 'tukey/objects/variable';
import { module, test } from 'qunit';

module('Expressions and Variables', {
  beforeEach: function() {
    this.environment = Environment.create();
  }
});

test('Can get value of variable defined by constant', function(assert) {
  var a = this.environment.addVariable('A', Expression.constant(2));

  var b = Variable.create({
    name: 'B',
    definition: Expression.constant(3)
  });
  this.environment.addVariable(b);

  assert.strictEqual(a.get('value'), 2, 'variable added using string');
  assert.strictEqual(b.get('value'), 3, 'added with Variable object directly');
});

test('Can add two variables defined by constants', function(assert) {
  var a = this.environment.addVariable('A', Expression.constant(2));
  var b = this.environment.addVariable('B', Expression.constant(3));

  var sum = Expression.create({
    fragments: [a, '+', b]
  });

  var c = this.environment.addVariable('C', sum);

  assert.strictEqual(c.get('value'), 5);
});

test('Can evaluate variable defined by complex expression', function(assert) {
  var a = this.environment.addVariable('A', Expression.constant(2));
  var b = this.environment.addVariable('B', Expression.constant(3));

  var sum = Expression.create({
    fragments: [a, '+', b]
  });

  var c = this.environment.addVariable('C', sum);

  var square = Expression.create({
    fragments: ['(', a, '+', b, ' ) *', c]
  });

  var d = this.environment.addVariable('D', square);

  assert.strictEqual(d.get('value'), 25);
});



test('Updating value of constant propagates properly',
     function(assert) {

  var constantExpressionA = Expression.constant(2);
  var a = this.environment.addVariable('A', constantExpressionA);
  var b = this.environment.addVariable('B', Expression.constant(3));

  var sum = Expression.create({
    fragments: [a, '+', b]
  });

  var c = this.environment.addVariable('C', sum);

  var square = Expression.create({
    fragments: ['(', a, '+', b, ' ) *', c]
  });

  var d = this.environment.addVariable('D', square);

  assert.strictEqual(d.get('value'), 25);

  // TODO: possible perf problems here. Consider setting the value
  // directly and calling array.enumerableContentDidChange()
  constantExpressionA.get('fragments').replace(0, 1, '3');
  //constantExpressionA.get('fragments')[0] = '3';

  assert.strictEqual(d.get('value'), (3 + 3) * 6);
  assert.strictEqual(c.get('value'), 6);
});

test('Updating definition of variable propagates properly',
     function(assert) {

  var a = this.environment.addVariable('A', Expression.constant(2));
  var b = this.environment.addVariable('B', Expression.constant(3));

  var sum = Expression.create({
    fragments: [a, '+', b]
  });

  var c = this.environment.addVariable('C', sum);

  var square = Expression.create({
    fragments: ['(', a, '+', b, ' ) *', c]
  });

  var d = this.environment.addVariable('D', square);

  assert.strictEqual(d.get('value'), 25);

  a.set('definition', Expression.constant(7));

  assert.strictEqual(d.get('value'), (7 + 3) * 10);
  assert.strictEqual(c.get('value'), 10);
});
