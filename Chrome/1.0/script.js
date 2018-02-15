/**
 * Copyright David Shumway 2013-2017 and FLBS.
 * License: GPLv3.
 * Contact: david.shumway@gmail.com, david@flbs.biz
 * 
 */
// Firefox UID: {1a88e21f-76fc-450c-826b-8e62fd58ba0d}
// "jid1-H7gMT3B90X9OHw"
/**
 * GM functions
 * 
 */
if (!this.GM_getValue || (this.GM_getValue.toString && this.GM_getValue.toString().indexOf("not supported")>-1)) {
    this.GM_getValue=function (key,def) {
        return localStorage[key] || def;
    };
    this.GM_setValue=function (key,value) {
        return localStorage[key]=value;
    };
    this.GM_deleteValue=function (name) {
		localStorage.removeItem(name);
	}
}
function GM_addStyle(css) {
	var style = document.createElement('style');
	style.textContent = css;
	document.getElementsByTagName('head')[0].appendChild(style);
}

/**
 * Global variables
 * 
 */

var SCRIPT_NAME = 'e3DbjxI0oLqiV6emR9bnWz2pXdibP5usIne0MlOc7mD';

var OBJECT_MT_TOOLS_LOCAL_STORAGE;

var audio_snippets;

// is_mozilla
var is_mozilla = false;

// This is the tools div.
var tools;

// For blink
var INTV_blink__sr_status = true;

// Global vars object.
var globals = {
	original_title: null, // This is what the title is before changing to "CAPTCHA" (if CAPTCHA notification is turned on).
	c_phrase: 'In order to accept your next HIT, please type this word into the text box below', // Shows on pages where there is a CAPTCHA
	elements: {
		// globals.elements.chkbox_auto_accept
		chkbox_auto_accept: document.querySelector('span.m-l-xs.detail-bar-value')
	}
}
// Set checkbox
if (globals.elements.chkbox_auto_accept && 
	globals.elements.chkbox_auto_accept.innerText == 'Auto-accept next HIT') {
	globals.elements.chkbox_auto_accept =
		globals.elements.chkbox_auto_accept.parentNode.querySelector('input');
	if (!globals.elements.chkbox_auto_accept ||
		globals.elements.chkbox_auto_accept.type != 'checkbox') {
		globals.elements.chkbox_auto_accept = null
	}
}

/**
 * OBJECT_MT_TOOLS_LOCAL_STORAGE
 * 
 */
if (GM_getValue('OBJECT_MT_TOOLS_LOCAL_STORAGE'+SCRIPT_NAME) != null) {
	
	OBJECT_MT_TOOLS_LOCAL_STORAGE = GM_getValue('OBJECT_MT_TOOLS_LOCAL_STORAGE'+SCRIPT_NAME);
	OBJECT_MT_TOOLS_LOCAL_STORAGE = JSON.parse(OBJECT_MT_TOOLS_LOCAL_STORAGE);
	
	/**
	 * Remove old localStorage embedded audio
	 * The key is OBJECT_MT_TOOLS_LOCAL_STORAGE.CAPTCHA_USING_HI_DEF.
	 * This is audio from prior to 1.0.7, 12 Sep 2014.
	 */
	if (OBJECT_MT_TOOLS_LOCAL_STORAGE.hasOwnProperty('CAPTCHA_USING_HI_DEF'))
		delete OBJECT_MT_TOOLS_LOCAL_STORAGE.CAPTCHA_USING_HI_DEF;
	
	// Sanitize settings
	OBJECT_MT_TOOLS_LOCAL_STORAGE = sanitize(OBJECT_MT_TOOLS_LOCAL_STORAGE);
	
} else {
	
	initial_tool_settings();
	
}

/**
 * function initial_tool_settings
 * 
 * Change to some settings enabled by default. Previously these were all disabled by default.
 * 
 * Hi Def local storage is set later in the script
 * Relevant code is:
 * 		GM_setValue('OBJECT_MT_TOOLS_LOCAL_STORAGE_HI_DEF_AUDIO' + SCRIPT_NAME, '');
 */
function initial_tool_settings() {
	
	OBJECT_MT_TOOLS_LOCAL_STORAGE = {
		
		'IS_ACTIVE_IFRAME_HEIGHT': false,
		
		'IS_ACTIVE_IFRAME_WIDTH': false,
		
		'IS_ACTIVE_IFRAME_OFFSET': false,
		
		'IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT': false,
		
		'IS_ACTIVE_CAPTCHA_INPUT_FOCUS': false,
		
		'IS_ACTIVE_CAPTCHA_DISPLAY_ALERT': false,
		
		'IS_ACTIVE_CAPTCHA_AUDIO_ALERT': false,
		
		'IS_ACTIVE_RETURN_AND_ACCEPT': false,
		
		'IFRAME_HEIGHT': 6000,
		
		'IFRAME_OFFSET_TOP': 30,
		
		'IFRAME_ENABLE_FULL_SCREEN': true,
		
		'CAPTCHA_AUDIO_SNIPPET': 0,
		
		'CAPTCHA_IS_PRESENT': false,
		
		'DATE_CAPTCHA_AUDIO_PLAYED': 0
		
		// Remove this.
		// 12 Sep 2014
		//'CAPTCHA_USING_HI_DEF': false
	};
	
	/**
	 * Save local storage
	 */
	// Write settings to the browser's cache!
	GM_setValue(
		'OBJECT_MT_TOOLS_LOCAL_STORAGE'+SCRIPT_NAME,
		JSON.stringify(OBJECT_MT_TOOLS_LOCAL_STORAGE)
	);
}

/**
 * Function blink__sr_status
 */
function blink__sr_status(reset) {
	var b = document.getElementById(SCRIPT_NAME+'menu_status');
	
	// If !b then exit, such as when menu is closed
	// just after saving settings.
	if (!b) return;
	
	if (reset) {
		b.className = 'blink__st_status';
		b.style.opacity = 1.6; // Above 1. 1.0 is max, so it stays and then removes.
		blink__sr_status();
		return;
	} else if (b.className == '') {
		return;
	} else if (b.className == 'blink__st_status') {
		x = b.style.opacity;
		x = x*1;
		x -= 0.06;
		if (x <= 0) x = 0;
		b.style.opacity = x;

		if (x > 0) {// && !INTV_blink__sr_status
			clearTimeout(INTV_blink__sr_status);
			INTV_blink__sr_status = window.setTimeout(function() { blink__sr_status(); }, 200); // window.setTimeout // Aug. 18, 2013
		} else {
			b.className = '';
			return;
		}
	}
}
 
/**
 * Function create element
 */
function el(obj_el) {
	var x;
	var i;
	x = document.createElement(obj_el.create);
	for (i in obj_el) {
		if (i == 'create')
			continue;
		else if (i == 'innerHTML')
			x.innerHTML = obj_el[i];
		else if (i == 'innerText')
			x.innerText = obj_el[i];
		else
			x.setAttribute(i, obj_el[i]);
	}
	return x;
}
 
/**
 * Function fill audio info
 */
function fill_audio_info(container_div,selected) {
	var u;
	var x;
	var y;
	u = 'Selected audio: ';
	x = selected;
	if (x == 'Random')
		u += 'Random';
	container_div.appendChild(document.createTextNode(u));
	if (x != 'Random') {
		u = el({
				'create':'a',
				'href':audio_snippets[x].source,
				'target':'_blank'
		});
		u.appendChild(document.createTextNode(audio_snippets[x].otitle));
		container_div.appendChild(u);
	}
}
 
/**
 * Function play_audio
 * Play
 * 		number = snippet number
 * 		random = ...
 */
function play_audio(number) {
	
	// 
	var x;
	var div_istest;
	x = number;
	
	if (x == 'Random')
		x = Math.floor(Math.random()*7); //0..6
	
	var file = audio_snippets_data(false, x*1);
	
	/**
	 * Chrome
	 */
	if (!is_mozilla) {
		chrome.extension.sendRequest(
			{
				audio: true,
				file: file // This is the file name
			}, function(rs) {/**Squelch response**/}
		);
	}
	/**
	 * Firefox
	 */
	else {
		try{
			self.port.emit('audio', file.replace('audio/', ''));
		} catch(e) {
			// Ignore
		}
	}
}
 
/**
 * Function sanitize settings object
 */
function sanitize(obj) {
	if (!obj.hasOwnProperty('IS_ACTIVE_IFRAME_HEIGHT')) {
		obj.IS_ACTIVE_IFRAME_HEIGHT = true;
	}
	if (!obj.hasOwnProperty('IS_ACTIVE_IFRAME_WIDTH')) {
		obj.IS_ACTIVE_IFRAME_WIDTH = true;
	}
	if (!obj.hasOwnProperty('IS_ACTIVE_IFRAME_OFFSET')) {
		obj.IS_ACTIVE_IFRAME_OFFSET = true;
	}
	if (!obj.hasOwnProperty('IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT')) {
		obj.IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT = true;
	}
	if (!obj.hasOwnProperty('IS_ACTIVE_CAPTCHA_INPUT_FOCUS')) {
		obj.IS_ACTIVE_CAPTCHA_INPUT_FOCUS = true;
	}
	if (!obj.hasOwnProperty('IS_ACTIVE_CAPTCHA_DISPLAY_ALERT')) {
		obj.IS_ACTIVE_CAPTCHA_DISPLAY_ALERT = true;
	}
	if (!obj.hasOwnProperty('IS_ACTIVE_CAPTCHA_AUDIO_ALERT')) {
		obj.IS_ACTIVE_CAPTCHA_AUDIO_ALERT = true;
	}
	if (!obj.hasOwnProperty('IS_ACTIVE_RETURN_AND_ACCEPT')) {
		obj.IS_ACTIVE_RETURN_AND_ACCEPT = true;
	}
	if (!obj.hasOwnProperty('IFRAME_HEIGHT')) {
		obj.IFRAME_HEIGHT = 6000;
	}
	if (!obj.hasOwnProperty('IFRAME_OFFSET_TOP')) {
		obj.IFRAME_OFFSET_TOP = 30;
	}
	if (!obj.hasOwnProperty('IFRAME_ENABLE_FULL_SCREEN')) {
		obj.IFRAME_ENABLE_FULL_SCREEN = true;
	}
	if (!obj.hasOwnProperty('CAPTCHA_AUDIO_SNIPPET')) {
		obj.CAPTCHA_AUDIO_SNIPPET = 'Random';
	}
	if (!obj.hasOwnProperty('CAPTCHA_IS_PRESENT')) {
		obj.CAPTCHA_IS_PRESENT = false;
	}
	if (!obj.hasOwnProperty('DATE_CAPTCHA_AUDIO_PLAYED')) {
		console.log('reset DATE_CAPTCHA_AUDIO_PLAYED');
		obj.DATE_CAPTCHA_AUDIO_PLAYED = 0;
	}
	if  (
		obj.CAPTCHA_AUDIO_SNIPPET == '' ||
		!/^[0-6]$/.exec(obj.CAPTCHA_AUDIO_SNIPPET)
		)
		obj.CAPTCHA_AUDIO_SNIPPET = 'Random';
	return obj;
}
/**
 * function enterKeyEventListener
 * If key == 13 then save the form and hide/exit the menu.
 */
function enterKeyEventListener(element) {
	element.addEventListener('keypress', function(e) {
		var k = e.keyCode;
		if (k == 13) {
			updateSettings();	// update
			hideMenu();			// hide
		}
	});
}
/**
 * function stopAcceptingJobs_run
 */
function stopAcceptingJobs_run() {
	var autoAcceptTB = document.getElementsByName('autoAcceptEnabled');
	if(autoAcceptTB && autoAcceptTB.length) {
		autoAcceptTB = autoAcceptTB[0];
		if(autoAcceptTB.checked) {
			autoAcceptTB.checked = false;
		}
	}
	hideMenu();
}
/**
 * Function hideMenu
 * 
 */
