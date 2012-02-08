function remove_unseen_elem($html) {
    $html.find('body :hidden').detach();
}


chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    var $html = $('html');
    remove_unseen_elem($html);
    sendResponse({html: $html.html()});
    console.log('yes my lord');
});
