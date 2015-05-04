/*global defineSuite*/
defineSuite([
        'Scene/ArcGisMapServerImageryProvider',
        'Core/Cartesian2',
        'Core/Cartesian3',
        'Core/Cartographic',
        'Core/DefaultProxy',
        'Core/GeographicProjection',
        'Core/GeographicTilingScheme',
        'Core/jsonp',
        'Core/loadImage',
        'Core/loadWithXhr',
        'Core/queryToObject',
        'Core/Rectangle',
        'Core/WebMercatorProjection',
        'Core/WebMercatorTilingScheme',
        'Scene/DiscardMissingTileImagePolicy',
        'Scene/Imagery',
        'Scene/ImageryLayer',
        'Scene/ImageryLayerFeatureInfo',
        'Scene/ImageryProvider',
        'Scene/ImageryState',
        'Specs/pollToPromise',
        'ThirdParty/Uri'
    ], function(
        ArcGisMapServerImageryProvider,
        Cartesian2,
        Cartesian3,
        Cartographic,
        DefaultProxy,
        GeographicProjection,
        GeographicTilingScheme,
        jsonp,
        loadImage,
        loadWithXhr,
        queryToObject,
        Rectangle,
        WebMercatorProjection,
        WebMercatorTilingScheme,
        DiscardMissingTileImagePolicy,
        Imagery,
        ImageryLayer,
        ImageryLayerFeatureInfo,
        ImageryProvider,
        ImageryState,
        pollToPromise,
        Uri) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,fail*/

    afterEach(function() {
        jsonp.loadAndExecuteScript = jsonp.defaultLoadAndExecuteScript;
        loadImage.createImage = loadImage.defaultCreateImage;
        loadWithXhr.load = loadWithXhr.defaultLoad;
    });

    function expectCorrectUrl(expectedBaseUrl, actualUrl, functionName, withProxy) {
        var uri = new Uri(actualUrl);

        if (withProxy) {
            uri = new Uri(decodeURIComponent(uri.query));
        }

        var params = queryToObject(uri.query);

        var uriWithoutQuery = new Uri(uri);
        uriWithoutQuery.query = '';

        expect(uriWithoutQuery.toString()).toEqual(expectedBaseUrl);

        expect(params).toEqual({
            callback : functionName,
            'f' : 'json'
        });
    }

    function stubJSONPCall(baseUrl, result, withProxy) {
        jsonp.loadAndExecuteScript = function(url, functionName) {
            expectCorrectUrl(baseUrl, url, functionName, withProxy);
            setTimeout(function() {
                window[functionName](result);
            }, 1);
        };
    }

    it('conforms to ImageryProvider interface', function() {
        expect(ArcGisMapServerImageryProvider).toConformToInterface(ImageryProvider);
    });

    it('constructor throws if url is not specified', function() {
        expect(function() {
            return new ArcGisMapServerImageryProvider({});
        }).toThrowDeveloperError();
    });

    var webMercatorResult = {
        "currentVersion" : 10.01,
        "copyrightText" : "Test copyright text",
        "tileInfo" : {
            "rows" : 128,
            "cols" : 256,
            "origin" : {
                "x" : -20037508.342787,
                "y" : 20037508.342787
            },
            "spatialReference" : {
                "wkid" : 102100
            },
            "lods" : [{
                "level" : 0,
                "resolution" : 156543.033928,
                "scale" : 591657527.591555
            }, {
                "level" : 1,
                "resolution" : 78271.5169639999,
                "scale" : 295828763.795777
            }, {
                "level" : 2,
                "resolution" : 39135.7584820001,
                "scale" : 147914381.897889
            }]
        }
    };

    it('supports tiled servers in web mercator projection', function() {
        var baseUrl = '//tiledArcGisMapServer.invalid';

        stubJSONPCall(baseUrl, webMercatorResult);

        var provider = new ArcGisMapServerImageryProvider({
            url : baseUrl
        });

        expect(provider.url).toEqual(baseUrl);

        return pollToPromise(function() {
            return provider.ready;
        }).then(function() {
            expect(provider.tileWidth).toEqual(128);
            expect(provider.tileHeight).toEqual(256);
            expect(provider.maximumLevel).toEqual(2);
            expect(provider.tilingScheme).toBeInstanceOf(WebMercatorTilingScheme);
            expect(provider.credit).toBeDefined();
            expect(provider.tileDiscardPolicy).toBeInstanceOf(DiscardMissingTileImagePolicy);
            expect(provider.rectangle).toEqual(new WebMercatorTilingScheme().rectangle);
            expect(provider.usingPrecachedTiles).toEqual(true);
            expect(provider.hasAlphaChannel).toBeDefined();

            loadImage.createImage = function(url, crossOrigin, deferred) {
                if (/^blob:/.test(url)) {
                    // load blob url normally
                    loadImage.defaultCreateImage(url, crossOrigin, deferred);
                } else {
                    expect(url).toEqual(baseUrl + '/tile/0/0/0');

                    // Just return any old image.
                    loadImage.defaultCreateImage('Data/Images/Red16x16.png', crossOrigin, deferred);
                }
            };

            loadWithXhr.load = function(url, responseType, method, data, headers, deferred, overrideMimeType) {
                expect(url).toEqual(baseUrl + '/tile/0/0/0');

                // Just return any old image.
                loadWithXhr.defaultLoad('Data/Images/Red16x16.png', responseType, method, data, headers, deferred);
            };

            return provider.requestImage(0, 0, 0).then(function(image) {
                expect(image).toBeInstanceOf(Image);
            });
        });
    });

    var geographicResult = {
        "currentVersion" : 10.01,
        "copyrightText" : "Test copyright text",
        "tileInfo" : {
            "rows" : 128,
            "cols" : 256,
            "origin" : {
                "x" : -180,
                "y" : 90
            },
            "spatialReference" : {
                "wkid" : 4326
            },
            "lods" : [{
                "level" : 0,
                "resolution" : 0.3515625,
                "scale" : 147748799.285417
            }, {
                "level" : 1,
                "resolution" : 0.17578125,
                "scale" : 73874399.6427087
            }, {
                "level" : 2,
                "resolution" : 0.087890625,
                "scale" : 36937199.8213544
            }]
        }
    };

    it('supports tiled servers in geographic projection', function() {
        var baseUrl = '//tiledArcGisMapServer.invalid';

        stubJSONPCall(baseUrl, geographicResult);

        var provider = new ArcGisMapServerImageryProvider({
            url : baseUrl
        });

        expect(provider.url).toEqual(baseUrl);

        return pollToPromise(function() {
            return provider.ready;
        }).then(function() {
            expect(provider.tileWidth).toEqual(128);
            expect(provider.tileHeight).toEqual(256);
            expect(provider.maximumLevel).toEqual(2);
            expect(provider.tilingScheme).toBeInstanceOf(GeographicTilingScheme);
            expect(provider.credit).toBeDefined();
            expect(provider.tileDiscardPolicy).toBeInstanceOf(DiscardMissingTileImagePolicy);
            expect(provider.rectangle).toEqual(new GeographicTilingScheme().rectangle);
            expect(provider.usingPrecachedTiles).toEqual(true);

            loadImage.createImage = function(url, crossOrigin, deferred) {
                if (/^blob:/.test(url)) {
                    // load blob url normally
                    loadImage.defaultCreateImage(url, crossOrigin, deferred);
                } else {
                    expect(url).toEqual(baseUrl + '/tile/0/0/0');

                    // Just return any old image.
                    loadImage.defaultCreateImage('Data/Images/Red16x16.png', crossOrigin, deferred);
                }
            };

            loadWithXhr.load = function(url, responseType, method, data, headers, deferred, overrideMimeType) {
                expect(url).toEqual(baseUrl + '/tile/0/0/0');

                // Just return any old image.
                loadWithXhr.defaultLoad('Data/Images/Red16x16.png', responseType, method, data, headers, deferred);
            };

            return provider.requestImage(0, 0, 0).then(function(image) {
                expect(image).toBeInstanceOf(Image);
            });
        });
    });

    it('supports non-tiled servers', function() {
        var baseUrl = '//tiledArcGisMapServer.invalid';

        stubJSONPCall(baseUrl, {
            "currentVersion" : 10.01,
            "copyrightText" : "Test copyright text"
        });

        var provider = new ArcGisMapServerImageryProvider({
            url : baseUrl
        });

        expect(provider.url).toEqual(baseUrl);

        return pollToPromise(function() {
            return provider.ready;
        }).then(function() {
            expect(provider.tileWidth).toEqual(256);
            expect(provider.tileHeight).toEqual(256);
            expect(provider.maximumLevel).toBeUndefined();
            expect(provider.tilingScheme).toBeInstanceOf(GeographicTilingScheme);
            expect(provider.credit).toBeDefined();
            expect(provider.tileDiscardPolicy).toBeUndefined();
            expect(provider.rectangle).toEqual(new GeographicTilingScheme().rectangle);
            expect(provider.usingPrecachedTiles).toEqual(false);
            expect(provider.enablePickFeatures).toBe(true);

            loadImage.createImage = function(url, crossOrigin, deferred) {
                var uri = new Uri(url);
                var params = queryToObject(uri.query);

                var uriWithoutQuery = new Uri(uri);
                uriWithoutQuery.query = '';

                expect(uriWithoutQuery.toString()).toEqual(baseUrl + '/export');

                expect(params.f).toEqual('image');
                expect(params.bboxSR).toEqual('4326');
                expect(params.imageSR).toEqual('4326');
                expect(params.format).toEqual('png');
                expect(params.transparent).toEqual('true');
                expect(params.size).toEqual('256,256');

                // Just return any old image.
                loadImage.defaultCreateImage('Data/Images/Red16x16.png', crossOrigin, deferred);
            };

            return provider.requestImage(0, 0, 0).then(function(image) {
                expect(image).toBeInstanceOf(Image);
            });
        });
    });

    it('supports non-tiled servers with various constructor parameters', function() {
        var baseUrl = '//tiledArcGisMapServer.invalid';

        stubJSONPCall(baseUrl, {
            "currentVersion" : 10.01,
            "copyrightText" : "Test copyright text"
        });

        var provider = new ArcGisMapServerImageryProvider({
            url : baseUrl,
            tileWidth: 128,
            tileHeight: 512,
            tilingScheme: new WebMercatorTilingScheme(),
            rectangle: Rectangle.fromDegrees(1.0, 2.0, 3.0, 4.0),
            layers: 'foo,bar',
            enablePickFeatures: false
        });

        expect(provider.url).toEqual(baseUrl);

        return pollToPromise(function() {
            return provider.ready;
        }).then(function() {
            expect(provider.tileWidth).toEqual(128);
            expect(provider.tileHeight).toEqual(512);
            expect(provider.maximumLevel).toBeUndefined();
            expect(provider.tilingScheme).toBeInstanceOf(WebMercatorTilingScheme);
            expect(provider.credit).toBeDefined();
            expect(provider.tileDiscardPolicy).toBeUndefined();
            expect(provider.rectangle).toEqual(Rectangle.fromDegrees(1.0, 2.0, 3.0, 4.0));
            expect(provider.usingPrecachedTiles).toBe(false);
            expect(provider.enablePickFeatures).toBe(false);
            expect(provider.layers).toEqual('foo,bar');

            loadImage.createImage = function(url, crossOrigin, deferred) {
                var uri = new Uri(url);
                var params = queryToObject(uri.query);

                var uriWithoutQuery = new Uri(uri);
                uriWithoutQuery.query = '';

                expect(uriWithoutQuery.toString()).toEqual(baseUrl + '/export');

                expect(params.f).toEqual('image');
                expect(params.bboxSR).toEqual('3857');
                expect(params.imageSR).toEqual('3857');
                expect(params.format).toEqual('png');
                expect(params.transparent).toEqual('true');
                expect(params.size).toEqual('128,512');
                expect(params.layers).toEqual('show:foo,bar');

                // Just return any old image.
                loadImage.defaultCreateImage('Data/Images/Red16x16.png', crossOrigin, deferred);
            };

            return provider.requestImage(0, 0, 0).then(function(image) {
                expect(image).toBeInstanceOf(Image);
            });
        });
    });

    it('routes requests through a proxy if one is specified', function() {
        var baseUrl = '//tiledArcGisMapServer.invalid';
        var proxy = new DefaultProxy('/proxy/');

        stubJSONPCall(baseUrl, geographicResult, true);

        var provider = new ArcGisMapServerImageryProvider({
            url : baseUrl,
            proxy : proxy
        });

        expect(provider.url).toEqual(baseUrl);

        return pollToPromise(function() {
            return provider.ready;
        }).then(function() {
            expect(provider.tileWidth).toEqual(128);
            expect(provider.tileHeight).toEqual(256);
            expect(provider.maximumLevel).toEqual(2);
            expect(provider.tilingScheme).toBeInstanceOf(GeographicTilingScheme);
            expect(provider.credit).toBeDefined();
            expect(provider.tileDiscardPolicy).toBeInstanceOf(DiscardMissingTileImagePolicy);
            expect(provider.rectangle).toEqual(new GeographicTilingScheme().rectangle);
            expect(provider.proxy).toEqual(proxy);
            expect(provider.usingPrecachedTiles).toEqual(true);

            loadImage.createImage = function(url, crossOrigin, deferred) {
                if (/^blob:/.test(url)) {
                    // load blob url normally
                    loadImage.defaultCreateImage(url, crossOrigin, deferred);
                } else {
                    expect(url).toEqual(baseUrl + '/tile/0/0/0');

                    // Just return any old image.
                    loadImage.defaultCreateImage('Data/Images/Red16x16.png', crossOrigin, deferred);
                }
            };

            loadWithXhr.load = function(url, responseType, method, data, headers, deferred, overrideMimeType) {
                expect(url).toEqual(proxy.getURL(baseUrl + '/tile/0/0/0'));

                // Just return any old image.
                loadWithXhr.defaultLoad('Data/Images/Red16x16.png', responseType, method, data, headers, deferred);
            };

            return provider.requestImage(0, 0, 0).then(function(image) {
                expect(image).toBeInstanceOf(Image);
            });
        });
    });

    it('raises error on unsupported WKID', function() {
        var baseUrl = '//tiledArcGisMapServer.invalid';

        var unsupportedWKIDResult = {
            "currentVersion" : 10.01,
            "copyrightText" : "Test copyright text",
            "tileInfo" : {
                "rows" : 128,
                "cols" : 256,
                "origin" : {
                    "x" : -180,
                    "y" : 90
                },
                "spatialReference" : {
                    "wkid" : 1234
                },
                "lods" : [{
                    "level" : 0,
                    "resolution" : 0.3515625,
                    "scale" : 147748799.285417
                }, {
                    "level" : 1,
                    "resolution" : 0.17578125,
                    "scale" : 73874399.6427087
                }, {
                    "level" : 2,
                    "resolution" : 0.087890625,
                    "scale" : 36937199.8213544
                }]
            }
        };

        stubJSONPCall(baseUrl, unsupportedWKIDResult);

        var provider = new ArcGisMapServerImageryProvider({
            url : baseUrl
        });

        expect(provider.url).toEqual(baseUrl);

        var tries = 0;
        provider.errorEvent.addEventListener(function(error) {
            expect(error.message.indexOf('WKID') >= 0).toEqual(true);
            ++tries;
            if (tries < 3) {
                error.retry = true;
            }
        });

        return pollToPromise(function() {
            return provider.ready || tries >= 3;
        }).then(function() {
            expect(provider.ready).toEqual(false);
            expect(tries).toEqual(3);
        });
    });

    it('raises error on invalid URL', function() {
        var baseUrl = '//tiledArcGisMapServer.invalid';

        var provider = new ArcGisMapServerImageryProvider({
            url : baseUrl
        });

        expect(provider.url).toEqual(baseUrl);

        var errorEventRaised = false;
        provider.errorEvent.addEventListener(function(error) {
            expect(error.message.indexOf(baseUrl) >= 0).toEqual(true);
            errorEventRaised = true;
        });

        return pollToPromise(function() {
            return provider.ready || errorEventRaised;
        }).then(function() {
            expect(provider.ready).toEqual(false);
            expect(errorEventRaised).toEqual(true);
        });
    });

    it('raises error event when image cannot be loaded', function() {
        var baseUrl = '//tiledArcGisMapServer.invalid';

        stubJSONPCall(baseUrl, {
            "currentVersion" : 10.01,
            "copyrightText" : "Test copyright text"
        });

        var provider = new ArcGisMapServerImageryProvider({
            url : baseUrl
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

    it('honors fullExtent of tiled server with web mercator projection', function() {
        var baseUrl = '//tiledArcGisMapServer.invalid';

        var webMercatorFullExtentResult = {
            "currentVersion" : 10.01,
            "copyrightText" : "Test copyright text",
            "tileInfo" : {
                "rows" : 128,
                "cols" : 256,
                "origin" : {
                    "x" : -20037508.342787,
                    "y" : 20037508.342787
                },
                "spatialReference" : {
                    "wkid" : 102100
                },
                "lods" : [{
                    "level" : 0,
                    "resolution" : 156543.033928,
                    "scale" : 591657527.591555
                }, {
                    "level" : 1,
                    "resolution" : 78271.5169639999,
                    "scale" : 295828763.795777
                }, {
                    "level" : 2,
                    "resolution" : 39135.7584820001,
                    "scale" : 147914381.897889
                }]
            },
            fullExtent : {
                "xmin" : 1.1148026611962173E7,
                "ymin" : -6443518.758206591,
                "xmax" : 1.8830976498143446E7,
                "ymax" : -265936.19697360107,
                "spatialReference" : {
                    "wkid" : 102100
                }
            }
        };

        stubJSONPCall(baseUrl, webMercatorFullExtentResult);

        var provider = new ArcGisMapServerImageryProvider({
            url : baseUrl
        });

        expect(provider.url).toEqual(baseUrl);

        return pollToPromise(function() {
            return provider.ready;
        }).then(function() {
            var projection = new WebMercatorProjection();
            var sw = projection.unproject(new Cartesian2(1.1148026611962173E7, -6443518.758206591));
            var ne = projection.unproject(new Cartesian2(1.8830976498143446E7, -265936.19697360107));
            var rectangle = new Rectangle(sw.longitude, sw.latitude, ne.longitude, ne.latitude);
            expect(provider.rectangle).toEqual(rectangle);
        });
    });

    it('honors fullExtent of tiled server with geographic projection', function() {
        var baseUrl = '//tiledArcGisMapServer.invalid';

        var geographicFullExtentResult = {
            "currentVersion" : 10.01,
            "copyrightText" : "Test copyright text",
            "tileInfo" : {
                "rows" : 128,
                "cols" : 256,
                "origin" : {
                    "x" : -20037508.342787,
                    "y" : 20037508.342787
                },
                "spatialReference" : {
                    "wkid" : 102100
                },
                "lods" : [{
                    "level" : 0,
                    "resolution" : 156543.033928,
                    "scale" : 591657527.591555
                }, {
                    "level" : 1,
                    "resolution" : 78271.5169639999,
                    "scale" : 295828763.795777
                }, {
                    "level" : 2,
                    "resolution" : 39135.7584820001,
                    "scale" : 147914381.897889
                }]
            },
            fullExtent : {
                "xmin" : -123.4,
                "ymin" : -23.2,
                "xmax" : 100.7,
                "ymax" : 45.2,
                "spatialReference" : {
                    "wkid" : 4326
                }
            }
        };

        stubJSONPCall(baseUrl, geographicFullExtentResult);

        var provider = new ArcGisMapServerImageryProvider({
            url : baseUrl
        });

        expect(provider.url).toEqual(baseUrl);

        return pollToPromise(function() {
            return provider.ready;
        }).then(function() {
            expect(provider.rectangle).toEqual(Rectangle.fromDegrees(-123.4, -23.2, 100.7, 45.2));
        });
    });

    it('raises error if the spatialReference of the fullExtent is unknown', function() {
        var baseUrl = '//tiledArcGisMapServer.invalid';

        var unknownSpatialReferenceResult = {
            "currentVersion" : 10.01,
            "copyrightText" : "Test copyright text",
            "tileInfo" : {
                "rows" : 128,
                "cols" : 256,
                "origin" : {
                    "x" : -180,
                    "y" : 90
                },
                "spatialReference" : {
                    "wkid" : 1234
                },
                "lods" : [{
                    "level" : 0,
                    "resolution" : 0.3515625,
                    "scale" : 147748799.285417
                }, {
                    "level" : 1,
                    "resolution" : 0.17578125,
                    "scale" : 73874399.6427087
                }, {
                    "level" : 2,
                    "resolution" : 0.087890625,
                    "scale" : 36937199.8213544
                }]
            },
            fullExtent : {
                "xmin" : -123.4,
                "ymin" : -23.2,
                "xmax" : 100.7,
                "ymax" : 45.2,
                "spatialReference" : {
                    "wkid" : 1234
                }
            }
        };

        stubJSONPCall(baseUrl, unknownSpatialReferenceResult);

        var provider = new ArcGisMapServerImageryProvider({
            url : baseUrl
        });

        expect(provider.url).toEqual(baseUrl);

        var tries = 0;
        provider.errorEvent.addEventListener(function(error) {
            expect(error.message.indexOf('WKID') >= 0).toEqual(true);
            ++tries;
            if (tries < 3) {
                error.retry = true;
            }
        });

        return pollToPromise(function() {
            return provider.ready || tries >= 3;
        }).then(function() {
            expect(provider.ready).toEqual(false);
            expect(tries).toEqual(3);
        });
    });

    describe('pickFeatures', function() {
        it('works with WebMercator geometry', function() {
            var provider = new ArcGisMapServerImageryProvider({
                url : 'made/up/map/server',
                usePreCachedTilesIfAvailable : false
            });

            loadWithXhr.load = function(url, responseType, method, data, headers, deferred, overrideMimeType) {
                expect(url).toContain('identify');
                loadWithXhr.defaultLoad('Data/ArcGIS/identify-WebMercator.json', responseType, method, data, headers, deferred, overrideMimeType);
            };

            return pollToPromise(function() {
                return provider.ready;
            }).then(function() {
                return provider.pickFeatures(0, 0, 0, 0.5, 0.5).then(function(pickResult) {
                    expect(pickResult.length).toBe(1);

                    var firstResult = pickResult[0];
                    expect(firstResult).toBeInstanceOf(ImageryLayerFeatureInfo);
                    expect(firstResult.description).toContain('Hummock Grasses');
                    expect(firstResult.position).toEqual(new WebMercatorProjection().unproject(new Cartesian3(1.481682457042425E7, -2710890.117898505)));
                });
            });
        });

        it('works with Geographic geometry', function() {
            var provider = new ArcGisMapServerImageryProvider({
                url : 'made/up/map/server',
                usePreCachedTilesIfAvailable : false
            });

            loadWithXhr.load = function(url, responseType, method, data, headers, deferred, overrideMimeType) {
                expect(url).toContain('identify');
                loadWithXhr.defaultLoad('Data/ArcGIS/identify-Geographic.json', responseType, method, data, headers, deferred, overrideMimeType);
            };

            return pollToPromise(function() {
                return provider.ready;
            }).then(function() {
                return provider.pickFeatures(0, 0, 0, 0.5, 0.5).then(function(pickResult) {
                    expect(pickResult.length).toBe(1);

                    var firstResult = pickResult[0];
                    expect(firstResult).toBeInstanceOf(ImageryLayerFeatureInfo);
                    expect(firstResult.description).toContain('Hummock Grasses');
                    expect(firstResult.position).toEqual(Cartographic.fromDegrees(123.45, -34.2));
                });
            });
        });

        it('returns undefined if enablePickFeatures is false', function() {
            var provider = new ArcGisMapServerImageryProvider({
                url : 'made/up/map/server',
                usePreCachedTilesIfAvailable : false,
                enablePickFeatures : false
            });

            return pollToPromise(function() {
                return provider.ready;
            }).then(function() {
                expect(provider.pickFeatures(0, 0, 0, 0.5, 0.5)).toBeUndefined();
            });
        });
    });
});
