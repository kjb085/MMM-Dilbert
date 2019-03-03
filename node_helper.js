/* Magic Mirror
 * Module: MMM-Dilbert
 *
 * By kjb085 https://github.com/kjb085/MMM-Dilbert
 */
const cheerio = require('cheerio');
const requestP = require('request-promise');
const NodeHelper = require('node_helper');
const Handlebars = require('handlebars/runtime');
const Helpers = require('./view/handlebars_helpers.js')
const ViewTemplate = require('./view/view.chb.js');

module.exports = NodeHelper.create({

    /**
     * Base url for all requests
     *
     * @type {String}
     */
    baseUrl: 'http://www.dilbert.com/strip/',

    /**
     * Last day of every month
     *
     * @type {Array}
     */
    lastDays: [
        31, // Jan
        28, // Feb - leap year is accounted for in getLastDateOfMonth()
        31, // Mar
        30, // Apr
        31, // May
        30, // Jun
        31, // Jul
        31, // Aug
        30, // Sep
        31, // Oct
        30, // Nov
        31, // Dec
    ],

    /**
     * Earliest year accepted for the random setting
     *
     * @type {Number}
     */
    earliestYear: 1990,

    /**
     * Log the the helper has started
     *
     * @return {void}
     */
    start () {
        console.log(`Starting module helper: ${this.name}`);
    },

    /**
     * For valid requests, send response html
     *
     * @param  {String} notification
     * @param  {Object} payload
     * @return {void}
     */
    async socketNotificationReceived (notification, payload) {
        let config, comicData, templateData, html;

        if (notification === 'DILBERT_CONFIG') {
            config = payload.config;
            comicData = await this.getComicData(config);

            if (comicData.success) {
                templateData = this.getTemplateData(comicData, config);
                html = Handlebars.templates['view.hb.html'](templateData);

                this.sendResponse(html);
            } else {
                this.sendError(comicData.error);
            }
        }
    },

    /**
     * Make request to reddit and get comic data
     *
     * @return {mixed}
     */
    getComicData (config) {
        let options = {
                uri: this.getUrl(config),
                transform: (body) => {
                    return cheerio.load(body);
                },
            },
            comic = {};

        return requestP(options)
            .then(($) => {
                comic.source = $('.img-comic').attr('src');
                comic.title = $('.comic-title-name').text();
                comic.rating = $('meta', '.star-rating').attr('value');
                comic.success = true;

                return comic;
            })
            .catch((error) => {
                comic.success = false;
                comic.error = error;

                return comic;
            });
    },

    /**
     * Get data used to build html
     *
     * @param  {Object} comic
     * @param  {Object} config
     * @return {Object}
     */
    getTemplateData (comic, config) {
        return {
            header: {
                show: config.showHeader,
                isTitle: config.headerType === 'title' && comic.title !== '',
            },
            info: {
                showTitle: config.showTitleBelowImage && comic.title !== '',
                showRating: config.showRating,
                formatedRating: this.getRatingData(comic.rating),
            },
            comic: comic,
            customStyles: this.getCustomStyles(config),
        };
    },

    /**
     * Return any custom css to be applied
     *
     * @param  {Object} config
     * @return {Object}
     */
    getCustomStyles (config) {
        let customStyles = {};

        for (let elementName in config.customStyles) {
            if (config.customStyles.hasOwnProperty(elementName)) {
                customStyles[elementName] = this.buildStyleFromConfig(config, elementName);
            }
        }

        return customStyles;
    },

    /**
     * Get string to pass to the style attribtue of the given element
     *
     * @return {String}
     */
     buildStyleFromConfig (config, elementName) {
        let style = '',
            propertiesToCheck = config.customStyles[elementName];

        for (let configKey in propertiesToCheck) {
            if (propertiesToCheck.hasOwnProperty(configKey)) {
                let cssName = this.camelCaseToDashSeperated(configKey),
                    value = config.customStyles[elementName][configKey];

                // Ensure value is not null
                if (value) {
                    style += `${cssName}: ${value}; `;
                }
            }
        }

        return style;
    },

    /**
     * Translate a camel case string to a dash seperated string
     *
     * @param  {String} string
     * @return {String}
     */
    camelCaseToDashSeperated (string) {
        return string.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();});
    },

    /**
     * Get object to be used by template to render rating stars
     *
     * @param  {String} ratingString
     * @return {Object}
     */
    getRatingData (ratingString) {
        let rating = parseFloat(ratingString),
            halfStars;

        // Sometimes this attribute doesn't come through,
        // but by and large, the rating is 4.5 stars so
        // default to that
        if (isNaN(rating)) {
            rating = 4.5;
        }

        halfStars = (rating % 1) !== 0 ? 1 : 0;

        if (halfStars) {
            rating -= 0.5;
        }

        return {
            full: rating,
            half: halfStars,
            empty: 5 - rating - halfStars,
        }
    },

    /**
     * Get Dilbert URL based on user configuration
     *
     * @param  {Object} config
     * @return {String}
     */
    getUrl (config) {
        let url = this.baseUrl,
            date = this.getFullDateString(config.type);

        return url + date;
    },

    /**
     * Get date string used in URL
     *
     * @param  {String} type
     * @return {String}
     */
    getFullDateString (type) {
        let today = new Date(),
            isRandom = type === 'random',
            currentYear = today.getFullYear(),
            year = isRandom ? this.getRandomYear(this.earliestYear, currentYear) : currentYear,
            isCurrentYear = currentYear === year,
            month = this.getMonth(today, isRandom, isCurrentYear),
            date = this.getDate(today, month, year, isRandom, isCurrentYear);

        return [year, month, date].join('-');
    },

    /**
     * Get randomized year
     *
     * @param  {Number} startYear
     * @param  {Number} currentYear
     * @return {Number}
     */
    getRandomYear (startYear, currentYear) {
        return this.getRandomInt(startYear, currentYear)
    },

    /**
     * Get the current month or randomized month depending on user config
     *
     * @param  {Date}  today
     * @param  {Boolean} isRandom
     * @param  {Boolean} isCurrentYear
     * @return {String}
     */
    getMonth (today, isRandom, isCurrentYear) {
        let month = today.getMonth() + 1,
            max = isCurrentYear ? month : 12;

        if (isRandom) {
            month = this.getRandomInt(1, max);
        }

        return this.getFormattedTime(month);
    },

    /**
     * Get current date or randomized date depending on user input
     *
     * @param  {Date}  today
     * @param  {String}  month
     * @param  {Number}  year
     * @param  {Boolean} isRandom
     * @param  {Boolean} isCurrentYear
     * @return {String}
     */
    getDate (today, month, year, isRandom, isCurrentYear) {
        let date = today.getDate(),
            max;

        if (isRandom) {
            max = isCurrentYear ? date : this.getLastDateOfMonth(month);
            date = this.getRandomInt(1, max);
        }

        return this.getFormattedTime(date);
    },

    /**
     * Return the last date of the given month and year
     *
     * @param  {mixed} month
     * @param  {Number} year
     * @return {Number}
     */
    getLastDateOfMonth (month, year) {
        let monthIndex = parseInt(month) - 1,
            lastDate = this.lastDays[monthIndex],
            isLeapYear = (year % 4) === 0;

        if (monthIndex === 1 && isLeapYear) {
            lastDate++;
        }

        return lastDate;
    },

    /**
     * Get a random integer between a given min and max
     *
     * @param  {Number} min
     * @param  {Number} max
     * @return {Number}
     */
    getRandomInt (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    },

    /**
     * Prepend a 0 for any single digit number
     *
     * @param  {Number} number
     * @return {mixed}
     */
    getFormattedTime (number) {
        if (number < 10) {
            return "0" + number;
        }

        return number;
    },

    /**
     * Send message containing valid content
     *
     * @param  {Object} message
     * @return {void}
     */
    sendResponse (html) {
        this.sendSocketNotification('DILBERT_COMIC', { html: html });
    },

    /**
     * Send an error to the frontend
     *
     * @param  {String} error
     * @return {void}
     */
    sendError (error) {
        console.log(error);
        this.sendSocketNotification('DILBERT_COMIC_ERROR', { message: error });
    },
});
