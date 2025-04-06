require([
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/FeatureLayer",
        "esri/layers/GraphicsLayer",
        "esri/Graphic",
        "esri/geometry/geometryEngine",
        "esri/geometry/Point",
        "esri/widgets/Home"
], function (Map, MapView, FeatureLayer, GraphicsLayer, Graphic, geometryEngine, Point, Home) {

        const map = new Map({
                basemap: "topo-vector"
        });
        map.basemap.baseLayers.forEach(function (basemapLayer) {
                basemapLayer.title = "Basemap";
        });

        const view = new MapView({
                container: "viewDiv",
                map: map,
                center: [12.694560026542595, 22.50948334374261],
                zoom: 2
        });

        const highlightLayer = new GraphicsLayer();
        map.add(highlightLayer);

        const cities = [
                { name: "New York", point: new Point({ longitude: -74.0060, latitude: 40.7128 }) },
                { name: "Chicago", point: new Point({ longitude: -87.6298, latitude: 41.8781 }) },
                { name: "Los Angeles", point: new Point({ longitude: -118.2437, latitude: 34.0522 }) },
                { name: "London", point: new Point({ longitude: -0.1276, latitude: 51.5074 }) },
                { name: "Paris", point: new Point({ longitude: 2.3522, latitude: 48.8566 }) },
                { name: "Tokyo", point: new Point({ longitude: 139.6917, latitude: 35.6895 }) },
                { name: "Sydney", point: new Point({ longitude: 151.2093, latitude: -33.8688 }) },
                { name: "Rio de Janeiro", point: new Point({ longitude: -43.1729, latitude: -22.9068 }) },
                { name: "Cairo", point: new Point({ longitude: 31.2357, latitude: 30.0444 }) },
                { name: "Moscow", point: new Point({ longitude: 37.6173, latitude: 55.7558 }) }
        ];

        cities.forEach(function (city, index) {
                const feature = new Graphic({
                        geometry: city.point,
                        attributes: { ObjectID: index + 1, city: city.name }
                });
                const cityLayer = new FeatureLayer({
                        title: city.name,
                        source: [feature],
                        fields: [
                                { name: "ObjectID", alias: "ObjectID", type: "oid" },
                                { name: "city", alias: "City", type: "string" }
                        ],
                        objectIdField: "ObjectID",
                        geometryType: "point",
                        popupTemplate: {
                                title: "{city}",
                                content: "City: {city}"
                        },
                        renderer: {
                                type: "simple",
                                symbol: {
                                        type: "simple-marker",
                                        style: "circle",
                                        color: "blue",
                                        size: "8px",
                                        outline: { color: "white", width: 1 }
                                }
                        }
                });
                map.add(cityLayer);
        });

        function createTOC() {
                const tocContainer = document.getElementById("toc");
                const dropdown = document.getElementById("layerDropdown");
                tocContainer.innerHTML = "";
                dropdown.innerHTML = '<option value="">Select a layer...</option>';

                map.layers.forEach(function (layer) {
                        if (!layer.title) return;

                        const li = document.createElement("li");
                        li.className = "toc-item";
                        const label = document.createElement("span");
                        label.textContent = layer.title;
                        const controlsDiv = document.createElement("div");
                        controlsDiv.className = "toc-controls";
                        const checkbox = document.createElement("input");
                        checkbox.type = "checkbox";
                        checkbox.checked = layer.visible;
                        checkbox.addEventListener("change", function () {
                                layer.visible = checkbox.checked;
                        });

                        const zoomButton = document.createElement("button");
                        zoomButton.textContent = "🔍";
                        zoomButton.title = "Zoom to Layer";
                        zoomButton.style.cursor = "pointer";
                        zoomButton.addEventListener("click", function () {
                                highlightLayerExtent(layer);
                        });

                        const slider = document.createElement("input");
                        slider.type = "range";
                        slider.min = 0;
                        slider.max = 1;
                        slider.step = 0.1;
                        slider.value = layer.opacity;
                        slider.className = "slider";
                        slider.title = "Change Opacity";
                        slider.addEventListener("input", function () {
                                layer.opacity = parseFloat(slider.value);
                        });

                        controlsDiv.appendChild(checkbox);
                        controlsDiv.appendChild(label);
                        controlsDiv.appendChild(zoomButton);
                        controlsDiv.appendChild(slider);
                        li.appendChild(controlsDiv);
                        tocContainer.appendChild(li);

                        const option = document.createElement("option");
                        option.value = layer.title;
                        option.textContent = layer.title;
                        dropdown.appendChild(option);
                });
        }

        view.when(createTOC);

        function highlightLayerExtent(layer) {
                highlightLayer.removeAll();

                function addHighlight(geometry) {
                        const outerGraphic = new Graphic({
                                geometry: geometry,
                                symbol: {
                                        type: "simple-fill",
                                        color: [255, 255, 255, 0],
                                        outline: {
                                                color: "white",
                                                width: 8,
                                                style: "solid"
                                        }
                                }
                        });
                        const innerGraphic = new Graphic({
                                geometry: geometry,
                                symbol: {
                                        type: "simple-fill",
                                        color: [255, 255, 0, 0.25],
                                        outline: {
                                                color: "red",
                                                width: 4,
                                                style: "dash"
                                        }
                                }
                        });
                        highlightLayer.add(outerGraphic);
                        highlightLayer.add(innerGraphic);
                        view.goTo(geometry);
                }

                layer.when(() => {
                        if (layer.fullExtent) {
                                const pt = layer.fullExtent.center;
                                const buffer = geometryEngine.geodesicBuffer(pt, 1000, "meters");
                                addHighlight(buffer);
                        } else {
                                console.warn("fullExtent is undefined for layer:", layer.title);
                        }
                });

        }

        document.getElementById("layerDropdown").addEventListener("change", function (e) {
                const selectedValue = e.target.value;
                const layer = map.layers.find(function (l) {
                        return l.title === selectedValue;
                });
                if (layer) {
                        highlightLayerExtent(layer);
                }
        });

        const homeButton = new Home({
                view: view
        });
        view.ui.add(homeButton, "top-left");
});