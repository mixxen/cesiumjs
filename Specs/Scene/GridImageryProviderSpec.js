/*global defineSuite*/
defineSuite([
         'Scene/GridImageryProvider',
         'Scene/GeographicTilingScheme',
         'Scene/ImageryProvider',
         'Scene/WebMercatorTilingScheme',
         'Core/defined',
         'ThirdParty/when'
     ], function(
         GridImageryProvider,
         GeographicTilingScheme,
         ImageryProvider,
         WebMercatorTilingScheme,
         defined,
         when) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    it('conforms to ImageryProvider interface', function() {
        expect(GridImageryProvider).toConformToInterface(ImageryProvider);
    });

    it('can provide a root tile', function() {
        var provider = new GridImageryProvider();

        waitsFor(function() {
            return provider.isReady();
        }, 'imagery provider to become ready');

        var tile000Image;

        runs(function() {
            expect(provider.getTileWidth()).toEqual(256);
            expect(provider.getTileHeight()).toEqual(256);
            expect(provider.getMaximumLevel()).toBeUndefined();
            expect(provider.getTilingScheme()).toBeInstanceOf(GeographicTilingScheme);
            expect(provider.getTileDiscardPolicy()).toBeUndefined();
            expect(provider.getExtent()).toEqual(new GeographicTilingScheme().getExtent());

            when(provider.requestImage(0, 0, 0), function(image) {
                tile000Image = image;
            });
        });

        waitsFor(function() {
            return defined(tile000Image);
        }, 'requested tile to be loaded');

        runs(function() {
            expect(tile000Image).toBeDefined();
        });
    });

    it('uses alternate tiling scheme if provided', function() {
        var tilingScheme = new WebMercatorTilingScheme();
        var provider = new GridImageryProvider({
            tilingScheme : tilingScheme
        });

        waitsFor(function() {
            return provider.isReady();
        }, 'imagery provider to become ready');

        runs(function() {
            expect(provider.getTilingScheme()).toBe(tilingScheme);
        });
    });

    it('uses tile width and height if provided', function() {
        var provider = new GridImageryProvider({
            tileWidth : 123,
            tileHeight : 456
        });

        waitsFor(function() {
            return provider.isReady();
        }, 'imagery provider to become ready');

        runs(function() {
            expect(provider.getTileWidth()).toEqual(123);
            expect(provider.getTileHeight()).toEqual(456);
        });
    });
});
