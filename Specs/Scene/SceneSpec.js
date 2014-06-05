/*global defineSuite*/
defineSuite([
         'Core/defined',
         'Core/defaultValue',
         'Core/Color',
         'Core/Cartesian3',
         'Core/BoundingSphere',
         'Core/Event',
         'Core/Extent',
         'Renderer/DrawCommand',
         'Renderer/Context',
         'Renderer/Pass',
         'Renderer/PassState',
         'Renderer/PixelDatatype',
         'Renderer/PixelFormat',
         'Renderer/UniformState',
         'Scene/AnimationCollection',
         'Scene/Camera',
         'Scene/CompositePrimitive',
         'Scene/ExtentPrimitive',
         'Scene/FrameState',
         'Scene/OIT',
         'Scene/ScreenSpaceCameraController',
         'Specs/createScene',
         'Specs/destroyScene'
     ], 'Scene/Scene', function(
         defined,
         defaultValue,
         Color,
         Cartesian3,
         BoundingSphere,
         Event,
         Extent,
         DrawCommand,
         Context,
         Pass,
         PassState,
         PixelDatatype,
         PixelFormat,
         UniformState,
         AnimationCollection,
         Camera,
         CompositePrimitive,
         ExtentPrimitive,
         FrameState,
         OIT,
         ScreenSpaceCameraController,
         createScene,
         destroyScene) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor,WebGLRenderingContext*/

    var scene;

    beforeAll(function() {
        scene = createScene();
    });

    afterEach(function() {
        scene.backgroundColor = new Color(0.0, 0.0, 0.0, 0.0);
        scene.debugCommandFilter = undefined;
        scene.fxaaOrderIndependentTranslucency = true;
        scene.fxaa = false;
        scene.primitives.removeAll();
    });

    afterAll(function() {
        destroyScene(scene);
    });

    it('constructor has expected defaults', function() {
        expect(scene.canvas).toBeInstanceOf(HTMLCanvasElement);
        expect(scene.context).toBeInstanceOf(Context);
        expect(scene.primitives).toBeInstanceOf(CompositePrimitive);
        expect(scene.camera).toBeInstanceOf(Camera);
        expect(scene.screenSpaceCameraController).toBeInstanceOf(ScreenSpaceCameraController);
        expect(scene.frameState).toBeInstanceOf(FrameState);
        expect(scene.animations).toBeInstanceOf(AnimationCollection);

        var contextAttributes = scene.context._gl.getContextAttributes();
        // Do not check depth and antialias since they are requests not requirements
        expect(contextAttributes.alpha).toEqual(false);
        expect(contextAttributes.stencil).toEqual(false);
        expect(contextAttributes.premultipliedAlpha).toEqual(true);
        expect(contextAttributes.preserveDrawingBuffer).toEqual(false);
    });

    it('constructor sets contextOptions', function() {
        var webglOptions = {
            alpha : true,
            depth : true, //TODO Change to false when https://bugzilla.mozilla.org/show_bug.cgi?id=745912 is fixed.
            stencil : true,
            antialias : false,
            premultipliedAlpha : false,
            preserveDrawingBuffer : true
        };

        var s = createScene({
            webgl : webglOptions
        });

        var contextAttributes = s.context._gl.getContextAttributes();
        expect(contextAttributes.alpha).toEqual(webglOptions.alpha);
        expect(contextAttributes.depth).toEqual(webglOptions.depth);
        expect(contextAttributes.stencil).toEqual(webglOptions.stencil);
        expect(contextAttributes.antialias).toEqual(webglOptions.antialias);
        expect(contextAttributes.premultipliedAlpha).toEqual(webglOptions.premultipliedAlpha);
        expect(contextAttributes.preserveDrawingBuffer).toEqual(webglOptions.preserveDrawingBuffer);

        destroyScene(s);
    });

    it('draws background color', function() {
        scene.initializeFrame();
        scene.render();
        expect(scene.context.readPixels()).toEqual([0, 0, 0, 255]);

        scene.backgroundColor = Color.BLUE;
        scene.initializeFrame();
        scene.render();
        expect(scene.context.readPixels()).toEqual([0, 0, 255, 255]);
    });

    it('calls afterRender functions', function() {
        var spyListener = jasmine.createSpy('listener');

        var primitive = {
            update : function(context, frameState, commandList) {
                frameState.afterRender.push(spyListener);
            },
            destroy : function() {
            }
        };
        scene.primitives.add(primitive);

        scene.initializeFrame();
        scene.render();
        expect(spyListener).toHaveBeenCalled();
    });

    function CommandMockPrimitive(command) {
        this.update = function(context, frameState, commandList) {
            commandList.push(command);
        };
        this.destroy = function() {
        };
    }

    it('debugCommandFilter filters commands', function() {
        var c = new DrawCommand();
        c.execute = function() {};
        c.pass = Pass.OPAQUE;
        spyOn(c, 'execute');

        scene.primitives.add(new CommandMockPrimitive(c));

        scene.debugCommandFilter = function(command) {
            return command !== c;   // Do not execute command
        };

        scene.initializeFrame();
        scene.render();
        expect(c.execute).not.toHaveBeenCalled();
    });

    it('debugCommandFilter does not filter commands', function() {
        var c = new DrawCommand();
        c.execute = function() {};
        c.pass = Pass.OPAQUE;
        spyOn(c, 'execute');

        scene.primitives.add(new CommandMockPrimitive(c));

        expect(scene.debugCommandFilter).toBeUndefined();
        scene.initializeFrame();
        scene.render();
        expect(c.execute).toHaveBeenCalled();
    });

    it('debugShowBoundingVolume draws a bounding sphere', function() {
        var c = new DrawCommand();
        c.execute = function() {};
        c.pass = Pass.OPAQUE;
        c.debugShowBoundingVolume = true;
        c.boundingVolume = new BoundingSphere(Cartesian3.ZERO, 7000000.0);

        scene.primitives.add(new CommandMockPrimitive(c));

        scene.initializeFrame();
        scene.render();
        expect(scene.context.readPixels()[0]).not.toEqual(0);  // Red bounding sphere
    });

    it('debugShowCommands tints commands', function() {
        var c = new DrawCommand();
        c.execute = function() {};
        c.pass = Pass.OPAQUE;
        c.shaderProgram = scene.context.shaderCache.getShaderProgram(
            'void main() { gl_Position = vec4(1.0); }',
            'void main() { gl_FragColor = vec4(1.0); }');

        scene.primitives.add(new CommandMockPrimitive(c));

        scene.debugShowCommands = true;
        scene.initializeFrame();
        scene.render();
        expect(c._debugColor).toBeDefined();
        scene.debugShowCommands = false;
    });

    it('debugShowFramesPerSecond', function() {
        scene.debugShowFramesPerSecond = true;
        scene.render();
        expect(scene._performanceDisplay).toBeDefined();
        scene.debugShowFramesPerSecond = false;
    });

    it('opaque/translucent render order (1)', function() {
        var extent = Extent.fromDegrees(-100.0, 30.0, -90.0, 40.0);

        var extentPrimitive1 = new ExtentPrimitive({
            extent : extent,
            asynchronous : false
        });
        extentPrimitive1.material.uniforms.color = new Color(1.0, 0.0, 0.0, 1.0);

        var extentPrimitive2 = new ExtentPrimitive({
            extent : extent,
            height : 1000.0,
            asynchronous : false
        });
        extentPrimitive2.material.uniforms.color = new Color(0.0, 1.0, 0.0, 0.5);

        var primitives = scene.primitives;
        primitives.add(extentPrimitive1);
        primitives.add(extentPrimitive2);

        scene.camera.viewExtent(extent);

        scene.initializeFrame();
        scene.render();
        var pixels = scene.context.readPixels();
        expect(pixels[0]).not.toEqual(0);
        expect(pixels[1]).not.toEqual(0);
        expect(pixels[2]).toEqual(0);

        primitives.raiseToTop(extentPrimitive1);

        scene.initializeFrame();
        scene.render();
        pixels = scene.context.readPixels();
        expect(pixels[0]).not.toEqual(0);
        expect(pixels[1]).not.toEqual(0);
        expect(pixels[2]).toEqual(0);
    });

    it('opaque/translucent render order (2)', function() {
        var extent = Extent.fromDegrees(-100.0, 30.0, -90.0, 40.0);

        var extentPrimitive1 = new ExtentPrimitive({
            extent : extent,
            height : 1000.0,
            asynchronous : false
        });
        extentPrimitive1.material.uniforms.color = new Color(1.0, 0.0, 0.0, 1.0);

        var extentPrimitive2 = new ExtentPrimitive({
            extent : extent,
            asynchronous : false
        });
        extentPrimitive2.material.uniforms.color = new Color(0.0, 1.0, 0.0, 0.5);

        var primitives = scene.primitives;
        primitives.add(extentPrimitive1);
        primitives.add(extentPrimitive2);

        scene.camera.viewExtent(extent);

        scene.initializeFrame();
        scene.render();
        var pixels = scene.context.readPixels();
        expect(pixels[0]).not.toEqual(0);
        expect(pixels[1]).toEqual(0);
        expect(pixels[2]).toEqual(0);

        primitives.raiseToTop(extentPrimitive1);

        scene.initializeFrame();
        scene.render();
        pixels = scene.context.readPixels();
        expect(pixels[0]).not.toEqual(0);
        expect(pixels[1]).toEqual(0);
        expect(pixels[2]).toEqual(0);
    });

    it('renders fast path with no translucent primitives', function() {
        var extent = Extent.fromDegrees(-100.0, 30.0, -90.0, 40.0);

        var extentPrimitive = new ExtentPrimitive({
            extent : extent,
            height : 1000.0,
            asynchronous : false
        });
        extentPrimitive.material.uniforms.color = new Color(1.0, 0.0, 0.0, 1.0);

        var primitives = scene.primitives;
        primitives.add(extentPrimitive);

        scene.camera.viewExtent(extent);

        scene.initializeFrame();
        scene.render();
        var pixels = scene.context.readPixels();
        expect(pixels[0]).not.toEqual(0);
        expect(pixels[1]).toEqual(0);
        expect(pixels[2]).toEqual(0);
    });

    it('renders with OIT and without FXAA', function() {
        var extent = Extent.fromDegrees(-100.0, 30.0, -90.0, 40.0);

        var extentPrimitive = new ExtentPrimitive({
            extent : extent,
            height : 1000.0,
            asynchronous : false
        });
        extentPrimitive.material.uniforms.color = new Color(1.0, 0.0, 0.0, 0.5);

        var primitives = scene.primitives;
        primitives.add(extentPrimitive);

        scene.camera.viewExtent(extent);

        scene.fxaaOrderIndependentTranslucency = false;
        scene.fxaa = false;

        scene.initializeFrame();
        scene.render();
        var pixels = scene.context.readPixels();
        expect(pixels[0]).not.toEqual(0);
        expect(pixels[1]).toEqual(0);
        expect(pixels[2]).toEqual(0);
    });

    it('renders with forced FXAA', function() {
        var context = scene.context;

        // Workaround for Firefox on Mac, which does not support RGBA + depth texture
        // attachments, which is allowed by the spec.
        if (context.depthTexture) {
            var framebuffer = context.createFramebuffer({
                colorTextures : [context.createTexture2D({
                    width : 1,
                    height : 1,
                    pixelFormat : PixelFormat.RGBA,
                    pixelDatatype : PixelDatatype.UNSIGNED_BYTE
                })],
                depthTexture : context.createTexture2D({
                    width : 1,
                    height : 1,
                    pixelFormat : PixelFormat.DEPTH_COMPONENT,
                    pixelDatatype : PixelDatatype.UNSIGNED_SHORT
                })
            });

            var status = framebuffer.status;
            framebuffer.destroy();

            if (status !== WebGLRenderingContext.FRAMEBUFFER_COMPLETE) {
                return;
            }
        }

        var s = createScene();
        s._oit._translucentMRTSupport = false;
        s._oit._translucentMultipassSupport = false;

        s.fxaa = true;

        var extent = Extent.fromDegrees(-100.0, 30.0, -90.0, 40.0);

        var extentPrimitive = new ExtentPrimitive({
            extent : extent,
            height : 1000.0,
            asynchronous : false
        });
        extentPrimitive.material.uniforms.color = new Color(1.0, 0.0, 0.0, 1.0);

        var primitives = s.primitives;
        primitives.add(extentPrimitive);

        s.camera.viewExtent(extent);

        s.initializeFrame();
        s.render();
        var pixels = s.context.readPixels();
        expect(pixels[0]).not.toEqual(0);
        expect(pixels[1]).toEqual(0);
        expect(pixels[2]).toEqual(0);

        destroyScene(s);
    });

    it('renders with multipass OIT if MRT is available', function() {
        if (scene.context.drawBuffers) {
            var s = createScene();
            s._oit._translucentMRTSupport = false;
            s._oit._translucentMultipassSupport = true;

            var extent = Extent.fromDegrees(-100.0, 30.0, -90.0, 40.0);

            var extentPrimitive = new ExtentPrimitive({
                extent : extent,
                height : 1000.0,
                asynchronous : false
            });
            extentPrimitive.material.uniforms.color = new Color(1.0, 0.0, 0.0, 0.5);

            var primitives = s.primitives;
            primitives.add(extentPrimitive);

            s.camera.viewExtent(extent);

            s.initializeFrame();
            s.render();
            var pixels = s.context.readPixels();
            expect(pixels[0]).not.toEqual(0);
            expect(pixels[1]).toEqual(0);
            expect(pixels[2]).toEqual(0);

            destroyScene(s);
        }
    });

    it('renders with alpha blending if floating point textures are available', function() {
        if (scene.context.floatingPointTexture) {
            var s = createScene();
            s._oit._translucentMRTSupport = false;
            s._oit._translucentMultipassSupport = false;

            var extent = Extent.fromDegrees(-100.0, 30.0, -90.0, 40.0);

            var extentPrimitive = new ExtentPrimitive({
                extent : extent,
                height : 1000.0,
                asynchronous : false
            });
            extentPrimitive.material.uniforms.color = new Color(1.0, 0.0, 0.0, 0.5);

            var primitives = s.primitives;
            primitives.add(extentPrimitive);

            s.camera.viewExtent(extent);

            s.initializeFrame();
            s.render();
            var pixels = s.context.readPixels();
            expect(pixels[0]).not.toEqual(0);
            expect(pixels[1]).toEqual(0);
            expect(pixels[2]).toEqual(0);

            destroyScene(s);
        }
    });

    it('isDestroyed', function() {
        var s = createScene();
        expect(s.isDestroyed()).toEqual(false);
        destroyScene(s);
        expect(s.isDestroyed()).toEqual(true);
    });
}, 'WebGL');
