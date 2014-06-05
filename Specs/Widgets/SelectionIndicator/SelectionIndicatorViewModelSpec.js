/*global defineSuite*/
defineSuite([
         'Widgets/SelectionIndicator/SelectionIndicatorViewModel',
         'Core/Cartesian2',
         'Core/Cartesian3',
         'Core/Ellipsoid',
         'Specs/createScene',
         'Specs/destroyScene'
     ], function(
         SelectionIndicatorViewModel,
         Cartesian2,
         Cartesian3,
         Ellipsoid,
         createScene,
         destroyScene) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    var scene;
    var selectionIndicatorElement = document.createElement('div');
    selectionIndicatorElement.style.width = '20px';
    selectionIndicatorElement.style.height = '20px';
    var container = document.createElement('div');
    container.appendChild(selectionIndicatorElement);
    beforeAll(function() {
        scene = createScene();
    });

    afterAll(function() {
        destroyScene(scene);
    });

    it('constructor sets expected values', function() {
        var viewModel = new SelectionIndicatorViewModel(scene, selectionIndicatorElement, container);
        expect(viewModel.scene).toBe(scene);
        expect(viewModel.selectionIndicatorElement).toBe(selectionIndicatorElement);
        expect(viewModel.container).toBe(container);
        expect(viewModel.computeScreenSpacePosition).toBeDefined();
    });

    it('throws if scene is undefined', function() {
        expect(function() {
            return new SelectionIndicatorViewModel(undefined);
        }).toThrowDeveloperError();
    });

    it('throws if selectionIndicatorElement is undefined', function() {
        expect(function() {
            return new SelectionIndicatorViewModel(scene);
        }).toThrowDeveloperError();
    });

    it('throws if container is undefined', function() {
        expect(function() {
            return new SelectionIndicatorViewModel(scene, selectionIndicatorElement);
        }).toThrowDeveloperError();
    });

    it('can animate selection element', function() {
        var viewModel = new SelectionIndicatorViewModel(scene, selectionIndicatorElement, container);
        expect(function() {
            viewModel.animateAppear();
        }).not.toThrow();
        expect(function() {
            viewModel.animateDepart();
        }).not.toThrow();
    });

    it('can use custom screen space positions', function() {
        document.body.appendChild(container);
        var viewModel = new SelectionIndicatorViewModel(scene, selectionIndicatorElement, container);
        viewModel.showSelection = true;
        viewModel.position = new Cartesian3(1.0, 2.0, 3.0);
        viewModel.computeScreenSpacePosition = function(position, result) {
            return Cartesian2.clone(position, result);
        };
        expect(function() {
            viewModel.update();
        }).not.toThrow();
        expect(viewModel._screenPositionX).toBe('-9px');  // Negative half the test size, plus viewModel.position.x (1)
        expect(viewModel._screenPositionY).toBe('-8px');  // Negative half the test size, plus viewModel.position.y (2)

        document.body.removeChild(container);
    });

    it('Hides the indicator when position is unknown', function() {
        var viewModel = new SelectionIndicatorViewModel(scene, selectionIndicatorElement, container);
        expect(viewModel.isVisible).toBe(false);
        viewModel.showSelection = true;
        expect(viewModel.isVisible).toBe(false);
        viewModel.position = new Cartesian3(1.0, 2.0, 3.0);
        expect(viewModel.isVisible).toBe(true);
        viewModel.showSelection = false;
        expect(viewModel.isVisible).toBe(false);
    });
}, 'WebGL');