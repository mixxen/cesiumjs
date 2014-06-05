/*global defineSuite*/
defineSuite([
             'DynamicScene/DynamicLabelVisualizer',
             'Specs/createScene',
             'Specs/destroyScene',
             'DynamicScene/ConstantProperty',
             'DynamicScene/DynamicLabel',
             'DynamicScene/DynamicObjectCollection',
             'Core/JulianDate',
             'Core/Cartesian2',
             'Core/Cartesian3',
             'Core/Color',
             'Core/NearFarScalar',
             'Scene/LabelCollection',
             'Scene/HorizontalOrigin',
             'Scene/VerticalOrigin',
             'Scene/LabelStyle'
            ], function(
              DynamicLabelVisualizer,
              createScene,
              destroyScene,
              ConstantProperty,
              DynamicLabel,
              DynamicObjectCollection,
              JulianDate,
              Cartesian2,
              Cartesian3,
              Color,
              NearFarScalar,
              LabelCollection,
              HorizontalOrigin,
              VerticalOrigin,
              LabelStyle) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    var scene;
    var visualizer;

    beforeAll(function() {
        scene = createScene();
    });

    afterAll(function() {
        destroyScene(scene);
    });

    afterEach(function() {
        visualizer = visualizer && visualizer.destroy();
    });

    it('constructor throws if no scene is passed.', function() {
        expect(function() {
            return new DynamicLabelVisualizer();
        }).toThrowDeveloperError();
    });

    it('constructor sets expected parameters and adds collection to scene.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new DynamicLabelVisualizer(scene, dynamicObjectCollection);
        expect(visualizer.getScene()).toEqual(scene);
        expect(visualizer.getDynamicObjectCollection()).toEqual(dynamicObjectCollection);
        var labelCollection = scene.primitives.get(0);
        expect(labelCollection instanceof LabelCollection).toEqual(true);
    });

    it('update throws if no time specified.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new DynamicLabelVisualizer(scene, dynamicObjectCollection);
        expect(function() {
            visualizer.update();
        }).toThrowDeveloperError();
    });

    it('update does nothing if no dynamicObjectCollection.', function() {
        visualizer = new DynamicLabelVisualizer(scene);
        visualizer.update(new JulianDate());
    });

    it('isDestroy returns false until destroyed.', function() {
        visualizer = new DynamicLabelVisualizer(scene);
        expect(visualizer.isDestroyed()).toEqual(false);
        visualizer.destroy();
        expect(visualizer.isDestroyed()).toEqual(true);
        visualizer = undefined;
    });

    it('object with no label does not create a label.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new DynamicLabelVisualizer(scene, dynamicObjectCollection);

        var testObject = dynamicObjectCollection.getOrCreateObject('test');
        testObject.position = new ConstantProperty(new Cartesian3(1234, 5678, 9101112));
        visualizer.update(new JulianDate());
        var labelCollection = scene.primitives.get(0);
        expect(labelCollection.length).toEqual(0);
    });

    it('object with no position does not create a label.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new DynamicLabelVisualizer(scene, dynamicObjectCollection);

        var testObject = dynamicObjectCollection.getOrCreateObject('test');
        var label = testObject.label = new DynamicLabel();
        label.show = new ConstantProperty(true);
        label.text = new ConstantProperty('lorum ipsum');

        visualizer.update(new JulianDate());
        var labelCollection = scene.primitives.get(0);
        expect(labelCollection.length).toEqual(0);
    });

    it('object with no text does not create a label.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new DynamicLabelVisualizer(scene, dynamicObjectCollection);

        var testObject = dynamicObjectCollection.getOrCreateObject('test');
        testObject.position = new ConstantProperty(new Cartesian3(1234, 5678, 9101112));
        var label = testObject.label = new DynamicLabel();
        label.show = new ConstantProperty(true);

        visualizer.update(new JulianDate());
        var labelCollection = scene.primitives.get(0);
        expect(labelCollection.length).toEqual(0);
    });

    it('A DynamicLabel causes a label to be created and updated.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new DynamicLabelVisualizer(scene, dynamicObjectCollection);

        var labelCollection = scene.primitives.get(0);
        expect(labelCollection.length).toEqual(0);

        var testObject = dynamicObjectCollection.getOrCreateObject('test');

        var time = new JulianDate();
        var label = testObject.label = new DynamicLabel();
        var l;

        testObject.position = new ConstantProperty(new Cartesian3(1234, 5678, 9101112));
        label.text = new ConstantProperty('a');
        label.font = new ConstantProperty('sans serif');
        label.style = new ConstantProperty(LabelStyle.FILL);
        label.fillColor = new ConstantProperty(new Color(0.5, 0.8, 0.6, 0.7));
        label.outlineColor = new ConstantProperty(new Color(0.4, 0.3, 0.2, 0.1));
        label.outlineWidth = new ConstantProperty(4.5);
        label.horizontalOrigin = new ConstantProperty(HorizontalOrigin.RIGHT);
        label.verticalOrigin = new ConstantProperty(VerticalOrigin.TOP);
        label.eyeOffset = new ConstantProperty(new Cartesian3(1.0, 2.0, 3.0));
        label.pixelOffset = new ConstantProperty(new Cartesian2(3, 2));
        label.scale = new ConstantProperty(12.5);
        label.show = new ConstantProperty(true);
        label.translucencyByDistance = new ConstantProperty(new NearFarScalar());
        label.pixelOffsetScaleByDistance = new ConstantProperty(new NearFarScalar());

        visualizer.update(time);

        expect(labelCollection.length).toEqual(1);

        l = labelCollection.get(0);

        visualizer.update(time);
        expect(l.position).toEqual(testObject.position.getValue(time));
        expect(l.text).toEqual(testObject.label.text.getValue(time));
        expect(l.font).toEqual(testObject.label.font.getValue(time));
        expect(l.style).toEqual(testObject.label.style.getValue(time));
        expect(l.fillColor).toEqual(testObject.label.fillColor.getValue(time));
        expect(l.outlineColor).toEqual(testObject.label.outlineColor.getValue(time));
        expect(l.outlineWidth).toEqual(testObject.label.outlineWidth.getValue(time));
        expect(l.horizontalOrigin).toEqual(testObject.label.horizontalOrigin.getValue(time));
        expect(l.verticalOrigin).toEqual(testObject.label.verticalOrigin.getValue(time));
        expect(l.eyeOffset).toEqual(testObject.label.eyeOffset.getValue(time));
        expect(l.pixelOffset).toEqual(testObject.label.pixelOffset.getValue(time));
        expect(l.scale).toEqual(testObject.label.scale.getValue(time));
        expect(l.show).toEqual(testObject.label.show.getValue(time));
        expect(l.translucencyByDistance).toEqual(testObject.label.translucencyByDistance.getValue(time));
        expect(l.pixelOffsetScaleByDistance).toEqual(testObject.label.pixelOffsetScaleByDistance.getValue(time));

        testObject.position = new ConstantProperty(new Cartesian3(5678, 1234, 1293434));
        label.text = new ConstantProperty('b');
        label.font = new ConstantProperty('serif');
        label.style = new ConstantProperty(LabelStyle.FILL_AND_OUTLINE);
        label.fillColor = new ConstantProperty(new Color(0.1, 0.2, 0.3, 0.4));
        label.outlineColor = new ConstantProperty(new Color(0.8, 0.7, 0.6, 0.5));
        label.outlineWidth = new ConstantProperty(0.5);
        label.horizontalOrigin = new ConstantProperty(HorizontalOrigin.CENTER);
        label.verticalOrigin = new ConstantProperty(VerticalOrigin.BOTTOM);
        label.eyeOffset = new ConstantProperty(new Cartesian3(3.0, 1.0, 2.0));
        label.pixelOffset = new ConstantProperty(new Cartesian2(2, 3));
        label.scale = new ConstantProperty(2.5);
        label.show = new ConstantProperty(true);
        label.translucencyByDistance = new ConstantProperty(new NearFarScalar());
        label.pixelOffsetScaleByDistance = new ConstantProperty(new NearFarScalar());

        visualizer.update(time);
        expect(l.position).toEqual(testObject.position.getValue(time));
        expect(l.text).toEqual(testObject.label.text.getValue(time));
        expect(l.font).toEqual(testObject.label.font.getValue(time));
        expect(l.style).toEqual(testObject.label.style.getValue(time));
        expect(l.fillColor).toEqual(testObject.label.fillColor.getValue(time));
        expect(l.outlineColor).toEqual(testObject.label.outlineColor.getValue(time));
        expect(l.outlineWidth).toEqual(testObject.label.outlineWidth.getValue(time));
        expect(l.horizontalOrigin).toEqual(testObject.label.horizontalOrigin.getValue(time));
        expect(l.verticalOrigin).toEqual(testObject.label.verticalOrigin.getValue(time));
        expect(l.eyeOffset).toEqual(testObject.label.eyeOffset.getValue(time));
        expect(l.pixelOffset).toEqual(testObject.label.pixelOffset.getValue(time));
        expect(l.scale).toEqual(testObject.label.scale.getValue(time));
        expect(l.show).toEqual(testObject.label.show.getValue(time));
        expect(l.translucencyByDistance).toEqual(testObject.label.translucencyByDistance.getValue(time));
        expect(l.pixelOffsetScaleByDistance).toEqual(testObject.label.pixelOffsetScaleByDistance.getValue(time));

        label.show = new ConstantProperty(false);
        visualizer.update(time);
    });

    it('clear hides labels.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new DynamicLabelVisualizer(scene, dynamicObjectCollection);

        var labelCollection = scene.primitives.get(0);
        expect(labelCollection.length).toEqual(0);

        var testObject = dynamicObjectCollection.getOrCreateObject('test');

        var time = new JulianDate();
        var label = testObject.label = new DynamicLabel();

        testObject.position = new ConstantProperty(new Cartesian3(1234, 5678, 9101112));
        label.show = new ConstantProperty(true);
        label.text = new ConstantProperty('lorum ipsum');
        visualizer.update(time);

        expect(labelCollection.length).toEqual(1);
        var l = labelCollection.get(0);
        expect(l.show).toEqual(true);

        //Clearing won't actually remove the label because of the
        //internal cache used by the visualizer, instead it just hides it.
        dynamicObjectCollection.removeAll();
        visualizer.update(time);
        expect(l.show).toEqual(false);
    });

    it('Visualizer sets dynamicObject property.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        visualizer = new DynamicLabelVisualizer(scene, dynamicObjectCollection);

        var labelCollection = scene.primitives.get(0);
        expect(labelCollection.length).toEqual(0);

        var testObject = dynamicObjectCollection.getOrCreateObject('test');

        var time = new JulianDate();
        var label = testObject.label = new DynamicLabel();

        testObject.position = new ConstantProperty(new Cartesian3(1234, 5678, 9101112));
        label.show = new ConstantProperty(true);
        label.text = new ConstantProperty('lorum ipsum');
        visualizer.update(time);
        expect(labelCollection.length).toEqual(1);
        var l = labelCollection.get(0);
        expect(l.id).toEqual(testObject);
    });

    it('setDynamicObjectCollection removes old objects and add new ones.', function() {
        var dynamicObjectCollection = new DynamicObjectCollection();
        var testObject = dynamicObjectCollection.getOrCreateObject('test');
        testObject.position = new ConstantProperty(new Cartesian3(1234, 5678, 9101112));
        testObject.label = new DynamicLabel();
        testObject.label.show = new ConstantProperty(true);
        testObject.label.text = new ConstantProperty('lorum ipsum');

        var dynamicObjectCollection2 = new DynamicObjectCollection();
        var testObject2 = dynamicObjectCollection2.getOrCreateObject('test2');
        testObject2.position = new ConstantProperty(new Cartesian3(5678, 9101112, 1234));
        testObject2.label = new DynamicLabel();
        testObject2.label.show = new ConstantProperty(true);
        testObject2.label.text = new ConstantProperty('the quick brown');

        visualizer = new DynamicLabelVisualizer(scene, dynamicObjectCollection);

        var time = new JulianDate();
        var labelCollection = scene.primitives.get(0);

        visualizer.update(time);
        expect(labelCollection.length).toEqual(1);
        var l = labelCollection.get(0);
        expect(l.id).toEqual(testObject);

        visualizer.setDynamicObjectCollection(dynamicObjectCollection2);
        visualizer.update(time);
        expect(labelCollection.length).toEqual(1);
        l = labelCollection.get(0);
        expect(l.id).toEqual(testObject2);
    });
}, 'WebGL');