angular.module('app.constants', [])

.constant('MimotiMessages', {

	Contact: {
		phone: '031 632 54 06',
		email: 'bauchzentrum@insel.ch',
		info: 'Zusammenarbeit zwischen der Medizininformatik der Berner Fachhochschule, dem Bauchzentrum des Inselspitals Bern und der MIDATA.coop Genossenschaft.'
	},
	Notification: {
		title: 'MIMOTI',
		text: 'Es ist Zeit für einen neuen Eintrag.'
	},
	Entries: {
		CONFIRM_DELETE: 'Eintrag wirklich löschen?',
		UPDATE_ERROR: 'Fehler beim aktualisieren.',
		DOWNLOADING: 'Daten werden geladen...',
		UPLOADING: 'Daten werden gespeichert...'
	},
	Connection: {
		ERROR: 'Verbindungsfehler',
		SERV_ERROR: 'Servicefehler',
		NO_CONN: 'Keine Internetverbindung',
		NO_CONN_TEXT: 'Es konnte keine Internetverbindung zum MIDATA Server hergestellt werden oder Ihre bestehende Verbindung zum Server wurde unterbrochen. Sobald die Verbindung wieder verfügbar ist, werden Sie automatisch auf den Startbildschirm weitergeleitet. Sollte das Problem bestehen bleiben, melden Sie sich bitte beim MIMOTI-Team unter 031 632 54 06 oder bauchzentrum@insel.ch',
		LOGIN_ERROR: 'Login fehlgeschlagen',
		LOGIN_TRY: 'Ihr Benutzername oder ihr Passwort ist falsch. Bitte versuchen Sie es erneut.'
	},
	Settings: {
		CONFIRM_LOGOUT: 'Sofort abmelden?',
		SAVE_CONFIRM: 'Eingabe übernommen',
		SAVE_NOTIFY: 'Ihr gewünschter Erinnerungszeitpunkt wurde gesetzt.'
	}
})

.constant('MimotiValidation', {

	WEIGHT_MIN: 10, WEIGHT_MAX: 999,
	WEIGHT_FORMAT: {
		title:    'Falsches Zahlenformat',
		template: 'Bitte geben Sie eine gültige Zahl ein. Bsp. 95 oder 95.3'
	},
	DATE_DUPLICATE: {
		title:    'Eintrag bereits vorhanden',
		template: 'Unter dieser Datumsangabe existiert bereits ein Eintrag. Bitte wählen Sie ein anderes Datum und Zeit.'
	},
	DATE_FUTURE: {
		title:    'Fehler beim Ausfüllen',
		template: 'Bitte wählen Sie einen Datum und Zeit in der Vergangeheit.'
	},
	ENTRY_EMPTY: {
		title:    'Fehler beim Ausfüllen',
		template: 'Bitte erfassen Sie mindestens einen Wert.'
	}
})

.constant('MidataFormats', {

	_Steps: 'http://midata.coop activities/steps',

	Weight: {
	  name: "Gewicht",
	  format: "fhir/Observation",
		subformat: "Quantity",
		content: "http://loinc.org 3141-9",
	  data: {
	    resourceType: "Observation",
	    status: "preliminary",
	    category: {
	      coding: [{
					system: "http://hl7.org/fhir/observation-category",
					code: "vital-signs",
	      	display: "Vital Signs"
				}]
	    },
	    code: {
	      coding: [{
	        system: "http://loinc.org",
	        code: "3141-9",
	        display: "Body weight Measured"
	      }]
	    },
	    effectiveDateTime: null, // %YYYY-MM- DDThh:mm:ss%
	    valueQuantity: {
				value: null,
				unit: "kg",
				system: "http://unitsofmeasure.org",
				code: "kg"
			}
	 }
	},

	Condition: {
		name: "Subjektives Befinden",
		format: "fhir/Observation",
		subformat: "Quantity",
		content: "http://midata.coop subjective-condition",
		data: {
			resourceType: "Observation",
			status: "preliminary",
			category: {
	      coding: [{
					system: "http://hl7.org/fhir/observation-category",
					code: "survey",
	      	display: "Survey"
				}]
			},
			code: {
				coding: [
					{
						system: "http://midata.coop",
						code: "subjective-condition",
						display: "Subjective Condition"
					}
				]
			},
			effectiveDateTime: null, // %YYYY-MM- DDThh:mm:ss%
			valueQuantity: {
				value: null // {1,0,-1}
			}
		}
	},

	Narrative: {
		name: "Tagebuchkommentar",
		format: "fhir/Observation",
		subformat: "String",
		content: "http://loinc.org 61150-9",
		data: {
			resourceType: "Observation",
			status: "preliminary",
			category: {
	      coding: [{
					system: "http://hl7.org/fhir/observation-category",
					code: "survey",
	      	display: "Survey"
				}]
			},
			code: {
				coding: [
					{
						system: "http://loinc.org",
						code: "61150-9",
						display: "Subjective Narrative"
					}
				]
			},
			effectiveDateTime: null, // %YYYY-MM- DDThh:mm:ss%
			valueString: null // %TAGEBUCHKOMMENTAR%
		}
	}
});
