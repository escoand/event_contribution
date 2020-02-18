/* https://beautifier.io/ */
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
var connect_count = 0;

document.addEventListener('DOMContentLoaded', connect);

function random_id() {
	return (
		Number(String(Math.random()).slice(2)) +
		Date.now() +
		Math.round(performance.now())
	).toString(36);
}

function connect() {
	if (window.connect_count >= 5)
		return;
	window.mqtt = new Paho.Client(window.host_url, window.host_client);
	window.mqtt.onMessageArrived = onReceive;
	window.mqtt.onConnectionLost = onConnectionLost;
	showToast('Verbinde zum Server');
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
		window.mqtt.subscribe(window.topic_comment);
		window.mqtt.subscribe(window.topic_note);
		window.mqtt.subscribe(window.topic_message + '/+');
		window.mqtt.subscribe(window.topic_stats + '/#');
		var btn = document.getElementById('comment-edit');
		if (btn) {
			btn.addEventListener('keypress', function (evt) {
				if (evt.key == 'Enter')
					if (sendComment(this.value)) this.value = '';
			});
		}
		btn = document.getElementById('note-edit');
		if (btn) {
			btn.addEventListener('keypress', function (evt) {
				if (evt.key == 'Enter')
					if (sendNote(this.value)) this.value = '';
			});
		}
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
		var paths = subtopic.split('/');
		receiveMessage(paths[0], msg.payloadString);
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
		for (var key in data) {
			html = html.split('{{' + key + '}}').join(data[key]);
		}
		var tmp = document.createElement('div');
		tmp.innerHTML = html;
		tmp = tmp.firstElementChild;
		var old = document.getElementById(tmp.id);
		if (old) {
			return old.parentNode.replaceChild(tmp, old);
		} else {
			return dest.appendChild(tmp);
		}
	}
}

function receiveStats(topic, txt) {
	if (topic == window.topic_stats + '/connected') {
		var dest = document.getElementById('stats-clients');
		if (dest)
			dest.innerHTML = txt;
	}
}

function sendComment(txt) {
	if (txt) {
		try {
			showToast();
			window.mqtt.send(window.topic_comment, txt);
		} catch (err) {
			console.log(err);
			showToast('FEHLER: Versuche es erneut.');
			return false;
		}
	}
	return true;
}

function receiveComment(txt) {
	var data = { text: txt, date: new Date().toLocaleString() };
	var elem = addFromTemplate('template-comment', 'comment-stream', data);
	if (elem) {
		var btn = elem.getElementsByTagName('button');
		if (btn && btn[0]) {
			btn[0].addEventListener('click', takeComment);
		}
		if (btn && btn[1]) {
			btn[1].addEventListener('click', deleteComment);
		}
	}
}

function takeComment() {
	if (confirm('Diesen Kommentar wirklich übernehmen?')) {
		try {
			showToast();
			var elem = this.closest('.card');
			var txt = elem.getElementsByTagName('blockquote')[0].innerHTML;
			var data = JSON.stringify({ text: txt, likes: 0 });
			window.mqtt.send(window.topic_message + '/' + random_id(), data, 0, true);
			elem.remove();
		} catch (err) {
			console.log(err);
			showToast('FEHLER: Versuche es erneut.');
		}
	}
}

function deleteComment() {
	if (confirm('Diesen Kommentar wirklich löschen?')) {
		this.closest('.card').remove();
	}
}

function sendNote(txt) {
	try {
		showToast();
		window.mqtt.send(window.topic_note, txt, 0, true);
	} catch (err) {
		console.log(err);
		showToast('FEHLER: Versuche es erneut.');
		return false;
	}
	return true;
}

function receiveNote(txt) {
	var data = { text: txt };
	var elem = addFromTemplate('template-note', 'note-stream', data);
	if (elem && !txt) {
		elem.remove();
	}
}

function receiveMessage(id, data) {
	var data = JSON.parse(data);
	data['id'] = id;
	if (!data['likes'])
		data['likes'] = 0;
	var elem = addFromTemplate('template-message', 'message-stream', data);
	if (elem && elem.getElementById) {
		var btn = elem.getElementById('button-like');
		if (btn) {
			btn.addEventListener('click', function () {
				likeMessage(this.getAttribute('data-id'));
			});
		}
	}
}

function likeMessage(id) {
	window.mqtt.send(window.topic_like + '/' + id, '');
}