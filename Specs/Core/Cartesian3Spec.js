/*global defineSuite*/
defineSuite([
             'Core/Cartesian3',
             'Core/Math',
             'Specs/createPackableSpecs'
            ], function(
              Cartesian3,
              CesiumMath,
              createPackableSpecs) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    it('construct with default values', function() {
        var cartesian = new Cartesian3();
        expect(cartesian.x).toEqual(0.0);
        expect(cartesian.y).toEqual(0.0);
        expect(cartesian.z).toEqual(0.0);
    });

    it('construct with all values', function() {
        var cartesian = new Cartesian3(1.0, 2.0, 3.0);
        expect(cartesian.x).toEqual(1.0);
        expect(cartesian.y).toEqual(2.0);
        expect(cartesian.z).toEqual(3.0);
    });

    var fortyFiveDegrees = Math.PI / 4.0;
    var sixtyDegrees = Math.PI / 3.0;
    var cartesian = new Cartesian3(1.0, Math.sqrt(3.0), -2.0);
    var spherical = {
        clock : sixtyDegrees,
        cone : (fortyFiveDegrees + Math.PI / 2.0),
        magnitude : Math.sqrt(8.0)
    };

    it('convert Spherical to a new Cartesian3 instance', function() {
        expect(cartesian).toEqualEpsilon(Cartesian3.fromSpherical(spherical), CesiumMath.EPSILON15);
    });

    it('convert Spherical to an existing Cartesian3 instance', function() {
        var existing = new Cartesian3();
        expect(cartesian).toEqualEpsilon(Cartesian3.fromSpherical(spherical, existing), CesiumMath.EPSILON15);
        expect(cartesian).toEqualEpsilon(existing, CesiumMath.EPSILON15);
    });

    it('fromArray creates a Cartesian3', function() {
        var cartesian = Cartesian3.fromArray([1.0, 2.0, 3.0]);
        expect(cartesian).toEqual(new Cartesian3(1.0, 2.0, 3.0));
    });

    it('fromArray with an offset creates a Cartesian3', function() {
        var cartesian = Cartesian3.fromArray([0.0, 1.0, 2.0, 3.0, 0.0], 1);
        expect(cartesian).toEqual(new Cartesian3(1.0, 2.0, 3.0));
    });

    it('fromArray creates a Cartesian3 with a result parameter', function() {
        var cartesian = new Cartesian3();
        var result = Cartesian3.fromArray([1.0, 2.0, 3.0], 0, cartesian);
        expect(result).toBe(cartesian);
        expect(result).toEqual(new Cartesian3(1.0, 2.0, 3.0));
    });

    it('fromArray throws without values', function() {
        expect(function() {
            Cartesian3.fromArray();
        }).toThrowDeveloperError();
    });

    it('clone without a result parameter', function() {
        var cartesian = new Cartesian3(1.0, 2.0, 3.0);
        var result = Cartesian3.clone(cartesian);
        expect(cartesian).toNotBe(result);
        expect(cartesian).toEqual(result);
    });

    it('clone with a result parameter', function() {
        var cartesian = new Cartesian3(1.0, 2.0, 3.0);
        var result = new Cartesian3();
        var returnedResult = Cartesian3.clone(cartesian, result);
        expect(cartesian).toNotBe(result);
        expect(result).toBe(returnedResult);
        expect(cartesian).toEqual(result);
    });

    it('clone works with a result parameter that is an input parameter', function() {
        var cartesian = new Cartesian3(1.0, 2.0, 3.0);
        var returnedResult = Cartesian3.clone(cartesian, cartesian);
        expect(cartesian).toBe(returnedResult);
    });

    it('getMaximumComponent works when X is greater', function() {
        var cartesian = new Cartesian3(2.0, 1.0, 0.0);
        expect(Cartesian3.getMaximumComponent(cartesian)).toEqual(cartesian.x);
    });

    it('getMaximumComponent works when Y is greater', function() {
        var cartesian = new Cartesian3(1.0, 2.0, 0.0);
        expect(Cartesian3.getMaximumComponent(cartesian)).toEqual(cartesian.y);
    });

    it('getMaximumComponent works when Z is greater', function() {
        var cartesian = new Cartesian3(1.0, 2.0, 3.0);
        expect(Cartesian3.getMaximumComponent(cartesian)).toEqual(cartesian.z);
    });

    it('getMinimumComponent works when X is lesser', function() {
        var cartesian = new Cartesian3(1.0, 2.0, 3.0);
        expect(Cartesian3.getMinimumComponent(cartesian)).toEqual(cartesian.x);
    });

    it('getMinimumComponent works when Y is lesser', function() {
        var cartesian = new Cartesian3(2.0, 1.0, 3.0);
        expect(Cartesian3.getMinimumComponent(cartesian)).toEqual(cartesian.y);
    });

    it('getMinimumComponent works when Z is lesser', function() {
        var cartesian = new Cartesian3(2.0, 1.0, 0.0);
        expect(Cartesian3.getMinimumComponent(cartesian)).toEqual(cartesian.z);
    });

    it('getMinimumByComponent without a result parameter', function() {
        var first = new Cartesian3(2.0, 0.0, 0.0);
        var second = new Cartesian3(1.0, 0.0, 0.0);
        var result = new Cartesian3(1.0, 0.0, 0.0);
        expect(Cartesian3.getMinimumByComponent(first, second)).toEqual(result);
        first = new Cartesian3(1.0, 0.0, 0.0);
        second = new Cartesian3(2.0, 0.0, 0.0);
        result = new Cartesian3(1.0, 0.0, 0.0);
        expect(Cartesian3.getMinimumByComponent(first, second)).toEqual(result);
        first = new Cartesian3(2.0, -15.0, 0.0);
        second = new Cartesian3(1.0, -20.0, 0.0);
        result = new Cartesian3(1.0, -20.0, 0.0);
        expect(Cartesian3.getMinimumByComponent(first, second)).toEqual(result);
        first = new Cartesian3(2.0, -20.0, 0.0);
        second = new Cartesian3(1.0, -15.0, 0.0);
        result = new Cartesian3(1.0, -20.0, 0.0);
        expect(Cartesian3.getMinimumByComponent(first, second)).toEqual(result);
        first = new Cartesian3(2.0, -15.0, 26.4);
        second = new Cartesian3(1.0, -20.0, 26.5);
        result = new Cartesian3(1.0, -20.0, 26.4);
        expect(Cartesian3.getMinimumByComponent(first, second)).toEqual(result);
        first = new Cartesian3(2.0, -15.0, 26.5);
        second = new Cartesian3(1.0, -20.0, 26.4);
        result = new Cartesian3(1.0, -20.0, 26.4);
        expect(Cartesian3.getMinimumByComponent(first, second)).toEqual(result);
    });

    it('getMinimumByComponent with a result parameter', function() {
        var first = new Cartesian3(2.0, 0.0, 0.0);
        var second = new Cartesian3(1.0, 0.0, 0.0);
        var result = new Cartesian3();
        var returnedResult = Cartesian3.getMinimumByComponent(first, second, result);
        expect(returnedResult).toBe(result);
        expect(returnedResult).toEqual(result);
    });

    it('getMinimumByComponent with a result parameter that is an input parameter', function() {
        var first = new Cartesian3(2.0, 0.0, 0.0);
        var second = new Cartesian3(1.0, 0.0, 0.0);
        var result = new Cartesian3(1.0, 0.0, 0.0);
        expect(Cartesian3.getMinimumByComponent(first, second, first)).toEqual(result);
        first.x = 1.0;
        second.x = 2.0;
        expect(Cartesian3.getMinimumByComponent(first, second, first)).toEqual(result);
    });

    it('getMinimumByComponent with a result parameter that is an input parameter', function() {
        var first = new Cartesian3(2.0, 0.0, 0.0);
        var second = new Cartesian3(1.0, 0.0, 0.0);
        var result = new Cartesian3(1.0, 0.0, 0.0);
        expect(Cartesian3.getMinimumByComponent(first, second, second)).toEqual(result);
        first.x = 1.0;
        second.x = 2.0;
        expect(Cartesian3.getMinimumByComponent(first, second, second)).toEqual(result);
    });

    it('getMinimumByComponent throws without first', function() {
        expect(function() {
            Cartesian3.getMinimumByComponent();
        }).toThrowDeveloperError();
    });

    it('getMinimumByComponent throws without second', function() {
        expect(function() {
            Cartesian3.getMinimumByComponent(new Cartesian3());
        }).toThrowDeveloperError();
    });

    it('getMinimumByComponent works when first\'s or second\'s X is lesser', function() {
        var first = new Cartesian3(2.0, 0.0, 0.0);
        var second = new Cartesian3(1.0, 0.0, 0.0);
        var result = new Cartesian3(1.0, 0.0, 0.0);
        expect(Cartesian3.getMinimumByComponent(first, second)).toEqual(result);
        second.x = 3.0;
        result.x = 2.0;
        expect(Cartesian3.getMinimumByComponent(first, second)).toEqual(result);
    });

    it('getMinimumByComponent works when first\'s or second\'s Y is lesser', function() {
        var first = new Cartesian3(0.0, 2.0, 0.0);
        var second = new Cartesian3(0.0, 1.0, 0.0);
        var result = new Cartesian3(0.0, 1.0, 0.0);
        expect(Cartesian3.getMinimumByComponent(first, second)).toEqual(result);
        second.y = 3.0;
        result.y = 2.0;
        expect(Cartesian3.getMinimumByComponent(first, second)).toEqual(result);
    });

    it('getMinimumByComponent works when first\'s or second\'s Z is lesser', function() {
        var first = new Cartesian3(0.0, 0.0, 2.0);
        var second = new Cartesian3(0.0, 0.0, 1.0);
        var result = new Cartesian3(0.0, 0.0, 1.0);
        expect(Cartesian3.getMinimumByComponent(first, second)).toEqual(result);
        second.z = 3.0;
        result.z = 2.0;
        expect(Cartesian3.getMinimumByComponent(first, second)).toEqual(result);
    });

    it('getMaximumByComponent without a result parameter', function() {
        var first = new Cartesian3(2.0, 0.0, 0.0);
        var second = new Cartesian3(1.0, 0.0, 0.0);
        var result = new Cartesian3(2.0, 0.0, 0.0);
        expect(Cartesian3.getMaximumByComponent(first, second)).toEqual(result);
        first = new Cartesian3(1.0, 0.0, 0.0);
        second = new Cartesian3(2.0, 0.0, 0.0);
        result = new Cartesian3(2.0, 0.0, 0.0);
        expect(Cartesian3.getMaximumByComponent(first, second)).toEqual(result);
        first = new Cartesian3(2.0, -15.0, 0.0);
        second = new Cartesian3(1.0, -20.0, 0.0);
        result = new Cartesian3(2.0, -15.0, 0.0);
        expect(Cartesian3.getMaximumByComponent(first, second)).toEqual(result);
        first = new Cartesian3(2.0, -20.0, 0.0);
        second = new Cartesian3(1.0, -15.0, 0.0);
        result = new Cartesian3(2.0, -15.0, 0.0);
        expect(Cartesian3.getMaximumByComponent(first, second)).toEqual(result);
        first = new Cartesian3(2.0, -15.0, 26.4);
        second = new Cartesian3(1.0, -20.0, 26.5);
        result = new Cartesian3(2.0, -15.0, 26.5);
        expect(Cartesian3.getMaximumByComponent(first, second)).toEqual(result);
        first = new Cartesian3(2.0, -15.0, 26.5);
        second = new Cartesian3(1.0, -20.0, 26.4);
        result = new Cartesian3(2.0, -15.0, 26.5);
        expect(Cartesian3.getMaximumByComponent(first, second)).toEqual(result);
    });

    it('getMaximumByComponent with a result parameter', function() {
        var first = new Cartesian3(2.0, 0.0, 0.0);
        var second = new Cartesian3(1.0, 0.0, 0.0);
        var result = new Cartesian3();
        var returnedResult = Cartesian3.getMaximumByComponent(first, second, result);
        expect(returnedResult).toBe(result);
        expect(returnedResult).toEqual(result);
    });

    it('getMaximumByComponent with a result parameter that is an input parameter', function() {
        var first = new Cartesian3(2.0, 0.0, 0.0);
        var second = new Cartesian3(1.0, 0.0, 0.0);
        var result = new Cartesian3(2.0, 0.0, 0.0);
        expect(Cartesian3.getMaximumByComponent(first, second, first)).toEqual(result);
        first.x = 1.0;
        second.x = 2.0;
        expect(Cartesian3.getMaximumByComponent(first, second, first)).toEqual(result);
    });

    it('getMaximumByComponent with a result parameter that is an input parameter', function() {
        var first = new Cartesian3(2.0, 0.0, 0.0);
        var second = new Cartesian3(1.0, 0.0, 0.0);
        var result = new Cartesian3(2.0, 0.0, 0.0);
        expect(Cartesian3.getMaximumByComponent(first, second, second)).toEqual(result);
        first.x = 1.0;
        second.x = 2.0;
        expect(Cartesian3.getMaximumByComponent(first, second, second)).toEqual(result);
    });

    it('getMaximumByComponent throws without first', function() {
        expect(function() {
            Cartesian3.getMaximumByComponent();
        }).toThrowDeveloperError();
    });

    it('getMaximumByComponent throws without second', function() {
        expect(function() {
            Cartesian3.getMaximumByComponent(new Cartesian3());
        }).toThrowDeveloperError();
    });

    it('getMaximumByComponent works when first\'s or second\'s X is greater', function() {
        var first = new Cartesian3(2.0, 0.0, 0.0);
        var second = new Cartesian3(1.0, 0.0, 0.0);
        var result = new Cartesian3(2.0, 0.0, 0.0);
        expect(Cartesian3.getMaximumByComponent(first, second)).toEqual(result);
        second.x = 3.0;
        result.x = 3.0;
        expect(Cartesian3.getMaximumByComponent(first, second)).toEqual(result);
    });

    it('getMaximumByComponent works when first\'s or second\'s Y is greater', function() {
        var first = new Cartesian3(0.0, 2.0, 0.0);
        var second = new Cartesian3(0.0, 1.0, 0.0);
        var result = new Cartesian3(0.0, 2.0, 0.0);
        expect(Cartesian3.getMaximumByComponent(first, second)).toEqual(result);
        second.y = 3.0;
        result.y = 3.0;
        expect(Cartesian3.getMaximumByComponent(first, second)).toEqual(result);
    });

    it('getMaximumByComponent works when first\'s or second\'s Z is greater', function() {
        var first = new Cartesian3(0.0, 0.0, 2.0);
        var second = new Cartesian3(0.0, 0.0, 1.0);
        var result = new Cartesian3(0.0, 0.0, 2.0);
        expect(Cartesian3.getMaximumByComponent(first, second)).toEqual(result);
        second.z = 3.0;
        result.z = 3.0;
        expect(Cartesian3.getMaximumByComponent(first, second)).toEqual(result);
    });

    it('magnitudeSquared', function() {
        var cartesian = new Cartesian3(3.0, 4.0, 5.0);
        expect(Cartesian3.magnitudeSquared(cartesian)).toEqual(50.0);
    });

    it('magnitude', function() {
        var cartesian = new Cartesian3(3.0, 4.0, 5.0);
        expect(Cartesian3.magnitude(cartesian)).toEqual(Math.sqrt(50.0));
    });

    it('distance', function() {
        var distance = Cartesian3.distance(new Cartesian3(1.0, 0.0, 0.0), new Cartesian3(2.0, 0.0, 0.0));
        expect(distance).toEqual(1.0);
    });

    it('distance throws without left', function() {
        expect(function() {
            Cartesian3.distance();
        }).toThrowDeveloperError();
    });

    it('distance throws without right', function() {
        expect(function() {
            Cartesian3.distance(Cartesian3.UNIT_X);
        }).toThrowDeveloperError();
    });

    it('normalize works without a result parameter', function() {
        var cartesian = new Cartesian3(2.0, 0.0, 0.0);
        var expectedResult = new Cartesian3(1.0, 0.0, 0.0);
        var result = Cartesian3.normalize(cartesian);
        expect(result).toEqual(expectedResult);
    });

    it('normalize works with a result parameter', function() {
        var cartesian = new Cartesian3(2.0, 0.0, 0.0);
        var expectedResult = new Cartesian3(1.0, 0.0, 0.0);
        var result = new Cartesian3();
        var returnedResult = Cartesian3.normalize(cartesian, result);
        expect(result).toBe(returnedResult);
        expect(result).toEqual(expectedResult);
    });

    it('normalize works with a result parameter that is an input parameter', function() {
        var cartesian = new Cartesian3(2.0, 0.0, 0.0);
        var expectedResult = new Cartesian3(1.0, 0.0, 0.0);
        var returnedResult = Cartesian3.normalize(cartesian, cartesian);
        expect(cartesian).toBe(returnedResult);
        expect(cartesian).toEqual(expectedResult);
    });

    it('multiplyComponents works without a result parameter', function() {
        var left = new Cartesian3(2.0, 3.0, 6.0);
        var right = new Cartesian3(4.0, 5.0, 7.0);
        var expectedResult = new Cartesian3(8.0, 15.0, 42.0);
        var result = Cartesian3.multiplyComponents(left, right);
        expect(result).toEqual(expectedResult);
    });

    it('multiplyComponents works with a result parameter', function() {
        var left = new Cartesian3(2.0, 3.0, 6.0);
        var right = new Cartesian3(4.0, 5.0, 7.0);
        var result = new Cartesian3();
        var expectedResult = new Cartesian3(8.0, 15.0, 42.0);
        var returnedResult = Cartesian3.multiplyComponents(left, right, result);
        expect(result).toBe(returnedResult);
        expect(result).toEqual(expectedResult);
    });

    it('multiplyComponents works with a result parameter that is an input parameter', function() {
        var left = new Cartesian3(2.0, 3.0, 6.0);
        var right = new Cartesian3(4.0, 5.0, 7.0);
        var expectedResult = new Cartesian3(8.0, 15.0, 42.0);
        var returnedResult = Cartesian3.multiplyComponents(left, right, left);
        expect(left).toBe(returnedResult);
        expect(left).toEqual(expectedResult);
    });

    it('dot', function() {
        var left = new Cartesian3(2.0, 3.0, 6.0);
        var right = new Cartesian3(4.0, 5.0, 7.0);
        var expectedResult = 65.0;
        var result = Cartesian3.dot(left, right);
        expect(result).toEqual(expectedResult);
    });

    it('add works without a result parameter', function() {
        var left = new Cartesian3(2.0, 3.0, 6.0);
        var right = new Cartesian3(4.0, 5.0, 7.0);
        var expectedResult = new Cartesian3(6.0, 8.0, 13.0);
        var result = Cartesian3.add(left, right);
        expect(result).toEqual(expectedResult);
    });

    it('add works with a result parameter', function() {
        var left = new Cartesian3(2.0, 3.0, 6.0);
        var right = new Cartesian3(4.0, 5.0, 7.0);
        var result = new Cartesian3();
        var expectedResult = new Cartesian3(6.0, 8.0, 13.0);
        var returnedResult = Cartesian3.add(left, right, result);
        expect(returnedResult).toBe(result);
        expect(result).toEqual(expectedResult);
    });

    it('add works with a result parameter that is an input parameter', function() {
        var left = new Cartesian3(2.0, 3.0, 6.0);
        var right = new Cartesian3(4.0, 5.0, 7.0);
        var expectedResult = new Cartesian3(6.0, 8.0, 13.0);
        var returnedResult = Cartesian3.add(left, right, left);
        expect(returnedResult).toBe(left);
        expect(left).toEqual(expectedResult);
    });

    it('subtract works without a result parameter', function() {
        var left = new Cartesian3(2.0, 3.0, 4.0);
        var right = new Cartesian3(1.0, 5.0, 7.0);
        var expectedResult = new Cartesian3(1.0, -2.0, -3.0);
        var result = Cartesian3.subtract(left, right);
        expect(result).toEqual(expectedResult);
    });

    it('subtract works with a result parameter', function() {
        var left = new Cartesian3(2.0, 3.0, 4.0);
        var right = new Cartesian3(1.0, 5.0, 7.0);
        var result = new Cartesian3();
        var expectedResult = new Cartesian3(1.0, -2.0, -3.0);
        var returnedResult = Cartesian3.subtract(left, right, result);
        expect(returnedResult).toBe(result);
        expect(result).toEqual(expectedResult);
    });

    it('subtract works with this result parameter', function() {
        var left = new Cartesian3(2.0, 3.0, 4.0);
        var right = new Cartesian3(1.0, 5.0, 7.0);
        var expectedResult = new Cartesian3(1.0, -2.0, -3.0);
        var returnedResult = Cartesian3.subtract(left, right, left);
        expect(returnedResult).toBe(left);
        expect(left).toEqual(expectedResult);
    });

    it('multiplyByScalar without a result parameter', function() {
        var cartesian = new Cartesian3(1.0, 2.0, 3.0);
        var scalar = 2;
        var expectedResult = new Cartesian3(2.0, 4.0, 6.0);
        var result = Cartesian3.multiplyByScalar(cartesian, scalar);
        expect(result).toEqual(expectedResult);
    });

    it('multiplyByScalar with a result parameter', function() {
        var cartesian = new Cartesian3(1.0, 2.0, 3.0);
        var result = new Cartesian3();
        var scalar = 2;
        var expectedResult = new Cartesian3(2.0, 4.0, 6.0);
        var returnedResult = Cartesian3.multiplyByScalar(cartesian, scalar, result);
        expect(result).toBe(returnedResult);
        expect(result).toEqual(expectedResult);
    });

    it('multiplyByScalar with a result parameter that is an input parameter', function() {
        var cartesian = new Cartesian3(1.0, 2.0, 3.0);
        var scalar = 2;
        var expectedResult = new Cartesian3(2.0, 4.0, 6.0);
        var returnedResult = Cartesian3.multiplyByScalar(cartesian, scalar, cartesian);
        expect(cartesian).toBe(returnedResult);
        expect(cartesian).toEqual(expectedResult);
    });

    it('divideByScalar without a result parameter', function() {
        var cartesian = new Cartesian3(1.0, 2.0, 3.0);
        var scalar = 2;
        var expectedResult = new Cartesian3(0.5, 1.0, 1.5);
        var result = Cartesian3.divideByScalar(cartesian, scalar);
        expect(result).toEqual(expectedResult);
    });

    it('divideByScalar with a result parameter', function() {
        var cartesian = new Cartesian3(1.0, 2.0, 3.0);
        var result = new Cartesian3();
        var scalar = 2;
        var expectedResult = new Cartesian3(0.5, 1.0, 1.5);
        var returnedResult = Cartesian3.divideByScalar(cartesian, scalar, result);
        expect(result).toBe(returnedResult);
        expect(result).toEqual(expectedResult);
    });

    it('divideByScalar with a result parameter that is an input parameter', function() {
        var cartesian = new Cartesian3(1.0, 2.0, 3.0);
        var scalar = 2;
        var expectedResult = new Cartesian3(0.5, 1.0, 1.5);
        var returnedResult = Cartesian3.divideByScalar(cartesian, scalar, cartesian);
        expect(cartesian).toBe(returnedResult);
        expect(cartesian).toEqual(expectedResult);
    });

    it('negate without a result parameter', function() {
        var cartesian = new Cartesian3(1.0, -2.0, -5.0);
        var expectedResult = new Cartesian3(-1.0, 2.0, 5.0);
        var result = Cartesian3.negate(cartesian);
        expect(result).toEqual(expectedResult);
    });

    it('negate with a result parameter', function() {
        var cartesian = new Cartesian3(1.0, -2.0, -5.0);
        var result = new Cartesian3();
        var expectedResult = new Cartesian3(-1.0, 2.0, 5.0);
        var returnedResult = Cartesian3.negate(cartesian, result);
        expect(result).toBe(returnedResult);
        expect(result).toEqual(expectedResult);
    });

    it('negate with a result parameter that is an input parameter', function() {
        var cartesian = new Cartesian3(1.0, -2.0, -5.0);
        var expectedResult = new Cartesian3(-1.0, 2.0, 5.0);
        var returnedResult = Cartesian3.negate(cartesian, cartesian);
        expect(cartesian).toBe(returnedResult);
        expect(cartesian).toEqual(expectedResult);
    });

    it('abs without a result parameter', function() {
        var cartesian = new Cartesian3(1.0, -2.0, -4.0);
        var expectedResult = new Cartesian3(1.0, 2.0, 4.0);
        var result = Cartesian3.abs(cartesian);
        expect(result).toEqual(expectedResult);
    });

    it('abs with a result parameter', function() {
        var cartesian = new Cartesian3(1.0, -2.0, -4.0);
        var result = new Cartesian3();
        var expectedResult = new Cartesian3(1.0, 2.0, 4.0);
        var returnedResult = Cartesian3.abs(cartesian, result);
        expect(result).toBe(returnedResult);
        expect(result).toEqual(expectedResult);
    });

    it('abs with a result parameter that is an input parameter', function() {
        var cartesian = new Cartesian3(1.0, -2.0, -4.0);
        var expectedResult = new Cartesian3(1.0, 2.0, 4.0);
        var returnedResult = Cartesian3.abs(cartesian, cartesian);
        expect(cartesian).toBe(returnedResult);
        expect(cartesian).toEqual(expectedResult);
    });

    it('lerp works without a result parameter', function() {
        var start = new Cartesian3(4.0, 8.0, 10.0);
        var end = new Cartesian3(8.0, 20.0, 20.0);
        var t = 0.25;
        var expectedResult = new Cartesian3(5.0, 11.0, 12.5);
        var result = Cartesian3.lerp(start, end, t);
        expect(result).toEqual(expectedResult);
    });

    it('lerp works with a result parameter', function() {
        var start = new Cartesian3(4.0, 8.0, 10.0);
        var end = new Cartesian3(8.0, 20.0, 20.0);
        var t = 0.25;
        var result = new Cartesian3();
        var expectedResult = new Cartesian3(5.0, 11.0, 12.5);
        var returnedResult = Cartesian3.lerp(start, end, t, result);
        expect(result).toBe(returnedResult);
        expect(result).toEqual(expectedResult);
    });

    it('lerp works with a result parameter that is an input parameter', function() {
        var start = new Cartesian3(4.0, 8.0, 10.0);
        var end = new Cartesian3(8.0, 20.0, 20.0);
        var t = 0.25;
        var expectedResult = new Cartesian3(5.0, 11.0, 12.5);
        var returnedResult = Cartesian3.lerp(start, end, t, start);
        expect(start).toBe(returnedResult);
        expect(start).toEqual(expectedResult);
    });

    it('lerp extrapolate forward', function() {
        var start = new Cartesian3(4.0, 8.0, 10.0);
        var end = new Cartesian3(8.0, 20.0, 20.0);
        var t = 2.0;
        var expectedResult = new Cartesian3(12.0, 32.0, 30.0);
        var result = Cartesian3.lerp(start, end, t);
        expect(result).toEqual(expectedResult);
    });

    it('lerp extrapolate backward', function() {
        var start = new Cartesian3(4.0, 8.0, 10.0);
        var end = new Cartesian3(8.0, 20.0, 20.0);
        var t = -1.0;
        var expectedResult = new Cartesian3(0.0, -4.0, 0.0);
        var result = Cartesian3.lerp(start, end, t);
        expect(result).toEqual(expectedResult);
    });

    it('angleBetween works for right angles', function() {
        var x = Cartesian3.UNIT_X;
        var y = Cartesian3.UNIT_Y;
        expect(Cartesian3.angleBetween(x, y)).toEqual(CesiumMath.PI_OVER_TWO);
        expect(Cartesian3.angleBetween(y, x)).toEqual(CesiumMath.PI_OVER_TWO);
    });

    it('angleBetween works for acute angles', function() {
        var x = new Cartesian3(0.0, 1.0, 0.0);
        var y = new Cartesian3(1.0, 1.0, 0.0);
        expect(Cartesian3.angleBetween(x, y)).toEqualEpsilon(CesiumMath.PI_OVER_FOUR, CesiumMath.EPSILON14);
        expect(Cartesian3.angleBetween(y, x)).toEqualEpsilon(CesiumMath.PI_OVER_FOUR, CesiumMath.EPSILON14);
    });

    it('angleBetween works for obtuse angles', function() {
        var x = new Cartesian3(0.0, 1.0, 0.0);
        var y = new Cartesian3(0.0, -1.0, -1.0);
        expect(Cartesian3.angleBetween(x, y)).toEqualEpsilon(CesiumMath.PI * 3.0 / 4.0, CesiumMath.EPSILON14);
        expect(Cartesian3.angleBetween(y, x)).toEqualEpsilon(CesiumMath.PI * 3.0 / 4.0, CesiumMath.EPSILON14);
    });

    it('angleBetween works for zero angles', function() {
        var x = Cartesian3.UNIT_X;
        expect(Cartesian3.angleBetween(x, x)).toEqual(0.0);
    });

    it('most orthogonal angle is x', function() {
        var v = new Cartesian3(0.0, 1.0, 2.0);
        expect(Cartesian3.mostOrthogonalAxis(v)).toEqual(Cartesian3.UNIT_X);
    });

    it('most orthogonal angle is y', function() {
        var v = new Cartesian3(1.0, 0.0, 2.0);
        expect(Cartesian3.mostOrthogonalAxis(v)).toEqual(Cartesian3.UNIT_Y);
    });

    it('most orthogonal angle is z', function() {
        var v = new Cartesian3(1.0, 3.0, 0.0);
        expect(Cartesian3.mostOrthogonalAxis(v)).toEqual(Cartesian3.UNIT_Z);

        v = new Cartesian3(3.0, 1.0, 0.0);
        expect(Cartesian3.mostOrthogonalAxis(v)).toEqual(Cartesian3.UNIT_Z);
    });

    it('equals', function() {
        var cartesian = new Cartesian3(1.0, 2.0, 3.0);
        expect(Cartesian3.equals(cartesian, new Cartesian3(1.0, 2.0, 3.0))).toEqual(true);
        expect(Cartesian3.equals(cartesian, new Cartesian3(2.0, 2.0, 3.0))).toEqual(false);
        expect(Cartesian3.equals(cartesian, new Cartesian3(2.0, 1.0, 3.0))).toEqual(false);
        expect(Cartesian3.equals(cartesian, new Cartesian3(1.0, 2.0, 4.0))).toEqual(false);
        expect(Cartesian3.equals(cartesian, undefined)).toEqual(false);
    });

    it('equalsEpsilon', function() {
        var cartesian = new Cartesian3(1.0, 2.0, 3.0);
        expect(Cartesian3.equalsEpsilon(cartesian, new Cartesian3(1.0, 2.0, 3.0), 0.0)).toEqual(true);
        expect(Cartesian3.equalsEpsilon(cartesian, new Cartesian3(1.0, 2.0, 3.0), 1.0)).toEqual(true);
        expect(Cartesian3.equalsEpsilon(cartesian, new Cartesian3(2.0, 2.0, 3.0), 1.0)).toEqual(true);
        expect(Cartesian3.equalsEpsilon(cartesian, new Cartesian3(1.0, 3.0, 3.0), 1.0)).toEqual(true);
        expect(Cartesian3.equalsEpsilon(cartesian, new Cartesian3(1.0, 2.0, 4.0), 1.0)).toEqual(true);
        expect(Cartesian3.equalsEpsilon(cartesian, new Cartesian3(2.0, 2.0, 3.0), 0.99999)).toEqual(false);
        expect(Cartesian3.equalsEpsilon(cartesian, new Cartesian3(1.0, 3.0, 3.0), 0.99999)).toEqual(false);
        expect(Cartesian3.equalsEpsilon(cartesian, new Cartesian3(1.0, 2.0, 4.0), 0.99999)).toEqual(false);
        expect(Cartesian3.equalsEpsilon(cartesian, undefined, 1)).toEqual(false);
    });

    it('toString', function() {
        var cartesian = new Cartesian3(1.123, 2.345, 6.789);
        expect(cartesian.toString()).toEqual('(1.123, 2.345, 6.789)');
    });

    it('cross works without a result parameter', function() {
        var left = new Cartesian3(1, 2, 5);
        var right = new Cartesian3(4, 3, 6);
        var expectedResult = new Cartesian3(-3, 14, -5);
        var returnedResult = Cartesian3.cross(left, right);
        expect(returnedResult).toEqual(expectedResult);
    });

    it('cross works with a result parameter', function() {
        var left = new Cartesian3(1, 2, 5);
        var right = new Cartesian3(4, 3, 6);
        var result = new Cartesian3();
        var expectedResult = new Cartesian3(-3, 14, -5);
        var returnedResult = Cartesian3.cross(left, right, result);
        expect(returnedResult).toBe(result);
        expect(result).toEqual(expectedResult);
    });

    it('cross works with a result parameter that is an input parameter', function() {
        var left = new Cartesian3(1, 2, 5);
        var right = new Cartesian3(4, 3, 6);
        var expectedResult = new Cartesian3(-3, 14, -5);
        var returnedResult = Cartesian3.cross(left, right, left);
        expect(returnedResult).toBe(left);
        expect(left).toEqual(expectedResult);
    });

    it('fromSpherical throws with no spherical parameter', function() {
        expect(function() {
            Cartesian3.fromSpherical(undefined);
        }).toThrowDeveloperError();
    });


    it('clone returns undefined with no parameter', function() {
        expect(Cartesian3.clone()).toBeUndefined();
    });

    it('getMaximumComponent throws with no parameter', function() {
        expect(function() {
            Cartesian3.getMaximumComponent();
        }).toThrowDeveloperError();
    });

    it('getMinimumComponent throws with no parameter', function() {
        expect(function() {
            Cartesian3.getMinimumComponent();
        }).toThrowDeveloperError();
    });

    it('magnitudeSquared throws with no parameter', function() {
        expect(function() {
            Cartesian3.magnitudeSquared();
        }).toThrowDeveloperError();
    });

    it('magnitude throws with no parameter', function() {
        expect(function() {
            Cartesian3.magnitude();
        }).toThrowDeveloperError();
    });

    it('normalize throws with no parameter', function() {
        expect(function() {
            Cartesian3.normalize();
        }).toThrowDeveloperError();
    });

    it('dot throws with no left parameter', function() {
        expect(function() {
            Cartesian3.dot(undefined, new Cartesian3());
        }).toThrowDeveloperError();
    });

    it('multiplyComponents throw with no left parameter', function() {
        var right = new Cartesian3(4.0, 5.0, 6.0);
        expect(function() {
            Cartesian3.multiplyComponents(undefined, right);
        }).toThrowDeveloperError();
    });

    it('multiplyComponents throw with no right parameter', function() {
        var left = new Cartesian3(4.0, 5.0, 6.0);
        expect(function() {
            Cartesian3.multiplyComponents(left, undefined);
        }).toThrowDeveloperError();
    });

    it('dot throws with no right parameter', function() {
        expect(function() {
            Cartesian3.dot(new Cartesian3(), undefined);
        }).toThrowDeveloperError();
    });

    it('add throws with no left parameter', function() {
        expect(function() {
            Cartesian3.add(undefined, new Cartesian3());
        }).toThrowDeveloperError();
    });

    it('add throws with no right parameter', function() {
        expect(function() {
            Cartesian3.add(new Cartesian3(), undefined);
        }).toThrowDeveloperError();
    });

    it('subtract throws with no left parameter', function() {
        expect(function() {
            Cartesian3.subtract(undefined, new Cartesian3());
        }).toThrowDeveloperError();
    });

    it('subtract throws with no right parameter', function() {
        expect(function() {
            Cartesian3.subtract(new Cartesian3(), undefined);
        }).toThrowDeveloperError();
    });

    it('multiplyByScalar throws with no cartesian parameter', function() {
        expect(function() {
            Cartesian3.multiplyByScalar(undefined, 2.0);
        }).toThrowDeveloperError();
    });

    it('multiplyByScalar throws with no scalar parameter', function() {
        expect(function() {
            Cartesian3.multiplyByScalar(new Cartesian3(), undefined);
        }).toThrowDeveloperError();
    });

    it('divideByScalar throws with no cartesian parameter', function() {
        expect(function() {
            Cartesian3.divideByScalar(undefined, 2.0);
        }).toThrowDeveloperError();
    });

    it('divideByScalar throws with no scalar parameter', function() {
        expect(function() {
            Cartesian3.divideByScalar(new Cartesian3(), undefined);
        }).toThrowDeveloperError();
    });

    it('negate throws with no cartesian parameter', function() {
        expect(function() {
            Cartesian3.negate(undefined);
        }).toThrowDeveloperError();
    });

    it('abs throws with no cartesian parameter', function() {
        expect(function() {
            Cartesian3.abs(undefined);
        }).toThrowDeveloperError();
    });

    it('lerp throws with no start parameter', function() {
        var end = new Cartesian3(8.0, 20.0, 6.0);
        var t = 0.25;
        expect(function() {
            Cartesian3.lerp(undefined, end, t);
        }).toThrowDeveloperError();
    });

    it('lerp throws with no end parameter', function() {
        var start = new Cartesian3(4.0, 8.0, 6.0);
        var t = 0.25;
        expect(function() {
            Cartesian3.lerp(start, undefined, t);
        }).toThrowDeveloperError();
    });

    it('lerp throws with no t parameter', function() {
        var start = new Cartesian3(4.0, 8.0, 6.0);
        var end = new Cartesian3(8.0, 20.0, 6.0);
        expect(function() {
            Cartesian3.lerp(start, end, undefined);
        }).toThrowDeveloperError();
    });

    it('angleBetween throws with no left parameter', function() {
        var right = new Cartesian3(8.0, 20.0, 6.0);
        expect(function() {
            Cartesian3.angleBetween(undefined, right);
        }).toThrowDeveloperError();
    });

    it('angleBetween throws with no right parameter', function() {
        var left = new Cartesian3(4.0, 8.0, 6.0);
        expect(function() {
            Cartesian3.angleBetween(left, undefined);
        }).toThrowDeveloperError();
    });

    it('mostOrthogonalAxis throws with no cartesian parameter', function() {
        expect(function() {
            Cartesian3.mostOrthogonalAxis(undefined);
        }).toThrowDeveloperError();
    });

    it('equalsEpsilon throws with no epsilon', function() {
        expect(function() {
            Cartesian3.equalsEpsilon(new Cartesian3(), new Cartesian3(), undefined);
        }).toThrowDeveloperError();
    });

    it('cross throw with no left paramater', function() {
        var right = new Cartesian3(4, 3, 6);
        expect(function() {
            Cartesian3.cross(undefined, right);
        }).toThrowDeveloperError();
    });

    it('cross throw with no left paramater', function() {
        var left = new Cartesian3(1, 2, 5);
        expect(function() {
            Cartesian3.cross(left, undefined);
        }).toThrowDeveloperError();
    });

    it('fromElements returns a cartesian3 with corrrect coordinates', function(){
        var cartesian = Cartesian3.fromElements(2, 2, 4);
        var expectedResult = new Cartesian3(2, 2, 4);
        expect(cartesian).toEqual(expectedResult);
    });

    it('fromElements result param returns cartesian3 with correct coordinates', function(){
        var cartesian3 = new Cartesian3();
        Cartesian3.fromElements(2, 2, 4, cartesian3);
        var expectedResult = new Cartesian3(2, 2, 4);
        expect(cartesian3).toEqual(expectedResult);
    });

    createPackableSpecs(Cartesian3, new Cartesian3(1, 2, 3), [1, 2, 3]);
});
