Factory = require('../../src/rosie')

describe('Factory', function() {
  afterEach(function() {
    Factory.factories = {};
  });

  describe('build', function() {
    describe('with a constructor', function() {
      var Thing = function(attrs) {
        for(var attr in attrs) {
          this[attr] = attrs[attr];
        }
      };

      beforeEach(function() {
        Factory.define('thing', Thing).attr('name', 'Thing 1');
      });

      it('should return a new instance of that constructor', function() {
        expect(Factory.build('thing') instanceof Thing).toBe(true);
        expect(Factory.build('thing').constructor).toBe(Thing);
      });

      it('should set attributes', function() {
        expect(Factory.build('thing')).toEqual({name: 'Thing 1'});
      });
    });

    describe('without a constructor', function() {
      beforeEach(function() {
        Factory.define('thing').attr('name', 'Thing 1');
      });

      it('should return object with attributes set', function() {
        expect(Factory.build('thing')).toEqual({name:'Thing 1'});
      });

      it('should allow overriding attributes', function() {
        expect(Factory.build('thing', {name:'changed'})).toEqual({name:'changed'});
      });
    });
  });

  describe('attributes', function() {
    beforeEach(function() {
      Factory.define('thing').attr('name', 'Thing 1');
    });

    it('should return object with attributes set', function() {
      expect(Factory.attributes('thing')).toEqual({name:'Thing 1'});
    });

    it('should allow overriding attributes', function() {
      expect(Factory.attributes('thing', {name:'changed'})).toEqual({name:'changed'});
    });
  });
  describe('async', function() {
    beforeEach(function() {
      Factory.define('async')
        .attr('foo', 1)
        .attr('bar', 2)
      Factory.define('async2')
        .attr('foo', 1)
        .attr('bar', 2)
        .after_create(function(next) {
          this.foo = 3;
          next(this);
          return
        })
    });

    it('should call callback supplied to build', function() {
      jasmine.asyncSpecWait();
      Factory.build('async', {}, function(obj) {
        expect(obj.foo).toBe(1);
        expect(obj.bar).toBe(2);
        jasmine.asyncSpecDone();
      })
    });
    it('should call after_create callbacks', function() {
      jasmine.asyncSpecWait();
      Factory.build('async2', {}, function(obj) {
        expect(obj.foo).toBe(3);
        expect(obj.bar).toBe(2);
        jasmine.asyncSpecDone();
      })
    });
  })

  describe('prototype', function() {
    var factory;

    beforeEach(function() {
      factory = new Factory();
    });

    describe('attr', function() {
      it('should add given value to attributes', function() {
        factory.attr('foo', 'bar');
        expect(factory.attributes().foo).toEqual('bar');
      });

      it('should invoke function', function() {
        var calls = 0;
        factory.attr('dynamic', function() { return ++calls; });
        expect(factory.attributes().dynamic).toEqual(1);
        expect(factory.attributes().dynamic).toEqual(2);
      });

      it('should return the factory', function() {
        expect(factory.attr('foo', 1)).toBe(factory);
      });
    });

    describe("set_attrs", function() {
      it('should add given values to attributes', function() {
        factory.set_attrs({'fred': 1, 'wilma': 3});

        expect(factory.attributes().fred).toEqual(1);
        expect(factory.attributes().wilma).toEqual(3);
      });

      it('should return the factory', function() {
        expect(factory.set_attrs({'foo': 1})).toBe(factory);
      });
    });

    describe("set_attrs", function() {
      it('should add given values to attributes', function() {
        factory.set_funcs({
          'fred': function() {return 'x1'},
          'wilma': function() {return 'y3'}
        });

        expect(factory.functions().fred()).toEqual('x1');
        expect(factory.functions().wilma()).toEqual('y3');
      });

      it('should return the factory', function() {
        expect(factory.set_funcs({'foo': function() { } })).toBe(factory);
      });
    });

    describe('sequence', function() {
      it('should return the factory', function() {
        expect(factory.sequence('id')).toBe(factory);
      });

      it('should return an incremented value for each invocation', function() {
        factory.sequence('id');
        expect(factory.attributes().id).toEqual(1);
        expect(factory.attributes().id).toEqual(2);
        expect(factory.attributes().id).toEqual(3);
      });

      it('should increment different sequences independently', function() {
        factory.sequence('id');
        factory.sequence('count');

        expect(factory.attributes()).toEqual({id: 1, count: 1});
        expect(factory.attributes()).toEqual({id: 2, count: 2});
      });

      it('should use custom function', function() {
        factory.sequence('name', function(i) { return 'user' + i; });
        expect(factory.attributes().name).toEqual('user1');
      });
    });

    describe('attributes', function() {
      beforeEach(function() {
        factory.attr('foo', 1).attr('bar', 2);
      });

      it('should allow overriding an attribute', function() {
        expect(factory.attributes({bar:3})).toEqual({foo:1, bar:3});
      });

      it('should allow overriding an attribute with a falsy value', function() {
        expect(factory.attributes({bar:false})).toEqual({foo:1, bar:false});
      });

      it('should allow adding new attributes', function() {
        expect(factory.attributes({baz:3})).toEqual({foo:1, bar:2, baz:3});
      });
    });
  });
});
