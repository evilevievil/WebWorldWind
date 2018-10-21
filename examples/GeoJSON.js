/*
 * Copyright 2003-2006, 2009, 2017, United States Government, as represented by the Administrator of the
 * National Aeronautics and Space Administration. All rights reserved.
 *
 * The NASAWorldWind/WebWorldWind platform is licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Illustrates how to load and display GeoJSON data.
 */

requirejs(['./WorldWindShim',
    './LayerManager'],
    function (WorldWind,
        LayerManager) {
        "use strict";

        // Tell WorldWind to log only warnings and errors.
        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

        // Create the WorldWindow.
        var wwd = new WorldWind.WorldWindow("canvasOne");

        // Create and add layers to the WorldWindow.
        var layers = [
            // Imagery layers.
            { layer: new WorldWind.BMNGLayer(), enabled: true },
            // Add atmosphere layer on top of base layer.
            { layer: new WorldWind.AtmosphereLayer(), enabled: true },
            // WorldWindow UI layers.
            { layer: new WorldWind.CompassLayer(), enabled: true },
            { layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true },
            { layer: new WorldWind.ViewControlsLayer(wwd), enabled: true }
        ];

        for (var l = 0; l < layers.length; l++) {
            layers[l].layer.enabled = layers[l].enabled;
            wwd.addLayer(layers[l].layer);
        }

        // Set up the common placemark attributes.
        var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
        placemarkAttributes.imageScale = 0.05;
        placemarkAttributes.imageColor = WorldWind.Color.WHITE;
        placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
            WorldWind.OFFSET_FRACTION, 0.5,
            WorldWind.OFFSET_FRACTION, 1.5);
        placemarkAttributes.imageSource = WorldWind.configuration.baseUrl + "images/white-dot.png";

        var shapeConfigurationCallback = function (geometry, properties) {
            var configuration = {};

            if (geometry.isPointType() || geometry.isMultiPointType()) {
                configuration.attributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);

                if (properties && (properties.name || properties.Name || properties.NAME)) {
                    configuration.name = properties.name || properties.Name || properties.NAME;
                }
                if (properties && properties.POP_MAX) {
                    var population = properties.POP_MAX;
                    configuration.attributes.imageScale = 0.01 * Math.log(population);
                }
            }
            else if (geometry.isLineStringType() || geometry.isMultiLineStringType()) {
                configuration.attributes = new WorldWind.ShapeAttributes(null);
                configuration.attributes.drawOutline = true;
                configuration.attributes.outlineColor = new WorldWind.Color(
                    0.1 * configuration.attributes.interiorColor.red,
                    0.3 * configuration.attributes.interiorColor.green,
                    0.7 * configuration.attributes.interiorColor.blue,
                    1.0);
                configuration.attributes.outlineWidth = 2.0;
            }
            else if (geometry.isPolygonType() || geometry.isMultiPolygonType()) {
                configuration.attributes = new WorldWind.ShapeAttributes(null);

                // Fill the polygon with a random pastel color.
                configuration.attributes.interiorColor = new WorldWind.Color(
                    0.375 + 0.5 * Math.random(),
                    0.375 + 0.5 * Math.random(),
                    0.375 + 0.5 * Math.random(),
                    0.5);
                // Paint the outline in a darker variant of the interior color.
                configuration.attributes.outlineColor = new WorldWind.Color(
                    0.5 * configuration.attributes.interiorColor.red,
                    0.5 * configuration.attributes.interiorColor.green,
                    0.5 * configuration.attributes.interiorColor.blue,
                    1.0);
            }

            return configuration;
        };

        var parserCompletionCallback = function (layer) {
            wwd.addLayer(layer);
            layerManager.synchronizeLayerList();
        };

        var meteoriteUrl = "https://data.nasa.gov/resource/y77d-th95.geojson";

        /*         //Search By Id
                var idNumber = "1";     //get from FE
                var meteoriteIdLayer = new WorldWind.RenderableLayer("Search By Id");
                var meteoriteSearchIdGeoJSON = new WorldWind.GeoJSONParser(meteoriteUrl + "/?id=" + idNumber);
                meteoriteSearchIdGeoJSON.load(null, shapeConfigurationCallback, meteoriteIdLayer);
                wwd.addLayer(meteoriteIdLayer); 
        
                //Search By Name
                var meteoriteName = "Api";     //get from FE
                var meteoriteNameLayer = new WorldWind.RenderableLayer("Search By Name");
                var meteoriteSearchNameGeoJSON = new WorldWind.GeoJSONParser(meteoriteUrl + "/?name=" + meteoriteName);
                meteoriteSearchNameGeoJSON.load(null, shapeConfigurationCallback, meteoriteNameLayer);
                wwd.addLayer(meteoriteNameLayer);  */

        //Filter By Found
        var meteoriteFoundLayer = new WorldWind.RenderableLayer("Found Meteorite");
        var meteoriteFoundGeoJSON = new WorldWind.GeoJSONParser(meteoriteUrl + "/?fall=Found");
        meteoriteFoundGeoJSON.load(null, shapeConfigurationCallback, meteoriteFoundLayer);
        wwd.addLayer(meteoriteFoundLayer);

        //Filter By Fell
        var meteoriteFellLayer = new WorldWind.RenderableLayer("Fallen Meteorite");
        var meteoriteFellGeoJSON = new WorldWind.GeoJSONParser(meteoriteUrl + "/?fall=Fell");
        meteoriteFellGeoJSON.load(null, shapeConfigurationCallback, meteoriteFellLayer);
        wwd.addLayer(meteoriteFellLayer);

        //Show All Meteorite
        var allMeteoritePointLayer = new WorldWind.RenderableLayer("Show All Meteorites");
        var allMeteoritePointGeoJSON = new WorldWind.GeoJSONParser(meteoriteUrl);
        allMeteoritePointGeoJSON.load(null, shapeConfigurationCallback, allMeteoritePointLayer);
        wwd.addLayer(allMeteoritePointLayer);

        var showAllMeteorites = function (e) {
            allMeteoritePointLayer.enabled = !allMeteoritePointLayer.enabled;
            wwd.redraw();
        }
        /*
        var searchByLatLong = function (e) {
            var searchlat = document.getElementById("search-lat");
            var searchlong = document.getElementById("search-long");
            var lat = searchlat.value;
            var long = searchlong.value;
            var flat = parseFloat(lat);
            var flong = parseFloat(long);
            var errorMargin = 10;
            var meteoriteLatLongLayer = new WorldWind.RenderableLayer("Search By Lat Long");
            var queryString2 = "/?$query=SELECT%20*%20WHERE%20reclat%20between%20%27" + (flat - errorMargin).toString() + "%27%20AND%20%27"
            + (flat + errorMargin).toString() + "%27%20AND%20reclong%20between%20%27" + (flong - errorMargin).toString() + "%27%20AND%20%27"
            + (flong + errorMargin).toString() + "%27";
            var queryString = "/?$query=SELECT%20*%20WHERE%20(reclat%20BETWEEN%20%27" + (flat + errorMargin).toString() + 
            "%27%20AND%20%27" + (flat - errorMargin).toString() + "%27)%20AND%20(reclong%20BETWEEN%20%27" + (flong + errorMargin).toString() + 
            "%27%20AND%20%27" + (flong - errorMargin).toString() + "%27%29";
            //console.log(queryString);
            var meteoriteLatLongGeoJSON =
                new WorldWind.GeoJSONParser(meteoriteUrl + queryString2);
            meteoriteLatLongGeoJSON.load(null, shapeConfigurationCallback, meteoriteLatLongLayer);
            wwd.addLayer(meteoriteLatLongLayer);
            console.log("HELLO");
        }
        */
        var searchByTimeRange = function (e) {
            var strStart = document.getElementById("range-start");
            var strEnd = document.getElementById("range-end");
            var start = strStart.value;
            var end = strEnd.value;
            var meteoriteTimeRangeLayer = new WorldWind.RenderableLayer("Search By Time Range");
            var queryString = "/?$query=SELECT%20*%20WHERE%20year%20>=%20%27" + start + "-01-01T00:00:00.000%27%20AND%20year%20<=%20%27"
            + end + "-01-01T00:00:00.000%27";
            var meteoriteTimeRangeGeoJSON =
                new WorldWind.GeoJSONParser(meteoriteUrl + queryString);
            meteoriteTimeRangeGeoJSON.load(null, shapeConfigurationCallback, meteoriteTimeRangeLayer);
            wwd.addLayer(meteoriteTimeRangeLayer);
            console.log("HELLO");
        }
        //$("#go-button").on("click", searchByLatLong);
        $("#go-button2").on("click", searchByTimeRange);

        // Create a layer manager for controlling layer visibility.
        var layerManager = new LayerManager(wwd);
        layerManager.synchronizeLayerList();
        layerManager.goToAnimator.goTo(new WorldWind.Location(38.72, 14.91))
    });


