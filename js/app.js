$(document).ready(function() {
	var $sigdiv = $("#signature").jSignature({
		'UndoButton' : true
	});
	//var transitions = [ 'pop', 'slide', 'fade', 'flip', 'flow', 'turn', 'slidefade', 'slide', 'slideup', 'slidedown' ];
	var transition = 'slidefade';

	$('a').each(function() {
		// Set the default page transitions
		//transition = transitions[Math.floor(Math.random()*10)]
		$(this).attr('data-transition', transition);
	});

	// Microphone buttons...
	$("#record").button();
	$("#stop").button();
	$("#pause").button();
	$("#play").button();

	$("#stop").button("disable");
	$("#pause").button("disable");
	$("#play").button("disable");

	$("#record").bind("click", app.record);
	$("#pause").bind("click", app.pause);
	$("#stop").bind("click", app.stop);
	$("#play").bind("click", app.play);
});

var app = {
	mic : null,
	isPaused : false,
	deviceType : 'Browser',
	filePath : '/',
	fileName : 'chief_complaint.wav',

	init : function() {
		//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
		// Core device detection functions
		//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
		var userAgent = navigator.userAgent.toLowerCase();
		if (userAgent.indexOf('webkit') >= 0) {
			if (userAgent.indexOf('blackberry') >= 0) {
				app.deviceType = (window.tinyHippos) ? 'RippleBlackberry' : 'Blackberry';
			} else if (userAgent.indexOf('playbook') >= 0) {
				app.deviceType = (window.tinyHippos) ? 'RipplePlaybook' : 'Playbook';
			}
		}
		console.log('Device: ' + app.deviceType);

		// Set up Microphone ONLY if Playbook!
		if (app.deviceType === 'Playbook') {
			console.log('Playbook detected!');
			app.mic = blackberry.media.microphone;
			app.filePath = blackberry.io.dir.appDirs.shared.music.path;
		}
		// Send to desired home page once page is loaded
		window.setTimeout(app.homePage, 200);
	},

	homePage : function() {
		$.mobile.changePage($("#patient"), 'none');
		window.setTimeout(function() {
			$('#myPage').css('visibility', 'visible')
		}, 300);
	},

	record : function(myFilename) {
		try {
			//if (myFilename) {
			//	app.fileName = myFilename;
			//}
			console.log('Recording: ' + app.filePath + '/' + app.fileName);
			if (app.deviceType === 'Playbook') {
				var myFilename = app.filePath + '/' + app.fileName;
				try {
					if (blackberry.io.file.exists(myFilename)) {
						blackberry.io.file.deleteFile(myFilename);
						//, app.filePath+'/old_'+app.fileName);
					}
				} catch (e) {
					console.log('Deleting old, e:' + e.message);
				}
				app.mic.record(myFilename, app.testSuccess, app.testError);
			}
			$("#record").button("disable");
			$("#play").button("disable");
			$("#pause").button("enable");
			$("#stop").button("enable");
			console.log('Recording started successfully');
		} catch (e) {
			console.log('Record, e:' + e.message);
		}
	},

	pause : function() {
		app.isPaused = !app.isPaused;

		if (app.isPaused) {
			console.log('Resuming...');
			$('#pause').text('Resume');
		} else {
			console.log('Pausing...');
			$('#pause').text('Pause');
		}
		$('#pause').button('refresh');
		try {
			if (app.deviceType === 'Playbook') {
				app.mic.pause();
			}
		} catch (e) {
			console.log('Pause, e:' + e.message);
		}
	},
	play : function() {
		try {
			console.log('Playing...');
			if (app.deviceType === 'Playbook') {
				blackberry.io.file.open( app.filePath + '/' + app.fileName );
			}
		} catch (e) {
			console.log('Play, e:' + e.message);
		}
	},
	stop : function() {
		try {
			console.log('Stopping...');
			if (app.deviceType === 'Playbook') {
				app.mic.stop();
			}
			$("#play").button("enable");
			$("#record").button("enable");
			$("#pause").button("disable");
			$("#stop").button("disable");
		} catch (e) {
			console.log('Stop, e:' + e.message);
		}
	},

	testSuccess : function(filePath) {
		console.log("Recorded successfully! File: " + app.filePath);
	},

	testError : function(errorCode, errorMessage) {
		if (errorMessage == "Unsupported record encoding type") {
			console.log("try recording an .amr audio file");
			return;
		}
		console.log('error code:' + errorCode + ' error message:' + errorMessage);
	}
}