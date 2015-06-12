/*!
 * SimpleCharts.js
 * http://github.com/reydelleon/cool-chart-js/
 * Version: 0.1.0
 *
 * Copyright 2015 Reydel Leon Machado
 * Released under the MIT license
 * https://github.com/reydelleon/cool-charts-js/blob/master/LICENSE.md
 */

(function (window) {
    'use strict';

    /**
     * Creates the library object with all of it's methods
     *
     * @returns {Object} The library object
     * @private
     */
    function __construct() {

        var SimpleCharts = {},
            name         = "Simple Charts";

        /**
         * Creates a radial chart inside each of the elements matching the parentSelector.
         *
         * @param string parentSelector A jQuery like selector. A chart will be created under each parent matched by
         *         the selector.
         * @param {Object} options An object containing the options to create the charts.
         */
        SimpleCharts.prototype.radialChart = function (parentSelector, options) {

            var __options = options;

            var items = d3.selectAll(parentSelector);

            items.each(function (datum, index) {
                var element = d3.select(this);

                __drawArc(element, index);
            });

            /**
             * Draws an individual arc TODO this is not true and needs to be fixed
             *
             * @param element
             * @param index
             * @private
             */
            function __drawArc(element, index) {
                var svgContainer = element.select('.rc-graphic'),
                    value        = element.attr('data-value'),
                    outOf        = element.attr('data-out-of'),
                    label        = element.attr('data-label'),
                    svg,
                    railArc,
                    dataArc,
                    arcGroup,
                    data         = [{
                        "value": 0.0,
                        "index": 0.5
                    }],
                    twoPi        = 2 * Math.PI,
                    duration     = 2000;

                // This function will be used to build the arc, but it doesn't render anything
                railArc = d3.svg.arc()
                        .startAngle(0)
                        .endAngle(function (d) {
                            return d.value * twoPi;
                        })
                        .innerRadius(101)
                        .outerRadius(104);

                // This function will be used to build the arc, but it doesn't render anything
                dataArc = d3.svg.arc()
                        .startAngle(0)
                        .endAngle(function (d) {
                            return d.value * twoPi;
                        })
                        .innerRadius(100)
                        .outerRadius(105);

                svg = svgContainer.append('svg')
                        .attr('width', 400)
                        .attr('height', 400)
                        .attr('class', 'rc-svgcontainer')
                        .attr('viewBox', '0 0 400 400')
                        .attr('preserveAspectRatio', 'xMinYMin meet')
                        .call(__responsivefy)
                        .append("g")
                        .attr("transform", "translate(" + 400 / 2 + "," + 400 / 2 + ")");

                arcGroup = svg.append('g')
                        .attr('class', 'rc-arc-group')
                        .data(data);

                // Append the rail arc
                arcGroup.append('path')
                        .attr('d', railArc)
                        .attr('class', 'rc-railarc')
                        .attr("fill", 'lightgray')
                        .transition()
                        .duration(duration)
                        .attrTween('d', tweenRailArc({
                            value: 1
                        }));

                // Append the data arc
                arcGroup.append('path')
                        .attr('d', dataArc)
                        .attr('class', 'rc-dataarc')
                        .attr("fill", 'green')
                        .transition()
                        .delay(100)
                        .duration(duration)
                        .attrTween('d', tweenDataArc({
                            value: value / 100
                        }));

                // Show the value
                arcGroup.append('text')
                        .text(value)
                        .attr('class', 'rc-value')
                        .attr('font-size', '4em')
                        .attr('x', -20)
                        .attr('y', 10)
                        .attr('fill', 'darkgrey')
                        .attr('text-anchor', 'middle');

                // Show the separator
                arcGroup.append('text')
                        .text('/')
                        .attr('class', 'rc-separator')
                        .attr('font-size', '3em')
                        .attr('x', 15)
                        .attr('y', -5)
                        .attr('fill', 'darkgrey')
                        .attr('text-anchor', 'middle');

                // Show the Out-Of amount
                arcGroup.append('text')
                        .text(outOf)
                        .attr('class', 'rc-out-of')
                        .attr('font-size', '1.6em')
                        .attr('x', 40)
                        .attr('y', -15)
                        .attr('fill', 'darkgrey')
                        .attr('text-anchor', 'middle');

                // Show the label
                arcGroup.append('text')
                        .text(label)
                        .attr('class', 'rc-label')
                        .attr('font-size', '1em')
                        .attr('x', 0)
                        .attr('y', 30)
                        .attr('fill', 'darkgrey')
                        .attr('text-anchor', 'middle');

                // Helper functions
                function tweenRailArc(b) {
                    return function (a) {
                        var i = d3.interpolate(a, b);

                        return function (t) {
                            return railArc(i(t));
                        };
                    };
                }

                function tweenDataArc(b) {
                    return function (a) {
                        var i = d3.interpolate(a, b);

                        return function (t) {
                            return dataArc(i(t));
                        };
                    };
                }
            }

        };

        /**
         * Makes the chart responsive.
         *
         * NOTE: This function was copied verbatim from http://www.brendansudol.com/posts/responsive-d3/
         *
         * @param svg
         * @private
         */
        SimpleCharts.prototype.__responsivefy = function (svg) {
            // get container + svg aspect ratio
            var container = d3.select(svg.node().parentNode),
                width     = parseInt(svg.style("width")),
                height    = parseInt(svg.style("height")),
                aspect    = width / height;

            // add viewBox and preserveAspectRatio properties,
            // and call resize so that svg resizes on inital page load
            svg.attr("viewBox", "0 0 " + width + " " + height)
                    .attr("perserveAspectRatio", "xMinYMid")
                    .call(resize);

            // to register multiple listeners for same event type,
            // you need to add namespace, i.e., 'click.foo'
            // necessary if you call invoke this function for multiple svgs
            // api docs: https://github.com/mbostock/d3/wiki/Selections#on
            d3.select(window).on("resize." + container.attr("id"), resize);

            // get width of container and resize svg to fit it
            function resize() {
                var targetWidth = parseInt(container.style("width"));
                svg.attr("width", targetWidth);
                svg.attr("height", Math.round(targetWidth / aspect));
            }
        };

        return SimpleCharts;
    }

    // Check dependencies and create the library, if is not defined already
    if (typeof(d3) !== 'undefined') {
        if (typeof(SimpleCharts) !== 'undefined') {
            window.SimpleChart = __construct();
        } else {
            console.log('SimpleCharts library is already defined.')
        }
    } else {
        console.log('This library depends on the d3.js library. Please, make sure you have installed and that you\'re loading it before this one.');
    }

}(window));