
   // This code is an adaptation to the SOURCE CODE: https://github.com/bilbof/purser
   
   (function (window) {
    "use strict";
    var params = ["fbclid", "gclid", "utm_source", "utm_medium", "utm_name", "utm_term", "utm_campaign", "utm_content"];
    
  
    var getCookie2 = function(name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(';');
      for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
      }
      return null;
    }
  
    var tagexpert = window.tagexpert || window.tagexpert || {
      getCookie2:  function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
          var c = ca[i];
          while (c.charAt(0)==' ') c = c.substring(1,c.length);
          if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
      },
      getTe: function(){
        var _te = getCookie2('_te');
        _te = JSON.parse(_te);
        var newte = _te || '';
        return newte;
      },
      fetch: function(){
        return JSON.parse(window.localStorage.getItem("tagexpert_visitor"));
      },
      destroy: function(){
        return window.localStorage.removeItem("tagexpert_visitor");
      },
      convert: function(obj) {
        var attributes = this.update(obj);
        attributes.converted_at = new Date().toISOString();
        attributes.conversion_page = window.location.origin + window.location.pathname;
        attributes.visits_at_conversion = (attributes.visits || []).length;
        attributes.pageviews_before_conversion = attributes.pageviews || 0;
        window.localStorage.setItem("tagexpert_visitor", JSON.stringify(attributes));
        return attributes;
      },
      update: function(obj) {
        var attributes = this.fetch();
        if (!attributes) { attributes = tagexpert.create(); }
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            attributes[key] = obj[key];
          }
        }
        window.localStorage.setItem("tagexpert_visitor", JSON.stringify(attributes));
        return attributes;
      },
      createInstance: function() {
        var attributes = {
          referrer: document.referrer.length ? document.referrer : "direct",
          browser_timezone: new Date().getTimezoneOffset()/60,
          browser_language: window.navigator.language,
          landing_pagee: window.location.origin + window.location.pathname,
          screen_height: window.screen.height,
          screen_width: window.screen.width,
          fbp: this.getTe().fbp,
          fbc: this.getTe().fbc,
          gclid: this.getTe().gclid,
          ga_client_id: this.getTe().ga_client_id,
          te_campaign: this.getTe().utm_campaign,
          te_source: this.getTe().utm_source,
          te_medium: this.getTe().utm_medium,
        };
        for (var i = 0; i < params.length; i++) {
          var param = params[i];
          param = param.replace(/[\[\]]/g, "\\$&");
          var regex = new RegExp("[?&]" + param + "(=([^&#]*)|&|#|$)");
          var results = regex.exec(window.location.href);
          if (results && results[2]) attributes[param] = decodeURIComponent(results[2].replace(/\+/g, " "));
        }
        return attributes;
      },
      create: function() {
        var attributes = this.createInstance();
        attributes.last_visit = parseInt(new Date().getTime()/1000);
        attributes.pageviews = 1;
        attributes.first_website_visit = new Date().toISOString();
        window.localStorage.setItem("tagexpert_visitor", JSON.stringify(attributes));
        return attributes;
      },
      visits: {
        recently: function() {
          var attributes = tagexpert.fetch();
          if (!attributes.last_visit) return false;
          var timeDiffInHours = (parseInt(new Date().getTime()/1000) - attributes.last_visit)/3600;
          return timeDiffInHours < 0.5; // last visited less than half an hour ago.
        },
        create: function() {
          var attributes = tagexpert.fetch();
          attributes.visits = attributes.visits || [];
          var visit = tagexpert.createInstance();
          visit.id = (((1+Math.random())*0x10000)|0).toString(16).substring(1);
          visit.date = new Date().toISOString();
          attributes.visits.push(visit);
          attributes.last_visit = parseInt(new Date().getTime()/1000);
          tagexpert.update(attributes);
          return attributes;
        },
        fetch: function(id) {
          var attributes = tagexpert.fetch();
          var visit = attributes.visits.filter(function(visit) {
            return visit.id === id;
          })[0];
          visit.index = attributes.visits.map(function(visit) {
            return visit.id;
          }).indexOf(id);
          return visit;
        },
        update: function(id, obj) {
          var visit = tagexpert.visits.fetch(id);
          var attributes = tagexpert.fetch();
  
          for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
              visit[key] = obj[key];
            }
          }
          attributes.visits[visit.index] = visit;
          return tagexpert.update(attributes);
        },
        delete: function(id) {
          var attributes = tagexpert.fetch();
          var visit = tagexpert.visits.fetch(id);
          attributes.visits = attributes.visits.splice(visit.index, 1);
          return tagexpert.update(attributes);
        },
        all: function() {
          var attributes = tagexpert.fetch();
          return attributes.visits || [];
        }
      },
      pageviews: {
        add: function() {
          var attributes = tagexpert.fetch();
          attributes.pageviews = attributes.pageviews + 1 || 1;
          return tagexpert.update(attributes);
        }
      }
    };
    if (!tagexpert.fetch()) {
      tagexpert.create();
    } else {
      if (!tagexpert.visits.recently()) {
        tagexpert.visits.create();
      }
      tagexpert.pageviews.add();
    }
    window.tagexpert = tagexpert;
  }(window));
  