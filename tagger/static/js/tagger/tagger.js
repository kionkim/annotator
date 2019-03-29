var selectedFullText;
var selectedText;
var selectedElement;
var tag_id = 0;
var turn_id = 'turn_0';
var tmp;
var original_dialogue;
var slot_info = [];
$(document).ready(function() {
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
	//console.log(conv.length);
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

		startPoint = selection.getRangeAt(0).startOffset;
		endPoint = selection.getRangeAt(0).endOffset;
		anchorTag = selection.anchorNode.parentNode;
		focusTag = selection.focusNode.parentNode;
		selectedFullText = anchorTag.textContent;
		console.log('selected conv = ' + selectedFullText);
		turn_id = anchorTag.parentElement.id;
		chat_class = selection.focusNode.parentNode.parentElement.className;
		console.log('chat_class = ' + chat_class);

		// Action when text is really selected

		if (selectedText.length > 0) {
			console.log('Action when text is really selected');
			// Highlight select with necessary logic
			renderConv_info(turn_id);

			// Show modal
			a = $(window).innerWidth();
			b = $('.popup-content').innerWidth();
			c = $(window).innerHeight();
			d = $('.popup-content').innerHeight();
			console.log('c = ' + c);
			console.log('d = ' + d);
			$('.modal').css({
				left: Math.min(mouseXPosition - 390, a - b),
				top: Math.min(mouseYPosition, c / 2)
			});

			$('#slot_selector').modal('show');

			$('#value').val(selectedText);

			$('.messages').removeClass('selectedConv');
			$(this).addClass('selectedConv');
			selectedElement = $(this);
		}
	});

	$(document).on('mousedown', '.messages', function(e1) {
		mouseXPosition = e1.pageX; //register the mouse down position
		mouseYPosition = e1.pageY; //register the mouse down position
	});

	// Highlight when text selected
	$(document).on('mouseup', '.editable_messages', function(e2) {
		var highlighted = false;
		selection = window.getSelection();
		selectedText = selection.toString();

		startPoint = selection.getRangeAt(0).startOffset;
		endPoint = selection.getRangeAt(0).endOffset;
		anchorTag = selection.anchorNode.parentNode;
		focusTag = selection.focusNode.parentNode;
		selectedFullText = anchorTag.textContent;
		console.log('selected conv = ' + selectedFullText);
		turn_id = anchorTag.parentElement.id;
		chat_class = selection.focusNode.parentNode.parentElement.className;
		// Action when text is really selected

		if (selectedText.length > 0) {
			console.log('Action when text is really selected');
			// Highlight select with necessary logic
			renderConv_info(turn_id);

			// Show modal
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
			selectedElement = $(this);
		}
	});

	$('.add_dialog').click(function() {
		element = $(this)[0].parentElement.parentElement.parentElement;
		_turn_id = $(element).find('.messages')[0].id;
		_turn_id = parseInt(_turn_id.split('_')[1]) + 1;
		$('.messages').removeClass('selectedConv');
		text = $(element, $('p')).text();

		tmp = element;
		if ($(element, $('.messages'))[0].className.includes('receive')) {
			_html = generateReceivedEditableBody(_turn_id, '');
		} else {
			_html = generateSentEditableBody(_turn_id, '');
		}
		$(element).after(_html);
	});

	$(document).on('click', '.add_editable_dialog', function() {
		element = $(this)[0].parentElement.parentElement.parentElement;
		_turn_id = $(element).find('.messages')[0].id;
		_turn_id = parseInt(_turn_id.split('_')[1]) + 1;

		$('.messages').removeClass('selectedConv');
		text = $(element, $('p')).text();
		tmp = element;
		if ($(element, $('.messages'))[0].className.includes('receive')) {
			_html = generateReceivedEditableBody(_turn_id, '');
		} else {
			_html = generateSentEditableBody(_turn_id, '');
		}
		$(element).after(_html);
	});

	$('.remove_dialog').click(function() {
		element = $(this)[0].parentElement.parentElement.parentElement;
		element.remove();
	});

	$(document).on('click', '.rm_editable_dialog', function() {
		element = $(this)[0].parentElement.parentElement.parentElement;
		element.remove();
	});

	$('#delete_selection').click(function() {
		selectedFullText;
		if (selection.toString() != '') {
			selectedText = selection.toString();
			var text1 = $('selectedConv').text().split('');
			console.log('original text = ' + text1);
			pointStart = selection.anchorOffset;
			pointEnd = selection.focusOffset;

			if (pointEnd < pointStart) {
				pointStart = pointEnd;
			}
			text1.splice(pointStart, selectedText.length);
			text1 = text1.join('');
			console.log('modified text = ' + text1);
			selectedFullText = text1;
		} else {
			selectedText = $('.selectedConv').text();
			var text1 = '';
		}
		$('.selectedConv').html('<p>' + text1 + '</p>');
	});

	$('#slot_in_modal').on('click change', function(e) {
		work_on_selection(e, selection, selectedText, startPoint, endPoint, anchorTag, focusTag, turn_id, tag_id);
		// render tagger_info panel
		slot_color = $(this).val();
		slot_text = $('#slot_in_modal option:selected').text();
		change_slot(turn_id, tag_id, slot_text);
		$('#slots_input').append(
			'<span class="badge badge-secondary ' + turn_id + '_in_modal>' + slot_text + '</span>'
		);
	});

	// Binding event on dynamically generated editable dialogue
	$(document).on('click', '.confirm_generated_text', function() {
		console.log('confirm_generated_text');
		element = $(this)[0].parentElement;
		input = $(element).find('.edited_input')[0];
		text = input.value;
		tmp = element;
		original_dialogue[element.id] = text;

		console.log('text = ' + text);
		input.remove();

		_html = '<p>' + text + '</p>';
		_html +=
			'<button type="button" class="btn btn-default btn-sm add_editable_dialog"><span class="glyphicon glyphicon-trash">+</span></button>';
		_html +=
			'<button type="button" class="btn btn-default btn-sm rm_editable_dialog"><span class="glyphicon glyphicon-trash">-</span></button>';
		console.log('_html = ' + _html);
		element.innerHTML = _html;
		console.log('text = ' + text);
	});

	$(document).on('click', '.rm_editable_dialog', function() {
		$(this).parent().parent().parent().remove();
	});

	$('.edited_input').on('input', function(e) {
		alert('Changed!');
	});

	$.fn.removeClassRegExp = function(regexp) {
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

function change_slot(turn_id, tag_id, slot_text) {
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
}

function work_on_selection(e, selection, selectedText, startPoint, endPoint, anchorTag, focusTag, turn_id, tag_id) {
	// if (e2.pageX - mouseXPosition < 0) {
	// 	focusTag = selection.anchorNode.parentNode;
	// 	anchorTag = selection.focusNode.parentNode;
	// }
	console.log('tag id = ' + tag_id);
	console.log('focusTag.class = ' + focusTag.className);
	console.log('anchorTag.class = ' + anchorTag.className);
	console.log('Starting point = ' + startPoint);
	console.log('End point = ' + endPoint);
	console.log('Selected text = ' + selectedText);
	console.log('inside span = ' + anchorTag.innerHTML.substr(endPoint));
	console.log('endPoint - startPoint = ' + (endPoint - startPoint));
	if (selectedText.length === endPoint - startPoint) {
		highlighted = true;

		if (anchorTag.className !== 'highlight') {
			turn_into_slot();
		} else {
			var afterText =
				selectedText + "<span class = 'highlight'>" + anchorTag.innerHTML.substr(endPoint) + '</span>';
			anchorTag.innerHTML = anchorTag.innerHTML.substr(0, startPoint);
			anchorTag.insertAdjacentHTML('afterend', afterText);
		}
	} else {
		console.log('entered else at 229');
		if (anchorTag.className !== 'highlight' && focusTag.className !== 'highlight') {
			turn_into_slot();
			highlighted = true;
		}
	}

	if (anchorTag.className === 'highlight' && focusTag.className === 'highlight' && !highlighted) {
		highlighted = true;
		console.log('trigger anchor, focus highlighted but not highlighted');
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
		turn_into_slot();
	}
	$('.highlight').each(function() {
		if ($(this).html() == '') {
			$(this).remove();
		}
	});

	selection.removeAllRanges();

	renderConv_info(turn_id);
}

function turn_into_slot() {
	// var selection = $('.selectedConv')[0];
	// tmp = $('.selectedConv')[0];
	// //Get the selected stuff
	// if (window.getSelection) selection = window.getSelection();
	// else if (typeof document.selection != 'undefined') selection = document.selection;
	console.log('selection = ' + selection.toString());
	turn_id = selection.focusNode.parentNode.parentElement.id;

	console.log('turn_id = ' + turn_id);
	console.log('tag_id = ' + tag_id);
	console.log('focus node = ' + selection.focusNode.parentNode);
	console.log('selection is collapsed = ' + selection.isCollapsed);

	slot = $('#slot_in_modal').find(':selected').text();

	//Get a the selected content, in a range object
	var range = selection.getRangeAt(0);

	idx = original_dialogue[turn_id].indexOf(selectedText);
	if (idx !== -1) {
		start_point = idx;
		end_point = idx + selectedText.length;
		console.log('Selected text = ' + selectedText + 'starting = ' + start_point + ' ending = ' + end_point);
		slot_info.push({
			turn_id: turn_id,
			tag_id: tag_id,
			slot: slot,
			value: selectedText,
			start_point: start_point,
			end_point: end_point
		});
		log_selection_info(mouseXPosition, mouseYPosition, selection);
	}

	//If the range spans some text, and inside a tag, set its css class.
	if (range && !selection.isCollapsed) {
		if (selection.anchorNode.parentNode == selection.focusNode.parentNode) {
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

			// console.log('current tag = ' + tag_id);
			// $('.messages').removeClass('selectedConv');
			// $(this).addClass('selectedConv');

			turn_id = $(this).attr('id');
			tag_id += 1;
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
		original_text[dialogue_key] = text.replace(/(<([^>]+)>)/gi, '');
		if (speaker === 'Customer') {
			sent_body = generateReceivedBody(i * 10, text);
			$(sent_body).appendTo(container);
		} else {
			received_body = generateSentBody(i * 10, text);
			$(received_body).appendTo(container);
		}
	}
	$.each(original_text, function(key, value) {
		//Separately stored original text to find start and end point of the selection
	});
	return original_text;
}

function generateSentBody(turn, text) {
	body = '<div class="row msg_container base_sent">';
	body += '<div class="col-md-10">';
	body += '<div class="messages msg_sent col-md-10" id = "turn_' + turn + '"><p>' + text + '</p>';
	body +=
		'<button type="button" class="btn btn-default btn-sm add_dialog"><span class="glyphicon glyphicon-trash">+</span></button>';
	body +=
		'<button type="button" class="btn btn-default btn-sm remove_dialog"><span class="glyphicon glyphicon-trash">-</span></button>';
	body += '</div></div>';
	body += '<div class="col-md-2 avatar"><img src="../../static/images/avatar.png" class=" img-responsive "></div>';
	body += '</div>';
	return body;
}

function generateReceivedBody(turn, text) {
	body = '<div class="row msg_container base_receive">';
	body +=
		'<div class="col-md-2 avatar" ><img src="../../static/images/avatar.png" class=" img-responsive "></img></div>';
	body +=
		'<div class="col-md-10"><div class="messages msg_receive col-md-10" id = "turn_' +
		turn +
		'">' +
		'<p>' +
		text +
		'</p>';
	body +=
		'<button type="button" class="btn btn-default btn-sm add_dialog"><span class="glyphicon glyphicon-trash">+</span></button>';
	body +=
		'<button type="button" class="btn btn-default btn-sm remove_dialog"><span class="glyphicon glyphicon-trash">-</span></button>';
	body += '</div></div></div>';
	//console.log(body);
	return body;
}
function generateReceivedEditableBody(turn, text) {
	body = '<div class="row msg_container base_receive">';
	body += '<div class="col-md-2 avatar" ><img src="../../static/images/avatar.png" class=" img-responsive "></div>';
	body +=
		'<div class="col-md-10"><div class="messages editable_messages selectedConv msg_receive" id = "turn_' +
		turn +
		'">' +
		'<input class = "form-control  edited_input" type = "text" id = "edited_' +
		turn +
		'" value = "' +
		text +
		'"></input>';
	body +=
		'<button type="button" class="btn btn-default btn-sm confirm_generated_text"><span class="glyphicon glyphicon-trash">OK</span></button>';
	body +=
		'<button type="button" class="btn btn-default btn-sm add_editable_dialog"><span class="glyphicon glyphicon-trash">+</span></button>';
	body +=
		'<button type="button" class="btn btn-default btn-sm rm_editable_dialog"><span class="glyphicon glyphicon-trash">-</span></button>';

	body += '</div></div></div>';

	return body;
}

function generateSentEditableBody(turn, text) {
	body = '<div class="row msg_container base_receive">';
	body +=
		'<div class="col-md-10"><div class="messages editable_messages selectedConv msg_receive" id = "turn_' +
		turn +
		'">' +
		'<input class = "form-control  edited_input" type = "text" id = "edited_' +
		turn +
		'" + value = "' +
		text +
		'"></input>';
	body +=
		'<button type="button" class="btn btn-default btn-sm confirm_generated_text"><span class="glyphicon glyphicon-trash">OK</span></button>';
	body +=
		'<button type="button" class="btn btn-default btn-sm add_editible_dialog"><span class="glyphicon glyphicon-trash">+</span></button>';
	body +=
		'<button type="button" class="btn btn-default btn-sm rm_editible_dialog"><span class="glyphicon glyphicon-trash">-</span></button>';
	body += '</div>';
	body += '<div class="col-md-2 avatar" ><img src="../../static/images/avatar.png" class=" img-responsive "></div>';

	body += '</div></div>';

	return body;
}

function aggregateChat() {
	$$('.messages').each();
}

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
