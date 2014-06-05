/*global defineSuite*/
defineSuite([
         'Core/Extent',
         'Core/Math',
         'Core/Cartographic',
         'Core/Cartesian3',
         'Core/Ellipsoid'
     ], function(
         Extent,
         CesiumMath,
         Cartographic,
         Cartesian3,
         Ellipsoid) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    var west = -0.9;
    var south = 0.5;
    var east = 1.4;
    var north = 1.0;
    var center = new Cartographic((west + east) / 2.0, (south + north) / 2.0);

    it('default constructor sets expected values.', function() {
        var extent = new Extent();
        expect(extent.west).toEqual(0.0);
        expect(extent.south).toEqual(0.0);
        expect(extent.north).toEqual(0.0);
        expect(extent.east).toEqual(0.0);
    });

    it('constructor sets expected parameter values.', function() {
        var extent = new Extent(west, south, east, north);
        expect(extent.west).toEqual(west);
        expect(extent.south).toEqual(south);
        expect(extent.east).toEqual(east);
        expect(extent.north).toEqual(north);
    });

    it('fromDegrees produces expected values.', function() {
        var west = -10.0;
        var south = -20.0;
        var east = 10.0;
        var north = 20.0;

        var extent = Extent.fromDegrees(west, south, east, north);
        expect(extent.west).toEqual(CesiumMath.toRadians(west));
        expect(extent.south).toEqual(CesiumMath.toRadians(south));
        expect(extent.east).toEqual(CesiumMath.toRadians(east));
        expect(extent.north).toEqual(CesiumMath.toRadians(north));
    });

    it('fromDegrees works with a result parameter.', function() {
        var west = -10.0;
        var south = -20.0;
        var east = 10.0;
        var north = 20.0;

        var result = new Extent();
        var extent = Extent.fromDegrees(west, south, east, north, result);
        expect(result).toBe(extent);
        expect(extent.west).toEqual(CesiumMath.toRadians(west));
        expect(extent.south).toEqual(CesiumMath.toRadians(south));
        expect(extent.east).toEqual(CesiumMath.toRadians(east));
        expect(extent.north).toEqual(CesiumMath.toRadians(north));
    });

    it('fromCartographicArray produces expected values.', function() {
        var minLon = new Cartographic(-0.1, 0.3, 0.0);
        var minLat = new Cartographic(0.0, -0.2, 0.0);
        var maxLon = new Cartographic(0.3, -0.1, 0.0);
        var maxLat = new Cartographic(0.2, 0.4, 0.0);

        var extent = Extent.fromCartographicArray([minLat, minLon, maxLat, maxLon]);
        expect(extent.west).toEqual(minLon.longitude);
        expect(extent.south).toEqual(minLat.latitude);
        expect(extent.east).toEqual(maxLon.longitude);
        expect(extent.north).toEqual(maxLat.latitude);
    });

    it('fromCartographicArray works with a result parameter.', function() {
        var minLon = new Cartographic(-0.1, 0.3, 0.0);
        var minLat = new Cartographic(0.0, -0.2, 0.0);
        var maxLon = new Cartographic(0.3, -0.1, 0.0);
        var maxLat = new Cartographic(0.2, 0.4, 0.0);

        var result = new Extent();
        var extent = Extent.fromCartographicArray([minLat, minLon, maxLat, maxLon], result);
        expect(result).toBe(extent);
        expect(extent.west).toEqual(minLon.longitude);
        expect(extent.south).toEqual(minLat.latitude);
        expect(extent.east).toEqual(maxLon.longitude);
        expect(extent.north).toEqual(maxLat.latitude);
    });

    it('clone works without a result parameter.', function() {
        var extent = new Extent(west, south, east, north);
        var returnedResult = extent.clone();
        expect(returnedResult).toEqual(extent);
        expect(returnedResult).toNotBe(extent);
    });

    it('clone works with a result parameter.', function() {
        var extent = new Extent(west, south, east, north);
        var result = new Extent();
        var returnedResult = extent.clone(result);
        expect(returnedResult).toEqual(extent);
        expect(returnedResult).toNotBe(extent);
        expect(returnedResult).toBe(result);
    });

    it('clone works with "this" result parameter.', function() {
        var extent = new Extent(west, south, east, north);
        var returnedResult = extent.clone(extent);
        expect(returnedResult).toEqual(new Extent(west, south, east, north));
        expect(returnedResult).toBe(extent);
    });

    it('clone works without extent', function() {
        expect(Extent.clone()).not.toBeDefined();
    });

    it('Equals works in all cases', function() {
        var extent = new Extent(0.1, 0.2, 0.3, 0.4);
        expect(extent.equals(new Extent(0.1, 0.2, 0.3, 0.4))).toEqual(true);
        expect(extent.equals(new Extent(0.5, 0.2, 0.3, 0.4))).toEqual(false);
        expect(extent.equals(new Extent(0.1, 0.5, 0.3, 0.4))).toEqual(false);
        expect(extent.equals(new Extent(0.1, 0.2, 0.5, 0.4))).toEqual(false);
        expect(extent.equals(new Extent(0.1, 0.2, 0.3, 0.5))).toEqual(false);
        expect(extent.equals(undefined)).toEqual(false);
    });

    it('Static equals works in all cases', function() {
        var extent = new Extent(0.1, 0.2, 0.3, 0.4);
        expect(Extent.equals(extent, new Extent(0.1, 0.2, 0.3, 0.4))).toEqual(true);
        expect(Extent.equals(extent, new Extent(0.5, 0.2, 0.3, 0.4))).toEqual(false);
        expect(Extent.equals(extent, new Extent(0.1, 0.5, 0.3, 0.4))).toEqual(false);
        expect(Extent.equals(extent, new Extent(0.1, 0.2, 0.5, 0.4))).toEqual(false);
        expect(Extent.equals(extent, new Extent(0.1, 0.2, 0.3, 0.5))).toEqual(false);
        expect(Extent.equals(extent, undefined)).toEqual(false);
    });

    it('Equals epsilon works in all cases', function() {
        var extent = new Extent(0.1, 0.2, 0.3, 0.4);
        expect(extent.equalsEpsilon(new Extent(0.1, 0.2, 0.3, 0.4), 0.0)).toEqual(true);
        expect(extent.equalsEpsilon(new Extent(0.5, 0.2, 0.3, 0.4), 0.0)).toEqual(false);
        expect(extent.equalsEpsilon(new Extent(0.1, 0.5, 0.3, 0.4), 0.0)).toEqual(false);
        expect(extent.equalsEpsilon(new Extent(0.1, 0.2, 0.5, 0.4), 0.0)).toEqual(false);
        expect(extent.equalsEpsilon(new Extent(0.1, 0.2, 0.3, 0.5), 0.0)).toEqual(false);
        expect(extent.equalsEpsilon(new Extent(0.5, 0.2, 0.3, 0.4), 0.4)).toEqual(true);
        expect(extent.equalsEpsilon(new Extent(0.1, 0.5, 0.3, 0.4), 0.3)).toEqual(true);
        expect(extent.equalsEpsilon(new Extent(0.1, 0.2, 0.5, 0.4), 0.2)).toEqual(true);
        expect(extent.equalsEpsilon(new Extent(0.1, 0.2, 0.3, 0.5), 0.1)).toEqual(true);
        expect(extent.equalsEpsilon(undefined, 0.0)).toEqual(false);
    });

    it('fromCartographicArray throws with no array', function() {
        expect(function() {
            Extent.fromCartographicArray(undefined, new Extent());
        }).toThrowDeveloperError();
    });

    it('validate throws with no extent', function() {
        expect(function() {
            Extent.validate();
        }).toThrowDeveloperError();
    });

    it('validate throws with no west', function() {
        var extent = new Extent(west, south, east, north);
        extent.west = undefined;
        expect(function() {
            Extent.validate(extent);
        }).toThrowDeveloperError();
    });

    it('validate throws with no south', function() {
        var extent = new Extent(west, south, east, north);
        extent.south = undefined;
        expect(function() {
            Extent.validate(extent);
        }).toThrowDeveloperError();
    });

    it('validate throws with no east', function() {
        var extent = new Extent(west, south, east, north);
        extent.east = undefined;
        expect(function() {
            Extent.validate(extent);
        }).toThrowDeveloperError();
    });

    it('validate throws with no north', function() {
        var extent = new Extent(west, south, east, north);
        extent.north = undefined;
        expect(function() {
            Extent.validate(extent);
        }).toThrowDeveloperError();
    });

    it('validate throws with bad west', function() {
        var extent = new Extent(west, south, east, north);
        extent.west = Math.PI * 2;
        expect(function() {
            Extent.validate(extent);
        }).toThrowDeveloperError();
    });

    it('validate throws with bad south', function() {
        var extent = new Extent(west, south, east, north);
        extent.south = Math.PI * 2;
        expect(function() {
            Extent.validate(extent);
        }).toThrowDeveloperError();
    });

    it('validate throws with bad east', function() {
        var extent = new Extent(west, south, east, north);
        extent.east = Math.PI * 2;
        expect(function() {
            Extent.validate(extent);
        }).toThrowDeveloperError();
    });

    it('validate throws with bad north', function() {
        var extent = new Extent(west, south, east, north);
        extent.north = Math.PI * 2;
        expect(function() {
            Extent.validate(extent);
        }).toThrowDeveloperError();
    });

    it('getSouthwest works without a result parameter', function() {
        var extent = new Extent(west, south, east, north);
        var returnedResult = Extent.getSouthwest(extent);
        expect(returnedResult.longitude).toEqual(west);
        expect(returnedResult.latitude).toEqual(south);
    });

    it('getSouthwest works with a result parameter', function() {
        var extent = new Extent(west, south, east, north);
        var result = new Cartographic();
        var returnedResult = Extent.getSouthwest(extent, result);
        expect(returnedResult).toBe(result);
        expect(returnedResult.longitude).toEqual(west);
        expect(returnedResult.latitude).toEqual(south);
    });

    it('getSouthwest throws with no extent', function() {
        expect(function() {
            Extent.getSouthwest();
        }).toThrowDeveloperError();
    });

    it('getNorthwest works without a result parameter', function() {
        var extent = new Extent(west, south, east, north);
        var returnedResult = Extent.getNorthwest(extent);
        expect(returnedResult.longitude).toEqual(west);
        expect(returnedResult.latitude).toEqual(north);
    });

    it('getNorthwest works with a result parameter', function() {
        var extent = new Extent(west, south, east, north);
        var result = new Cartographic();
        var returnedResult = Extent.getNorthwest(extent, result);
        expect(returnedResult).toBe(result);
        expect(returnedResult.longitude).toEqual(west);
        expect(returnedResult.latitude).toEqual(north);
    });

    it('getNothwest throws with no extent', function() {
        expect(function() {
            Extent.getNorthwest();
        }).toThrowDeveloperError();
    });

    it('getNortheast works without a result parameter', function() {
        var extent = new Extent(west, south, east, north);
        var returnedResult = Extent.getNortheast(extent);
        expect(returnedResult.longitude).toEqual(east);
        expect(returnedResult.latitude).toEqual(north);
    });

    it('getNortheast works with a result parameter', function() {
        var extent = new Extent(west, south, east, north);
        var result = new Cartographic();
        var returnedResult = Extent.getNortheast(extent, result);
        expect(returnedResult).toBe(result);
        expect(returnedResult.longitude).toEqual(east);
        expect(returnedResult.latitude).toEqual(north);
    });

    it('getNotheast throws with no extent', function() {
        expect(function() {
            Extent.getNortheast();
        }).toThrowDeveloperError();
    });

    it('getSoutheast works without a result parameter', function() {
        var extent = new Extent(west, south, east, north);
        var returnedResult = Extent.getSoutheast(extent);
        expect(returnedResult.longitude).toEqual(east);
        expect(returnedResult.latitude).toEqual(south);
    });

    it('getSoutheast works with a result parameter', function() {
        var extent = new Extent(west, south, east, north);
        var result = new Cartographic();
        var returnedResult = Extent.getSoutheast(extent, result);
        expect(returnedResult).toBe(result);
        expect(returnedResult.longitude).toEqual(east);
        expect(returnedResult.latitude).toEqual(south);
    });

    it('getSoutheast throws with no extent', function() {
        expect(function() {
            Extent.getSoutheast();
        }).toThrowDeveloperError();
    });

    it('getCenter works without a result parameter', function() {
        var extent = new Extent(west, south, east, north);
        var returnedResult = Extent.getCenter(extent);
        expect(returnedResult).toEqual(center);
    });

    it('getCenter works with a result parameter', function() {
        var extent = new Extent(west, south, east, north);
        var result = new Cartographic();
        var returnedResult = Extent.getCenter(extent, result);
        expect(result).toBe(returnedResult);
        expect(returnedResult).toEqual(center);
    });

    it('getCenter throws with no extent', function() {
        expect(function() {
            Extent.getCenter();
        }).toThrowDeveloperError();
    });

    it('intersectWith works without a result parameter', function() {
        var extent = new Extent(0.5, 0.1, 0.75, 0.9);
        var extent2 = new Extent(0.0, 0.25, 1.0, 0.8);
        var expected = new Extent(0.5, 0.25, 0.75, 0.8);
        var returnedResult = Extent.intersectWith(extent, extent2);
        expect(returnedResult).toEqual(expected);
    });

    it('intersectWith works with a result parameter', function() {
        var extent = new Extent(0.5, 0.1, 0.75, 0.9);
        var extent2 = new Extent(0.0, 0.25, 1.0, 0.8);
        var expected = new Extent(0.5, 0.25, 0.75, 0.8);
        var result = new Extent();
        var returnedResult = Extent.intersectWith(extent, extent2, result);
        expect(returnedResult).toEqual(expected);
        expect(result).toBe(returnedResult);
    });

    it('contains works', function() {
        var extent = new Extent(west, south, east, north);
        expect(Extent.contains(extent, new Cartographic(west, south))).toEqual(true);
        expect(Extent.contains(extent, new Cartographic(west, north))).toEqual(true);
        expect(Extent.contains(extent, new Cartographic(east, south))).toEqual(true);
        expect(Extent.contains(extent, new Cartographic(east, north))).toEqual(true);
        expect(Extent.contains(extent, Extent.getCenter(extent))).toEqual(true);
        expect(Extent.contains(extent, new Cartographic(west - 0.1, south))).toEqual(false);
        expect(Extent.contains(extent, new Cartographic(west, north + 0.1))).toEqual(false);
        expect(Extent.contains(extent, new Cartographic(east, south - 0.1))).toEqual(false);
        expect(Extent.contains(extent, new Cartographic(east + 0.1, north))).toEqual(false);
    });

    it('isEmpty reports a non-empty extent', function() {
        var extent = new Extent(1.0, 1.0, 2.0, 2.0);
        expect(Extent.isEmpty(extent)).toEqual(false);
    });

    it('isEmpty reports true for a point', function() {
        var extent = new Extent(2.0, 2.0, 2.0, 2.0);
        expect(Extent.isEmpty(extent)).toEqual(true);
    });

    it('isEmpty reports true for a north-south line', function() {
        var extent = new Extent(2.0, 2.0, 2.0, 2.1);
        expect(Extent.isEmpty(extent)).toEqual(true);
    });

    it('isEmpty reports true for an east-west line', function() {
        var extent = new Extent(2.0, 2.0, 2.1, 2.0);
        expect(Extent.isEmpty(extent)).toEqual(true);
    });

    it('isEmpty reports true if north-south direction is degenerate', function() {
        var extent = new Extent(1.0, 1.1, 2.0, 1.0);
        expect(Extent.isEmpty(extent)).toEqual(true);
    });

    it('isEmpty reports true if east-west direction is degenerate', function() {
        var extent = new Extent(1.1, 1.0, 1.0, 2.0);
        expect(Extent.isEmpty(extent)).toEqual(true);
    });

    it('isEmpty throws with no extent', function() {
        expect(function() {
            Extent.isEmpty();
        }).toThrowDeveloperError();
    });

    it('subsample works south of the equator', function() {
        var west = 0.1;
        var south = -0.3;
        var east = 0.2;
        var north = -0.4;
        var extent = new Extent(west, south, east, north);
        var returnedResult = Extent.subsample(extent);
        expect(returnedResult).toEqual([Ellipsoid.WGS84.cartographicToCartesian(Extent.getNorthwest(extent)),
                                        Ellipsoid.WGS84.cartographicToCartesian(Extent.getNortheast(extent)),
                                        Ellipsoid.WGS84.cartographicToCartesian(Extent.getSoutheast(extent)),
                                        Ellipsoid.WGS84.cartographicToCartesian(Extent.getSouthwest(extent))]);
    });

    it('subsample works with a result parameter', function() {
        var west = 0.1;
        var south = -0.3;
        var east = 0.2;
        var north = -0.4;
        var extent = new Extent(west, south, east, north);
        var cartesian0 = new Cartesian3();
        var results = [cartesian0];
        var returnedResult = Extent.subsample(extent, Ellipsoid.WGS84, 0.0, results);
        expect(results).toBe(returnedResult);
        expect(results[0]).toBe(cartesian0);
        expect(returnedResult).toEqual([Ellipsoid.WGS84.cartographicToCartesian(Extent.getNorthwest(extent)),
                                        Ellipsoid.WGS84.cartographicToCartesian(Extent.getNortheast(extent)),
                                        Ellipsoid.WGS84.cartographicToCartesian(Extent.getSoutheast(extent)),
                                        Ellipsoid.WGS84.cartographicToCartesian(Extent.getSouthwest(extent))]);
    });

    it('subsample works north of the equator', function() {
        var west = 0.1;
        var south = 0.3;
        var east = 0.2;
        var north = 0.4;
        var extent = new Extent(west, south, east, north);
        var returnedResult = Extent.subsample(extent);
        expect(returnedResult).toEqual([Ellipsoid.WGS84.cartographicToCartesian(Extent.getNorthwest(extent)),
                                        Ellipsoid.WGS84.cartographicToCartesian(Extent.getNortheast(extent)),
                                        Ellipsoid.WGS84.cartographicToCartesian(Extent.getSoutheast(extent)),
                                        Ellipsoid.WGS84.cartographicToCartesian(Extent.getSouthwest(extent))]);
    });

    it('subsample works on the equator', function() {
        var west = 0.1;
        var south = -0.1;
        var east = 0.2;
        var north = 0.0;
        var extent = new Extent(west, south, east, north);
        var returnedResult = Extent.subsample(extent);
        expect(returnedResult.length).toEqual(6);
        expect(returnedResult[0]).toEqual(Ellipsoid.WGS84.cartographicToCartesian(Extent.getNorthwest(extent)));
        expect(returnedResult[1]).toEqual(Ellipsoid.WGS84.cartographicToCartesian(Extent.getNortheast(extent)));
        expect(returnedResult[2]).toEqual(Ellipsoid.WGS84.cartographicToCartesian(Extent.getSoutheast(extent)));
        expect(returnedResult[3]).toEqual(Ellipsoid.WGS84.cartographicToCartesian(Extent.getSouthwest(extent)));

        var cartographic4 = Ellipsoid.WGS84.cartesianToCartographic(returnedResult[4]);
        expect(cartographic4.latitude).toEqual(0.0);
        expect(cartographic4.longitude).toEqualEpsilon(west, CesiumMath.EPSILON16);

        var cartographic5 = Ellipsoid.WGS84.cartesianToCartographic(returnedResult[5]);
        expect(cartographic5.latitude).toEqual(0.0);
        expect(cartographic5.longitude).toEqualEpsilon(east, CesiumMath.EPSILON16);
    });

    it('subsample works at a height above the ellipsoid', function() {
        var west = 0.1;
        var south = -0.3;
        var east = 0.2;
        var north = -0.4;
        var extent = new Extent(west, south, east, north);
        var height = 100000.0;
        var returnedResult = Extent.subsample(extent, Ellipsoid.WGS84, height);

        var nw = Extent.getNorthwest(extent);
        nw.height = height;
        var ne = Extent.getNortheast(extent);
        ne.height = height;
        var se = Extent.getSoutheast(extent);
        se.height = height;
        var sw = Extent.getSouthwest(extent);
        sw.height = height;

        expect(returnedResult).toEqual([Ellipsoid.WGS84.cartographicToCartesian(nw),
                                        Ellipsoid.WGS84.cartographicToCartesian(ne),
                                        Ellipsoid.WGS84.cartographicToCartesian(se),
                                        Ellipsoid.WGS84.cartographicToCartesian(sw)]);
    });

    it('subsample throws with no extent', function() {
        expect(function() {
            Extent.subsample();
        }).toThrowDeveloperError();
    });

    it('equalsEpsilon throws with no epsilon', function() {
        var extent = new Extent(west, south, east, north);
        var other = new Extent();
        expect(function() {
            extent.equalsEpsilon(other, undefined);
        }).toThrowDeveloperError();
    });

    it('intersectWith throws with no extent', function() {
        var extent = new Extent(west, south, east, north);
        expect(function() {
            Extent.intersectWith(undefined);
        }).toThrowDeveloperError();
    });

    it('contains throws with no cartographic', function() {
        var extent = new Extent(west, south, east, north);
        expect(function() {
            Extent.contains(extent, undefined);
        }).toThrowDeveloperError();
    });
});