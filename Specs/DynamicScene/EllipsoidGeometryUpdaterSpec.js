/*global defineSuite*/
defineSuite(['DynamicScene/EllipsoidGeometryUpdater',
             'DynamicScene/DynamicObject',
             'DynamicScene/DynamicEllipsoid',
             'Core/Cartesian3',
             'Core/Color',
             'Core/JulianDate',
             'Core/Quaternion',
             'Core/TimeInterval',
             'Core/TimeIntervalCollection',
             'Core/ColorGeometryInstanceAttribute',
             'Core/ShowGeometryInstanceAttribute',
             'DynamicScene/ColorMaterialProperty',
             'DynamicScene/ConstantProperty',
             'DynamicScene/ConstantPositionProperty',
             'DynamicScene/GridMaterialProperty',
             'DynamicScene/SampledProperty',
             'DynamicScene/SampledPositionProperty',
             'DynamicScene/TimeIntervalCollectionProperty',
             'Scene/CompositePrimitive',
             'Specs/createScene',
             'Specs/destroyScene'
         ], function(
             EllipsoidGeometryUpdater,
             DynamicObject,
             DynamicEllipsoid,
             Cartesian3,
             Color,
             JulianDate,
             Quaternion,
             TimeInterval,
             TimeIntervalCollection,
             ColorGeometryInstanceAttribute,
             ShowGeometryInstanceAttribute,
             ColorMaterialProperty,
             ConstantProperty,
             ConstantPositionProperty,
             GridMaterialProperty,
             SampledProperty,
             SampledPositionProperty,
             TimeIntervalCollectionProperty,
             CompositePrimitive,
             createScene,
             destroyScene) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    var time = new JulianDate();
    var scene;
    beforeEach(function() {
        scene = createScene();
    });

    afterEach(function() {
        destroyScene(scene);
    });
    function createBasicEllipsoid() {
        var ellipsoid = new DynamicEllipsoid();
        ellipsoid.radii = new ConstantProperty(new Cartesian3(1, 2, 3));

        var dynamicObject = new DynamicObject();
        dynamicObject.position = new ConstantPositionProperty(Cartesian3.ZERO);
        dynamicObject.orientation = new ConstantProperty(Quaternion.IDENTITY);
        dynamicObject.ellipsoid = ellipsoid;
        return dynamicObject;
    }

    it('Constructor sets expected defaults', function() {
        var dynamicObject = new DynamicObject();
        var updater = new EllipsoidGeometryUpdater(dynamicObject, scene);

        expect(updater.isDestroyed()).toBe(false);
        expect(updater.dynamicObject).toBe(dynamicObject);
        expect(updater.isClosed).toBe(true);
        expect(updater.fillEnabled).toBe(false);
        expect(updater.fillMaterialProperty).toBe(undefined);
        expect(updater.outlineEnabled).toBe(false);
        expect(updater.hasConstantFill).toBe(true);
        expect(updater.hasConstantOutline).toBe(true);
        expect(updater.outlineColorProperty).toBe(undefined);
        expect(updater.isDynamic).toBe(false);
        expect(updater.isOutlineVisible(time)).toBe(false);
        expect(updater.isFilled(time)).toBe(false);
        updater.destroy();
        expect(updater.isDestroyed()).toBe(true);
    });

    it('No geometry available when ellipsoid is undefined ', function() {
        var dynamicObject = createBasicEllipsoid();
        var updater = new EllipsoidGeometryUpdater(dynamicObject, scene);
        dynamicObject.ellipsoid = undefined;

        expect(updater.fillEnabled).toBe(false);
        expect(updater.outlineEnabled).toBe(false);
        expect(updater.isDynamic).toBe(false);
    });

    it('No geometry available when radii is undefined', function() {
        var dynamicObject = createBasicEllipsoid();
        var updater = new EllipsoidGeometryUpdater(dynamicObject, scene);
        dynamicObject.ellipsoid.radii = undefined;

        expect(updater.fillEnabled).toBe(false);
        expect(updater.outlineEnabled).toBe(false);
        expect(updater.isDynamic).toBe(false);
    });

    it('No geometry available when not filled or outline.', function() {
        var dynamicObject = createBasicEllipsoid();
        var updater = new EllipsoidGeometryUpdater(dynamicObject, scene);
        dynamicObject.ellipsoid.fill = new ConstantProperty(false);
        dynamicObject.ellipsoid.outline = new ConstantProperty(false);

        expect(updater.fillEnabled).toBe(false);
        expect(updater.outlineEnabled).toBe(false);
        expect(updater.isDynamic).toBe(false);
    });

    it('Values correct when using default graphics', function() {
        var dynamicObject = createBasicEllipsoid();
        var updater = new EllipsoidGeometryUpdater(dynamicObject, scene);

        expect(updater.fillEnabled).toBe(true);
        expect(updater.fillMaterialProperty).toEqual(ColorMaterialProperty.fromColor(Color.WHITE));
        expect(updater.outlineEnabled).toBe(false);
        expect(updater.hasConstantFill).toBe(true);
        expect(updater.hasConstantOutline).toBe(true);
        expect(updater.outlineColorProperty).toBe(undefined);
        expect(updater.isDynamic).toBe(false);
    });

    it('Ellipsoid material is correctly exposed.', function() {
        var dynamicObject = createBasicEllipsoid();
        var updater = new EllipsoidGeometryUpdater(dynamicObject, scene);
        dynamicObject.ellipsoid.material = new GridMaterialProperty(Color.BLUE);
        expect(updater.fillMaterialProperty).toBe(dynamicObject.ellipsoid.material);
    });

    it('A time-varying position causes geometry to be dynamic', function() {
        var dynamicObject = createBasicEllipsoid();
        var updater = new EllipsoidGeometryUpdater(dynamicObject, scene);
        dynamicObject.position = new SampledPositionProperty();
        dynamicObject.position.addSample(time, Cartesian3.ZERO);
        expect(updater.isDynamic).toBe(true);
    });

    it('A time-varying radii causes geometry to be dynamic', function() {
        var dynamicObject = createBasicEllipsoid();
        var updater = new EllipsoidGeometryUpdater(dynamicObject, scene);
        dynamicObject.ellipsoid.radii = new SampledProperty(Cartesian3);
        dynamicObject.ellipsoid.radii.addSample(time, new Cartesian3(1, 2, 3));
        expect(updater.isDynamic).toBe(true);
    });

    it('A time-varying stackPartitions causes geometry to be dynamic', function() {
        var dynamicObject = createBasicEllipsoid();
        var updater = new EllipsoidGeometryUpdater(dynamicObject, scene);
        dynamicObject.ellipsoid.stackPartitions = new SampledProperty(Number);
        dynamicObject.ellipsoid.stackPartitions.addSample(time, 1);
        expect(updater.isDynamic).toBe(true);
    });

    it('A time-varying slicePartitions causes geometry to be dynamic', function() {
        var dynamicObject = createBasicEllipsoid();
        var updater = new EllipsoidGeometryUpdater(dynamicObject, scene);
        dynamicObject.ellipsoid.slicePartitions = new SampledProperty(Number);
        dynamicObject.ellipsoid.slicePartitions.addSample(time, 1);
        expect(updater.isDynamic).toBe(true);
    });

    it('A time-varying subdivisions causes geometry to be dynamic', function() {
        var dynamicObject = createBasicEllipsoid();
        var updater = new EllipsoidGeometryUpdater(dynamicObject, scene);
        dynamicObject.ellipsoid.subdivisions = new SampledProperty(Number);
        dynamicObject.ellipsoid.subdivisions.addSample(time, 1);
        expect(updater.isDynamic).toBe(true);
    });

    function validateGeometryInstance(options) {
        var dynamicObject = new DynamicObject();
        dynamicObject.position = new ConstantPositionProperty(options.position);
        dynamicObject.orientation = new ConstantProperty(options.orientation);

        var ellipsoid = new DynamicEllipsoid();
        ellipsoid.show = new ConstantProperty(options.show);
        ellipsoid.fill = new ConstantProperty(options.fill);
        ellipsoid.material = options.material;
        ellipsoid.outline = new ConstantProperty(options.outline);
        ellipsoid.outlineColor = new ConstantProperty(options.outlineColor);
        ellipsoid.numberOfVerticalLines = new ConstantProperty(options.numberOfVerticalLines);
        ellipsoid.radii = new ConstantProperty(options.radii);
        ellipsoid.stackPartitions = new ConstantProperty(options.stackPartitions);
        ellipsoid.slicePartitions = new ConstantProperty(options.slicePartitions);
        ellipsoid.subdivisions = new ConstantProperty(options.subdivisions);
        dynamicObject.ellipsoid = ellipsoid;

        var updater = new EllipsoidGeometryUpdater(dynamicObject, scene);

        var instance;
        var geometry;
        var attributes;
        if (options.fill) {
            instance = updater.createFillGeometryInstance(time);
            geometry = instance.geometry;
            expect(geometry._center).toEqual(options.center);
            expect(geometry._radii).toEqual(options.radii);
            expect(geometry._stackPartitions).toEqual(options.stackPartitions);
            expect(geometry._slicePartitions).toEqual(options.slicePartitions);

            attributes = instance.attributes;
            if (options.material instanceof ColorMaterialProperty) {
                expect(attributes.color.value).toEqual(ColorGeometryInstanceAttribute.toValue(options.material.color.getValue(time)));
            } else {
                expect(attributes.color).toBeUndefined();
            }
            expect(attributes.show.value).toEqual(ShowGeometryInstanceAttribute.toValue(options.fill));
        }

        if (options.outline) {
            instance = updater.createOutlineGeometryInstance(time);
            geometry = instance.geometry;
            expect(geometry._center).toEqual(options.center);
            expect(geometry._radii).toEqual(options.radii);
            expect(geometry._stackPartitions).toEqual(options.stackPartitions);
            expect(geometry._slicePartitions).toEqual(options.slicePartitions);
            expect(geometry._subdivisions).toEqual(options.subdivisions);

            attributes = instance.attributes;
            expect(attributes.color.value).toEqual(ColorGeometryInstanceAttribute.toValue(options.outlineColor));
            expect(attributes.show.value).toEqual(ShowGeometryInstanceAttribute.toValue(options.fill));
        }
    }

    it('Creates expected per-color geometry', function() {
        validateGeometryInstance({
            position : new Cartesian3(4, 5, 6),
            orientation : Quaternion.IDENTITY,
            radii : new Cartesian3(1, 2, 3),
            show : true,
            material : ColorMaterialProperty.fromColor(Color.RED),
            fill : true,
            outline : true,
            outlineColor : Color.BLUE,
            stackPartitions : 32,
            slicePartitions : 64,
            subdivisions : 15
        });
    });

    it('Creates expected per-material geometry', function() {
        validateGeometryInstance({
            position : new Cartesian3(4, 5, 6),
            orientation : Quaternion.IDENTITY,
            radii : new Cartesian3(1, 2, 3),
            show : true,
            material : new GridMaterialProperty(),
            fill : true,
            outline : true,
            outlineColor : Color.BLUE,
            stackPartitions : 32,
            slicePartitions : 64,
            subdivisions : 15
        });
    });

    it('Attributes have expected values at creation time', function() {
        var time1 = new JulianDate(0, 0);
        var time2 = new JulianDate(10, 0);
        var time3 = new JulianDate(20, 0);

        var fill = new TimeIntervalCollectionProperty();
        fill.intervals.addInterval(new TimeInterval(time1, time2, true, true, false));
        fill.intervals.addInterval(new TimeInterval(time2, time3, false, true, true));

        var colorMaterial = new ColorMaterialProperty();
        colorMaterial.color = new SampledProperty(Color);
        colorMaterial.color.addSample(time, Color.YELLOW);
        colorMaterial.color.addSample(time2, Color.BLUE);
        colorMaterial.color.addSample(time3, Color.RED);

        var outline = new TimeIntervalCollectionProperty();
        outline.intervals.addInterval(new TimeInterval(time1, time2, true, true, false));
        outline.intervals.addInterval(new TimeInterval(time2, time3, false, true, true));

        var outlineColor = new SampledProperty(Color);
        outlineColor.addSample(time, Color.BLUE);
        outlineColor.addSample(time2, Color.RED);
        outlineColor.addSample(time3, Color.YELLOW);

        var dynamicObject = createBasicEllipsoid();
        dynamicObject.ellipsoid.fill = fill;
        dynamicObject.ellipsoid.material = colorMaterial;
        dynamicObject.ellipsoid.outline = outline;
        dynamicObject.ellipsoid.outlineColor = outlineColor;

        var updater = new EllipsoidGeometryUpdater(dynamicObject, scene);

        var instance = updater.createFillGeometryInstance(time2);
        var attributes = instance.attributes;
        expect(attributes.color.value).toEqual(ColorGeometryInstanceAttribute.toValue(colorMaterial.color.getValue(time2)));
        expect(attributes.show.value).toEqual(ShowGeometryInstanceAttribute.toValue(fill.getValue(time2)));

        instance = updater.createOutlineGeometryInstance(time2);
        attributes = instance.attributes;
        expect(attributes.color.value).toEqual(ColorGeometryInstanceAttribute.toValue(outlineColor.getValue(time2)));
        expect(attributes.show.value).toEqual(ShowGeometryInstanceAttribute.toValue(outline.getValue(time2)));
    });

    it('dynamic updater sets properties', function() {
        //This test is mostly a smoke screen for now.
        var time1 = new JulianDate(0, 0);
        var time2 = new JulianDate(1, 0);
        var time3 = new JulianDate(2, 0);

        function makeProperty(value1, value2) {
            var property = new TimeIntervalCollectionProperty();
            property.intervals.addInterval(new TimeInterval(time1, time2, true, false, value1));
            property.intervals.addInterval(new TimeInterval(time2, time3, true, false, value2));
            return property;
        }

        var ellipsoid = new DynamicEllipsoid();
        ellipsoid.radii = makeProperty(new Cartesian3(1, 2, 3), new Cartesian3(4, 5, 6));
        ellipsoid.outline = makeProperty(true, false);
        ellipsoid.fill = makeProperty(false, true);

        var dynamicObject = new DynamicObject();
        dynamicObject.availability = new TimeIntervalCollection();
        dynamicObject.availability.addInterval(new TimeInterval(time1, time3, true, false));
        dynamicObject.position = makeProperty(Cartesian3.UNIT_Z, Cartesian3.UNIT_Y);
        dynamicObject.orientation = makeProperty(Quaternion.IDENTITY, new Quaternion(0, 1, 0, 0));
        dynamicObject.ellipsoid = ellipsoid;

        var updater = new EllipsoidGeometryUpdater(dynamicObject, scene);
        var primitives = new CompositePrimitive();
        var dynamicUpdater = updater.createDynamicUpdater(primitives);
        expect(dynamicUpdater.isDestroyed()).toBe(false);
        expect(primitives.length).toBe(0);
        dynamicUpdater.update(time1);
        expect(primitives.length).toBe(2); //Ellipsoid always has both fill and outline primitives.
        dynamicUpdater.destroy();
        expect(primitives.length).toBe(0);
        updater.destroy();
    });

    it('geometryChanged event is raised when expected', function() {
        var dynamicObject = createBasicEllipsoid();
        var updater = new EllipsoidGeometryUpdater(dynamicObject, scene);

        var listener = jasmine.createSpy('listener');
        updater.geometryChanged.addEventListener(listener);

        dynamicObject.position = new ConstantPositionProperty(Cartesian3.UNIT_Z);
        expect(listener.callCount).toEqual(1);

        dynamicObject.ellipsoid.radii = new ConstantProperty(new Cartesian3(1, 2, 3));
        expect(listener.callCount).toEqual(2);

        dynamicObject.availability = new TimeIntervalCollection();
        expect(listener.callCount).toEqual(3);

        dynamicObject.ellipsoid.radii = undefined;
        expect(listener.callCount).toEqual(4);

        //Modifying an unrelated property should not have any effect.
        dynamicObject.viewFrom = new ConstantProperty(Cartesian3.UNIT_X);
        expect(listener.callCount).toEqual(4);

        dynamicObject.ellipsoid.radii = new SampledProperty(Cartesian3);
        expect(listener.callCount).toEqual(5);
    });

    it('createFillGeometryInstance throws if object is not filled', function() {
        var dynamicObject = new DynamicObject();
        var updater = new EllipsoidGeometryUpdater(dynamicObject, scene);
        expect(function() {
            return updater.createFillGeometryInstance(time);
        }).toThrowDeveloperError();
    });

    it('createFillGeometryInstance throws if no time provided', function() {
        var dynamicObject = createBasicEllipsoid();
        var updater = new EllipsoidGeometryUpdater(dynamicObject, scene);
        expect(function() {
            return updater.createFillGeometryInstance(undefined);
        }).toThrowDeveloperError();
    });

    it('createOutlineGeometryInstance throws if object is not outlined', function() {
        var dynamicObject = new DynamicObject();
        var updater = new EllipsoidGeometryUpdater(dynamicObject, scene);
        expect(function() {
            return updater.createOutlineGeometryInstance(time);
        }).toThrowDeveloperError();
    });

    it('createOutlineGeometryInstance throws if no time provided', function() {
        var dynamicObject = createBasicEllipsoid();
        dynamicObject.ellipsoid.outline = new ConstantProperty(true);
        var updater = new EllipsoidGeometryUpdater(dynamicObject, scene);
        expect(function() {
            return updater.createOutlineGeometryInstance(undefined);
        }).toThrowDeveloperError();
    });

    it('createDynamicUpdater throws if not dynamic', function() {
        var dynamicObject = createBasicEllipsoid();
        var updater = new EllipsoidGeometryUpdater(dynamicObject, scene);
        expect(function() {
            return updater.createDynamicUpdater(new CompositePrimitive());
        }).toThrowDeveloperError();
    });

    it('createDynamicUpdater throws if primitives undefined', function() {
        var dynamicObject = createBasicEllipsoid();
        dynamicObject.ellipsoid.radii = new SampledProperty(Number);
        dynamicObject.ellipsoid.radii.addSample(time, 4);
        var updater = new EllipsoidGeometryUpdater(dynamicObject, scene);
        expect(updater.isDynamic).toBe(true);
        expect(function() {
            return updater.createDynamicUpdater(undefined);
        }).toThrowDeveloperError();
    });

    it('dynamicUpdater.update throws if no time specified', function() {
        var dynamicObject = createBasicEllipsoid();
        dynamicObject.ellipsoid.radii = new SampledProperty(Number);
        dynamicObject.ellipsoid.radii.addSample(time, 4);
        var updater = new EllipsoidGeometryUpdater(dynamicObject, scene);
        var dynamicUpdater = updater.createDynamicUpdater(new CompositePrimitive());
        expect(function() {
            dynamicUpdater.update(undefined);
        }).toThrowDeveloperError();
    });

    it('Constructor throws if no DynamicObject supplied', function() {
        expect(function() {
            return new EllipsoidGeometryUpdater(undefined);
        }).toThrowDeveloperError();
    });
});