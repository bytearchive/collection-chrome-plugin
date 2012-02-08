$(document).ready(function() { 
    console.log('cat is ready.');
    var debug = true;
    var url_base = debug ? "http://127.0.0.1:8000/" : "http://reader/";
    var reading_url = url_base + "articles/";
    var login_url = url_base + "account/login/";
    var ajax_url_base = url_base + "ajax/article/";
    var subscribe_url = ajax_url_base + "subscribe/";
    var unread_url = ajax_url_base + "reading-count/";
    var csrf = "";

    var update_reading_count = function(data) {
        var count = JSON.parse(data).reading_count;
        chrome.browserAction.setBadgeText({text:String(count)});
    };
    var get_unread_count = function() { 
        $.get(unread_url,
            function(data) {
                update_reading_count(data);
            }
        );
    };
    var do_login = function() {
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

                        get_unread_count();
                        setInterval(get_unread_count, 1000 * 60 * 5);
                    }
                );
            }
        );
    };
    chrome.browserAction.setBadgeText({text:"?"});
    do_login();

    var subscribe = function(tab_id, url, html) {
        $.post(subscribe_url, { 'csrfmiddlewaretoken': csrf, 'url': url, 'html': html},
            function(data) {
                update_reading_count(data);
            });
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

    chrome.browserAction.onClicked.addListener(function(tab) {
        console.log('click on tab: ' + tab.id);
        go_reading();
        //chrome.tabs.sendRequest(tab.id, {}, function(response) {
            //var html = response.html;
            //subscribe(tab.id, tab.url, html);
        //});
    });
}); 


