angular.module('app.directives', [])

.directive('dateLineGraph', function (){

		function customTimeFormat(date) {
			var dateformat = d3.time.format('%d.%m.%Y');
			return dateformat(new Date(date));
		}

		function customTicksFormat(val) {
			return (val == 1) ? ":-(" : (val == 2) ? ":-|" : (val == 3) ? ":-)" : "";
		}

    return{
        restrict: 'E',
        scope: {
            chartId: '@',
            data: '=',
            divClass: '@',
            duration: '@',
            guide: '@',
            height: '@',
            responsive: '@',
            width: '@',
            xlabel: '@',
            dateformat: '@',
            ylabel: '@',
            yformat: '@',
	    			moodgraph: '@'
        },
        link: function (scope, element, attrs){
            scope.$watch('data', function (data){
                if (data){
                    nv.addGraph(function () {
                        var chart = nv.models.lineChart()
                            .useInteractiveGuideline(scope.guide === 'true' ? true : false)
                            .margin({ right: 35 });

                        chart.xAxis
                            .axisLabel(scope.xlabel)
														.tickFormat(customTimeFormat);

                        chart.yAxis
                            .axisLabel(scope.ylabel)
                            .axisLabelDistance(42)
                            .tickFormat(
                               scope.moodgraph ? customTicksFormat :
                                 d3.format(scope.yformat)
                            );

                        d3.select('#' + scope.chartId +' svg').datum(scope.data)
														.attr('width', scope.width)
														.attr('height', scope.height)
                            .attr('perserveAspectRatio', 'xMinYMid')
                            .transition().duration(scope.duration === null ? 250 : scope.duration)
                            .call(chart);

                        nv.utils.windowResize(chart.update);
												chart.update();
                        return chart;
                    });
                }
            });
        },
        template: function (element, attrs){
            element.append('<div id="'+ attrs.chartId +'"><svg></svg></div>');
        }
    };
});
