angular.module('app.services')

.service('EntryService', function ($localStorage, MimotiValidation) {

  DEFAULT_SETTINGS = {
      notify: { active: true, time: '8:00' },
      midata: { server: 'test.midata.coop' }
  };

  $localStorage = $localStorage.$default({
    entries: [],
    dailystats: {},
    settings: DEFAULT_SETTINGS
  });

  function removeEntry(entry) {
    $localStorage.entries.splice(
      $localStorage.entries.indexOf(entry), 1
    );
  }

	return {

		all: function () {
			return $localStorage.entries;
		},
    allValid: function () {
			return $localStorage.entries.filter(function(e) { return !e.invalid; });
		},
		add: function (entries) {
			$localStorage.entries.push(entries);
		},
    update: function (entry) {
      existingEntry = null;
      angular.forEach($localStorage.entries, function(cachedEntry) {
        if (typeof cachedEntry.date.toISOString === 'undefined')
          cachedEntry.date = new Date(cachedEntry.date);
        if (cachedEntry.date.toISOString() === entry.date.toISOString()) {
          if (existingEntry !== null)
            console.warn('Duplicate datestamps', entry, cachedEntry);
          existingEntry = cachedEntry;
        }
      });
      if (existingEntry !== null) {
        for (var fld in existingEntry) {
          if (fld != 'records')
            entry[fld] = existingEntry[fld];
        }
        if (typeof entry.records === 'undefined') entry.records = [];
        angular.forEach(existingEntry.records, function(eerec) {
          var recfound = false;
          angular.forEach(entry.records, function(rec) {
            if (rec.content == eerec.content)
              recfound = true;
          });
          if (!recfound) entry.records.push(eerec);
        });
        removeEntry(existingEntry);
      }
      $localStorage.entries.push(entry);
      return entry;
    },

  	reset: function () {
      $localStorage.entries = [];
      $localStorage.dailystats = {};
    },
    logout: function() {
      $localStorage.$reset();
		},

    settings: function() {
      return $localStorage.settings;
    },
    saveSettings: function(settings) {
      $localStorage.settings = settings;
    },

    dailystats: function() {
      return $localStorage.dailystats;
    },
    saveStats: function(stat) {
      if (!stat.date || !stat.type || !stat.value) {
        console.warn("Invalid stat", stat); return false;
      }
      if (typeof $localStorage.dailystats === 'undefined')
        $localStorage.dailystats = {};
      if (typeof $localStorage.dailystats[stat.date] === 'undefined')
        $localStorage.dailystats[stat.date] = {};
      $localStorage.dailystats[stat.date][stat.type] = stat;
      return true;
    },

    blank: function() {
      d = new Date();
      d.setSeconds(0);
      d.setMilliseconds(0);
      var zeromins = ('0' + d.getMinutes()).slice(-2);
      var blankentry = {
        date: d,
        time: [d.getHours(), zeromins].join(':'),
        weight: null,
  	    selfcheck: 0,
        comment: '',
        invalid: false
    	};
      return blankentry;
    },

    // Obtain date of last available record
    getRecordSinceOrNull: function() {
      if (typeof $localStorage.entries === 'undefined')
        return null;
      // Return sorted by date
      cached = [];
      angular.forEach($localStorage.entries, function(entry) {
        angular.forEach(entry.records, function(rec) {
          if (typeof rec.created !== 'undefined')
            cached.push(rec.created);
        });
      });
      if (cached.length === 0) return null;
      if (cached.length === 1) return cached[0];
      cached.sort();
      return cached[cached.length-1];
    },

    // Validation of form fields fields
    validateAndSave: function (entry) {

      // No data entered
      null_weig = (entry.weight === null || isNaN(entry.weight));
      null_self = (isNaN(entry.selfcheck) || entry.selfcheck < 1);
      null_comm = (entry.comment.trim().length === 0);
      if (null_weig && null_self && null_comm)
        return MimotiValidation.ENTRY_EMPTY;

      // Check weight format
      if (!null_weig && (
        entry.weight < MimotiValidation.WEIGHT_MIN ||
        entry.weight > MimotiValidation.WEIGHT_MAX))
        return MimotiValidation.WEIGHT_FORMAT;

      // Check date is in the past
      if (entry.date > new Date())
        return MimotiValidation.DATE_FUTURE;

      // Conflicts with existing records if there's less than 1 minute difference
      var hasconflict = false;
      angular.forEach($localStorage.entries, function(e) {
        if (Math.abs(e.date - entry.date) <= 60000)
          hasconflict = true;
      });
      if (hasconflict) return MimotiValidation.DATE_DUPLICATE;

      // Persist the entry
      $localStorage.entries.push(entry);
      return true;
		}

  };
});
