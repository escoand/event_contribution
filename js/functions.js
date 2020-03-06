var host_url = 'ws://' + window.location.hostname + ':' + window.location.port + '/mqtt';
if (window.location.protocol == 'file:') {
	window.host_url = 'wss://mqtt.eclipse.org/mqtt';
}
var host_client = 'client-' + random_id();
var topic_base = 'event/contribution/';
var topic_comment = window.topic_base + 'comment';
var topic_note = window.topic_base + 'note';
var topic_message = window.topic_base + 'message';
var topic_like = window.topic_base + 'like';
var topic_highlight = window.topic_base + 'highlight';
var topic_stats = '$SYS/broker/clients';
var mqtt;
var data = { comments: {}, messages: {} };

document.addEventListener('DOMContentLoaded', connect);

function random_id() {
	return (
		Number(String(Math.random()).slice(2)) +
		Date.now() +
		Math.round(performance.now())
	).toString(36);
}

function escapeHTML(txt) {
	return document.createElement('div').appendChild(document.createTextNode(txt)).parentNode.innerHTML;
}

function connect() {
	window.mqtt = new Paho.Client(window.host_url, window.host_client);
	window.mqtt.onMessageArrived = onReceive;
	window.mqtt.onConnectionLost = onFailure;
	showToast('Verbinde zum Server');
	try {
		window.mqtt.connect({
			onSuccess: onConnect,
			onFailure: onFailure
		});
	} catch (err) {
		console.log(err);
		showToast('FEHLER: Versuche die Seite neu zu laden.');
	}
}

function send(topic, payload, retain) {
	try {
		showToast();
		window.mqtt.send(topic, payload, 1, retain ? true : false);
		return true;
	} catch (err) {
		console.log(err);
		showToast('FEHLER: Versuche es erneut.');
	}
	return false;
}

function showToast(txt) {
	var elem = document.getElementById('toast');
	if (txt) {
		addFromTemplate('template-toast', 'toast-host', { text: txt })
	} else if (elem) {
		elem.remove();
	}
}

function onFailure(err) {
	console.log(err);
	showToast('FEHLER: Neue Verbindung in 2 Sekunden.');
	window.setTimeout(connect, 2000);
}

function onConnect() {
	showToast();
	try {
		window.mqtt.subscribe(window.topic_note, { qos: 1 });
		window.mqtt.subscribe(window.topic_message + '/+', { qos: 1 });
		window.mqtt.subscribe(window.topic_highlight, { qos: 1 });
		if (document.querySelector('body[data-is-admin]')) {
			window.mqtt.subscribe(window.topic_comment + '/+', { qos: 1 });
			window.mqtt.subscribe(window.topic_like + '/+/+', { qos: 1 });
			window.mqtt.subscribe(window.topic_stats + '/#', { qos: 1 });
		}
		// bind keypress
		document.querySelectorAll('[data-bind-keypress]').forEach(function (elem) {
			try {
				elem.addEventListener('keypress', eval(elem.dataset.bindKeypress));
			} catch (err) {
				console.log('unable to bind function', elem);
			}
		});
		// bind click
		document.querySelectorAll('[data-bind-click]').forEach(function (elem) {
			try {
				elem.addEventListener('click', eval(elem.dataset.bindClick));
			} catch (err) {
				console.log('unable to bind function', elem);
			}
		});
	} catch (err) {
		console.log(err);
		showToast('FEHLER: Versuche die Seite neu zu laden.');
	}
}

function onReceive(msg) {
	// stats
	if (msg.destinationName.startsWith(window.topic_stats + '/')) {
		receiveStats(msg.destinationName, msg.payloadString);
	}
	// comment
	else if (msg.destinationName.startsWith(window.topic_comment + '/')) {
		var subtopic = msg.destinationName.substr(window.topic_comment.length + 1);
		receiveComment(subtopic, msg.payloadString);
	}
	// note
	else if (msg.destinationName == window.topic_note) {
		receiveNote(msg.payloadString);
	}
	// message
	else if (msg.destinationName.startsWith(window.topic_message + '/')) {
		var subtopic = msg.destinationName.substr(window.topic_message.length + 1);
		receiveMessage(subtopic, msg.payloadString);
	}
	// like
	else if (msg.destinationName.startsWith(window.topic_like + '/')) {
		var subtopic = msg.destinationName.substr(window.topic_like.length + 1);
		var paths = subtopic.split('/');
		receiveLike(paths[0], paths[1], msg.payloadString);
	}
	// highlight
	else if (msg.destinationName == window.topic_highlight) {
		receiveHighlight(msg.payloadString);
	}
	// unknown
	else {
		console.log(msg.destinationName, msg.payloadString);
	}
}

