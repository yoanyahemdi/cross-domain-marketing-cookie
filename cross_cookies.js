(function () {

    var cookieName = "_te";
    var cookieTime = 30; // days
    var paramsCookie = ["fbclid", "gclid", "utm_source", "utm_medium", "utm_name", "utm_term", "utm_campaign", "utm_content"];

    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        return parts.length === 2 ? parts.pop().split(";").shift() : null;
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

    var fbp = getCookie('_fbp');
    var fbc = getCookie('_fbc');
    var urlParsed = new URL(document.location);
    function getFbcFromUrl() {
        if (urlParsed.searchParams.get('fbclid')) {
            return 'fb.' + subDomainIndex + '.' + getTimestampMillis() + '.' + decodeURIComponent(urlParsed.searchParams.get('fbclid'));
        }
        return null;
    }

    function generateFbc() {
        return 'fb.' + subDomainIndex + '.' + getTimestampMillis() + '.' + generateRandom(1000000000, 2147483647);
    }

    function generateFbp() {
        return 'fb.' + subDomainIndex + '.' + getTimestampMillis() + '.' + generateRandom(1000000000, 2147483647);
    }

    var fbc = getFbcFromUrl() || getCookie('_fbc') || generateFbc();
    var fbp = getCookie('_fbp') || generateFbp();

    var subDomainIndex = get_top_domain().split('.').length - 1;
    var gaClientId = getGaClientIdFromCookie();
    var isNewGaClientId = false;
    var eventID = generateRandom(1000000000, 2147483647);

    if (!gaClientId) {
        gaClientId = generateGaClientId();
        isNewGaClientId = true;
    }

    var attributes = {
        referrer: document.referrer.length ? document.referrer : "direct",
        fbc: fbc,
        fbp: fbp,
        ga_client_id: gaClientId,
        is_new_ga_client_id: isNewGaClientId,
        event_id: eventID
    };

    var existingCookie = getCookie(cookieName);
    if (existingCookie !== null) {
        var existingAttributes = JSON.parse(existingCookie);
        Object.assign(attributes, existingAttributes);
    }

    for (var i = 0; i < paramsCookie.length; i++) {
        var param = paramsCookie[i];
        param = param.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + param + "(=([^&#]*)|&|#|$)");
        var results = regex.exec(urlParsed.href);
        if (results && results[2]) attributes[param] = decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    attributes = JSON.stringify(attributes);


    if (paramsCookie.some(function (param) { return window.location.search.includes(param); })) {
        return setCookie(cookieName, attributes, cookieTime);
    } else if (document.referrer.indexOf('adcreative.ai') == -1) {
        return setCookie(cookieName, attributes, cookieTime);
    } else if (getCookie(cookieName) == null || getCookie(cookieName) == undefined) {
        return setCookie(cookieName, attributes, cookieTime);
    }

})();
