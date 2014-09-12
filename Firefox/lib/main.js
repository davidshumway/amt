// ==UserScript==
// @name			Tools for Amazon's Mechanical Turk
// @description		Adds a menu with various tools for Workers.
// @author			David Shumway
// @include			https://www.mturk.com/mturk/preview?*
// @include			https://www.mturk.com/mturk/previewandaccept?*
// @include			https://www.mturk.com/mturk/continue?*
// @include			https://www.mturk.com/mturk/accept?*
// @include			https://www.mturk.com/mturk/submit
// @include			https://www.mturk.com/mturk/return*
// @include			http://pastebin.com/raw.php?i=14R5zCYR
// @grant			GM_getValue
// @grant			GM_setValue
// @grant			GM_deleteValue
// @grant			GM_addStyle
// @grant			GM_xmlhttpRequest
// ==/UserScript==

/*
 * Copyright David Shumway 2013. All Rights Reserved. 
 * davidshumway@gmail.com
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
/* End GM fix
 */

/**
 * Global variables
 * 
 */
//
var SCRIPT_NAME		= 'e3DbjxI0oLqiV6emR9bnWz2pXdibP5usIne0MlOc7mD';
// This is the exernal URL of high def. audio snippets. If user opts to install this, the URL is...
var URL_PASTEBIN	= 'http://pastebin.com/raw.php?i=14R5zCYR'; //481.88 KB
//
var OBJECT_MT_TOOLS_LOCAL_STORAGE;
//
var audio_snippets;

// is_mozilla
var is_mozilla = true;

// This is the tools div.
// 		'create':'div',
//		'id':SCRIPT_NAME+'div_tools'
var tools;

// This is a global vars object.
//
//
var globals = {
	original_title: null, // This is what the title is before changing to "CAPTCHA" (if CAPTCHA notification is turned on).
	c_phrase: 'In order to accept your next HIT, please type this word into the text box below' // Shows on pages where there is a CAPTCHA
}

/**
 * OBJECT_MT_TOOLS_LOCAL_STORAGE
 * 
 */
if (GM_getValue('OBJECT_MT_TOOLS_LOCAL_STORAGE'+SCRIPT_NAME) != null) {
	
	OBJECT_MT_TOOLS_LOCAL_STORAGE = GM_getValue('OBJECT_MT_TOOLS_LOCAL_STORAGE'+SCRIPT_NAME);
	OBJECT_MT_TOOLS_LOCAL_STORAGE = JSON.parse(OBJECT_MT_TOOLS_LOCAL_STORAGE);
	
	// sanitize settings
	OBJECT_MT_TOOLS_LOCAL_STORAGE = sanitize(OBJECT_MT_TOOLS_LOCAL_STORAGE);
	
} else {
	
	initial_tool_settings();
	
}

/**
 * General Functions
 * 
 */

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
	
	//~ console.log('run initial_tool_settings');
	
	OBJECT_MT_TOOLS_LOCAL_STORAGE = {
		
		'IS_ACTIVE_IFRAME_HEIGHT': false,
		
		'IS_ACTIVE_IFRAME_WIDTH': false,
		
		'IS_ACTIVE_IFRAME_OFFSET': false,
		
		'IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT': false,
		
		'IS_ACTIVE_CAPTCHA_INPUT_FOCUS': false,
		
		'IS_ACTIVE_CAPTCHA_DISPLAY_ALERT': false,
		
		'IS_ACTIVE_CAPTCHA_AUDIO_ALERT': false,
		
		'IS_ACTIVE_RETURN_AND_ACCEPT': false,
		
		'IFRAME_HEIGHT': 6000, // Change to 6000, 5 Sep 2014, 'IFRAME_HEIGHT': 3000,
		
		'IFRAME_OFFSET_TOP': 200,
		
		'CAPTCHA_AUDIO_SNIPPET': 0,
		
		'CAPTCHA_USING_HI_DEF': false,
		
		'CAPTCHA_IS_PRESENT': false,
		
		'DATE_CAPTCHA_AUDIO_PLAYED': 0
		
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
// global var
var INTV_blink__sr_status = true;
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
		if (i == 'create') continue;
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
		//container_div.appendChild(document.createTextNode(' '+audio_snippets[x].license));
		
		// embedded size
		y = audio_snippets_data(false, x*1);
		container_div.appendChild(document.createTextNode(' '+(y.length / 1000)+'KB'));
	}
}
 
/**
 * Function play_audio
 */
function play_audio(number) {
	if (document.getElementById(SCRIPT_NAME+'caa'))
		document.body.removeChild(document.getElementById(SCRIPT_NAME+'caa'));
	if (document.getElementById(SCRIPT_NAME+'caa_test'))
		document.body.removeChild(document.getElementById(SCRIPT_NAME+'caa_test'));
	
	// play number or rand.
	var x;
	var div_istest;
	x = number;
	if (x == 'local') { // selected in current local storage
		console.log(x);
		x = OBJECT_MT_TOOLS_LOCAL_STORAGE.CAPTCHA_AUDIO_SNIPPET;
		div_istest = '';
	} else { // selected but not saved
		// change div name
		div_istest = '_test';
	}
	
	if (x == 'Random')
		x = Math.floor(Math.random()*7); //0..6

	b64_audio = audio_snippets_data(false, x*1);
							
	// play alert
	//i.e. <audio controls src = "data:audio/mp3;base64,T2dn....3KcK" />
	caa = el({ // z-index:1010 puts it on top of divs dimmer & menu
			'create':'audio',
			'style':'\
					position:fixed;\
					top:0px;\
					left:110px;\
					width:200px;\
					text-align:center;\
					z-index:1010;\
					background-color:MistyRose;\
					border:2px solid LightCoral;\
					border-top:0;',
			'id':SCRIPT_NAME+'caa'+div_istest,
			'controls':'',
			'src':b64_audio
	});
	document.body.appendChild(caa);
	document.getElementById(SCRIPT_NAME+'caa'+div_istest).play();
}
 
/**
 * Function sanitize settings object
 */
function sanitize(obj) {
	if (!obj.hasOwnProperty('IS_ACTIVE_IFRAME_HEIGHT')) {
		obj.IS_ACTIVE_IFRAME_HEIGHT = false;
	}
	if (!obj.hasOwnProperty('IS_ACTIVE_IFRAME_WIDTH')) {
		obj.IS_ACTIVE_IFRAME_WIDTH = false;
	}
	if (!obj.hasOwnProperty('IS_ACTIVE_IFRAME_OFFSET')) {
		obj.IS_ACTIVE_IFRAME_OFFSET = false;
	}
	if (!obj.hasOwnProperty('IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT')) {
		obj.IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT = false;
	}
	if (!obj.hasOwnProperty('IS_ACTIVE_CAPTCHA_INPUT_FOCUS')) {
		obj.IS_ACTIVE_CAPTCHA_INPUT_FOCUS = false;
	}
	if (!obj.hasOwnProperty('IS_ACTIVE_CAPTCHA_DISPLAY_ALERT')) {
		obj.IS_ACTIVE_CAPTCHA_DISPLAY_ALERT = false;
	}
	if (!obj.hasOwnProperty('IS_ACTIVE_CAPTCHA_AUDIO_ALERT')) {
		obj.IS_ACTIVE_CAPTCHA_AUDIO_ALERT = false;
	}
	if (!obj.hasOwnProperty('IS_ACTIVE_RETURN_AND_ACCEPT')) {
		obj.IS_ACTIVE_RETURN_AND_ACCEPT = false;
	}
	if (!obj.hasOwnProperty('IFRAME_HEIGHT')) {
		obj.IFRAME_HEIGHT = 6000;
	}
	if (!obj.hasOwnProperty('IFRAME_OFFSET_TOP')) {
		obj.IFRAME_OFFSET_TOP = 200;
	}
	if (!obj.hasOwnProperty('CAPTCHA_AUDIO_SNIPPET')) {
		obj.CAPTCHA_AUDIO_SNIPPET = 'Random';
	}
	if (!obj.hasOwnProperty('CAPTCHA_USING_HI_DEF')) {
		obj.CAPTCHA_USING_HI_DEF = false;
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
 * 
 * If key == 13 then save the form
 * and hide/exit the menu.
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
function stopAcceptingJobs_run() {//alert('a');
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
 * function stopAcceptingJobs_init
 */
function stopAcceptingJobs_init() {
	//~ console.log('stopAcceptingJobs ran');
	
	// Chrome
	//
	//
	if (!is_mozilla) {
		chrome.extension.sendRequest(
			{
				stopAcceptingNextJobs:true
			}, function(rs) {/**Squelch Rs*/}
		);
	}
	
	//~ // Firefox
	//~ //
	//~ //
	//~ if (is_mozilla) {
		//~ stopAcceptingJobs_run();
		//~ 
		// Update storage key.
		// Just the change event is required.
		// This runs twice which is unnecessary. Once is enough.
		//localStorage['OBJECT_MT_TOOLS_LOCAL_STORAGE_reset_accpt_'+SCRIPT_NAME] = true;
		//localStorage['OBJECT_MT_TOOLS_LOCAL_STORAGE_reset_accpt_'+SCRIPT_NAME] = false;
		//~ 
		//~ console.log('emit');
		//~ self.port.emit("doNotAcceptNextTab", true);
	//~ }
}
/**
 * function stopAcceptingJobs_eventListener
 */
function stopAcceptingJobs_eventListener() { 
		/**
		 * Add event-listener for unchecking automatically accept next job textboxes
		 * 
		 */
		// Chrome
		if (!is_mozilla) {
			chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
				if(request.doNotAcceptNextTab) {
					
					stopAcceptingJobs_run();
					
				}
			});
		}
		// Firefox
		if (is_mozilla) {
			self.port.on('doNotAcceptNextTab', function(responseText) {
				console.log('listener:doNotAcceptNextTab');
				stopAcceptingJobs_run();
			});
		}
	}
/*
 * End General Functions 
 */



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
		document.getElementById(SCRIPT_NAME+'btn_show_menu').style.display = 'inline';
}

/**
 * Function showMenu
 * 
 */
