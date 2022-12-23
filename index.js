(function () {
  
    var cookieName = "_te";
    var cookieTime = 30; // days
    var paramsCookie = ["fbclid", "gclid", "utm_source", "utm_medium", "utm_name", "utm_term", "utm_campaign", "utm_content"];

    var getCookie = function(name) {
      // Split cookie string and get all individual name=value pairs in an array
      var cookieArr = document.cookie.split(";");
      
      // Loop through the array elements
      for(var i = 0; i < cookieArr.length; i++) {
          var cookiePair = cookieArr[i].split("=");
          
          /* Removing whitespace at the beginning of the cookie name
          and compare it with the given string */
          if(name == cookiePair[0].trim()) {
              // Decode the cookie value and return
              return decodeURIComponent(cookiePair[1]);
          }
      }
      
      // Return null if not found
      return null;
  }

  if (paramsCookie.some(function(param) { return window.location.search.includes(param); })) {
 
   var getClientID2 = function() {
      try {
        return ga.getAll()[0].get('clientId');
      } catch(e) {}
    }


    var getClientID1 = function() {
        try {
          var trackers = ga.getAll();
          var i, len;
          for (i = 0, len = trackers.length; i < len; i += 1) {
            if (trackers[i].get('trackingId') === "UA-21981538-1") {
              return trackers[i].get('clientId');
            }
          }
        } catch(e) {}  
        return getClientID2()
    }


    var get_top_domain = function(){
        var i,h,
          weird_cookie='weird_get_top_level_domain=cookie',
          hostname = document.location.hostname.split('.');
        for(i=hostname.length-1; i>=0; i--) {
          h = hostname.slice(i).join('.');
          document.cookie = weird_cookie + ';domain=.' + h + ';';
          if(document.cookie.indexOf(weird_cookie)>-1){
            // We were able to store a cookie! This must be it
            document.cookie = weird_cookie.split('=')[0] + '=;domain=.' + h + ';expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            return h;
          }
        }
    }


    var setCookie = function(name, value, days) {
        var expires = "";
        if (days) {
          var date = new Date();
          date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
          expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + "; SameSite=None; Secure; expires=" +expires + "; path=/; domain=" + get_top_domain();
    }

   var getTimestampMillis = function() {
        return Date.now();
    }

   var generateRandom = function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    var url = document.location.href;
    var fbc = getCookie('_fbc');
    var fbp = getCookie('_fbp');
    var urlParsed = (new URL(document.location));
    var subDomainIndex;
    if (url) {
      subDomainIndex = get_top_domain().split('.').length - 1;
    } else {
      subDomainIndex = 1;
    }
    
    
    if (urlParsed && urlParsed.searchParams.get('fbclid')) {
        if (
          !fbc ||
          (fbc &&
            fbc.split('.')[fbc.split('.').length - 1] !==
            decodeURIComponent(urlParsed.searchParams.get('fbclid')))
        ) {
          fbc =
            'fb.' +
            subDomainIndex +
            '.' +
            getTimestampMillis() +
            '.' +
            decodeURIComponent(urlParsed.searchParams.get('fbclid'));
        }
    }

    if (!fbp) {
        fbp =
          'fb.' +
          subDomainIndex +
          '.' +
          getTimestampMillis() +
          '.' +
          generateRandom(1000000000, 2147483647);
    }


    var attributes = {};
    if (getCookie(cookieName) !== null) {
        attributes = JSON.parse(getCookie(cookieName));
        Object.assign(attributes, {
          referrer: document.referrer.length ? document.referrer : "direct",
          ga_client_id: getClientID1(),
          fbc: fbc,
          fbp: fbp,
      });
      } else {
       attributes = {
          referrer: document.referrer.length ? document.referrer : "direct",
          ga_client_id: getClientID1(),
          fbc: fbc,
          fbp: fbp,
      }
    }

    for (var i = 0; i < paramsCookie.length; i++) {
        var param = paramsCookie[i];
        param = param.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + param + "(=([^&#]*)|&|#|$)");
        var results = regex.exec(window.location.href);
        if (results && results[2]) attributes[param] = decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    attributes = JSON.stringify(attributes);


    return setCookie(cookieName, attributes, cookieTime);

  }
})();