function hideMenu() {
	var u;
	
	u = document.getElementById(SCRIPT_NAME+'menu_div');
	if (u)
		document.body.removeChild(u);
	
	u = document.getElementById(SCRIPT_NAME+'menu_div_dim');
	if (u)
		document.body.removeChild(u);
	
	u = document.getElementById(SCRIPT_NAME+'caa_test'); // audio tester
	if (u)
		document.body.removeChild(u);
	
	u = document.getElementById(SCRIPT_NAME+'btn_show_menu');
	if (u)
		u.style.display = 'inline';
}

function generate_container_basic(theMenu) {
	// info image
	// size of original image is 20x20
	var img_info64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAA3XAAAN1wFCKJt4AAAAB3RJTUUH3QgNExsG/ltFywAAA2BJREFUOMuV1MtvG0UcB/Dv7qw3rV+JncSWDaVJ7TxKGtuVoZAWtaUgHofSWpQ4cENphJT8OVS5NBEHJEDgSpBgVYhjKY8k8iG0ipLm2bgmlhXFa6937X3McHBrJyF2y0ijOczMR9+RfvPj8JzhHZt8d6jvxFcC4ci9B1tfZKcnZpudJ802PaOT12+8NTDzwYVIW9cJn8NjF0c23K+tlVLJxf8NekYnr392JZyInukjadlArmSg3d3GBdqtsTVXtCFKGmGfXgklQv09ZFs2UKqYkDUDWVmD1W7jTnvtsUZJyVHYyNuhxEBfD3lc0CFrJuSKUZ2aiUxRQ8txKxfxO2Ob7a//ByWHseHLg4n+3h6yWdAhP00WdLVg+EwHftvII1cqYykro0xE7kKXK7bdee4AWgO9N29d++Ry6E5vMEg2JR2yZqCkVZMRDuiwWvD93ztY31VQrOjISGVAFLmLgfZYuvONGkqeYR9fDN8JBgJkQ9Jrz5MrJmwWDgIPrO8quL+5B5OaYJSCMRPZYhnMYuEuBTpiaU8V5byjt965cSly9+SpbsuGpEPVDCi6CaViQNENnGxtwUf9bkR8dkS//AO6YYKxZygFoyYGvXZEWnnzp9+XYsL5ge5vuk91W5b3NCiaAUUzn64GVM3AL9kiRJ4i6nfUktUxCjCKxUweVsFFzgZ9XwsEEIqaCUnVq8n2YZKqoVTRQCkF4bkaUsfquFrR4BCIwN9b2vo8vb5m+mw8CqqOQllDQdUgqRokVQdjFBwYCA8wah6JRf1OvOoU2NxyeozP3h6fmflr6WrxyZbe5RRQUHVIZR2SqsOkBhitgsK+hIexfjuhP8+vDGenJr7lASB3e/zu7PzyNexmjF6XCLlcxxijsIsEhOPgPi4cic3Or8RzUxOJA3WopJKrGf+bCwMdx+Jul4PfzpfBGMXV052Ih32gjGHQ58TDf/LYLZXr2Nyjkdx0FQMA7vDX6xyb/PC9s8GZHLEL97fyYMwE9pXIgWRzj0Zy0+M/NP3LSiq5uuMfWgh57HFXm43f3lNeGGvYbZRUcnXnpaGFsNcRd7fa+Md7pRfCmvbDKnp+4dzLrrjNdoz32ESE20T6458rDbHndmwllVx94ht68IpDfN8BQ/91cfNmbmr8u2Z3/gVFGDS1XwxhOQAAAABJRU5ErkJggg==';
	/**
	 * Enable full screen mode
	 * 
	 * // toggle https://stackoverflow.com/questions/309081/how-do-you-create-a-toggle-button
	 */
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m1'
	});
	u2 = el({
		'create':'input',
		'type':'checkbox',
		'id':SCRIPT_NAME+'IFRAME_ENABLE_FULL_SCREEN'
	});
	u.appendChild(u2);
	theMenu.appendChild(u);
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m2'
	});
	u2 = 'Full screen mode';
	u.appendChild(document.createTextNode(u2));
	theMenu.appendChild(u);
	
	/**
	 * Always auto-accept next job
	 * 
	 */
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m1'
	});
	u2 = el({
		'create':'input',
		'type':'checkbox',
		'id':SCRIPT_NAME+'IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT'
	});
	u.appendChild(u2);
	theMenu.appendChild(u);
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m2'
	});
	u2 = '"Automatically accept the next HIT" checkbox always enabled';
	u.appendChild(document.createTextNode(u2));
	theMenu.appendChild(u);
	
	/**
	 * Turn off auto-accept next job
	 */
	// Blank left field here.
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m1'
	});
	theMenu.appendChild(u);
	// Right column
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m2'
	});
	u2 = el({
		'create':'input',
		'type':'button',
		'id':SCRIPT_NAME+'turn_off_auto_accept',
		'value':'Disable "Automatically accept the next HIT" in all tabs and windows',
		'class':SCRIPT_NAME+'clickable_btn'
	});
	u.appendChild(u2);
	// Information icon
	u2 = el({
		'create':'img',
		'src':img_info64,
		'class':SCRIPT_NAME+'img_info',
		'alt':'Pressing this button will turn off every "Automatically accept the next HIT" checkbox. Works in all tabs and windows where the checkbox appears.'
	});
	u.appendChild(u2);
	// Append right div
	theMenu.appendChild(u);
	// Spacer
	u = el({
		'create':'hr',
	});
	theMenu.appendChild(u);
	
	/**
	 * When a CAPTCHA appears, place cursor in the CAPTCHA box
	 * 
	 */
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m1'
	});
	u2 = el({
		'create':'input',
		'type':'checkbox',
		'id':SCRIPT_NAME+'IS_ACTIVE_CAPTCHA_INPUT_FOCUS'
	});
	u.appendChild(u2);
	theMenu.appendChild(u);
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m2'
	});
	u2 = 'When a CAPTCHA appears, place cursor in the CAPTCHA box';
	u.appendChild(document.createTextNode(u2));
	u2 = el({
		'create':'img',
		'src':img_info64,
		'class':SCRIPT_NAME+'img_info',
		'alt':'When a CAPTCHA appears, place cursor in the CAPTCHA box? In addition, if previous CAPTCHA was entered incorrectly, this tool will clear the text from the previous try.'
	});
	u.appendChild(u2);
	theMenu.appendChild(u);
	
	/**
	 * Display a red alert box when a CAPTCHA appears
	 */
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m1'
	});
	u2 = el({
		'create':'input',
		'type':'checkbox',
		'id':SCRIPT_NAME+'IS_ACTIVE_CAPTCHA_DISPLAY_ALERT'
	});
	u.appendChild(u2);
	theMenu.appendChild(u);
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m2'
	});
	u2 = 'When CAPTCHA appears, display red alert icon on all pages';
	u.appendChild(document.createTextNode(u2));
	u2 = el({
		'create':'img',
		'src':img_info64,
		'class':SCRIPT_NAME+'img_info',
		'alt':'When a CAPTCHA appears, display red alert icon on all pages? In addition, this tool will change document title to "CAPTCHA".'
	});
	u.appendChild(u2);
	theMenu.appendChild(u);
	
	/**
	 * Play audio sound the first time a CAPTCHA appears
	 */
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m1'
	});
	u2 = el({
		'create':'input',
		'type':'checkbox',
		'id':SCRIPT_NAME+'IS_ACTIVE_CAPTCHA_AUDIO_ALERT'
	});
	u.appendChild(u2);
	theMenu.appendChild(u);
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m2'
	});
	u2 = 'When CAPTCHA appears, play an audio sound';
	u.appendChild(document.createTextNode(u2));
	u2 = el({
		'create':'img',
		'src':img_info64,
		'class':SCRIPT_NAME+'img_info',
		'alt':'When a CAPTCHA appears, play an audio sound? Audio snippet will be played once within a span of 60 seconds. Does not play on reload of the browser window or in any other tabs if less than 60 seconds has elapsed. In addition, this tool will change document title to "CAPTCHA".'
	});
	u.appendChild(u2);
	theMenu.appendChild(u);
	
	/**
	 * CAPTCHA Audio Snippet
	 * 
	 */
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m1'
	});
	u2 = el({
		'create':'select',
		'style':'width:80%;text-align:left;',
		'id':SCRIPT_NAME+'CAPTCHA_AUDIO_SNIPPET'
	});
	u3 = el({
		'create':'option',
		'value':'Random'
	});
	u3.appendChild(document.createTextNode('Random'));
	u2.appendChild(u3);
	
	var count = 0;
	for (var i in audio_snippets) {
		u3 = el({
			'create':'option',
			'value':count
		});
		u3.appendChild(document.createTextNode(audio_snippets[i].title));
		u2.appendChild(u3);
		count++;
	}
	
	x = OBJECT_MT_TOOLS_LOCAL_STORAGE.CAPTCHA_AUDIO_SNIPPET;
	if (x != 'Random')
		u2.selectedIndex = x*1 + 1;
	u.appendChild(u2);
	theMenu.appendChild(u);
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m2'
	});
	u2 = 'CAPTCHA Audio Snippet';
	u.appendChild(document.createTextNode(u2));
	u2 = el({
		'create':'img',
		'src':img_info64,
		'class':SCRIPT_NAME+'img_info',
		'alt':'Select an audio snippet. \
			Audio snippets are embedded within extension. \
			None of the audio is downloaded externally. \
			Provided links are where the audio was originally downloaded. \
			Applicable licenses at time of download were CC-0, \
			CC-Sampling+, and CC-Attribution.'
	});
	u.appendChild(u2);
	theMenu.appendChild(u);
	
	/**
	 * Audio snippet detail
	 * 
	 */
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m1'
	});
	u.appendChild(document.createTextNode(' '));
	theMenu.appendChild(u);
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m2',
		'id':SCRIPT_NAME+'info_audio'
	});
	fill_audio_info(u, OBJECT_MT_TOOLS_LOCAL_STORAGE.CAPTCHA_AUDIO_SNIPPET); //
	theMenu.appendChild(u);
	u = el({
		'create':'hr',
	});
	theMenu.appendChild(u);
	
	
	/**
	 * Display the "Return and Accept" button
	 * 
	 */
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m1'
	});
	u2 = el({
		'create':'input',
		'type':'checkbox',
		'id':SCRIPT_NAME+'IS_ACTIVE_RETURN_AND_ACCEPT'
	});
	u.appendChild(u2);
	theMenu.appendChild(u);
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m2'
	});
	u2 = 'Display "Return and Accept" button';
	u.appendChild(document.createTextNode(u2));
	u2 = el({
		'create':'img',
		'src':img_info64,
		'class':SCRIPT_NAME+'img_info',
		'alt':'Display "Return and Accept" button? Pressing this button will, if possible, return the current job and accept another job in the group.'
	});
	u.appendChild(u2);
	theMenu.appendChild(u);
	u = el({
		'create':'hr',
	});
	theMenu.appendChild(u);
}
function generate_containers_advanced(theMenu) {
	var img_info64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAA3XAAAN1wFCKJt4AAAAB3RJTUUH3QgNExsG/ltFywAAA2BJREFUOMuV1MtvG0UcB/Dv7qw3rV+JncSWDaVJ7TxKGtuVoZAWtaUgHofSWpQ4cENphJT8OVS5NBEHJEDgSpBgVYhjKY8k8iG0ipLm2bgmlhXFa6937X3McHBrJyF2y0ijOczMR9+RfvPj8JzhHZt8d6jvxFcC4ci9B1tfZKcnZpudJ802PaOT12+8NTDzwYVIW9cJn8NjF0c23K+tlVLJxf8NekYnr392JZyInukjadlArmSg3d3GBdqtsTVXtCFKGmGfXgklQv09ZFs2UKqYkDUDWVmD1W7jTnvtsUZJyVHYyNuhxEBfD3lc0CFrJuSKUZ2aiUxRQ8txKxfxO2Ob7a//ByWHseHLg4n+3h6yWdAhP00WdLVg+EwHftvII1cqYykro0xE7kKXK7bdee4AWgO9N29d++Ry6E5vMEg2JR2yZqCkVZMRDuiwWvD93ztY31VQrOjISGVAFLmLgfZYuvONGkqeYR9fDN8JBgJkQ9Jrz5MrJmwWDgIPrO8quL+5B5OaYJSCMRPZYhnMYuEuBTpiaU8V5byjt965cSly9+SpbsuGpEPVDCi6CaViQNENnGxtwUf9bkR8dkS//AO6YYKxZygFoyYGvXZEWnnzp9+XYsL5ge5vuk91W5b3NCiaAUUzn64GVM3AL9kiRJ4i6nfUktUxCjCKxUweVsFFzgZ9XwsEEIqaCUnVq8n2YZKqoVTRQCkF4bkaUsfquFrR4BCIwN9b2vo8vb5m+mw8CqqOQllDQdUgqRokVQdjFBwYCA8wah6JRf1OvOoU2NxyeozP3h6fmflr6WrxyZbe5RRQUHVIZR2SqsOkBhitgsK+hIexfjuhP8+vDGenJr7lASB3e/zu7PzyNexmjF6XCLlcxxijsIsEhOPgPi4cic3Or8RzUxOJA3WopJKrGf+bCwMdx+Jul4PfzpfBGMXV052Ih32gjGHQ58TDf/LYLZXr2Nyjkdx0FQMA7vDX6xyb/PC9s8GZHLEL97fyYMwE9pXIgWRzj0Zy0+M/NP3LSiq5uuMfWgh57HFXm43f3lNeGGvYbZRUcnXnpaGFsNcRd7fa+Md7pRfCmvbDKnp+4dzLrrjNdoz32ESE20T6458rDbHndmwllVx94ht68IpDfN8BQ/91cfNmbmr8u2Z3/gVFGDS1XwxhOQAAAABJRU5ErkJggg==';
	
	/**
	 * Section = fullscreen
	 */
	
	/**
	 * Show a title for section
	 */
	u = el({
		'create':'div',
		'style':'width:100%;font-weight:bold;',
		'innerText':'Options for full-screen mode'
	});
	theMenu.appendChild(u);
	
	/**
	 * Modify height of job window
	 * 
	 */
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m1'
	});
	u2 = el({
		'create':'input',
		'type':'checkbox',
		'id':SCRIPT_NAME+'IS_ACTIVE_IFRAME_HEIGHT'
	});
	u.appendChild(u2);
	theMenu.appendChild(u);
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m2'
	});
	u2 = 'Modify height of job window';
	u.appendChild(document.createTextNode(u2));
	theMenu.appendChild(u);
	
	/**
	 * Job window height value
	 * 
	 */
	// Div
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m1'
	});
	// Input
	u2 = el({
		'create':'input',
		'type':'text',
		'style':'text-align:right;',
		'size':5,
		'id':SCRIPT_NAME+'IFRAME_HEIGHT',
		'value':OBJECT_MT_TOOLS_LOCAL_STORAGE.IFRAME_HEIGHT
	});
	// Input eventListener
	enterKeyEventListener(u2);
	// Append input
	u.appendChild(u2);
	// Append " px"
	u2 = ' px';
	u.appendChild(document.createTextNode(u2));
	theMenu.appendChild(u);
	// Div
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m2'
	});
	u2 = 'Height of job window (# pixels)';
	u.appendChild(document.createTextNode(u2));
	u2 = el({
		'create':'img',
		'src':img_info64,
		'class':SCRIPT_NAME+'img_info',
		'alt':'Height of the job window. Value is in pixels. Minimum value 0. No maximum value. Default size is approximately 400 pixels.'
	});
	u.appendChild(u2);
	theMenu.appendChild(u);
	//~ u = el({
		//~ 'create':'hr',
	//~ });
	//~ theMenu.appendChild(u);
	
	/**
	 * Maximize width of job window
	 * 
	 */
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m1'
	});
	u2 = el({
		'create':'input',
		'type':'checkbox',
		'id':SCRIPT_NAME+'IS_ACTIVE_IFRAME_WIDTH'
	});
	u.appendChild(u2);
	theMenu.appendChild(u);
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m2'
	});
	u2 = 'Maximize width of job window';
	u.appendChild(document.createTextNode(u2));
	theMenu.appendChild(u);
	//~ u = el({
		//~ 'create':'hr',
	//~ });
	//~ theMenu.appendChild(u);
	
	/**
	 * Modify vertical position of job window
	 * 
	 */
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m1'
	});
	u2 = el({
		'create':'input',
		'type':'checkbox',
		'id':SCRIPT_NAME+'IS_ACTIVE_IFRAME_OFFSET'
	});
	u.appendChild(u2);
	theMenu.appendChild(u);
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m2'
	});
	u2 = 'Modify vertical position of job window';
	u.appendChild(document.createTextNode(u2));
	theMenu.appendChild(u);
	
	/**
	 * Enter a number for distance of job window from top of the page.
	 * 
	 */
	// Div
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m1'
	});
	// Input
	u2 = el({
		'create':'input',
		'type':'text',
		'style':'text-align:right;',
		'size':5,
		'id':SCRIPT_NAME+'IFRAME_OFFSET_TOP',
		'value':OBJECT_MT_TOOLS_LOCAL_STORAGE.IFRAME_OFFSET_TOP
	});
	// Input eventListener
	enterKeyEventListener(u2);
	// Append
	u.appendChild(u2);
	// Append " px"
	u2 = ' px';
	u.appendChild(document.createTextNode(u2));
	theMenu.appendChild(u);
	u = el({
		'create':'div',
		'class':SCRIPT_NAME+'m2'
	});
	u2 = 'Distance of job window from top of page (# pixels)';
	u.appendChild(document.createTextNode(u2));
	u2 = el({
		'create':'img',
		'src':img_info64,
		'class':SCRIPT_NAME+'img_info',
		'alt':'Distance of job window from top of page. \
			The height of top "menu" is 20px. Value is in pixels. \
			Minimum value 0. No maximum value.'
	});
	u.appendChild(u2);
	theMenu.appendChild(u);
	//~ u = el({
		//~ 'create':'hr',
	//~ });
	//~ theMenu.appendChild(u);
}
function generate_containers(theMenu, show_advanced_menu = false) {
	if (!show_advanced_menu) {
		generate_container_basic(theMenu);
	} else {
		generate_containers_advanced(theMenu);
	}
}
/**
 * Function showMenu
 * 
 * @param show_advanced_menu: boolean
 */