function showMenu() {
	
	// Some vars for scope of this function only.
	var t;
	var theMenu;
	var u;
	var u2;
	var u3;
	var x;
	var img_info64;
	
	// info image
	// size of original image is 20x20
	img_info64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAA3XAAAN1wFCKJt4AAAAB3RJTUUH3QgNExsG/ltFywAAA2BJREFUOMuV1MtvG0UcB/Dv7qw3rV+JncSWDaVJ7TxKGtuVoZAWtaUgHofSWpQ4cENphJT8OVS5NBEHJEDgSpBgVYhjKY8k8iG0ipLm2bgmlhXFa6937X3McHBrJyF2y0ijOczMR9+RfvPj8JzhHZt8d6jvxFcC4ci9B1tfZKcnZpudJ802PaOT12+8NTDzwYVIW9cJn8NjF0c23K+tlVLJxf8NekYnr392JZyInukjadlArmSg3d3GBdqtsTVXtCFKGmGfXgklQv09ZFs2UKqYkDUDWVmD1W7jTnvtsUZJyVHYyNuhxEBfD3lc0CFrJuSKUZ2aiUxRQ8txKxfxO2Ob7a//ByWHseHLg4n+3h6yWdAhP00WdLVg+EwHftvII1cqYykro0xE7kKXK7bdee4AWgO9N29d++Ry6E5vMEg2JR2yZqCkVZMRDuiwWvD93ztY31VQrOjISGVAFLmLgfZYuvONGkqeYR9fDN8JBgJkQ9Jrz5MrJmwWDgIPrO8quL+5B5OaYJSCMRPZYhnMYuEuBTpiaU8V5byjt965cSly9+SpbsuGpEPVDCi6CaViQNENnGxtwUf9bkR8dkS//AO6YYKxZygFoyYGvXZEWnnzp9+XYsL5ge5vuk91W5b3NCiaAUUzn64GVM3AL9kiRJ4i6nfUktUxCjCKxUweVsFFzgZ9XwsEEIqaCUnVq8n2YZKqoVTRQCkF4bkaUsfquFrR4BCIwN9b2vo8vb5m+mw8CqqOQllDQdUgqRokVQdjFBwYCA8wah6JRf1OvOoU2NxyeozP3h6fmflr6WrxyZbe5RRQUHVIZR2SqsOkBhitgsK+hIexfjuhP8+vDGenJr7lASB3e/zu7PzyNexmjF6XCLlcxxijsIsEhOPgPi4cic3Or8RzUxOJA3WopJKrGf+bCwMdx+Jul4PfzpfBGMXV052Ih32gjGHQ58TDf/LYLZXr2Nyjkdx0FQMA7vDX6xyb/PC9s8GZHLEL97fyYMwE9pXIgWRzj0Zy0+M/NP3LSiq5uuMfWgh57HFXm43f3lNeGGvYbZRUcnXnpaGFsNcRd7fa+Md7pRfCmvbDKnp+4dzLrrjNdoz32ESE20T6458rDbHndmwllVx94ht68IpDfN8BQ/91cfNmbmr8u2Z3/gVFGDS1XwxhOQAAAABJRU5ErkJggg==';
	
	// audio snippets
	audio_snippets = audio_snippets_data(true, false);
	
	/**
	 * Styles
	 * Only add these style when the user clicks the "tools" button,
	 * when the user wants to see the tools menu.
	 */
	// m1
	GM_addStyle(
		'.'+SCRIPT_NAME+'m1 {\
			float:left;\
			width:20%;\
			height:22px;\
			padding:2px 0 2px;\
			text-align:center;\
			cursor:pointer;\
			overflow:hidden;\
		}'
	);
		//padding-top:4px;height:22px;\
		//padding-bottom:4px;
	// m2
	GM_addStyle(
		'.'+SCRIPT_NAME+'m2 {\
			float:block;\
			width:80%;\
			height:18px;\
			padding:6px 0 2px;\
			text-align:left;\
			cursor:pointer;\
			overflow:hidden;\
		}'
	);
	// m2 buttons, move upward, margin-top
	GM_addStyle(
		'.'+SCRIPT_NAME+'m2 > input[type="button"] {\
			margin-top:-2px;\
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
	// 5 Sep 2014, Increase height 480 to 540
	GM_addStyle(
		'#'+SCRIPT_NAME+'menu_div {\
			position:absolute;\
			top:8px;\
			left:50%;\
			margin-left:-280px;\
			width:560px;\
			height:540px;\
			padding:0px 8px 0px 8px;\
			z-index:1001;\
			background-color:#fcfefc;\
			-moz-border-radius:4px;\
			border-radius:4px;\
			border:1px solid #444;\
		}'
	);
	// dimmer
	// 5 Sep 2014 Add cursor:pointer;
	GM_addStyle( // dimmer
		'#'+SCRIPT_NAME+'menu_div_dim {\
			position:fixed;\
			top:0;\
			left:0;\
			width:100%;\
			height:100%;\
			z-index:1000;\
			background-color:#000;\
			opacity:0.4;\
			filter:alpha(opacity=40);\
			\
			cursor:pointer;\
		}'
	);
	// div_info
	GM_addStyle( // hover div for info
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
		}'// ** z-index on top of menu_status
	);
	// menu_status
	GM_addStyle( // menu status
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
		//width:100%;margin-left:-2px;
	// img_info
	GM_addStyle( // image for info
		'.'+SCRIPT_NAME+'img_info {\
			height:10px;\
			margin-left:10px;\
		}'
	);
	// Menu fader
	// xx
	
	/**
	 * Div containers
	 */
	/**
	 * Background dimmer
	 */
	u = el({
			'create':'div',
			'id':SCRIPT_NAME+'menu_div_dim'
	});
	document.body.appendChild(u);
	u.addEventListener('click', function() {
		hideMenu();
	}, false);
	
	/**
	 * Menu div
	 */
	u = el({
			'create':'div',
			'id':SCRIPT_NAME+'menu_div'
	});
	document.body.appendChild(u);
	theMenu = document.getElementById(SCRIPT_NAME+'menu_div');
	
	
	/**
	 * Menu items
	 *
	 */
	/**
	 * Menu title
	 * 
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
	 * Modify height of job window?
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
	u2 = 'Modify height of job window?';
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
	u2 = 'Height of job window (in pixels).';
	u.appendChild(document.createTextNode(u2));
	u2 = el({
			'create':'img',
			'src':img_info64,
			'class':SCRIPT_NAME+'img_info',
			'alt':'Height of the job window. Value is in pixels. Minimum value 0. No maximum value. Default size is approximately 400 pixels.'
	});
	u.appendChild(u2);
	theMenu.appendChild(u);
	u = el({
			'create':'hr',
	});
	theMenu.appendChild(u);
	
	/**
	 * Maximize width of job window?
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
	u2 = 'Maximize width of job window?';
	u.appendChild(document.createTextNode(u2));
	theMenu.appendChild(u);
	u = el({
			'create':'hr',
	});
	theMenu.appendChild(u);
	
	/**
	 * Modify vertical position of job window?
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
	u2 = 'Modify vertical position of job window?';
	u.appendChild(document.createTextNode(u2));
	theMenu.appendChild(u);
	/*u = el({
			'create':'br',
			'style':'clear:both;'
	});
	theMenu.appendChild(u);*/
	
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
	u2 = 'Distance of job window from top of page (in pixels).';
	u.appendChild(document.createTextNode(u2));
	u2 = el({
			'create':'img',
			'src':img_info64,
			'class':SCRIPT_NAME+'img_info',
			'alt':'Distance of job window from top of page. Value is in pixels. Minimum value 0. No maximum value. Default distance is approximately 300 pixels.'
	});
	u.appendChild(u2);
	theMenu.appendChild(u);
	u = el({
			'create':'hr',
	});
	theMenu.appendChild(u);
	
	/**
	 * Always auto-accept next job?
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
	u2 = '"Automatically accept the next HIT" checkbox always enabled?';
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
		//~ 'style':'margin:auto;display:block;',
		'id':SCRIPT_NAME+'turn_off_auto_accept',
		'value':'Disable "Automatically accept the next HIT" in all tabs and windows'
		//~ 'value':'Uncheck Auto-Accept Checkboxes'
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
	
	//~ u = el({
			//~ 'create':'hr',
	//~ });
	//~ theMenu.appendChild(u);
	
	/*
	 * 
	 * When a CAPTCHA appears, place cursor in the CAPTCHA box?
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
	u2 = 'When a CAPTCHA appears, place cursor in the CAPTCHA box?';
	u.appendChild(document.createTextNode(u2));
	u2 = el({
			'create':'img',
			'src':img_info64,
			'class':SCRIPT_NAME+'img_info',
			'alt':'When a CAPTCHA appears, place cursor in the CAPTCHA box? In addition, if previous CAPTCHA was entered incorrectly, this tool will clear the text from the previous try.'
	});
	u.appendChild(u2);
	theMenu.appendChild(u);
	/*u = el({
			'create':'br',
			'style':'clear:both;'
	});
	theMenu.appendChild(u);*/
	
	/*
	 * 
	 * Display a red alert box when a CAPTCHA appears?
	 * 
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
	u2 = 'When a CAPTCHA appears, display red alert icon on all pages?';
	u.appendChild(document.createTextNode(u2));
	u2 = el({
			'create':'img',
			'src':img_info64,
			'class':SCRIPT_NAME+'img_info',
			'alt':'When a CAPTCHA appears, display red alert icon on all pages? In addition, this tool will change document title to "CAPTCHA".'
	});
	u.appendChild(u2);
	theMenu.appendChild(u);
	/*u = el({
			'create':'br',
			'style':'clear:both;'
	});
	theMenu.appendChild(u);*/
	
	/*
	 * 
	 * Play audio sound the first time a CAPTCHA appears?
	 * 
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
	u2 = 'When a CAPTCHA appears, play an audio sound?';
	u.appendChild(document.createTextNode(u2));
	u2 = el({
			'create':'img',
			'src':img_info64,
			'class':SCRIPT_NAME+'img_info',
			'alt':'When a CAPTCHA appears, play an audio sound? Audio snippet will be played once within a span of 60 seconds. Does not play on reload of the browser window or in any other tabs if less than 60 seconds has elapsed. In addition, this tool will change document title to "CAPTCHA".'
	});
	u.appendChild(u2);
	theMenu.appendChild(u);
	/*u = el({
			'create':'br',
			'style':'clear:both;'
	});
	theMenu.appendChild(u);*/
	
	/*
	 * 
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
			'alt':'Select an audio snippet. Audio snippets are embedded within extension. None of the audio is downloaded externally. Provided links are where the audio was originally downloaded. Applicable licenses at time of download were CC-0, CC-Sampling+, and CC-Attribution.'
	});
	u.appendChild(u2);
	theMenu.appendChild(u);
	/*u = el({
			'create':'br',
			'style':'clear:both;'
	});
	theMenu.appendChild(u);*/
	
	/*
	 * 
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
	/*u = el({
			'create':'br',
			'style':'clear:both;'
	});
	theMenu.appendChild(u);*/
	
	/*
	 * 
	 * Audio snippet lo/hi def
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
			'class':SCRIPT_NAME+'m2'
	});
	if (OBJECT_MT_TOOLS_LOCAL_STORAGE.CAPTCHA_USING_HI_DEF) {
		u2 = el({
				'create':'input',
				'type':'button',
				'id':SCRIPT_NAME+'audio_hi_def_remove',
				'value':'Remove High Definition Audio'
		});
		u.appendChild(u2);
		u2 = el({
				'create':'img',
				'src':img_info64,
				'class':SCRIPT_NAME+'img_info',
				'alt':'Remove High Definition Audio. Will use the low definition audio and will delete the installed high definition audio. After deletion there is the option to re-download and install high definition audio.'
		});
		u.appendChild(u2);
	} else {
		u2 = el({
				'create':'input',
				'type':'button',
				'id':SCRIPT_NAME+'audio_hi_def_install',
				'value':'Download and Install High Definition Audio (490.94 KB)'
		});
		u.appendChild(u2);
		u2 = el({
				'create':'img',
				'src':img_info64,
				'class':SCRIPT_NAME+'img_info',
				'alt':'Download and Install High Definition Audio (490.94 KB). Same set of audio snippets as low definition but of a higher quality. Audio data is retrieved from pastebin.com, http://pastebin.com/14R5zCYR. High definition audio may be removed afterwards, if desired.'
		});
		u.appendChild(u2);
		u2 = el({
				'create':'a',
				'href':'http://pastebin.com/14R5zCYR',
				'style':'margin-left:10px;',
				'target':'_blank',
				'alt':'Preview audio download.'
		});
		u2.appendChild(document.createTextNode('[ ^ ]'));
		u.appendChild(u2);
	}
	theMenu.appendChild(u);
	u = el({
			'create':'hr',
	});
	theMenu.appendChild(u);
	
	/**
	 * Display the "Return and Accept" button?
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
	u2 = 'Display "Return and Accept" button?';
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
	
	/**
	 * Info
	 * 
	 */
	theMenu.appendChild(document.createElement('br'));
	theMenu.appendChild(document.createTextNode(' * Refresh the page after saving settings to see changes.'));
	
	/**
	 * Hidden div for extra info
	 * 
	 */
	u = el({
		'create':'div',
		'id':SCRIPT_NAME+'div_info'
	});
	theMenu.appendChild(u);
	
	/**
	 * Menu status div
	 * 
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
		'style':'width:60%;margin-left:20%;overflow:hidden;',
	});
	u.appendChild(u_);
	//S/E
	u3 = el({
		'create':'div',
		'style':'float:left;width:50%;',
	});
	//Save
	u2 = el({
		'create':'input',
		'type':'button',
		'id':SCRIPT_NAME+'save',
		'style':'width:50%;',
		'value':'Save Settings'
	});
	u3.appendChild(u2);
	//Exit
	u2 = el({
		'create':'input',
		'type':'button',
		'id':SCRIPT_NAME+'exit',
		'value':'Exit Menu'
	});
	u3.appendChild(u2);
	u_.appendChild(u3);
	//E/D
	u3 = el({
		'create':'div',
		'style':'float:block;overflow:hidden;', // hidden
	});
	//Enable
	u2 = el({
		'create':'input',
		'type':'button',
		'id':SCRIPT_NAME+'reset_enable',
		'value':'Enable All'
	});
	u3.appendChild(u2);
	
	//Disable
	u2 = el({
		'create':'input',
		'type':'button',
		'id':SCRIPT_NAME+'reset_disable',
		'value':'Disable All'
	});
	u3.appendChild(u2);
	u_.appendChild(u3);
	//all to menu
	theMenu.appendChild(u);
	
	/**
	 * Copy
	 * 
	 */
	theMenu.appendChild(document.createTextNode('© 2013 '));
	u = el({
		'create':'a',
		'style':'font-weight:bold;',
		//'href':'https://sites.google.com/site/davidshumway/',
		'href':'https://their.github.com/amt',
		'target':'_blank'
	});
	u2 = 'David Shumway';
	u.appendChild(document.createTextNode(u2));
	theMenu.appendChild(u);
	theMenu.appendChild(document.createTextNode(' and FLBS.'));
	
	/**
	 * Apply menu item actions 
	 * 
	 */
	showMenu_applyActions();
}
/**
 * Function showMenu_applyActions
 * 
 */
function showMenu_applyActions() {
	
	var u;
	var x;
	
	/*
	 * 
	 * IFRAME_HEIGHT/IFRAME_OFFSET_TOP
	 * 
	 */
	u = document.getElementById(SCRIPT_NAME+'IFRAME_HEIGHT');
	x = (OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_HEIGHT) ? false : true;
	u.disabled = x;
	if (x)
		u.style.backgroundColor = '#ddd';
	u = document.getElementById(SCRIPT_NAME+'IFRAME_OFFSET_TOP');
	x = (OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_OFFSET) ? false : true;
	u.disabled = x;
	if (x)
		u.style.backgroundColor = '#ddd';
		
	/*
	 * 
	 * IS_ACTIVE_IFRAME_HEIGHT
	 * 
	 */
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_IFRAME_HEIGHT');
	u.onchange = function() {
		var u;
		u = document.getElementById(SCRIPT_NAME+'IFRAME_HEIGHT');
		if (this.checked) {
			u.disabled = false;
			u.style.backgroundColor = '#fff';
		} else {
			u.disabled = true;
			u.style.backgroundColor = '#ddd';
		}
	}
	
	/*
	 * 
	 * IS_ACTIVE_IFRAME_OFFSET
	 * 
	 */
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_IFRAME_OFFSET');
	u.onchange = function() {
		var u;
		u = document.getElementById(SCRIPT_NAME+'IFRAME_OFFSET_TOP');
		if (this.checked) {
			u.disabled = false;
			u.style.backgroundColor = '#fff';
		} else {
			u.disabled = true;
			u.style.backgroundColor = '#ddd';
		}
	}	
	
	/*
	 * 
	 * IS_ACTIVE_ checkboxes
	 * 
	 */
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_IFRAME_HEIGHT');
	u.checked = OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_HEIGHT;
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_IFRAME_WIDTH');
	u.checked = OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_WIDTH;
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_IFRAME_OFFSET');
	u.checked = OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_OFFSET;
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT');
	u.checked = OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT;
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_CAPTCHA_INPUT_FOCUS');
	u.checked = OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_INPUT_FOCUS;
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_CAPTCHA_DISPLAY_ALERT');
	u.checked = OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_DISPLAY_ALERT;
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_CAPTCHA_AUDIO_ALERT');
	u.checked = OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_AUDIO_ALERT;
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_RETURN_AND_ACCEPT');
	u.checked = OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_RETURN_AND_ACCEPT;
	
	/*
	 * 
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
		u[i].onclick = function(e) { e.stopPropagation(); };
	}
	
	/*
	 * 
	 * Labels for menu items
	 * 
	 */
	u = document.getElementsByClassName(SCRIPT_NAME+'m1'); // m1 (left)
	for (var i in u) {
		u[i].onmouseover = function() {
			var u;
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
	//OLD//u = document.querySelectorAll('.'+SCRIPT_NAME+'m2, .'+SCRIPT_NAME+'m2-short'); // m2 & m2-short
	
	/*
	 * 
	 * Audio snippet info
	 * 
	 */
	document.getElementById(SCRIPT_NAME+'CAPTCHA_AUDIO_SNIPPET').onchange = function() {
		var x;
		x = document.getElementById(SCRIPT_NAME+'info_audio');
		x.innerHTML = '';
		fill_audio_info(x, this.value);
		// play audio test
		play_audio(this.value); // Random or 0..6
	}
	
	/*
	 * 
	 * Audio snippet hi def. remove
	 * 
	 */
	if (document.getElementById(SCRIPT_NAME+'audio_hi_def_remove')) {
		document.getElementById(SCRIPT_NAME+'audio_hi_def_remove').onclick = function() {
			
			this.value = 'Removing ...';
			
			// disable
			this.disabled = true;
			document.getElementById(SCRIPT_NAME+'audio_hi_def_remove').onclick = function() {};
			
			GM_setValue('OBJECT_MT_TOOLS_LOCAL_STORAGE_HI_DEF_AUDIO' + SCRIPT_NAME, '');

			window.setTimeout(function() {
				var u;
				u = document.getElementById(SCRIPT_NAME+'audio_hi_def_remove');
				if (u) {
					if  (
						GM_getValue( 'OBJECT_MT_TOOLS_LOCAL_STORAGE_HI_DEF_AUDIO' + SCRIPT_NAME) == '' ||
						!GM_getValue('OBJECT_MT_TOOLS_LOCAL_STORAGE_HI_DEF_AUDIO' + SCRIPT_NAME)
						)
					{
						u.value = 'Successful!';
						OBJECT_MT_TOOLS_LOCAL_STORAGE.CAPTCHA_USING_HI_DEF = false; // update local storage
						/*
						 * Update Settings
						 */
						updateSettings();
					} else {
						u.value = 'There was an error! Please try again.';
					}
				}
			}, 2000); // wait 2 seconds to be sure data is cleared
		}
	}
	
	/*
	 * 
	 * Audio snippet hi def. install
	 * 
	 */
	if (document.getElementById(SCRIPT_NAME+'audio_hi_def_install')) {
		document.getElementById(SCRIPT_NAME+'audio_hi_def_install').onclick = function() {
			
			this.value = 'Downloading ...';
			
			// disable
			this.disabled = true;
			document.getElementById(SCRIPT_NAME+'audio_hi_def_install').onclick = function() {};
			
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
					url: URL_PASTEBIN,
					onload: function (response) {
						install_audio(response.responseText);
					}
				});
			}
			/*
			 * END CHROME
			 */
			/*
			 * MOZILLA
			 */
			if (is_mozilla) {
				self.port.on('xhr_pastebin', function(responseText) {
					install_audio(responseText);
				});
				self.port.emit("xhr_pastebin", URL_PASTEBIN);
			}
			/*
			 * END MOZILLA
			 */
			function install_audio(result) {
				var ahdi;
				var r;
				//var result = response.responseText;
				
				ahdi = document.getElementById(SCRIPT_NAME+'audio_hi_def_install');
				if (ahdi) {
					ahdi.value = 'Installing ...';
				}
				
				// check integrity of download
				r = /^\[(('data:audio\/[^;]+;base64,[^']+',?)*?(?=\]))\]$/.exec(result); // X instances "'data:audio/ogg;base64,DATA',"
				if (!r) {
					if (ahdi) {
						ahdi.value = 'There was an error! Please try again.';
					}
					return;
				}
				
				GM_setValue('OBJECT_MT_TOOLS_LOCAL_STORAGE_HI_DEF_AUDIO' + SCRIPT_NAME, result);
				
				if (ahdi) {
					if (GM_getValue('OBJECT_MT_TOOLS_LOCAL_STORAGE_HI_DEF_AUDIO' + SCRIPT_NAME) != result)
						ahdi.value = 'There was an error! Please try again.';
					else
						ahdi.value = 'Installation successful!';
				}
				
				if (GM_getValue('OBJECT_MT_TOOLS_LOCAL_STORAGE_HI_DEF_AUDIO' + SCRIPT_NAME) == result) {
					OBJECT_MT_TOOLS_LOCAL_STORAGE.CAPTCHA_USING_HI_DEF = true; // update local storage
					/*
					 * Update Settings
					 */
					updateSettings();
				}
			}
		}
	}
	
	/*
	 * 
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
	
	/*
	 * 
	 * Save button
	 * 
	 */
	u = document.getElementById(SCRIPT_NAME+'save');
	u.onclick = function() {
		
		/*
		 * Update Settings
		 */
		updateSettings();
	}
	
	/*
	 * 
	 * Exit button
	 * 
	 */
	u = document.getElementById(SCRIPT_NAME+'exit');
	u.onclick = function() {
		hideMenu();
	}
	
	/*
	 * 
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
	 *
	 * Uncheck Auto-Accepts Button 
	 * 
	 */
	 
	u = document.getElementById(SCRIPT_NAME + 'turn_off_auto_accept');
	u.onclick = function () {
		localStorage['OBJECT_MT_TOOLS_LOCAL_STORAGE_reset_accpt_'+SCRIPT_NAME] = true;
		localStorage['OBJECT_MT_TOOLS_LOCAL_STORAGE_reset_accpt_'+SCRIPT_NAME] = false;
		stopAcceptingJobs_run(); // hides
		
		//~ console.log('Clicked turn_off_auto_accept');
		//~ stopAcceptingJobs_init();
	}
}

/**
 * Function updateSettings
 * 
 */
function updateSettings(resetSettings) { // rs--false/1/2
	
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
			if (el[i].checked != reset) {
				el[i].click();
			}
		}
		//document.getElementById(SCRIPT_NAME+'IFRAME_OFFSET_TOP').value = '20';
	}
	
	
	// IS_ACTIVE_IFRAME_HEIGHT
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_IFRAME_HEIGHT');
	if (u.checked) {
		OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_HEIGHT = true;
	} else {
		OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_HEIGHT = false;
	}
	
	// IS_ACTIVE_IFRAME_WIDTH
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_IFRAME_WIDTH');
	if (u.checked) {
		OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_WIDTH = true;
	} else {
		OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_WIDTH = false;
	}
	
	// IS_ACTIVE_IFRAME_OFFSET
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_IFRAME_OFFSET');
	if (u.checked) {
		OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_OFFSET = true;
	} else {
		OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_OFFSET = false;
	}
	
	// IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT');
	if (u.checked) {
		OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT = true;
	} else {
		OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT = false;
	}
	
	// IS_ACTIVE_CAPTCHA_INPUT_FOCUS
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_CAPTCHA_INPUT_FOCUS');
	if (u.checked) {
		OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_INPUT_FOCUS = true;
	} else {
		OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_INPUT_FOCUS = false;
	}
	
	// IS_ACTIVE_CAPTCHA_DISPLAY_ALERT
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_CAPTCHA_DISPLAY_ALERT');
	if (u.checked) {
		OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_DISPLAY_ALERT = true;
	} else {
		OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_DISPLAY_ALERT = false;
	}
	
	// IS_ACTIVE_CAPTCHA_AUDIO_ALERT
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_CAPTCHA_AUDIO_ALERT');
	if (u.checked) {
		OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_AUDIO_ALERT = true;
	} else {
		OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_AUDIO_ALERT = false;
	}
	
	// IS_ACTIVE_RETURN_AND_ACCEPT
	u = document.getElementById(SCRIPT_NAME+'IS_ACTIVE_RETURN_AND_ACCEPT');
	if (u.checked) {
		OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_RETURN_AND_ACCEPT = true;
	} else {
		OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_RETURN_AND_ACCEPT = false;
	}
	
	// IFRAME_HEIGHT
	u = document.getElementById(SCRIPT_NAME+'IFRAME_HEIGHT');
	u = u.value.replace(/\D/g, '');
	OBJECT_MT_TOOLS_LOCAL_STORAGE.IFRAME_HEIGHT = (u != '') ? u : 600;
	
	// IFRAME_OFFSET_TOP
	u = document.getElementById(SCRIPT_NAME+'IFRAME_OFFSET_TOP');
	u = u.value.replace(/\D/g, '');
	OBJECT_MT_TOOLS_LOCAL_STORAGE.IFRAME_OFFSET_TOP = (u != '') ? u : 600;
	
	// CAPTCHA_AUDIO_SNIPPET
	u = document.getElementById(SCRIPT_NAME+'CAPTCHA_AUDIO_SNIPPET');
	OBJECT_MT_TOOLS_LOCAL_STORAGE.CAPTCHA_AUDIO_SNIPPET = u.value;
	
	// Save
	saveLocalStorage();
	
	// Status
	blink__sr_status(true);
	btn.disabled = false;
	btn.value = 'Save Settings';
}

