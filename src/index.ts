import "./bootstrap.cyborg.min.css";
import "./styles.css";

import { Client } from "paho-mqtt";

const host_client = "client-" + random_id();
const topic_base = "event/contribution/";
const topic_comment = topic_base + "comment";
const topic_note = topic_base + "note";
const topic_message = topic_base + "message";
const topic_like = topic_base + "like";
const topic_highlight = topic_base + "highlight";
const topic_stats = "$SYS/broker/clients";
// @ts-ignore
const mqtt = new Client(mqttUrl(), host_client) as any;
const storage = { comments: {}, messages: {} };
const functions = {
  deleteComment: deleteComment,
  deleteMessage: deleteMessage,
  highlightMessage: highlightMessage,
  likeMessage: likeMessage,
  sendComment: sendComment,
  sendNote: sendNote,
  takeComment: takeComment,
};

document.addEventListener("DOMContentLoaded", connect);

function mqttUrl(): string {
  if (
    window.location.protocol == "file:" ||
    window.location.hostname.endsWith(".vercel.app")
  ) {
    return "wss://mqtt.eclipseprojects.io/mqtt";
  } else if (window.location.protocol == "https:") {
    return `wss://${window.location.hostname}:${window.location.port}/mqtt`;
  } else {
    return `ws://${window.location.hostname}:${window.location.port}/mqtt`;
  }
}

function random_id(): string {
  return (
    Number(String(Math.random()).slice(2)) +
    Date.now() +
    Math.round(performance.now())
  ).toString(36);
}

function escapeHTML(txt: string): string {
  const tmp = document.createElement("div");
  tmp.append(txt);
  return tmp.innerHTML;
}

function connect(): void {
  mqtt.onMessageArrived = onReceive;
  mqtt.onConnectionLost = onFailure;
  showToast("Verbinde zum Server");
  try {
    mqtt.connect({
      onSuccess: onConnect,
      onFailure: onFailure,
    });
  } catch (err) {
    console.log(err);
    showToast("FEHLER: Versuche die Seite neu zu laden.");
  }
}

function send(
  topic: string,
  payload: string,
  retain: boolean = false
): boolean {
  try {
    showToast();
    mqtt.send(topic, payload, 1, retain);
    return true;
  } catch (err) {
    console.log(err);
    showToast("FEHLER: Versuche es erneut.");
  }
  return false;
}

function showToast(txt: String = undefined): void {
  const elem = document.getElementById("toast");
  if (txt) {
    addFromTemplate("template-toast", "toast-host", { text: txt });
  } else if (elem) {
    elem.remove();
  }
}

function onFailure(err): void {
  console.log(err);
  showToast("FEHLER: Neue Verbindung in 2 Sekunden.");
  window.setTimeout(connect, 2000);
}

function onConnect(): void {
  showToast();
  try {
    mqtt.subscribe(topic_note, { qos: 1 });
    mqtt.subscribe(topic_message + "/+", { qos: 1 });
    mqtt.subscribe(topic_highlight, { qos: 1 });
    if (document.querySelector("body[data-is-admin]")) {
      mqtt.subscribe(topic_comment + "/+", { qos: 1 });
      mqtt.subscribe(topic_like + "/+/+", { qos: 1 });
      mqtt.subscribe(topic_stats + "/#", { qos: 1 });
    }
    // bind keypress
    document.querySelectorAll("[data-bind-keypress]").forEach((elem) => {
      try {
        elem.addEventListener(
          "keypress",
          functions[(elem as HTMLElement).dataset.bindKeypress]
        );
      } catch (err) {
        console.log("unable to bind function", elem, err);
      }
    });
    // bind click
    document.querySelectorAll("[data-bind-click]").forEach((elem) => {
      try {
        elem.addEventListener(
          "click",
          functions[(elem as HTMLElement).dataset.bindClick]
        );
      } catch (err) {
        console.log("unable to bind function", elem, err);
      }
    });
  } catch (err) {
    console.log(err);
    showToast("FEHLER: Versuche die Seite neu zu laden.");
  }
}

function onReceive(msg: any): void {
  try {
    // stats
    if (msg.destinationName.startsWith(topic_stats + "/")) {
      receiveStats(msg.destinationName, msg.payloadString);
    }
    // comment
    else if (msg.destinationName.startsWith(topic_comment + "/")) {
      const subtopic = msg.destinationName.substr(topic_comment.length + 1);
      receiveComment(subtopic, msg.payloadString);
    }
    // note
    else if (msg.destinationName == topic_note) {
      receiveNote(msg.payloadString);
    }
    // message
    else if (msg.destinationName.startsWith(topic_message + "/")) {
      const subtopic = msg.destinationName.substr(topic_message.length + 1);
      receiveMessage(subtopic, msg.payloadString);
    }
    // like
    else if (msg.destinationName.startsWith(topic_like + "/")) {
      const subtopic = msg.destinationName.substr(topic_like.length + 1);
      const paths = subtopic.split("/");
      receiveLike(paths[0], paths[1], msg.payloadString);
    }
    // highlight
    else if (msg.destinationName == topic_highlight) {
      receiveHighlight(msg.payloadString);
    }
    // unknown
    else {
      console.log(msg.destinationName, msg.payloadString);
    }
  } catch (err) {
    console.log("failed to hande message", err);
  }
}

