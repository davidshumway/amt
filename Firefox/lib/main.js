// Import the page-mod API
var pageMod = require("sdk/page-mod");
// Import the self API
var self = require("sdk/self");
// Request object
var Request = require("sdk/request").Request;

// Create a page mod
pageMod.PageMod({
	  include: [
		"https://www.mturk.com/mturk/preview?*",
		"https://www.mturk.com/mturk/previewandaccept?*",
		"https://www.mturk.com/mturk/continue?*",
		"https://www.mturk.com/mturk/accept?*",
		"https://www.mturk.com/mturk/submit",
		"https://www.mturk.com/mturk/return*",
		
		"https://workersandbox.mturk.com/mturk/preview?*",
		"https://workersandbox.mturk.com/mturk/previewandaccept?*",
		"https://workersandbox.mturk.com/mturk/continue?*",
		"https://workersandbox.mturk.com/mturk/accept?*",
		"https://workersandbox.mturk.com/mturk/submit",
		"https://workersandbox.mturk.com/mturk/return*"
	  ],
	  contentScriptFile: self.data.url("script.js"),
	  onAttach: function(worker) {
	
		// xhr_returnaccept
		//
		worker.port.on('xhr_returnaccept', function(url) {
			var req = Request({
				url: url,
				onComplete: function (response) {
					worker.port.emit('xhr_returnaccept', ''); // notifies
				}
			});
			req.get();
		});
	
		// Audio
		//
		worker.port.on('audio', function(file) {
				var {Cc, Ci} = require("chrome");
				var sound = Cc["@mozilla.org/sound;1"].createInstance(Ci.nsISound);
				var ioSvc = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
				var path = ioSvc.newURI(self.data.url(file), null, null);
				sound.play(path);
		});
	}
});



 