/**
 * Function saveLocalStorage
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
 * That is, only once across all tabs which 
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
 */
function checkPlayCaptchaAudio() {
	
	//~ console.log('run checkPlayCaptchaAudio');
	
	// Get localStorage latest.
	// Only play audio alert if:
	//   A) Localstorage.CAPTCHA_IS_PRESENT
	//   and
	//   B) Captcha is in this tab (.indexOf(globals.c_phrase))
	//
	u = GM_getValue('OBJECT_MT_TOOLS_LOCAL_STORAGE'+SCRIPT_NAME);
	if (!u) return;
	u = JSON.parse(u);
	u = sanitize(u);
	
	//~ console.log('run checkPlayCaptchaAudio');
	//~ console.log(u);//return;
	//~ console.log(JSON.stringify(u));//return;
	//~ console.log(document.body.innerHTML.indexOf(globals.c_phrase));
	
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
	//~ if (caa) {
		//~ time_to_next = 60000;
	//~ } else {
		//~ time_to_next = 30000;
	//~ }
	
	// Date
	var d = new Date().getTime();
	//~ console.log(d - u.DATE_CAPTCHA_AUDIO_PLAYED*1)
	//~ console.log(d)
	//~ console.log(u.hasOwnProperty('DATE_CAPTCHA_AUDIO_PLAYED'))
	//~ console.log(u.DATE_CAPTCHA_AUDIO_PLAYED)
	//~ console.log(u.DATE_CAPTCHA_AUDIO_PLAYED*1)
	//~ console.log(u.IFRAME_HEIGHT)
	//~ console.log(u.IFRAME_HEIGHT*1)
	//~ console.log(time_to_next)
	
	// Is last audio alert older than 30 seconds?
	if (d - u.DATE_CAPTCHA_AUDIO_PLAYED*1 > time_to_next) {
		
		//~ console.log('expired');
		
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
		play_audio('local'); // == 'local'. Loads audio selected value from the local storage!
		
	} else {
	
	}
	
	// Set timeout.
	window.setTimeout(checkPlayCaptchaAudio, 10000);
}
/**
 * function storage_events_listener
 * 
 * This is turned on when:
 * A) When the keys .IS_ACTIVE_CAPTCHA_DISPLAY_ALERT or .IS_ACTIVE_CAPTCHA_AUDIO_ALERT are enabled.
 * B) When the "Disable checked" button appears on page.
 * 
 * @key @newValue @oldValue @url @storageArea
 * 
 */
