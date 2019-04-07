// Needs to be shared
var ConvSelection;
var selectedText;
var ConvAnchorTag;
var ConvFocusTag;
var tag_id = 0;
var turn_id;
var tmp; // For debugging
var original_dialogue; // To reload data

// var slot_info = [];
$(document).ready(function() {
	var startPoint;
	var endPoint;
	
	// Parse data passed from django
	conv = conv
		.replace(/&gt;/g, '>')
		.replace(/&lt;/g, '<')
		.replace(/&#39;/g, ' ')
		.replace(/&quot;/g, '"')
		.replace(/\//g, ' ')
		.replace(/<\/?[^>]+(>|$)/g, '');

	console.log('****** ' + conv);
	conv = JSON.parse(conv);

	console.log('conv = ' + conv);

	//conv = getInitialData();
	//console.log('data conv = ' + conv.toString());

	act = JSON.parse(act.replace(/&#39;/g, '"'));
	intent = JSON.parse(intent.replace(/&#39;/g, '"'));
	slot = JSON.parse(slot.replace(/&#39;/g, '"'));

	var id = conv['id'];
	conv = conv['sentences'];
	
	console.log('current user = ' + user);
	// Set menu
	set_menus(act, intent, slot);
	// Set css
	set_css(slot);
	// Set comm title
	$('<span class="glyphicon glyphicon-comment"> ' + id + '</span>').appendTo('.chat_head');

	// SET dialogue
	original_dialogue = generateChatBody(conv, '.msg_container_base');

	// Hightlight script: https://jsfiddle.net/Bilalchk123/1o4j0w2v/
	// Highlight when conversation clicked
	//$('.messages').mousedown(action_on_mousedown(e1));
	$('.messages').mousedown(function(e){
		action_on_mousedown(e);
	});
	// Highlight when text selected
	$('.messages').mouseup(function(e){
		action_on_mouseup(e);
	});

	$('.add_dialog').click(function(){
		add_dialog($(this))}
	);

	$('.remove_dialog').click(function(){
		remove_dialog($(this))
});

	$('.remove_selection').click(function() {
		// We have to keep tagging info
		// Just removing text with splice destroys tagging info
		var selectedText = ConvSelection.toString();
		console.log('asdfafasddf = ' + ConvSelection.toString());
		if (selectedText != '') {
			var original_html = $('.selectedConv').html();
			var modified_html = original_html.replace(selectedText, '');
			console.log('print modified html bfr = ' + modified_html);
			var reindexed_html = modify_start_end_index(modified_html);
			$('.selectedConv').empty();
			$('.selectedConv').append(reindexed_html);
			console.log(
				'Entity Info when removing text: Selected text = ' + selectedText + ' starting = ' + start_point + ' ending = ' + end_point
			);
			append_refresh_btn();
		}
	});

	$('#slot_selector_in_modal').on('change', function(e) {
		console.log('selected text in slot_selector_in_modal = ' + selectedText);
		console.log('focus_tag in slot_selector_in_modal = ' + focusTag);
		console.log('anchor_tag in slot_selector_in_modal= ' + anchorTag);
		work_on_selection(e, ConvSelection, startPoint, endPoint, ConvAnchorTag, ConvFocusTag);
		// render tagger_info panel
		slot_color = $(this).val();
		slot_text = $('#slot_selector_in_modal option:selected').text();
		if (selectedText.length > 0) {
			change_slot(turn_id, tag_id, slot_text); // just increase tag_id since it only creates new one.
			$('#slots_input').append(
				'<span class="badge badge-secondary ' + turn_id + '_in_modal>' + slot_text + '</span>'
			);
			append_refresh_btn();
		}
	});

	$('.modal-body').on('mousedown', function(mousedownEvt) {
		var $draggable = $(this);
		var x = mousedownEvt.pageX - $draggable.offset().left,
			y = mousedownEvt.pageY - $draggable.offset().top;
		$('body').on('mousemove.draggable', function(mousemoveEvt) {
			$draggable.closest('.modal-dialog').offset({
				left: mousemoveEvt.pageX - x,
				top: mousemoveEvt.pageY - y
			});
		});
		$('body').on('mouseup', function() {
			$('body').off('mousemove.draggable');
		});
		$draggable.closest('.modal').one('bs.modal.hide', function() {
			$('body').off('mousemove.draggable');
		});
	});

	$('#submit').click(function() {
		console.log('aggregate');
		res = aggregateChat();
	});

	$('.add_slot').click(function() {
		console.log('triggered add_slot');
		_html = '<div class="col-md-3 col-md-offset-1"><label for="slot_input"><p>New slot</p></label></div>';
		_html += '<div class="col-md-3"><input class="form-control"></input></div>';
		_html +=
			'<div class="col-md-1"><button type="button" class="btn btn-default btn-sm add_slot"><span class="glyphicon glyphicon-ok ok"></span></button></div>';
		var child = document.createElement('div');
		child.className = 'row';
		child.innerHTML = _html;
		child.style.cssText = '{background:red;}';
		$(this)[0].parentElement.parentElement.appendChild(child);
	});

	$('#act_selector_in_modal').on('change', function(e) {
		// render tagger_info panel
		act = $('#act_selector_in_modal option:selected').text();
		console.log('act selection = ' + act);
		change_act(act);
		$(this).val('default');
	});

	$('#intent_selector_in_modal').on('change', function(e) {
		// render tagger_info panel
		intent = $('#intent_selector_in_modal option:selected').text();
		console.log('intent selection = ' + intent);
		change_intent(intent);
		$(this).val('default');
	});

	// listen for long-press events
	// $(document).addEventListener('long-press', function(e){
	// 	show_intent_modal(e)
	// });

	document.addEventListener('long-press', function(e) {
		e.preventDefault();
		//show intent modal
		show_intent_modal(e);
	});

	// Dynamically binding new button
	$(document).on('mousedown', '.messages', function(e){
		action_on_mousedown(e);
	});
	
	$(document).on('mouseup', '.editable_messages', function(e){
		action_on_mouseup(e)
	});

	$(document).on('click', '.add_dialog', function(){
		console.log('adffaddf = ' + $(this));
		add_dialog($(this));
	});

	$(document).on('click', '.add_editable_dialog', function(){
		add_dialog($(this))
	});

	$(document).on('click', '.refresh_dialog', function(){
		refresh_dialog($(this))
	});

	$(document).on('click', '.remove_dialog', function(){
		remove_dialog($(this))
	});

	$(document).on('click', '.rm_editable_dialog', function(){
		remove_dialog($(this))
	});

	$(document).on('long-press', '.editable_messages', function(e){
		show_intent_modal(e)
	});

	$(document).on('click', '.editable_messages', function(){
		changeSelectedConv($(this))
	});

	$(document).on('click', '.confirm_generated_text', function() {
		element = $(this)[0].parentElement;
		input = $(element).find('.edited_input')[0];
		text = input.value;
		original_dialogue[element.id] = text;
		input.remove();
		_html = '<p>' + text + '</p>';
		_html +=
			'<button type="button" class="btn btn-default btn-sm add_editable_dialog"><span class="glyphicon glyphicon-plus add"</span></button>';
		_html +=
			'<button type="button" class="btn btn-default btn-sm rm_editable_dialog"><span class="glyphicon glyphicon-remove remove"></span></button>';
		element.innerHTML = _html;
	});

	// add jquery function
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


	$.fn.disableTextSelect = function() {
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

	$.fn.enableTextSelect = function() {
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

function modify_start_end_index(html){
	var _p;
	var res;
	// Select <p> tag
	$.each($(html), function(i, a){
		if (i === 0) _p = a; 
	});
	tmp = html;
	res = html;
	//get the current start, end, and texts
	e_starts = [];
	e_ends = [];
	texts = [];
	$(_p).find('.entity_value').each(function(i, a){
		$.each(a.className.split(' '), function(j, b){
			if (b.match('start')) e_starts.push(b);
			if (b.match('end')) e_ends.push(b);
		});
		texts.push(a.textContent);
	});

	// Remove entity name tag, which is not really part of the original text
	$(_p).find(".entity").remove();

	// Loop through texts to modify its start and end value
	$.each(texts, function(i, a){
		_new_start = _p.textContent.indexOf(a);
		if('start_' + _new_start !== e_starts[i]){
			_new_end = _new_start + a.length;
			console.log('start to replace  from ' + e_starts[i] + ' to ' + 'start_' + _new_start);
			res = res.replace(e_starts[i], 'start_' + _new_start).replace(e_ends[i], 'end_' + _new_end);
			console.log('res = ' + res);
		}
	});
	return res;

}


$.each($(this))
function action_on_mouseup(e) {
	var highlighted = false;
	var selection = window.getSelection();
	startPoint = selection.getRangeAt(0).startOffset;
	endPoint = selection.getRangeAt(0).endOffset;
	anchorTag = selection.anchorNode.parentNode;
	focusTag = selection.focusNode.parentNode;
	turn_id = anchorTag.parentElement.id;
	chat_class = selection.focusNode.parentNode.parentElement.className;
	// Action when text is really selected
	console.log('triggered on mousup')
	console.log('selection.toString() = ' + selection.toString() +  '    ' + selection.toString().length + '     '+ anchorTag.parentElement.className);

	if (anchorTag.parentElement.className.includes('message') && selection.toString().length > 0) {
		// Set global selection
		ConvSelection = selection;
		ConvAnchorTag = anchorTag;
		ConvFocusTag = focusTag;
		selectedText = ConvSelection.toString();
		// Show modal
		a = $(window).innerWidth();
		b = $('.popup-content').innerWidth();
		c = $(window).innerHeight();
		d = $('.popup-content').innerHeight();

		$('.modal').css({
			left: Math.min(mouseXPosition - 390, a - b),
			top: Math.min(mouseYPosition, c / 2)
		});

		$('#slot_selector').modal('show');

		$('.tag_for').html(' for <font color="red">' + selectedText  + '</font> : ');

		//changeSelectedConv($(this));		
	}
}

function changeSelectedConv(element){
		$('.messages').removeClass('selectedConv');
	$(element).addClass('selectedConv');
}

function action_on_mousedown(e) {
	mouseXPosition = e.pageX; //register the mouse down position
	mouseYPosition = e.pageY; //register the mouse down position
	changeSelectedConv($(e.target).closest('.messages'));
}

function show_intent_modal(e) {
		e.preventDefault();
		// Show modal
		a = $(window).innerWidth();
		b = $('.popup-content').innerWidth();
		c = $(window).innerHeight();
		d = $('.popup-content').innerHeight();

		$('.modal').css({
			left: Math.min(mouseXPosition - 390, a - b),
			top: Math.min(mouseYPosition, c / 2)
		});

		$('#intent_selector').modal('show');
	
	changeSelectedConv(e.target);
}

function refresh_dialog(button){
	element = $(button)[0].parentElement;
	tmp = element;
	$(element).find('p').empty();
	txt = original_dialogue[element.id];
	$(element).find('p').append(txt);
	//$(element).find('.messages')[0].textContent = txt;
}


function add_dialog(button) {
	tmp = button;
	console.log('add_dialog..... ' + $(button)[0].toString());
	element = $(button)[0].parentElement.parentElement.parentElement;
	console.log('add_dialog..... ' + element);
	_turn_id = $(element).find('.messages')[0].id;
	_turn_id = parseInt(_turn_id.split('_')[1]) + 1;
		$('.messages').removeClass('selectedConv');
	text = $(element, $('p')).text();
	if ($(element, $('.messages'))[0].className.includes('receive')) {
		_html = generateReceivedEditableBody(_turn_id, '');
	} else {
		_html = generateSentEditableBody(_turn_id, '');
	}
	$(element).after(_html);
	console.log('before disable');
	$(this).attr('disabled', true);
}

function remove_dialog(button){
	element = $(button)[0].parentElement.parentElement.parentElement;
	element.remove();
}


function append_refresh_btn() {
	// Check if refresh button exists and add if not.
	if ($('.selectedConv').html().includes('refresh')) {
	} else {
		_html =
			'<button type="button" class="btn btn-default btn-sm refresh_dialog"><span class="glyphicon glyphicon-refresh refresh"></span></button>';
		$('.selectedConv').append(_html);
	}
}

function change_act(act) {
	console.log('triggered change_act');
	console.log('selecte conv = ' + $('.selectedConv')[0].id);
	var child = document.createElement('span');
	child.innerHTML = '<span class="badge badge-pill badge-primary">' + act + '</span>';
	$('.selectedConv')[0].appendChild(child);
}

function change_intent(intent) {
	console.log('triggered change_intent');
	console.log('selecte conv = ' + $('.selectedConv')[0].id);
	var child = document.createElement('span');
	child.innerHTML = '<span class="badge badge-pill badge-dark">' + intent + '</span>';
	$('.selectedConv')[0].appendChild(child);
}

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

function work_on_selection(e, conv_selection, startPoint, endPoint, anchorTag, focusTag) {
	console.log('adfadf = ' + (e.pageX - mouseXPosition < 0));
	selectedText = conv_selection.toString();
	if (e.pageX - mouseXPosition < 0) {
		focusTag = conv_selection.anchorNode.parentNode;
		anchorTag = conv_selection.focusNode.parentNode;
	}
	console.log('focusTag = ' + focusTag);
	console.log('Selected text = ' + selectedText);

	if (selectedText.length === endPoint - startPoint) {
		console.log('entered else at 313');
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
		console.log('entered else at 324');
		if (anchorTag.className !== 'highlight' && focusTag.className !== 'highlight') {
			turn_into_slot();
			highlighted = true;
		}
	}

	if (anchorTag.className === 'highlight' && focusTag.className === 'highlight' && !highlighted) {
		console.log('entered else at 332');
		highlighted = true;
		var afterHtml = anchorTag.innerHTML.substr(startPoint);
		var outerHtml = selectedText.substr(afterHtml.length, selectedText.length - endPoint - afterHtml.length);
		var anchorInnerhtml = anchorTag.innerHTML.substr(0, startPoint);
		var focusInnerHtml = focusTag.innerHTML.substr(endPoint);
		var focusBeforeHtml = focusTag.innerHTML.substr(0, endPoint);
		conv_selection.deleteFromDocument();
		anchorTag.innerHTML = anchorInnerhtml;
		focusTag.innerHTml = focusInnerHtml;
		var anchorafterHtml = afterHtml + outerHtml + focusBeforeHtml;
		anchorTag.insertAdjacentHTML('afterend', anchorafterHtml);
	}

	if (anchorTag.className === 'highlight' && !highlighted) {
		console.log('entered else at 347');
		highlighted = true;
		var Innerhtml = anchorTag.innerHTML.substr(0, startPoint);
		var afterHtml = anchorTag.innerHTML.substr(startPoint);
		var outerHtml = selectedText.substr(afterHtml.length, selectedText.length);
		conv_selection.deleteFromDocument();
		anchorTag.innerHTML = Innerhtml;
		anchorTag.insertAdjacentHTML('afterend', afterHtml + outerHtml);
	}

	if (focusTag.className === 'highlight' && !highlighted) {
		console.log('entered else at 358');
		highlighted = true;
		var beforeHtml = focusTag.innerHTML.substr(0, endPoint);
		var outerHtml = selectedText.substr(0, selectedText.length - beforeHtml.length);
		conv_selection.deleteFromDocument();
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
	conv_selection.removeAllRanges();
}

function highlightSelection() {
	var selection;

	//Get the selected stuff
	if (window.getSelection) selection = window.getSelection();
	else if (typeof document.selection != 'undefined') selection = document.selection;

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

function turn_into_slot() {
	// assign selected element, which is global variable to local variable selection
	var selection = window.getSelection();
	slot = $('#slot_selector_in_modal').find(':selected').text();

	//Get a the selected content, in a range object
	var range = selection.getRangeAt(0);

	idx = original_dialogue[turn_id].indexOf(selectedText);
	if (idx !== -1) {
		start_point = idx;
		end_point = idx + selectedText.length;
		console.log(
			'New Entity Info : Selected text = ' + selectedText + 'starting = ' + start_point + ' ending = ' + end_point
		);
		// slot_info.push({
		// 	turn_id: turn_id,
		// 	tag_id: tag_id,
		// 	slot: slot,
		// 	value: selectedText,
		// 	start_point: start_point,
		// 	end_point: end_point
		// });
		log_selection_info(mouseXPosition, mouseYPosition, selection);
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
				span_entity_value.className =
					'highlight entity_value entity_' +
					slot +
					' ' +
					turn_id +
					'_seq_' +
					tag_id +
					' start_' +
					start_point +
					' end_' +
					end_point;
				span_entity_value.id = slot;
				span_entity_value.textContent = selection.toString();

				// Remove text and insert generated tag
				selection.deleteFromDocument();
				range.insertNode(span_entity_value);
				range.insertNode(span_entity_tag);

				$('span.entity').disableTextSelect();
				$('span.entity_value').disableTextSelect();
				turn_id = $(this).attr('id');
				tag_id += 1;
			}
		}
	}
}

// Generate chat-body
function generateChatBody(conv, container) {
	var conv_length = conv.length;
	var original_text = {};
	for (var i = 0; i < conv_length; i++) {
		text = conv[i]['text'];
		speaker = conv[i]['speaker'];
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
	body = '<div class="row msg_container base_sent ">';
	body += '<div class="col-md-10">';
	body +=
		'<div class="messages msg_sent col-md-10" data-long-press-delay="200" id = "turn_' +
		turn +
		'"><p>' +
		text +
		'</p>';
	body +=
		'<button type="button" class="btn btn-default btn-sm add_dialog"><span class="glyphicon glyphicon-plus add"></span></button>';
	body +=
		'<button type="button" class="btn btn-default btn-sm remove_dialog"><span class="glyphicon glyphicon-remove remove remove"></span></button>';
	body += '</div></div>';
	body += '<div class="col-md-2 avatar"><img src="../../static/images/ryan.png" class=" img-responsive "></div>';
	body += '</div>';
	return body;
}

function generateReceivedBody(turn, text) {
	body = '<div class="row msg_container base_receive">';
	body +=
		'<div class="col-md-2 avatar" ><img src="../../static/images/ryan.png" class=" img-responsive "></img></div>';
	body +=
		'<div class="col-md-10"><div class="messages msg_receive col-md-10" data-long-press-delay="200" id = "turn_' +
		turn +
		'">' +
		'<p>' +
		text +
		'</p>';
	body +=
		'<button type="button" class="btn btn-default btn-sm add_dialog"><span class="glyphicon glyphicon-plus add"></span></button>';
	body +=
		'<button type="button" class="btn btn-default btn-sm remove_dialog"><span class="glyphicon glyphicon-remove remove"></span></button>';
	body += '</div></div></div>';
	return body;
}
function generateReceivedEditableBody(turn, text) {
	body = '<div class="row msg_container base_receive">';
	body += '<div class="col-md-2 avatar" ><img src="../../static/images/ryan.png" class=" img-responsive "></div>';
	body +=
		'<div class="col-md-10"><div class="messages editable_messages selectedConv msg_receive col-md-10" data-long-press-delay="200" id = "turn_' +
		turn +
		'">' +
		'<input class = "form-control edited_input" type = "text" id = "edited_' +
		turn +
		'" value = "' +
		text +
		'"></input>';
	body +=
		'<button type="button" class="btn btn-default btn-sm confirm_generated_text"><span class="glyphicon glyphicon-ok ok"></span></button>';
	body +=
		'<button type="button" class="btn btn-default btn-sm add_editable_dialog"><span class="glyphicon glyphicon-plus add"></span></button>';
	body +=
		'<button type="button" class="btn btn-default btn-sm rm_editable_dialog"><span class="glyphicon glyphicon-remove"></span></button>';

	body += '</div></div></div>';

	return body;
}

function generateSentEditableBody(turn, text) {
	body = '<div class="row msg_container base_sent">';
	body +=
		'<div class="col-md-10"><div class="messages editable_messages selectedConv msg_sent data-long-press-delay="200" id = "turn_' +
		turn +
		'">' +
		'<input class = "form-control  edited_input" type = "text" id = "edited_' +
		turn +
		'" + value = "' +
		text +
		'"></input>';
	body +=
		'<button type="button" class="btn btn-default btn-sm confirm_generated_text"><span class="glyphicon glyphicon-ok ok"></span></button>';
	body +=
		'<button type="button" class="btn btn-default btn-sm add_editible_dialog"><span class="glyphicon glyphicon-plus add"></span></button>';
	body +=
		'<button type="button" class="btn btn-default btn-sm rm_editible_dialog"><span class="glyphicon glyphicon-remove remove"></span></button>';
	body += '</div></div>';
	body += '<div class="col-md-2 avatar" ><img src="../../static/images/ryan.png" class=" img-responsive "></div>';

	body += '</div>';

	return body;
}

function aggregateChat() {
	console.log('aggregateChat triggered');
	$('.messages').each(function() {
		elem = $(this)[0];
		$(this).find('.entity_value').each(function(i, c) {
			console.log('i = ' + i + '   c = ' + c.className);
			_ent = c.className.split(' ');
			$.each(_ent, function(v, j) {
				console.log('v = ' + v + 'j = ' + j);
			});
		});
	});
}

function getInitialData() {
	var value = $.ajax({
		url: '../../static/data/single_conv.json',
		async: false
	}).responseText;
	
	_res = JSON.parse(value);
	
	_res = _res['_source'];
	id = _res['name'];
	console.log(_res);
	res = [];
	$.each(_res['sentences'], function(d){
		if (_res['sentences'][d]['speaker'] !== 'System'){
			console.log('speaker = ' + _res['sentences'][d]['speaker']);
			res.push(_res['sentences'][d]);
		}
	});

	return res;
}

function get_id() {
	var value = $.ajax({
		url: '../../static/data/single_conv.json',
		async: false
	}).responseText;
	_res = JSON.parse(value);
	_res = _res['_source'];
	id = _res['name'];
	return id;
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
	elements.push('<option selected value = "default"> --- </option>');
	$('#act_selector_in_modal').append(elements);

	// Set menu for slot
	var elements = [];
	$.each(slot, function(key) {
		value = Object.keys(slot[key])[0];
		elements.push($('<option value = "' + slot[key][value] + '">' + value + '</option>'));
	});
	elements.push('<option selected value = "default"> --- </option>');
	$('#slot_selector_in_modal').append(elements);

	// Set menu for sentence intent
	var elements = [];
	for (x = 0; x < intent.length; x++) {
		var element = $('<option>' + intent[x] + '</option>');
		elements.push(element);
	}
	elements.push('<option selected value = "default"> --- </option>');
	$('#intent_selector_in_modal').append(elements);
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
