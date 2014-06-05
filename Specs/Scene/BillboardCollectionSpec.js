/*global defineSuite*/
defineSuite([
         'Scene/BillboardCollection',
         'Specs/createContext',
         'Specs/destroyContext',
         'Specs/createCamera',
         'Specs/createFrameState',
         'Specs/createScene',
         'Specs/destroyScene',
         'Specs/frameState',
         'Specs/pick',
         'Specs/render',
         'Core/BoundingSphere',
         'Core/Cartesian2',
         'Core/Cartesian3',
         'Core/Cartographic',
         'Core/Matrix4',
         'Core/Math',
         'Core/NearFarScalar',
         'Renderer/ClearCommand',
         'Renderer/TextureMinificationFilter',
         'Renderer/TextureMagnificationFilter',
         'Renderer/PixelFormat',
         'Renderer/TextureAtlas',
         'Scene/HorizontalOrigin',
         'Scene/VerticalOrigin',
         'Scene/SceneMode',
         'Scene/OrthographicFrustum',
         'Scene/Camera'
     ], function(
         BillboardCollection,
         createContext,
         destroyContext,
         createCamera,
         createFrameState,
         createScene,
         destroyScene,
         frameState,
         pick,
         render,
         BoundingSphere,
         Cartesian2,
         Cartesian3,
         Cartographic,
         Matrix4,
         CesiumMath,
         NearFarScalar,
         ClearCommand,
         TextureMinificationFilter,
         TextureMagnificationFilter,
         PixelFormat,
         TextureAtlas,
         HorizontalOrigin,
         VerticalOrigin,
         SceneMode,
         OrthographicFrustum,
         Camera) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    var context;
    var billboards;

    var greenImage;
    var blueImage;
    var whiteImage;

    beforeAll(function() {
        context = createContext();

        var us = context.getUniformState();
        us.update(context, createFrameState(createCamera(context)));
    });

    afterAll(function() {
        destroyContext(context);
    });

    beforeEach(function() {
        billboards = new BillboardCollection();
    });

    afterEach(function() {
        billboards = billboards && billboards.destroy();
    });

    function createTextureAtlas(context, images) {
        var atlas = context.createTextureAtlas({
            images : images,
            borderWidthInPixels : 1,
            initialSize : new Cartesian2(3, 3)
        });

        // ANGLE Workaround
        atlas.getTexture().setSampler(context.createSampler({
            minificationFilter : TextureMinificationFilter.NEAREST,
            magnificationFilter : TextureMagnificationFilter.NEAREST
        }));

        return atlas;
    }

    it('initialize suite', function() {
        greenImage = new Image();
        greenImage.src = './Data/Images/Green.png';

        blueImage = new Image();
        blueImage.src = './Data/Images/Blue.png';

        whiteImage = new Image();
        whiteImage.src = './Data/Images/White.png';

        waitsFor(function() {
            return greenImage.complete && blueImage.complete && whiteImage.complete;
        }, 'Load .png file(s) for billboard collection test.', 3000);
    });

    it('default constructs a billboard', function() {
        var b = billboards.add();
        expect(b.getShow()).toEqual(true);
        expect(b.getPosition()).toEqual(Cartesian3.ZERO);
        expect(b.getPixelOffset()).toEqual(Cartesian2.ZERO);
        expect(b.getEyeOffset()).toEqual(Cartesian3.ZERO);
        expect(b.getHorizontalOrigin()).toEqual(HorizontalOrigin.CENTER);
        expect(b.getVerticalOrigin()).toEqual(VerticalOrigin.CENTER);
        expect(b.getScale()).toEqual(1.0);
        expect(b.getImageIndex()).toEqual(-1);
        expect(b.getColor().red).toEqual(1.0);
        expect(b.getColor().green).toEqual(1.0);
        expect(b.getColor().blue).toEqual(1.0);
        expect(b.getColor().alpha).toEqual(1.0);
        expect(b.getRotation()).toEqual(0.0);
        expect(b.getAlignedAxis()).toEqual(Cartesian3.ZERO);
        expect(b.getScaleByDistance()).not.toBeDefined();
        expect(b.getTranslucencyByDistance()).not.toBeDefined();
        expect(b.getPixelOffsetScaleByDistance()).not.toBeDefined();
        expect(b.getWidth()).not.toBeDefined();
        expect(b.getHeight()).not.toBeDefined();
        expect(b.getId()).not.toBeDefined();
    });

    it('explicitly constructs a billboard', function() {
        var b = billboards.add({
            show : false,
            position : new Cartesian3(1.0, 2.0, 3.0),
            pixelOffset : new Cartesian2(1.0, 2.0),
            eyeOffset : new Cartesian3(1.0, 2.0, 3.0),
            horizontalOrigin : HorizontalOrigin.LEFT,
            verticalOrigin : VerticalOrigin.BOTTOM,
            scale : 2.0,
            imageIndex : 1,
            color : {
                red : 1.0,
                green : 2.0,
                blue : 3.0,
                alpha : 4.0
            },
            rotation : 1.0,
            alignedAxis : new Cartesian3(1.0, 2.0, 3.0),
            scaleByDistance : new NearFarScalar(1.0, 3.0, 1.0e6, 0.0),
            translucencyByDistance : new NearFarScalar(1.0, 1.0, 1.0e6, 0.0),
            pixelOffsetScaleByDistance : new NearFarScalar(1.0, 1.0, 1.0e6, 0.0),
            width : 300.0,
            height : 200.0,
            id : 'id'
        });

        expect(b.getShow()).toEqual(false);
        expect(b.getPosition()).toEqual(new Cartesian3(1.0, 2.0, 3.0));
        expect(b.getPixelOffset()).toEqual(new Cartesian2(1.0, 2.0));
        expect(b.getEyeOffset()).toEqual(new Cartesian3(1.0, 2.0, 3.0));
        expect(b.getHorizontalOrigin()).toEqual(HorizontalOrigin.LEFT);
        expect(b.getVerticalOrigin()).toEqual(VerticalOrigin.BOTTOM);
        expect(b.getScale()).toEqual(2.0);
        expect(b.getImageIndex()).toEqual(1);
        expect(b.getColor().red).toEqual(1.0);
        expect(b.getColor().green).toEqual(2.0);
        expect(b.getColor().blue).toEqual(3.0);
        expect(b.getColor().alpha).toEqual(4.0);
        expect(b.getRotation()).toEqual(1.0);
        expect(b.getAlignedAxis()).toEqual(new Cartesian3(1.0, 2.0, 3.0));
        expect(b.getScaleByDistance()).toEqual(new NearFarScalar(1.0, 3.0, 1.0e6, 0.0));
        expect(b.getTranslucencyByDistance()).toEqual(new NearFarScalar(1.0, 1.0, 1.0e6, 0.0));
        expect(b.getPixelOffsetScaleByDistance()).toEqual(new NearFarScalar(1.0, 1.0, 1.0e6, 0.0));
        expect(b.getWidth()).toEqual(300.0);
        expect(b.getHeight()).toEqual(200.0);
        expect(b.getId()).toEqual('id');
    });

    it('set billboard properties', function() {
        var b = billboards.add();
        b.setShow(false);
        b.setPosition(new Cartesian3(1.0, 2.0, 3.0));
        b.setPixelOffset(new Cartesian2(1.0, 2.0));
        b.setEyeOffset(new Cartesian3(1.0, 2.0, 3.0));
        b.setHorizontalOrigin(HorizontalOrigin.LEFT);
        b.setVerticalOrigin(VerticalOrigin.BOTTOM);
        b.setScale(2.0);
        b.setImageIndex(1);
        b.setColor({
            red : 1.0,
            green : 2.0,
            blue : 3.0,
            alpha : 4.0
        });
        b.setRotation(1.0);
        b.setAlignedAxis(new Cartesian3(1.0, 2.0, 3.0));
        b.setWidth(300.0);
        b.setHeight(200.0);
        b.setScaleByDistance(new NearFarScalar(1.0e6, 3.0, 1.0e8, 0.0));
        b.setTranslucencyByDistance(new NearFarScalar(1.0e6, 1.0, 1.0e8, 0.0));
        b.setPixelOffsetScaleByDistance(new NearFarScalar(1.0e6, 3.0, 1.0e8, 0.0));

        expect(b.getShow()).toEqual(false);
        expect(b.getPosition()).toEqual(new Cartesian3(1.0, 2.0, 3.0));
        expect(b.getPixelOffset()).toEqual(new Cartesian2(1.0, 2.0));
        expect(b.getEyeOffset()).toEqual(new Cartesian3(1.0, 2.0, 3.0));
        expect(b.getHorizontalOrigin()).toEqual(HorizontalOrigin.LEFT);
        expect(b.getVerticalOrigin()).toEqual(VerticalOrigin.BOTTOM);
        expect(b.getScale()).toEqual(2.0);
        expect(b.getImageIndex()).toEqual(1);
        expect(b.getColor().red).toEqual(1.0);
        expect(b.getColor().green).toEqual(2.0);
        expect(b.getColor().blue).toEqual(3.0);
        expect(b.getColor().alpha).toEqual(4.0);
        expect(b.getRotation()).toEqual(1.0);
        expect(b.getAlignedAxis()).toEqual(new Cartesian3(1.0, 2.0, 3.0));
        expect(b.getScaleByDistance()).toEqual(new NearFarScalar(1.0e6, 3.0, 1.0e8, 0.0));
        expect(b.getTranslucencyByDistance()).toEqual(new NearFarScalar(1.0e6, 1.0, 1.0e8, 0.0));
        expect(b.getPixelOffsetScaleByDistance()).toEqual(new NearFarScalar(1.0e6, 3.0, 1.0e8, 0.0));
        expect(b.getWidth()).toEqual(300.0);
        expect(b.getHeight()).toEqual(200.0);
    });

    it('disable billboard setScaleByDistance', function() {
        var b = billboards.add();
        b.setScaleByDistance(undefined);
        expect(b.getScaleByDistance()).not.toBeDefined();
    });

    it('disable billboard setTranslucencyByDistance', function() {
        var b = billboards.add();
        b.setTranslucencyByDistance(undefined);
        expect(b.getTranslucencyByDistance()).not.toBeDefined();
    });

    it('disable billboard setPixelOffsetScaleByDistance', function() {
        var b = billboards.add();
        b.setPixelOffsetScaleByDistance(undefined);
        expect(b.getPixelOffsetScaleByDistance()).not.toBeDefined();
    });

    it('render billboard with scaleByDistance', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [greenImage]));
        billboards.add({
            position : Cartesian3.ZERO,
            scaleByDistance: new NearFarScalar(1.0, 1.0, 3.0, 0.0),
            imageIndex : 0
        });

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        var us = context.getUniformState();
        var eye = new Cartesian3(0.0, 0.0, 1.0);
        var target = Cartesian3.ZERO;
        var up = Cartesian3.UNIT_Y;
        us.update(context, createFrameState(createCamera(context, eye, target, up, 0.1, 10.0)));
        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);
        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        eye = new Cartesian3(0.0, 0.0, 6.0);
        us.update(context, createFrameState(createCamera(context, eye, target, up, 0.1, 10.0)));
        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);
        us.update(context, createFrameState(createCamera(context)));
    });

    it('render billboard with translucencyByDistance', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [greenImage]));
        billboards.add({
            position : Cartesian3.ZERO,
            translucencyByDistance: new NearFarScalar(1.0, 1.0, 3.0, 0.0),
            imageIndex : 0
        });

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        var us = context.getUniformState();
        var eye = new Cartesian3(0.0, 0.0, 1.0);
        var target = Cartesian3.ZERO;
        var up = Cartesian3.UNIT_Y;
        us.update(context, createFrameState(createCamera(context, eye, target, up, 0.1, 10.0)));
        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);
        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        eye = new Cartesian3(0.0, 0.0, 6.0);
        us.update(context, createFrameState(createCamera(context, eye, target, up, 0.1, 10.0)));
        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);
        us.update(context, createFrameState(createCamera(context)));
    });

    it('render billboard with pixelOffsetScaleByDistance', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [greenImage]));
        billboards.add({
            position : Cartesian3.ZERO,
            pixelOffset : new Cartesian2(1.0, 0.0),
            pixelOffsetScaleByDistance: new NearFarScalar(1.0, 0.0, 3.0, 10.0),
            imageIndex : 0
        });

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);
        var us = context.getUniformState();
        var eye = new Cartesian3(0.0, 0.0, 1.0);
        var target = Cartesian3.ZERO;
        var up = Cartesian3.UNIT_Y;
        us.update(context, createFrameState(createCamera(context, eye, target, up, 0.1, 10.0)));
        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);
        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        eye = new Cartesian3(0.0, 0.0, 6.0);
        us.update(context, createFrameState(createCamera(context, eye, target, up, 0.1, 10.0)));
        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);
        us.update(context, createFrameState(createCamera(context)));
    });

    it('throws setScaleByDistance with nearDistance === farDistance', function() {
        var b = billboards.add();
        var scale = new NearFarScalar(2.0e5, 1.0, 2.0e5, 0.0);
        expect(function() {
            b.setScaleByDistance(scale);
        }).toThrowDeveloperError();
    });

    it('throws new billboard with invalid scaleByDistance (nearDistance === farDistance)', function() {
        var scale = new NearFarScalar(2.0e5, 1.0, 2.0e5, 0.0);
        expect(function() {
            billboards.add({
                scaleByDistance : scale
            });
        }).toThrowDeveloperError();
    });

    it('throws setScaleByDistance with nearDistance > farDistance', function() {
        var b = billboards.add();
        var scale = new NearFarScalar(1.0e9, 1.0, 1.0e5, 1.0);
        expect(function() {
            b.setScaleByDistance(scale);
        }).toThrowDeveloperError();
    });

    it('throws setPixelOffsetScaleByDistance with nearDistance === farDistance', function() {
        var b = billboards.add();
        var scale = new NearFarScalar(2.0e5, 1.0, 2.0e5, 0.0);
        expect(function() {
            b.setPixelOffsetScaleByDistance(scale);
        }).toThrowDeveloperError();
    });

    it('throws new billboard with invalid pixelOffsetScaleByDistance (nearDistance === farDistance)', function() {
        var scale = new NearFarScalar(2.0e5, 1.0, 2.0e5, 0.0);
        expect(function() {
            billboards.add({
                pixelOffsetScaleByDistance : scale
            });
        }).toThrowDeveloperError();
    });

    it('throws setPixelOffsetScaleByDistance with nearDistance > farDistance', function() {
        var b = billboards.add();
        var scale = new NearFarScalar(1.0e9, 1.0, 1.0e5, 1.0);
        expect(function() {
            b.setPixelOffsetScaleByDistance(scale);
        }).toThrowDeveloperError();
    });

    it('throws setTranslucencyByDistance with nearDistance === farDistance', function() {
        var b = billboards.add();
        var translucency = new NearFarScalar(2.0e5, 1.0, 2.0e5, 0.0);
        expect(function() {
            b.setTranslucencyByDistance(translucency);
        }).toThrowDeveloperError();
    });

    it('throws new billboard with invalid translucencyByDistance (nearDistance === farDistance)', function() {
        var translucency = new NearFarScalar(2.0e5, 1.0, 2.0e5, 0.0);
        expect(function() {
            billboards.add({
                translucencyByDistance : translucency
            });
        }).toThrowDeveloperError();
    });

    it('throws setTranslucencyByDistance with nearDistance > farDistance', function() {
        var b = billboards.add();
        var translucency = new NearFarScalar(1.0e9, 1.0, 1.0e5, 1.0);
        expect(function() {
            b.setTranslucencyByDistance(translucency);
        }).toThrowDeveloperError();
    });

    it('throws with non number Index', function() {
        var b = billboards.add();
        expect(function() {
            b.setImageIndex(undefined);
        }).toThrowDeveloperError();
    });

    it('throws with invalid index', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [whiteImage]));
        billboards.add({
            position : Cartesian3.ZERO,
            imageIndex : 1
        });

        expect(function() {
            billboards.update(context, frameState, []);
        }).toThrowDeveloperError();
    });


    it('set a removed billboard property', function() {
        var b = billboards.add();
        billboards.remove(b);
        b.setShow(false);
        expect(b.getShow()).toEqual(false);
    });

    it('has zero billboards when constructed', function() {
        expect(billboards.getLength()).toEqual(0);
    });

    it('adds a billboard', function() {
        var b = billboards.add({
            position : new Cartesian3(1.0, 2.0, 3.0)
        });

        expect(billboards.getLength()).toEqual(1);
        expect(billboards.get(0)).toEqual(b);
    });

    it('removes the first billboard', function() {
        var one = billboards.add({
            position : new Cartesian3(1.0, 2.0, 3.0)
        });
        var two = billboards.add({
            position : new Cartesian3(4.0, 5.0, 6.0)
        });

        expect(billboards.getLength()).toEqual(2);

        expect(billboards.remove(one)).toEqual(true);

        expect(billboards.getLength()).toEqual(1);
        expect(billboards.get(0)).toEqual(two);
    });

    it('removes the last billboard', function() {
        var one = billboards.add({
            position : new Cartesian3(1.0, 2.0, 3.0)
        });
        var two = billboards.add({
            position : new Cartesian3(4.0, 5.0, 6.0)
        });

        expect(billboards.getLength()).toEqual(2);

        expect(billboards.remove(two)).toEqual(true);

        expect(billboards.getLength()).toEqual(1);
        expect(billboards.get(0)).toEqual(one);
    });

    it('removes the same billboard twice', function() {
        var b = billboards.add({
            position : new Cartesian3(1.0, 2.0, 3.0)
        });
        expect(billboards.getLength()).toEqual(1);

        expect(billboards.remove(b)).toEqual(true);
        expect(billboards.getLength()).toEqual(0);

        expect(billboards.remove(b)).toEqual(false);
        expect(billboards.getLength()).toEqual(0);
    });

    it('returns false when removing undefined', function() {
        billboards.add({
            position : new Cartesian3(1.0, 2.0, 3.0)
        });
        expect(billboards.getLength()).toEqual(1);

        expect(billboards.remove(undefined)).toEqual(false);
        expect(billboards.getLength()).toEqual(1);
    });

    it('adds and removes billboards', function() {
        var one = billboards.add({
            position : new Cartesian3(1.0, 2.0, 3.0)
        });
        var two = billboards.add({
            position : new Cartesian3(4.0, 5.0, 6.0)
        });
        expect(billboards.getLength()).toEqual(2);
        expect(billboards.get(0)).toEqual(one);
        expect(billboards.get(1)).toEqual(two);

        expect(billboards.remove(two)).toEqual(true);
        var three = billboards.add({
            position : new Cartesian3(7.0, 8.0, 9.0)
        });
        expect(billboards.getLength()).toEqual(2);
        expect(billboards.get(0)).toEqual(one);
        expect(billboards.get(1)).toEqual(three);
    });

    it('removes all billboards', function() {
        billboards.add({
            position : new Cartesian3(1.0, 2.0, 3.0)
        });
        billboards.add({
            position : new Cartesian3(4.0, 5.0, 6.0)
        });
        expect(billboards.getLength()).toEqual(2);

        billboards.removeAll();
        expect(billboards.getLength()).toEqual(0);
    });

    it('can check if it contains a billboard', function() {
        var billboard = billboards.add();

        expect(billboards.contains(billboard)).toEqual(true);
    });

    it('returns false when checking if it contains a billboard it does not contain', function() {
        var billboard = billboards.add();
        billboards.remove(billboard);

        expect(billboards.contains(billboard)).toEqual(false);
    });

    it('does not contain undefined', function() {
        expect(billboards.contains(undefined)).toEqual(false);
    });

    it('does not contain random other objects', function() {
        expect(billboards.contains({})).toEqual(false);
        expect(billboards.contains(new Cartesian2())).toEqual(false);
    });

    it('sets and gets a texture atlas', function() {
        expect(billboards.getTextureAtlas()).not.toBeDefined();

        var atlas = createTextureAtlas(context, [greenImage]);
        billboards.setTextureAtlas(atlas);
        expect(billboards.getTextureAtlas()).toEqual(atlas);
    });

    it('destroys a texture atlas', function() {
        var b = new BillboardCollection();
        expect(b.getDestroyTextureAtlas()).toEqual(true);

        var atlas = createTextureAtlas(context, [greenImage]);
        b.setTextureAtlas(atlas);
        b = b.destroy();

        expect(atlas.isDestroyed()).toEqual(true);
    });

    it('does not destroy a texture atlas', function() {
        var b = new BillboardCollection();
        b.setDestroyTextureAtlas(false);

        var atlas = createTextureAtlas(context, [greenImage]);
        b.setTextureAtlas(atlas);
        b = b.destroy();

        expect(atlas.isDestroyed()).toEqual(false);
    });

    it('does not render when constructed', function() {
        expect(render(context, frameState, billboards)).toEqual(0);
    });

    it('modifies and removes a billboard, then renders', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [greenImage, blueImage]));
        var b = billboards.add({
            position : Cartesian3.ZERO,
            imageIndex : 0
        });
        billboards.add({
            position : new Cartesian3(1.0, 0.0, 0.0),
            imageIndex : 1
        });

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);

        b.setScale(2.0);
        billboards.remove(b);

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 0, 255, 255]);
    });

    it('renders a green billboard', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [greenImage]));
        billboards.add({
            position : Cartesian3.ZERO,
            imageIndex : 0
        });

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);
    });

    it('adds and renders a billboard', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [greenImage, blueImage]));
        billboards.add({
            position : Cartesian3.ZERO,
            imageIndex : 0
        });

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);

        billboards.add({
            position : new Cartesian3(-0.5, 0.0, 0.0), // Closer to viewer
            imageIndex : 1
        });

        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 0, 255, 255]);
    });

    it('removes and renders a billboard', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [greenImage, blueImage]));
        billboards.add({
            position : Cartesian3.ZERO,
            imageIndex : 0
        });
        var blueBillboard = billboards.add({
            position : new Cartesian3(-0.5, 0.0, 0.0), // Closer to viewer
            imageIndex : 1
        });

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 0, 255, 255]);

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        billboards.remove(blueBillboard);
        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);
    });

    it('removes all billboards and renders', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [greenImage]));
        billboards.add({
            position : Cartesian3.ZERO,
            imageIndex : 0
        });

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        billboards.removeAll();
        expect(render(context, frameState, billboards)).toEqual(0);
    });

    it('removes all billboards, adds a billboard, and renders', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [greenImage, blueImage]));
        billboards.add({
            position : Cartesian3.ZERO,
            imageIndex : 0
        });

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        billboards.removeAll();
        billboards.add({
            position : Cartesian3.ZERO,
            imageIndex : 1
        });

        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 0, 255, 255]);
    });

    it('renders with a different texture atlas', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [greenImage]));
        billboards.add({
            position : Cartesian3.ZERO,
            imageIndex : 0
        });

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        billboards.setTextureAtlas(createTextureAtlas(context, [blueImage]));
        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 0, 255, 255]);
    });

    it('renders with a different buffer usage', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [greenImage]));
        billboards.add({
            position : Cartesian3.ZERO,
            imageIndex : 0
        });

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);
    });

    it('renders using billboard show property', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [greenImage, blueImage]));
        var greenBillboard = billboards.add({
            position : Cartesian3.ZERO,
            imageIndex : 0
        });
        var blueBillboard = billboards.add({
            show : false,
            position : Cartesian3.ZERO,
            imageIndex : 1
        });

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        greenBillboard.setShow(false);
        blueBillboard.setShow(true);

        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 0, 255, 255]);
    });

    it('renders using billboard position property', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [greenImage]));
        var b = billboards.add({
            position : Cartesian3.ZERO,
            imageIndex : 0
        });

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        b.setPosition(new Cartesian3(-2.0, 0.0, 0.0)); // Behind viewer
        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        b.setPosition(Cartesian3.ZERO); // Back in front of viewer
        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);
    });

    it('renders using billboard scale property', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [greenImage]));
        var b = billboards.add({
            position : Cartesian3.ZERO,
            imageIndex : 0
        });

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        b.setScale(0.0);
        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        b.setScale(2.0);
        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);
    });

    it('renders using billboard imageIndex property', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [greenImage, blueImage]));
        var b = billboards.add({
            position : Cartesian3.ZERO,
            imageIndex : 0
        });

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        b.setImageIndex(1);
        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 0, 255, 255]);
    });

    it('renders using billboard color property', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [whiteImage]));
        var b = billboards.add({
            position : Cartesian3.ZERO,
            imageIndex : 0
        });

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([255, 255, 255, 255]);

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        b.setColor({
            red : 1.0,
            green : 0.0,
            blue : 1.0,
            alpha : 1.0
        });
        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([255, 0, 255, 255]);

        // Update a second time since it goes through a different vertex array update path
        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        b.setColor({
            red : 0.0,
            green : 1.0,
            blue : 0.0,
            alpha : 1.0
        });
        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);
    });

    it('renders using billboard rotation property', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [greenImage]));
        var b = billboards.add({
            position : Cartesian3.ZERO,
            imageIndex : 0
        });

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        b.setRotation(CesiumMath.PI_OVER_TWO);
        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);
    });

    it('renders using billboard aligned axis property', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [greenImage]));
        var b = billboards.add({
            position : Cartesian3.ZERO,
            imageIndex : 0
        });

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        b.setAlignedAxis(Cartesian3.UNIT_X);
        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);
    });

    it('renders using billboard custum width property', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [greenImage]));
        var b = billboards.add({
            position : Cartesian3.ZERO,
            imageIndex : 0
        });

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        b.setWidth(300.0);
        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);
    });

    it('renders using billboard custum height property', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [greenImage]));
        var b = billboards.add({
            position : Cartesian3.ZERO,
            imageIndex : 0
        });

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        b.setHeight(300.0);
        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);
    });

    it('renders bounding volume with debugShowBoundingVolume', function() {
        var scene = createScene();
        var b = scene.getPrimitives().add(new BillboardCollection({
            debugShowBoundingVolume : true
        }));
        b.setTextureAtlas(createTextureAtlas(scene.getContext(), [greenImage]));
        b.add({
            position : Cartesian3.ZERO,
            imageIndex : 0
        });

        var camera = scene.getCamera();
        camera.position = new Cartesian3(1.02, 0.0, 0.0);
        camera.direction = Cartesian3.negate(Cartesian3.UNIT_X);
        camera.up = Cartesian3.clone(Cartesian3.UNIT_Z);

        scene.initializeFrame();
        scene.render();
        var pixels = scene.getContext().readPixels();
        expect(pixels[0]).not.toEqual(0);
        expect(pixels[1]).toEqual(0);
        expect(pixels[2]).toEqual(0);
        expect(pixels[3]).toEqual(255);

        destroyScene(scene);
    });

    it('updates 10% of billboards', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [whiteImage]));
        for ( var i = 0; i < 10; ++i) {
            billboards.add({
                position : Cartesian3.ZERO,
                imageIndex : 0,
                show : (i === 3)
            });
        }

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        // First render - default billboard color is white.
        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([255, 255, 255, 255]);

        billboards.get(3).setColor({
            red : 0.0,
            green : 1.0,
            blue : 0.0,
            alpha : 1.0
        });

        // Second render - billboard is green
        ClearCommand.ALL.execute(context);
        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([0, 255, 0, 255]);

        billboards.get(3).setColor({
            red : 1.0,
            green : 0.0,
            blue : 0.0,
            alpha : 1.0
        });

        // Third render - update goes through a different vertex array update path
        ClearCommand.ALL.execute(context);
        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([255, 0, 0, 255]);
    });

    it('renders more than 16K billboards', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [whiteImage]));
        for ( var i = 0; i < 16 * 1024; ++i) {
            billboards.add({
                position : Cartesian3.ZERO,
                imageIndex : 0,
                color : {
                    alpha : 0.0
                }
            });
        }

        billboards.add({
            position : Cartesian3.ZERO,
            imageIndex : 0
        });

        ClearCommand.ALL.execute(context);
        expect(context.readPixels()).toEqual([0, 0, 0, 0]);

        render(context, frameState, billboards);
        expect(context.readPixels()).toEqual([255, 255, 255, 255]);
    });

    it('is picked', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [whiteImage]));
        var b = billboards.add({
            position : Cartesian3.ZERO,
            imageIndex : 0,
            id : 'id'
        });

        var pickedObject = pick(context, frameState, billboards, 0, 0);
        expect(pickedObject.primitive).toEqual(b);
        expect(pickedObject.id).toEqual('id');
    });

    it('is not picked', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [whiteImage]));
        billboards.add({
            show : false,
            position : Cartesian3.ZERO,
            imageIndex : 0
        });

        var pickedObject = pick(context, frameState, billboards, 0, 0);
        expect(pickedObject).not.toBeDefined();
    });

    it('pick a billboard using translucencyByDistance', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [whiteImage]));
        var b = billboards.add({
            position : Cartesian3.ZERO,
            imageIndex : 0
        });

        var translucency = new NearFarScalar(1.0, 1.0, 3.0e9, 0.9);
        b.setTranslucencyByDistance(translucency);
        var pickedObject = pick(context, frameState, billboards, 0, 0);
        expect(pickedObject.primitive).toEqual(b);
        translucency.nearValue = 0.0;
        translucency.farValue = 0.0;
        b.setTranslucencyByDistance(translucency);
        pickedObject = pick(context, frameState, billboards, 0, 0);
        expect(pickedObject).toBeUndefined();
    });

    it('pick a billboard using pixelOffsetScaleByDistance', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [whiteImage]));
        var b = billboards.add({
            position : Cartesian3.ZERO,
            pixelOffset : new Cartesian2(0.0, 1.0),
            imageIndex : 0
        });

        var pixelOffsetScale = new NearFarScalar(1.0, 0.0, 3.0e9, 0.0);
        b.setPixelOffsetScaleByDistance(pixelOffsetScale);
        var pickedObject = pick(context, frameState, billboards, 0, 0);
        expect(pickedObject.primitive).toEqual(b);
        pixelOffsetScale.nearValue = 10.0;
        pixelOffsetScale.farValue = 10.0;
        b.setPixelOffsetScaleByDistance(pixelOffsetScale);
        pickedObject = pick(context, frameState, billboards, 0, 0);
        expect(pickedObject).toBeUndefined();
    });

    it('computes screen space position (1)', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [whiteImage]));
        var b = billboards.add({
            position : Cartesian3.ZERO
        });
        billboards.update(context, frameState, []);

        expect(b.computeScreenSpacePosition(context, frameState)).toEqual(new Cartesian2(0.5, 0.5));
    });

    it('computes screen space position (2)', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [whiteImage]));
        var b = billboards.add({
            position : Cartesian3.ZERO,
            pixelOffset : new Cartesian2(1.0, 2.0)
        });
        billboards.update(context, frameState, []);

        expect(b.computeScreenSpacePosition(context, frameState)).toEqual(new Cartesian2(1.5, 2.5));
    });

    it('computes screen space position (3)', function() {
        billboards.setTextureAtlas(createTextureAtlas(context, [whiteImage]));
        var b = billboards.add({
            position : Cartesian3.ZERO,
            eyeOffset : new Cartesian3(5.0, 5.0, 0.0)
        });
        billboards.update(context, frameState, []);

        var p = b.computeScreenSpacePosition(context, frameState);
        expect(p.x).toBeGreaterThan(0.5);
        expect(p.y).toBeGreaterThan(0.5);
    });

    it('throws when computing screen space position when not in a collection', function() {
        var b = billboards.add({
            position : Cartesian3.ZERO
        });
        billboards.remove(b);

        expect(function() {
            b.computeScreenSpacePosition(context, frameState);
        }).toThrowDeveloperError();
    });

    it('throws when computing screen space position without context', function() {
        var b = billboards.add();

        expect(function() {
            b.computeScreenSpacePosition();
        }).toThrowDeveloperError();
    });

    it('throws when computing screen space position without frame state', function() {
        var b = billboards.add();

        expect(function() {
            b.computeScreenSpacePosition(context);
        }).toThrowDeveloperError();
    });

    it('equals another billboard', function() {
        var b = billboards.add({
            position : new Cartesian3(1.0, 2.0, 3.0),
            color : {
                red : 1.0,
                green : 0.0,
                blue : 0.0,
                alpha : 1.0
            }
        });
        var b2 = billboards.add({
            position : new Cartesian3(1.0, 2.0, 3.0),
            color : {
                red : 1.0,
                green : 0.0,
                blue : 0.0,
                alpha : 1.0
            }
        });

        expect(b).toEqual(b2);
    });

    it('does not equal another billboard', function() {
        var b = billboards.add({
            position : new Cartesian3(1.0, 2.0, 3.0)
        });
        var b2 = billboards.add({
            position : new Cartesian3(4.0, 5.0, 6.0)
        });

        expect(b.equals(b2)).toEqual(false);
    });

    it('does not equal undefined', function() {
        var billboard = billboards.add();
        expect(billboard.equals(undefined)).toEqual(false);
    });

    it('throws when accessing without an index', function() {
        expect(function() {
            billboards.get();
        }).toThrowDeveloperError();
    });

    it('computes bounding sphere in 3D', function() {
        var atlas = createTextureAtlas(context, [greenImage]);
        billboards.setTextureAtlas(atlas);

        var projection = frameState.scene2D.projection;
        var ellipsoid = projection.getEllipsoid();

        var one = billboards.add({
            imageIndex : 0,
            position : ellipsoid.cartographicToCartesian(Cartographic.fromDegrees(-50.0, -50.0, 0.0))
        });
        var two = billboards.add({
            imageIndex : 0,
            position : ellipsoid.cartographicToCartesian(Cartographic.fromDegrees(-50.0, 50.0, 0.0))
        });

        var commandList = [];
        billboards.update(context, frameState, commandList);
        var actual = commandList[0].boundingVolume;

        var positions = [one.getPosition(), two.getPosition()];
        var bs = BoundingSphere.fromPoints(positions);
        expect(actual.center).toEqual(bs.center);
        expect(actual.radius).toBeGreaterThan(bs.radius);
    });

    it('computes bounding sphere in Columbus view', function() {
        var atlas = createTextureAtlas(context, [greenImage]);
        billboards.setTextureAtlas(atlas);

        var projection = frameState.scene2D.projection;
        var ellipsoid = projection.getEllipsoid();

        var one = billboards.add({
            imageIndex : 0,
            position : ellipsoid.cartographicToCartesian(Cartographic.fromDegrees(-50.0, -50.0, 0.0))
        });
        var two = billboards.add({
            imageIndex : 0,
            position : ellipsoid.cartographicToCartesian(Cartographic.fromDegrees(-50.0, 50.0, 0.0))
        });

        var mode = frameState.mode;
        frameState.mode = SceneMode.COLUMBUS_VIEW;
        var commandList = [];
        billboards.update(context, frameState, commandList);
        var actual = commandList[0].boundingVolume;
        frameState.mode = mode;

        var projectedPositions = [
            projection.project(ellipsoid.cartesianToCartographic(one.getPosition())),
            projection.project(ellipsoid.cartesianToCartographic(two.getPosition()))
        ];
        var bs = BoundingSphere.fromPoints(projectedPositions);
        bs.center = new Cartesian3(0.0, bs.center.x, bs.center.y);
        expect(bs.center).toEqualEpsilon(actual.center, CesiumMath.EPSILON8);
        expect(bs.radius).toBeLessThan(actual.radius);
    });

    it('computes bounding sphere in 2D', function() {
        var atlas = createTextureAtlas(context, [greenImage]);
        billboards.setTextureAtlas(atlas);

        var projection = frameState.scene2D.projection;
        var ellipsoid = projection.getEllipsoid();

        var one = billboards.add({
            imageIndex : 0,
            position : ellipsoid.cartographicToCartesian(Cartographic.fromDegrees(-50.0, -50.0, 0.0))
        });
        var two = billboards.add({
            imageIndex : 0,
            position : ellipsoid.cartographicToCartesian(Cartographic.fromDegrees(-50.0, 50.0, 0.0))
        });

        var maxRadii = ellipsoid.getMaximumRadius();
        var orthoFrustum = new OrthographicFrustum();
        orthoFrustum.right = maxRadii * Math.PI;
        orthoFrustum.left = -orthoFrustum.right;
        orthoFrustum.top = orthoFrustum.right;
        orthoFrustum.bottom = -orthoFrustum.top;
        orthoFrustum.near = 0.01 * maxRadii;
        orthoFrustum.far = 60.0 * maxRadii;

        var mode = frameState.mode;
        var camera = frameState.camera;
        var frustum = camera.frustum;
        frameState.mode = SceneMode.SCENE2D;
        camera.frustum = orthoFrustum;

        var commandList = [];
        billboards.update(context, frameState, commandList);
        var actual = commandList[0].boundingVolume;

        camera.frustum = frustum;
        frameState.mode = mode;

        var projectedPositions = [
            projection.project(ellipsoid.cartesianToCartographic(one.getPosition())),
            projection.project(ellipsoid.cartesianToCartographic(two.getPosition()))
        ];
        var bs = BoundingSphere.fromPoints(projectedPositions);
        bs.center = new Cartesian3(0.0, bs.center.x, bs.center.y);
        expect(bs.center).toEqualEpsilon(actual.center, CesiumMath.EPSILON8);
        expect(bs.radius).toBeLessThan(actual.radius);
    });
}, 'WebGL');