function addFromTemplate(tmplId, destId, data) {
	if ((tmpl = document.getElementById(tmplId)) !== null && (dest = document.getElementById(destId)) !== null) {
		var html = tmpl.innerHTML;
		// replace data
		for (var key in data) {
			html = html.split('{{' + key + '}}').join(data[key]);
		}
		var tmp = document.createElement('div');
		tmp.innerHTML = html;
		tmp = tmp.firstElementChild;
		// bind click
		tmp.querySelectorAll('[data-bind-click]').forEach(function (elem) {
			try {
				elem.addEventListener('click', eval(elem.dataset.bindClick));
			} catch (err) {
				console.log('unable to bind function', elem);
			}
		});
		// replace old
		if (tmp.id && (old = document.getElementById(tmp.id)) !== null) {
			old.parentNode.replaceChild(tmp, old);
		} else {
			dest.appendChild(tmp);
		}
		// sort
		var children = tmp.parentNode.querySelectorAll('[data-orderid]');
		if (children.length) {
			Array.from(children)
				.sort(function (elem1, elem2) {
					return elem2.dataset.orderid - elem1.dataset.orderid;
				}).forEach(function (elem) {
					elem.parentNode.appendChild(elem);
				});
		}
		return tmp;
	}
}

function findClosestInput(elem) {
	if ((tmp = elem.closest('.input-group')) !== null) {
		return tmp.querySelector('input[type="text"]');
	}
}

function removeById(id) {
	if ((elem = document.getElementById(id)) !== null) {
		elem.remove();
	}
}

function receiveStats(topic, txt) {
	if (topic == window.topic_stats + '/connected') {
		if ((dest = document.getElementById('stats-clients')) !== null) {
			dest.innerHTML = txt;
		}
	}
}

function sendComment(evt) {
	var elem = this;
	if (evt.type == 'keypress' && evt.key == 'Enter' && elem.value ||
		evt.type == 'click' && (elem = findClosestInput(this)) !== null && elem.value) {
		if (send(window.topic_comment + '/' + random_id(), elem.value, true)) {
			elem.value = '';
		}
	}
}

function receiveComment(id, txt) {
	if (txt) {
		window.data.comments[id] = { text: txt };
		var data = { id: id, text: escapeHTML(txt), date: new Date().toLocaleString() };
		addFromTemplate('template-comment', 'comment-stream', data);
	} else {
		delete window.data.comments[id];
		removeById('comment-' + id);
	}
}

function takeComment(evt) {
	if (confirm('Diesen Kommentar wirklich übernehmen?')) {
		var id = this.dataset.id;
		send(window.topic_comment + '/' + id, '', true);
		sendMessage(id, window.data.comments[id].text);
	}
}

function deleteComment(evt) {
	if (confirm('Diesen Kommentar wirklich löschen?')) {
		var id = this.dataset.id;
		send(window.topic_comment + '/' + id, '', true);
	}
}

function sendNote(evt) {
	var elem = this;
	if (evt.type == 'keypress' && evt.key == 'Enter' ||
		evt.type == 'click' && (elem = findClosestInput(this)) !== null) {
		if (send(window.topic_note, elem.value, true)) {
			elem.value = '';
		}
	}
}

function receiveNote(txt) {
	if (txt) {
		var data = { text: escapeHTML(txt) };
		addFromTemplate('template-note', 'note-stream', data);
	} else {
		removeById('note-top');
	}
}

function sendMessage(id, txt, likes) {
	var data = JSON.stringify({ text: txt, likes: likes ? likes : 0 });
	return send(window.topic_message + '/' + id, data, true);
}

function receiveMessage(id, input) {
	if (input) {
		var input = JSON.parse(input);
		window.data.messages[id] = {
			text: input.text,
			likes: input.likes,
		};
		var data = { id: id, text: escapeHTML(input.text), likes: escapeHTML(input.likes) };
		addFromTemplate('template-message', 'message-stream', data);
	} else {
		delete window.data.messages[id];
		removeById('message-' + id);
	}
}

function highlightMessage(evt) {
	var id = this.dataset.id;
	if (id && window.data.messages[id]) {
		var data = JSON.stringify(window.data.messages[id]);
		return send(window.topic_highlight, data);
	}
}

function likeMessage(evt) {
	var id = this.dataset.id;
	if (id) {
		// cookie
		var liked = [];
		try {
			var value = "; " + document.cookie;
			var parts = value.split("; liked=");
			if (parts.length == 2) {
				liked = JSON.parse(parts.pop().split(";").shift());
			}
		} catch (err) { }
		// like if unliked
		if (liked.indexOf(id) == -1) {
			liked.push(id);
			document.cookie = 'liked=' + JSON.stringify(liked);
			document.cookie = 'max-age=' + (6 * 60 * 60);
			if (send(window.topic_like + '/' + id + '/' + window.host_client, 'like', true)) {
				var data = { id: id };
				addFromTemplate('template-likes-loading', 'likes-' + id, data);
			}
		}
	}
}

function deleteMessage(evt) {
	if (confirm('Diese Nachricht wirklich löschen?')) {
		if (this.dataset.id) {
			send(window.topic_message + '/' + this.dataset.id, '', true);
		}
	}
}

function receiveLike(id, client, txt) {
	if (txt && window.data.messages[id]) {
		sendMessage(id, window.data.messages[id].text, window.data.messages[id].likes + 1);
		send(window.topic_like + '/' + id + '/' + client, '', true);
	}
}

function receiveHighlight(txt) {
	var data = JSON.parse(txt);
	if (data) {
		addFromTemplate('template-highlight', 'highlight-stream', data);
	}
}
