$(document).ready(function() {
    console.log('conv_json =' + conv)
    var turn_id = '0'
    var selectedTextList = []
    // JQuery code to be added in here.
    $("#btn-chat").click( function(event) {
        alert("You clicked the button using JQuery!");
        console.log('You clicked the button')
    });

    // Close popup
    $(".close, .popup-overlay").on("click", function(){
        $(".popup-overlay, .popup-content").removeClass("active");
      });

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
            selectedTextList.push(turn_id + ':' + selectedText)
            console.log('selectedTextList = ' + selectedTextList)
            $(".popup-overlay, .popup-content").addClass("active")
            .css({
                left: Math.min(mouseXPosition, $(window).innerWidth()-$('.popup-content').outerWidth()),
                top: mouseYPosition + 20
            });
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
