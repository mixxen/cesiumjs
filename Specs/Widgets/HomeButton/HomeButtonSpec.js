/*global defineSuite*/
defineSuite([
         'Widgets/HomeButton/HomeButton',
         'Core/Ellipsoid',
         'Scene/SceneTransitioner',
         'Specs/createScene',
         'Specs/destroyScene'
     ], function(
         HomeButton,
         Ellipsoid,
         SceneTransitioner,
         createScene,
         destroyScene) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    var scene;
    var transitioner;
    beforeAll(function() {
        scene = createScene();
        transitioner = new SceneTransitioner(scene);
    });

    afterAll(function() {
        transitioner.destroy();
        destroyScene(scene);
    });

    it('constructor sets default values', function() {
        var homeButton = new HomeButton(document.body, scene);
        expect(homeButton.container).toBe(document.body);
        expect(homeButton.viewModel.scene).toBe(scene);
        expect(homeButton.viewModel.sceneTransitioner).toBeUndefined();
        expect(homeButton.viewModel.ellipsoid).toBe(Ellipsoid.WGS84);
        expect(homeButton.isDestroyed()).toEqual(false);
        homeButton.destroy();
        expect(homeButton.isDestroyed()).toEqual(true);
    });

    it('constructor sets expected values', function() {
        var ellipsoid = new Ellipsoid();
        var homeButton = new HomeButton(document.body, scene, transitioner, ellipsoid);
        expect(homeButton.container).toBe(document.body);
        expect(homeButton.viewModel.scene).toBe(scene);
        expect(homeButton.viewModel.sceneTransitioner).toBe(transitioner);
        expect(homeButton.viewModel.ellipsoid).toBe(ellipsoid);
        homeButton.destroy();
    });

    it('constructor works with string id container', function() {
        var testElement = document.createElement('span');
        testElement.id = 'testElement';
        document.body.appendChild(testElement);
        var homeButton = new HomeButton('testElement', scene);
        expect(homeButton.container).toBe(testElement);
        document.body.removeChild(testElement);
        homeButton.destroy();
    });

    it('throws if container is undefined', function() {
        expect(function() {
            return new HomeButton(undefined, scene);
        }).toThrowDeveloperError();
    });

    it('throws if container string is undefined', function() {
        expect(function() {
            return new HomeButton('testElement', scene);
        }).toThrowDeveloperError();
    });
}, 'WebGL');