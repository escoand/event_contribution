var host_url = 'wss://mqtt.eclipse.org/mqtt';
// window.host_url = 'ws://localhost:9001/mqtt';
var host_client = 'client' + Math.floor(Math.random() * 1000) + Math.floor(Math.random() * 1000);
var topic_base = 'test/test/';
var topic_comment = window.topic_base + 'comment';
var topic_note = window.topic_base + 'note';
var topic_message = window.topic_base + 'message';
var topic_like = window.topic_base + 'like';
var topic_stats = '$SYS/broker/clients';
var mqtt;
var connect_count = 1;
var messages = {};

document.addEventListener('DOMContentLoaded', connect);

function random_id() {
	return (
		Number(String(Math.random()).slice(2)) +
		Date.now() +
		Math.round(performance.now())
	).toString(36);
}

function connect() {
	if (window.connect_count > 5) {
		return;
	}
	window.mqtt = new Paho.Client(window.host_url, window.host_client);
	window.mqtt.onMessageArrived = onReceive;
	window.mqtt.onConnectionLost = onConnectionLost;
	showToast('Verbinde zum Server' + (window.connect_count > 1 ? ' (Versuch ' + window.connect_count + ')' : ''));
	try {
		window.mqtt.connect({
			onSuccess: onConnect,
			onFailure: onFailure
		});
		window.connect_count++;
	} catch (err) {
		console.log(err);
		showToast('FEHLER: Versuche die Seite neu zu laden.');
	}
}

function showToast(txt) {
	var toast = document.getElementById('toast');
	while (toast.firstChild) {
		toast.removeChild(toast.lastChild);
	}
	if (txt) {
		toast.appendChild(document.createTextNode(txt));
		toast.style.visibility = 'visible';
	} else {
		toast.style.visibility = 'hidden';
	}
}

function onFailure(err) {
	console.log(err);
	showToast('FEHLER: ' + err.errorMessage);
}

function onConnectionLost(err) {
	console.log(err);
	showToast('FEHLER: ' + err.errorMessage);
	connect();
}

function onConnect() {
	showToast();
	try {
		window.mqtt.subscribe(window.topic_note);
		window.mqtt.subscribe(window.topic_message + '/+');
		if (document.querySelector('body[data-is-admin]')) {
			window.mqtt.subscribe(window.topic_comment);
			window.mqtt.subscribe(window.topic_like + '/+');
			window.mqtt.subscribe(window.topic_stats + '/#');
		}
		// bind keypress
		document.querySelectorAll('[data-bind-keypress]').forEach(function (elem) {
			try {
				var func = eval(elem.dataset.bindKeypress);
				elem.addEventListener('keypress', func);
			} catch {
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
	else if (msg.destinationName == window.topic_comment) {
		receiveComment(msg.payloadString);
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
		receiveLike(subtopic);
	}
	// unknown
	else {
		console.log(msg.destinationName, msg.payloadString);
	}
}

function addFromTemplate(tmplId, destId, data) {
	var tmpl = document.getElementById(tmplId);
	var dest = document.getElementById(destId);
	if (tmpl && dest) {
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
				var func = eval(elem.dataset.bindClick);
				elem.addEventListener('click', func);
			} catch {
				console.log('unable to bind function', elem);
			}
		});
		// replace old
		if (tmp.id) {
			var old = document.getElementById(tmp.id);
			if (old) {
				old.parentNode.replaceChild(tmp, old);
				return tmp;
			}
		}
		return dest.appendChild(tmp);
	}
}

function receiveStats(topic, txt) {
	if (topic == window.topic_stats + '/connected') {
		var dest = document.getElementById('stats-clients');
		if (dest)
			dest.innerHTML = txt;
	}
}

function sendComment(evt) {
	if (evt.key == 'Enter' && this.value) {
		try {
			showToast();
			window.mqtt.send(window.topic_comment, this.value);
			this.value = '';
		} catch (err) {
			console.log(err);
			showToast('FEHLER: Versuche es erneut.');
		}
	}
}

function receiveComment(txt) {
	var data = { text: txt, date: new Date().toLocaleString() };
	var elem = addFromTemplate('template-comment', 'comment-stream', data);
}

function takeComment(evt) {
	if (confirm('Diesen Kommentar wirklich übernehmen?')) {
		var elem = this.closest('.card');
		var txt = elem.getElementsByTagName('blockquote')[0].innerHTML;
		sendMessage(random_id(), txt);
		elem.remove();
	}
}

function deleteComment(evt) {
	if (confirm('Diesen Kommentar wirklich löschen?')) {
		this.closest('.card').remove();
	}
}

function sendNote(evt) {
	if (evt.key == 'Enter' && this.value) {
		try {
			showToast();
			window.mqtt.send(window.topic_note, this.value, 0, true);
			this.value = '';
		} catch (err) {
			console.log(err);
			showToast('FEHLER: Versuche es erneut.');
		}
	}
}

function receiveNote(txt) {
	var data = { text: txt };
	var elem = addFromTemplate('template-note', 'note-stream', data);
	if (elem && !txt) {
		elem.remove();
	}
}

function sendMessage(id, txt, likes) {
	try {
		showToast();
		var data = JSON.stringify({ text: txt, likes: likes ? likes : 0 });
		window.mqtt.send(window.topic_message + '/' + id, data, 0, true);
	} catch (err) {
		console.log(err);
		showToast('FEHLER: Versuche es erneut.');
	}
}

function receiveMessage(id, data) {
	if (data) {
		var data = JSON.parse(data);
		window.messages[id] = data;
		data['id'] = id;
		var elem = addFromTemplate('template-message', 'message-stream', data);
	} else {
		var elem = document.getElementById('message-' + id);
		if (elem) {
			elem.remove();
		}
		if (window.messages[id]) {
			delete window.messages[id];
		}
	}
}

function likeMessage(evt) {
	if (this.dataset.id) {
		window.mqtt.send(window.topic_like + '/' + this.dataset.id, '');
	}
}

function deleteMessage(evt) {
	if (confirm('Diese Nachricht wirklich löschen?')) {
		window.mqtt.send(window.topic_message + '/' + this.dataset.id, '', 0, true);
	}
}

function receiveLike(id) {
	if (window.messages[id]) {
		sendMessage(id, window.messages[id]['text'], window.messages[id]['likes'] + 1);
	}
}
