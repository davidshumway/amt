Version History:

1.1.1 -- Update styles. Add support for workersandbox.mturk.com.

1.1.0 -- Fix to match changed "return task" elements at mturk.com.

1.0.9 -- In Firefox 34 calls to localStorage.hasOwnProperty() causes the script to exit prematurely. This is now fixed. Fix to a TypeError in Chrome.

1.0.8 -- Fixed small bug, audio did not play in one case.

1.0.7 -- Removed base64 audio snippets. Removed adding audio snippets from Pastebin. Placed the audio .ogg files within the extension.

1.0.5 -- Added button 'Disable "Automatically accept the next HIT" in all tabs and windows'. Added click to the dimmer closes the menu. Added pressing "Enter" key while cursor is in any of the two input text fields, saves the settings and closes the menu. Enabled extension in Private Browsing mode. Enabled compatibility for Firefox for Android. Removed an unnecessary setInterval, replaced with addEventListener. Some other small layout changes added.

1.0.4 -- Layout edits. Default settings for new users/incognito users reset to none. Add Enable All/Disable All buttons. Add a button to reset iframe's offset top.

1.0.3 -- Note: A change in this version makes it necessary to re-enable "Allow in incognito". Add http://pastebin.com/raw.php?i=14R5zCYR to include_globs. Turn on some settings by default for Incognito use and/or a first-time user (Height/Width, CAPTCHA focus, CAPTCHA audio/visual alert). Small layout changes (select field focus fix). Plays an audio alert in same tab 50 seconds after last audio alert (new), in a new tab 30 seconds after last audio alert (old), replay audio alert in same tab after 60 seconds (new). Remove "key" from manifest requires user to click check box for "Allow in Incognito".

Last Updated: June 20, 2015
