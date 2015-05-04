/*global defineSuite*/
defineSuite([
        'Scene/OpenStreetMapImageryProvider',
        'Core/DefaultProxy',
        'Core/loadImage',
        'Core/Rectangle',
        'Core/WebMercatorTilingScheme',
        'Scene/Imagery',
        'Scene/ImageryLayer',
        'Scene/ImageryProvider',
        'Scene/ImageryState',
        'Specs/pollToPromise'
    ], function(
        OpenStreetMapImageryProvider,
        DefaultProxy,
        loadImage,
        Rectangle,
        WebMercatorTilingScheme,
        Imagery,
        ImageryLayer,
        ImageryProvider,
        ImageryState,
        pollToPromise) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn*/

    afterEach(function() {
        loadImage.createImage = loadImage.defaultCreateImage;
    });

    it('conforms to ImageryProvider interface', function() {
        expect(OpenStreetMapImageryProvider).toConformToInterface(ImageryProvider);
    });

    it('can be default constructed', function() {
        return new OpenStreetMapImageryProvider();
    });

    it('returns valid value for hasAlphaChannel', function() {
        var provider = new OpenStreetMapImageryProvider({
            url : 'made/up/osm/server/'
        });

        return pollToPromise(function() {
            return provider.ready;
        }).then(function() {
            expect(typeof provider.hasAlphaChannel).toBe('boolean');
        });
    });

    it('supports a slash at the end of the URL', function() {
        var provider = new OpenStreetMapImageryProvider({
            url : 'made/up/osm/server/'
        });

        return pollToPromise(function() {
            return provider.ready;
        }).then(function() {
            spyOn(loadImage, 'createImage').and.callFake(function(url, crossOrigin, deferred) {
                expect(url).not.toContain('//');

                // Just return any old image.
                loadImage.defaultCreateImage('Data/Images/Red16x16.png', crossOrigin, deferred);
            });

            return provider.requestImage(0, 0, 0).then(function(image) {
                expect(loadImage.createImage).toHaveBeenCalled();
                expect(image).toBeInstanceOf(Image);
            });
        });
    });

    it('supports no slash at the endof the URL', function() {
        var provider = new OpenStreetMapImageryProvider({
            url : 'made/up/osm/server'
        });

        return pollToPromise(function() {
            return provider.ready;
        }).then(function() {
            spyOn(loadImage, 'createImage').and.callFake(function(url, crossOrigin, deferred) {
                expect(url).toContain('made/up/osm/server/');

                // Just return any old image.
                loadImage.defaultCreateImage('Data/Images/Red16x16.png', crossOrigin, deferred);
            });

            return provider.requestImage(0, 0, 0).then(function(image) {
                expect(loadImage.createImage).toHaveBeenCalled();
                expect(image).toBeInstanceOf(Image);
            });
        });
    });

    it('requestImage returns a promise for an image and loads it for cross-origin use', function() {
        var provider = new OpenStreetMapImageryProvider({
            url : 'made/up/osm/server/'
        });

        expect(provider.url).toEqual('made/up/osm/server/');

        return pollToPromise(function() {
            return provider.ready;
        }).then(function() {
            expect(provider.tileWidth).toEqual(256);
            expect(provider.tileHeight).toEqual(256);
            expect(provider.maximumLevel).toEqual(18);
            expect(provider.tilingScheme).toBeInstanceOf(WebMercatorTilingScheme);
            expect(provider.rectangle).toEqual(new WebMercatorTilingScheme().rectangle);

            spyOn(loadImage, 'createImage').and.callFake(function(url, crossOrigin, deferred) {
                // Just return any old image.
                loadImage.defaultCreateImage('Data/Images/Red16x16.png', crossOrigin, deferred);
            });

            return provider.requestImage(0, 0, 0).then(function(image) {
                expect(loadImage.createImage).toHaveBeenCalled();
                expect(image).toBeInstanceOf(Image);
            });
        });
    });

    it('when no credit is supplied, a default one is used', function() {
        var provider = new OpenStreetMapImageryProvider({
            url : 'made/up/osm/server'
        });
        expect(provider.credit).toBeDefined();
    });

    it('turns the supplied credit into a logo', function() {
        var providerWithCredit = new OpenStreetMapImageryProvider({
            url : 'made/up/osm/server',
            credit : 'Thanks to our awesome made up source of this imagery!'
        });
        expect(providerWithCredit.credit).toBeDefined();
    });

    it('routes requests through a proxy if one is specified', function() {
        var proxy = new DefaultProxy('/proxy/');
        var provider = new OpenStreetMapImageryProvider({
            url : 'made/up/osm/server',
            proxy : proxy
        });

        return pollToPromise(function() {
            return provider.ready;
        }).then(function() {
            expect(provider.proxy).toEqual(proxy);

            spyOn(loadImage, 'createImage').and.callFake(function(url, crossOrigin, deferred) {
                expect(url.indexOf(proxy.getURL('made/up/osm/server'))).toEqual(0);

                // Just return any old image.
                loadImage.defaultCreateImage('Data/Images/Red16x16.png', crossOrigin, deferred);
            });

            return provider.requestImage(0, 0, 0).then(function(image) {
                expect(loadImage.createImage).toHaveBeenCalled();
                expect(image).toBeInstanceOf(Image);
            });
        });
    });

    it('rectangle passed to constructor does not affect tile numbering', function() {
        var rectangle = new Rectangle(0.1, 0.2, 0.3, 0.4);
        var provider = new OpenStreetMapImageryProvider({
            url : 'made/up/osm/server',
            rectangle : rectangle
        });

        return pollToPromise(function() {
            return provider.ready;
        }).then(function() {
            expect(provider.tileWidth).toEqual(256);
            expect(provider.tileHeight).toEqual(256);
            expect(provider.maximumLevel).toEqual(18);
            expect(provider.tilingScheme).toBeInstanceOf(WebMercatorTilingScheme);
            expect(provider.rectangle).toEqual(rectangle);
            expect(provider.tileDiscardPolicy).toBeUndefined();

            spyOn(loadImage, 'createImage').and.callFake(function(url, crossOrigin, deferred) {
                expect(url).toContain('/0/0/0');

                // Just return any old image.
                loadImage.defaultCreateImage('Data/Images/Red16x16.png', crossOrigin, deferred);
            });

            return provider.requestImage(0, 0, 0).then(function(image) {
                expect(loadImage.createImage).toHaveBeenCalled();
                expect(image).toBeInstanceOf(Image);
            });
        });
    });

    it('uses maximumLevel passed to constructor', function() {
        var provider = new OpenStreetMapImageryProvider({
            url : 'made/up/osm/server',
            maximumLevel : 5
        });
        expect(provider.maximumLevel).toEqual(5);
    });

    it('uses minimumLevel passed to constructor', function() {
        var provider = new OpenStreetMapImageryProvider({
            url : 'made/up/osm/server',
            minimumLevel : 0
        });
        expect(provider.minimumLevel).toEqual(0);
    });

    it('raises error event when image cannot be loaded', function() {
        var provider = new OpenStreetMapImageryProvider({
            url : 'made/up/osm/server'
        });

        var layer = new ImageryLayer(provider);

        var tries = 0;
        provider.errorEvent.addEventListener(function(error) {
            expect(error.timesRetried).toEqual(tries);
            ++tries;
            if (tries < 3) {
                error.retry = true;
            }
        });

        loadImage.createImage = function(url, crossOrigin, deferred) {
            if (tries === 2) {
                // Succeed after 2 tries
                loadImage.defaultCreateImage('Data/Images/Red16x16.png', crossOrigin, deferred);
            } else {
                // fail
                setTimeout(function() {
                    deferred.reject();
                }, 1);
            }
        };

        return pollToPromise(function() {
            return provider.ready;
        }).then(function() {
            var imagery = new Imagery(layer, 0, 0, 0);
            imagery.addReference();
            layer._requestImagery(imagery);

            return pollToPromise(function() {
                return imagery.state === ImageryState.RECEIVED;
            }).then(function() {
                expect(imagery.image).toBeInstanceOf(Image);
                expect(tries).toEqual(2);
                imagery.releaseReference();
            });
        });
    });
});