function storage_events_listener(event) {
	
	// Testing
	console.log(event);
	
	var key = event.key;
	
	// A CAPTCHA has either been first seen
	// or it has been completed successfully.
	if (key == 'OBJECT_MT_TOOLS_LOCAL_STORAGE_alert_' + SCRIPT_NAME) {
		events_listener_captcha();
		return;
	}
	
	//
	//
	//
	if (key == 'OBJECT_MT_TOOLS_LOCAL_STORAGE_reset_accpt_' + SCRIPT_NAME) {
		stopAcceptingJobs_run();
		//~ stopAcceptingJobs_init();
		return;
	}
	
	//~ var newValue = event.newValue;
	//~ var oldValue = event.oldValue;
	//~ 
	//~ var url = event.url;
	//~ var storageArea = event.storageArea;
	//~ 
	//~ console.log(event);
	//~ console.log('event');
	
	
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
	//
	//
	window.addEventListener("storage", storage_events_listener, false);
	
	// Set a variable for CAPTCHA status. This is boolean.
	//
	//
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
			//
			localStorage['OBJECT_MT_TOOLS_LOCAL_STORAGE_alert_'+SCRIPT_NAME] = true; // This will only fire once per CAPTCHA "session".
			
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
	// OLD
	//~ /*
	 //~ * Save local storage
	 //~ */
	//~ var u = JSON.stringify(OBJECT_MT_TOOLS_LOCAL_STORAGE);
	//~ GM_setValue('OBJECT_MT_TOOLS_LOCAL_STORAGE'+SCRIPT_NAME, u);
	//~ /*
	 //~ * Save local storage
	 //~ */
	//~ var u = JSON.stringify(OBJECT_MT_TOOLS_LOCAL_STORAGE);
	//~ GM_setValue('OBJECT_MT_TOOLS_LOCAL_STORAGE'+SCRIPT_NAME, u);
	
	
	// IFRAME_HEIGHT
	if (OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_HEIGHT) {
		var i = document.getElementsByName('HTMLQuestionIFrame');
		if (!i || !i[0]) {
			i = document.getElementsByName('ExternalQuestionIFrame');
		}
		if (i[0]) {
			i[0].style.height = OBJECT_MT_TOOLS_LOCAL_STORAGE.IFRAME_HEIGHT + 'px';
			i[0].style.backgroundColor = '#fff'; // iframe transparency
		}
	}
	
	// IFRAME_WIDTH
	if (OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_WIDTH) {
		document.body.style.margin = '0';
		var i = document.getElementsByName('HTMLQuestionIFrame');
		if (!i || !i[0]) {
			i = document.getElementsByName('ExternalQuestionIFrame');
		}
		if (i) {
			if (i[0]) {
				i[0].style.position = 'absolute';
				i[0].style.width = '100%';
				i[0].style.margin = '0'; // no margin
				i[0].style.borderLeft = '0'; // remove left/right border
				i[0].style.borderRight = '0';
				i[0].style.backgroundColor = '#fff'; // iframe transparency
			}
		}
	}
	
	// IFRAME_OFFSET_TOP (this is turned off in preview)
	if (OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_IFRAME_OFFSET) {
		var s1,s2,s3,s4;
		s1 = 'In order to accept your next HIT, please type this word into the text box below';
		s2 = 'you were viewing could not be accepted';
		s3 = 'The HIT you were viewing has expired';
		s4 = 'Want to work on this HIT?';
		if  (
			document.location.href.indexOf('https://www.mturk.com/mturk/preview?') == -1 &&
			document.body.innerHTML.indexOf(s1) == -1 &&
			document.body.innerHTML.indexOf(s2) == -1 &&
			document.body.innerHTML.indexOf(s3) == -1 &&
			document.body.innerHTML.indexOf(s4) == -1
			)
		{
			var i = document.getElementsByName('HTMLQuestionIFrame');
			if (!i || !i.length) {
				i = document.getElementsByName('ExternalQuestionIFrame');
			}
			if (i[0]) {
				i[0].style.position = 'absolute';
				i[0].style.backgroundColor = '#fff'; // iframe transparency
				i[0].style.top = OBJECT_MT_TOOLS_LOCAL_STORAGE.IFRAME_OFFSET_TOP + 'px';
				//
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
						'style':'width:20px;height:20px;margin:0;padding:0;margin-right:4px;vertical-align:middle;cursor:pointer;',
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
	
	// IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT
	if (OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_AUTO_ACCEPT_NEXT_HIT) {
		var i = document.getElementsByName("autoAcceptEnabled");
		if (i[0])
			i[0].checked = true;
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
				//~ window.setTimeout(function(){document.getElementsByName("userCaptchaResponse")[0].focus();}, 4000);
			}
		}
	}
	
	// IS_ACTIVE_RETURN_AND_ACCEPT (inside tools)
	if (OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_RETURN_AND_ACCEPT) {
		
		var i = document.body.innerHTML;
		
		/*
		 * Job is returnable?
		 * Job is returnable if one of these two links are on the page.
		 */
		if  (
				/<a href="\/mturk\/return\?groupId=[^&]+/.exec(i) ||
				/<a href="\/mturk\/return\?requesterId=[^&]+/.exec(i)
			)
		{
			
			var u;
			var u2;
			
			/**
			 * RETURN_AND_ACCEPT button
			 * 
			 * 5 Sep 2014, cursor:pointer
			 */
			u = el({
					'create':'input',
					'type':'button',
					'style':'\
						width:120px;\
						height:24px;\
						margin:0;\
						padding:0;\
						margin-left:4px;\
						border-top:0;\
						-moz-border-radius:0 0 4px 4px;\
						border-radius:0 0 4px 4px;\
						cursor:pointer;',
							//radius->tl,tr,br,bl
							//'style':'width:120px;height:26px;margin-left:4px;',
					'id':SCRIPT_NAME+'btn_raa',
					'value':'Return and Accept!'
			});
			tools.appendChild(u);
			
			/*
			 * RETURN_AND_ACCEPT actions
			 */
			document.getElementById(SCRIPT_NAME+'btn_raa').onclick = function() {
				
				this.style.backgroundColor = 'LightGreen';
				this.value = 'Returning Job';
				
				var u;
				var url_return_and_accept;
				
				u = /<a href="\/mturk\/return\?[^"]+/.exec(document.body.innerHTML);
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
					self.port.emit("xhr_returnaccept", url_return_and_accept);
				}
				/*
				 * END MOZILLA
				 */
				
				
				function return_accept() {
					// status
					var u = document.getElementById(SCRIPT_NAME+'btn_raa');
					u.value = 'Accepting New Job';
					// get new
					var gid;
					gid = /<a href="\/mturk\/return\?groupId=([^&]+)/.exec(document.body.innerHTML);
					if (gid) {
						window.location.href = 'https://www.mturk.com/mturk/previewandaccept?groupId='+gid[1];
						u.style.backgroundColor = 'MintCream';
					} else
						u.value = 'Failed';
				}
			}
		}
	}
	
	// XX OLD XX
	// IS_ACTIVE_CAPTCHA_DISPLAY_ALERT / IS_ACTIVE_CAPTCHA_AUDIO_ALERT
	// Is a CAPTCHA present?
	// Changed: 5 Sep 2014, Interval set from 600ms to 1000ms
	// This is to be moved to .emit / .onRequest
	//~ if  (
		//~ OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_DISPLAY_ALERT ||
		//~ OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_AUDIO_ALERT
		//~ )
	//~ {
		//~ 
		//~ 
		//~ 
		//~ // PLACE A WATCHER HERE FOR WHEN 
		//~ // OTHER TABS GET CAPTCHA.
		//~ 
		//~ if (is_mozilla) {
			//~ self.port.on('captcha_present_in_a_tab', function(responseText) {
				//~ 
				//~ 
				//~ //install_audio(responseText);
			//~ });
			//~ 
		//~ }
		//~ 
		//~ 
		//~ 
		//~ window.setInterval(function() { // window.setInterval // Aug. 18, 2013
			//~ 
			//~ 
		//~ }, 1000);
	//~ }
			//~ 
			//~ // Display alert
			//~ if (OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_DISPLAY_ALERT) {
				//~ 
				//~ cda = document.getElementById(SCRIPT_NAME+'cda');
				//~ 
				//~ if (u.CAPTCHA_IS_PRESENT && !cda) {
					//~ cda = el({
						//~ 'create':'div',
						//~ 'style':'\
							//~ position:fixed;\
							//~ top:0;\
							//~ left:0;\
							//~ width:100px;\
							//~ padding:8px 0 8px 0;\
							//~ text-align:center;\
							//~ z-index:100;\
							//~ background-color:MistyRose;\
							//~ font-weight:bold;\
							//~ border:2px solid LightCoral;\
							//~ border-top:0;\
							//~ border-left:0;',
						//~ 'id':SCRIPT_NAME+'cda'
					//~ });//bg red border
					//~ u2 = 'CAPTCHA ☕'; // &#9749; hot beverage
					//~ cda.appendChild(document.createTextNode(u2));
					//~ document.body.appendChild(cda);
				//~ } else if (!u.CAPTCHA_IS_PRESENT && cda) { // Remove display alert
					//~ 
					//~ document.title = original_title;
					//~ document.body.removeChild(cda);
					//~ 
				//~ }
			//~ }
			//~ 
			//~ // Audio alert
			//~ if (OBJECT_MT_TOOLS_LOCAL_STORAGE.IS_ACTIVE_CAPTCHA_AUDIO_ALERT) {
				//~ 
				//~ caa = document.getElementById(SCRIPT_NAME+'caa');
				//~ 
				//~ if  (
					//~ u.CAPTCHA_IS_PRESENT &&
					//~ // !caa && // allow the captcha to play over and over again on same page, rather than only
					//~ // playing it for each new tab instance, and then never again!
					//~ document.body.innerHTML.indexOf(c_phrase) != -1 // captcha must be present on this page
					//~ )
				//~ {
					//~ 
					//~ // Remove old player (max time per tab is 50 seconds, per total session is 30!)
					//~ // If as player is already embedded onto the page/tab, then wait for 50 seconds
					//~ // before the player on this page/tab plays again. Otherwise, wait for 30 seconds 
					//~ // before playing again.
					//~ var time_to_next;
					//~ if (caa) {
						//~ time_to_next = 50000;
					//~ } else
						//~ time_to_next = 30000;
					//~ 
					//~ // date obj (current)
					//~ d = new Date();
					//~ d = d.getTime();
					//~ 
					//~ // is last audio alert older than 30 seconds?
					//~ if (d - u.DATE_CAPTCHA_AUDIO_PLAYED > time_to_next) {
					//~ //if (d - u.DATE_CAPTCHA_AUDIO_PLAYED > 30000) {
						//~ date_audio_is_expired = true;
						//~ u.DATE_CAPTCHA_AUDIO_PLAYED = d; // set .DATE_CAPTCHA_AUDIO_PLAYED
					//~ } else
						//~ date_audio_is_expired = false;
					//~ 
					//~ // if audio alert...
					//~ if (date_audio_is_expired) {
						//~ 
						//~ // remove the audio alert if it was played previously in this tab
						//~ if (caa)
							//~ document.body.removeChild(caa);
						//~ 
						//~ // play audio (func.)
						//~ play_audio('local'); // == 'local'. Loads audio selected value from the local storage!
						//~ 
						//~ // update local storage
						//~ GM_setValue('OBJECT_MT_TOOLS_LOCAL_STORAGE'+SCRIPT_NAME, JSON.stringify(u));
						//~ 
					//~ }
				//~ } else if (!u.CAPTCHA_IS_PRESENT && caa) { // Remove audio alert
					//~ document.body.removeChild(caa);
					//~ 
				//~ }
				
	//* DEBUG ** setInt **
	/*window.setInterval(function() { // window.setInterval // Aug. 18, 2013
		console.log('x');
	}, 1000);*/
	//*/
	/* DEBUG ** TEST AUDIO **
	x = OBJECT_MT_TOOLS_LOCAL_STORAGE.CAPTCHA_AUDIO_SNIPPET;
	if (x == 'Random')
		x = Math.floor(Math.random()*6); //0..5
	//else
	b64_audio = audio_snippets(false, x*1);
	
	// play alert
	//i.e. <audio controls src = "data:audio/mp3;base64,T2dn....3KcK" />
	caa = el({
			'create':'audio',
			'style':'position:fixed;top:0px;left:110px;width:200px;text-align:center;z-index:100;background-color:MistyRose;border:2px solid LightCoral;',
			'id':SCRIPT_NAME+'xx',
			'controls':'',
			'src':b64_audio
	});
	document.body.appendChild(caa);
	document.getElementById(SCRIPT_NAME+'xx').play();*/
	/* DEBUG ** SHOW RETURN/ACCPT **
	u = el({
			'create':'input',
			'type':'button',
			'style':'width:130px;height:26px;margin:0;padding:0;margin-left:4px;border-top:0;-moz-border-radius:0 0 4px 4px;border-radius:0 0 4px 4px;', //radius->tl,tr,br,bl
			//'style':'width:120px;height:26px;margin-left:4px;',
			'id':SCRIPT_NAME+'btn_raa',
			'value':'Return and Accept!'
	});
	tools.appendChild(u);
	//*/
	
}


 
/**
 * Main Program
 * Function mt_load
 * 
 */	
