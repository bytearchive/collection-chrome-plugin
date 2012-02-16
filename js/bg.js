var is_logined = false;

var url_base;
var reading_url;
var login_url;
var subscribe_url;
var unread_url;

var username, password;
var csrf = "";

var update_setting = function() {
    var url_base = localStorage['#server_url'];
    reading_url = url_base + "/articles/";
    login_url = url_base + "/account/login/";
    subscribe_url = url_base + "/ajax/article/subscribe/"; 
    unread_url = url_base + "/ajax/article/reading-count/"; 

    username = localStorage['#username'];
    password = localStorage['#password'];
};

var get_unread_count = function() { 
    $.get(unread_url,
            function(data) {
                var count = JSON.parse(data).reading_count;
                chrome.browserAction.setBadgeText({text:String(count)});
            }
         );
};

var do_login = function() {
    chrome.browserAction.setBadgeText({text:"?"});
    update_setting();
    is_logined = false;
    $.get(login_url,
            function(html) {
                var doc = $(html);
                csrf = doc.find('input[name|=csrfmiddlewaretoken]').val();
                $.post(login_url, {
                    "csrfmiddlewaretoken": csrf,
                    "username": username,
                    "password": password,
                    "is_remember": "on"
                },
                function(data) {
                    console.log('login success');
                    chrome.browserAction.setBadgeText({text:".."});
                    is_logined = true;
                    get_unread_count();
                    setInterval(get_unread_count, 1000 * 60 * 5);
                }
                );
            }
         );
};

var go_reading = function() {
    chrome.tabs.getAllInWindow(undefined, function(tabs) {
        for (var i = 0, tab; tab = tabs[i]; i++) {
            if (tab.url && tab.url.indexOf(url_base) == 0) {
                chrome.tabs.update(tab.id, {selected: true});
                return;
            }
        }
        chrome.tabs.create({url: reading_url});
    });
};
var subscribe = function(url, html, tags) {
    $.post(subscribe_url, { 'csrfmiddlewaretoken': csrf, 'url': url, 'html': html, 'tags': JSON.stringify(tags)},
            function(data) {
                update_reading_count(data);
            });
};

$(document).ready(function() { 
    do_login();
    console.log('I am ready.');

    chrome.browserAction.onClicked.addListener(function(tab) {
        console.log('click on tab: ' + tab.id);
        go_reading();
    });
    chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
        chrome.tabs.getCurrent(function(tab) {
            var html = request.html;
            var url = request.url;
            var tags = request.tags;
            subscribe(url, html, tags);
            console.log('jobs done~');
        });
    });
}); 