function showMenu(show_advanced_menu = false) {

	var t,
		theMenu,
		u,
		u2,
		u3,
		x;
		
	// audio snippets
	audio_snippets = audio_snippets_data(true);
	
	/**
	 * Styles
	 * Only add these style when the user clicks the "tools" button,
	 * when the user wants to see the tools menu.
	 * Consider: Remove old styles?
	 */
	// m1
	GM_addStyle(
		'.'+SCRIPT_NAME+'m1 {\
			float:left;\
			width:20%;\
			height:40px;\
			padding:2px 0 2px;\
			text-align:center;\
			cursor:pointer;\
			overflow:hidden;\
			background-color:#fcfefc;\
		}'
	);
	// m2
	GM_addStyle(
		'.'+SCRIPT_NAME+'m2 {\
			float:block;\
			width:80%;\
			height:40px;\
			padding:6px 0 2px;\
			text-align:left;\
			cursor:pointer;\
			overflow:hidden;\
			background-color:#fcfefc;\
		}'
	);
	// m2 buttons, move upward, margin-top
	GM_addStyle(
		'.'+SCRIPT_NAME+'m2 > input[type="button"] {\
			margin-top:-2px;\
		}'
	);
	// advanced versus basic
	GM_addStyle(
		'.'+SCRIPT_NAME+'advanced {\
			display:none;\
		}\
		.'+SCRIPT_NAME+'basic {\
			display:block;\
		}'
	);
	// HR
	GM_addStyle(
		'#'+SCRIPT_NAME+'menu_div hr {\
			width:100%;\
			border:1px solid #cbcbcb;\
			margin:0;\
		}'
	);
	// menu_div
	GM_addStyle(
		'#'+SCRIPT_NAME+'menu_div {\
			position:absolute;\
			top:8px;\
			left:50%;\
			margin-left:-280px;\
			width:800px;\
			height:740px;\
			padding:0px 8px 0px 8px;\
			z-index:10000;\
			background-color:#ececec;\
			-moz-border-radius:4px;\
			border-radius:4px;\
			border:1px solid #444;\
		}'
	);
	// dimmer
	GM_addStyle(
		'#'+SCRIPT_NAME+'menu_div_dim {\
			position:fixed;\
			top:0;\
			left:0;\
			width:100%;\
			height:100%;\
			z-index:10000;\
			background-color:#000;\
			opacity:0.4;\
			filter:alpha(opacity=40);\
			cursor:pointer;\
		}\
		#'+SCRIPT_NAME+'menu_div_dim:hover {\
			background-color:#222;\
		}'
	);
	//~ GM_addStyle(
		//~ '#'+SCRIPT_NAME+'menu_div_dim:hover {\
			//~ background-color:#222;\
		//~ }'
	//~ );
	// div_info
	// z-index on top of menu_status
	// hover div for info?
	GM_addStyle(
		'#'+SCRIPT_NAME+'div_info {\
			position:absolute;\
			left:50%;\
			margin-left:-30%;\
			width:60%;\
			height:100px;\
			padding:6px;\
			display:none;\
			background-color:MintCream;\
			border:2px double MediumSeaGreen;\
			text-align:left;\
			-moz-border-radius:6px;\
			border-radius:6px;\
			z-index:1020;\
		}'
	);
	// menu_status
	GM_addStyle(
		'#'+SCRIPT_NAME+'menu_status {\
			width:40%;\
			margin-top:2px;\
			padding:2px 0;\
			text-align:center;\
			opacity:0;\
			filter:alpha(opacity=0);\
			border:3px dashed Lime;\
			-moz-border-radius:4px;\
			border-radius:4px;\
			color:teal;\
			background-color:MintCream;\
			margin-left:30%;\
		}'
	);
	// img_info
	GM_addStyle( // image for info
		'.'+SCRIPT_NAME+'img_info {\
			height:10px;\
			margin-left:10px;\
		}'
	);
	// turn_off_auto_accept Button
	GM_addStyle( // turn_off_auto_accept
		'.'+SCRIPT_NAME+'clickable_btn {\
			cursor:pointer;\
		}'
	);
	GM_addStyle( // turn_off_auto_accept
		'.'+SCRIPT_NAME+'clickable_btn:hover {\
			background-color:#eee;\
		}'
	);
	
	/**
	 * Div containers
	 */
	// Background dimmer
	u = el({
		'create':'div',
		'id':SCRIPT_NAME+'menu_div_dim'
	});
	document.body.appendChild(u);
	u.addEventListener('click', function() {
		hideMenu();
	}, false);
	// Menu div
	u = el({
		'create':'div',
		'id':SCRIPT_NAME+'menu_div'
	});
	document.body.appendChild(u);
	theMenu = document.getElementById(SCRIPT_NAME+'menu_div');
	
	/**
	 * Menu title
	 */
	u = el({
		'create':'h2',
		'style':'width:100%;margin-top:4px;margin-bottom:4px;'
	});
	u2 = 'Tools for Amazon\'s Mechanical Turk';
	u.appendChild(document.createTextNode(u2));
	theMenu.appendChild(u);
	u = el({
		'create':'hr',
	});
	theMenu.appendChild(u);
	
	/**
	 * Menu items
	 */
	generate_containers(theMenu, show_advanced_menu);
	
	/**
	 * Info
	 */
	theMenu.appendChild(document.createElement('br'));
	theMenu.appendChild(document.createTextNode(' * Refresh the page after saving settings to see changes.'));
	
	/**
	 * Hidden div for extra info
	 */
	u = el({
		'create':'div',
		'id':SCRIPT_NAME+'div_info'
	});
	theMenu.appendChild(u);
	
	/**
	 * Menu status div
	 */
	u = el({
		'create':'div',
		'id':SCRIPT_NAME+'menu_status',
		'style':'width:40%;margin-left:30%;overflow:hidden;'
	});
	u2 = 'Settings Saved!';
	u.appendChild(document.createTextNode(u2));
	theMenu.appendChild(u);
	
	/**
	 * Save & Exit div
	 * 
	 */
	var u3,u_;
	//Container
	u = el({
		'create':'div',
		'style':'width:100%;padding:0px 0px 0px 0px;margin-bottom:10px;text-align:center;',
	});
	u_= el({
		'create':'div',
		'style':'width:80%;margin-left:10%;padding-bottom:10px;overflow:hidden;',
	});
	u.appendChild(u_);
	// Save
	u2 = el({
		'create':'input',
		'type':'button',
		'id':SCRIPT_NAME+'save',
		'value':'Save Settings',
		'class':SCRIPT_NAME+'clickable_btn'
	});
	u_.appendChild(u2);
	// Exit
	u2 = el({
		'create':'input',
		'type':'button',
		'id':SCRIPT_NAME+'exit',
		'value':'Exit Menu',
		'class':SCRIPT_NAME+'clickable_btn'
	});
	u_.appendChild(u2);
	// Enable
	u2 = el({
		'create':'input',
		'type':'button',
		'id':SCRIPT_NAME+'reset_enable',
		'value':'Enable All',
		'class':SCRIPT_NAME+'clickable_btn'
	});
	u_.appendChild(u2);
	// Disable
	u2 = el({
		'create':'input',
		'type':'button',
		'id':SCRIPT_NAME+'reset_disable',
		'value':'Disable All',
		'class':SCRIPT_NAME+'clickable_btn'
	});
	u_.appendChild(u2);
	// Advanced settings
	var advtxt;
	if (!show_advanced_menu) {
		advtxt = 'Advanced Settings';
	} else {
		advtxt = 'Basic Settings';
	}
	u2 = el({
		'create':'input',
		'type':'button',
		'id':SCRIPT_NAME+'advanced_settings',
		'value':advtxt,
		'class':SCRIPT_NAME+'clickable_btn'
	});
	u_.appendChild(u2);
	// All buttons to menu
	theMenu.appendChild(u);
	
	/**
	 * Copyright
	 */
	theMenu.appendChild(document.createTextNode('© 2013-2017 '));
	u = el({
		'create':'a',
		'style':'font-weight:bold;',
		'href':'https://their.github.com/amt',
		'target':'_blank'
	});
	u2 = 'David Shumway';
	u.appendChild(document.createTextNode(u2));
	theMenu.appendChild(u);
	// and
	theMenu.appendChild(document.createTextNode(' and '));
	// flbs
	u = el({
		'create':'a',
		'style':'font-weight:bold;',
		'href':'http://fbiz.us/',
		'target':'_blank'
	});
	u2 = 'FLBS';
	u.appendChild(document.createTextNode(u2));
	theMenu.appendChild(u);
	// period
	theMenu.appendChild(document.createTextNode('.'));
	
	/**
	 * Apply menu item actions 
	 * 
	 */
	showMenu_applyActions();
}

