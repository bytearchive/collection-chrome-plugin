$(document).ready(function() { 
    function remove_unseen_elem($html) {
        $html.find('body :hidden').detach();
    }

    $(document).bind('keydown', 'shift+s', function() {
        var $html = $('html');
        remove_unseen_elem($html);
        console.log('yes my lord');
        chrome.extension.sendRequest({"html": $html.html(), "url": document.URL }, function(response) {
            console.log(response);
        });
    });
});
