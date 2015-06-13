/*!
 * SimpleCharts.js
 * http://github.com/reydelleon/cool-chart-js/
 * Version: 0.1.0
 *
 * Copyright 2015 Reydel Leon Machado
 * Released under the MIT license
 * https://github.com/reydelleon/cool-charts-js/blob/master/LICENSE.md
 */

if (typeof(d3) !== 'undefined') {

    // The library object
    var SimpleChart = SimpleChart || {};

    // Facilitates namespaces creation
    SimpleChart.namespace = function (ns_string) {

        'use strict';

        var parts  = ns_string.split('.'),
            parent = SimpleChart,
            i;

        // strip redundant leading global if (parts[0] === "MYAPP") {
        if (parts[0] === 'SimpleChart') {
            parts = parts.slice(1);
        }

        for (i = 0; i < parts.length; i += 1) {
            // create a property if it doesn't exist
            if (typeof parent[parts[i]] === "undefined") {
                parent[parts[i]] = {};
            }
            parent = parent[parts[i]];
        }
        return parent;
    };

    /* Create namespaces
     *********************************************/
    SimpleChart.namespace('radial');
    SimpleChart.namespace('utilities');

    /* Implement namespaces
     *********************************************/
    SimpleChart.utilities = (function () {

        'use strict';

        /* Private properties
         *********************************/
        var __responsivefy,
            __extend;

        /* Private methods
         *********************************/

        /**
         * Makes the chart responsive.
         *
         * NOTE: This function was copied verbatim from http://www.brendansudol.com/posts/responsive-d3/
         *
         * @param {Object} svg An SVG element
         * @private
         */
        __responsivefy = function (svg) {

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

        /**
         * Will copy the property values from the object passed as a parameter to the invocating object. Only those
         * properties present in the calling object will be copied. This method is very useful to clean user input
         * and assign default values to parameters.
         *
         * @param {Object} fromObject The object which property values will be copied.
         * @return {Object} result The merged object
         * @private
         */
        __extend = function (defaultsObject, fromObject) {

            var result = defaultsObject,
                property,
                hasOwn = Object.prototype.hasOwnProperty;

            for (property in fromObject) {
                if (hasOwn.call(result, property)) {
                    if (fromObject[property] !== undefined) {
                        result[property] = fromObject[property];
                    }
                }
            }

            return result;
        };

        /* Expose the public API
         *****************************************/
        return {
            responsivefy: __responsivefy,
            __extend: __extend
        };

    }());

    SimpleChart.radial = (function () {

        'use strict';

        /* Dependencies
         ********************************/
        var __extend     = SimpleChart.utilities.__extend,
            responsivefy = SimpleChart.utilities.responsivefy,

            /* Private properties
             ********************************/
            __types      = ['simple'],
            __options,
            __create,
            __createSimple,
            __drawArc,
            __tweenArc;

        /* Private methods
         *********************************/

        /**
         * Creates a simple radial chart.
         *
         * @param options
         * @private
         */
        __createSimple = function (options) {

            var __defaults = {
                    parentSelector: '.radial-chart',
                    svgContainerClass: '.rc-graphic',
                    startValue: 0.0,
                    endValue: 1,
                    outOf: 100,
                    label: "Default Chart",
                    duration: 2000
                },
                parentElements;

            __options = __extend(__defaults, options);

            parentElements = d3.selectAll(__options.parentSelector);

            parentElements.each(function (datum, index) {
                var element = d3.select(this);

                __drawArc(element, index);
            });
        };

        /**
         * Creates an SVG element containing the charts arc and appends it to the parent element passed as the first
         * argument.
         *
         * @param element the parent element to which the resulting SVG
         * @param index
         * @private
         */
        __drawArc = function (element, index) {

            var svgContainer = element.select('.rc-graphic') || __options.svgContainerClass,
                startValue   = element.attr('data-start-value') || __options.startValue,
                endValue     = element.attr('data-end-value') || __options.endValue,
                outOf        = element.attr('data-out-of') || __options.outOf,
                label        = element.attr('data-label') || __options.label,
                svg,
                arc,
                arcGroup,
                twoPi        = 2 * Math.PI,
                duration     = __options.duration;

            // The parameters to build the arc are passed when appending the arc to the SVG
            arc = d3.svg.arc();

            svg = svgContainer.append('svg')
                    .attr('width', 400)
                    .attr('height', 400)
                    .attr('class', 'rc-svg')
                    .attr('viewBox', '0 0 400 400')
                    .attr('preserveAspectRatio', 'xMinYMin meet')
                    .call(responsivefy)
                    .append("g")
                    .attr("transform", "translate(" + 400 / 2 + "," + 400 / 2 + ")");

            arcGroup = svg.append('g')
                    .attr('class', 'rc-arc-group');

            // Append the rail arc
            arcGroup.append('path')
                    .datum({startAngle: 0, endAngle: 0, innerRadius: 101, outerRadius: 104})
                    .attr('d', arc)
                    .attr('class', 'rc-railarc')
                    .attr("fill", 'lightgray')
                    .transition()
                    .duration(duration)
                    .call(__tweenArc, twoPi, arc);

            // Append the data arc
            arcGroup.append('path')
                    .datum({startAngle: startValue, endAngle: startValue, innerRadius: 100, outerRadius: 105})
                    .attr('d', arc)
                    .attr('class', 'rc-dataarc')
                    .attr("fill", 'green')
                    .transition()
                    .delay(100)
                    .duration(duration)
                    .call(__tweenArc, endValue / outOf * twoPi, arc);

            // Show the value
            arcGroup.append('text')
                    .text(endValue)
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
        };

        /**
         * Creates an animation.
         *
         * @param b
         * @param arc The arc definition that will be used at every step of the animation.
         * @returns {Function}
         */
        __tweenArc = function (transition, newAngle, arc) {

            transition.attrTween('d', function (d) {
                var interpolate = d3.interpolate(d.endAngle, newAngle);

                return function (t) {
                    d.endAngle = interpolate(t);

                    return arc(d);
                };
            });
        };

        /**
         * Creates a radial chart.
         *
         * @param {string} chartType The type of radial chart that will be created. Possible values are "simple".
         * @param {Object} optionsObject An object containing the optiosn that will be used to build the chart.
         * @private
         */
        __create = function (chartType, optionsObject) {

            if (!chartType || __types.indexOf(chartType) === -1) {
                chartType = 'simple';
            }

            switch (chartType) {
                case 'simple':
                    __createSimple(optionsObject);
                    break;
            }
        };

        /* Expose the public API
         *************************************/
        return {
            create: __create
        };
    }());
}