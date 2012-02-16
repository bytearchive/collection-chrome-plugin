var url_base, username, password;
var is_logined = false;
var csrf = "";

var update_setting = function() {
    url_base = localStorage['#server_url'];
    username = localStorage['#username'];
    password = localStorage['#password'];
};

var get_unread_count = function() { 
    unread_url = url_base + "/ajax/article/reading-count/"; 
    $.get(unread_url, function(data) {
        var count = JSON.parse(data).reading_count;
        chrome.browserAction.setBadgeText({text:String(count)});
    });
};

var update_reading_count = function(data) {
    chrome.browserAction.setBadgeText({text:".."});
    is_logined = true;
    get_unread_count();
    setInterval(get_unread_count, 1000 * 60 * 5);
};
var do_login = function() {
    chrome.browserAction.setBadgeText({text:"?"});
    update_setting();
    is_logined = false;
    var login_url = url_base + "/account/login/";
    $.get(login_url,
            function(html) {
                var doc = $(html);
                csrf = doc.find('input[name|=csrfmiddlewaretoken]').val();
                $.post(login_url, {
                    "csrfmiddlewaretoken": csrf,
                    "username": username,
                    "password": password,
                    "remember": "on"
                },
                function(data) {
                    console.log('login success');
                    update_reading_count(data);
                });
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
        var reading_url =  url_base + "/account/login/";
        chrome.tabs.create({url: reading_url});
    });
};
var subscribe = function(url, html, tags) {
    var subscribe_url = url_base + "/ajax/article/subscribe/"; 
    $.post(subscribe_url, { 'csrfmiddlewaretoken': csrf, 'url': url, 'html': html, 'tags': JSON.stringify(tags)},
            function(data) {
                update_reading_count(data);
            });
};

$(document).ready(function() { 
    do_login();
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
            sendResponse({response: 'done'});
        });
    });
}); 


