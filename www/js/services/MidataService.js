angular.module('app.services')

.service('MidataService', function ($http, $ionicPopup,
  EntryService, MidataFormats, MimotiMessages){

  session = null;

  function getServerInfo() {
    var isPROD = true;
    return {
      url: isPROD ? 'ch.midata.coop' : 'demo.midata.coop',
      app: 'MIMOTI',
      key: 'MIMOTImimoti'
    };
  }
  function getCode(record) {
    if (typeof record === 'string') return record;
    if (typeof record.data !== 'undefined') { record = record.data; }
    if (typeof record.code === 'undefined') return null;
    if (typeof record.code.coding !== 'object') return null;
    if (typeof record.code.coding[0] === 'undefined') return null;
    if (typeof record.code.coding[0].code === 'undefined') return null;
    if (typeof record.code.coding[0].system === 'undefined') return null;
    return record.code.coding[0].system + ' ' + record.code.coding[0].code;
  }
  function checkFormat(format, record) {
    return getCode(format) == getCode(record);
  }

  postRecords = function(entry, index) {
    rec = entry.records[index];
    return $http({
      method: 'POST', url: 'https://' + session.serverIp + ':9000/v1/records/create',
      data: {
        authToken:    session.authToken,
        name:         rec.name,
        description:  rec.description,
        format:       rec.format,
        code:         getCode(rec),
        data:         JSON.stringify(rec.data)
      }
    }).then(function successCallback(response) {
      if (typeof response.status === 'undefined' || response.status != 200) {
        if (typeof response.data === 'undefined') return 'Connection error!';
        // console.log(response);
        return response.data;
      } else {
        // Save the id and version
        rec._id = response.data._id;
        rec.created = response.data.created;
        rec.version = '0';
        entry.records[index] = rec;
        EntryService.update(entry);
        // Next
        if (index < entry.records.length - 1) {
          return postRecords(entry, index + 1);
        } else {
          return true;
        }
      }
    }, function errorCallback(response) {
      console.warn(response);
      if (typeof response === 'object' && typeof response.data === 'string') {
        return response.data;
      } else {
        return 'Could not connect!';
      }
    });
  };

  invalidateRecords = function(records, index) {
    rec = records[index];
    // console.log('Invalidating record', records, index);
    if (typeof rec._id === 'undefined' || typeof rec.version === 'undefined') {
      console.error('Cannot invalidate: missing ID or version', rec);
      return;
    }
    rec.data.status = 'entered-in-error';
    return $http({
      method: 'POST', url: 'https://' + session.serverIp + ':9000/v1/records/update',
      data: {
        authToken:    session.authToken,
        '_id':        rec._id,
        'version':    rec.version,
        data:         JSON.stringify(rec.data)
      }
    }).then(function successCallback(response) {
      if (typeof response.status === 'undefined' || response.status != 200) {
        if (typeof response.data === 'undefined') return 'Connection error!';
        console.warn(response);
        return response.data;
      } else {
        // Next
        if (index < records.length - 1) {
          return invalidateRecords(records, index + 1);
        } else {
          return true;
        }
      }
    }, function errorCallback(response) {
      console.warn(response);
      return 'Could not connect!';
    });
  };

  // trim() polyfill for older Android
  if (!String.prototype.trim) {
    (function() {
      var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
      String.prototype.trim = function() {
          return this.replace(rtrim, '');
      };
    })();
  }

  // Format date according to spec 2016-05-03T20:34:01 local time
  function formatDateStamp(date) {
    var d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('.')[0];
  }

  // Validate and format entry records
  formatEntryRecords = function(entry) {
    entry.records = [];
    entrydatestamp = formatDateStamp(entry.date);

    // Create weight record
    record = MidataFormats.Weight;
    record.data.effectiveDateTime = entrydatestamp;
    record.data.valueQuantity.value = entry.weight;
    if (!isNaN(entry.weight) && entry.weight > 0)
      entry.records.push(record);

    // Create comment record
    record = MidataFormats.Narrative;
    record.data.effectiveDateTime = entrydatestamp;
    record.data.valueString = entry.comment;
    if (entry.comment.trim().length > 0)
      entry.records.push(record);

    // Create condition record
    record = MidataFormats.Condition;
    record.data.effectiveDateTime = entrydatestamp;
    record.data.valueQuantity.value = entry.selfcheck;
    if (!isNaN(entry.selfcheck) && entry.selfcheck > 0)
      entry.records.push(record);

    return entry;
  };

  entryFromRecord = function(rec) {
    entry = {};
    if (checkFormat(MidataFormats.Weight, rec)) {
      entry.weight = parseFloat(rec.data.valueQuantity.value);
    } else if (checkFormat(MidataFormats.Condition, rec)) {
      entry.selfcheck = parseInt(rec.data.valueQuantity.value);
    } else if (checkFormat(MidataFormats.Narrative, rec)) {
      entry.comment = rec.data.valueString;
    } else {
      console.warn('Unknown record type', rec);
      return null;
    }
    var refdate = rec.data.effectiveDateTime;
    // Adjust to default local (not UTC) time zone
    if (refdate.indexOf('Z')<0) refdate += '+02:00';
    entry.date = new Date(refdate);
    return entry;
  };

  statFromRecord = function(rec) {
    stat = {};
    if (getCode(rec).indexOf("activities/steps")>=0) {
      stat.type = "steps";
      stat.value = parseInt(rec.data.valueQuantity.value);
      stat.date = new Date(rec.data.effectiveDateTime);
    } else {
      return null;
    }
    return stat;
  };

  return {

    login: function() {
      // serverip = EntryService.settings().midata.server;
      serverip = getServerInfo().url;
      usermail = EntryService.settings().midata.usermail;
      userpass = EntryService.settings().midata.password;

      if (typeof usermail === 'undefined' || usermail === '' || usermail === null) {
        return('Missing usermail');
      }
      serverurl = 'https://' + serverip + ':9000/v1/auth';
      console.info('Connecting', usermail, serverurl);

      return $http({
        method: 'POST', url: serverurl,
        data: {
          appname:  getServerInfo().app,
          secret:   getServerInfo().key,
          username: usermail,
          password: userpass
        }
      }).then(function successCallback(response) {
        if (typeof response.status === 'undefined' || response.status != 200) {
          session = null;
          console.warn('Connection failed', response.data);
          return('Connection error!');
        } else {
          // console.log('Connection established', response);
          session = response.data;
          session.serverIp = serverip;
          return true;
        }
      }, function errorCallback(response) {
        session = null;
        if (typeof response.data === 'undefined') {
          console.warn('Error logging in, no response');
          return('Could not connect!');
        } else if (response.data === null) {
          console.warn('No connection');
          $ionicPopup.alert({
            title: MimotiMessages.Connection.NO_CONN
          });
          return null;
        } else {
          console.warn('Error logging in', response.data);
          return(response.data);
        }
      });
    },

    connected: function() {
      return (session !== null);
    },

    upload: function(entry) {
      if (!entry.records) formatEntryRecords(entry);
      return postRecords(entry, 0);
    },

    invalidate: function(records) {
      invalidateRecords(records, 0).then(function(result) {
        if (result !== true)
          $ionicPopup.alert({
            title: MimotiMessages.Entries.UPDATE_ERROR,
            template: result
          });
      });
    },

    download: function(recordformat, since) {
      if (session === null) {
        console.warn('No session, aborting download');
        return false;
      }
      params = {
        authToken: session.authToken,
        fields: ['format', 'content', 'code', 'created', 'name', 'description', 'version', 'data'],
        properties: {
          owner: "self",
          format: "fhir/Observation",
          data: { "status": "preliminary" },
          index: { "effectiveDateTime": { "$ge": "2016-04-01" }}
        }
      };
      if (typeof recordformat === 'string')
        params.properties.code = recordformat;
      if (typeof recordformat === 'object')
        params.properties.code = getCode(recordformat);
      if (since)
        params.properties['created-after'] = since + 1;

      // Limit records for app performance
      // params.properties.limit = 100;

      // Start request call
      return $http({
        method: 'POST',
        url: 'https://' + session.serverIp + ':9000/v1/records/search',
        data: params
      }).then(function successCallback(response) {
        if (typeof response.status === 'undefined' || response.status != 200) {
          // console.log(response);
          $ionicPopup.alert({
            title: MimotiMessages.Connection.SERV_ERROR,
            template: response.data
          });
          return false;
        } else {
          // Get existing records
          remoterecords = response.data;
          angular.forEach(remoterecords, function(rec) {
            // Create entry for record
            entry = entryFromRecord(rec);
            if (entry !== null) {
              // Invalidate records
              entry.invalid = (rec.data.status === 'entered-in-error');
              // Save records to local cache
              if (typeof entry.records === 'undefined') entry.records = [];
              entry.records.push(rec);
              // console.log('Loading entry', entry);
              EntryService.update(entry);
              return;
            }
            stat = statFromRecord(rec);
            if (stat !== null) {
              EntryService.saveStats(stat);
            }
          });
          return true;
        }
      }, function errorCallback(response) {
        // console.log(response);
        $ionicPopup.alert({
          title: MimotiMessages.Connection.ERROR,
          template: response.data
        });
        return false;
      });
    }

  };

});
