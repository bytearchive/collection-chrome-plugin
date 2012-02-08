$(document).ready(function() { 
    console.log('cat is ready.');

    var login_url = "http://reader/account/login/";
    var base_url = "http://reader/ajax/article/";
    var subscribe_url = base_url + "subscribe/";
    var unread_url = base_url + "reading-count/";
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
    chrome.browserAction.onClicked.addListener(function(tab) {
        console.log('click on tab: ' + tab.id);
        chrome.tabs.sendRequest(tab.id, {}, function(response) {
            var html = response.html;
            subscribe(tab.id, tab.url, html);
        });
    });
}); 