/**
 * function showMenu_applyActions
 * 
 */
function showMenu_applyActions() {
	
	var u, x;
	
	/**
	 * IFRAME_ENABLE_FULL_SCREEN
	 */
	u = document.getElementById(SCRIPT_NAME+'IFRAME_ENABLE_FULL_SCREEN');
	if (u)
		u.checked = OBJECT_MT_TOOLS_LOCAL_STORAGE.IFRAME_ENABLE_FULL_SCREEN;
	
	/**
	 * IFRAME_HEIGHT/IFRAME_OFFSET_TOP
	 * Disable or enable accompanying text field.
	 */
	u = document.getElementById(SCRIPT_NAME+'IFRAME_HEIGHT');
	x = (OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_HEIGHT) ? false : true;
	if (u) {
		u.disabled = x;
		if (x)
			u.style.backgroundColor = '#ddd';
	}
	if (u) {
		u = document.getElementById(SCRIPT_NAME+'IFRAME_OFFSET_TOP');
		x = (OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_OFFSET) ? false : true;
		u.disabled = x;
		if (x)
			u.style.backgroundColor = '#ddd';
	}
		
	/**
	 * IS_ACTIVE_IFRAME_HEIGHT
	 * 
	 */
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_IFRAME_HEIGHT');
	if (u) {
		u.onchange = function() {
			var u = document.getElementById(SCRIPT_NAME+'IFRAME_HEIGHT');
			if (this.checked) {
				u.disabled = false;
				u.style.backgroundColor = '#fff';
			} else {
				u.disabled = true;
				u.style.backgroundColor = '#ddd';
			}
		}
	}
	
	/**
	 * IS_ACTIVE_IFRAME_OFFSET
	 * 
	 */
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_IFRAME_OFFSET');
	if (u) {
		u.onchange = function() {
			var u = document.getElementById(SCRIPT_NAME+'IFRAME_OFFSET_TOP');
			if (this.checked) {
				u.disabled = false;
				u.style.backgroundColor = '#fff';
			} else {
				u.disabled = true;
				u.style.backgroundColor = '#ddd';
			}
		}
	}
	
	/**
	 * IS_ACTIVE_ checkboxes
	 * 
	 */
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_IFRAME_HEIGHT');
	if (u)
		u.checked = OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_HEIGHT;
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_IFRAME_WIDTH');
	if (u)
		u.checked = OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_WIDTH;
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_IFRAME_OFFSET');
	if (u)
		u.checked = OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_OFFSET;
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT');
	if (u)
		u.checked = OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT;
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_CAPTCHA_INPUT_FOCUS');
	if (u)
		u.checked = OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_INPUT_FOCUS;
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_CAPTCHA_DISPLAY_ALERT');
	if (u)
		u.checked = OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_DISPLAY_ALERT;
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_CAPTCHA_AUDIO_ALERT');
	if (u)
		u.checked = OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_AUDIO_ALERT;
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_RETURN_AND_ACCEPT');
	if (u)
		u.checked = OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_RETURN_AND_ACCEPT;
	
	/**
	 * Checkboxes for menu (stopPropagation)
	 * 
	 */
	u = [
		document.getElementById(SCRIPT_NAME+'IS_ACTIVE_IFRAME_HEIGHT'),
		document.getElementById(SCRIPT_NAME+'IS_ACTIVE_IFRAME_WIDTH'),
		document.getElementById(SCRIPT_NAME+'IS_ACTIVE_IFRAME_OFFSET'),
		document.getElementById(SCRIPT_NAME+'IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT'),
		document.getElementById(SCRIPT_NAME+'IS_ACTIVE_CAPTCHA_INPUT_FOCUS'),
		document.getElementById(SCRIPT_NAME+'IS_ACTIVE_CAPTCHA_DISPLAY_ALERT'),
		document.getElementById(SCRIPT_NAME+'IS_ACTIVE_CAPTCHA_AUDIO_ALERT'),
		document.getElementById(SCRIPT_NAME+'IS_ACTIVE_RETURN_AND_ACCEPT')
	];
	for (var i in u) {
		if (u[i])
			u[i].onclick = function(e) { e.stopPropagation(); };
	}
	
	/**
	 * Labels for menu items
	 * m1 and m2
	 */
	u = document.getElementsByClassName(SCRIPT_NAME+'m1'); // m1 (left)
	for (var i in u) {
		u[i].onmouseover = function() {
			this.style.backgroundColor = '#efdefe';
			this.nextSibling.style.backgroundColor = '#efdefe';
		}
		u[i].onclick = function() {
			var u;
			u = this.getElementsByTagName('input');
			if (u.length) {
				u = u[0];
				u.focus();
				if (u.type == 'checkbox') {
					u.click();
				}
				return;
			}
			u = this.getElementsByTagName('select'); // still here?
			if (u.length) {
				u[0].focus();
			}
		}
		u[i].onmouseout = function() {
			this.style.backgroundColor = '#fefefe';
			this.nextSibling.style.backgroundColor = '#fefefe';
		}
	}
	u = document.getElementsByClassName(SCRIPT_NAME+'m2'); // m2 (right)
	for (var i in u) {
		u[i].onmouseover = function() {
			this.style.backgroundColor = '#efdefe';
			this.previousSibling.style.backgroundColor = '#efdefe';
		}
		u[i].onclick = function() {
			var u;
			u = this.previousSibling.getElementsByTagName('input');
			if (u.length) {
				u = u[0];
				u.focus();
				if (u.type == 'checkbox') {
					u.click();
				}
				return;
			}
			u = this.previousSibling.getElementsByTagName('select'); // still here?
			if (u.length) {
				u[0].focus();
			}
		}
		u[i].onmouseout = function() {
			this.style.backgroundColor = '#fefefe';
			this.previousSibling.style.backgroundColor = '#fefefe';
		}
	}
	
	/**
	 * Audio snippet info
	 * 
	 */
	u = document.getElementById(SCRIPT_NAME+'CAPTCHA_AUDIO_SNIPPET');
	if (u) {
		u.onchange = function() {
			var x;
			x = document.getElementById(SCRIPT_NAME+'info_audio');
			x.innerHTML = '';
			fill_audio_info(x, this.value);
			
			// Play audio test
			play_audio(this.value); // Random or 0..6
		}
	}
	
	/**
	 * Show info
	 * 
	 */
	u = document.getElementsByClassName(SCRIPT_NAME+'img_info');
	for (var i in u) {
		u[i].onmouseover = function(event) {
			var x;
			x = document.getElementById(SCRIPT_NAME+'div_info');
			x.appendChild(document.createTextNode(this.alt));
			x.style.display = 'inline';
			x.style.top = event.clientY + 'px';
		}
		u[i].onmouseout = function() {
			var x;
			x = document.getElementById(SCRIPT_NAME+'div_info');
			x.style.display = 'none';
			x.innerHTML = '';
		}
	}
	
	/**
	 * Save button
	 * 
	 */
	u = document.getElementById(SCRIPT_NAME+'save');
	u.onclick = function() {
		// Update settings
		updateSettings();
	}
	
	/**
	 * Exit button
	 * 
	 */
	u = document.getElementById(SCRIPT_NAME+'exit');
	u.onclick = function() {
		hideMenu();
	}
	
	/**
	 * Enable/Disable buttons
	 * 
	 */
	u = document.getElementById(SCRIPT_NAME+'reset_enable');
	u.onclick = function() {
		updateSettings(1);
	}
	u = document.getElementById(SCRIPT_NAME+'reset_disable');
	u.onclick = function() {
		updateSettings(2);
	}
	
	/**
	 * Advanced Settings button
	 * 
	 * Onclick:
	 * 		Update settings.
	 * 		Hide menu.
	 * 		Show menu again (either basic or advanced).
	 */
	u = document.getElementById(SCRIPT_NAME+'advanced_settings');
	u.onclick = function() {
		if (this.value == 'Advanced Settings') {
			// Shows advanced
			updateSettings();
			hideMenu();
			showMenu(true);
		} else {
			// Hides advanced
			updateSettings();
			hideMenu();
			showMenu(false);
		}
		// Hide the tools button.
		var u = document.getElementById(SCRIPT_NAME+'btn_show_menu');
		if (u)
			u.style.display = 'none';
	}
	
	/**
	 * Uncheck Auto-Accepts Button 
	 * 
	 */
	u = document.getElementById(SCRIPT_NAME + 'turn_off_auto_accept');
	if (u) {
		u.onclick = function () {
			// Toggle this localStorage
			localStorage['OBJECT_MT_TOOLS_LOCAL_STORAGE_reset_accpt_'+SCRIPT_NAME] = true;
			localStorage['OBJECT_MT_TOOLS_LOCAL_STORAGE_reset_accpt_'+SCRIPT_NAME] = false;
			// Run
			stopAcceptingJobs_run();
		}
	}
}

