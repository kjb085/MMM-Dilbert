# MMM-Dilbert #

This module is used to display Dilbert comics from www.dilbert.com created by the great Scott Adams ([@ScottAdamsSays](https://twitter.com/ScottAdamsSays)). Despite limited functionality, the module has considerable configurability and comes with an autocorrect feature to ensure that the module can overcome any temporary networking hiccups may otherwise require the mirror to be restarted to overcome.

## End User Dependencies ##

Just an installation of [Magic Mirror<sup>2</sup>](https://github.com/MichMich/MagicMirror) and a have working internet connection.

## Installation ##

1. Run `git clone https://github.com/kjb085/MMM-Dilbert.git` in the directory `~/MagicMirror/modules`
2. Run `npm install --production` to install the required dependencies
3. Add MMM-Dilber to your config file `~/MagicMirror/config/config.js`

```
{
	module: "MMM-Dilbert",
	position: "top_right",
	config: {
    	...
	}
}
```

## Example ##

![image](https://imgur.com/nhUdFe4.png)

```
config: {
	headerType: 'title',
	showTitleBelowImage: false,
}
```

## Config Options ##

#### Primary ####

Option  | Default | Description
------- | ------- | -------------
`type`  | `'today'` | What day's Dilbert comic to display<br><br>Options `today`, `random`
`headerType` | `default` | Header display content defaulting "Daily Dilbert" or the comics title<br>Note: If comic does not have a title, default will be displayed<br><br>Options: `default`, `title`
`showHeader` | `true` | Whether or not to display the hader
`showTitleBelowImage` | `true` | Whether or not to display the comic's title below the comic<br><br>Note: Not all comics have a title
`showRating` | `true` | Show the star rating of the comic
`customStyles` | `{}` | Custom CSS to be applied to elements of the module with style name written in camel case. Applicable elements: `container`, `title`, `stars`<br><br>Example: `{ container: { maxHeight: 25vh }, title: { fontSize: 1em, color: '#af2f27' } }`

### Today Type Only ###

Option  | Default | Description
------- | ------- | -------------
`updateHour` | `3` | At what hour the module should request a new comic from www.dilbert.com<br><br>NOTE: New comics do not appear to be released at midnight EST, so I've set this default to 3am, which should be safe for most users to ensure the current day's comic is always displayed

### Random Type Only ###

Option  | Default | Description
------- | ------- | -------------
`updateInterval` | `1` | How frequently to update the comic displayed by the module in hours

#### Auto Correction ####

Option  | Default | Description
------- | ------- | -------------
`autoCorrect` | `true` | When this is set to true, the module will attempt to update more frequently if there's an error retrieving comic data from www.dilbert.com
`refreshPeriod` | `2` | How frequently to attempt to request valid comic data from the site in minutes
`autoCorrectAttemptLimit` | `5` | How many attempts to make before aborting auto correction and falling back to a default update state


## Dev Dependencies ##

If you plan on modifying the existing code, these tools will be helpful as the the css was created using sass. Once you have npm installed, simply run `npm install` for the subsequent npm packages to be installed.

* npm
* node-sass
* nodemon
* handlebars
* cheerio

**Note**: To make use of the installed packages run the below commands:

* `npm run build-css` to compile scss to css and running
* `npm run watch-css` will watch the scss file for changes and compile on save
* `npm run compile-hb` to compile changes made to the html template
* `npm run view-complete` to compile handlebars and build css from scss

## To Do ##

There is no timeline or guarantee than any of these will be accomplished. Willing to review pull requests if anyone else wants to take these on.

* Write tests
* Add ability to cycle through user defined comics
* Explore taking this concept and create a generic web scraper module that allows complete configurability via a config
