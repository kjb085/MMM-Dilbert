Module.register('MMM-Dilbert', {

    /**
     * List of default configurations
     *
     * @type {Object}
     */
    defaults: {
    	type: 'today', // Options: 'today', 'random'
        headerType: 'default', // Options: 'default', 'title'

        // Today type only
        updateHour: 3, // What hour on 24 hour basis to update module

        // Random type only
        updateInterval: 1, // How frequently to update the module in hours

        // Toggles
        showHeader: true,
        showRating: true,
        showTitleBelowImage: true,

        // Allow users to customize styling by merging properties passed in here
        // with those listed in the default styles property
        customStyles: {},

        // Debugging
        autoCorrect: true, // Module will attempt to refresh more frequently
        refreshPeriod: 2, // In minutes
        autoCorrectAttemptLimit: 5,
	},

    /**
     * Default styles to apply to designated DOM elements
     *
     * @type {Object}
     */
    defaultStyles: {
        container: {
            maxWidth: '50vw',
        },
        title: {
            fontSize: '0.8em',

        },
        stars: {
            fontSize: '1em',
            color: '#af2f27',
        }
    },

    /**
     * List of object
     *
     * @type {Object}
     */
    timeInMilliseconds: {
        oneHour: 1000 * 60 * 60,
        oneMinute: 1000 * 60,
    },

    /**
     * Id of the module html wrapepr - mostly for CSS scoping purposes
     *
     * @type {String}
     */
    moduleId: 'mmm-dilbert',

    /**
     * Id of the status of the module - initial state is loading
     *
     * @type {Number}
     */
    status: 1,

    /**
     * Status options
     *
     * @type {Object}
     */
    statuses: {
        ok: 0,
        loading: 1,
        error: 2,
        autoCorrectMode: 3,
        terminatedAutoCorrectMode: 4,
    },

    /**
     * HTML to render
     *
     * @type {String}
     */
    html: null,

    /**
     * Id value of the interval timer
     *
     * @type {Number}
     */
    updater: null,

    /**
     * NUmber of attempts since auto correction mode started
     *
     * @type {Number}
     */
    autoCorrectAttempts: 0,

    /**
     * URL for users to create an issue
     *
     * @type {String}
     */
    issuesUrl: 'github.com/kjb085/MMM-Dilbert/issues',

    /**
     * Return an array of CSS files to include
     *
     * @return {Array}
     */
    getStyles () {
        return [
            'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
            this.file('assets/MMM-Dilbert.css'),
        ];
    },

    /**
     * Send socket notification with user configuration
     *
     * @return {void}
     */
    start () {
        Log.info(`Starting module: ${this.name}`);

        this.setConfigCustomStyles();

        this.initializeUpdate();

        this.setUpdateInterval();
    },

    /**
     * Perform a custom config/default merge to retain all default styles, unless overridden by
     * user plus add any new styles included by user
     *
     * NOTE: I recognize this is completely unnecessary. The default styles could easily be in css
     * and just allow the style tag to handle the overriding, but this was more just something
     * I was playing around with to be a little bit React with css which I've decided to leave.
     *
     * @return {void}
     */
    setConfigCustomStyles () {
        let defaultStyles = this.defaultStyles,
            customStyles = {},
            config = this.config,
            helper = this.helper;

        Object.keys(defaultStyles).forEach(function (key) {
            let styles = defaultStyles[key];

            if (helper.argumentExists(config.customStyles[key])) {
                 styles = Object.assign(defaultStyles[key], config.customStyles[key]);
            }

            customStyles[key] = styles;
        });

        this.config.customStyles = customStyles;
    },

    /**
     * Send config to backend to create web request
     *
     * @return {void}
     */
    initializeUpdate () {
        console.log('initializing update');
        this.sendSocketNotification('DILBERT_CONFIG', { config: this.config });
    },

    /**
     * Create the interval to request new html from backend
     *
     * @return {void}
     */
    setUpdateInterval () {
        let intervalTime = this.getIntervalTime();

        this.unsetUpdateInterval();

        this.updater = setInterval(() => {
            if (this.shouldInitializeUpdate()) {
                this.initializeUpdate();
            }
        }, intervalTime);
    },

    /**
     * Get config defined interval time used to trigger DOM updates
     *
     * - For the 'random' type, determine the config defined update interval in hours
     * - For the 'today'/default type, return 1 hour as to process a comparison of the config
     *   defined update hour
     *
     * @return {Number}
     */
    getIntervalTime () {
        if (this.isAutoCorrecting()) {
            return this.timeInMilliseconds.oneMinute * this.config.refreshPeriod;
        } else if (this.config.type === 'random') {
            return this.timeInMilliseconds.oneHour * this.config.updateInterval;
        } else {
            return this.timeInMilliseconds.oneHour;
        }
    },

    /**
     * Return true if a DOM update should be initialized
     *
     * @return {Boolean}
     */
    shouldInitializeUpdate () {
        if (this.isAutoCorrecting() || this.config.type === 'random') {
            return true;
        } else {
            return this.timeIsInUpdateHour();
        }
    },

    /**
     * Determine if the current hour matches the update hour
     *
     * @return {Boolean}
     */
    timeIsInUpdateHour () {
        let now = new Date(),
            currentHour = now.getHours();

        return currentHour === this.config.updateHour;
    },

    /**
     * Disable update interval if it's enabled
     *
     * @return {void}
     */
    unsetUpdateInterval () {
        if (this.updater) {
            clearInterval(this.updater);
            this.updater = null;
        }
    },

    /**
     * Handle notification from node_helper and rerender DOM
     *
     * @param  {String} notification
     * @param  {Object} payload
     * @return {void}
     */
    socketNotificationReceived (notification, payload) {
        if (notification === 'DILBERT_COMIC') {
            this.html = payload.html;
            this.status = this.statuses.ok;

            if (this.isAutoCorrecting()) {
                this.disableAutoCorrection(true);
            }
        } else if (notification === 'DILBERT_COMIC_ERROR') {
            if (!this.isAutoCorrecting() && this.config.autoCorrect) {
                console.log('here1');
                this.initializeAutoCorrection();
            } else if (!this.isTerminatedAutoCorrect() && this.config.autoCorrect) {
                console.log('here2');
                this.autoCorrectAttempts++;

                if (this.shouldDisableAutoCorrection()) {
                    this.disableAutoCorrection(false);
                }
            } else if (!this.config.autoCorrect) {
                console.log('here3');
                this.status = this.status.error;
            }
        }

        this.updateDom();
    },

    /**
     * Set module into auto correction mode where it attempts to get
     * a valid response in quick succession
     *
     * @return {void}
     */
    initializeAutoCorrection () {
        this.status = this.statuses.autoCorrectMode;
        this.setUpdateInterval();
    },

    /**
     * Return true if auto correction attempts have hit limit
     *
     * @return {Boolean}
     */
    shouldDisableAutoCorrection () {
        return this.autoCorrectAttempts === this.config.autoCorrectAttemptLimit;
    },

    /**
     * Take module out of auto correction mode
     *
     * @param {Boolean} displayTerminatedMessage
     * @return {void}
     */
    disableAutoCorrection (isCorrected) {
        this.autoCorrectAttempts = 0;
        this.setUpdateInterval();

        if (!isCorrected) {
            this.status = this.statuses.terminatedAutoCorrectMode;
        }
    },

    /**
     * Return true if status is ok
     *
     * @return {Boolean}
     */
    isOk () {
        return this.status === this.statuses.ok;
    },

    /**
     * Return true if module is in the process of auto correcting
     *
     * @return {Boolean}
     */
    isAutoCorrecting () {
        return this.status === this.statuses.autoCorrectMode;
    },

    /**
     * Return true if module has terminated auto correct mode and
     * is still in a state of error
     *
     * @return {Boolean}
     */
    isTerminatedAutoCorrect () {
        return this.status === this.statuses.terminatedAutoCorrectMode;
    },

    /**
     * Get HTML element to be displayed
     *
     * @NOTE: We're forced to create the div element and include server side html
     *        as MM expects an element to be returned by getDom
     *
     * @return {Element}
     */
    getDom () {
        console.log('getting dom');
        console.log(this.status);

        let wrapper = document.createElement('div');

        wrapper.id = this.moduleId;

        if (this.isOk() && this.helper.isString(this.html)) {
            wrapper.innerHTML = this.html;
        } else {
            wrapper.innerHTML = '<h2>' + this.getStatusMessage() + '</h2>';
        }

        return wrapper;
    },

    /**
     * Get display message based off of the current status
     *
     * @return {String}
     */
    getStatusMessage () {
        switch (this.status) {
            case this.statuses.error:
                return '<h3>An error has occured.<br>Please check your internet connection and restart the mirror.</h3>';
            case this.statuses.loading:
                return '<h2>LOADING...</h2>';
            case this.statuses.ok: // This is an error as this should not be called on an ok status
                return '<h3>Templating error - please create an issue on Github</h3>';
            case this.statuses.autoCorrectMode:
                return '<h3>Module is in Auto Correct Mode<br>Polling www.dilbert.com to rectify the error<br>' +
                    `Attempt: ${this.autoCorrectAttempts}</h3>`;
            case this.statuses.terminatedAutoCorrectMode:
                return '<h4>Auto Correct Mode failed to rectify the error.<br>' +
                    'Module is falling back to standard updating.<br>' +
                    'Please check your internet connection or consider restarting the mirror.</h4>';
            default: // There's no scenario where this should display - hence the message
                return "<h3>Something's gone terribly wrong...<br>" +
                    `Please create an issue at ${this.issuesUrl}</h3>`;
        }
    },

    /**
     * Helper functions
     *
     * @type {Object}
     */
    helper: {
        /**
         * Determine if the argument is undefined or null
         *
         * @param  {mixed} arg
         * @return {Boolean}
         */
        argumentExists (variable) {
            return typeof variable !== 'undefined' && variable !== null;
        },

        /**
         * Determine if the argument is a string
         *
         * @param  {mixed}  variable
         * @return {Boolean}
         */
        isString (variable) {
            return typeof variable === 'string' || variable instanceof String;
        },

        /**
         * Determine if the argument is a string or a number
         *
         * @param  {mixed}  variable
         * @return {Boolean}
         */
        isScalar (variable) {
            return (/boolean|number|string/).test(typeof variable);
        },

        /**
         * Return true is an object is empty
         *
         * @param  {Object} object
         * @return {Boolean}
         */
        objectIsEmpty (object) {
            return JSON.stringify(object) === JSON.stringify("{}");
        }
    }
});