/**
 * function updateSettings
 * 
 */
function updateSettings(resetSettings) {
	
	var u;
	var btn;
	btn = document.getElementById(SCRIPT_NAME+'save');
	btn.disabled = true;
	btn.value = 'Saving Settings...';
	
	if (resetSettings) {
		var reset;
		if (resetSettings == 1) // enable
			reset = true;
		else // disable
			reset = false;
		var el = [
			document.getElementById(SCRIPT_NAME+'IS_ACTIVE_IFRAME_HEIGHT'),
			document.getElementById(SCRIPT_NAME+'IS_ACTIVE_IFRAME_WIDTH'),
			document.getElementById(SCRIPT_NAME+'IS_ACTIVE_IFRAME_OFFSET'),
			document.getElementById(SCRIPT_NAME+'IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT'),
			document.getElementById(SCRIPT_NAME+'IS_ACTIVE_CAPTCHA_INPUT_FOCUS'),
			document.getElementById(SCRIPT_NAME+'IS_ACTIVE_CAPTCHA_DISPLAY_ALERT'),
			document.getElementById(SCRIPT_NAME+'IS_ACTIVE_CAPTCHA_AUDIO_ALERT'),
			document.getElementById(SCRIPT_NAME+'IS_ACTIVE_RETURN_AND_ACCEPT')
		]
		for (var i in el) { // simulate behaviour
			if (el[i]) {
				if (el[i].checked != reset) {
					el[i].click();
				}
			}
		}
	}
	
	// IS_ACTIVE_IFRAME_HEIGHT
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_IFRAME_HEIGHT');
	if (u) {
		if (u.checked) {
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_HEIGHT = true;
		} else {
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_HEIGHT = false;
		}
	}
	
	// IS_ACTIVE_IFRAME_WIDTH
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_IFRAME_WIDTH');
	if (u) {
		if (u.checked) {
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_WIDTH = true;
		} else {
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_WIDTH = false;
		}
	}
	
	// IS_ACTIVE_IFRAME_OFFSET
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_IFRAME_OFFSET');
	if (u) {
		if (u.checked) {
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_OFFSET = true;
		} else {
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_OFFSET = false;
		}
	}
	
	// IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT');
	if (u) {
		if (u.checked) {
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT = true;
		} else {
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT = false;
		}
	}
	
	// IS_ACTIVE_CAPTCHA_INPUT_FOCUS
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_CAPTCHA_INPUT_FOCUS');
	if (u) {
		if (u.checked) {
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_INPUT_FOCUS = true;
		} else {
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_INPUT_FOCUS = false;
		}
	}
	
	// IS_ACTIVE_CAPTCHA_DISPLAY_ALERT
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_CAPTCHA_DISPLAY_ALERT');
	if (u) {
		if (u.checked) {
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_DISPLAY_ALERT = true;
		} else {
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_DISPLAY_ALERT = false;
		}
	}
	
	// IS_ACTIVE_CAPTCHA_AUDIO_ALERT
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_CAPTCHA_AUDIO_ALERT');
	if (u) {
		if (u.checked) {
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_AUDIO_ALERT = true;
		} else {
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_AUDIO_ALERT = false;
		}
	}
	
	// IS_ACTIVE_RETURN_AND_ACCEPT
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_RETURN_AND_ACCEPT');
	if (u) {
		if (u.checked) {
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_RETURN_AND_ACCEPT = true;
		} else {
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_RETURN_AND_ACCEPT = false;
		}
	}
	
	// IFRAME_HEIGHT
	u = document.getElementById(SCRIPT_NAME+'IFRAME_HEIGHT');
	if (u) {
		u = u.value.replace(/\D/g, '');
		OBJECT_MT_TOOLS_LOCAL_STORAGE.IFRAME_HEIGHT = (u != '') ? u : 6000;
	}
	
	// IFRAME_OFFSET_TOP
	u = document.getElementById(SCRIPT_NAME+'IFRAME_OFFSET_TOP');
	if (u) {
		u = u.value.replace(/\D/g, '');
		OBJECT_MT_TOOLS_LOCAL_STORAGE.IFRAME_OFFSET_TOP = (u != '') ? u : 30;
	}
	
	// IFRAME_ENABLE_FULL_SCREEN
	u = document.getElementById(SCRIPT_NAME+'IFRAME_ENABLE_FULL_SCREEN');
	if (u) {
		if (u.checked) {
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IFRAME_ENABLE_FULL_SCREEN = true;
			// Enable others
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_HEIGHT	= true;
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_WIDTH	= true;
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_OFFSET	= true;
		} else {
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IFRAME_ENABLE_FULL_SCREEN = false;
			// Disable others
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_HEIGHT	= false;
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_WIDTH	= false;
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_OFFSET	= false;
		}
	}
	
	// CAPTCHA_AUDIO_SNIPPET
	u = document.getElementById(SCRIPT_NAME+'CAPTCHA_AUDIO_SNIPPET');
	if (u) {
		OBJECT_MT_TOOLS_LOCAL_STORAGE.CAPTCHA_AUDIO_SNIPPET = u.value;
	}
	
	// Save
	saveLocalStorage();
	
	// Status
	blink__sr_status(true);
	btn.disabled = false;
	btn.value = 'Save Settings';
}

/**
 * function saveLocalStorage
 * 
 */
function saveLocalStorage() {
	var u = JSON.stringify(OBJECT_MT_TOOLS_LOCAL_STORAGE);
	GM_setValue('OBJECT_MT_TOOLS_LOCAL_STORAGE'+SCRIPT_NAME, u);
}

/**
 * function events_listener_captcha
 * 
 * This function will only fire once per CAPTCHA session.
 * 
 * Decription: Fires only once across all tabs which have a CAPTCHA.
 */
function events_listener_captcha() {
	
	var u;
	var u2;
	var cda;
	var caa;
	var d;
	var date_audio_expired;
	var b64_audio;
	var x;
	var captcha_text = 'CAPTCHA ☕'; //&#9749; hot beverage

	/*
	 * Get local storage
	 * Current version of local storage (has captcha status).
	 */
	u = GM_getValue('OBJECT_MT_TOOLS_LOCAL_STORAGE'+SCRIPT_NAME);
	if (!u) return;
	u = JSON.parse(u);
	u = sanitize(u); // sanitize 
	
	// This is the CAPTHCA display alert div.
	// It will hold the text displaying alert
	// for CAPTCHA.
	cda = document.getElementById(SCRIPT_NAME+'cda');
	
	// This is the audio player element.
	//
	//
	caa = document.getElementById(SCRIPT_NAME+'caa');
	
	// Is there a CAPTCHA
	if (u.CAPTCHA_IS_PRESENT)
	{
		
		// Document title
		if  (
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_DISPLAY_ALERT ||
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_AUDIO_ALERT
			)
		{
			if (document.body.innerHTML.indexOf(globals.c_phrase) != -1) { // Only change title when THIS tab has CAPTCHA
				document.title = 'CAPTCHA';
			} else {
				if (document.title == 'CAPTCHA') {
					document.title = globals.original_title;
				}
			}
		}
		
		// Display
		if (OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_DISPLAY_ALERT && !cda) {
			cda = el({
				'create':'div',
				'style':'\
					position:fixed;\
					top:0;\
					left:0;\
					width:100px;\
					padding:8px 0 8px 0;\
					text-align:center;\
					z-index:100;\
					background-color:MistyRose;\
					font-weight:bold;\
					border:2px solid LightCoral;\
					border-top:0;\
					border-left:0;',
				'id':SCRIPT_NAME+'cda'
			});//bg red border
			cda.appendChild(document.createTextNode(captcha_text));
			document.body.appendChild(cda);
		}
		
		// Audio
		// Allow the CAPTCHA to play over and over again on same page, rather than only
		// playing it for each new tab instance but only once.
		// 5 Sep 2014: Changed from 50 seconds to 60.
		if  (
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_AUDIO_ALERT &&
			document.body.innerHTML.indexOf(globals.c_phrase) != -1
			)
		{
			
			checkPlayCaptchaAudio();
			
		}
	}
	// There is no CAPTCHA
	else
	{
		// Change title.
		if  (
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_DISPLAY_ALERT ||
			OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_AUDIO_ALERT
			)
		{
			document.title = globals.original_title;
		}
		
		// Remove display.
		if (cda) {
			document.body.removeChild(cda);
		}
		
		// Remove audio.
		if (caa) {
			document.body.removeChild(caa);
		}
	}
}
/**
 * function checkPlayCaptchaAudio
 * 
 * Checks whether to re-play CAPTCHA audio alert during CAPTCHA.
 *
 * Strategy: 
 * 		Every ten seconds, check localStorage value that defines time
 * 		when last audio alert was played.
 * 		Only play audio alert when:
 * 			A) Localstorage.CAPTCHA_IS_PRESENT; and
 *			B) Captcha is in this tab (.indexOf(globals.c_phrase)); and
 * 			C) Time since last alert has been at least sixty seconds.
 */
function checkPlayCaptchaAudio() {
	
	u = GM_getValue('OBJECT_MT_TOOLS_LOCAL_STORAGE'+SCRIPT_NAME);
	if (!u) return;
	u = JSON.parse(u);
	u = sanitize(u);
	
	if  (
		!u.CAPTCHA_IS_PRESENT ||
		document.body.innerHTML.indexOf(globals.c_phrase) == -1
		)
	{
		return;
	}
	
	// This is the audio player element.
	//
	//
	var caa = document.getElementById(SCRIPT_NAME+'caa');
	
	// Remove old player (max time per tab is 60 seconds, per total session is 30!)
	// If as player is already embedded onto the page/tab, then wait for 60 seconds
	// before the player on this page/tab plays again. Otherwise, wait for 30 seconds 
	// before playing again.
	var time_to_next = 60000;
	
	// Date
	var d = new Date().getTime();
	
	// Is last audio alert older than 30 seconds?
	if (d - u.DATE_CAPTCHA_AUDIO_PLAYED*1 > time_to_next) {
		
		date_audio_is_expired = true;
		
		// Set OBJECT_MT_TOOLS_LOCAL_STORAGE
		// This is the current global vars object
		// for localStorage.
		OBJECT_MT_TOOLS_LOCAL_STORAGE.DATE_CAPTCHA_AUDIO_PLAYED = d; // set .DATE_CAPTCHA_AUDIO_PLAYED
		
		// Save
		saveLocalStorage();
		
	} else
		date_audio_is_expired = false;
	
	// If audio alert...
	if (date_audio_is_expired) {
		
		// Remove old
		if (caa)
			document.body.removeChild(caa);
		
		// Play
		// Loads audio selected value from the local storage!
		play_audio(
			OBJECT_MT_TOOLS_LOCAL_STORAGE.CAPTCHA_AUDIO_SNIPPET
		);
		
	}
	
	// Set 10s timeout.
	window.setTimeout(checkPlayCaptchaAudio, 10000);
}

/**
 * function storage_events_listener
 * 
 * Events listener to monitor changes to localStorage.
 * 
 * Decription:
 * 		This is turned on when:
 * 			A) When the keys .IS_ACTIVE_CAPTCHA_DISPLAY_ALERT or .IS_ACTIVE_CAPTCHA_AUDIO_ALERT are enabled.
 * 			B) When the "Disable checked" button appears on page.
 * 		Turned on via an event listener in this script which is 
 * 		listening for "storage" events.
 * 
 * @param:	event
 * 			An object containing the values:
				@key @newValue @oldValue @url @storageArea
 * 
 */
function storage_events_listener(event) {
	
	var key = event.key;
	
	// A CAPTCHA has either been first seen
	// or it has been completed successfully.
	if (key == 'OBJECT_MT_TOOLS_LOCAL_STORAGE_alert_' + SCRIPT_NAME) {
		events_listener_captcha();
		return;
	}
	
	// OBJECT_MT_TOOLS_LOCAL_STORAGE_reset_accpt_
	//
	//
	if (key == 'OBJECT_MT_TOOLS_LOCAL_STORAGE_reset_accpt_' + SCRIPT_NAME) {
		stopAcceptingJobs_run();
		return;
	}
}

