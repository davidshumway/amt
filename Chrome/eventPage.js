chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if(request.audio) {
		
		// Remove previous?
		var x = document.getElementsByTagName('audio');
		for (var i in x) {
			if (i == 'length') break;
			x[i].parentNode.removeChild(x[i]);
		}
		
		// Add new
		var x = document.createElement('audio');
		x.src = request.file; // Ex: 'audio/156090__marcolo91__bell-in-catalunya-square-barcelona.ogg';
		document.body.appendChild(x);
		x.play();
		
	}
	//~ if(request.stopAcceptingNextJobs) {
		//~ console.log('got stopAcceptingNextJobs');
		//~ chrome.tabs.query({}, function(allTabs) {
			//~ console.log(allTabs);
			//~ if(!allTabs.length)
				//~ allTabs = [allTabs];
			//~ for(var i = 0; i < allTabs.length; i++) {
				//~ chrome.tabs.sendRequest(allTabs[i].id, {doNotAcceptNextTab:true}, function(rs) {
					//~ //Squelch response
				//~ });
			//~ }
		//~ });
	//~ }
});
