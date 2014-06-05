/*global defineSuite*/
defineSuite(['DynamicScene/ColorMaterialProperty',
             'DynamicScene/ConstantProperty',
             'DynamicScene/TimeIntervalCollectionProperty',
             'Core/Color',
             'Core/JulianDate',
             'Core/TimeInterval'
     ], function(
             ColorMaterialProperty,
             ConstantProperty,
             TimeIntervalCollectionProperty,
             Color,
             JulianDate,
             TimeInterval) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    it('constructor provides the expected defaults', function() {
        var property = new ColorMaterialProperty();
        expect(property.color).toEqual(new ConstantProperty(Color.WHITE));
        expect(property.getType()).toEqual('Color');
        expect(property.isConstant).toBe(true);

        var colorProperty = new ConstantProperty(Color.BLUE);
        property = new ColorMaterialProperty(colorProperty);
        expect(property.color).toBe(colorProperty);
        expect(property.getType()).toEqual('Color');
        expect(property.isConstant).toBe(true);

        property = ColorMaterialProperty.fromColor(Color.BLUE);
        expect(property.color).toEqual(colorProperty);
    });

    it('works with constant values', function() {
        var property = new ColorMaterialProperty();
        property.color = new ConstantProperty(Color.RED);

        var result = property.getValue(new JulianDate());
        expect(result.color).toEqual(Color.RED);
    });

    it('works with undefined values', function() {
        var property = new ColorMaterialProperty();
        property.color = new ConstantProperty();

        var result = property.getValue();
        expect(result.hasOwnProperty('color')).toEqual(true);
        expect(result.color).toBeUndefined();
    });

    it('works with dynamic values', function() {
        var property = new ColorMaterialProperty();
        property.color = new TimeIntervalCollectionProperty();

        var start = new JulianDate(1, 0);
        var stop = new JulianDate(2, 0);
        property.color.intervals.addInterval(new TimeInterval(start, stop, true, true, Color.BLUE));

        expect(property.isConstant).toBe(false);

        var result = property.getValue(start);
        expect(result.color).toEqual(Color.BLUE);
    });

    it('works with a result parameter', function() {
        var property = new ColorMaterialProperty();
        property.color = new ConstantProperty(Color.RED);

        var result = {
            color : Color.BLUE.clone()
        };
        var returnedResult = property.getValue(new JulianDate(), result);
        expect(returnedResult).toBe(result);
        expect(result.color).toEqual(Color.RED);
    });

    it('equals works', function() {
        var left = new ColorMaterialProperty();
        left.color = new ConstantProperty(Color.WHITE);

        var right = new ColorMaterialProperty();
        right.color = new ConstantProperty(Color.WHITE);
        expect(left.equals(right)).toEqual(true);

        right.color = new ConstantProperty(Color.BLACK);
        expect(left.equals(right)).toEqual(false);
    });

    it('raises definitionChanged when a color property is assigned or modified', function() {
        var property = new ColorMaterialProperty();

        var listener = jasmine.createSpy('listener');
        property.definitionChanged.addEventListener(listener);

        var oldValue = property.color;
        property.color = new ConstantProperty(Color.WHITE);
        expect(listener).toHaveBeenCalledWith(property, 'color', property.color, oldValue);
        listener.reset();

        property.color.setValue(Color.BLACK);
        expect(listener).toHaveBeenCalledWith(property, 'color', property.color, property.color);
        listener.reset();

        property.color = property.color;
        expect(listener.callCount).toEqual(0);
    });
});