/**
 * Function modifyIframe
 * Function to make iframe "full-screen".
 * 
 * @param	top	Is not in an iframe but in #MainContent.
 */
function modifyIframe(el_iframe, top) {
	var div_iframe,
		class_success = 'mturk-alert mturk-alert-success'; // classname of div with success text
	
	if (!top) {
		div_iframe = el_iframe.parentNode;
	} else {
		div_iframe = el_iframe;
	}
	
	//~ console.log(div_iframe);
	//~ if (!div_iframe) {
		//~ div_iframe
	//~ }
	//~ if (!div_iframe) return;
	
	div_iframe.style.zIndex = 1;
	
	// IFRAME_HEIGHT
	if (OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_HEIGHT) {
		div_iframe.style.height = OBJECT_MT_TOOLS_LOCAL_STORAGE.IFRAME_HEIGHT + 'px';
		div_iframe.style.backgroundColor = '#fff'; // iframe transparency
	}
	
	/**
	 * IFRAME_WIDTH
	 * IS_ACTIVE_IFRAME_WIDTH
	 * Change the width of the iframe to full width.
	 * 		Change certain elements in the body to the width of the page,
	 * 		as they currently overflow to the right of the page.
	 **/
	if (OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_WIDTH) {
		GM_addStyle('#MainContent, #MainContent.div {margin: 0 !important; padding: 0 !important;}');
		GM_addStyle('#MainContent.hr,#MainContent.row,#MainContent.task-preview,.footer-horizontal-rule {\
			margin: 0 !important;\
			margin-right: 0 !important;\
			margin-left: 0 !important;\
			padding: 0 !important;}');
		// This is necessary to keep the window from overflowing on the
		// right side.
		GM_addStyle('.row {margin-right: 0 !important;}');
		// This is necessary to make task preview fit full width.
		GM_addStyle('.task-preview {padding-right: 0 !important;}');
	}
	
	/**
	 * IFRAME_OFFSET_TOP (this is turned off in preview)
	 * 
	 * Make a div to hold the job iframe / job div.
	 * 
	 */
	if (OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_OFFSET) {
		var s1,s2,s3,s4,s5,s6;
		s1 = 'In order to accept your next HIT, please type this word into the text box below';
		s2 = 'you were viewing could not be accepted';
		s3 = 'The HIT you were viewing has expired';
		s4 = 'Want to work on this HIT?';
		s5 = 'Time Remaining:';
		s6 = 'Time Elapsed';
		if  (
			// Do not move window when in preview mode. The one exception is when in "continue". Then check innerHTML for "Finished with this HIT?".
			//
			//
			//~ /<td align="center" nowrap[^>]*>Finished with this HIT\?<\/td>/.exec(document.body.innerHTML) &&
			
			// Does not contain
			document.body.innerHTML.indexOf(s1) == -1 && // test
			document.body.innerHTML.indexOf(s2) == -1 && // test
			document.body.innerHTML.indexOf(s3) == -1 && // test
			document.body.innerHTML.indexOf(s4) == -1 && // test
			
			// Contains either "time remaining" or "time elapsed"
			(document.body.innerHTML.indexOf(s5) != -1 ||
			 document.body.innerHTML.indexOf(s6) != -1)
			
			// Not yet on page.
			//~ !document.getElementById(SCRIPT_NAME+'div_hold_iframe')
			)
		{
			document.body.insertBefore(div_iframe, document.body.firstChild);
			
			if (document.getElementsByTagName('iframe').length != 0) {
				// Set margin top
				div_iframe.style.marginTop = OBJECT_MT_TOOLS_LOCAL_STORAGE.IFRAME_OFFSET_TOP+'px';
			} else {			
				// This is the other way to move the iframe.
				// setAttribute allows for !important.
				// But then it also removes other styling.
				div_iframe.setAttribute('style',
					'margin-top:'+OBJECT_MT_TOOLS_LOCAL_STORAGE.IFRAME_OFFSET_TOP+'px !important;'
				);
				// This is a "top window" task.
				// When submitted, an alert appears. In "full-screen"
				// mode, move this alert to page bottom.
				var as = document.getElementsByClassName(class_success);
				if (as) {
					document.body.appendChild(as);
				}
			}
			
			// Move info bar to top.
			var detail = document.getElementsByClassName('container-fluid project-detail-bar'),
				timer, hd, rwd, aa;
			if (detail) {
				timer = detail[0].getElementsByClassName('completion-timer p-a-xs');
				if (timer && timer.length) {
					
				} else {
					timer = detail[0].getElementsByClassName('completion-timer');
				}
				// In order to not break timer, necessary to move
				// timer's parentNode.
				tools.add_item(timer[0].parentNode);
				hd = detail[0].getElementsByTagName('a');
				if (hd && hd[0].innerText.trim() == 'HIT Details') {
					tools.add_item(hd[0].parentNode);
				}
				rwd = detail[0].getElementsByClassName('detail-bar-label');
				if (rwd) {
					for (var i=0; i<rwd.length; i++) {
						console.log(rwd[i]);
						console.log(rwd[i].parentNode);
						if (rwd[i].innerText.trim() == 'Reward:' ||
							rwd[i].innerText.trim() == 'Reward' // Hm?
							) {
							// Copy text to menu.
							tools.add_item(document.createTextNode(rwd[i].parentNode.innerText.trim()));
							break;
						}
					}
				}
				//~ // globals.elements.chkbox_auto_accept
				//~ // Test:
				//~ // 		var x=document.createElement('input');
				//~ //		document.body.appendChild(x);
				//~ //		x.id='abc';
				//~ //		var y=document.createElement('label');
				//~ //		y.htmlFor = 'abc';
				//~ //		y.innerText = 'click';
				//~ //		document.body.appendChild(y);
				//~ var lbl_auto_accpt = document.createElement('label'),
					//~ chk_auto_accpt = document.createElement('input'),
					//~ spn_auto_accpt = document.createElement('span');
				//~ spn_auto_accpt.appendChild(chk_auto_accpt);
				//~ spn_auto_accpt.appendChild(lbl_auto_accpt);
				//~ chk_auto_accpt.id		= SCRIPT_NAME+'chk_auto_accpt';
				//~ chk_auto_accpt.type		= 'checkbox';
				//~ lbl_auto_accpt.htmlFor	= SCRIPT_NAME+'chk_auto_accpt';
				//~ lbl_auto_accpt.innerText= 'Auto-accept next HIT';
				//~ lbl_auto_accpt.style.cursor = 'pointer';
				//~ chk_auto_accpt.addEventListener('change', function() {
					//~ // Hide to avoid scrollIntoView
					//~ globals.elements.chkbox_auto_accept.style.display = 'none';
					//~ // Change checked status of auto accept.
					//~ globals.elements.chkbox_auto_accept.click();
					//~ // Un-Hide
					//~ globals.elements.chkbox_auto_accept.style.display = 'block';
				//~ }, false);
				//~ tools.add_item(spn_auto_accpt);
				
				// old
				aa = detail[0].getElementsByTagName('input');
				if (aa && aa[0].parentNode.innerText.trim() == 'Auto-accept next HIT') {
					// Just aa[0].parentNode is necessary in order
					// to move this element to the right place.
					// However, aa[0].parentNode.parentNode.parentNode
					// is necessary in order for the form to work
					// correctly.
					tools.add_item(aa[0].parentNode.parentNode.parentNode);
				}
			}
			
			GM_addStyle(
				'#'+SCRIPT_NAME+'div_tools div,  \
				 #'+SCRIPT_NAME+'div_tools span {\
				padding:0!important; padding-left:0!important; padding-right:0!important; padding-top:0!important; padding-bottom:0!important;\
			}');
			
			// Frame is altered. Display [x] to reset.
			var img_reset64;
			var u;
			img_reset64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAA\
				ACXBIWXMAAA3XAAAN1wFCKJt4AAAAB3RJTUUH3QoNFCY6xFM0FwAABcFJRE\
				FUOMtllVtsXEcZx39zbrveXV9ix971PZfacexEaZOQKgEpgobSxElT0pe0VaFCfkACRIVUygPpA0IginhoBYgqKu\
				KFtgj1oXVSgUQrFYqiVGqIi2O7qZMmqW9J9uaz5\
				+yey5wZHuyGUEb6NG+/+TT/b+YnWF9nR/oYn1vgtYKFX5RiYGy4RQp1iCR5TGu9y8xk+\
				9EaWfdvCCGmtBCvmJbzTnX2Izcf5PSX8Zgc6eHY3BIAAuDMSD9H5z4F4I2hQqeTa57Idvf9qLD/QEvH6A7s5la0UugwQDYa\
				+MtLVK/OU56ecoNS6eeqHpwen18sAUyO9HFsbgFxdqSf8XXomaGesUx///PdXzp4ZOCBryESSVytkHgesu6T\
				+D6x75E0GmgpUU1NVD65QvXKx2+GlfKzR2cX5gDObOtd6xhgcqhnR+vWod9vOnL0C1279xKVyyh\
				/Hbhe0q8j6z7S94m9GpHrIjJNRErhLi6ea5SKE8dmP53571VsKbRnBwZe3fLwiQfz9\
				+3WUbEopO+R+B5JvY5s1O+A47pP7LpE7iqx7xF5Hto0tdnTK\
				+q3br4V1GqPPzxzfdV4HrCac98s7Nv/YOfoDsLlJRGXi6gwwO4bRAtBXC4TrVaJVqsEy4toy6Tt4FeIG3Xqy0t4N66LxvVrpLsKRyzLeuJ1wPz\
				+2NaN2e7C60OPPJpOyiWkW0UnCueeYdLbtmO1d+BfnqVx7Rr1T65AKk3/\
				d39Ax1cPI9JNrM5cIvJqBOUSqe4etFL369bMaUMYPNS1a08bNZe4UkKWK5ideZzNW9Fo7O5eNowfJ7h9i0QrBn94iubdezEzGfq/MUH\
				+2CNIKdG2Q+niv0jlCxtNwSHL0MmJDZs2E926ifQ8pO8RfXgBs6sLZ9NWkigk1TvA5ud+inBS5HbuQiAw000U33uXpb\
				++hTIMtIbI98GyEUo9ain0mGlbxOUysrGeulej8YfTdJ58kvTQCJgm2bFdGI6NMC0MJ0Xp3HtcePrb1Fe\
				W0EIglUahiaMQpdWYYaUyvbruE1crxJUycaVC7K5Sm55i/sfPUL/\
				yMYbtYKQchJNC2A7V6Yt88J0J/OUlFAKpQGlFoiGqNzBsu8/\
				QKlHS94krJeJqhahaJrh1i7BUglQas7kF4TgI28Fw1g5w2jowWlpQiVrrVCuSdbA2BEJrZSRhsBj5HlGlQlStEJbLBMUidv8A9/ziBbIjowjHwXBSa7vt0LxthH0v\
				/5HcyCiJlOtQTaLAcBwSKRcMIcRMWKsRVYqElTJhqYjd08uWUz8jt/NehGVhpjO4s9PU5mY\
				/e6i0je1k7wu/JTc8TCwTEq2RCdipNAguGcIwXnNLRWQQElZXkWFA6xcP0rJ7L4ZtYzY1UfngPOefOsm5J05QfP\
				/8HXjnvgMUHniIREKSaKycg6kShGn9yXyyvW1ZRuFT2Z7eXOP6VZRh4l+7ikilad29h9v/ePdOUGG1yuLf\
				/kLr2A6yff38+8VfMfPSr4mCABlB34H9iEpxMVb6GXO0WA062zO+1dY+bqiEyHWJfJ/VSx/SWFlh\
				/ncv4i8uoIUgQRC6VVb++XeqV+eZeek31EsuWkNusEB7Po8q3X7ampo/L9Z\
				+tr4NqY4NL+e68l8PLn+kG8XbQgFSSpRhoMTdI6WQSYKMQRmgEmjqatfdO3YKUSn+WZWKE4fnb7omwKtlNzjZmr2ohbg\
				/1dPTq+KYoFpB2/bn5nQtfQUoQEbQPFCgsH27EJ57Lq653xufW1wGEHfb4+zo4JjVnPtlamPXYR3HlKYuEvoeCkj0eimQCVhZm\
				/x9e8g4DqpcfFM2vGfHp2/MAUyO9v6/mia39bSadvq43dH+k3S+e1AJQRyFBDUPrTVWNouVSmFpjVxZuR5Vy6dkFL5x\
				/PKS+z9q+rxMAR4DvnXvcGucyEMk8nGl9YjZlMlrrbUK6zfBmEUYr1ip9NvvX5hzn/vMQnfJ9D8JhDPTRZ/JowAAAABJRU5ErkJggg==';
			u = el({//original 24x24
				'create':'img',
				'style':'float:right;\
					width:20px;\
					height:20px;\
					margin-top:5px;\
					padding:0;\
					vertical-align:middle;\
					cursor:pointer;',
				'src':img_reset64,
				'id':SCRIPT_NAME+'btn_reset_once_iframe',
				'alt':'Move <iframe> job window to original location?',
				'title':'Move <iframe> job window to original location?'
			});
			u.onclick = function() {
				this.style.cursor = '';
				this.onclick = function() {
					return false;
				}
				var i = document.getElementsByName('HTMLQuestionIFrame');
				if (!i || !i.length) {
					i = document.getElementsByName('ExternalQuestionIFrame');
				}
				if (i[0]) {
					i[0].style.position = '';
					i[0].style.top = '';
				}
				// remove this
				this.parentNode.removeChild(this);
			}
			tools.insertBefore(u, tools.firstChild);
		}
	}
}
/**
 * Function applySettings
 * 
 */
