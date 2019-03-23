$(document).ready(function() {

    var conv = getIntitalData();
    var original_dialogue ;
    var turn_id;
    var tag_seq = 0;
    var cur_tag = tag_seq;
    var selectedText;
    var slot_on_work;
    var start_pos;
    var end_pos;
    var startPoint;
    var endPoint;
    var anchorTag;
    var focusTag;
    conv = conv[0];
    act = JSON.parse(act.replace(/&#39;/g, '"'));
    intent = JSON.parse(intent.replace(/&#39;/g, '"'));
    slot = JSON.parse(slot.replace(/&#39;/g, '"'));

    // Set menu
    set_menus(act, intent, slot);

    // Set css
    set_css(slot);

    // Set comm title
    $('<span class="glyphicon glyphicon-comment">' + conv['name'] + '</span>' ).appendTo('.chat_head');
    
    // SET dialogue
    original_dialogue = generateChatBody(conv, '.msg_container_base');

    $.each(original_dialogue, function(key, value){
        console.log(key + ':' + value);
    })
    
    $("#btn-chat").click( function(event) {
        alert("You clicked the button using JQuery!");
        console.log('You clicked the button')
    });

    // Hightlight script: https://jsfiddle.net/Bilalchk123/1o4j0w2v/
    // Highlight when conversation clicked
    $(".messages").mousedown(function (e1) {
        mouseXPosition = e1.pageX;//register the mouse down position
        mouseYPosition = e1.pageY;//register the mouse down position
        $(".messages").removeClass("selectedConv");
        $(this).addClass("selectedConv")
        console.log('highlighted area = ' + $(this).attr('id'))
        cur_turn_id = $(this).attr('id')
    });

    // Highlight when text selected
    $(".messages").mouseup(function (e2) {
        slot_on_work = $('#slot').find(':selected').text();
        var highlighted = false;
        selection = window.getSelection();
        selectedText = selection.toString();
        startPoint = window.getSelection().getRangeAt(0).startOffset;
        endPoint = window.getSelection().getRangeAt(0).endOffset;
        anchorTag = selection.anchorNode.parentNode;
        focusTag = selection.focusNode.parentNode;

        if ((e2.pageX - mouseXPosition) < 0) {
            focusTag = selection.anchorNode.parentNode;
            anchorTag = selection.focusNode.parentNode;
        }
        if (selectedText.length === (endPoint - startPoint)) {
            highlighted = true;

            if (anchorTag.className !== "highlight") {
                highlightSelection(cur_turn_id, tag_seq, slot_on_work);
            } else {
                var afterText = selectedText + "<span class = 'highlight'>" + anchorTag.innerHTML.substr(endPoint) + "</span>";
                anchorTag.innerHTML = anchorTag.innerHTML.substr(0, startPoint);
                anchorTag.insertAdjacentHTML('afterend', afterText);
            }
        }else{
            if(anchorTag.className !== "highlight" && focusTag.className !== "highlight"){
                highlightSelection(cur_turn_id, tag_seq, slot_on_work);  
                highlighted = true;
            }
        }

        if (anchorTag.className === "highlight" && focusTag.className === 'highlight' && !highlighted) {
            highlighted = true;
            console.log('trigger deleting highlight')
            var afterHtml = anchorTag.innerHTML.substr(startPoint);
            var outerHtml = selectedText.substr(afterHtml.length, selectedText.length - endPoint - afterHtml.length);
            var anchorInnerhtml = anchorTag.innerHTML.substr(0, startPoint);
            var focusInnerHtml = focusTag.innerHTML.substr(endPoint);
            var focusBeforeHtml = focusTag.innerHTML.substr(0, endPoint);
            selection.deleteFromDocument();
            anchorTag.innerHTML = anchorInnerhtml;
            focusTag.innerHTml = focusInnerHtml;
            var anchorafterHtml = afterHtml + outerHtml + focusBeforeHtml;
            anchorTag.insertAdjacentHTML('afterend', anchorafterHtml);
        }

        if (anchorTag.className === "highlight" && !highlighted) {
            highlighted = true;
            var Innerhtml = anchorTag.innerHTML.substr(0, startPoint);
            var afterHtml = anchorTag.innerHTML.substr(startPoint);
            var outerHtml = selectedText.substr(afterHtml.length, selectedText.length);
            selection.deleteFromDocument();
            anchorTag.innerHTML = Innerhtml;
            anchorTag.insertAdjacentHTML('afterend', afterHtml + outerHtml);
         }
        
        if (focusTag.className === 'highlight' && !highlighted) {
            highlighted = true;
            var beforeHtml = focusTag.innerHTML.substr(0, endPoint);
            var outerHtml = selectedText.substr(0, selectedText.length - beforeHtml.length);
            selection.deleteFromDocument();
            focusTag.innerHTml = focusTag.innerHTML.substr(endPoint);
            outerHtml += beforeHtml;
            focusTag.insertAdjacentHTML('beforebegin', outerHtml );
        }

        if (!highlighted) {
            highlightSelection(cur_turn_id, tag_seq, slot_on_work);
        }
        $('.highlight').each(function(){
            if($(this).html() == ''){
                $(this).remove();
            }
        });

        selection.removeAllRanges();

        renderConv_info(cur_turn_id)
        //log_selection_info(mouseXPosition, mouseYPosition, selectedText, startPoint, endPoint, anchorTag, focusTag);        
        if (selectedText.length > 0){
            renderConv_info(cur_turn_id);
            //start_pos = original_dialogue[cur_turn_id] selectedText
            //log_selection_info(mouseXPosition, mouseYPosition, selectedText, startPoint, endPoint, anchorTag, focusTag);        
            $(".popup-overlay, .popup-content").removeClass("active");
            tag_seq += 1;
            a = $(window).innerWidth();
            b = $('.popup-content').outerWidth();
            
            $(".popup-overlay, .popup-content").addClass("active").css({
                left: Math.min(mouseXPosition, (a - b)),
                top: mouseYPosition + 20
            });
            $('#value').val(selectedText);
            console.log('*&*&*&*&*&&* tag_seq ' + tag_seq)
            
        }
        
    });

    $("#dialogue_plus").click(function(){
        _turn_id = parseInt(turn_id.split('_')[1]) + 1;
        console.log('_turn_id = ' + _turn_id);
        _html = generateReceivedBody(_turn_id , '');
        console.log('_html = ' + _html);
        $(this).append(_html);
    });

    $("#slot").change(function (){
        slot_color = $(this).val();
        cur_slot_text = $('#slot option:selected').text();
        console.log('ITEM SELECTION slot_text = ' + cur_slot_text);
        console.log('span.entity.' + cur_turn_id + '_seq_' + cur_tag);
        console.log('cur tag = ' + cur_tag);
        console.log('span.entity_value.' + cur_turn_id + '_seq_' + cur_tag);
        $('span.entity.' + cur_turn_id + '_seq_' + cur_tag).text(cur_slot_text + ': ');
        $('span.entity_value.' + cur_turn_id + '_seq_' + cur_tag).removeClassRegExp(/^entity_/)
        .addClass('entity_value')
        .addClass('entity_' + cur_slot_text)
        .addClass(turn_id + '_seq_' + cur_tag);
        //log_selection_info(mouseXPosition, mouseYPosition, selectedText, startPoint, endPoint, anchorTag, focusTag);

    });

    $.fn.removeClassRegExp = function (regexp) {
        console.log('******* triggered')
        if(regexp && (typeof regexp==='string' || typeof regexp==='object')) {
            regexp = typeof regexp === 'string' ? regexp = new RegExp(regexp) : regexp;
            $(this).each(function () {
                $(this).removeClass(function(i,c) { 
                    var classes = [];
                    $.each(c.split(' '), function(i,c) {
                        if(regexp.test(c)) { classes.push(c); }
                    });
                    return classes.join(' ');
                });
            });
        }
        return this;
    };
});


function highlightSelection(turn_id, tag_seq, slot) {
    var selection;

    //Get the selected stuff
    if (window.getSelection)
        selection = window.getSelection();
    else if (typeof document.selection != "undefined")
        selection = document.selection;

    //Get a the selected content, in a range object
    var range = selection.getRangeAt(0);

    //If the range spans some text, and inside a tag, set its css class.
    if (range && !selection.isCollapsed) {
        if (selection.anchorNode.parentNode == selection.focusNode.parentNode) {
            console.log('**** slot on work = '+ slot)
            var span_entity_tag = document.createElement('span');
            span_entity_tag.className = 'highlight entity ' + turn_id  + '_seq_' + tag_seq;
            span_entity_tag.id = slot;
            span_entity_tag.textContent = slot  + ': ';
            
            var span_entity_value = document.createElement('span');
            span_entity_value.className = 'highlight entity_value entity_' + slot + ' ' + turn_id + '_seq_' + tag_seq;
            span_entity_value.id = slot;
            span_entity_value.textContent = selection.toString();
            selection.deleteFromDocument();
            range.insertNode(span_entity_value);
            range.insertNode(span_entity_tag);
            cur_tag = tag_seq;
            console.log('current tag = ' + cur_tag);
        }
    }
}

// Generate chat-body
function generateChatBody(conv, container) {
  var conv_length = conv['sentences'].length;
  var original_text = {};
  for (var i = 0; i < conv_length; i++) {
      text = conv['sentences'][i]['text'];
      speaker = conv['sentences'][i]['speaker'];
      dialogue_key = 'turn_' + i * 10;
      original_text[dialogue_key] = text;
      if (speaker === 'Customer') {
        sent_body = generateReceivedBody(i * 10, text);
        $(sent_body).appendTo(container);
      } else {
        received_body = generateSentBody(i * 10, text);
        $(received_body).appendTo(container);
      }
  }
  $.each(original_text, function(key, value){
    console.log('aa = ' + key + ':' + value);
  });
  return original_text;
}

function generateSentBody(turn, text){
    body = '<div class="row msg_container base_sent">'
    body += '<div class="col-md-10"><div class="messages msg_sent" id = "turn_' + turn + '"><p>' + text + '</p></div>'
    body += '</div>'
    body += '<div class="col-md-2 avatar"><img src="../../static/images/avatar.png" class=" img-responsive "></div>'
    body += '</div>'
    return body
}

function generateReceivedBody(turn, text){
    body = '<div class="row msg_container base_receive">'
    body += '<div class="col-md-2 avatar"><img src="../../static/images/avatar.png" class=" img-responsive "></div>'
    body += '<div class="col-md-10"><div class="messages msg_receive col-md-10" id = "turn_' + turn + '">' + '<p>' + text + '</p></div>'
    body += '<div class="col-md-2"><input id="dialogue_plus" class="imgclick" style="outline: none;" type="image" src="../../static/images/plus.png" width="20px" height="20px" border="0"></div>'
    body += '</div>'
    return body
}

function aggregateChat(){
    $$('.messages').each()
}

// Image button action
$(".imgclick").mousedown(function(){
    var mrgtb = parseInt($(this).css("margin-top"));
    var mrglf = parseInt($(this).css("margin-left"));
    mrgtb=mrgtb+3;
    mrglf=mrglf+3;
        $(this).css("margin-top",mrgtb+"px").css("margin-left",mrglf+"px");
}).mouseup(function(){
    var mrgtb = parseInt($(this).css("margin-top"));
    var mrglf = parseInt($(this).css("margin-left"));
    mrgtb=mrgtb-3;
    mrglf=mrglf-3;
        $(this).css("margin-top",mrgtb+"px").css("margin-left",mrglf+"px");
}); 

function getIntitalData(){
    var value= $.ajax({ 
        url: '../../static/data/conv_1.json', 
        async: false
    }).responseText;
    return JSON.parse(value);
}

function renderConv_info(turn_id, intent, acts, slots){
    $('input[id="turn_id_input"]').val(turn_id);
    $('input[id="sentence_intent_input"]').val(intent);
    $('input[id="acts_input"]').val(acts);
    $('input[id="slots_input"]').val(slots);
}
function log_selection_info(mouseXPosition, mouseYPosition, selectedText, startPoint, endPoint, anchorTag, focusTag){
    console.log('mouseXPosition = ' + mouseXPosition);
    console.log('mouseYPosition = ' + mouseYPosition);
    console.log('selectedText = ' + selectedText);
    console.log('startPoint = ' + startPoint);
    console.log('endPoint = ' + endPoint);
    console.log('anchorTag = ' + anchorTag.Innerhtml);
    console.log('focusTag = ' + focusTag.toString);
}

function set_menus(act, intent, slot){
    // Set menu for act
    var elements = []
    for (x = 0; x < act.length; x ++){
        var element = $('<option>' + act[x] + '</option>');
        elements.push(element)
    }
    $('#act').append(elements);

    // Set menu for slot
    var elements = []
    $.each(slot, function(key){
        value = Object.keys(slot[key])[0];
        elements.push($('<option value = "' + slot[key][value] + '">' + value + '</option>'));
    });
    $('#slot').append(elements);

    // Set menu for sentence intent
    var elements = []
    for (x = 0; x < intent.length; x ++){
        var element = $('<option>' + intent[x] + '</option>');
        elements.push(element)
    }
    $('#sentence_intent').append(elements);
}
    
    
function set_css(slot){
    // Set css
    $.each(slot, function(key){
        var style = document.createElement('style');
        style.type = 'text/css';
        value = Object.keys(slot[key])[0];
        ctnt = '.highlight.entity_' + value + "{background-color: rgba" + slot[key][value] + "; color: white; border-radius: 0px 5px 5px 0px;}";
        style.innerHTML = ctnt;
        document.getElementsByTagName('head')[0].appendChild(style);
    });
}
    

    

    

    

    