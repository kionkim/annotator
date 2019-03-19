$(document).ready(function() {
    
    conv = conv.replace(/&quot;/g, '"')
               .replace(/&gt;/g, '>')
               .replace(/&#39;/g, '\'')
    var conv = JSON.parse(conv)
    var act = JSON.parse(act.replace(/&#39;/g, '"'))
    var intent = JSON.parse(intent.replace(/&#39;/g, '"'))
    var slot = JSON.parse(slot.replace(/&#39;/g, '"'))
    console.log('act =' + act.length);
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
    for (x = 0; x < slot.length; x ++){
        var element = $('<option>' + slot[x] + '</option>');
        elements.push(element)
    }
    $('#slot').append(elements);

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

    var conv_to_show = 'TTXX_355'
    $('<span class="glyphicon glyphicon-comment"></span> Chat - ' + conv['results'][0]['name']).appendTo('.chat_header')
    generateChatBody(conv['results'][0], '.panel-body msg_container_base')

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
        if ((e2.pageX - mouseXPosition) < 0) {
            focusTag = selection.anchorNode.parentNode;
            anchorTag = selection.focusNode.parentNode;
        }
        if (selectedText.length === (endPoint - startPoint)) {
            highlighted = true;

            if (anchorTag.className !== "highlight") {
                highlightSelection();
            } else {
                var afterText = selectedText + "<span class = 'highlight'>" + anchorTag.innerHTML.substr(endPoint) + "</span>";
                anchorTag.innerHTML = anchorTag.innerHTML.substr(0, startPoint);
                anchorTag.insertAdjacentHTML('afterend', afterText);
            }

        }else{
            if(anchorTag.className !== "highlight" && focusTag.className !== "highlight"){
                highlightSelection();  
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
            highlightSelection();
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
        
        //renderConv_info(turn_id)
        $('input[id="turn_id"]').val(turn_id);
        $('input[id="conv_intent"]').val(turn_id);
        $('input[id="sentence_intent"]').val(turn_id);
        $('input[id="ner"]').val(turn_id);

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
});


function highlightSelection() {
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
            var span = document.createElement('span');
            span.className = 'highlight';
            span.textContent = selection.toString();
            selection.deleteFromDocument();
            range.insertNode(span);
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
  text = conv['sentences'][i]['text']
  speaker = conv['sentences'][i]['speaker']
  for (var i = 0; i < conv_length; i++) {
      if (speaker === '고객') {
        console.log("a" + speaker + ":" + text)
        sent_body = generateSentBody(text)
        sent_body.appendTo(container) 
      } else {
        console.log("b" + speaker + ":" + text)
        received_body = generateReceivedBody(text)
        received_body.appendTo(container) 
      }
  }
}

function generateSentBody(turn, text){
    body = '<div class="row msg_container base_sent">'
    body += '<div class="col-md-10"><div class="messages msg_sent" id = "turn_' + turn + '">'
    body += '<p>' + text + '</p></div>'
    body += '<div class="col-md-2 avatar"><img src="../../static/images/plus.png" class=" img-responsive "></div>'
    body += '</div>'
    return body
}

function generateReceivedBody(turn, text){
    body = '<div class="row msg_container base_receive">'
    body += '<div class="col-md-2 avatar"><img src="../../static/images/plus.png" class=" img-responsive "></div>'
    body += '<div class="col-md-10"><div class="messages msg_receive" id = "turn_' + turn + '">'
    body += '<div class="col-md-2"><input id="a" class="imgclick" style="outline: none;" type="image" src="../../static/images/plus.png" width="20px" height="20px" border="0"'
    body += '<div><p>' + text + '</p></div>'
    body += '</div>'
    return body
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