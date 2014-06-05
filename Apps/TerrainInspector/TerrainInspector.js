/*global require,document*/
require([
    'Cesium',
    'dojo/dom-construct',
    'dijit/TitlePane',
    'dijit/form/Button',
    'dijit/form/CheckBox'
], function(
    Cesium,
    domConstruct,
    TitlePane,
    Button,
    CheckBox) {
    "use strict";

    var viewer = new Cesium.Viewer('cesiumContainer');

    var scene = viewer.scene;
    var centralBody = scene.getPrimitives().getCentralBody();
    centralBody.depthTestAgainstTerrain = true;

    centralBody.terrainProvider = new Cesium.CesiumTerrainProvider({
        url : 'http://cesiumjs.org/smallterrain'
    });

    var tp = new TitlePane({
        title: 'Terrain Debugging',
        id:'title-pane',
        content: '<table id="debuggingTable"></table>',
        open: true
    });
    document.getElementById("toolbar").appendChild(tp.domNode);

    domConstruct.place('<tr><td id="wireFrameToggle"></td><td>Wireframe</td></tr>\
                        <tr><td id="updateLodToggle"></td><td>Suspend LOD update</td></tr>\
                        <tr><td id="showTileCoordinatesToggle"></td><td>Show tile coordinates</td></tr>\
                        <tr><td id="selectTileButton" colspan="2"></td></tr>\
                        <tr><td id="selectedTileLabel" colspan="2">None</td></tr>\
                        <tr><td id="selectedTileExtentSWLabel" colspan="2">&nbsp;</td></tr>\
                        <tr><td id="selectedTileExtentNELabel" colspan="2">&nbsp;</td></tr>\
                        <tr><td id="boundingSphereToggle"></td><td>Show bounding sphere of selected tile</td></tr>\
                        <tr><td id="renderSelectedTileOnlyToggle"></td><td>Render selected tile only</td></tr>', 'debuggingTable');

    new CheckBox({
        checked: centralBody._surface.wireframe,
        onChange: function(b) {
            centralBody._surface._debug.wireframe = b;

        }
    }).placeAt('wireFrameToggle');

    var suspendLodCheckbox = new CheckBox({
        checked: centralBody._surface._debug.suspendLodUpdate,
        onChange: function(b) {
            centralBody._surface._debug.suspendLodUpdate = b;
            if (!b) {
                renderSelectedTileOnlyCheckbox.set("checked", false);
            }
        }
    });
    suspendLodCheckbox.placeAt('updateLodToggle');

    var tileBoundariesLayer;

    new CheckBox({
        checked: Cesium.defined(tileBoundariesLayer),
        onChange: function(b) {
            if (b && !Cesium.defined(tileBoundariesLayer)) {
                tileBoundariesLayer = centralBody.getImageryLayers().addImageryProvider(new Cesium.TileCoordinatesImageryProvider({
                    tilingScheme : centralBody.terrainProvider.getTilingScheme()
                }));
            } else if (!b && Cesium.defined(tileBoundariesLayer)) {
                centralBody.getImageryLayers().remove(tileBoundariesLayer);
                tileBoundariesLayer = undefined;
            }

        }
    }).placeAt('showTileCoordinatesToggle');

    var selectingTile = false;
    var showBoundingSphere = true;
    var selectedTile;
    var renderSelectedTileOnly = false;

    function selectTile(event) {
        selectedTile = undefined;

        var ellipsoid = centralBody.getEllipsoid();
        var cartesian = scene.getCamera().controller.pickEllipsoid({x: event.clientX, y: event.clientY}, ellipsoid);

        if (Cesium.defined(cartesian)) {
            var cartographic = ellipsoid.cartesianToCartographic(cartesian);

            // Find a tile containing this position.

            var tilesRendered = centralBody._surface._tilesToRenderByTextureCount;
            for (var textureCount = 0; !selectedTile && textureCount < tilesRendered.length; ++textureCount) {
                var tilesRenderedByTextureCount = tilesRendered[textureCount];
                if (!Cesium.defined(tilesRenderedByTextureCount)) {
                    continue;
                }

                for (var tileIndex = 0; !selectedTile && tileIndex < tilesRenderedByTextureCount.length; ++tileIndex) {
                    var tile = tilesRenderedByTextureCount[tileIndex];
                    if (tile.extent.contains(cartographic)) {
                        selectedTile = tile;
                    }
                }
            }
        }

        var text;
        var sw;
        var ne;
        if (selectedTile) {
            text = 'L: ' + selectedTile.level + ' X: ' + selectedTile.x + ' Y: ' + selectedTile.y;
            sw = 'SW corner: ' + selectedTile.extent.west + ', ' + selectedTile.extent.south;
            ne = 'NE corner: ' + selectedTile.extent.east + ', ' + selectedTile.extent.north;
        } else {
            text = 'None';
            sw = '&nbsp;';
            ne = '&nbsp;';
        }

        if (showBoundingSphere) {
            centralBody._surface._debug.boundingSphereTile = selectedTile;
        }

        document.getElementById('selectedTileLabel').innerHTML = text;
        document.getElementById('selectedTileExtentSWLabel').innerHTML = sw;
        document.getElementById('selectedTileExtentNELabel').innerHTML = ne;

        viewer.cesiumWidget.canvas.removeEventListener('mousedown', selectTile, false);
        selectingTile = false;
    }

    new Button({
        label: "Select tile...",
        showLabel: true,
        onClick: function() {
            selectingTile = !selectingTile;
            if (selectingTile) {
                document.getElementById("selectedTileLabel").innerHTML = 'Click a tile!';
                viewer.cesiumWidget.canvas.addEventListener('mousedown', selectTile, false);
            } else {
                viewer.cesiumWidget.canvas.removeEventListener('mousedown', selectTile, false);
            }
        }
    }).placeAt('selectTileButton');

    new CheckBox({
        checked: showBoundingSphere,
        onChange: function(b) {
            showBoundingSphere = b;
            if (!showBoundingSphere) {
                centralBody._surface._debug.boundingSphereTile = undefined;
            } else {
                centralBody._surface._debug.boundingSphereTile = selectedTile;
            }
        }
    }).placeAt('boundingSphereToggle');

    var renderSelectedTileOnlyCheckbox = new CheckBox({
        checked: renderSelectedTileOnly,
        onChange: function(b) {
            if (!b) {
                suspendLodCheckbox.set("checked", false);
            } else {
                suspendLodCheckbox.set("checked", true);
                centralBody._surface._tilesToRenderByTextureCount = [];

                if (Cesium.defined(selectedTile)) {
                    var readyTextureCount = 0;
                    var tileImageryCollection = selectedTile.imagery;
                    for (var i = 0, len = tileImageryCollection.length; i < len; ++i) {
                        var tileImagery = tileImageryCollection[i];
                        if (Cesium.defined(tileImagery.readyImagery) && tileImagery.readyImagery.imageryLayer.alpha !== 0.0) {
                            ++readyTextureCount;
                        }
                    }

                    centralBody._surface._tilesToRenderByTextureCount[readyTextureCount] = [selectedTile];
                }
            }
        }
    });
    renderSelectedTileOnlyCheckbox.placeAt('renderSelectedTileOnlyToggle');
});
