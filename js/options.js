$(document).ready(function() { 
    var USERNAME = "#username",
        PASSWORD = "#password",
        SERVER_URL = "#server_url",
        keys = [USERNAME, PASSWORD, SERVER_URL];
        
    var get = function(key) {
        return localStorage[key] ? localStorage[key] : "";
    };
    var put = function(key, value) {
        localStorage[key] = value;
    };

    var load_default = function() {
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            $(key).val(get(key));
        };
        console.log('loaded');
    };
    load_default();

    $('.alert').hide(0);
    var hide_alert = function(duration) {
        duration = duration ? duration : 200;
        $('.alert').hide(duration);
    };
    var save_btn_click = function(evt) {
        console.log('saved')
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var val = $(key).val();
            put(key, val);
        };
        evt.preventDefault();
        var bkg = chrome.extension.getBackgroundPage();
        bkg.do_login();
        
        $('.alert').show(200);
        setTimeout(hide_alert, 3000);
    };

    $('#save_btn').click(save_btn_click);
});
