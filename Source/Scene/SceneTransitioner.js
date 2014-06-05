/*global define*/
define([
        '../Core/Cartesian3',
        '../Core/Cartographic',
        '../Core/defaultValue',
        '../Core/defined',
        '../Core/destroyObject',
        '../Core/DeveloperError',
        '../Core/Ellipsoid',
        '../Core/Math',
        '../Core/Matrix4',
        '../Core/ScreenSpaceEventHandler',
        '../Core/ScreenSpaceEventType',
        '../ThirdParty/Tween',
        './OrthographicFrustum',
        './PerspectiveFrustum',
        './SceneMode'
    ], function(
        Cartesian3,
        Cartographic,
        defaultValue,
        defined,
        destroyObject,
        DeveloperError,
        Ellipsoid,
        CesiumMath,
        Matrix4,
        ScreenSpaceEventHandler,
        ScreenSpaceEventType,
        Tween,
        OrthographicFrustum,
        PerspectiveFrustum,
        SceneMode) {
    "use strict";

    /**
     * @private
     */
    var SceneTransitioner = function(scene, ellipsoid) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(scene)) {
            throw new DeveloperError('scene is required.');
        }
        //>>includeEnd('debug');

        this._scene = scene;
        ellipsoid = defaultValue(ellipsoid, Ellipsoid.WGS84);

        // Position camera and size frustum so the entire 2D map is visible
        var maxRadii = ellipsoid.maximumRadius;
        var position = new Cartesian3(0.0, 0.0, 2.0 * maxRadii);
        var direction = Cartesian3.normalize(Cartesian3.negate(position));
        var up = Cartesian3.UNIT_Y;

        var frustum = new OrthographicFrustum();
        frustum.right = maxRadii * Math.PI;
        frustum.left = -frustum.right;
        frustum.top = frustum.right * (scene.drawingBufferHeight / scene.drawingBufferWidth);
        frustum.bottom = -frustum.top;

        var transform = new Matrix4(0.0, 0.0, 1.0, 0.0, //
                                    1.0, 0.0, 0.0, 0.0, //
                                    0.0, 1.0, 0.0, 0.0, //
                                    0.0, 0.0, 0.0, 1.0);

        this._camera2D = {
            position : position,
            direction : direction,
            up : up,
            frustum : frustum,
            transform : transform
        };

        position = Cartesian3.multiplyByScalar(Cartesian3.normalize(new Cartesian3(0.0, -1.0, 1.0)), 5.0 * maxRadii);
        direction = Cartesian3.normalize(Cartesian3.subtract(Cartesian3.ZERO, position));
        var right = Cartesian3.normalize(Cartesian3.cross(direction, Cartesian3.UNIT_Z));
        up = Cartesian3.cross(right, direction);

        frustum = new PerspectiveFrustum();
        frustum.fovy = CesiumMath.toRadians(60.0);
        frustum.aspectRatio = scene.drawingBufferWidth / scene.drawingBufferHeight;

        this._cameraCV = {
            position : position,
            direction : direction,
            up : up,
            frustum : frustum,
            transform : transform
        };

        position = Cartesian3.multiplyByScalar(Cartesian3.normalize(new Cartesian3(0.0, -2.0, 1.0)), 2.0 * maxRadii);
        direction = Cartesian3.normalize(Cartesian3.subtract(Cartesian3.ZERO, position));
        right = Cartesian3.normalize(Cartesian3.cross(direction, Cartesian3.UNIT_Z));
        up = Cartesian3.cross(right, direction);

        this._camera3D = {
            position : position,
            direction : direction,
            up : up,
            frustum : frustum
        };

        this._currentAnimations = [];
        this._morphHandler = undefined;
        this._morphCancelled = false;
        this._completeMorph = undefined;
    };

    SceneTransitioner.prototype.completeMorph = function() {
        if (defined(this._completeMorph)) {
            this._completeMorph();
        }
    };

    SceneTransitioner.prototype.morphTo2D = function(duration, ellipsoid) {
        if (defined(this._completeMorph)) {
            this._completeMorph();
        }

        var scene = this._scene;
        this._previousMode = scene.mode;

        if (this._previousMode === SceneMode.SCENE2D || this._previousMode === SceneMode.MORPHING) {
            return;
        }
        this._scene.morphStart.raiseEvent(this, this._previousMode, SceneMode.SCENE2D, true);

        updateFrustums(this);
        scene.mode = SceneMode.MORPHING;
        createMorphHandler(this, complete2DCallback);

        if (this._previousMode === SceneMode.COLUMBUS_VIEW) {
            morphFromColumbusViewTo2D(this, duration, ellipsoid, complete2DCallback);
        } else {
            morphFrom3DTo2D(this, duration, ellipsoid, complete2DCallback);
        }

        if (duration === 0 && defined(this._completeMorph)) {
            this._completeMorph();
        }
    };

    SceneTransitioner.prototype.morphToColumbusView = function(duration, ellipsoid) {
        if (defined(this._completeMorph)) {
            this._completeMorph();
        }

        var scene = this._scene;
        this._previousMode = scene.mode;

        if (this._previousMode === SceneMode.COLUMBUS_VIEW || this._previousMode === SceneMode.MORPHING) {
            return;
        }
        this._scene.morphStart.raiseEvent(this, this._previousMode, SceneMode.COLUMBUS_VIEW, true);

        updateFrustums(this);
        scene.mode = SceneMode.MORPHING;
        createMorphHandler(this, completeColumbusViewCallback);

        if (this._previousMode === SceneMode.SCENE2D) {
            morphFrom2DToColumbusView(this, duration, ellipsoid, completeColumbusViewCallback);
        } else {
            morphFrom3DToColumbusView(this, duration, this._cameraCV, completeColumbusViewCallback);
        }

        if (duration === 0 && defined(this._completeMorph)) {
            this._completeMorph();
        }
    };

    SceneTransitioner.prototype.morphTo3D = function(duration, ellipsoid) {
        if (defined(this._completeMorph)) {
            this._completeMorph();
        }

        var scene = this._scene;
        this._previousMode = scene.mode;

        if (this._previousMode === SceneMode.SCENE3D || this._previousMode === SceneMode.MORPHING) {
            return;
        }
        this._scene.morphStart.raiseEvent(this, this._previousMode, SceneMode.SCENE3D, true);

        updateFrustums(this);
        scene.mode = SceneMode.MORPHING;
        createMorphHandler(this, complete3DCallback);

        if (this._previousMode === SceneMode.SCENE2D) {
            morphFrom2DTo3D(this, duration, ellipsoid, complete3DCallback);
        } else {
            morphFromColumbusViewTo3D(this, duration, ellipsoid, complete3DCallback);
        }

        if (duration === 0 && defined(this._completeMorph)) {
            this._completeMorph();
        }
    };

    /**
     * Returns true if this object was destroyed; otherwise, false.
     * <br /><br />
     * If this object was destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.
     * @memberof SceneTransitioner
     *
     * @returns {Boolean} <code>true</code> if this object was destroyed; otherwise, <code>false</code>.
     */
    SceneTransitioner.prototype.isDestroyed = function() {
        return false;
    };

    /**
     * Once an object is destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.  Therefore,
     * assign the return value (<code>undefined</code>) to the object as done in the example.
     * @memberof SceneTransitioner
     *
     * @exception {DeveloperError} This object was destroyed, i.e., destroy() was called.
     *
     * @example
     * transitioner = transitioner && transitioner.destroy();
     */
    SceneTransitioner.prototype.destroy = function() {
        destroyMorphHandler(this);
        return destroyObject(this);
    };

    var scratchPos = new Cartesian3();
    var scratchDir = new Cartesian3();
    var scratchUp = new Cartesian3();
    function setCameraTransform(camera, transform) {
        var pos = Cartesian3.clone(camera.position, scratchPos);
        var dir = Cartesian3.clone(camera.direction, scratchDir);
        var up = Cartesian3.clone(camera.up, scratchUp);

        var frame = Matrix4.multiply(Matrix4.inverseTransformation(transform), camera.transform);
        camera.transform = Matrix4.clone(transform);

        Matrix4.multiplyByPoint(frame, pos, camera.position);
        Matrix4.multiplyByPointAsVector(frame, dir, camera.direction);
        Matrix4.multiplyByPointAsVector(frame, up, camera.up);
        Cartesian3.cross(camera.direction, camera.up, camera.right);
    }

    function createMorphHandler(transitioner, completeMorphFunction) {
        if (transitioner._scene.completeMorphOnUserInput) {
            transitioner._morphHandler = new ScreenSpaceEventHandler(transitioner._scene.canvas);

            var completeMorph = function() {
                transitioner._morphCancelled = true;
                completeMorphFunction(transitioner);
            };

            transitioner._completeMorph = completeMorph;
            transitioner._morphHandler.setInputAction(completeMorph, ScreenSpaceEventType.LEFT_DOWN);
            transitioner._morphHandler.setInputAction(completeMorph, ScreenSpaceEventType.MIDDLE_DOWN);
            transitioner._morphHandler.setInputAction(completeMorph, ScreenSpaceEventType.RIGHT_DOWN);
            transitioner._morphHandler.setInputAction(completeMorph, ScreenSpaceEventType.WHEEL);
        }
    }

    function destroyMorphHandler(transitioner) {
        var animations = transitioner._scene.animations;
        for ( var i = 0; i < transitioner._currentAnimations.length; ++i) {
            animations.remove(transitioner._currentAnimations[i]);
        }
        transitioner._currentAnimations.length = 0;
        transitioner._morphHandler = transitioner._morphHandler && transitioner._morphHandler.destroy();
    }

    function morphFromColumbusViewTo3D(transitioner, duration, ellipsoid, onComplete) {
        var scene = transitioner._scene;

        var camera = scene.camera;
        setCameraTransform(camera, Matrix4.IDENTITY);

        var startPos = camera.position;
        var startDir = camera.direction;
        var startUp = camera.up;

        var maxRadii = ellipsoid.maximumRadius;
        var endPos = ellipsoid.cartographicToCartesian(new Cartographic(0.0, 0.0, 10.0));
        endPos = Cartesian3.multiplyByScalar(Cartesian3.normalize(endPos), 2.0 * maxRadii);
        var endDir = Cartesian3.normalize(Cartesian3.subtract(Cartesian3.ZERO, endPos));
        var endRight = Cartesian3.normalize(Cartesian3.cross(endDir, Cartesian3.UNIT_Z));
        var endUp = Cartesian3.cross(endRight, endDir);

        var update = function(value) {
            camera.position = columbusViewMorph(startPos, endPos, value.time);
            camera.direction = columbusViewMorph(startDir, endDir, value.time);
            camera.up = columbusViewMorph(startUp, endUp, value.time);
            camera.right = Cartesian3.cross(camera.direction, camera.up);
        };

        var animation = scene.animations.add({
            duration : duration,
            easingFunction : Tween.Easing.Quartic.Out,
            startValue : {
                time : 0.0
            },
            stopValue : {
                time : 1.0
            },
            onUpdate : update
        });
        transitioner._currentAnimations.push(animation);

        addMorphTimeAnimations(transitioner, scene, 0.0, 1.0, duration, onComplete);
    }

    function morphFrom2DTo3D(transitioner, duration, ellipsoid, onComplete) {
        duration = duration * 0.5;

        var camera = transitioner._scene.camera;

        morphOrthographicToPerspective(transitioner, duration, ellipsoid, function() {
            camera.frustum = transitioner._cameraCV.frustum.clone();
            camera.transform = Matrix4.clone(transitioner._cameraCV.transform);
            morphFromColumbusViewTo3D(transitioner, duration, ellipsoid, onComplete);
        });
    }

    function columbusViewMorph(startPosition, endPosition, time) {
        // Just linear for now.
        return Cartesian3.lerp(startPosition, endPosition, time);
    }

    function morphPerspectiveToOrthographic(transitioner, duration, onComplete) {
        var scene = transitioner._scene;
        var camera = scene.camera;

        var startPos = camera.position;
        var startFOVy = camera.frustum.fovy;
        var endFOVy = CesiumMath.RADIANS_PER_DEGREE * 0.5;
        var d = Cartesian3.magnitude(startPos) * Math.tan(startFOVy * 0.5);
        camera.frustum.far = d / Math.tan(endFOVy * 0.5) + 10000000.0;

        var update = function(value) {
            camera.frustum.fovy = CesiumMath.lerp(startFOVy, endFOVy, value.time);

            var distance = d / Math.tan(camera.frustum.fovy * 0.5);
            camera.position = Cartesian3.multiplyByScalar(Cartesian3.normalize(camera.position), distance);
        };

        var animation = scene.animations.add({
            duration : duration,
            easingFunction : Tween.Easing.Quartic.Out,
            startValue : {
                time : 0.0
            },
            stopValue : {
                time : 1.0
            },
            onUpdate : update,
            onComplete : function() {
                camera.frustum = transitioner._camera2D.frustum.clone();
                onComplete(transitioner);
            }
        });
        transitioner._currentAnimations.push(animation);
    }

    function morphFromColumbusViewTo2D(transitioner, duration, ellipsoid, onComplete) {
        var scene = transitioner._scene;
        var camera = scene.camera;
        var maxRadii = ellipsoid.maximumRadius;

        setCameraTransform(camera, transitioner._cameraCV.transform);

        var startPos = Cartesian3.clone(camera.position);
        var startDir = Cartesian3.clone(camera.direction);
        var startUp = Cartesian3.clone(camera.up);

        var tanPhi = Math.tan(transitioner._cameraCV.frustum.fovy * 0.5);
        var tanTheta = transitioner._cameraCV.frustum.aspectRatio * tanPhi;
        var d = (maxRadii * Math.PI) / tanTheta;

        var endPos = Cartesian3.multiplyByScalar(Cartesian3.normalize(transitioner._camera2D.position), d);
        var endDir = Cartesian3.clone(transitioner._camera2D.direction);
        var endUp = Cartesian3.clone(transitioner._camera2D.up);

        var updateCV = function(value) {
            camera.position = columbusViewMorph(startPos, endPos, value.time);
            camera.direction = columbusViewMorph(startDir, endDir, value.time);
            camera.up = columbusViewMorph(startUp, endUp, value.time);
            camera.right = Cartesian3.cross(camera.direction, camera.up);
        };

        duration = duration * 0.5;
        var animation = scene.animations.add({
            duration : duration,
            easingFunction : Tween.Easing.Quartic.Out,
            startValue : {
                time : 0.0
            },
            stopValue : {
                time : 1.0
            },
            onUpdate : updateCV,
            onComplete : function() {
                morphPerspectiveToOrthographic(transitioner, duration, onComplete);
            }
        });
        transitioner._currentAnimations.push(animation);
    }

    function morphFrom3DTo2D(transitioner, duration, ellipsoid, onComplete) {
        duration = duration * 0.5;

        var maxRadii = ellipsoid.maximumRadius;

        var tanPhi = Math.tan(transitioner._camera3D.frustum.fovy * 0.5);
        var tanTheta = transitioner._camera3D.frustum.aspectRatio * tanPhi;
        var d = (maxRadii * Math.PI) / tanTheta;

        var camera3DTo2D = {};
        camera3DTo2D.position = Cartesian3.multiplyByScalar(Cartesian3.normalize(transitioner._camera2D.position), d);
        camera3DTo2D.direction = Cartesian3.clone(transitioner._camera2D.direction);
        camera3DTo2D.up = Cartesian3.clone(transitioner._camera2D.up);

        var complete = function() {
            morphPerspectiveToOrthographic(transitioner, duration, onComplete);
        };
        morphFrom3DToColumbusView(transitioner, duration, camera3DTo2D, complete);
    }

    function morphOrthographicToPerspective(transitioner, duration, ellipsoid, onComplete) {
        var scene = transitioner._scene;
        var camera = scene.camera;
        var maxRadii = ellipsoid.maximumRadius;

        var tanPhi = Math.tan(transitioner._cameraCV.frustum.fovy * 0.5);
        var tanTheta = transitioner._cameraCV.frustum.aspectRatio * tanPhi;
        var d = (maxRadii * Math.PI) / tanTheta;
        var endPos2D = Cartesian3.multiplyByScalar(Cartesian3.normalize(transitioner._camera2D.position), d);

        var top = camera.frustum.top;
        var bottom = camera.frustum.bottom;
        var right = camera.frustum.right;
        var left = camera.frustum.left;

        var frustum2D = transitioner._camera2D.frustum;
        var frustumCV = transitioner._cameraCV.frustum;

        var startPos = Cartesian3.clone(camera.position);

        var update2D = function(value) {
            camera.position = columbusViewMorph(startPos, endPos2D, value.time);
            camera.frustum.top = CesiumMath.lerp(top, frustum2D.top, value.time);
            camera.frustum.bottom = CesiumMath.lerp(bottom, frustum2D.bottom, value.time);
            camera.frustum.right = CesiumMath.lerp(right, frustum2D.right, value.time);
            camera.frustum.left = CesiumMath.lerp(left, frustum2D.left, value.time);
        };

        var startTime = (right - left) / (2.0 * maxRadii * Math.PI);
        var endTime = 1.0;
        if (startTime > endTime) {
            startTime = 0.0;
        }

        var partialDuration = (endTime - startTime) * duration;
        if (partialDuration < CesiumMath.EPSILON6) {
            if (!Cartesian3.equalsEpsilon(startPos, endPos2D, CesiumMath.EPSILON6)) {
                partialDuration = duration;
                startTime = 0.0;
                endTime = 1.0;
            } else {
                // If the camera and frustum are already in position for the switch to
                // a perspective projection, nothing needs to be animated.
                camera.position = endPos2D;
                camera.frustum = frustumCV.clone();
                onComplete(transitioner);
                return;
            }
        }

        var animation = scene.animations.add({
            easingFunction : Tween.Easing.Quartic.Out,
            duration : partialDuration,
            startValue : {
                time : startTime
            },
            stopValue : {
                time : endTime
            },
            onUpdate : update2D,
            onComplete : function() {
                camera.frustum = frustumCV.clone();
                onComplete(transitioner);
            }
        });
        transitioner._currentAnimations.push(animation);
    }

    function morphFrom2DToColumbusView(transitioner, duration, ellipsoid, onComplete) {
        var scene = transitioner._scene;
        var camera = scene.camera;

        duration = duration * 0.5;

        var completeFrustumChange = function() {
            var startPos = Cartesian3.clone(camera.position);
            var startDir = Cartesian3.clone(camera.direction);
            var startUp = Cartesian3.clone(camera.up);

            var endPos = Cartesian3.clone(transitioner._cameraCV.position);
            var endDir = Cartesian3.clone(transitioner._cameraCV.direction);
            var endUp = Cartesian3.clone(transitioner._cameraCV.up);

            var updateCV = function(value) {
                camera.position = columbusViewMorph(startPos, endPos, value.time);
                camera.direction = columbusViewMorph(startDir, endDir, value.time);
                camera.up = columbusViewMorph(startUp, endUp, value.time);
                camera.right = Cartesian3.cross(camera.direction, camera.up);
            };

            var animation = scene.animations.add({
                duration : duration,
                easingFunction : Tween.Easing.Quartic.Out,
                startValue : {
                    time : 0.0
                },
                stopValue : {
                    time : 1.0
                },
                onUpdate : updateCV,
                onComplete : function() {
                    onComplete(transitioner);
                }
            });

            transitioner._currentAnimations.push(animation);
        };

        morphOrthographicToPerspective(transitioner, duration, ellipsoid, completeFrustumChange);
    }

    function morphFrom3DToColumbusView(transitioner, duration, endCamera, onComplete) {
        var scene = transitioner._scene;

        var camera = scene.camera;
        setCameraTransform(camera, transitioner._cameraCV.transform);

        var startPos = Cartesian3.clone(camera.position);
        var startDir = Cartesian3.clone(camera.direction);
        var startUp = Cartesian3.clone(camera.up);

        var endPos = Cartesian3.clone(endCamera.position);
        var endDir = Cartesian3.clone(endCamera.direction);
        var endUp = Cartesian3.clone(endCamera.up);

        var update = function(value) {
            camera.position = columbusViewMorph(startPos, endPos, value.time);
            camera.direction = columbusViewMorph(startDir, endDir, value.time);
            camera.up = columbusViewMorph(startUp, endUp, value.time);
            camera.right = Cartesian3.cross(camera.direction, camera.up);
        };

        var animation = scene.animations.add({
            duration : duration,
            easingFunction : Tween.Easing.Quartic.Out,
            startValue : {
                time : 0.0
            },
            stopValue : {
                time : 1.0
            },
            onUpdate : update,
            onComplete : function() {
                camera.position = endPos;
                camera.direction = endDir;
                camera.up = endUp;
                camera.right = Cartesian3.cross(endDir, endUp, camera.right);
            }
        });
        transitioner._currentAnimations.push(animation);

        addMorphTimeAnimations(transitioner, scene, 1.0, 0.0, duration, onComplete);
    }

    function addMorphTimeAnimations(transitioner, scene, start, stop, duration, onComplete) {
        // Later, this will be linear and each object will adjust, if desired, in its vertex shader.
        var template = {
            duration : duration,
            easingFunction : Tween.Easing.Quartic.Out
        };

        if (defined(onComplete)) {
            template.onComplete = function() {
                onComplete(transitioner);
            };
        }

        var animation = scene.animations.addProperty(scene, 'morphTime', start, stop, template);
        transitioner._currentAnimations.push(animation);
    }

    function updateFrustums(transitioner) {
        var scene = transitioner._scene;

        var ratio = scene.drawingBufferHeight / scene.drawingBufferWidth;

        var frustum = transitioner._camera2D.frustum;
        frustum.top = frustum.right * ratio;
        frustum.bottom = -frustum.top;

        ratio = 1.0 / ratio;

        frustum = transitioner._cameraCV.frustum;
        frustum.aspectRatio = ratio;

        frustum = transitioner._camera3D.frustum;
        frustum.aspectRatio = ratio;

        var camera = scene.camera;
        switch (scene.mode) {
        case SceneMode.SCENE3D:
            camera.frustum = transitioner._camera3D.frustum.clone();
            break;
        case SceneMode.COLUMBUS_VIEW:
            camera.frustum = transitioner._cameraCV.frustum.clone();
            break;
        case SceneMode.SCENE2D:
            camera.frustum = transitioner._camera2D.frustum.clone();
            break;
        }
    }

    function complete3DCallback(transitioner) {
        var scene = transitioner._scene;
        scene.mode = SceneMode.SCENE3D;
        scene.morphTime = SceneMode.SCENE3D.morphTime;

        destroyMorphHandler(transitioner);

        updateFrustums(transitioner);
        var camera = scene.camera;
        camera.transform = Matrix4.clone(Matrix4.IDENTITY);

        if (transitioner._previousMode !== SceneMode.MORPHING || transitioner._morphCancelled) {
            transitioner._morphCancelled = false;

            // TODO: Match incoming columbus-view or 2D position
            camera.position = Cartesian3.clone(transitioner._camera3D.position);
            camera.direction = Cartesian3.clone(transitioner._camera3D.direction);
            camera.up = Cartesian3.clone(transitioner._camera3D.up);
            camera.right = Cartesian3.cross(camera.direction, camera.up, camera.right);
        }

        var wasMorphing = defined(transitioner._completeMorph);
        transitioner._completeMorph = undefined;
        transitioner._scene.morphComplete.raiseEvent(transitioner, transitioner._previousMode, SceneMode.SCENE3D, wasMorphing);
    }

    function complete2DCallback(transitioner) {
        var scene = transitioner._scene;

        scene.mode = SceneMode.SCENE2D;
        scene.morphTime = SceneMode.SCENE2D.morphTime;

        destroyMorphHandler(transitioner);

        updateFrustums(transitioner);
        var camera = scene.camera;
        camera.transform = Matrix4.clone(transitioner._camera2D.transform);

        // TODO: Match incoming columbus-view or 3D position
        camera.position = Cartesian3.clone(transitioner._camera2D.position);
        camera.direction = Cartesian3.clone(transitioner._camera2D.direction);
        camera.up = Cartesian3.clone(transitioner._camera2D.up);
        camera.right = Cartesian3.cross(camera.direction, camera.up, camera.right);

        var wasMorphing = defined(transitioner._completeMorph);
        transitioner._completeMorph = undefined;
        transitioner._scene.morphComplete.raiseEvent(transitioner, transitioner._previousMode, SceneMode.SCENE2D, wasMorphing);
    }

    function completeColumbusViewCallback(transitioner) {
        var scene = transitioner._scene;
        scene.mode = SceneMode.COLUMBUS_VIEW;
        scene.morphTime = SceneMode.COLUMBUS_VIEW.morphTime;

        destroyMorphHandler(transitioner);

        updateFrustums(transitioner);
        var camera = scene.camera;
        camera.transform = Matrix4.clone(transitioner._cameraCV.transform);

        if (transitioner._previousModeMode !== SceneMode.MORPHING || transitioner._morphCancelled) {
            transitioner._morphCancelled = false;

            // TODO: Match incoming 2D or 3D position
            camera.position = Cartesian3.clone(transitioner._cameraCV.position);
            camera.direction = Cartesian3.clone(transitioner._cameraCV.direction);
            camera.up = Cartesian3.clone(transitioner._cameraCV.up);
            camera.right = Cartesian3.cross(camera.direction, camera.up, camera.right);
        }

        var wasMorphing = defined(transitioner._completeMorph);
        transitioner._completeMorph = undefined;
        transitioner._scene.morphComplete.raiseEvent(transitioner, transitioner._previousMode, SceneMode.COLUMBUS_VIEW, wasMorphing);
    }

    return SceneTransitioner;
});