function load()
{

	/**
	 * When to run!
	 */
	// top window!
	//if (window.top != window.self) {
	//	console.log('x');
	//	return;
	//}
	// MT Home Page rather than Job!
	// -There are currently no HITs assigned to you.
	// -There are no more available HITs in this group. See more HITs available to you below.
	// -All HITs( Available to You|) => Shows when logged out.
	// ...
	if  (
		/<tr>[\r\n\t\s]+<td class="title_orange_text_bold">[\r\n\t\s]+All HITs( Available to You|)[\r\n\t\s]+&nbsp;&nbsp;[\r\n\t\s]+<\/td>[\r\n\t\s]+<\/tr>[\r\n\t\s]+<tr>[\r\n\t\s]+<td class="title_orange_text" style="white-space: nowrap; padding-top: 1ex;">[\r\n\t\s]+1-10 of \d+ Results/.exec(document.body.innerHTML)
		)
	{
		return;
	}

	/**
	 * Tools menu
	 * Shows on all applicable pages.
	 * 
	 */
	var u;
	var t;
	
	/**
	 * Styles
	 */
	// div_tools
	// Container for initial menu buttons
	GM_addStyle(
		'#'+SCRIPT_NAME+'div_tools {\
			position:absolute;\
			top:0;\
			left:50%;\
			margin-left:-130px;\
			width:260px;\
			padding:0;\
			z-index:100;\
			text-align:center;\
		}'
	); // hidden container = 120px(ra),60px(label),24px(reset)
	// btn_show_menu
	// Click shows tools.
	GM_addStyle(
		'#'+SCRIPT_NAME+'btn_show_menu {\
			width:60px;\
			margin:0;\
			padding:0;\
			margin-top:-1px;\
			-moz-border-radius:0 0 4px 4px;\
			border-radius:0 0 4px 4px;\
			\
			cursor:pointer;\
		}'
	);
	
	/*
	 * Top of page container for tool buttons
	 */
	u = el({
			'create':'div',
			'id':SCRIPT_NAME+'div_tools'
	});
	document.body.appendChild(u);
	tools = document.getElementById(SCRIPT_NAME+'div_tools');
	/*
	 * btn_show_menu
	 */
	u = el({
			'create':'input',
			'type':'button',
			'value':'Tools',
			'id':SCRIPT_NAME+'btn_show_menu'
	});
	tools.appendChild(u);
	t = document.getElementById(SCRIPT_NAME+'btn_show_menu');
	/*
	 * btn_show_menu onclick
	 */
	t.onclick = function() {
		if (this.style.display != 'none') {
			this.style.display = 'none';
			showMenu();
		}
	}
	
	/**
	 * Apply tool settings
	 * 
	 */
	applySettings();
	
	/**
	 * Add background page listener for doNotAcceptNextTab
	 */
	stopAcceptingJobs_eventListener();
	//~ OBJECT_MT_TOOLS_LOCAL_STORAGE
}

/**
 * ETC ETC ETC
 * Audio snippets
 */
/**
 * Audio snippets
 * 
 */
