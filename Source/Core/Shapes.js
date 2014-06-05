/*global define*/
define([
        './defaultValue',
        './defined',
        './DeveloperError',
        './Math',
        './Cartesian2',
        './Cartesian3',
        './Quaternion',
        './Matrix3'
    ], function(
        defaultValue,
        defined,
        DeveloperError,
        CesiumMath,
        Cartesian2,
        Cartesian3,
        Quaternion,
        Matrix3) {
    "use strict";

    function _computeEllipseQuadrant(cb, cbRadius, aSqr, bSqr, ab, ecc, unitPos, eastVec, northVec, rotation,
                                     thetaPts, thetaPtsIndex, offset, clockDir, ellipsePts, ellipsePtsIndex, numPts) {
        var angle;
        var theta;
        var radius;
        var azimuth;
        var temp;
        var temp2;
        var rotAxis;
        var tempVec;

        for (var i = 0; i < numPts; i++, thetaPtsIndex += clockDir, ++ellipsePtsIndex) {
            theta = (clockDir > 0) ? (thetaPts[thetaPtsIndex] + offset) : (offset - thetaPts[thetaPtsIndex]);

            azimuth = theta + rotation;

            temp = -Math.cos(azimuth);

            rotAxis = Cartesian3.multiplyByScalar(eastVec, temp);

            temp = Math.sin(azimuth);
            tempVec = Cartesian3.multiplyByScalar(northVec, temp);

            rotAxis = Cartesian3.add(rotAxis, tempVec, rotAxis);

            temp = Math.cos(theta);
            temp = temp * temp;

            temp2 = Math.sin(theta);
            temp2 = temp2 * temp2;

            radius = ab / Math.sqrt(bSqr * temp + aSqr * temp2);
            angle = radius / cbRadius;

            // Create the quaternion to rotate the position vector to the boundary of the ellipse.
            temp = Math.sin(angle / 2.0);

            var unitQuat = Quaternion.normalize(new Quaternion(rotAxis.x * temp, rotAxis.y * temp, rotAxis.z * temp, Math.cos(angle / 2.0)));
            var rotMtx = Matrix3.fromQuaternion(unitQuat);

            var tmpEllipsePts = Matrix3.multiplyByVector(rotMtx, unitPos);
            var unitCart = Cartesian3.normalize(tmpEllipsePts);
            tmpEllipsePts = Cartesian3.multiplyByScalar(unitCart, cbRadius);
            ellipsePts[ellipsePtsIndex] = tmpEllipsePts;
        }
    }

    /**
     * Functions to compute the boundary positions for shapes, such as circles,
     * drawn on the ellipsoid.
     *
     * @exports Shapes
     *
     * @demo <a href="http://cesiumjs.org/Cesium/Apps/Sandcastle/index.html?src=Circles%20and%20Ellipses.html">Cesium Sandcastle Circles and Ellipses Demo</a>
     */
    var Shapes = {
        /**
         * Computes boundary points for a circle on the ellipsoid.
         * <br /><br />
         * The <code>granularity</code> determines the number of points
         * in the boundary.  A lower granularity results in more points and a more
         * exact circle.
         * <br /><br />
         * An outlined circle is rendered by passing the result of this function call to
         * {@link Polyline#positions}.  A filled circle is rendered by passing
         * the result to {@link Polygon#positions}.
         *
         * @param {Ellipsoid} ellipsoid The ellipsoid the circle will be on.
         * @param {Cartesian3} center The circle's center point in the fixed frame.
         * @param {Number} radius The radius in meters.
         * @param {Number} [granularity] The angular distance between points on the circle.
         *
         * @exception {DeveloperError} radius must be greater than zero.
         * @exception {DeveloperError} granularity must be greater than zero.
         *
         * @see Polyline#positions
         * @see Polygon#positions
         *
         * @example
         * // Create a polyline of a circle
         * var polyline = new Cesium.Polyline();
         * polyline.positions = Cesium.Shapes.computeCircleBoundary(
         *   ellipsoid, ellipsoid.cartographicToCartesian(
         *     Cesium.Cartographic.fromDegrees(-75.59777, 40.03883, 0.0)), 100000.0);
         */
        computeCircleBoundary : function(ellipsoid, center, radius, granularity) {
            granularity = defaultValue(granularity, CesiumMath.RADIANS_PER_DEGREE);

            //>>includeStart('debug', pragmas.debug);
            if (!defined(ellipsoid) || !defined(center) || !defined(radius)) {
                throw new DeveloperError('ellipsoid, center, and radius are required.');
            }
            if (radius <= 0.0) {
                throw new DeveloperError('radius must be greater than zero.');
            }
            if (granularity <= 0.0) {
                throw new DeveloperError('granularity must be greater than zero.');
            }
            //>>includeEnd('debug');

            return this.computeEllipseBoundary(ellipsoid, center, radius, radius, 0, granularity);
        },

        /**
         * Computes boundary points for an ellipse on the ellipsoid.
         * <br /><br />
         * The <code>granularity</code> determines the number of points
         * in the boundary.  A lower granularity results in more points and a more
         * exact circle.
         * <br /><br />
         * An outlined ellipse is rendered by passing the result of this function call to
         * {@link Polyline#positions}.  A filled ellipse is rendered by passing
         * the result to {@link Polygon#positions}.
         *
         * @param {Ellipsoid} ellipsoid The ellipsoid the ellipse will be on.
         * @param {Cartesian3} center The ellipse's center point in the fixed frame.
         * @param {Number} semiMajorAxis The length of the ellipse's semi-major axis in meters.
         * @param {Number} semiMinorAxis The length of the ellipse's semi-minor axis in meters.
         * @param {Number} [rotation] The angle from north (clockwise) in radians. The default is zero.
         * @param {Number} [granularity] The angular distance between points on the circle.
         *
         * @exception {DeveloperError} Semi-major and semi-minor axes must be greater than zero.
         * @exception {DeveloperError} granularity must be greater than zero.
         *
         * @see Polyline#positions
         * @see Polygon#positions
         *
         * @returns The set of points that form the ellipse's boundary.
         *
         * @example
         * // Create a filled ellipse.
         * var polygon = new Cesium.Polygon();
         * polygon.positions = Cesium.Shapes.computeEllipseBoundary(
         *   ellipsoid, ellipsoid.cartographicToCartesian(
         *      Cesium.Cartographic.fromDegrees(-75.59777, 40.03883)), 500000.0, 300000.0, Cesium.Math.toRadians(60));
         */
        computeEllipseBoundary : function(ellipsoid, center, semiMajorAxis, semiMinorAxis, rotation, granularity) {
            rotation = defaultValue(rotation, 0.0);
            granularity = defaultValue(granularity, CesiumMath.RADIANS_PER_DEGREE);

            //>>includeStart('debug', pragmas.debug);
            if (!defined(ellipsoid) || !defined(center) || !defined(semiMajorAxis) || !defined(semiMinorAxis)) {
                throw new DeveloperError('ellipsoid, center, semiMajorAxis, and semiMinorAxis are required.');
            }
            if (semiMajorAxis <= 0.0 || semiMinorAxis <= 0.0) {
                throw new DeveloperError('Semi-major and semi-minor axes must be greater than zero.');
            }
            if (granularity <= 0.0) {
                throw new DeveloperError('granularity must be greater than zero.');
            }
            //>>includeEnd('debug');

            if (semiMajorAxis < semiMinorAxis) {
               var t = semiMajorAxis;
               semiMajorAxis = semiMinorAxis;
               semiMinorAxis = t;
            }

            var MAX_ANOMALY_LIMIT = 2.31;

            var aSqr = semiMajorAxis * semiMajorAxis;
            var bSqr = semiMinorAxis * semiMinorAxis;
            var ab = semiMajorAxis * semiMinorAxis;

            var value = 1.0 - (bSqr / aSqr);
            var ecc = Math.sqrt(value);

            var surfPos = Cartesian3.clone(center);
            var surfPosMag = Cartesian3.magnitude(surfPos);

            var tempVec = new Cartesian3(0.0, 0.0, 1);
            var temp = 1.0 / surfPosMag;

            var unitPos = Cartesian3.multiplyByScalar(surfPos, temp);
            var eastVec = Cartesian3.normalize(Cartesian3.cross(tempVec, surfPos));
            var northVec = Cartesian3.cross(unitPos, eastVec);

            var numQuadrantPts = 1 + Math.ceil(CesiumMath.PI_OVER_TWO / granularity);
            var deltaTheta = MAX_ANOMALY_LIMIT / (numQuadrantPts - 1);
            var thetaPts = [];
            var thetaPtsIndex = 0;

            var sampleTheta = 0.0;
            for (var i = 0; i < numQuadrantPts; i++, sampleTheta += deltaTheta, ++thetaPtsIndex) {
                thetaPts[thetaPtsIndex] = sampleTheta - ecc * Math.sin(sampleTheta);
                if (thetaPts[thetaPtsIndex] >= CesiumMath.PI_OVER_TWO) {
                    thetaPts[thetaPtsIndex] = CesiumMath.PI_OVER_TWO;
                    numQuadrantPts = i + 1;
                    break;
                }
            }

            var ellipsePts = [];

            _computeEllipseQuadrant(ellipsoid, surfPosMag, aSqr, bSqr, ab, ecc, unitPos, eastVec, northVec, rotation,
                                   thetaPts, 0.0, 0.0, 1, ellipsePts, 0, numQuadrantPts - 1);

            _computeEllipseQuadrant(ellipsoid, surfPosMag, aSqr, bSqr, ab, ecc, unitPos, eastVec, northVec, rotation,
                                   thetaPts, numQuadrantPts - 1, Math.PI, -1, ellipsePts, numQuadrantPts - 1, numQuadrantPts - 1);

            _computeEllipseQuadrant(ellipsoid, surfPosMag, aSqr, bSqr, ab, ecc, unitPos, eastVec, northVec, rotation,
                                   thetaPts, 0.0, Math.PI, 1, ellipsePts, (2 * numQuadrantPts) - 2, numQuadrantPts - 1);

            _computeEllipseQuadrant(ellipsoid, surfPosMag, aSqr, bSqr, ab, ecc, unitPos, eastVec, northVec, rotation,
                                   thetaPts, numQuadrantPts - 1, CesiumMath.TWO_PI, -1, ellipsePts, (3 * numQuadrantPts) - 3, numQuadrantPts);

            ellipsePts.push(Cartesian3.clone(ellipsePts[0])); // Duplicates first and last point for polyline

            return ellipsePts;
        },

        /**
         * Computes a 2D circle about the origin.
         *
         * @param {Number} [radius = 1.0] The radius of the circle
         * @param {Number} [granularity = Cesium.RADIANS_PER_DEGREE*2] The radius of the circle
         *
         * @returns The set of points that form the ellipse's boundary.
         *
         * @example
         * var circle = Cesium.Shapes.compute2DCircle(100000.0);
         */
        compute2DCircle : function(radius, granularity) {
            radius = defaultValue(radius, 1.0);
            granularity = defaultValue(granularity, CesiumMath.RADIANS_PER_DEGREE*2);
            var positions = [];
            var theta = CesiumMath.toRadians(1.0);
            var posCount = Math.PI*2/theta;
            for (var i = 0; i < posCount; i++) {
                positions.push(new Cartesian2(radius * Math.cos(theta * i), radius * Math.sin(theta * i)));
            }
            return positions;
        }
    };

    return Shapes;
});
