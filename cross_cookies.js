(function () {

    var cookieName = "_te";
    var cookieTime = 30; // days
    var measurement_id = "G-JQTQ82MB3Y";

    var axeptioConsentIdentifiers = {
        advertising: ['c:google', 'c:criteo'],
        statistics: ['c:googleana-4TXnJigR']
    }
    var didomiConsentIdentifiers = {
        advertising: ['c:google', 'c:criteo'],
        statistics: ['c:googleana-4TXnJigR']
    };
    var oneTrustConsentIdentifiers = {
        advertising: 'C0004',
        statistics: 'C0002'
    };
    var paramsCookie = ["nl_source", "nl_medium", "nl_campaign", "fbclid", "gclid", "utm_source", "utm_medium", "utm_name", "utm_term", "utm_campaign", "utm_content"];

    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        return parts.length > 1 ? parts.pop().split(";").shift() : null;
    }


    function getPartFromCookie(measurement_id) {
        var cookieName = "_ga_" + measurement_id.substring(2); // Skip first two characters (i.e., "G-")
        var cookieValue = getCookie(cookieName);
        if (cookieValue !== null) {
            var parts = cookieValue.split(".");
            if (parts.length > 2) {
                return parts[2];
            }
        }
        return null;
    }


    function getGaClientIdFromCookie() {
        var gaCookie = getCookie('_ga');
        if (gaCookie) {
            var parts = gaCookie.split('.');
            return parts[2] + '.' + parts[3];
        }
        return null;
    }

    function generateGaClientId() {
        return Date.now() + '.' + generateRandom(1000000000, 2147483647);
    }

    function get_top_domain() {
        var i, h, hostname = document.location.hostname.split('.'),
            weird_cookie = 'weird_get_top_level_domain=cookie';
        for (i = hostname.length - 1; i >= 0; i--) {
            h = hostname.slice(i).join('.');
            document.cookie = weird_cookie + ';domain=.' + h + ';';
            if (document.cookie.indexOf(weird_cookie) > -1) {
                document.cookie = weird_cookie.split('=')[0] + '=;domain=.' + h + ';expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                return h;
            }
        }
    }

    function setCookie(name, value, days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = name + "=" + (value || "") + "; SameSite=None; Secure; expires=" + date.toUTCString() + "; path=/; domain=" + get_top_domain();
    }

    function generateRandom(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getTimestampMillis() {
        return Date.now();
    }

    function generateUUID() {
        var d = new Date().getTime();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            d += performance.now(); // use high-precision timer if available
        }
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    var urlParsed = new URL(document.location);

    var subDomainIndex = get_top_domain().split('.').length - 1;

    function getFbcFromUrl() {
        if (urlParsed.searchParams.get('fbclid')) {
            return 'fb.' + subDomainIndex + '.' + getTimestampMillis() + '.' + decodeURIComponent(urlParsed.searchParams.get('fbclid'));
        }
        return null;
    }

    function generateFbc() {
        return null
    }

    function generateFbp() {
        return 'fb.' + subDomainIndex + '.' + getTimestampMillis() + '.' + generateRandom(1000000000, 2147483647);
    }

    var fbc = getFbcFromUrl() || getCookie('_fbc') || generateFbc();
    var fbp = getCookie('_fbp') || generateFbp();
    var gaClientId = getGaClientIdFromCookie();
    var isNewGaClientId = false;

    if (!gaClientId) {
        gaClientId = generateGaClientId();
        isNewGaClientId = true;
    }

    function hasConsented(category) {
        var dataLayer = window.dataLayer || [];

        // Ensure the category is valid for Didomi and OneTrust
        if (!didomiConsentIdentifiers[category] || !oneTrustConsentIdentifiers[category]) {
            console.error('Invalid consent category: ' + category);
            return false;
        }

        // Check Didomi consent
        var didomiConsentEntry = dataLayer.find(function (entry) {
            return entry.didomiVendorsConsent;
        });
        if (didomiConsentEntry) {
            var hasDidomiConsent = didomiConsentIdentifiers[category].some(function (id) {
                return didomiConsentEntry.didomiVendorsConsent.includes(id);
            });
            if (hasDidomiConsent) {
                return true;
            }
        }

        // Check OneTrust consent
        var oneTrustConsentEntry = dataLayer.find(function (entry) {
            return entry.OnetrustActiveGroups;
        });
        if (oneTrustConsentEntry && oneTrustConsentEntry.OnetrustActiveGroups.includes(oneTrustConsentIdentifiers[category])) {
            return true;
        }


        // Default to no consent if neither consent entry is found
        return false;
    }


    function getGaClientId() {
        var realGaClientId = getGaClientIdFromCookie();
        if (!realGaClientId) {
            // If real GA Client ID isn't available, use the generated one
            return generateGaClientId();
        }
        return realGaClientId;
    }

    function getSessionId() {
        var partFromCookie = getPartFromCookie(measurement_id);
        if (partFromCookie !== null) {
            return parseInt(partFromCookie);
        }
        return null; // Or handle as needed
    }

    function sanitizeCookieValue(cookieValue) {
        // Check if cookieValue is null or undefined
        if (cookieValue === null || cookieValue === undefined) {
            // Return a safe default, like an empty object, if the value is null or undefined
            return '{}';
        }

        // Implement remaining sanitization logic here
        // For example, checking if it's a valid JSON string
        if (cookieValue.charAt(0) === '{' && cookieValue.charAt(cookieValue.length - 1) === '}') {
            return cookieValue;
        } else {
            // Return a safe default if the cookie value doesn't look like a JSON object
            return '{}';
        }
    }


    function getDefaultAttributes() {
        // Return a default attributes object
        return {
            referrer: "direct"
        };
    }

    function updateGaClientIdAndSessionId() {
        // Reattempt to fetch the real GA Client ID if the current one was generated
        if (attributes.is_new_ga_client_id) {
            var realGaClientId = getGaClientIdFromCookie();
            if (realGaClientId) {
                attributes.ga_client_id = realGaClientId;
                attributes.is_new_ga_client_id = false; // Update the flag
            }
        }

        // Reattempt to fetch Session ID if it's not properly set
        var session_id = getSessionId();
        if (session_id !== null) {
            attributes.session_id = session_id;
        }
    }

    var gaClientId = getGaClientId(); // Always attempt to fetch the real GA client ID
    var session_id = getSessionId(); // Always attempt to fetch the session ID


    var attributes = {
        referrer: document.referrer.length ? document.referrer : "direct",
        fbc: fbc,
        fbp: fbp,
        session_id: session_id,
        ga_client_id: gaClientId,
        is_new_ga_client_id: isNewGaClientId,
        event_id_sign_up: generateUUID(),
        event_id_complete_registration: generateUUID(),
        event_id_purchase: generateUUID()
    };


    var existingCookie = getCookie(cookieName);
    if (existingCookie !== null) {
        var safeCookieValue = sanitizeCookieValue(existingCookie);
        try {
            var existingAttributes = JSON.parse(safeCookieValue);
            Object.assign(attributes, existingAttributes);
        } catch (e) {
            // Set existingAttributes to a default value if JSON parsing fails
            existingAttributes = getDefaultAttributes();
            // Optionally, reset the cookie to a default state
            // setCookie(cookieName, JSON.stringify(existingAttributes), cookieTime);
        }
    }


    // Identify new URL parameters
    var currentURLParams = {};
    var foundParamsInURL = false;

    paramsCookie.forEach(function (param) {
        // Validate that each param is a safe, expected value
        if (!/^[a-zA-Z0-9_]+$/.test(param)) {
            console.error('Invalid parameter in paramsCookie');
            return; // Skip this iteration
        }

        // Ensure the input size is reasonable
        if (param.length > 100) {
            console.error('Parameter too long in paramsCookie');
            return; // Skip this iteration
        }

        var regex = new RegExp("[?&]" + param + "(=([^&#]*)|&|#|$)");
        var results = regex.exec(urlParsed.href);
        if (results && results[2]) {
            currentURLParams[param] = decodeURIComponent(results[2].replace(/\+/g, " "));
            foundParamsInURL = true;
        }
    });

    // If any paramsCookie is found in the URL, merge new URL parameters with existing attributes and delete old ones not present in current URL
    if (foundParamsInURL) {
        paramsCookie.forEach(function (param) {
            if (currentURLParams.hasOwnProperty(param)) {
                attributes[param] = currentURLParams[param]; // Update or add new parameter
            } else {
                delete attributes[param]; // Remove parameter not present in current URL
            }
        });
    }


    if (getCookie(cookieName) !== null) {
        updateGaClientIdAndSessionId();
    }

    // Check for Google Analytics consent
    if (!hasConsented('statistics')) {
        // User has opted out
        attributes = { optOut: "opt-out" }; // Reset attributes and add only the opt-out attribute
    } else {
        attributes.optOut = "opt-in"; // Add an opt-in attribute
    }

    // Convert attributes to a JSON string
    var attributesString = JSON.stringify(attributes);

    if (paramsCookie.some(function (param) {
        return window.location.search.includes(param);
    }) || document.referrer.indexOf(get_top_domain()) == -1 || getCookie(cookieName) == null) {
        // No relevant URL parameters, referrer is the same domain, and cookie already exists
        setCookie(cookieName, attributesString, cookieTime);
    }


    if (getCookie(cookieName) !== null) {
        if (sanitizeCookieValue(existingCookie).indexOf('optOut') == -1) {
            setCookie(cookieName, attributesString, cookieTime);
        } else if (sanitizeCookieValue(existingCookie).indexOf('opt-int') == -1) {
            setCookie(cookieName, attributesString, cookieTime);
        }
    }

    return;


})();
