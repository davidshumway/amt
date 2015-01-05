A set of tools to improve Worker productivity on Amazon's Mechanical Turk website.

Adds a Tools button and Tools Menu. The tools edit parts of the user interface of the site, such as modifying the display of the job window. Other tools include a "Return and Accept" button, placing the cursor in the CAPTCHA text box, and so on.

✫ Modify the job window height

✫ Make the job window full width

✫ Modify the distance of job window from top of page

✫ Option to always enable "Automatically accept the next HIT" checkbox

✫ A button to turn off "Automatically accept the next HIT" checkboxes in all open tabs and windows (NEW FEATURE)

✫ Place the cursor in CAPTCHA box when a CAPTCHA appears

✫ If CAPTCHA is entered incorrectly, clears wrong answer from the CAPTCHA text box

✫ Show an alert notification on all job windows when any job window loads a CAPTCHA

✫ Play an alert notification sound when a CAPTCHA is first encountered

✫ Seven bell notifications to select from, or select Random

✫ "Return and Accept" button to return a current job and accept another job in the group

The extension's source code is on github.com: https://github.com/their/amt.

Notes:
There are no guarantees made regarding the safety of using this extension on Amazon's Mechanical Turk website. The extension's author is not responsible for any risks associated with the use of this extension.

Version History:
1.0.8 -- Fixed small bug, audio did not play in one case.

1.0.7 -- Removed base64 audio snippets. Removed adding audio snippets from Pastebin. Placed the audio .ogg files within the extension.

1.0.5 -- Added button 'Disable "Automatically accept the next HIT" in all tabs and windows'. Added click to the dimmer closes the menu. Added pressing "Enter" key while cursor is in any of the two input text fields, saves the settings and closes the menu. Enabled extension in Private Browsing mode. Enabled compatibility for Firefox for Android. Removed an unnecessary setInterval, replaced with addEventListener. Some other small layout changes added.

1.0.4 -- Layout edits. Default settings for new users/incognito users reset to none. Add Enable All/Disable All buttons. Add a button to reset iframe's offset top.

1.0.3 -- Note: A change in this version makes it necessary to re-enable "Allow in incognito". Add http://pastebin.com/raw.php?i=14R5zCYR to include_globs.  Turn on some settings by default for Incognito use and/or a first-time user (Height/Width, CAPTCHA focus, CAPTCHA audio/visual alert). Small layout changes (select field focus fix). Plays an audio alert in same tab 50 seconds after last audio alert (new), in a new tab 30 seconds after last audio alert (old), replay audio alert in same tab after 60 seconds (new). Remove "key" from manifest requires user to click check box for "Allow in Incognito".

Last Updated: January 5, 2015
