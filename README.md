# City Layers TOC Highlight

This repository demonstrates an advanced ArcGIS Maps SDK for JavaScript example. It creates individual FeatureLayers for each of ten world cities, builds a custom Table of Contents (TOC) with checkboxes, zoom icons, and opacity sliders, and applies a unified highlight effect (buffer highlighting) both when a zoom icon is clicked or a layer is selected from a dropdown.

## Features
- Adds each city as its own FeatureLayer.
- A custom sidebar TOC to control layer visibility, opacity, and zoom.
- Highlights (using a buffered area) the city in focus with an attractive outer glow and dashed inner outline.
- Uses `geometryEngine.geodesicBuffer` to correctly buffer cities defined in WGS84.