function applySettings() {
	
	// Set an onchange for storage
	// of _alert_: 'OBJECT_MT_TOOLS_LOCAL_STORAGE_alert_' + SCRIPT_NAME
	//
	if  (
		OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_DISPLAY_ALERT ||
		OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_AUDIO_ALERT
		)
	{
		globals.original_title = document.title;
	}
	
	// Always set a local storage listener.
	window.addEventListener("storage", storage_events_listener, false);
	
	// Set a variable for CAPTCHA status. This is boolean.
	var captcha;
	
	/**
	 * Is Captcha present?
	 * Update storage, OBJECT_MT_TOOLS_LOCAL_STORAGE.CAPTCHA_IS_PRESENT
	 * 
	 * TODO: Because there is a CAPTCHA set up .emit and .sendRequest to 
	 * watch for when another tab solves the CAPTCHA.
	 */
	if (document.body.innerHTML.indexOf(globals.c_phrase) != -1) {
		captcha = true;
		if (!OBJECT_MT_TOOLS_LOCAL_STORAGE.CAPTCHA_IS_PRESENT) {
			
			// This tab contains the first instance of a CAPTCHA!
			// Set global var
			// Tab_id of tab w/first captcha. OBJECT_MT_TOOLS_LOCAL_STORAGE. ...
			
			// Set global var.
			OBJECT_MT_TOOLS_LOCAL_STORAGE.CAPTCHA_IS_PRESENT = true;
			
			// Save local
			saveLocalStorage();
			
			// This will fire an event in all other tabs.
			// But not this tab.
			// This will only fire once per CAPTCHA "session".
			localStorage['OBJECT_MT_TOOLS_LOCAL_STORAGE_alert_'+SCRIPT_NAME] = true;
			
			// So fire a faux event
			// This in turn runs events_listener_captcha()
			//
			storage_events_listener({key: 'OBJECT_MT_TOOLS_LOCAL_STORAGE_alert_' + SCRIPT_NAME});
			
		}
		// If localStorage .CAPTCHA_IS_PRESENT is true
		// then assume other tabs know of CAPTCHA.
		// However, for this current tab it needs to run
		// events_listener_captcha();
		// Like above... faux event.
		else {
			storage_events_listener({key: 'OBJECT_MT_TOOLS_LOCAL_STORAGE_alert_' + SCRIPT_NAME});
		}
	} else {
		captcha = false;
		if (OBJECT_MT_TOOLS_LOCAL_STORAGE.CAPTCHA_IS_PRESENT) {
			OBJECT_MT_TOOLS_LOCAL_STORAGE.CAPTCHA_IS_PRESENT = false;
			
			// Save local
			saveLocalStorage(); // Save
			
			// This will fire an event in all other tabs.
			// But not this tab.
			//
			localStorage['OBJECT_MT_TOOLS_LOCAL_STORAGE_alert_'+SCRIPT_NAME] = false; // This will only fire once per CAPTCHA "session".
			
			// So fire a faux event
			// This in turn runs events_listener_captcha()
			//
			storage_events_listener({key: 'OBJECT_MT_TOOLS_LOCAL_STORAGE_alert_' + SCRIPT_NAME});
			
		}
	}
	
	/**
	 * Iframe
	 * 
	 * Iframe z-index
	 * 		May 15, 2016
	 * 		Iframe z-index in Chrome must be 1 now. Otherwise,
	 * 		parts of the page sometimes appear above the iframe. 
	 * 
	 * Iframe selector
	 * 		January, 2018
	 * 		This changed from selecting the iframe via (HTMLQuestionIFrame
	 * 		or ExternalQuestionIFrame) to selecting the div containing 
	 * 		the iframe. The iframe selector is now
	 * 		"iframe.embed-responsive-item".
	 */
	var iframe = document.querySelector('iframe.embed-responsive-item');
	if (iframe) {
		modifyIframe(iframe);
	} else {
		// This is the "top window" type of task.
		// No iframe is used.
		modifyIframe(document.getElementById('MainContent'), true);
	}
	
	// IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT
	// Changed, jan2018
	if (OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT) {
		if (globals.elements.chkbox_auto_accept) {
			// enable
			// Set display to none to avoid scrollIntoView.
			// Then un-hide.
			//~ globals.elements.chkbox_auto_accept.style.display = 'none';
			if (!globals.elements.chkbox_auto_accept.checked)
				globals.elements.chkbox_auto_accept.click();
			setTimeout(function() {
				if (!globals.elements.chkbox_auto_accept.checked)
					globals.elements.chkbox_auto_accept.click();
				setTimeout(function() {
					if (!globals.elements.chkbox_auto_accept.checked)
						globals.elements.chkbox_auto_accept.click();
				}, 100);
			}, 100);
			//~ globals.elements.chkbox_auto_accept.style.display = 'block';
		}
		// Old
		//~ var i = globals.elements.chkbox_auto_accept;
		//~ if (i && i.innerText == 'Auto-accept next HIT') {
			//~ i = i.parentNode.querySelector('input');
			//~ if (i && i.type == 'checkbox' && !i.checked) {
				//~ // Emulate a click. Calling .checked is not enough.
				//~ // That is, "i.checked = true;" does not work.
				//~ // THIS DOES NOT WORK FOR TOP WINDOW JOBS.
				//~ // PROBABLY BECAUSE IT MOVES THE INPUT OUTSIDE
				//~ // OF THE SUBMIT FORM.
				//~ i.click();
			//~ }
		//~ }
	}
	
	// IS_ACTIVE_CAPTCHA_INPUT_FOCUS
	if (OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_INPUT_FOCUS) {
		if (captcha) {
			var i = document.getElementsByName("userCaptchaResponse")[0];
			if (i) {
				i.value = ''; // clear the previous try, if any
				i.focus();
				window.setTimeout(function(){document.getElementsByName("userCaptchaResponse")[0].focus();}, 400);
				window.setTimeout(function(){document.getElementsByName("userCaptchaResponse")[0].focus();}, 1000);
				window.setTimeout(function(){document.getElementsByName("userCaptchaResponse")[0].focus();}, 2000);
				window.setTimeout(function(){document.getElementsByName("userCaptchaResponse")[0].focus();}, 3000);
			}
		}
	}
	
	// IS_ACTIVE_RETURN_AND_ACCEPT (inside tools)
	if (OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_RETURN_AND_ACCEPT) {
		/**
		 * Job is returnable?
		 * Job is returnable if one of these two links are on the page.
		 */
		if  (
			/^https?:\/\/(www\.)mturk.com\/mturk\/continue\?/i.exec(document.location.href) ||
			/^https?:\/\/(www\.)mturk.com\/mturk\/return\?/i.exec(document.location.href) ||
			/^https?:\/\/(www\.)mturk.com\/mturk\/preview\?/i.exec(document.location.href)
			)
			return;
		// Return and accept
		// Return link and group id
		if  (
				!/<a href="\/mturk\/return\?/.exec(document.body.innerHTML) ||
				ih.indexOf('<input type="hidden" name="groupId" value="">') != -1 // Must have a group id
			)
		{	
			return;
		}
		
		/**
		 * RETURN_AND_ACCEPT button
		 * 
		 * 5 Sep 2014, cursor:pointer
		 */
		var u;
		u = el({
				'create':'input',
				'type':'button',
				'style':'\
					width:120px;\
					height:20px;\
					margin:0;\
					padding:0;\
					margin-left:4px;\
					border-top:0;\
					-moz-border-radius:0 0 4px 4px;\
					border-radius:0 0 4px 4px;\
					cursor:pointer;',
				'id':SCRIPT_NAME+'btn_raa',
				'value':'Return and Accept!'
		});
		tools.appendChild(u);
		u.onclick = function() {
			
			this.style.backgroundColor = 'LightGreen';
			this.value = 'Returning Job';
			
			var url_return_and_accept;
			var u = /<a href="\/mturk\/return\?[^"]+/.exec(document.body.innerHTML);
			if (!u)
				return;
			url_return_and_accept = u[0];
			url_return_and_accept = url_return_and_accept.replace('<a href="', 'https://www.mturk.com');
			url_return_and_accept = url_return_and_accept.replace(/&amp;/g, '&');
			
			/**
			 * 
			 * XHR request for Firefox & Chrome.
			 * Download and install.
			 * 
			 */
			/*
			 * CHROME
			 */
			if (!is_mozilla) {
				GM_xmlhttpRequest({
					method: 'GET',
					url: url_return_and_accept,
					onload: function (response) {
						return_accept();
					}
				});
			} 
			/*
			 * MOZILLA
			 */
			if (is_mozilla) {
				self.port.on('xhr_returnaccept', function() {
					return_accept();
				});
				self.port.emit('xhr_returnaccept', url_return_and_accept);
			}
			/*
			 * END MOZILLA
			 */
			
			function return_accept() {
				var u, return_link, gid;
				// status
				u = document.getElementById(SCRIPT_NAME+'btn_raa');
				u.value = 'Accepting New Job';
				// get new
				return_link = /<a href="\/mturk\/return\?([^"]+)/.exec(document.body.innerHTML);
				if (!return_link) return;
				return_link = return_link[1].replace(/&amp/g, '&');
				// Gid
				gid = /groupId=([^&]+)/.exec(return_link);
				if (gid) {
					window.location.href = 'https://www.mturk.com/mturk/previewandaccept?groupId='+gid[1];
					u.style.backgroundColor = 'MintCream';
				} else {
					u.value = 'Failed';
				}
			}
		}
	}
}


 
/**
 * function load
 * 
 * Initialize the script.
 * 
 * @global : tools = element
 */	
