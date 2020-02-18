/* https://beautifier.io/ */

var host_url = 'wss://mqtt.eclipse.org/mqtt';
// host_url = 'ws://localhost:9001/mqtt';
var host_client = 'client' + Math.floor(Math.random() * 1000) + Math.floor(Math.random() * 1000);
var topic_base = 'test/test/';
var topic_comment = window.topic_base + 'comment';
var topic_note = window.topic_base + 'note';
var topic_message = window.topic_base + 'message';
var topic_stats = '$SYS/broker/clients';
var mqtt;

document.addEventListener('DOMContentLoaded', connect);

function connect() {
	window.mqtt = new Paho.Client(window.host_url, window.host_client);
	window.mqtt.onMessageArrived = onReceive;
	window.mqtt.onConnectionLost = onConnectionLost;
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
		window.mqtt.subscribe(window.topic_base + '#');
		window.mqtt.subscribe(window.topic_stats + '/#');
		var btn = document.getElementById('comment-edit');
		if (btn) {
			btn.addEventListener('keypress', sendComment);
		}
		btn = document.getElementById('note-edit');
		if (btn) {
			btn.addEventListener('keypress', sendNote);
		}
	} catch (err) {
		console.log(err);
		showToast('FEHLER: Versuche die Seite neu zu laden.');
	}
}

function onReceive(msg) {
	if (msg.destinationName.startsWith(window.topic_stats + '/')) {
		receiveStats(msg.destinationName, msg.payloadString);
	} else if (msg.destinationName == window.topic_comment || msg.destinationName.startsWith(window.topic_comment + '/')) {
		receiveComment(msg.payloadString);
	} else if (msg.destinationName == window.topic_note || msg.destinationName.startsWith(window.topic_note + '/')) {
		receiveNote(msg.payloadString);
	} else if (msg.destinationName == window.topic_message || msg.destinationName.startsWith(window.topic_message + '/')) {
		receiveMessage(msg.payloadString);
	} else {
		console.log(msg.destinationName, msg.payloadString);
	}
}

function addFromTemplate(destId, tmplId, clear) {
	var dest = document.getElementById(destId);
	var tmpl = document.getElementById(tmplId);
	if (!dest) {
		return;
	}
	if (clear == true) {
		while (dest.firstChild) {
			dest.removeChild(dest.lastChild);
		}
	}
	if (tmpl) {
		tmpl = tmpl.firstElementChild.cloneNode(true);
		dest.appendChild(tmpl);
		return tmpl;
	}
}

function receiveStats(topic, txt) {
	if (topic == window.topic_stats + '/connected') {
		document.getElementById('stats-clients').innerHTML = txt;
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
	var elem = addFromTemplate('comment-stream', 'template-comment');
	if (elem) {
		elem.getElementsByTagName('blockquote')[0].appendChild(document.createTextNode(txt));
		elem.getElementsByTagName('blockquote')[0].setAttribute('cite', new Date().toLocaleString());
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
			window.mqtt.send(window.topic_message, txt);
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

function sendNote(evt) {
	if (evt.key == 'Enter') {
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
	var elem = addFromTemplate('note-stream', 'template-note', true);
	if (elem) {
		elem.getElementsByTagName('h2')[0].appendChild(document.createTextNode(txt));
	}
}

function receiveMessage(txt) {
	var elem = addFromTemplate('message-stream', 'template-message');
	if (elem) {
		elem.getElementsByTagName('blockquote')[0].appendChild(document.createTextNode(txt));
	}
}