function audio_snippets_data(return_index, return_snippet) {
	
	//Creative Commons 0 License
	//Creative Commons Sampling+ License
	//Creative Commons Attribution License

	var hi_def_audio;
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
			'id':'yoram_church_bell_SHORT.mp3',
			'otitle':'church bell.wav'
		}
	];
	
	if (return_index) {
		return as;
	}
	
	// in-script or local storage (hi def.)? 
	
	// local storage
	hi_def_audio = GM_getValue('OBJECT_MT_TOOLS_LOCAL_STORAGE_HI_DEF_AUDIO' + SCRIPT_NAME);
	if (hi_def_audio) {
		if (hi_def_audio != '') {
			hi_def_audio = JSON.parse(hi_def_audio.replace(/'/g,'"')); // array
			return hi_def_audio[return_snippet];
		}
	}
	
	// return snippet # (in-script)
	switch (return_snippet) {
		case 0:
			return 'data:audio/ogg;base64,T2dnUwACAAAAAAAAAAAdl4dtAAAAAJaGYzwBHgF2b3JiaXMAAAAAAYA+AAAAAAAAwF0AAAAAAACqAU9nZ1MAAAAAAAAAAAAAHZeHbQEAAABYgP9xDjv///////////////+aA3ZvcmJpcysAAABYaXBoLk9yZyBsaWJWb3JiaXMgSSAyMDEyMDIwMyAoT21uaXByZXNlbnQpAAAAAAEFdm9yYmlzIkJDVgEACAAAgCAKGcaA0JBVAAAQAABCiEbGUKeUBJeChRBHxFCHkPNQaukgeEphyZj0FGsQQgjfe8+99957IDRkFQAABABAGAUOYuAxCUIIoRjFCVGcKQhCCGE5CZZyHjoJQvcghBAu595y7r33HggNWQUAAAIAMAghhBBCCCGEEEIKKaUUUooppphiyjHHHHPMMcgggww66KSTTjKppJOOMsmoo9RaSi3FFFNsucVYa60159xrUMoYY4wxxhhjjDHGGGOMMcYIQkNWAQAgAACEQQYZZBBCCCGFFFKKKaYcc8wxx4DQkFUAACAAgAAAAABHkRTJkRzJkSRJsiRL0iTP8izP8ixPEzVRU0VVdVXbtX3bl33bd3XZt33ZdnVZl2VZd21bl3VX13Vd13Vd13Vd13Vd13Vd13UgNGQVACABAKAjOY4jOY4jOZIjKZIChIasAgBkAAAEAOAojuI4kiM5lmNJlqRJmuVZnuVpniZqogeEhqwCAAABAAQAAAAAAKAoiuIojiNJlqVpmuepniiKpqqqommqqqqapmmapmmapmmapmmapmmapmmapmmapmmapmmapmmapmmaQGjIKgBAAgBAx3Ecx1Ecx3EcyZEkCQgNWQUAyAAACADAUBRHkRzLsSTN0izP8jTRMz1XlE3d1FUbCA1ZBQAAAgAIAAAAAADA8RzP8RxP8iTP8hzP8SRP0jRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN04DQkFUAAAIAACCIQoYxIDRkFQAABACAEKKRMdQpJcGlYCHEETHUIeQ8lFo6CJ5SWDImPcUahBDC995z7733HggNWQUAAAEAEEaBgxh4TIIQQihGcUIUZwqCEEJYToKlnIdOgtA9CCGEy7m3nHvvvQdCQ1YBAIAAAAxCCCGEEEIIIYSQQkophZRiiimmmHLMMccccwwyyCCDDjrppJNMKumko0wy6ii1llJLMcUUW24x1lprzTn3GpQyxhhjjDHGGGOMMcYYY4wxgtCQVQAACAAAYZBBBhmEEEJIIYWUYoopxxxzzDEgNGQVAAAIACAAAADAUSRFciRHciRJkizJkjTJszzLszzL00RN1FRRVV3Vdm3f9mXf9l1d9m1ftl1d1mVZ1l3b1mXd1XVd13Vd13Vd13Vd13Vd13UdCA1ZBQBIAADoSI7jSI7jSI7kSIqkAKEhqwAAGQAAAQA4iqM4juRIjuVYkiVpkmZ5lmd5mqeJmugBoSGrAABAAAABAAAAAAAoiqI4iuNIkmVpmuZ5qieKoqmqqmiaqqqqpmmapmmapmmapmmapmmapmmapmmapmmapmmapmmapmmaJhAasgoAkAAA0HEcx3EUx3EcR3IkSQJCQ1YBADIAAAIAMBTFUSTHcixJszTLszxN9EzPFWVTN3XVBkJDVgEAgAAAAgAAAAAAcDzHczzHkzzJszzHczzJkzRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zQgNGQlAAAEAIAgx7SDJAmEoILkGcQcxKQZhaCC5DoGJcXkIaegYuQ5yZhB5ILSRaYiCA1ZEQBEAQAAxiDGEHPIOSelkxQ556R0UhoIoaWOUmeptFpizCiV2lKtDYSOUkgto1RiLa121EqtJbYCAAACHAAAAiyEQkNWBABRAACEMUgppBRijDnIHESMMegYZIYxBiFzTkHHHIVUKgcddVBSwxhzjkGooINUOkeVg1BSR50AAIAABwCAAAuh0JAVAUCcAIBBkjTN0jTPszTP8zxRVFVPFFXVEj3T9ExTVT3TVFVTNWVXVE1ZtjzRND3TVFXPNFVVNFXZNU3VdT1VtWXTVXVZdFXddm3Zt11ZFm5PVWVbVF1bN1VX1lVZtn1Xtm1fEkVVFVXVdT1VdV3VdXXbdF1d91RVdk3XlWXTdW3ZdWVbV2VZ+DVVlWXTdW3ZdF3ZdmVXt1VZ1m3RdX1dlWXhN2XZ92Vb131Zt5VhdF3bV2VZ901ZFn7ZloXd1XVfmERRVT1VlV1RVV3XdF1bV13XtjXVlF3TdW3ZVF1ZVmVZ911X1nVNVWXZlGXbNl1XllVZ9nVXlnVbdF1dN2VZ+FVX1nVXt41jtm1fGF1X901Z1n1VlnVf1nVhmHXb1zVV1X1Tdn3hdGVd2H3fGGZdF47PdX1flW3hWGXZ+HXhF5Zb14Xfc11fV23ZGFbZNobd941h9n3jWHXbGGZbN7q6Thh+YThu3ziqti10dVtYXt026sZPuI3fqKmqr5uua/ymLPu6rNvCcPu+cnyu6/uqLBu/KtvCb+u6cuy+T/lc1xdWWRaG1ZaFYdZ1YdmFYanaujK8um8cr60rw+0Ljd9XhqptG8ur28Iw+7bw28JvHLuxMwYAAAw4AAAEmFAGCg1ZEQDECQBYJMnzLMsSRcuyRFE0RVUVRVFVLU0zTU3zTFPTPNM0TVN1RdNUXUvTTFPzNNPUPM00TdV0VdM0ZVM0Tdc1VdN2RVWVZdWVZVl1XV0WTdOVRdV0ZdNUXVl1XVdWXVeWJU0zTc3zTFPzPNM0VdOVTVN1XcvzVFPzRNP1RFFVVVNVXVNVZVfzPFP1RE81PVFUVdM1ZdVUVVk2VdOWTVOVZdNVbdlVZVeWXdm2TVWVZVM1Xdl0Xdd2Xdd2XdkVdknTTFPzPNPUPE81TVN1XVNVXdnyPNX0RFFVNU80VVVVXdc0VVe2PM9UPVFUVU3UVNN0XVlWVVNWRdW0ZVVVddk0VVl2Zdm2XdV1ZVNVXdlUXVk2VVN2XVe2ubIqq55pyrKpqrZsqqrsyrZt667r6raomrJrmqpsq6qqu7Jr674sy7Ysqqrrmq4qy6aqyrYsy7ouy7awq65r26bqyrory3RZtV3f9m266rq2r8qur7uybOuu7eqybtu+75mmLJuqKdumqsqyLLu2bcuyL4ym6dqmq9qyqbqy7bqursuybNuiacqyqbqubaqmLMuybPuyLNu26sq67Nqy7buuLNuybQu77Aqzr7qyrbuybQurq9q27Ns+W1d1VQAAwIADAECACWWg0JCVAEAUAABgDGOMQWiUcs45CI1SzjkHIXMOQgipZM5BCKGkzDkIpaSUOQehlJRCCKWk1FoIoZSUWisAAKDAAQAgwAZNicUBCg1ZCQCkAgAYHEfTTNN1ZdkYFssSRVWVZds2hsWyRFFVZdm2hWMTRVWVZdvWdTRRVFVZtm3dV45TVWXZtn1dODJVVZZtW9d9I1WWbVvXhaGSKsu2beu+UUm2bV03huOoJNu27vu+cSzxhaGwLJXwlV84KoEAAPAEBwCgAhtWRzgpGgssNGQlAJABAAAYpJRRSimjlFJKKcaUUowJAAAYcAAACDChDBQasiIAiAIAAJxzzjnnnHPOOeecc84555xzzjnnGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGBADsRDgA7ERYCIWGrAQAwgEAAIQUgpJSKaWUEjnnpJRSSimllMhBCKWUUkoppUTSSSmllFJKKaVxUEoppZRSSimhlFJKKaWUUkoJpZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKAQAmDw4AUAk2zrCSdFY4GlxoyEoAIDcAAFCKOcYklJBKSCWEEErlGITOSQkptVZCCq2ECjponaOQUkutlZRKSZmEEEIooYRSWikltVIyCKGEUEoIIaVSSgmhZVBCCiWUlFJJLbRUSskghFBaCamV1FoKJZWUQSmphJJSKq21lEpKrYPSUimttdZKSiGVllIHpaSWUimltRZKa621TlIpLaTWUmutlVZKKZ2llEpJrbWWWmsppVZCKa200lopJbXWUmstldRaS62l1lJrraXWSiklpZZaa621lloqKbWUQimllZJCaqml1koqLYTQUkmllVZaaymllEooJZWUWiqptZZSaKWF0kpJJaWWSioppdRSKqGUElIqoZXUUmuppZZKKi211FIrqZSWSkqpFAAAdOAAABBgRKWF2GnGlUfgiEKGCSgAABAEABiIkJlAoAAKDGQAwAFCghQAUFhgKF3oghAiSBdBFg9cOHHjiRtO6NAGABiIkJkAoRgiJGQDwARFhXQAsLjAKF3oghAiSBdBFg9cOHHjiRtO6NACAQAAAADgAQAfAAAHBhAR0VyGxgZHh8cHSIgIAAAAAAAAAAAAAACAT2dnUwAAAH4AAAAAAAAdl4dtAgAAAGE+jr1AARFGRUdLTUxEPDk6PDo6OT83Nzk+Pz46QD4/QT9AREE+P0FARUJAQkA/PkNDRUZBQ0ZIPUZITUxJSEdISklKRQAmR78WAcABZAAADkbxhD0HABpHCVIoV3blrTXsx6oA3kLJGQCANW7XpFmP7mryW2Wo63P3X4id5zm7btIryRHIj3V9fH/lznOfi3kWM822XpIfiAJ8Pv9CR4GCdoFg9Z8Kw+KD0qQDgJnvu7pX00y6dM9HTuP9rbF6zmHsfOSkOSenFX2u7+DjbIywQsBMrqtebgtraDTTzGShfwxeRwpLGniDLvJHJGBNqt4MAI73zJv6nmmv9Vfdf/T1/HT8o9DzbN5ZpnraujzcZm5PQ17T8PZLhbu0rlOiTuN1f7NC4APUAWI9BHESDJio+pfQQkrfYxUG4NG2s9zulaWzb9NZXwtfxosVM+Z5rFgcN6xwzWM5F0eGd6a3oQ1jc2dNGIuNo1dxvzmbEmAFVXUBAG5BThs4VWYEO/84BACM6sMKgEctkw6lmvT06bjy6eK7p8J1/PZ8vurSu8VTIzIGH5M9cwilfipbxUmGid40bT973CU5S5ir8R/AlggAck8JAoAEHb/ulFIyKwDOfqOyMGX1nmVWPz6y6Cx61LnX/xV1xPu/o9vy3KZ+sJNNzEGN+H7S3lYyjYcoyAGcOngHgFbmIgi7AN5zAXpTeraHcTwFVM/lSCwkAwFg3wgAtHvTzNo1y/vk2f1I/6ZRKUvgTXVzahJhp3P/681bu42+PVhoHXr3y8A1mU8pMAgAdkseWcv4OIGsawhjBC0A4CQAILUAsGxnE1/zjn3tu/hPVur4JRhJfQBY18w6tZUvF/cwYwXtuIQtoAAAalGZGE0wThh4arpaMJY7HxQBHEsASJUKAKy3bouzf7P4nrdd9vqmYt0SVFEA8FQYwaf9ROagge0Adk92tBcUlh0MVPmLBpCv2aoYABxKxPJb6ziOdZqb3Dn+/AqYg2oA/DlPuWkm0xEGF9/0IYIKAPghAWZVRdOWIAuMfHHewxNPwUADYB8VAGieZXXvytq275bH02vrdgIx+g4A/nQiAE+Dzn0K6xRnPS8FMANKAWZNtdF2otwpstQfDkAC2LsCAJL2uNYEEvF/I/ul6maov7wu9Tfr3BNYjT/VWELjIUMN6m3YBRUgFxF2S3Gwz6QZWcCalzgofJwAwENgALD23xVX+oXvPJtJ9RYUiSOcTXrfD6BRaOpepWG7Vzp8QDNp4ocCak2VMvbAeMOWXvsKDBYCIACcAICwAADvfq7fM2306+/8rjZVI5oBKQECAxFSevytWn1bqwbwDgQ1glWYOrez/cuCdLUXf18ZCSwVDygH4AGA0ACAFGvXLWdM+/za5fA0Eet1AyDBEDgiELpDT58hVM80m5RQB9dIak1FZ51JcaZk5j0TgqJK7AEA0Bxd9t6vyptsHdLHKdP1JehFAUgMjyMgtBTvlIYZk1zCzLWtXmpLuWlnAXeK4Krnhxd3BgLAXgAA9icdZ8TnOL9Z9kdLLGAa8g4Avk+wCfZmJHGwaIiNvxToOAByRRpZw3n7AVtvOaA3yRsARgIAmvf8XWnt8/Z4fkesnsIAPo+7MXhcEkiChSFVjiS3W13hvNATKw1yUTIYyyUbdKWXAXghCuxFAKgzbY7unEz6+rl1Ybm9FIAPlugZ34/Wk85e6KcBD4aK5vzaJCBNtoJBKrfwE3pRVFnLZZasRHfpagBW0AIEgAcAUgoAdV3Zdc/T1O+5Zc+imTVNA8AdhUKlIQH9M9ZGkiXIXrIQnOINAgyoAn5RVDhXyvaAvife5mCNek4CANISACre7aqzapE/ntUOEkW0buYCpy8AQjHrbp3lG9qmFp90j4PR0F8Bz94AfldYGWfeBmHR6D0AigrhLAEgcQYAFfnRrusex7V0y74aALxlGgn2lQRQXF4nkr8hVJ9biwAwFddcAHZVHCnD7ziVCh3pGgKkFiAA7PMAAM1yf9btacx5tqlv2naNiIAUqNYAex2KITLGclr+To2i9XHNhT3lSrTTQwR2Rxxb2+4YApLvJ+H72GsGAE9/i995M236HVfyy7W4Hl9SsPAFrJ641uxJpp70u9hT6jIn9dpEEobg0YE6AHpXwNzILYOI868qcShoABJA9YkBwMzWqvvT5vkah0lay3ckgH0CBK6FRnJQBILXsmUtiwd5m8SnjYw5AAPUAHJV1NmYMhxWe/tqAdZIgABQPT4VAHxvavs9He17a47Wo9p8DlRo6N8B2C1EFBShSLSudavif6bMoUSXprKZAG8AaktWKM2tltnBqqv0CIxdxT4IADy37zv25XGmPpbYb3qM0wfYxUUAoS5V1ldk3cMwHEf/yLfArowNKliVGnwAbkVUWpiVA3Z9clztAIoOkABeAAAGAIjuX7fbs6Q2y44u2kpaa58gFqsBQPNzU8dMS8ff1+ZeOS9wYUgDCAC0CnZRXBktjSapWHWjF0B4reYlABATAFr/t6m1zaee/5fa9AAN4ljW43v12vtBp53mnLrG57CFjvqXPh/AXD53mNInwJAAakkSac20dsLixPRyCHxRoPoQAPLmW54l31P49X0TPw869vQaLYN9FQB9dmdQrto6uga/YVgQupPjzuPlB/gKQAN2WZQ6R97tQbLqDXEVcuAKazFIANWbAYAn+7r61PmkybTxLqlaIIb+AmjEvTnIxMroXsdqpbnRQF1uhQMVAHZPYO1hVv6x6Jb+8YQHrvA6bKsCAHWftfmX5Wj6c+3r5qweTBdAB/sMgC07nl5IvigZv1FZAmaGZCXbhPsQAG5JyBpFbhNi4b7l5UUCRoHqWwUA1v2d53jWvjt/SzrS3z0a8bgMMhX2t8sGcC0KaUNXE98FxaEiYBPD9sGB0zwAildBOhuGvLHo3pFfCyRGJiABVB8CwKS/a90qa779erK9/X6SWSFCyksJWOHavR3FpHIPrzwsazqKlbYzQB1AB3pRJhtNjPGDpuj4cvYauKKKFwA4mwCgfl13zmRXxNMvETAQ4Wh4Yr7wzkO5MgsxTVMPw6MYht1NwM55e2+ggJnZDoAdAHZXxsrBHUWwaHQNS0gBEAD2mgGA6xfns7TdvO35/Ks/86x9J0zRVepLLhAydtTJPFnbBR4T9KeccXzgfQCLEXYaAGZNqgLxrmagN728RwC3szcDgOPa12V9l3mne6+l9riPt/5yTSEz7IVNoCO7Qmyk1ILb0sS8UYmzIhVrEwWVfQB6S2XmRC1/oDe+7nuMAcDxuafpoy4XX5njoHyhtnMUji9fLE+btpD6z8K2mjyCGjEPOX9GDuIN124owDjhYGUObQKCV00rcBui0qSXAlizUz0rAHAtqf911UY8/S/jVA87nhfUTY7rfSZMJ+YunI1VBRcrgY+5bNbmQRVgLhPqkTcHck9GSpTNm0RHP14cbSZgvq4AAFV5OrfzuPa3j/DLKHUc7tR2qKRf22gZ9PhjlysuZl29nDhXAvWv71FwMAYAfk+OGXDTk8R0vW8OUlB9MACY2/PEddv7Sp6Kyvdru+dJFDHSK7ej6acM6a1nk6EixYeSlZtN8RsXI0uBDQB6TYFZ+NW+gL0nziGd6pQEAHzrv13iTGn+ldp24lzeigpj9bCZUZClwhTXWNHrVJyaagAUwSHS4VPva0wDAEM+xgAAdk1OavhNlRT6TWmv3jIAN/FKxKkPjubfF1nOm5jLtbN7GsWcuGfQw5ztFMflVBIwDf84D5VlFlaR8oQZYAQAWKkkAGZLDIMGFOjgZ848ACGYr2JzADwVX/PdqltnWZeRxt/rDj5bNFVNw/ZJ1yIPi1V+01tCJXa3666Wuysf4cLc/1QFdDUAAGpHBMmxgALNz1yGcEILEACqD1QArPt3RZsvN9fWZM1zPE9UTEyh1QyGYZk3i1NvxfR86hJpITnd2tl3tl7wGDlW8ru4XQCCVQ7ZY18pHaR3SgcYgL1wyeHG59grw3w4n03x8iyrh9M9ILqf3kVXifKxQGt8DUTggx67EbRCV+Lc1v4Zw7SuAmZHhPI9GJYCXf90pgYeRcGWqAA42993vrMeZ9/Uujxvf9HHZQ76fLYuRCjWKaeOj4yZXhd79jsyxPNGznCLG/lsVQBqR4DkeXIq6ORnrgGVpwQIANWHFQDr+2+jOdJ+XGUmr9siakQRpnRk1zXE/HtlEM2UvZEGwMVnl3osoXsYQ6EEIIG9GR4AZkdKggYURLu4PHNwMF8HBmAd2/3Jmne53dymnebiUOjD1bWWG8XsZu6Ve60ujOR+5fu2HxtZ06JuZx2ecbqFGkxFEUD/kKEAakVMGgywQVeXZyQnNMxSAHgja66b/5Wvp3tattOwlzabn9aLJSZH7WyYeLb53peVUu3KQFhwSw0EDA2gAXJPLlqsK8VAB5eXR0JIKJ0xAJjo0tE0x5nd8mod0+djKvQoGetUr1/bvDCmV2x5IF9V5XXIXeSaZeg3v1MVzLPmfqAVOgB2T4bbNOkn6LWyJyDTCChZJQNwbq6+smrH6j5Khcjh8SkhJi8So4Nvk0ijQ/TDjZ73fNw5XGoG9CsTB/4tGpZhuC2Gfy7g6wBqUcEDM9Cggx9X+wTAgQRAaWcFwHE12zQ1Zxx7s8zVprb9qvKJczRRlwhem17ngxQj7/TNCMmXMixcrkwMGmqu2UTcyQqOW3Cc+p8pAGZHLgMxcNDh5V1IQFK9mwE4bu99u7VNa/q1MEde/rwwp3Y7znyRSWfv3tbFeaydYE1Zaz5U0zu6KlFTsTk1gm4th7crOIz4sLPbGABeWYYDu0UImtezugkAQfV5GYBm+kulvp0nj6uS4u9ucnKtRkoOnHpuwjRcc1xGizCqlNMPSRI5zLc5vdFZ1JDlQV0+9hvgxi0AYkmI8z2YNCS7+7FXn2cA4M98370dzj7r94X6zlDnMGpjHp1ET/OmYsuqSo+IMA2RI9Zp5vQHQtg0neV2OD1lG7x7uNaYYuIBak0E5LlYOuj49VlKgYDqi44BkPb4tuov57Pc2+Zph7xOFyCiHjaryWUebmK+jbtie4L9CE7eeLJMTzmdIahUlMT7yNwb+Dp6SUF6cF4iaK7v2RoBwbZYBUCdcfz367qnyvyrjarIoV/v3pmjcw1Xn0Ndjx9Hcaz3NGnOswcND7auFdxM5UICny1nPPDAWwRyR0bbpGyFRPNykZCQAAmgelcEkM7ztp5r/5z+aatq2jZmqFpNTPTPE1FPB0XdxR7musHJB8nwc5GKa26cpaB1Zp40BxobpFUCAGZHBJQ1+KigJa6vAWouoGRWBOCYfWlm3lru+fX/puKUvRdIu7P8qqwI7vCifNM05X5U9Vlci4WzBLyq+1/HOhpSqFzXS4sA+wBSRQgDk2YId3Wpvq8WQJ+r7ysXDr7M05zD6ymHiffIA6wRN4/E5jLNU7q56ZiKw6m8cjbHteHKpI/C1s1vjgspnL8ua0CPKhhOAGJJCNmjGTTQvR/XgXRqgASwdwPA0T/NmWV1y6/zmrPPI0iTQGookXpQE7tuonitx24KUYzew6zsUbOj+411mt/QA3wFAE9nZ1MABMCWAAAAAAAAHZeHbQMAAABALptVDUZHSUNGSU5IR0lDQSNeSUCUNSwWaM31rBIqR5xRWpUAUH2l+Duf9Ozn7b8a2t/IbCBi1bdK7iy8vlBfcGw9vy8b5FyQ2H5pAXZDawLRfLm53xIAUkeIaatJDLSelwfhCC2UbgKA/7aV1O4p8n6Zb+ic3X9ZDHSGxwytO+cM4ysijdbzNQtF6e1ObeY6VeUe6KL8kIFNBODnIABSRwIZNLotxK3JDyASQPWJAMCSpVnbWkNMhO56uVDPv4x11dy/P78y12fzVOth5UFMnTFEDGTakhHiWfa6LjPW5YqhF4YAbTsARkeOA8AHdJMO0BNAMh8SALyRbr/+cGvbdzva6+/3fT4Xvve4l3fywtSKoaXpLlPWsXn14fxEiTrBzWqwmhvaBk65A05HKsqmbNugp7o8S26kpDoXAJ7ll9VcXS47u592lp/nT0cKdVLPG3G985ig6Z7Guw1I9wm1q6wDeQvVKLlj9cZrj7o9AwBGR8RbuJEbdO/lACQASgYBIGste1JBpWTe47eHhefvlcP1z9h0sVh7Ko+UXFqnpumpsLXjwo5U7fV6XEazjw+4LdFpCYiOcgkASkeKG6WRUTJhc6c/zoQxEFCSXgbgiTa90+yNf3abPNU+80Fa+vFC9Ho0m30QFWLW71MOdWUP8+WYs0dKH9w13eBEFQxAZ/NYyo5JeVQBPkdCW8218oAOrzulwQqA+P1izKWhcL1QrnA8cjuf3+FT3O1gb4tj/NnOJeTYze+V+ugjb95Ws/INazbmO8Gj7sA+WoPeOaUAOkfKKsv5+YCOLy+5TwKUFhmAo7tdh8N5i8ibYzn9PvQ+V8w2j5F5e4M8IFCZsxSf2fXUiDw+DQT940UwktVlMPsAYGCrLgEqR8JbpDFu0PFlp7TIAJxuKw8r7PXjvPOHxW/0+WmsLPcZN5W17Q8+L4WxTh/7ZqxZGvDNXlPRgkN/yZagsL3py+idPtG2r9UAGkcIaS1tPmnSPe3VWwA4Kz5uFX/ZHS5WzaMLw/XgUVyhT/UWYDAVYhBsT1/OdKuvaxf18+qMA8vle4NhsJ5UseoBABJF4PyebfADquyzTADo8yM9fxVnt984zr+V2xefc8CQkylIpbzS/AVJT8ee1fS2vKTw1tI58dtFdzhPSNhJziUAEkePzA/ABlAwEwCg8FZZV7aH2gCoAjW4rI3BM9tv9KqnSwA=';
		case 1:
			return 'data:audio/ogg;base64,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';
		case 2:
			return 'data:audio/ogg;base64,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';
		case 3:
			return 'data:audio/ogg;base64,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CDChDBQasiIAiAIAAJxzzjnnnHPOOeecc84555xzzjnnGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGBADsRDgA7ERYCIWGrAQAwgEAAIQUgpJSKaWUEjnnpJRSSimllMhBCKWUUkoppUTSSSmllFJKKaVxUEoppZRSSimhlFJKKaWUUkoJpZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKAQAmDw4AUAk2zrCSdFY4GlxoyEoAIDcAAFCKOcYklJBKSCWEEErlGITOSQkptVZCCq2ECjponaOQUkutlZRKSZmEEEIooYRSWikltVIyCKGEUEoIIaVSSgmhZVBCCiWUlFJJLbRUSskghFBaCamV1FoKJZWUQSmphJJSKq21lEpKrYPSUimttdZKSiGVllIHpaSWUimltRZKa621TlIpLaTWUmutlVZKKZ2llEpJrbWWWmsppVZCKa200lopJbXWUmstldRaS62l1lJrraXWSiklpZZaa621lloqKbWUQimllZJCaqml1koqLYTQUkmllVZaaymllEooJZWUWiqptZZSaKWF0kpJJaWWSioppdRSKqGUElIqoZXUUmuppZZKKi211FIrqZSWSkqpFAAAdOAAABBgRKWF2GnGlUfgiEKGCSgAABAEABiIkJlAoAAKDGQAwAFCghQAUFhgKF3oghAiSBdBFg9cOHHjiRtO6NAGABiIkJkAoRgiJGQDwARFhXQAsLjAKF3oghAiSBdBFg9cOHHjiRtO6NACAQAAAADgAQAfAAAHBhAR0VyGxgZHh8cHSIgIAAAAAAAAAAAAAACAT2dnUwAEgEwAAAAAAABbuqxDAgAAAAXrEPIoXFxgSCIlISUhHyIgJCQlIyInJistLS4tKCYvMi0tLiwsLy0rJx8cAQ5Fw1ikQvxCk9oxYqdkbE1HqgAAwCFfEwAwp7rwper+yjp2zvrzm0PcDueu91LXtyeH8qF1NZZfx+04sHl8odJoAf/go+w2AuC40ovqufdOAgD/z6wONtH18YsAKlcseBOlXDgmeqkwOgGCCvOE2E9aAGBuP153AABQE1XvK2sqRPVrpNXtjbQlUptVAjw5/I4EAJLxmuNwLTpd6EoXALbY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';
		case 4:
			return 'data:audio/ogg;base64,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CDChDBQasiIAiAIAAJxzzjnnnHPOOeecc84555xzzjnnGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGBADsRDgA7ERYCIWGrAQAwgEAAIQUgpJSKaWUEjnnpJRSSimllMhBCKWUUkoppUTSSSmllFJKKaVxUEoppZRSSimhlFJKKaWUUkoJpZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKAQAmDw4AUAk2zrCSdFY4GlxoyEoAIDcAAFCKOcYklJBKSCWEEErlGITOSQkptVZCCq2ECjponaOQUkutlZRKSZmEEEIooYRSWikltVIyCKGEUEoIIaVSSgmhZVBCCiWUlFJJLbRUSskghFBaCamV1FoKJZWUQSmphJJSKq21lEpKrYPSUimttdZKSiGVllIHpaSWUimltRZKa621TlIpLaTWUmutlVZKKZ2llEpJrbWWWmsppVZCKa200lopJbXWUmstldRaS62l1lJrraXWSiklpZZaa621lloqKbWUQimllZJCaqml1koqLYTQUkmllVZaaymllEooJZWUWiqptZZSaKWF0kpJJaWWSioppdRSKqGUElIqoZXUUmuppZZKKi211FIrqZSWSkqpFAAAdOAAABBgRKWF2GnGlUfgiEKGCSgAABAEABiIkJlAoAAKDGQAwAFCghQAUFhgKF3oghAiSBdBFg9cOHHjiRtO6NAGABiIkJkAoRgiJGQDwARFhXQAsLjAKF3oghAiSBdBFg9cOHHjiRtO6NACAQAAAADgAQAfAAAHBhAR0VyGxgZHh8cHSIgIAAAAAAAAAAAAAACAT2dnUwAAAMQAAAAAAAAO82oKAgAAAMPrFKBjAQohLi0mKzNEMzEvLzEuLy0sKy4tLCkrKSooKigsMC4wMC4pKigrKisqKi4tLissLCkpKysoJyknKSkoJyooKyooKiknJygoKigpKSYrJCcpJygpJiooKCcnKSgsKSYoKigpABJHb/MDAAAAAAAmRb8yAoCDDUTCAIDj+y/EDB9l90SA6ccHGx5fAgBT4h4SRfepHwAAF0CfgcPKBAaghA4AQtUEkePLE54HEAB5tqeYY1HVUApAUG2riEoGJkUfZQIABxdAn4HB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';
		case 5:
			return 'data:audio/ogg;base64,T2dnUwACAAAAAAAAAABTkcBlAAAAAEDdzkUBHgF2b3JiaXMAAAAAAcBdAAAAAAAAwF0AAAAAAACqAU9nZ1MAAAAAAAAAAAAAU5HAZQEAAADl8+YbDjv///////////////+aA3ZvcmJpcysAAABYaXBoLk9yZyBsaWJWb3JiaXMgSSAyMDEyMDIwMyAoT21uaXByZXNlbnQpAAAAAAEFdm9yYmlzIkJDVgEACAAAgCAKGcaA0JBVAAAQAABCiEbGUKeUBJeChRBHxFCHkPNQaukgeEphyZj0FGsQQgjfe8+99957IDRkFQAABABAGAUOYuAxCUIIoRjFCVGcKQhCCGE5CZZyHjoJQvcghBAu595y7r33HggNWQUAAAIAMAghhBBCCCGEEEIKKaUUUooppphiyjHHHHPMMcgggww66KSTTjKppJOOMsmoo9RaSi3FFFNsucVYa60159xrUMoYY4wxxhhjjDHGGGOMMcYIQkNWAQAgAACEQQYZZBBCCCGFFFKKKaYcc8wxx4DQkFUAACAAgAAAAABHkRTJkRzJkSRJsiRL0iTP8izP8ixPEzVRU0VVdVXbtX3bl33bd3XZt33ZdnVZl2VZd21bl3VX13Vd13Vd13Vd13Vd13Vd13UgNGQVACABAKAjOY4jOY4jOZIjKZIChIasAgBkAAAEAOAojuI4kiM5lmNJlqRJmuVZnuVpniZqogeEhqwCAAABAAQAAAAAAKAoiuIojiNJlqVpmuepniiKpqqqommqqqqapmmapmmapmmapmmapmmapmmapmmapmmapmmapmmapmmaQGjIKgBAAgBAx3Ecx1Ecx3EcyZEkCQgNWQUAyAAACADAUBRHkRzLsSTN0izP8jTRMz1XlE3d1FUbCA1ZBQAAAgAIAAAAAADA8RzP8RxP8iTP8hzP8SRP0jRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN04DQkFUAAAIAACCIQoYxIDRkFQAABACAEKKRMdQpJcGlYCHEETHUIeQ8lFo6CJ5SWDImPcUahBDC995z7733HggNWQUAAAEAEEaBgxh4TIIQQihGcUIUZwqCEEJYToKlnIdOgtA9CCGEy7m3nHvvvQdCQ1YBAIAAAAxCCCGEEEIIIYSQQkophZRiiimmmHLMMccccwwyyCCDDjrppJNMKumko0wy6ii1llJLMcUUW24x1lprzTn3GpQyxhhjjDHGGGOMMcYYY4wxgtCQVQAACAAAYZBBBhmEEEJIIYWUYoopxxxzzDEgNGQVAAAIACAAAADAUSRFciRHciRJkizJkjTJszzLszzL00RN1FRRVV3Vdm3f9mXf9l1d9m1ftl1d1mVZ1l3b1mXd1XVd13Vd13Vd13Vd13Vd13UdCA1ZBQBIAADoSI7jSI7jSI7kSIqkAKEhqwAAGQAAAQA4iqM4juRIjuVYkiVpkmZ5lmd5mqeJmugBoSGrAABAAAABAAAAAAAoiqI4iuNIkmVpmuZ5qieKoqmqqmiaqqqqpmmapmmapmmapmmapmmapmmapmmapmmapmmapmmapmmaJhAasgoAkAAA0HEcx3EUx3EcR3IkSQJCQ1YBADIAAAIAMBTFUSTHcixJszTLszxN9EzPFWVTN3XVBkJDVgEAgAAAAgAAAAAAcDzHczzHkzzJszzHczzJkzRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zRN0zQgNGQlAAAEAIAgx7SDJAmEoILkGcQcxKQZhaCC5DoGJcXkIaegYuQ5yZhB5ILSRaYiCA1ZEQBEAQAAxiDGEHPIOSelkxQ556R0UhoIoaWOUmeptFpizCiV2lKtDYSOUkgto1RiLa121EqtJbYCAAACHAAAAiyEQkNWBABRAACEMUgppBRijDnIHESMMegYZIYxBiFzTkHHHIVUKgcddVBSwxhzjkGooINUOkeVg1BSR50AAIAABwCAAAuh0JAVAUCcAIBBkjTN0jTPszTP8zxRVFVPFFXVEj3T9ExTVT3TVFVTNWVXVE1ZtjzRND3TVFXPNFVVNFXZNU3VdT1VtWXTVXVZdFXddm3Zt11ZFm5PVWVbVF1bN1VX1lVZtn1Xtm1fEkVVFVXVdT1VdV3VdXXbdF1d91RVdk3XlWXTdW3ZdWVbV2VZ+DVVlWXTdW3ZdF3ZdmVXt1VZ1m3RdX1dlWXhN2XZ92Vb131Zt5VhdF3bV2VZ901ZFn7ZloXd1XVfmERRVT1VlV1RVV3XdF1bV13XtjXVlF3TdW3ZVF1ZVmVZ911X1nVNVWXZlGXbNl1XllVZ9nVXlnVbdF1dN2VZ+FVX1nVXt41jtm1fGF1X901Z1n1VlnVf1nVhmHXb1zVV1X1Tdn3hdGVd2H3fGGZdF47PdX1flW3hWGXZ+HXhF5Zb14Xfc11fV23ZGFbZNobd941h9n3jWHXbGGZbN7q6Thh+YThu3ziqti10dVtYXt026sZPuI3fqKmqr5uua/ymLPu6rNvCcPu+cnyu6/uqLBu/KtvCb+u6cuy+T/lc1xdWWRaG1ZaFYdZ1YdmFYanaujK8um8cr60rw+0Ljd9XhqptG8ur28Iw+7bw28JvHLuxMwYAAAw4AAAEmFAGCg1ZEQDECQBYJMnzLMsSRcuyRFE0RVUVRVFVLU0zTU3zTFPTPNM0TVN1RdNUXUvTTFPzNNPUPM00TdV0VdM0ZVM0Tdc1VdN2RVWVZdWVZVl1XV0WTdOVRdV0ZdNUXVl1XVdWXVeWJU0zTc3zTFPzPNM0VdOVTVN1XcvzVFPzRNP1RFFVVVNVXVNVZVfzPFP1RE81PVFUVdM1ZdVUVVk2VdOWTVOVZdNVbdlVZVeWXdm2TVWVZVM1Xdl0Xdd2Xdd2XdkVdknTTFPzPNPUPE81TVN1XVNVXdnyPNX0RFFVNU80VVVVXdc0VVe2PM9UPVFUVU3UVNN0XVlWVVNWRdW0ZVVVddk0VVl2Zdm2XdV1ZVNVXdlUXVk2VVN2XVe2ubIqq55pyrKpqrZsqqrsyrZt667r6raomrJrmqpsq6qqu7Jr674sy7Ysqqrrmq4qy6aqyrYsy7ouy7awq65r26bqyrory3RZtV3f9m266rq2r8qur7uybOuu7eqybtu+75mmLJuqKdumqsqyLLu2bcuyL4ym6dqmq9qyqbqy7bqursuybNuiacqyqbqubaqmLMuybPuyLNu26sq67Nqy7buuLNuybQu77Aqzr7qyrbuybQurq9q27Ns+W1d1VQAAwIADAECACWWg0JCVAEAUAABgDGOMQWiUcs45CI1SzjkHIXMOQgipZM5BCKGkzDkIpaSUOQehlJRCCKWk1FoIoZSUWisAAKDAAQAgwAZNicUBCg1ZCQCkAgAYHEfTTNN1ZdkYFssSRVWVZds2hsWyRFFVZdm2hWMTRVWVZdvWdTRRVFVZtm3dV45TVWXZtn1dODJVVZZtW9d9I1WWbVvXhaGSKsu2beu+UUm2bV03huOoJNu27vu+cSzxhaGwLJXwlV84KoEAAPAEBwCgAhtWRzgpGgssNGQlAJABAAAYpJRRSimjlFJKKcaUUowJAAAYcAAACDChDBQasiIAiAIAAJxzzjnnnHPOOeecc84555xzzjnnGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGBADsRDgA7ERYCIWGrAQAwgEAAIQUgpJSKaWUEjnnpJRSSimllMhBCKWUUkoppUTSSSmllFJKKaVxUEoppZRSSimhlFJKKaWUUkoJpZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKAQAmDw4AUAk2zrCSdFY4GlxoyEoAIDcAAFCKOcYklJBKSCWEEErlGITOSQkptVZCCq2ECjponaOQUkutlZRKSZmEEEIooYRSWikltVIyCKGEUEoIIaVSSgmhZVBCCiWUlFJJLbRUSskghFBaCamV1FoKJZWUQSmphJJSKq21lEpKrYPSUimttdZKSiGVllIHpaSWUimltRZKa621TlIpLaTWUmutlVZKKZ2llEpJrbWWWmsppVZCKa200lopJbXWUmstldRaS62l1lJrraXWSiklpZZaa621lloqKbWUQimllZJCaqml1koqLYTQUkmllVZaaymllEooJZWUWiqptZZSaKWF0kpJJaWWSioppdRSKqGUElIqoZXUUmuppZZKKi211FIrqZSWSkqpFAAAdOAAABBgRKWF2GnGlUfgiEKGCSgAABAEABiIkJlAoAAKDGQAwAFCghQAUFhgKF3oghAiSBdBFg9cOHHjiRtO6NAGABiIkJkAoRgiJGQDwARFhXQAsLjAKF3oghAiSBdBFg9cOHHjiRtO6NACAQAAAADAAQAfAAAHBhAR0VyGxgZHh8cHSIgIAAAAAAAAAAAAAACAT2dnUwAAAJgAAAAAAABTkcBlAgAAANeRF2hNQklKSklOT0E7O0E+PD05OzpBQz46PDo4ODU3NDI2NDI3NDYxMzUzLTMwMS4wLi0sMi8wKjAtLy4wMzAuLjAwLC0tLS0tLC4sKioxNjgWU/ehQFEX45okR8mqKkCOXZPlmf/9yeLLvdx5tnMiX/qeefw1N39kaZ8GEZIf3Q08UgGAc5GaWVB617Xlb/kurgQSZXPiTaXCW0qr764efzGoOsa//PiNiIPxHrq//c/J6bXB375pYLkvGKPUNRe9v9EE7oHIOpCrAgD2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';
		case 6:
			return 'data:audio/ogg;base64,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CDChDBQasiIAiAIAAJxzzjnnnHPOOeecc84555xzzjnnGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGBADsRDgA7ERYCIWGrAQAwgEAAIQUgpJSKaWUEjnnpJRSSimllMhBCKWUUkoppUTSSSmllFJKKaVxUEoppZRSSimhlFJKKaWUUkoJpZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKAQAmDw4AUAk2zrCSdFY4GlxoyEoAIDcAAFCKOcYklJBKSCWEEErlGITOSQkptVZCCq2ECjponaOQUkutlZRKSZmEEEIooYRSWikltVIyCKGEUEoIIaVSSgmhZVBCCiWUlFJJLbRUSskghFBaCamV1FoKJZWUQSmphJJSKq21lEpKrYPSUimttdZKSiGVllIHpaSWUimltRZKa621TlIpLaTWUmutlVZKKZ2llEpJrbWWWmsppVZCKa200lopJbXWUmstldRaS62l1lJrraXWSiklpZZaa621lloqKbWUQimllZJCaqml1koqLYTQUkmllVZaaymllEooJZWUWiqptZZSaKWF0kpJJaWWSioppdRSKqGUElIqoZXUUmuppZZKKi211FIrqZSWSkqpFAAAdOAAABBgRKWF2GnGlUfgiEKGCSgAABAEABiIkJlAoAAKDGQAwAFCghQAUFhgKF3oghAiSBdBFg9cOHHjiRtO6NAGABiIkJkAoRgiJGQDwARFhXQAsLjAKF3oghAiSBdBFg9cOHHjiRtO6NACAQAAAADAAQAfAAAHBhAR0VyGxgZHh8cHSIgIAAAAAAAAAAAAAACAT2dnUwAAALQAAAAAAADazXppAgAAAMWX2mFbChkyNzs1NTIyMi4tKiwvLC4qLisrKysqLConLC0rKSorKyclKisuKykpKCcpKCwuKS4sKyoqKC0tKCsrListKigmKykqKCwpLiwpKS0qMS44NzI+PTlBRUE9QhpHPxcxBiIAAAAaRz8TMQYiGAgAgGY/v2j9YunFLUCBk6QBFkPj4gPURcuNZKrPGABg+v+Xr7pwunAOt+PMs/yXOeZv3XTPdaFJgMaflD4sSixgZRAGQ8KgKFHfMOv51WcCAPXwqrNpGurqH2OH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';
		
	}
	
}

/**
 * Check for page load and then continue!
 * Begin!
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













