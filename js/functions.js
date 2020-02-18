var host_url = 'wss://mqtt.eclipse.org/mqtt';
// host_url = 'ws://localhost:9001/mqtt';
var host_client = 'client' + Math.floor(Math.random() * 1000) + Math.floor(Math.random() * 1000);
var topic_base = 'test/test/';
var topic_comment = window.topic_base + 'comment';
var topic_note = window.topic_base + 'note';
var topic_message = window.topic_base + 'message';
var mqtt;

document.addEventListener('DOMContentLoaded', function() {
	window.mqtt = new Paho.Client(window.host_url, window.host_client);
	window.mqtt.onMessageArrived = onReceive;
	window.mqtt.onConnectionLost = onConnectionLost;
	showToast('Verbinde zum Server');
	try {
		window.mqtt.connect({onSuccess:onConnect, onFailure:onFailure});
	} catch(err) {
		console.log(err);
		showToast('FEHLER: Versuche die Seite neu zu laden.');
	}
});

function showToast(txt) {
	var toast = document.getElementById('toast');
	while(toast.firstChild)
		toast.removeChild(toast.lastChild);
	if(txt) {
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
}

function onConnect() {
	showToast();
	try {
		window.mqtt.subscribe(window.topic_base + '#');
		var btn = document.getElementById('comment-edit');
		if(btn)
			btn.addEventListener('keypress', sendComment);
		btn = document.getElementById('note-edit');
		if(btn)
			btn.addEventListener('keypress', sendNote);
	} catch(err) {
		console.log(err);
		showToast('FEHLER: Versuche die Seite neu zu laden.');
	}
}

function onReceive(msg) {
	if(msg.destinationName == window.topic_comment)
		receiveComment(msg.payloadString);
	else if(msg.destinationName == window.topic_note)
		receiveNote(msg.payloadString);
	else if(msg.destinationName == window.topic_message)
		receiveMessage(msg.payloadString);
	else
		console.log(msg.destinationName, msg.payloadString);
}

function sendComment(evt) {
	if(evt.key != 'Enter' || !this.value)
		return;
	try {
		showToast();
		window.mqtt.send(window.topic_comment, this.value);
		this.value = '';
	} catch(err) {
		console.log(err);
		showToast('FEHLER: Versuche es erneut.');
	}
}

function receiveComment(txt) {
	var tmpl = document.getElementById('template-comment');
	var dest = document.getElementById('comment-stream');
	if(!dest || !tmpl || !txt)
		return;
	tmpl = tmpl.firstElementChild.cloneNode(true);
	tmpl.getElementsByTagName('blockquote')[0].appendChild(document.createTextNode(txt));
	tmpl.getElementsByTagName('blockquote')[0].setAttribute('cite', new Date().toLocaleString());
	var btn = tmpl.getElementsByTagName('button')[0];
	if(btn)
		btn.addEventListener('click', takeComment);
	btn = tmpl.getElementsByTagName('button')[1];
	if(btn)
		btn.addEventListener('click', deleteComment);
	dest.appendChild(tmpl);
}

function takeComment() {
	if(!confirm('Diesen Kommentar wirklich übernehmen?'))
		return;
	try {
		showToast();
		var elem = this.closest('.card');
		var txt = elem.getElementsByTagName('blockquote')[0].innerHTML;
		window.mqtt.send(window.topic_message, txt);
		elem.remove();
	} catch(err) {
		console.log(err);
		showToast('FEHLER: Versuche es erneut.');
	}
}

function deleteComment() {
	if(!confirm('Diesen Kommentar wirklich löschen?'))
		return;
	this.closest('.card').remove();
}

function sendNote(evt) {
	if(evt.key != 'Enter')
		return;
	try {
		showToast();
		window.mqtt.send(window.topic_note, this.value, 0, true);
		this.value = '';
	} catch(err) {
		console.log(err);
		showToast('FEHLER: Versuche es erneut.');
	}
}

function receiveNote(txt) {
	var dest = document.getElementById('note-stream');
	var tmpl = document.getElementById('template-note');
	if(!dest)
		return;
	while(dest.firstChild)
		dest.removeChild(dest.lastChild);
	if(!tmpl || !txt)
		return;
	tmpl = tmpl.firstElementChild.cloneNode(true);
	tmpl.getElementsByTagName('h2')[0].appendChild(document.createTextNode(txt));
	dest.appendChild(tmpl);
}

function receiveMessage(txt) {
	var tmpl = document.getElementById('template-message');
	var dest = document.getElementById('message-stream');
	if(!dest || !tmpl || !txt)
		return;
	tmpl = tmpl.firstElementChild.cloneNode(true);
	tmpl.getElementsByTagName('blockquote')[0].appendChild(document.createTextNode(txt));
	dest.appendChild(tmpl);
}