function addFromTemplate(
  tmplId: string,
  destId: string,
  data: Object
): HTMLElement {
  const tmpl = document.getElementById(tmplId);
  const dest = document.getElementById(destId);
  if (tmpl !== null && dest !== null) {
    let html = tmpl.innerHTML;
    // replace data
    for (const key in data) {
      html = html.split("{{" + key + "}}").join(data[key]);
    }
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const tmp2 = tmp.firstElementChild as HTMLElement;
    // bind click
    tmp2.querySelectorAll("[data-bind-click]").forEach((elem) => {
      try {
        elem.addEventListener(
          "click",
          functions[(elem as HTMLElement).dataset.bindClick]
        );
      } catch (err) {
        console.log("unable to bind function", elem);
      }
    });
    // replace old
    const old = document.getElementById(tmp2.id);
    if (tmp2.id && old !== null) {
      old.parentNode.replaceChild(tmp2, old);
    } else {
      dest.appendChild(tmp2);
    }
    // sort
    const children = tmp2.parentNode.querySelectorAll("[data-orderid]");
    if (children.length) {
      Array.from(children)
        .sort(
          (elem1, elem2) =>
            Number.parseInt((elem2 as HTMLElement).dataset.orderid) -
            Number.parseInt((elem1 as HTMLElement).dataset.orderid)
        )
        .forEach((elem) => elem.parentNode.appendChild(elem));
    }
    return tmp2;
  }
}

function findClosestInput(elem: HTMLElement): HTMLElement {
  const tmp = elem.closest(".input-group");
  if (tmp !== null) return tmp.querySelector('input[type="text"]');
}

function removeById(id: string): void {
  const elem = document.getElementById(id);
  if (elem !== null) elem.remove();
}

function receiveStats(topic: string, txt: string): void {
  const dest = document.getElementById("stats-clients");
  if (topic == topic_stats + "/connected")
    if (dest !== null) dest.innerHTML = txt;
}

function sendComment(evt: Event | KeyboardEvent): void {
  let elem = this;
  if (
    (evt instanceof KeyboardEvent &&
      evt.type == "keypress" &&
      evt.key == "Enter" &&
      elem.value) ||
    (evt.type == "click" &&
      (elem = findClosestInput(this)) !== null &&
      elem.value)
  ) {
    if (send(topic_comment + "/" + random_id(), elem.value, true)) {
      elem.value = "";
    }
  }
}

function receiveComment(id: string, txt: string): void {
  if (txt) {
    storage.comments[id] = { text: txt };
    const data = {
      id: id,
      text: escapeHTML(txt),
      date: new Date().toLocaleString(),
    };
    addFromTemplate("template-comment", "comment-stream", data);
  } else {
    delete storage.comments[id];
    removeById("comment-" + id);
  }
}

function takeComment(evt: Event): void {
  if (confirm("Diesen Kommentar wirklich übernehmen?")) {
    const id = this.dataset.id;
    send(topic_comment + "/" + id, "", true);
    sendMessage(id, storage.comments[id].text);
  }
}

function deleteComment(evt: Event): void {
  if (confirm("Diesen Kommentar wirklich löschen?")) {
    const id = this.dataset.id;
    send(topic_comment + "/" + id, "", true);
  }
}

function sendNote(evt: Event | KeyboardEvent): void {
  let elem = this;
  if (
    (evt instanceof KeyboardEvent &&
      evt.type == "keypress" &&
      evt.key == "Enter") ||
    (evt.type == "click" && (elem = findClosestInput(this)) !== null)
  ) {
    if (send(topic_note, elem.value, true)) {
      elem.value = "";
    }
  }
}

function receiveNote(txt: string): void {
  if (txt) {
    const data = { text: escapeHTML(txt) };
    addFromTemplate("template-note", "note-stream", data);
  } else {
    removeById("note-top");
  }
}

function sendMessage(id: string, txt: string, likes: number = 0): boolean {
  const data = JSON.stringify({ text: txt, likes: likes });
  return send(topic_message + "/" + id, data, true);
}

function receiveMessage(id: string, input: string): void {
  if (input) {
    const json = JSON.parse(input);
    storage.messages[id] = {
      text: json.text,
      likes: json.likes,
    };
    const data = {
      id: id,
      text: escapeHTML(json.text),
      likes: escapeHTML(json.likes),
    };
    addFromTemplate("template-message", "message-stream", data);
  } else {
    delete storage.messages[id];
    removeById("message-" + id);
  }
}

function highlightMessage(evt: Event): boolean {
  const id = this.dataset.id;
  if (id && storage.messages[id]) {
    const data = JSON.stringify(storage.messages[id]);
    return send(topic_highlight, data);
  }
}

function likeMessage(evt: Event): void {
  const id = this.dataset.id;
  if (id) {
    // cookie
    let liked = [];
    try {
      const value = "; " + document.cookie;
      const parts = value.split("; liked=");
      if (parts.length == 2) {
        liked = JSON.parse(parts.pop().split(";").shift());
      }
    } catch (err) {}
    // like if unliked
    if (liked.indexOf(id) == -1) {
      liked.push(id);
      document.cookie = "liked=" + JSON.stringify(liked);
      document.cookie = "max-age=" + 6 * 60 * 60;
      if (send(topic_like + "/" + id + "/" + host_client, "like", true)) {
        const data = { id: id };
        addFromTemplate("template-likes-loading", "likes-" + id, data);
      }
    }
  }
}

function deleteMessage(evt: Event): void {
  if (confirm("Diese Nachricht wirklich löschen?")) {
    if (this.dataset.id) {
      send(topic_message + "/" + this.dataset.id, "", true);
    }
  }
}

function receiveLike(id: string, client: string, txt: string): void {
  if (txt && storage.messages[id]) {
    sendMessage(id, storage.messages[id].text, storage.messages[id].likes + 1);
    send(topic_like + "/" + id + "/" + client, "", true);
  }
}

function receiveHighlight(txt: string): void {
  const data = JSON.parse(txt);
  if (data) {
    addFromTemplate("template-highlight", "highlight-stream", data);
  }
}
