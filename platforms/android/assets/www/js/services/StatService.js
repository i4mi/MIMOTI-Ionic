angular.module('app.services')

.service('StatService', function ($localStorage){

    function formatDate(dat, withTime) {
      datstr = (withTime === true) ? dat.getHours() + ':' + dat.getMinutes() + ' ' : '';
      return datstr + dat.getDate() + '.' + (dat.getMonth() + 1) + '.' + dat.getFullYear();
    }

    function statsToSeries(stats, type) {
      var statseries = [];
      angular.forEach(stats, function(s) {
        var stat = s[type];
        if (!stat.date || !stat.value) return;
        statseries.push({
          x: stat.date,
          y: parseInt(stat.value)
        });
      });
      return statseries;
    }

    return {

        getData: function(entries, stats) {

            var weightbydate = [], moodbydate = [];

            var sorted = entries.sort(function (a, b) {
              return b.date - a.date;
            }).reverse();

            for (var i = 0; i < sorted.length; i++) {
                var e = sorted[i];

                if (!isNaN(e.weight) && e.weight > 0) {
                  weightbydate.push({
                    x: e.date,
                    y: parseFloat(e.weight)
                  });
                }

                if (!isNaN(e.selfcheck) && e.selfcheck > 0) {
                  moodbydate.push({
                    x: e.date,
                    y: parseInt(e.selfcheck)
                  });
                }
            }

            stepseries = statsToSeries(stats, 'steps');

            return {
              Weight: weightbydate,
              Condition: moodbydate,
              Steps: stepseries
            };

        }
    };

});
