var host_url = 'wss://mqtt.eclipse.org/mqtt';
// window.host_url = 'ws://localhost:9001/mqtt';
var host_client = 'client-' + random_id();
var topic_base = 'test/test/';
var topic_comment = window.topic_base + 'comment';
var topic_note = window.topic_base + 'note';
var topic_message = window.topic_base + 'message';
var topic_like = window.topic_base + 'like';
var topic_stats = '$SYS/broker/clients';
var mqtt;
var connect_count = 1;
var data = { comments: {}, messages: {} };

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
			window.mqtt.subscribe(window.topic_comment + '/+');
			window.mqtt.subscribe(window.topic_like + '/+');
			window.mqtt.subscribe(window.topic_stats + '/#');
		}
		// bind keypress
		document.querySelectorAll('[data-bind-keypress]').forEach(function (elem) {
			try {
				elem.addEventListener('keypress', eval(elem.dataset.bindKeypress));
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
		receiveLike(subtopic);
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
			} catch {
				console.log('unable to bind function', elem);
			}
		});
		// replace old
		if (tmp.id) {
			if ((old = document.getElementById(tmp.id)) !== null) {
				old.parentNode.replaceChild(tmp, old);
				return tmp;
			}
		}
		return dest.appendChild(tmp);
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
	if (evt.key == 'Enter' && this.value) {
		if (send(window.topic_comment + '/' + random_id(), this.value, true)) {
			this.value = '';
		}
	}
}

function receiveComment(id, txt) {
	if (txt) {
		window.data.comments[id] = { text: txt };
		var data = { id: id, text: txt, date: new Date().toLocaleString() };
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
	if (evt.key == 'Enter') {
		if (send(window.topic_note, this.value, true)) {
			this.value = '';
		}
	}
}

function receiveNote(txt) {
	if (txt) {
		var data = { text: txt };
		addFromTemplate('template-note', 'note-stream', data);
	} else {
		removeById('note-top');
	}
}

function sendMessage(id, txt, likes) {
	var data = JSON.stringify({ text: txt, likes: likes ? likes : 0 });
	return send(window.topic_message + '/' + id, data, true);
}

function receiveMessage(id, data) {
	if (data) {
		var data = JSON.parse(data);
		window.data.messages[id] = data;
		data.id = id;
		addFromTemplate('template-message', 'message-stream', data);
	} else {
		delete window.data.messages[id];
		removeById('message-' + id);
	}
}

function likeMessage(evt) {
	if (this.dataset.id) {
		send(window.topic_like + '/' + this.dataset.id, '');
	}
}

function deleteMessage(evt) {
	if (confirm('Diese Nachricht wirklich löschen?')) {
		if (this.dataset.id) {
			send(window.topic_message + '/' + this.dataset.id, '', true);
		}
	}
}

function receiveLike(id) {
	if (window.data.messages[id]) {
		sendMessage(id, window.data.messages[id].text, window.data.messages[id].likes + 1);
	}
}