function load()
{
	/**
	 * When to run.
	 * The "tools" button and dialog is visible on all worker pages
	 * (worker.mturk.com).
	 * 
	 */
	 
	var u, t;
	
	/**
	 * Style for div_tools.
	 * Container for initial menu buttons.
	 * Update: Jan2018
	 * 		1) The z-index on the site requires at least 10000.
	 * 		Previously, it required only 100.
	 * 		2) Change from centered to showing on the right side of 
	 * 		page.
	 */
	GM_addStyle(
		'#'+SCRIPT_NAME+'div_tools {\
			position:absolute;\
			overflow:hidden;\
			top:0;\
			left:0;\
			width:100%;\
			padding:0;\
			z-index:10000;\
			text-align:right;\
			border-bottom:1px solid #aaccaa\
		}'
	);//background-color:#efefef;\
	
	/**
	 * Style for btn_show_menu.
	 * Click shows tools.
	 * Note: 60% of 45px is 27px.
	 */
	GM_addStyle(
		'#'+SCRIPT_NAME+'btn_show_menu {\
			float:right;\
			width:90px;\
			height:45px;\
			zoom:0.6;\
			margin:0;\
			padding:0;\
			border:0;\
			cursor:pointer;\
			background:url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAAAtCAYAAAAuj3x7AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4gEWAhQLZbLraQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAH20lEQVRo3u2ae4xUdxXHP/femZ3Z3e6T5bEPdpeHPKTQskADbaA0a2OoFSOxaqPG2qg1xGhiTKltDI2mqIkmjVGjsfiITRGstS1SU4S0IKLQZbtAKYXdLsu+2MfsY173fX8//9iXw8zA7iLE7cw3mT/mnPv75c73fuf8zrnnKFJKSRY3HWqWgizRWaKzyBKdJfqDBQmyB2F1ZIm+eTCBAYTtIIUkNnhhUquU6aV3JuABIrNUjA2Ohed6KKqC67oMDAwxMDDE7avr/1dEy1GCnZGPayE8DykyIw33hIfreiNhQFEAMAwT07IwTYtoLM6quo+kXe+bPMn6CNGuhWPbOI6Lbdt4XmaoWkqJoij4fBoArushhIeqqgQCOZiWdaOKFoABGEjbxDBMbNvGdT08zyOTCktFUVBVJcluWQ6h0ADtHd1s3fal6Sh6QsljJFumhe04ZGLlLqXE82QC6Z4nsCwLRVEoKMifStYxNBL0YTQe21mS05IucBx3RLE+H4qiTiV09I0KPQi4gMnfftbMsb19U76Zh39YTll1YPz7v/YO0vBKJOGaOx8oZOPnSye953NHT/L8idPXVE5ujp+S/FyqS4tZW1vJ/csXU5AbvO7erudxtPkSRy620dwTYlDXsR2PvECAgoCfgtwgVSWFLCgrpXZWCWtqKvCrKq7rEo/rdHb30NHRxVe+9vgkQocUoHiABbgIy0KImXPgCSBuO8Rth86hCMffb2f3PxrYseVeNi1ZkHZdx8AwO189RGtoKMkXsyxilsWVSIyLvSGgFYDffHEbtWUlOI7Edhxyg0Hmz6+casEiQLjYlo3neTP6bx63HZ7ef5jW/sGU/ohh8q0/HUhJ8nVOR4SQSCkJ5ORQXFRAIMc/jcNQSISUCJms6Kn+5W8mPr12JdvvWz+SATgu57r72HXgDUJxfeKnCMlLjef49kc3Jq1/4WQT/VE9wbbl9iV8sm4FFUUF+DSNUDTG6Y4e3rzYSsOlTqQykX1oPo1gMEBcFwyHozeSR88cBPw+6moqeOSeOn588FiC70JPf8o1Ry+0JXxfWTGXHVvuTbBVlRZTVVrMx+5YRvdwhN3HTqEooGkqqurH9ASGYRIORzKD6DHMLy1OznddN0XFJ+i+SoU1ZSXX3LuiuJDvPnjfxB6ewHU9DMPEcZzMeqnUORROspUXFSbZnBSVbePlLuKWPaVUz3VdhEj/SuIDR7TtujS1d/O746eSfFtWLkmyBf0+CoI5CbbucJTP/Xofvzpygqb2bgzbueH7mnboaHotQtNrkbT+xevz2PKNObeE3H0NZ9nXcPbaOf1dq9i8dGFK34aFNRx8tznBNmwY7Dl5hj0nz6BISe3sUlZVzWPDwmrWLahCU9VbQ/RMwrraSrbVrUjrf+SeOo63tBFLo1ypKFwKDXEpNMQrTeeZU5jP9s3r0z64jIrR/4232rr4wu59vNPVk/Zwe/azD1JdUjSp/foicZ5+9TAvv33u5iv6/zWP9oSgJxzlL43neLFxggjT8XjqpYPsfexhgimKisVzy/jto5/izQuXOPRuM2939GA6147Nvzxygvpliwj6fJkXOjRVpbKkiK/X383lwWHeausa94VNi7+fb+HjdyxPu7Z++SLqly/CE4Lm3hBnu3o51dbFycudiKsyCtPxaLzczd2LqjM7Rq+eX5lANEBL38CkH9iy8jksK5/DQ2tX0hOO8s09f6U3Gku4rjcaz8ZomaKnGTHMae01r6iAB1Kkh4HRjktGE93YfiXJVpqfl2R74s+vc/j8+3jXeUvZl0K9lcUFmZnejR2GLza8w6nLXUn+NbVVSbaW3hD/bm3np4cCbFq6gNXV5SydO5uSvFw0VaUvEuP1cxc5cDZxtCA/4GdlVfnMIPp6hQ/A+s8Us+4TxTdUsACsqJzLhoXz0/rDpsX+0++x//R7k7r3xzbdRcDvG++yZHzBArCmuoKdW+tRlOTmajDHB/HJ75WjaXx54zq23vnhzK4MNUUlL+CjoqiQpfNms3npQupqKtJe//tHH+LClX7OdPXS3BeiczBMXzROfHSswu/3URQIUF1Wwurqcu5f/iHmFt02pXtK7hnKHlA0QEXaBtFoDMMwEUKkVEOmQwiB7TjEYzq9ff20tLTx1e07Jpt1SEBgWyNPdGx4JIsUh68nsC0H07KuOUyUmmjh4RkGum7guu44ydkxg2Q1e8LDtm103cA0rbQpYlKMlo6LZVrE4jqO46CqKlLKhE54Vt0TIcMyLSzbxrJswuEI0asqx7REKzlVtJ5/A5/PR15e7nj3AEBVNcZew2Yy2WMkG4aJrhtEo3F03SAW13n8O89MPuuwbRspJbatYdk2mqrh9/tGw8cI05qmoihKRhEuhBjtD7qYljVOciQSZXBoOG1jNnXWMYp/HnkZIQS5wSDBYAC/34eqaUgh0TQVzaeNj69m1MFn25imhW07xOJxIpEYg4PD9PWH2PHkrqkTDfDH53/BrFklFBYW4Pf7EJ5A1VRy/H5UVcX1PMQMH66ZkqKlxHFcdF3HNG10XWc4HKW/P8QTT/1ginn0VXjhDz/ntvy80dlgH8FgDqqqYY0OYHtCZJSqVUXBcRzCkRiRSJRIJMrO7/1kGgVLGvxo15OUlhYTDASIxkbiku04ZBpUZeRsMi2L7z/z7A1UhlncnAeUpeDW4D8PYhJVO07q/QAAAABJRU5ErkJggg==\')\
		}'
	);
	
	/**
	 * Top of page container for tool buttons
	 */
	u = el({
		'create':'div',
		'id':SCRIPT_NAME+'div_tools'
	});
	document.body.appendChild(u);
	tools = document.getElementById(SCRIPT_NAME+'div_tools');
	// Tools.add_item()
	tools.add_item = function(html_element) {
		var u = el({
			'create':'div',
			'id':'', //border collapse
			'style':'float:right;\
				height:28px;\
				margin-left:-1px;\
				border-left: 1px solid #a0a0a0;\
				border-right:1px solid #a0a0a0;',
			'class':''
		});
		u.appendChild(html_element);
		// Add to tools div
		this.appendChild(u);
	}
	
	/**
	 * btn_show_menu
	 */
	u = el({
		'create':'input',
		'type':'button',
		'value':'', //FLBS
		'id':SCRIPT_NAME+'btn_show_menu'
	});
	tools.appendChild(u);
	u.onclick = function() {
		if (this.style.display != 'none') {
			this.style.display = 'none';
			showMenu();
		}
	}
	
	/**
	 * When to run.
	 * The application of tool settings only occurs on task pages,
	 * i.e. at pages matching https://worker.mturk.com/projects/.../tasks[...].
	 * 
	 * Add if necessary:
	 * 		On continue task.
	 * 		On no more tasks.
	 * 			- There are currently no HITs assigned to you.
	 * 			- There are no more available HITs in this group. See more HITs available to you below.
	 * 		On logged out.
	 * 
	 */
	if  (
		//~ /<tr>[\r\n\t\s]+<td class="title_orange_text_bold">[\r\n\t\s]+All HITs( Available to You|)[\r\n\t\s]+&nbsp;&nbsp;[\r\n\t\s]+<\/td>[\r\n\t\s]+<\/tr>[\r\n\t\s]+<tr>[\r\n\t\s]+<td class="title_orange_text" style="white-space: nowrap; padding-top: 1ex;">[\r\n\t\s]+1-10 of \d+ Results/.exec(document.body.innerHTML)
		!/^https:\/\/worker\.mturk\.com\/projects\/[A-Z0-9]+\/tasks/.exec(document.location.href)
		)
	{
		return;
	}
	
	/**
	 * Apply tool settings
	 * 
	 */
	applySettings();
}

/**
 * Audio snippets
 */
function audio_snippets_data(return_index, return_snippet) {
	
	//Creative Commons 0 License
	//Creative Commons Sampling+ License
	//Creative Commons Attribution License

	var as;
	
	as = [
		{
			'title':'Bells 1',
			'source':'http://www.freesound.org/people/marcolo91/sounds/156090/',
			'license':'Creative Commons 0',
			'id':'156090__marcolo91__bell-in-catalunya-square-barcelona.ogg',
			'otitle':'Bell in Catalunya square (Barcelona).wav'
		},
		{
			'title':'Bells 2',
			'source':'http://www.freesound.org/people/anamorphosis/sounds/24624/',
			'license':'Creative Commons Sampling+',
			'id':'24624__anamorphosis__gmb-kantilan-4.ogg',
			'otitle':'GMB Kantilan 4.wav'
		},
		{
			'title':'Bells 3',
			'source':'http://www.freesound.org/people/Jovica/sounds/15076/',
			'license':'Creative Commons Attribution',
			'id':'15076__jovica__little-bell-c1.ogg',
			'otitle':'little bell C1.wav'
		},
		{
			'title':'Bells 4',
			'source':'http://www.freesound.org/people/beskhu/sounds/70668/',
			'license':'Creative Commons Attribution',
			'id':'70668__beskhu__sanzanais-79-g4-doux-a.ogg',
			'otitle':'SanzAnais 79 G4 -doux a.aif'
		},
		{
			'title':'Bells 5',
			'source':'http://www.freesound.org/people/frankd/sounds/127583/',
			'license':'Creative Commons 0',
			'id':'127583__frankd__analysis-bell01.ogg',
			'otitle':'Analysis-bell01.aiff'
		},
		{
			'title':'Bells 6',
			'source':'http://www.freesound.org/people/dADDoiT/sounds/57070/',
			'license':'Creative Commons 0',
			'id':'57070__daddoit__sorana-bells-uno-casa.ogg',
			'otitle':'sorana bells_uno_casa.wav'
		},
		{
			'title':'Bells 7',
			'source':'http://www.freesound.org/people/Yoram/sounds/172550/',
			'license':'Creative Commons Attribution',
			'id':'172550__yoram__church-bell.ogg',
			'otitle':'church bell.wav'
		}
	];
	
	if (return_index) {
		return as;
	}
	else {
		
		return 'audio/' + as[return_snippet].id
		
	}
}

/**
 * Check for page load and then continue.
 */
var ih = '';
if (document.readyState == "complete" || document.readyState == "interactive") {
	ih = document.body.innerHTML;
	load();
}
else {
	document.onreadystatechange = function () {
		if (document.readyState == "complete" || document.readyState == "interactive") {
			ih = document.body.innerHTML;
			load();
		}
	}
}













