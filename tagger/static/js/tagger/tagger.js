$(document).ready(function() {
	var original_dialogue;
	var turn_id;
	var tag_id = 0;
	var selectedText;
	var start_pos;
	var end_pos;
	var startPoint;
	var endPoint;
	var anchorTag;
	var focusTag;
	var aaa;

	// conv = conv
	// 	.replace(/&gt;/g, '>')
	// 	.replace(/&lt;/g, '<')
	// 	.replace(/&#39;/g, '"')
	// 	.replace(/None/g, 'null')
	// 	.replace(/&quot;/g, '~')
	// 	.replace(/\//g, ' ')
	// 	.replace(/<\/?[^>]+(>|$)/g, '');
	// console.log('conv = ' + conv);
	conv = getInitialData();
	console.log(conv.length);
	conv = conv[3];
	act = JSON.parse(act.replace(/&#39;/g, '"'));
	intent = JSON.parse(intent.replace(/&#39;/g, '"'));
	slot = JSON.parse(slot.replace(/&#39;/g, '"'));

	// Set menu
	set_menus(act, intent, slot);

	// Set css
	set_css(slot);

	// Set comm title
	$('<span class="glyphicon glyphicon-comment">' + conv['name'] + '</span>').appendTo('.chat_head');

	// SET dialogue
	original_dialogue = generateChatBody(conv, '.msg_container_base');

	// Hightlight script: https://jsfiddle.net/Bilalchk123/1o4j0w2v/
	// Highlight when conversation clicked
	$('.messages').mousedown(function(e1) {
		mouseXPosition = e1.pageX; //register the mouse down position
		mouseYPosition = e1.pageY; //register the mouse down position
	});

	// Highlight when text selected
	$('.messages').mouseup(function(e2) {
		var highlighted = false;
		selection = window.getSelection();
		selectedText = selection.toString();
		startPoint = window.getSelection().getRangeAt(0).startOffset;
		endPoint = window.getSelection().getRangeAt(0).endOffset;
		anchorTag = selection.anchorNode.parentNode;
		focusTag = selection.focusNode.parentNode;
		turn_id = anchorTag.parentElement.id;
		chat_class = selection.focusNode.parentNode.parentElement.className;
		console.log('chat_class = ' + chat_class);

		if (e2.pageX - mouseXPosition < 0) {
			focusTag = selection.anchorNode.parentNode;
			anchorTag = selection.focusNode.parentNode;
		}
		if (selectedText.length === endPoint - startPoint) {
			highlighted = true;

			if (anchorTag.className !== 'highlight') {
				res = highlightSelection(tag_id);
				tag_id = res[1];
			} else {
				var afterText =
					selectedText + "<span class = 'highlight'>" + anchorTag.innerHTML.substr(endPoint) + '</span>';
				anchorTag.innerHTML = anchorTag.innerHTML.substr(0, startPoint);
				anchorTag.insertAdjacentHTML('afterend', afterText);
			}
		} else {
			if (anchorTag.className !== 'highlight' && focusTag.className !== 'highlight') {
				res = highlightSelection(tag_id);
				tag_id = res[1];
				highlighted = true;
			}
		}

		if (anchorTag.className === 'highlight' && focusTag.className === 'highlight' && !highlighted) {
			highlighted = true;
			console.log('trigger deleting highlight');
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

		if (anchorTag.className === 'highlight' && !highlighted) {
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
			focusTag.insertAdjacentHTML('beforebegin', outerHtml);
		}

		if (!highlighted) {
			highlightSelection(tag_id);
		}
		$('.highlight').each(function() {
			if ($(this).html() == '') {
				$(this).remove();
			}
		});

		selection.removeAllRanges();

		renderConv_info(turn_id);

		// Action when text is really selected

		if (selectedText.length > 0) {
			renderConv_info(turn_id);
			//start_pos = original_dialogue[cur_turn_id] selectedText
			//log_selection_info(mouseXPosition, mouseYPosition, selectedText, startPoint, endPoint, anchorTag, focusTag);

			a = $(window).innerWidth();
			b = $('.popup-content').innerWidth();

			$('.modal').css({
				left: Math.min(mouseXPosition - 390, a - b),
				top: mouseYPosition
			});

			$('#slot_selector').modal('show');

			$('#value').val(selectedText);
			console.log('*&*&*&*&*&&* tag_id ' + tag_id);

			$('.messages').removeClass('selectedConv');
			$(this).addClass('selectedConv');
		}
	});

	$('#add_dialog').click(function() {
		console.log('turn id in dialogue plus= ' + turn_id);

		_turn_id = parseInt(turn_id.split('_')[1]) + 1;
		console.log('_turn_id = ' + _turn_id);
		_html = generateEditableBody(_turn_id, '');
		console.log('_html = ' + _html);

		element = $('.selectedConv')[0].parentElement.parentElement.parentElement;
		//console.log('element = ' + "." + element);
		//onsole.log('element = ' + "." + element.replace(' ', '.'));
		$(element).append(_html);
	});

	$('#remove_dialog').click(function() {
		console.log('turn id in dialogue plus= ' + turn_id);

		_turn_id = parseInt(turn_id.split('_')[1]) + 1;
		console.log('_turn_id = ' + _turn_id);
		_html = generateReceivedBody(_turn_id, '');
		console.log('_html = ' + _html);

		element = $('.selectedConv')[0].parentElement.parentElement.parentElement;
		//console.log('element = ' + "." + element);
		//onsole.log('element = ' + "." + element.replace(' ', '.'));
		$(element).append(_html);
	});

	$('#slot_in_modal').change(function() {
		slot_color = $(this).val();
		slot_text = $('#slot_in_modal option:selected').text();
		console.log('turn_id in change slot = ' + turn_id);
		console.log('tag_id in change slot = ' + tag_id);
		change_slot(turn_id, tag_id, slot_text, slot_color);
		$('#slots_input').append(
			'<span class="badge badge-secondary ' + turn_id + '_in_modal>' + slot_text + '</span>'
		);
	});

	$.fn.removeClassRegExp = function(regexp) {
		console.log('******* triggered');
		if (regexp && (typeof regexp === 'string' || typeof regexp === 'object')) {
			regexp = typeof regexp === 'string' ? (regexp = new RegExp(regexp)) : regexp;
			$(this).each(function() {
				$(this).removeClass(function(i, c) {
					var classes = [];
					$.each(c.split(' '), function(i, c) {
						if (regexp.test(c)) {
							classes.push(c);
						}
					});
					return classes.join(' ');
				});
			});
		}
		return this;
	};

	jQuery.fn.disableTextSelect = function() {
		return this.each(function() {
			$(this)
				.css({
					MozUserSelect: 'none',
					webkitUserSelect: 'none'
				})
				.attr('unselectable', 'on')
				.bind('selectstart', function() {
					return false;
				});
		});
	};

	jQuery.fn.enableTextSelect = function() {
		return this.each(function() {
			$(this)
				.css({
					MozUserSelect: '',
					webkitUserSelect: ''
				})
				.attr('unselectable', 'off')
				.unbind('selectstart');
		});
	};
});

function change_slot(turn_id, tag_id, slot_text, slot_color) {
	console.log('slot_text in change_slot = ' + slot_text);
	console.log('span.entity.' + turn_id + '_seq_' + tag_id);
	console.log('cur tag = ' + tag_id);
	console.log('span.entity_value.' + turn_id + '_seq_' + tag_id);
	$('span.entity.' + turn_id + '_seq_' + tag_id).text(slot_text + ': ');
	$('span.entity_value.' + turn_id + '_seq_' + tag_id)
		.removeClassRegExp(/^entity_/)
		.addClass('entity_value')
		.addClass('entity_' + slot_text)
		.addClass(turn_id + '_seq_' + tag_id);
	//log_selection_info(mouseXPosition, mouseYPosition, selectedText, startPoint, endPoint, anchorTag, focusTag);
}

function highlightSelection(tag_id) {
	var selection;
	//Get the selected stuff
	if (window.getSelection) selection = window.getSelection();
	else if (typeof document.selection != 'undefined') selection = document.selection;

	turn_id = selection.focusNode.parentNode.parentElement.id;

	console.log('turn_id = ' + turn_id);
	console.log('tag_id = ' + tag_id);
	console.log('focus node = ' + selection.focusNode.parentNode);
	console.log('selection is collapsed = ' + selection.isCollapsed);

	slot = $('#slot_in_modal').find(':selected').text();

	//Get a the selected content, in a range object
	var range = selection.getRangeAt(0);

	log_selection_info(mouseXPosition, mouseYPosition, selection);

	//If the range spans some text, and inside a tag, set its css class.
	if (range && !selection.isCollapsed) {
		if (selection.anchorNode.parentNode == selection.focusNode.parentNode) {
			tag_id += 1;
			// Generate span tag with entity class
			var span_entity_tag = document.createElement('span');
			span_entity_tag.className = 'highlight entity ' + turn_id + '_seq_' + tag_id;
			span_entity_tag.id = slot;
			span_entity_tag.textContent = slot + ': ';

			// Generate span tag with entity value class
			var span_entity_value = document.createElement('span');
			span_entity_value.className = 'highlight entity_value entity_' + slot + ' ' + turn_id + '_seq_' + tag_id;
			span_entity_value.id = slot;
			span_entity_value.textContent = selection.toString();

			// Remove text and insert generated tag
			selection.deleteFromDocument();
			range.insertNode(span_entity_value);
			range.insertNode(span_entity_tag);

			$('span.entity').disableTextSelect();

			console.log('current tag = ' + tag_id);
			$('.messages').removeClass('selectedConv');
			$(this).addClass('selectedConv');

			turn_id = $(this).attr('id');
		}
	}
	return [ turn_id, tag_id ];
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
	$.each(original_text, function(key, value) {
		console.log('aa = ' + key + ':' + value);
	});
	return original_text;
}

function generateSentBody(turn, text) {
	body = '<div class="row msg_container base_sent">';
	body += '<div class="col-md-10"><div class="messages msg_sent" id = "turn_' + turn + '"><p>' + text + '</p></div>';
	body += '</div>';
	body += '<div class="col-md-2 avatar"><img src="../../static/images/avatar.png" class=" img-responsive "></div>';
	body += '</div>';
	return body;
}

function generateReceivedBody(turn, text) {
	body = '<div class="row msg_container base_receive">';
	body +=
		'<div class="col-md-2 avatar" ><img src="../../static/images/avatar.png" class=" img-responsive "></img></div>';
	body +=
		'<div class="col-md-10"><div class="messages msg_receive col-md-8" id = "turn_' +
		turn +
		'">' +
		'<p>' +
		text +
		'</p></div>';
	body +=
		'<div class="col-md-1"><div><button type="button" class="btn btn-default btn-sm" id = "add_dialog"><span class="glyphicon glyphicon-trash"></span></button></div>';
	body +=
		'<div><button type="button" class="btn btn-default btn-sm" id = "remove_dialog"><span class="glyphicon glyphicon-trash">bb</span></button></div>';
	body += '</div></div>';
	console.log(body);
	return body;
}

function generateEditableBody(turn, text) {
	body = '<div class="row msg_container base_receive">';
	body += '<div class="col-md-2 avatar" ><img src="../../static/images/avatar.png" class=" img-responsive "></div>';
	body +=
		'<div class="col-md-10"><div class="messages msg_receive col-md-10" id = "turn_' +
		turn +
		'">' +
		'<input class = "form-control" id = "edited_' +
		turn +
		'">' +
		text +
		'</input></div>';
	body +=
		'<div class="col-md-2"><button type="button" class="btn btn-default btn-sm" id = "add_dialog"><span class="glyphicon glyphicon-trash"></span></button>';
	body +=
		'<button type="button" class="btn btn-default btn-sm" id = "remove_dialog"><span class="glyphicon glyphicon-trash"></span></button></div>';
	body += '</div></div>';
	return body;
}

function aggregateChat() {
	$$('.messages').each();
}

// Image button action
$('.imgclick')
	.mousedown(function() {
		var mrgtb = parseInt($(this).css('margin-top'));
		var mrglf = parseInt($(this).css('margin-left'));
		mrgtb = mrgtb + 3;
		mrglf = mrglf + 3;
		$(this).css('margin-top', mrgtb + 'px').css('margin-left', mrglf + 'px');
	})
	.mouseup(function() {
		var mrgtb = parseInt($(this).css('margin-top'));
		var mrglf = parseInt($(this).css('margin-left'));
		mrgtb = mrgtb - 3;
		mrglf = mrglf - 3;
		$(this).css('margin-top', mrgtb + 'px').css('margin-left', mrglf + 'px');
	});

function getInitialData() {
	var value = $.ajax({
		url: '../../static/data/conv_1.json',
		async: false
	}).responseText;
	return JSON.parse(value);
}

function renderConv_info(turn_id, intent, acts, slots) {
	$('input[id="turn_id_input"]').val(turn_id);
	$('input[id="sentence_intent_input"]').val(intent);
	$('input[id="acts_input"]').val(acts);
	$('input[id="slots_input"]').val(slots);
}
function log_selection_info(mouseXPosition, mouseYPosition, selectedText) {
	console.log('mouseXPosition = ' + mouseXPosition);
	console.log('mouseYPosition = ' + mouseYPosition);
	console.log('selectedText = ' + selectedText);
}

function set_menus(act, intent, slot) {
	// Set menu for act
	var elements = [];
	for (x = 0; x < act.length; x++) {
		var element = $('<option>' + act[x] + '</option>');
		elements.push(element);
	}
	$('#act_input').append(elements);

	// Set menu for slot
	var elements = [];
	$.each(slot, function(key) {
		value = Object.keys(slot[key])[0];
		elements.push($('<option value = "' + slot[key][value] + '">' + value + '</option>'));
	});
	$('#slot_in_modal').append(elements);

	// Set menu for sentence intent
	var elements = [];
	for (x = 0; x < intent.length; x++) {
		var element = $('<option>' + intent[x] + '</option>');
		elements.push(element);
	}
	$('#sentence_intent_input').append(elements);
}

function set_css(slot) {
	// Set css
	$.each(slot, function(key) {
		var style = document.createElement('style');
		style.type = 'text/css';
		value = Object.keys(slot[key])[0];
		ctnt =
			'.highlight.entity_' +
			value +
			'{background-color: rgba' +
			slot[key][value] +
			'; color: white; border-radius: 0px 5px 5px 0px;}';
		style.innerHTML = ctnt;
		document.getElementsByTagName('head')[0].appendChild(style);
	});
}
