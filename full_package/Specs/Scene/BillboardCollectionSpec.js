/*global defineSuite*/
defineSuite([
        'Scene/BillboardCollection',
        'Core/BoundingRectangle',
        'Core/BoundingSphere',
        'Core/Cartesian2',
        'Core/Cartesian3',
        'Core/Color',
        'Core/loadImage',
        'Core/Math',
        'Core/NearFarScalar',
        'Scene/HorizontalOrigin',
        'Scene/OrthographicFrustum',
        'Scene/TextureAtlas',
        'Scene/VerticalOrigin',
        'Specs/createScene',
        'Specs/pollToPromise',
        'ThirdParty/when'
    ], function(
        BillboardCollection,
        BoundingRectangle,
        BoundingSphere,
        Cartesian2,
        Cartesian3,
        Color,
        loadImage,
        CesiumMath,
        NearFarScalar,
        HorizontalOrigin,
        OrthographicFrustum,
        TextureAtlas,
        VerticalOrigin,
        createScene,
        pollToPromise,
        when) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn*/

    var scene;
    var camera;
    var billboards;

    var greenImage;
    var blueImage;
    var whiteImage;
    var largeBlueImage;

    beforeAll(function() {
        scene = createScene();
        camera = scene.camera;

        return when.join(
            loadImage('./Data/Images/Green.png').then(function(result) {
                greenImage = result;
            }),
            loadImage('./Data/Images/Blue.png').then(function(result) {
                blueImage = result;
            }),
            loadImage('./Data/Images/White.png').then(function(result) {
                whiteImage = result;
            }),
            loadImage('./Data/Images/Blue10x10.png').then(function(result) {
                largeBlueImage = result;
            }));
    });

    afterAll(function() {
        scene.destroyForSpecs();
    });

    beforeEach(function() {
        scene.morphTo3D(0);
        camera.position = new Cartesian3(10.0, 0.0, 0.0);
        camera.direction = Cartesian3.negate(Cartesian3.UNIT_X, new Cartesian3());
        camera.up = Cartesian3.clone(Cartesian3.UNIT_Z);
        billboards = new BillboardCollection();
        scene.primitives.add(billboards);
    });

    afterEach(function() {
        // billboards are destroyed by removeAll().
        scene.primitives.removeAll();
    });

    it('default constructs a billboard', function() {
        var b = billboards.add();
        expect(b.show).toEqual(true);
        expect(b.position).toEqual(Cartesian3.ZERO);
        expect(b.pixelOffset).toEqual(Cartesian2.ZERO);
        expect(b.eyeOffset).toEqual(Cartesian3.ZERO);
        expect(b.horizontalOrigin).toEqual(HorizontalOrigin.CENTER);
        expect(b.verticalOrigin).toEqual(VerticalOrigin.CENTER);
        expect(b.scale).toEqual(1.0);
        expect(b.image).not.toBeDefined();
        expect(b.color.red).toEqual(1.0);
        expect(b.color.green).toEqual(1.0);
        expect(b.color.blue).toEqual(1.0);
        expect(b.color.alpha).toEqual(1.0);
        expect(b.rotation).toEqual(0.0);
        expect(b.alignedAxis).toEqual(Cartesian3.ZERO);
        expect(b.scaleByDistance).not.toBeDefined();
        expect(b.translucencyByDistance).not.toBeDefined();
        expect(b.pixelOffsetScaleByDistance).not.toBeDefined();
        expect(b.width).not.toBeDefined();
        expect(b.height).not.toBeDefined();
        expect(b.id).not.toBeDefined();
    });

    it('can add and remove before first update.', function() {
        var b = billboards.add();
        billboards.remove(b);
        expect(scene.renderForSpecs()).toBeDefined();
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
            image : greenImage,
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

        expect(b.show).toEqual(false);
        expect(b.position).toEqual(new Cartesian3(1.0, 2.0, 3.0));
        expect(b.pixelOffset).toEqual(new Cartesian2(1.0, 2.0));
        expect(b.eyeOffset).toEqual(new Cartesian3(1.0, 2.0, 3.0));
        expect(b.horizontalOrigin).toEqual(HorizontalOrigin.LEFT);
        expect(b.verticalOrigin).toEqual(VerticalOrigin.BOTTOM);
        expect(b.scale).toEqual(2.0);
        expect(b.image).toEqual(greenImage.src);
        expect(b.color.red).toEqual(1.0);
        expect(b.color.green).toEqual(2.0);
        expect(b.color.blue).toEqual(3.0);
        expect(b.color.alpha).toEqual(4.0);
        expect(b.rotation).toEqual(1.0);
        expect(b.alignedAxis).toEqual(new Cartesian3(1.0, 2.0, 3.0));
        expect(b.scaleByDistance).toEqual(new NearFarScalar(1.0, 3.0, 1.0e6, 0.0));
        expect(b.translucencyByDistance).toEqual(new NearFarScalar(1.0, 1.0, 1.0e6, 0.0));
        expect(b.pixelOffsetScaleByDistance).toEqual(new NearFarScalar(1.0, 1.0, 1.0e6, 0.0));
        expect(b.width).toEqual(300.0);
        expect(b.height).toEqual(200.0);
        expect(b.id).toEqual('id');
    });

    it('set billboard properties', function() {
        var b = billboards.add();
        b.show = false;
        b.position = new Cartesian3(1.0, 2.0, 3.0);
        b.pixelOffset = new Cartesian2(1.0, 2.0);
        b.eyeOffset = new Cartesian3(1.0, 2.0, 3.0);
        b.horizontalOrigin = HorizontalOrigin.LEFT;
        b.verticalOrigin = VerticalOrigin.BOTTOM;
        b.scale = 2.0;
        b.image = greenImage;
        b.color = new Color(1.0, 2.0, 3.0, 4.0);
        b.rotation = 1.0;
        b.alignedAxis = new Cartesian3(1.0, 2.0, 3.0);
        b.width = 300.0;
        b.height = 200.0;
        b.scaleByDistance = new NearFarScalar(1.0e6, 3.0, 1.0e8, 0.0);
        b.translucencyByDistance = new NearFarScalar(1.0e6, 1.0, 1.0e8, 0.0);
        b.pixelOffsetScaleByDistance = new NearFarScalar(1.0e6, 3.0, 1.0e8, 0.0);

        expect(b.show).toEqual(false);
        expect(b.position).toEqual(new Cartesian3(1.0, 2.0, 3.0));
        expect(b.pixelOffset).toEqual(new Cartesian2(1.0, 2.0));
        expect(b.eyeOffset).toEqual(new Cartesian3(1.0, 2.0, 3.0));
        expect(b.horizontalOrigin).toEqual(HorizontalOrigin.LEFT);
        expect(b.verticalOrigin).toEqual(VerticalOrigin.BOTTOM);
        expect(b.scale).toEqual(2.0);
        expect(b.image).toEqual(greenImage.src);
        expect(b.color.red).toEqual(1.0);
        expect(b.color.green).toEqual(2.0);
        expect(b.color.blue).toEqual(3.0);
        expect(b.color.alpha).toEqual(4.0);
        expect(b.rotation).toEqual(1.0);
        expect(b.alignedAxis).toEqual(new Cartesian3(1.0, 2.0, 3.0));
        expect(b.scaleByDistance).toEqual(new NearFarScalar(1.0e6, 3.0, 1.0e8, 0.0));
        expect(b.translucencyByDistance).toEqual(new NearFarScalar(1.0e6, 1.0, 1.0e8, 0.0));
        expect(b.pixelOffsetScaleByDistance).toEqual(new NearFarScalar(1.0e6, 3.0, 1.0e8, 0.0));
        expect(b.width).toEqual(300.0);
        expect(b.height).toEqual(200.0);
    });

    it('disable billboard scaleByDistance', function() {
        var b = billboards.add({
            scaleByDistance : new NearFarScalar(1.0, 3.0, 1.0e6, 0.0)
        });
        b.scaleByDistance = undefined;
        expect(b.scaleByDistance).not.toBeDefined();
    });

    it('disable billboard translucencyByDistance', function() {
        var b = billboards.add({
            translucencyByDistance : new NearFarScalar(1.0, 1.0, 1.0e6, 0.0)
        });
        b.translucencyByDistance = undefined;
        expect(b.translucencyByDistance).not.toBeDefined();
    });

    it('disable billboard pixelOffsetScaleByDistance', function() {
        var b = billboards.add({
            pixelOffsetScaleByDistance : new NearFarScalar(1.0, 1.0, 1.0e6, 0.0)
        });
        b.pixelOffsetScaleByDistance = undefined;
        expect(b.pixelOffsetScaleByDistance).not.toBeDefined();
    });

    it('render billboard with scaleByDistance', function() {
        billboards.add({
            position : Cartesian3.ZERO,
            scaleByDistance: new NearFarScalar(2.0, 1.0, 4.0, 0.0),
            image : greenImage
        });

        camera.position = new Cartesian3(2.0, 0.0, 0.0);
        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);

        camera.position = new Cartesian3(4.0, 0.0, 0.0);
        expect(scene.renderForSpecs()).toEqual([0, 0, 0, 255]);
    });

    it('render billboard with translucencyByDistance', function() {
        billboards.add({
            position : Cartesian3.ZERO,
            translucencyByDistance: new NearFarScalar(2.0, 1.0, 4.0, 0.0),
            image : greenImage
        });

        camera.position = new Cartesian3(2.0, 0.0, 0.0);
        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);

        camera.position = new Cartesian3(4.0, 0.0, 0.0);
        expect(scene.renderForSpecs()).toEqual([0, 0, 0, 255]);
    });

    it('render billboard with pixelOffsetScaleByDistance', function() {
        billboards.add({
            position : Cartesian3.ZERO,
            pixelOffset : new Cartesian2(1.0, 0.0),
            pixelOffsetScaleByDistance: new NearFarScalar(2.0, 0.0, 4.0, 1000.0),
            image : greenImage
        });

        camera.position = new Cartesian3(2.0, 0.0, 0.0);
        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);

        camera.position = new Cartesian3(4.0, 0.0, 0.0);
        expect(scene.renderForSpecs()).toEqual([0, 0, 0, 255]);
    });

    it('throws scaleByDistance with nearDistance === farDistance', function() {
        var b = billboards.add();
        var scale = new NearFarScalar(2.0e5, 1.0, 2.0e5, 0.0);
        expect(function() {
            b.scaleByDistance = scale;
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

    it('throws scaleByDistance with nearDistance > farDistance', function() {
        var b = billboards.add();
        var scale = new NearFarScalar(1.0e9, 1.0, 1.0e5, 1.0);
        expect(function() {
            b.scaleByDistance = scale;
        }).toThrowDeveloperError();
    });

    it('throws pixelOffsetScaleByDistance with nearDistance === farDistance', function() {
        var b = billboards.add();
        var scale = new NearFarScalar(2.0e5, 1.0, 2.0e5, 0.0);
        expect(function() {
            b.pixelOffsetScaleByDistance = scale;
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

    it('throws pixelOffsetScaleByDistance with nearDistance > farDistance', function() {
        var b = billboards.add();
        var scale = new NearFarScalar(1.0e9, 1.0, 1.0e5, 1.0);
        expect(function() {
            b.pixelOffsetScaleByDistance = scale;
        }).toThrowDeveloperError();
    });

    it('throws translucencyByDistance with nearDistance === farDistance', function() {
        var b = billboards.add();
        var translucency = new NearFarScalar(2.0e5, 1.0, 2.0e5, 0.0);
        expect(function() {
            b.translucencyByDistance = translucency;
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

    it('throws translucencyByDistance with nearDistance > farDistance', function() {
        var b = billboards.add();
        var translucency = new NearFarScalar(1.0e9, 1.0, 1.0e5, 1.0);
        expect(function() {
            b.translucencyByDistance = translucency;
        }).toThrowDeveloperError();
    });

    it('set a removed billboard property', function() {
        var b = billboards.add();
        billboards.remove(b);
        b.show = false;
        expect(b.show).toEqual(false);
    });

    it('has zero billboards when constructed', function() {
        expect(billboards.length).toEqual(0);
    });

    it('adds a billboard', function() {
        var b = billboards.add({
            position : new Cartesian3(1.0, 2.0, 3.0)
        });

        expect(billboards.length).toEqual(1);
        expect(billboards.get(0)).toEqual(b);
    });

    it('removes the first billboard', function() {
        var one = billboards.add({
            position : new Cartesian3(1.0, 2.0, 3.0)
        });
        var two = billboards.add({
            position : new Cartesian3(4.0, 5.0, 6.0)
        });

        expect(billboards.length).toEqual(2);

        expect(billboards.remove(one)).toEqual(true);

        expect(billboards.length).toEqual(1);
        expect(billboards.get(0)).toEqual(two);
    });

    it('removes the last billboard', function() {
        var one = billboards.add({
            position : new Cartesian3(1.0, 2.0, 3.0)
        });
        var two = billboards.add({
            position : new Cartesian3(4.0, 5.0, 6.0)
        });

        expect(billboards.length).toEqual(2);

        expect(billboards.remove(two)).toEqual(true);

        expect(billboards.length).toEqual(1);
        expect(billboards.get(0)).toEqual(one);
    });

    it('removes the same billboard twice', function() {
        var b = billboards.add({
            position : new Cartesian3(1.0, 2.0, 3.0)
        });
        expect(billboards.length).toEqual(1);

        expect(billboards.remove(b)).toEqual(true);
        expect(billboards.length).toEqual(0);

        expect(billboards.remove(b)).toEqual(false);
        expect(billboards.length).toEqual(0);
    });

    it('returns false when removing undefined', function() {
        billboards.add({
            position : new Cartesian3(1.0, 2.0, 3.0)
        });
        expect(billboards.length).toEqual(1);

        expect(billboards.remove(undefined)).toEqual(false);
        expect(billboards.length).toEqual(1);
    });

    it('adds and removes billboards', function() {
        var one = billboards.add({
            position : new Cartesian3(1.0, 2.0, 3.0)
        });
        var two = billboards.add({
            position : new Cartesian3(4.0, 5.0, 6.0)
        });
        expect(billboards.length).toEqual(2);
        expect(billboards.get(0)).toEqual(one);
        expect(billboards.get(1)).toEqual(two);

        expect(billboards.remove(two)).toEqual(true);
        var three = billboards.add({
            position : new Cartesian3(7.0, 8.0, 9.0)
        });
        expect(billboards.length).toEqual(2);
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
        expect(billboards.length).toEqual(2);

        billboards.removeAll();
        expect(billboards.length).toEqual(0);
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
        expect(billboards.textureAtlas).not.toBeDefined();

        var atlas = new TextureAtlas({ context : scene.context });
        billboards.textureAtlas = atlas;
        expect(billboards.textureAtlas).toEqual(atlas);
    });

    it('destroys a texture atlas', function() {
        var b = new BillboardCollection();
        expect(b.destroyTextureAtlas).toEqual(true);

        var atlas = new TextureAtlas({ context : scene.context });
        b.textureAtlas = atlas;
        b = b.destroy();

        expect(atlas.isDestroyed()).toEqual(true);
    });

    it('does not destroy a texture atlas', function() {
        var b = new BillboardCollection();
        b.destroyTextureAtlas = false;

        var atlas = new TextureAtlas({ context : scene.context });
        b.rextureAtlas = atlas;
        b = b.destroy();

        expect(atlas.isDestroyed()).toEqual(false);
    });

    it('does not render when constructed', function() {
        expect(scene.renderForSpecs()).toEqual([0, 0, 0, 255]);
    });

    it('modifies and removes a billboard, then renders', function() {
        var b1 = billboards.add({
            position : Cartesian3.ZERO,
            image : greenImage
        });
        billboards.add({
            position : new Cartesian3(-1.0, 0.0, 0.0),
            image : blueImage
        });

        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);

        b1.scale = 2.0;
        billboards.remove(b1);
        expect(scene.renderForSpecs()).toEqual([0, 0, 255, 255]);
    });

    it('renders a green billboard', function() {
        billboards.add({
            position : Cartesian3.ZERO,
            image : greenImage
        });

        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);
    });

    it('adds and renders a billboard', function() {
        billboards.add({
            position : Cartesian3.ZERO,
            image : greenImage
        });

        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);

        billboards.add({
            position : new Cartesian3(1.0, 0.0, 0.0), // Closer to camera
            image : blueImage
        });

        expect(scene.renderForSpecs()).toEqual([0, 0, 255, 255]);
    });

    it('removes and renders a billboard', function() {
        billboards.add({
            position : Cartesian3.ZERO,
            image : greenImage
        });
        var blueBillboard = billboards.add({
            position : new Cartesian3(1.0, 0.0, 0.0), // Closer to camera
            image : blueImage
        });

        expect(scene.renderForSpecs()).toEqual([0, 0, 255, 255]);

        billboards.remove(blueBillboard);
        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);
    });

    it('removes all billboards and renders', function() {
        billboards.add({
            position : Cartesian3.ZERO,
            image : greenImage
        });

        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);

        billboards.removeAll();
        expect(scene.renderForSpecs()).toEqual([0, 0, 0, 255]);
    });

    it('removes all billboards, adds a billboard, and renders', function() {
        billboards.add({
            position : Cartesian3.ZERO,
            image : greenImage
        });

        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);

        billboards.removeAll();
        billboards.add({
            position : Cartesian3.ZERO,
            image : blueImage
        });

        expect(scene.renderForSpecs()).toEqual([0, 0, 255, 255]);
    });

    it('renders with a different texture atlas', function() {
        var b = billboards.add({
            position : Cartesian3.ZERO,
            image : greenImage
        });

        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);

        billboards.textureAtlas = new TextureAtlas({ context : scene.context });
        b.image = blueImage;
        expect(scene.renderForSpecs()).toEqual([0, 0, 255, 255]);
    });

    it('renders using billboard show property', function() {
        var greenBillboard = billboards.add({
            position : Cartesian3.ZERO,
            image : greenImage
        });
        var blueBillboard = billboards.add({
            show : false,
            position : Cartesian3.ZERO,
            image : blueImage
        });

        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);

        greenBillboard.show = false;
        blueBillboard.show = true;

        expect(scene.renderForSpecs()).toEqual([0, 0, 255, 255]);
    });

    it('renders using billboard position property', function() {
        var b = billboards.add({
            position : Cartesian3.ZERO,
            image : greenImage
        });

        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);

        b.position = new Cartesian3(20.0, 0.0, 0.0); // Behind camera
        expect(scene.renderForSpecs()).toEqual([0, 0, 0, 255]);

        b.position = new Cartesian3(1.0, 0.0, 0.0);  // Back in front of camera
        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);
    });

    it('renders using billboard scale property', function() {
        var b = billboards.add({
            position : Cartesian3.ZERO,
            image : greenImage
        });

        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);

        b.scale = 0.0;
        expect(scene.renderForSpecs()).toEqual([0, 0, 0, 255]);

        b.scale = 2.0;
        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);
    });

    it('renders using billboard image property', function() {
        var b = billboards.add({
            position : Cartesian3.ZERO,
            image : greenImage
        });

        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);

        b.image = blueImage;
        expect(scene.renderForSpecs()).toEqual([0, 0, 255, 255]);
    });

    it('renders using billboard setImage function', function() {
        var b = billboards.add({
            position : Cartesian3.ZERO,
            image : greenImage
        });

        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);

        b.setImage(blueImage.src, blueImage);
        expect(scene.renderForSpecs()).toEqual([0, 0, 255, 255]);
    });

    it('renders using billboard setImageSubRegion function', function() {
        var b = billboards.add({
            position : Cartesian3.ZERO,
            image : greenImage
        });

        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);

        billboards.textureAtlas.addImage(largeBlueImage.src, largeBlueImage);
        b.setImageSubRegion(largeBlueImage.src, new BoundingRectangle(5.0, 5.0, 1.0, 1.0));
        expect(scene.renderForSpecs()).toEqual([0, 0, 255, 255]);
    });

    it('renders using billboard color property', function() {
        var b = billboards.add({
            position : Cartesian3.ZERO,
            image : whiteImage
        });

        expect(scene.renderForSpecs()).toEqual([255, 255, 255, 255]);

        b.color = new Color(1.0, 0.0, 1.0, 1.0);
        expect(scene.renderForSpecs()).toEqual([255, 0, 255, 255]);

        // Update a second time since it goes through a different vertex array update path
        b.color = new Color(0.0, 1.0, 0.0, 1.0);
        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);
    });

    it('renders using billboard rotation property', function() {
        var b = billboards.add({
            position : Cartesian3.ZERO,
            image : greenImage
        });

        b.rotation = CesiumMath.PI_OVER_TWO;
        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);
    });

    it('renders using billboard aligned axis property', function() {
        var b = billboards.add({
            position : Cartesian3.ZERO,
            image : greenImage
        });

        b.alignedAxis = Cartesian3.UNIT_X;
        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);
    });

    it('renders using billboard custom width property', function() {
        var b = billboards.add({
            position : Cartesian3.ZERO,
            image : greenImage
        });

        b.width = 300.0;
        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);
    });

    it('renders using billboard custom height property', function() {
        var b = billboards.add({
            position : Cartesian3.ZERO,
            image : greenImage
        });

        b.height = 300.0;
        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);
    });

    it('renders bounding volume with debugShowBoundingVolume', function() {
        billboards.add({
            position : Cartesian3.ZERO,
            image : greenImage,
            scale : 0.5 // bring bounding volume in view
        });
        billboards.debugShowBoundingVolume = true;

        expect(scene.renderForSpecs()).not.toEqual([0, 0, 0, 255]);
    });

    it('updates 10% of billboards', function() {
        for ( var i = 0; i < 10; ++i) {
            billboards.add({
                position : Cartesian3.ZERO,
                image : whiteImage,
                show : (i === 3)
            });
        }

        // First render - default billboard color is white.
        expect(scene.renderForSpecs()).toEqual([255, 255, 255, 255]);

        billboards.get(3).color = new Color(0.0, 1.0, 0.0, 1.0);

        // Second render - billboard is green
        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);

        billboards.get(3).color = new Color(1.0, 0.0, 0.0, 1.0);

        // Third render - update goes through a different vertex array update path
        expect(scene.renderForSpecs()).toEqual([255, 0, 0, 255]);
    });

    it('renders more than 16K billboards', function() {
        for ( var i = 0; i < 16 * 1024; ++i) {
            billboards.add({
                position : Cartesian3.ZERO,
                image : whiteImage,
                color : {
                    alpha : 0.0
                }
            });
        }

        billboards.add({
            position : Cartesian3.ZERO,
            image : whiteImage
        });

        expect(scene.renderForSpecs()).toEqual([255, 255, 255, 255]);
    });

    it('is picked', function() {
        var b = billboards.add({
            position : Cartesian3.ZERO,
            image : whiteImage,
            id : 'id'
        });

        var pick = scene.pick(new Cartesian2(0, 0));
        expect(pick.primitive).toEqual(b);
        expect(pick.id).toEqual('id');
    });

    it('can change pick id', function() {
        var b = billboards.add({
            position : Cartesian3.ZERO,
            image : whiteImage,
            id : 'id'
        });

        var pick = scene.pick(new Cartesian2(0, 0));
        expect(pick.primitive).toEqual(b);
        expect(pick.id).toEqual('id');

        b.id = 'id2';

        pick = scene.pick(new Cartesian2(0, 0));
        expect(pick.primitive).toEqual(b);
        expect(pick.id).toEqual('id2');
    });

    it('is not picked', function() {
        billboards.add({
            show : false,
            position : Cartesian3.ZERO,
            image : whiteImage
        });

        var pick = scene.pick(new Cartesian2(0, 0));
        expect(pick).not.toBeDefined();
    });

    it('pick a billboard using translucencyByDistance', function() {
        var b = billboards.add({
            position : Cartesian3.ZERO,
            image : whiteImage
        });

        var translucency = new NearFarScalar(1.0, 0.9, 3.0e9, 0.8);
        b.translucencyByDistance = translucency;

        var pick = scene.pick(new Cartesian2(0, 0));
        expect(pick.primitive).toEqual(b);

        translucency.nearValue = 0.0;
        translucency.farValue = 0.0;
        b.translucencyByDistance = translucency;

        pick = scene.pick(new Cartesian2(0, 0));
        expect(pick).not.toBeDefined();
    });

    it('pick a billboard using pixelOffsetScaleByDistance', function() {
        var b = billboards.add({
            position : Cartesian3.ZERO,
            pixelOffset : new Cartesian2(0.0, 100.0),
            image : whiteImage
        });

        var pixelOffsetScale = new NearFarScalar(1.0, 0.0, 3.0e9, 0.0);
        b.pixelOffsetScaleByDistance = pixelOffsetScale;

        var pick = scene.pick(new Cartesian2(0, 0));
        expect(pick.primitive).toEqual(b);

        pixelOffsetScale.nearValue = 10.0;
        pixelOffsetScale.farValue = 10.0;
        b.pixelOffsetScaleByDistance = pixelOffsetScale;

        pick = scene.pick(new Cartesian2(0, 0));
        expect(pick).not.toBeDefined();
    });

    it('computes screen space position', function() {
        var b = billboards.add({
            position : Cartesian3.ZERO
        });
        scene.renderForSpecs();
        expect(b.computeScreenSpacePosition(scene)).toEqualEpsilon(new Cartesian2(0.5, 0.5), CesiumMath.EPSILON1);
    });

    it('stores screen space position in a result', function() {
        var b = billboards.add({
            position : Cartesian3.ZERO
        });
        var result = new Cartesian2();
        scene.renderForSpecs();
        var actual = b.computeScreenSpacePosition(scene, result);
        expect(actual).toEqual(result);
        expect(result).toEqualEpsilon(new Cartesian2(0.5, 0.5), CesiumMath.EPSILON1);
    });

    it('computes screen space position with pixelOffset', function() {
        var b = billboards.add({
            position : Cartesian3.ZERO,
            pixelOffset : new Cartesian2(1.0, 2.0)
        });
        scene.renderForSpecs();
        expect(b.computeScreenSpacePosition(scene)).toEqualEpsilon(new Cartesian2(1.5, 2.5), CesiumMath.EPSILON1);
    });

    it('computes screen space position with eyeOffset', function() {
        var b = billboards.add({
            position : Cartesian3.ZERO,
            eyeOffset : new Cartesian3(1.0, 1.0, 0.0)
        });
        scene.renderForSpecs();
        expect(b.computeScreenSpacePosition(scene)).toEqualEpsilon(new Cartesian2(0.5, 0.5), CesiumMath.EPSILON1);
    });

    it('throws when computing screen space position when not in a collection', function() {
        var b = billboards.add({
            position : Cartesian3.ZERO
        });
        billboards.remove(b);
        expect(function() {
            b.computeScreenSpacePosition(scene);
        }).toThrowDeveloperError();
    });

    it('throws when computing screen space position without scene', function() {
        var b = billboards.add();

        expect(function() {
            b.computeScreenSpacePosition();
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

        // This tests the `BillboardCollection.equals` function itself, not simple equality.
        expect(b.equals(b2)).toEqual(true);
    });

    it('does not equal another billboard', function() {
        var b = billboards.add({
            position : new Cartesian3(1.0, 2.0, 3.0)
        });
        var b2 = billboards.add({
            position : new Cartesian3(4.0, 5.0, 6.0)
        });

        // This tests the `BillboardCollection.equals` function itself, not simple equality.
        expect(b.equals(b2)).toEqual(false);
    });

    it('does not equal undefined', function() {
        // This tests the `BillboardCollection.equals` function itself, not simple equality.
        var billboard = billboards.add();
        expect(billboard.equals(undefined)).toEqual(false);
    });

    it('throws when accessing without an index', function() {
        expect(function() {
            billboards.get();
        }).toThrowDeveloperError();
    });

    it('setImage throws without an id', function() {
        var b = billboards.add();
        expect(function() {
            b.setImage(undefined, {});
        }).toThrowDeveloperError();
    });

    it('setImage throws without an inmage', function() {
        var b = billboards.add();
        expect(function() {
            b.setImage('', undefined);
        }).toThrowDeveloperError();
    });

    it('setImageSubRegion throws without an id', function() {
        var b = billboards.add();
        expect(function() {
            b.setImage(undefined, {});
        }).toThrowDeveloperError();
    });

    it('setImageSubRegion throws without a sub-region', function() {
        var b = billboards.add();
        expect(function() {
            b.setImage('', undefined);
        }).toThrowDeveloperError();
    });

    it('computes bounding sphere in 3D', function() {
        var one = billboards.add({
            image : greenImage,
            position : Cartesian3.fromDegrees(-50.0, -50.0)
        });
        var two = billboards.add({
            image : greenImage,
            position : Cartesian3.fromDegrees(-50.0, 50.0)
        });

        scene.renderForSpecs();
        var actual = scene._commandList[0].boundingVolume;

        var positions = [one.position, two.position];
        var expected = BoundingSphere.fromPoints(positions);
        expect(actual.center).toEqual(expected.center);
        expect(actual.radius).toEqual(expected.radius);
    });

    it('computes bounding sphere in Columbus view', function() {
        var projection = scene.mapProjection;
        var ellipsoid = projection.ellipsoid;

        var one = billboards.add({
            image : greenImage,
            position : Cartesian3.fromDegrees(-50.0, -50.0)
        });
        var two = billboards.add({
            image : greenImage,
            position : Cartesian3.fromDegrees(-50.0, 50.0)
        });

        // Update scene state
        scene.morphToColumbusView(0);
        scene.renderForSpecs();
        var actual = scene._commandList[0].boundingVolume;

        var projectedPositions = [
            projection.project(ellipsoid.cartesianToCartographic(one.position)),
            projection.project(ellipsoid.cartesianToCartographic(two.position))
        ];
        var expected = BoundingSphere.fromPoints(projectedPositions);
        expected.center = new Cartesian3(0.0, expected.center.x, expected.center.y);
        expect(actual.center).toEqualEpsilon(expected.center, CesiumMath.EPSILON8);
        expect(actual.radius).toBeGreaterThan(expected.radius);
    });

    it('computes bounding sphere in 2D', function() {
        var projection = scene.mapProjection;
        var ellipsoid = projection.ellipsoid;

        var one = billboards.add({
            image : greenImage,
            position : Cartesian3.fromDegrees(-50.0, -50.0)
        });
        var two = billboards.add({
            image : greenImage,
            position : Cartesian3.fromDegrees(-50.0, 50.0)
        });

        var maxRadii = ellipsoid.maximumRadius;
        var orthoFrustum = new OrthographicFrustum();
        orthoFrustum.right = maxRadii * Math.PI;
        orthoFrustum.left = -orthoFrustum.right;
        orthoFrustum.top = orthoFrustum.right;
        orthoFrustum.bottom = -orthoFrustum.top;
        orthoFrustum.near = 0.01 * maxRadii;
        orthoFrustum.far = 60.0 * maxRadii;

        // Update scene state
        scene.morphTo2D(0);
        scene.renderForSpecs();

        camera.frustum = orthoFrustum;

        scene.renderForSpecs();
        var actual = scene._commandList[0].boundingVolume;

        var projectedPositions = [
            projection.project(ellipsoid.cartesianToCartographic(one.position)),
            projection.project(ellipsoid.cartesianToCartographic(two.position))
        ];
        var expected = BoundingSphere.fromPoints(projectedPositions);
        expected.center = new Cartesian3(0.0, expected.center.x, expected.center.y);
        expect(actual.center).toEqualEpsilon(expected.center, CesiumMath.EPSILON8);
        expect(actual.radius).toBeGreaterThan(expected.radius);
    });

    it('computes bounding sphere with pixel offset', function() {
        var one = billboards.add({
            image : greenImage,
            position : Cartesian3.fromDegrees(-50.0, -50.0),
            pixelOffset : new Cartesian2(0.0, 200.0)
        });
        var two = billboards.add({
            image : greenImage,
            position : Cartesian3.fromDegrees(-50.0, 50.0),
            pixelOffset : new Cartesian2(0.0, 200.0)
        });

        scene.renderForSpecs();
        var actual = scene._commandList[0].boundingVolume;

        var positions = [one.position, two.position];
        var bs = BoundingSphere.fromPoints(positions);

        var dimensions = new Cartesian2(1.0, 1.0);
        var diff = Cartesian3.subtract(actual.center, camera.position, new Cartesian3());
        var vectorProjection = Cartesian3.multiplyByScalar(camera.direction, Cartesian3.dot(diff, camera.direction), new Cartesian3());
        var distance = Math.max(0.0, Cartesian3.magnitude(vectorProjection) - bs.radius);

        var pixelSize = camera.frustum.getPixelSize(dimensions, distance);
        bs.radius += pixelSize.y * 0.25 * Math.max(greenImage.width, greenImage.height) + pixelSize.y * one.pixelOffset.y;

        expect(actual.center).toEqual(bs.center);
        expect(actual.radius).toEqual(bs.radius);
    });

    it('can create a billboard using a URL', function() {
        scene.renderForSpecs();

        var one = billboards.add({
            image : './Data/Images/Green.png'
        });

        expect(one.ready).toEqual(false);
        expect(one.image).toEqual('./Data/Images/Green.png');

        return pollToPromise(function() {
            return one.ready;
        }).then(function() {
            expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);
        });
    });

    it('sets billboard width and height based on loaded image width and height', function() {
        scene.renderForSpecs();

        var one = billboards.add({
            image : './Data/Images/Green1x4.png'
        });

        expect(one.width).toBeUndefined();
        expect(one.height).toBeUndefined();

        return pollToPromise(function() {
            return one.ready;
        }).then(function() {
            expect(one.width).toEqual(1);
            expect(one.height).toEqual(4);

            one.image = './Data/Images/Blue10x10.png';

            return pollToPromise(function() {
                return one.ready;
            }).then(function() {
                expect(one.width).toEqual(10);
                expect(one.height).toEqual(10);
            });
        });
    });

    it('does not cancel image load when a billboard is set to the same URL repeatedly', function() {
        scene.renderForSpecs();

        var one = billboards.add({
            image : './Data/Images/Green.png'
        });

        expect(one.ready).toEqual(false);
        expect(one.image).toEqual('./Data/Images/Green.png');

        one.image = './Data/Images/Green.png';
        one.image = './Data/Images/Green.png';
        one.image = './Data/Images/Green.png';

        return pollToPromise(function() {
            return one.ready;
        });
    });

    it('ignores calls to set image equal to the current value after load', function() {
        scene.renderForSpecs();

        var one = billboards.add({
            image : './Data/Images/Green.png'
        });

        expect(one.ready).toEqual(false);
        expect(one.image).toEqual('./Data/Images/Green.png');

        return pollToPromise(function() {
            return one.ready;
        }).then(function() {
            expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);

            one.image = './Data/Images/Green.png';

            expect(one.ready).toEqual(true);
            expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);
        });
    });

    it('can create a billboard using a function', function() {
        var one = billboards.add({
            image : function() {
                return greenImage;
            }
        });

        // the image property will be an autogenerated id if not provided
        expect(one.image).toBeDefined();
        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);
    });

    it('can create a billboard using a function and id', function() {
        var one = billboards.add({
            imageId : 'Foo',
            image : function() {
                return greenImage;
            }
        });

        // the image property will be an autogenerated id if not provided
        expect(one.image).toEqual('Foo');
        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);
    });

    it('can create a billboard using another billboard image', function() {
        var createImage = jasmine.createSpy('createImage').and.returnValue(greenImage);

        var one = billboards.add({
            image : createImage
        });

        scene.renderForSpecs();

        expect(createImage.calls.count()).toEqual(1);

        var two = billboards.add({
            image : one.image
        });

        scene.renderForSpecs();

        expect(two.image).toEqual(one.image);
        expect(createImage.calls.count()).toEqual(1);
        expect(scene.renderForSpecs()).toEqual([0, 255, 0, 255]);
    });

    it('can create a billboard using a subregion of an image', function() {
        scene.renderForSpecs();

        var one = billboards.add({
            image : './Data/Images/Red16x16.png',
            imageSubRegion : new BoundingRectangle(0.0, 0.0, 1.0, 2.0)
        });

        expect(one.ready).toEqual(false);

        return pollToPromise(function() {
            return one.ready;
        }).then(function() {
            expect(scene.renderForSpecs()).toEqual([255, 0, 0, 255]);
        });
    });

    it('sets billboard width and height based on subregion width and height', function() {
        scene.renderForSpecs();

        var one = billboards.add({
            image : './Data/Images/Red16x16.png',
            imageSubRegion : new BoundingRectangle(0.0, 0.0, 1.0, 2.0)
        });

        expect(one.width).toBeUndefined();
        expect(one.height).toBeUndefined();

        return pollToPromise(function() {
            return one.ready;
        }).then(function() {
            expect(one.width).toEqual(1);
            expect(one.height).toEqual(2);
        });
    });

    it('can change image while an image is loading', function() {
        scene.renderForSpecs();

        var one = billboards.add({
            image : './Data/Images/Green.png'
        });

        expect(one.ready).toEqual(false);
        expect(one.image).toEqual('./Data/Images/Green.png');

        // switch to blue while green is in-flight

        one.image = './Data/Images/Blue.png';

        expect(one.ready).toEqual(false);
        expect(one.image).toEqual('./Data/Images/Blue.png');

        return pollToPromise(function() {
            return one.ready;
        }).then(function() {
            var deferred = when.defer();

            // render and yield control several times to make sure the
            // green image doesn't clobber the blue
            var iterations = 10;

            function renderAndCheck() {
                expect(scene.renderForSpecs()).toEqual([0, 0, 255, 255]);

                if (iterations > 0) {
                    --iterations;
                    setTimeout(renderAndCheck, 1);
                } else {
                    deferred.resolve();
                }
            }

            renderAndCheck();

            return deferred.promise;
        });
    });

    it('can set image to undefined while an image is loading', function() {
        scene.renderForSpecs();

        var one = billboards.add({
            image : './Data/Images/Green.png'
        });

        expect(one.ready).toEqual(false);
        expect(one.image).toEqual('./Data/Images/Green.png');

        // switch to undefined while green is in-flight

        one.image = undefined;

        expect(one.ready).toEqual(false);
        expect(one.image).toBeUndefined();

        var deferred = when.defer();

        // render and yield control several times to make sure the
        // green image never loads
        var iterations = 10;

        function renderAndCheck() {
            expect(scene.renderForSpecs()).toEqual([0, 0, 0, 255]);

            if (iterations > 0) {
                --iterations;
                setTimeout(renderAndCheck, 1);
            } else {
                deferred.resolve();
            }
        }

        renderAndCheck();

        return deferred.promise;
    });

    it('does not crash when removing a billboard that is loading', function() {
        scene.renderForSpecs();

        var one = billboards.add({
            image : './Data/Images/Green.png'
        });

        billboards.remove(one);

        var deferred = when.defer();

        // render and yield control several times to make sure the
        // green image doesn't crash when it loads
        var iterations = 10;

        function renderAndCheck() {
            expect(scene.renderForSpecs()).toEqual([0, 0, 0, 255]);

            if (iterations > 0) {
                --iterations;
                setTimeout(renderAndCheck, 1);
            } else {
                deferred.resolve();
            }
        }

        renderAndCheck();

        return deferred.promise;
    });
}, 'WebGL');
