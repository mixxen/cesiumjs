/*global defineSuite*/
defineSuite([
             'DynamicScene/DynamicObject',
             'DynamicScene/ConstantProperty',
             'Core/JulianDate',
             'Core/Cartesian3',
             'Core/Quaternion',
             'Core/Iso8601',
             'Core/TimeInterval'
            ], function(
              DynamicObject,
              ConstantProperty,
              JulianDate,
              Cartesian3,
              Quaternion,
              Iso8601,
              TimeInterval) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    it('constructor sets id.', function() {
        var dynamicObject = new DynamicObject('someId');
        expect(dynamicObject.id).toEqual('someId');
    });

    it('isAvailable is always true if no availability defined.', function() {
        var dynamicObject = new DynamicObject('someId');
        expect(dynamicObject.isAvailable(new JulianDate())).toEqual(true);
    });

    it('isAvailable throw if no time specified.', function() {
        var dynamicObject = new DynamicObject('someId');
        expect(function() {
            dynamicObject.isAvailable();
        }).toThrowDeveloperError();
    });

    it('constructor creates a unique id if one is not provided.', function() {
        var object = new DynamicObject();
        var object2 = new DynamicObject();
        expect(object.id).toBeDefined();
        expect(object.id).toNotEqual(object2.id);
    });

    it('isAvailable works.', function() {
        var dynamicObject = new DynamicObject();
        var interval = TimeInterval.fromIso8601('2000-01-01/2001-01-01');
        dynamicObject.availability = interval;
        expect(dynamicObject.isAvailable(interval.start.addSeconds(-1))).toEqual(false);
        expect(dynamicObject.isAvailable(interval.start)).toEqual(true);
        expect(dynamicObject.isAvailable(interval.stop)).toEqual(true);
        expect(dynamicObject.isAvailable(interval.stop.addSeconds(1))).toEqual(false);
    });

    it('definitionChanged works for all properties', function() {
        var dynamicObject = new DynamicObject();
        var propertyNames = dynamicObject.propertyNames;
        var propertyNamesLength = propertyNames.length;

        var listener = jasmine.createSpy('listener');
        dynamicObject.definitionChanged.addEventListener(listener);

        var i;
        var name;
        var newValue;
        var oldValue;
        //We loop through twice to ensure that oldValue is properly passed in.
        for ( var x = 0; x < 2; x++) {
            for (i = 0; i < propertyNamesLength; i++) {
                name = propertyNames[i];
                newValue = new ConstantProperty(1);
                oldValue = dynamicObject[propertyNames[i]];
                dynamicObject[name] = newValue;
                expect(listener).toHaveBeenCalledWith(dynamicObject, name, newValue, oldValue);
            }
        }
    });

    it('merge always overwrites availability', function() {
        var dynamicObject = new DynamicObject();
        var interval = TimeInterval.fromIso8601('2000-01-01/2001-01-01');
        dynamicObject.availability = interval;

        var dynamicObject2 = new DynamicObject();
        var interval2 = TimeInterval.fromIso8601('2000-01-01/2001-01-01');
        dynamicObject2.availability = interval2;

        dynamicObject.merge(dynamicObject2);
        expect(dynamicObject.availability).toBe(interval2);
    });

    it('merge throws with undefined source', function() {
        var dynamicObject = new DynamicObject();
        expect(function() {
            dynamicObject.merge(undefined);
        }).toThrowDeveloperError();
    });

    it('can add and remove custom properties.', function() {
        var dynamicObject = new DynamicObject();
        expect(dynamicObject.hasOwnProperty('bob')).toBe(false);
        dynamicObject.addProperty('bob');
        expect(dynamicObject.hasOwnProperty('bob')).toBe(true);
        dynamicObject.removeProperty('bob');
        expect(dynamicObject.hasOwnProperty('bob')).toBe(false);
    });

    it('addProperty throws with no property specified.', function() {
        var dynamicObject = new DynamicObject();
        expect(function() {
            dynamicObject.addProperty(undefined);
        }).toThrowDeveloperError();
    });

    it('addProperty throws with no property specified.', function() {
        var dynamicObject = new DynamicObject();
        expect(function() {
            dynamicObject.addProperty(undefined);
        }).toThrowDeveloperError();
    });

    it('removeProperty throws with no property specified.', function() {
        var dynamicObject = new DynamicObject();
        expect(function() {
            dynamicObject.removeProperty(undefined);
        }).toThrowDeveloperError();
    });

    it('addProperty throws when adding an existing property.', function() {
        var dynamicObject = new DynamicObject();
        dynamicObject.addProperty('bob');
        expect(function() {
            dynamicObject.addProperty('bob');
        }).toThrowDeveloperError();
    });

    it('removeProperty throws when non-existent property.', function() {
        var dynamicObject = new DynamicObject();
        expect(function() {
            dynamicObject.removeProperty('bob');
        }).toThrowDeveloperError();
    });

    it('addProperty throws with reserved property name.', function() {
        var dynamicObject = new DynamicObject();
        expect(function() {
            dynamicObject.addProperty('merge');
        }).toThrowDeveloperError();
    });

    it('removeProperty throws with reserved property name.', function() {
        var dynamicObject = new DynamicObject();
        expect(function() {
            dynamicObject.removeProperty('merge');
        }).toThrowDeveloperError();
    });
});