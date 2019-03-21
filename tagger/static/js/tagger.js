$(document).ready(function() {
    conv = conv.replace(/&quot;/g, '"')
               .replace(/&gt;/g, '>')
               .replace(/&#39;/g, '\'')
    conv = JSON.parse(conv)
    act = JSON.parse(act.replace(/&#39;/g, '"'))
    intent = JSON.parse(intent.replace(/&#39;/g, '"'))

    console.log(slot)
    console.log(typeof(slot))
    slot = JSON.parse(slot.replace(/&#39;/g, '"'))
    console.log(typeof(slot))
    console.log('slot =' + slot);
    console.log('intent =' + intent.length);
    

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

    var slot_on_work = $('#slot').find(':selected').text();

    console.log('slot on work = ' + slot_on_work)

    // Set menu for sentence intent
    var elements = []
    for (x = 0; x < intent.length; x ++){
        var element = $('<option>' + intent[x] + '</option>');
        elements.push(element)
    }
    $('#sentence_intent').append(elements);

    // Set menu for conv intent
    var elements = []
    for (x = 0; x < intent.length; x ++){
        var element = $('<option>' + intent[x] + '</option>');
        elements.push(element)
    }
    $('#conv_intent').append(elements);

    // Set css
    $.each(slot, function(key){
        value = Object.keys(slot[key])[0];
        console.log(value + ':' + slot[key][value]);
        $('.highlight.entity_name' +value).css({'background-color': slot[key][value], 'color': 'white', 'border-radius': '0px 5px 5px 0px'});
    });
    var conv_to_show = 'TTXX_355'
    $('<span class="glyphicon glyphicon-comment"></span> Chat - ' + conv['results'][0]['name']).appendTo('.chat_header')
    generateChatBody(conv['results'][0], '.msg_container_base')


    var turn_id = '0';
    var selectedTextList = [];


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
        turn_id = $(this).attr('id')
    });

    // Highlight when text selected
    $(".messages").mouseup(function (e2) {
        console.log('mouseup triggered')
        
        var highlighted = false;
        var selection = window.getSelection();
        var selectedText = selection.toString();
        var startPoint = window.getSelection().getRangeAt(0).startOffset;
        var endPoint = window.getSelection().getRangeAt(0).endOffset;
        var anchorTag = selection.anchorNode.parentNode;
        var focusTag = selection.focusNode.parentNode;
        console.log('Selected text = ' + selectedText.length)
        console.log('Selected text = ' + slot_on_work)
        if ((e2.pageX - mouseXPosition) < 0) {
            focusTag = selection.anchorNode.parentNode;
            anchorTag = selection.focusNode.parentNode;
        }
        if (selectedText.length === (endPoint - startPoint)) {
            highlighted = true;

            if (anchorTag.className !== "highlight") {
                highlightSelection(turn_id, slot_on_work);
            } else {
                var afterText = selectedText + "<span class = 'highlight'>" + anchorTag.innerHTML.substr(endPoint) + "</span>";
                anchorTag.innerHTML = anchorTag.innerHTML.substr(0, startPoint);
                anchorTag.insertAdjacentHTML('afterend', afterText);
            }

        }else{
            if(anchorTag.className !== "highlight" && focusTag.className !== "highlight"){
                highlightSelection(turn_id, slot_on_work);  
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
            highlightSelection(turn_id, slot_on_work);
        }
        $('.highlight').each(function(){
            if($(this).html() == ''){
                $(this).remove();
            }
        });
        selection.removeAllRanges();

        console.log('mouseXPosition = ' + mouseXPosition)
        console.log('mouseYPosition = ' + mouseYPosition)
        console.log('**** = ' + selectedText.length)
        // popup reference: https://www.pair.com/support/kb/how-to-use-jquery-to-generate-modal-pop-up-when-clicked/
        
        renderConv_info(turn_id)
        //$('input[id="turn_id"]').val(turn_id);
        //$('input[id="conv_intent"]').val(turn_id);
        //$('input[id="sentence_intent"]').val(turn_id);
        //$('input[id="ner"]').val(turn_id);

        if (selectedText.length > 0){
            $(".popup-overlay, .popup-content").removeClass("active");
            selectedTextList.push(turn_id + ':' + selectedText)
            console.log('selectedTextList = ' + selectedTextList)
            $(".popup-overlay, .popup-content").addClass("active")
            .css({
                left: Math.min(mouseXPosition, $(window).innerWidth()-$('.popup-content').outerWidth()),
                top: mouseYPosition + 20
            });
            $('#value').val(selectedText);
        }
        
    });
    $("#slot").change(function (){
        slot_color = $(this).val();
        slot_text = $('#slot option:selected').text();
        console.log('slot_color = ' + slot_color);
        console.log('turn_id = ' + turn_id)
        $('span.entity_' + turn_id + '_' + '0').text(slot_text + ': ');
        $('.highlight.entity_' + turn_id + '_' + '0').css({'background-color': 'rgba(' +slot_color + ')'});
    });

    conv_list = [["A", "B", "C", "D"], ["AA", "AB", "AC", "AD"]];
    console.log('******' + conv_list)
    $('#slot_table').DataTable({
        data: conv_list,
        columns: [
            { title: "Slot" },
            { title: "Value" },
            { title: "Start" },
            { title: "End"}
        ]
    } );
    

    //plugin bootstrap minus and plus
//http://jsfiddle.net/laelitenetwork/puJ6G/
$('.btn-number').click(function(e){
    e.preventDefault();
    
    fieldName = $(this).attr('data-field');
    type      = $(this).attr('data-type');
    var input = $("input[name='"+fieldName+"']");
    var currentVal = parseInt(input.val());
    if (!isNaN(currentVal)) {
        if(type == 'minus') {
            
            if(currentVal > input.attr('min')) {
                input.val(currentVal - 1).change();
            } 
            if(parseInt(input.val()) == input.attr('min')) {
                $(this).attr('disabled', true);
            }

        } else if(type == 'plus') {

            if(currentVal < input.attr('max')) {
                input.val(currentVal + 1).change();
            }
            if(parseInt(input.val()) == input.attr('max')) {
                $(this).attr('disabled', true);
            }

        }
    } else {
        input.val(0);
    }
});
$('.input-number').focusin(function(){
   $(this).data('oldValue', $(this).val());
});
$('.input-number').change(function() {
    
    minValue =  parseInt($(this).attr('min'));
    maxValue =  parseInt($(this).attr('max'));
    valueCurrent = parseInt($(this).val());
    
    name = $(this).attr('name');
    if(valueCurrent >= minValue) {
        $(".btn-number[data-type='minus'][data-field='"+name+"']").removeAttr('disabled')
    } else {
        alert('Sorry, the minimum value was reached');
        $(this).val($(this).data('oldValue'));
    }
    if(valueCurrent <= maxValue) {
        $(".btn-number[data-type='plus'][data-field='"+name+"']").removeAttr('disabled')
    } else {
        alert('Sorry, the maximum value was reached');
        $(this).val($(this).data('oldValue'));
    }
    
    
});
$(".input-number").keydown(function (e) {
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
             // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) || 
             // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });

});


function highlightSelection(turn_id, slot) {
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
            span_entity_tag.className = 'highlight entity entity_' + turn_id  + '_' + '0';
            span_entity_tag.id = slot;
            span_entity_tag.textContent = slot  + ': ';
            
            var span_entity_value = document.createElement('span');
            span_entity_value.className = 'highlight entity_value entity_value_' + turn_id + '_' + '0';
            span_entity_value.id = slot;
            span_entity_value.textContent = selection.toString();
            selection.deleteFromDocument();
            range.insertNode(span_entity_value);
            range.insertNode(span_entity_tag);
            
//                        range.surroundContents(span);
        }
    }
}

function renderConv_info(conv_id, turn_id){
    $.ajax({
        type: "POST",
        url: "someurl.php",
        data: "id=" + id + "&name=" + name,
        success: function(msg){
                    alert( "Data Saved: " + msg );
                    $('input[id="turn_id"]').val(turn_id);
                    $('input[id="conv_intent"]').val(turn_id);
                    $('input[id="sentence_intent"]').val(turn_id);
                    $('input[id="ner"]').val(turn_id);
                 }
        
   });
}

// Generate chat-body
function generateChatBody(conv, container) {
  conv_length = conv['sentences'].length
  
  for (var i = 0; i < conv_length; i++) {
      text = conv['sentences'][i]['text']
      speaker = conv['sentences'][i]['speaker']
      if (speaker === '고객') {
        sent_body = generateSentBody(i, text)
        $(sent_body).appendTo(container) 
      } else {
        received_body = generateReceivedBody(i, text)
        $(received_body).appendTo(container) 
      }
  }
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
    body += '<div class="col-md-2"><input id="a" class="imgclick" style="outline: none;" type="image" src="../../static/images/plus.png" width="20px" height="20px" border="0"></div>'
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