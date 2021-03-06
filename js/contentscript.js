$(document).ready(function() { 
    var img_url = chrome.extension.getURL("img/loading.gif");
    var done_url = chrome.extension.getURL("img/done.png");
    var loading = '<div id="loading-box"> <img height="24" width="24" src="' + img_url + '"> <div id="loading-text"> <span>Saving...</span> </div> </div>';
    var loadind_done = '<div id="loading-box"> <img height="24" width="24" src="' + done_url + '"> <div id="loading-text"> <span>Done!</span> </div> </div>';

    //function remove_unseen_elem($html) {
        //console.log($html.find('body :hidden'));
        //$html.find('body :hidden').detach();
    //}
    var remove_modal = function($html) {
        $html.find('.modal-backdrop').detach();
        $html.find('.modal').detach();
    };
    var subscribe_request = function(tags) {
        console.log('subscribing article..');
        var $html = $('html');
        //remove_unseen_elem($html);
        remove_modal($html);
        //console.log($html.html());
        $('body').append(loading);
        chrome.extension.sendRequest({"html": $html.html(), "url": document.URL, "tags": tags}, 
            function(response) {
                console.log(response);
                $('#loading-box').detach();
                $('body').append(loadind_done);
            });
    };

    $(document).bind('keydown', 'Ctrl+Shift+s', function() {
        subscribe_request([]);
    });

    var remove_tag = function($item) {
        $item.detach();
        var name = $item.find('.name').text();
        console.log('tag: ' + name + ' removed.');
    };

    var add_tag = function(name) {
        var item = $('<div class="tag"> <div class="arrow"></div> <div class="co"> <span class="name"></span> </div> </div>');
        item.find('span').text(name);
        $('#modal .tag-list').append(item);
        item.click(function() {
            remove_tag(item);
        });
        console.log('tag: ' + name + ' added.');
    };

    var modal = '<div id="modal" class="modal hide fade" style="display: none;">' + 
                    '<div class="modal-header">' +
                        '<a href="#" class="close" data-dismiss="modal">×</a>' +
                        '<h3>Article Added!</h3>' +
                    '</div>' +
                    '<div class="modal-body form-horizontal">' + 
                        '<div class="control-group">' +
                            '<label class="control-label" for="optionsCheckbox">Tags</label>' +
                            '<div class="controls">' +
                                '<div class="input-append">' +
                                    '<input id="tag-input" size="16" type="text">' +
                                    '<span class="add-on"><i class="icon-tags"></i></span>' +
                                '</div>' +
                                '<div class="tag-list"></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="modal-footer"> <a href="#" id="done-btn" class="btn btn-primary">Done</a></div>' + 
                '</div>';
    modal = $(modal);
    $('body').append(modal);
    $(document).bind('keydown', 'Ctrl+Shift+t', function() {
        console.log('pop up modal');
        $('#modal').modal('show');
    });
    $('#modal').on('shown', function () {
        $('#tag-input').focus();
    });

    $("#modal .tag-list .tag").click(function() {
        var tag = $(this);
        remove_tag(tag);
    });
    $("#modal #tag-input").bind('keydown', 'return', function() {
        var tag = $(this).val();
        $('#tag-input').val("");
        if (tag) {
            add_tag(tag);
        }
    });
    $('#done-btn').click(function() {
        $('#modal').modal('hide');
        var tags = [];
        $('.tag-list .name').each(function() {
            tags.push($(this).text());
        });
        console.log(tags);

        subscribe_request(tags);
    });
    
});
