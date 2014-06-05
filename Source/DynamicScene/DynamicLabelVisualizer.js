/*global define*/
define([
        '../Core/DeveloperError',
        '../Core/defined',
        '../Core/destroyObject',
        '../Core/Color',
        '../Core/Cartesian2',
        '../Core/Cartesian3',
        '../Scene/LabelCollection',
        '../Scene/LabelStyle',
        '../Scene/HorizontalOrigin',
        '../Scene/VerticalOrigin'
    ], function(
        DeveloperError,
        defined,
        destroyObject,
        Color,
        Cartesian2,
        Cartesian3,
        LabelCollection,
        LabelStyle,
        HorizontalOrigin,
        VerticalOrigin) {
    "use strict";

    /**
     * A DynamicObject visualizer which maps the DynamicLabel instance
     * in DynamicObject.label to a Label primitive.
     * @alias DynamicLabelVisualizer
     * @constructor
     *
     * @param {Scene} scene The scene the primitives will be rendered in.
     * @param {DynamicObjectCollection} [dynamicObjectCollection] The dynamicObjectCollection to visualize.
     *
     * @see DynamicLabel
     * @see Scene
     * @see DynamicObject
     * @see DynamicObjectCollection
     * @see CompositeDynamicObjectCollection
     * @see DynamicBillboardVisualizer
     * @see DynamicConeVisualizer
     * @see DynamicConeVisualizerUsingCustomSensor
     * @see DynamicPointVisualizer
     * @see DynamicPyramidVisualizer
     */
    var DynamicLabelVisualizer = function(scene, dynamicObjectCollection) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(scene)) {
            throw new DeveloperError('scene is required.');
        }
        //>>includeEnd('debug');

        this._scene = scene;
        this._unusedIndexes = [];
        this._dynamicObjectCollection = undefined;

        var labelCollection = this._labelCollection = new LabelCollection();
        scene.primitives.add(labelCollection);
        this.setDynamicObjectCollection(dynamicObjectCollection);
    };

    /**
     * Returns the scene being used by this visualizer.
     *
     * @returns {Scene} The scene being used by this visualizer.
     */
    DynamicLabelVisualizer.prototype.getScene = function() {
        return this._scene;
    };

    /**
     * Gets the DynamicObjectCollection being visualized.
     *
     * @returns {DynamicObjectCollection} The DynamicObjectCollection being visualized.
     */
    DynamicLabelVisualizer.prototype.getDynamicObjectCollection = function() {
        return this._dynamicObjectCollection;
    };

    /**
     * Sets the DynamicObjectCollection to visualize.
     *
     * @param dynamicObjectCollection The DynamicObjectCollection to visualizer.
     */
    DynamicLabelVisualizer.prototype.setDynamicObjectCollection = function(dynamicObjectCollection) {
        var oldCollection = this._dynamicObjectCollection;
        if (oldCollection !== dynamicObjectCollection) {
            if (defined(oldCollection)) {
                oldCollection.collectionChanged.removeEventListener(DynamicLabelVisualizer.prototype._onObjectsRemoved, this);
                this.removeAllPrimitives();
            }
            this._dynamicObjectCollection = dynamicObjectCollection;
            if (defined(dynamicObjectCollection)) {
                dynamicObjectCollection.collectionChanged.addEventListener(DynamicLabelVisualizer.prototype._onObjectsRemoved, this);
            }
        }
    };

    /**
     * Updates all of the primitives created by this visualizer to match their
     * DynamicObject counterpart at the given time.
     *
     * @param {JulianDate} time The time to update to.
     */
    DynamicLabelVisualizer.prototype.update = function(time) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(time)) {
            throw new DeveloperError('time is required.');
        }
        //>>includeEnd('debug');

        if (defined(this._dynamicObjectCollection)) {
            var dynamicObjects = this._dynamicObjectCollection.getObjects();
            for ( var i = 0, len = dynamicObjects.length; i < len; i++) {
                updateObject(this, time, dynamicObjects[i]);
            }
        }
    };

    /**
     * Removes all primitives from the scene.
     */
    DynamicLabelVisualizer.prototype.removeAllPrimitives = function() {
        this._unusedIndexes = [];
        this._labelCollection.removeAll();
        if (defined(this._dynamicObjectCollection)) {
            var dynamicObjects = this._dynamicObjectCollection.getObjects();
            for ( var i = dynamicObjects.length - 1; i > -1; i--) {
                dynamicObjects[i]._labelVisualizerIndex = undefined;
            }
        }
    };

    /**
     * Returns true if this object was destroyed; otherwise, false.
     * <br /><br />
     * If this object was destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.
     *
     * @memberof DynamicLabelVisualizer
     *
     * @returns {Boolean} True if this object was destroyed; otherwise, false.
     *
     * @see DynamicLabelVisualizer#destroy
     */
    DynamicLabelVisualizer.prototype.isDestroyed = function() {
        return false;
    };

    /**
     * Destroys the WebGL resources held by this object.  Destroying an object allows for deterministic
     * release of WebGL resources, instead of relying on the garbage collector to destroy this object.
     * <br /><br />
     * Once an object is destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.  Therefore,
     * assign the return value (<code>undefined</code>) to the object as done in the example.
     *
     * @memberof DynamicLabelVisualizer
     *
     * @returns {undefined}
     *
     * @exception {DeveloperError} This object was destroyed, i.e., destroy() was called.
     *
     * @see DynamicLabelVisualizer#isDestroyed
     *
     * @example
     * visualizer = visualizer && visualizer.destroy();
     */
    DynamicLabelVisualizer.prototype.destroy = function() {
        this.setDynamicObjectCollection(undefined);
        this._scene.primitives.remove(this._labelCollection);
        return destroyObject(this);
    };

    var position;
    var fillColor;
    var outlineColor;
    var eyeOffset;
    var pixelOffset;
    function updateObject(dynamicLabelVisualizer, time, dynamicObject) {
        var dynamicLabel = dynamicObject._label;
        if (!defined(dynamicLabel)) {
            return;
        }

        var textProperty = dynamicLabel._text;
        if (!defined(textProperty)) {
            return;
        }

        var positionProperty = dynamicObject._position;
        if (!defined(positionProperty)) {
            return;
        }

        var label;
        var showProperty = dynamicLabel._show;
        var labelVisualizerIndex = dynamicObject._labelVisualizerIndex;
        var show = dynamicObject.isAvailable(time) && (!defined(showProperty) || showProperty.getValue(time));

        if (!show) {
            //don't bother creating or updating anything else
            if (defined(labelVisualizerIndex)) {
                label = dynamicLabelVisualizer._labelCollection.get(labelVisualizerIndex);
                label.show = false;
                dynamicLabelVisualizer._unusedIndexes.push(labelVisualizerIndex);
                dynamicObject._labelVisualizerIndex = undefined;
            }
            return;
        }

        if (!defined(labelVisualizerIndex)) {
            var unusedIndexes = dynamicLabelVisualizer._unusedIndexes;
            var length = unusedIndexes.length;
            if (length > 0) {
                labelVisualizerIndex = unusedIndexes.pop();
                label = dynamicLabelVisualizer._labelCollection.get(labelVisualizerIndex);
            } else {
                labelVisualizerIndex = dynamicLabelVisualizer._labelCollection.length;
                label = dynamicLabelVisualizer._labelCollection.add();
            }
            dynamicObject._labelVisualizerIndex = labelVisualizerIndex;
            label._id = dynamicObject;

            // CZML_TODO Determine official defaults
            label.text = '';
            label.scale = 1.0;
            label.font = '30px sans-serif';
            label.fillColor = Color.WHITE;
            label.outlineColor = Color.BLACK;
            label.outlineWidth = 1;
            label.style = LabelStyle.FILL;
            label.pixelOffset = Cartesian2.ZERO;
            label.eyeOffset = Cartesian3.ZERO;
            label.horizontalOrigin = HorizontalOrigin.CENTER;
            label.verticalOrigin = VerticalOrigin.CENTER;
        } else {
            label = dynamicLabelVisualizer._labelCollection.get(labelVisualizerIndex);
        }

        label.show = show;

        var text = textProperty.getValue(time);
        if (defined(text)) {
            label.text = text;
        }

        position = positionProperty.getValue(time, position);
        if (defined(position)) {
            label.position = position;
        }

        var property = dynamicLabel._scale;
        if (defined(property)) {
            var scale = property.getValue(time);
            if (defined(scale)) {
                label.scale = scale;
            }
        }

        property = dynamicLabel._font;
        if (defined(property)) {
            var font = property.getValue(time);
            if (defined(font)) {
                label.font = font;
            }
        }

        property = dynamicLabel._fillColor;
        if (defined(property)) {
            fillColor = property.getValue(time, fillColor);
            if (defined(fillColor)) {
                label.fillColor = fillColor;
            }
        }

        property = dynamicLabel._outlineColor;
        if (defined(property)) {
            outlineColor = property.getValue(time, outlineColor);
            if (defined(outlineColor)) {
                label.outlineColor = outlineColor;
            }
        }

        property = dynamicLabel._outlineWidth;
        if (defined(property)) {
            var outlineWidth = property.getValue(time);
            if (defined(outlineWidth)) {
                label.outlineWidth = outlineWidth;
            }
        }

        property = dynamicLabel._style;
        if (defined(property)) {
            var style = property.getValue(time);
            if (defined(style)) {
                label.style = style;
            }
        }

        property = dynamicLabel._pixelOffset;
        if (defined(property)) {
            pixelOffset = property.getValue(time, pixelOffset);
            if (defined(pixelOffset)) {
                label.pixelOffset = pixelOffset;
            }
        }

        property = dynamicLabel._eyeOffset;
        if (defined(property)) {
            eyeOffset = property.getValue(time, eyeOffset);
            if (defined(eyeOffset)) {
                label.eyeOffset = eyeOffset;
            }
        }

        property = dynamicLabel._horizontalOrigin;
        if (defined(property)) {
            var horizontalOrigin = property.getValue(time);
            if (defined(horizontalOrigin)) {
                label.horizontalOrigin = horizontalOrigin;
            }
        }

        property = dynamicLabel._verticalOrigin;
        if (defined(property)) {
            var verticalOrigin = property.getValue(time);
            if (defined(verticalOrigin)) {
                label.verticalOrigin = verticalOrigin;
            }
        }

        property = dynamicLabel._translucencyByDistance;
        if (defined(property)) {
            label.translucencyByDistance = property.getValue(time);
        }

        property = dynamicLabel._pixelOffsetScaleByDistance;
        if (defined(property)) {
            label.pixelOffsetScaleByDistance = property.getValue(time);
        }
    }

    DynamicLabelVisualizer.prototype._onObjectsRemoved = function(dynamicObjectCollection, added, dynamicObjects) {
        var thisLabelCollection = this._labelCollection;
        var thisUnusedIndexes = this._unusedIndexes;
        for ( var i = dynamicObjects.length - 1; i > -1; i--) {
            var dynamicObject = dynamicObjects[i];
            var labelVisualizerIndex = dynamicObject._labelVisualizerIndex;
            if (defined(labelVisualizerIndex)) {
                var label = thisLabelCollection.get(labelVisualizerIndex);
                label.show = false;
                thisUnusedIndexes.push(labelVisualizerIndex);
                dynamicObject._labelVisualizerIndex = undefined;
            }
        }
    };

    return DynamicLabelVisualizer;
});
