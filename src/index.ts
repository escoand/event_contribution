import { Client } from "paho-mqtt";
import "./bootstrap.cyborg.min.css";
import "./styles.css";

class EventContribution {
  static topic_base = EventContribution.simpleHash(window.location.hostname || "localhost") + "/event/contribution/";
  static topic_comment = this.topic_base + "comment";
  static topic_note = this.topic_base + "note";
  static topic_message = this.topic_base + "message";
  static topic_like = this.topic_base + "like";
  static topic_highlight = this.topic_base + "highlight";
  static topic_stats = "$SYS/broker/clients";

  private host_client = "client-" + EventContribution.random_id();
  // @ts-ignore: 2 parameter call handled internally
  private mqtt = new Client(EventContribution.mqttUrl(), this.host_client) as any;
  private storage = { comments: {}, messages: {} };
  private functions: { [index: string]: (evt: UIEvent) => any } = {
    deleteComment: this.deleteComment.bind(this),
    deleteMessage: this.deleteMessage.bind(this),
    highlightMessage: this.highlightMessage.bind(this),
    likeMessage: this.likeMessage.bind(this),
    sendComment: this.sendComment.bind(this),
    sendNote: this.sendNote.bind(this),
    takeComment: this.takeComment.bind(this),
  };

  constructor() {
    this.connect();
  }

  static random_id(): string {
    return (
      Number(String(Math.random()).slice(2)) +
      Date.now() +
      Math.round(performance.now())
    ).toString(36);
  }

  static simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
    }
    return (hash >>> 0).toString(36)
  }

  static mqttUrl(): string {
    if (
      window.location.hostname == "localhost" ||
      window.location.hostname.endsWith(".vercel.app")
    ) {
      return "wss://mqtt.eclipseprojects.io/mqtt";
    } else if (window.location.protocol == "https:") {
      return `wss://${window.location.hostname}:${window.location.port}/mqtt`;
    } else {
      return `ws://${window.location.hostname}:${window.location.port}/mqtt`;
    }
  }

  escapeHTML(txt: string): string {
    const tmp = document.createElement("div");
    tmp.append(txt);
    return tmp.innerHTML;
  }

  connect(): void {
    this.mqtt.onMessageArrived = this.onReceive.bind(this);
    this.mqtt.onConnectionLost = this.onFailure.bind(this);
    this.showToast("Verbinde zum Server");
    try {
      this.mqtt.connect({
        onSuccess: this.onConnect.bind(this),
        onFailure: this.onFailure.bind(this),
      });
    } catch (err) {
      console.log(err);
      this.showToast("FEHLER: Versuche die Seite neu zu laden.");
    }
  }

  send(
    topic: string,
    payload: string,
    retain: boolean = false
  ): boolean {
    try {
      this.showToast();
      this.mqtt.send(topic, payload, 1, retain);
      return true;
    } catch (err) {
      console.log(err);
      this.showToast("FEHLER: Versuche es erneut.");
    }
    return false;
  }

  showToast(txt?: string): void {
    const elem = document.getElementById("toast");
    if (txt) {
      this.addFromTemplate("template-toast", "toast-host", { text: txt });
    } else if (elem) {
      elem.remove();
    }
  }

  onFailure(err: any): void {
    console.log(err);
    this.showToast("FEHLER: Neue Verbindung in 2 Sekunden.");
    window.setTimeout(this.connect, 2000);
  }

  onConnect(): void {
    this.showToast();
    try {
      this.mqtt.subscribe(EventContribution.topic_note, { qos: 1 });
      this.mqtt.subscribe(EventContribution.topic_message + "/+", { qos: 1 });
      this.mqtt.subscribe(EventContribution.topic_highlight, { qos: 1 });
      if (document.querySelector("body[data-is-admin]")) {
        this.mqtt.subscribe(EventContribution.topic_comment + "/+", { qos: 1 });
        this.mqtt.subscribe(EventContribution.topic_like + "/+/+", { qos: 1 });
        this.mqtt.subscribe(EventContribution.topic_stats + "/#", { qos: 1 });
      }
      // bind keypress
      document.querySelectorAll("[data-bind-keypress]").forEach((elem) => {
        if (!(elem instanceof HTMLElement) || !elem.dataset.bindKeypress) return
        elem.addEventListener(
          "keypress",
          this.functions[((elem).dataset.bindKeypress)]
        );
      });
      // bind click
      document.querySelectorAll("[data-bind-click]").forEach((elem) => {
        if (!(elem instanceof HTMLElement) || !elem.dataset.bindClick) return
        try {
          elem.addEventListener(
            "click",
            this.functions[((elem).dataset.bindClick)]
          );
        } catch (err) {
          console.log("unable to bind function", elem, err);
        }
      });
    } catch (err) {
      console.log(err);
      this.showToast("FEHLER: Versuche die Seite neu zu laden.");
    }
  }

  onReceive(msg: any): void {
    try {
      // stats
      if (msg.destinationName.startsWith(EventContribution.topic_stats + "/")) {
        this.receiveStats(msg.destinationName, msg.payloadString);
      }
      // comment
      else if (msg.destinationName.startsWith(EventContribution.topic_comment + "/")) {
        const subtopic = msg.destinationName.substr(EventContribution.topic_comment.length + 1);
        this.receiveComment(subtopic, msg.payloadString);
      }
      // note
      else if (msg.destinationName == EventContribution.topic_note) {
        this.receiveNote(msg.payloadString);
      }
      // message
      else if (msg.destinationName.startsWith(EventContribution.topic_message + "/")) {
        const subtopic = msg.destinationName.substr(EventContribution.topic_message.length + 1);
        this.receiveMessage(subtopic, msg.payloadString);
      }
      // like
      else if (msg.destinationName.startsWith(EventContribution.topic_like + "/")) {
        const subtopic = msg.destinationName.substr(EventContribution.topic_like.length + 1);
        const paths = subtopic.split("/");
        this.receiveLike(paths[0], paths[1], msg.payloadString);
      }
      // highlight
      else if (msg.destinationName == EventContribution.topic_highlight) {
        this.receiveHighlight(msg.payloadString);
      }
      // unknown
      else {
        console.log(msg.destinationName, msg.payloadString);
      }
    } catch (err) {
      console.log("failed to hande message", err);
    }
  }

  addFromTemplate(
    tmplId: string,
    destId: string,
    data: Object
  ): HTMLElement | undefined {
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
        if (!(elem instanceof HTMLElement) || !(elem).dataset.bindClick) return
        try {
          elem.addEventListener(
            "click",
            this.functions[(elem).dataset.bindClick]
          );
        } catch (err) {
          console.log("unable to bind function", elem);
        }
      });
      // replace old
      const old = document.getElementById(tmp2.id);
      if (tmp2.id && old !== null) {
        old.parentNode?.replaceChild(tmp2, old);
      } else {
        dest.appendChild(tmp2);
      }
      // sort
      const children = tmp2.parentNode?.querySelectorAll("[data-orderid]");
      if (children?.length) {
        Array.from(children)
          .sort(
            (elem1, elem2) => {
              if (!(elem1 instanceof HTMLElement) || !(elem1).dataset.orderid || !(elem2 instanceof HTMLElement) || !(elem2).dataset.orderid) return 0
              return Number.parseInt((elem2).dataset.orderid) -
                Number.parseInt((elem1).dataset.orderid)
            }
          )
          .forEach((elem) => elem.parentNode?.appendChild(elem));
      }
      return tmp2;
    }
  }

  findClosestInput(elem: HTMLElement): HTMLInputElement | null | undefined {
    return elem.closest(".input-group")?.querySelector("input");
  }

  removeById(id: string): void {
    document.getElementById(id)?.remove();
  }

  receiveStats(topic: string, txt: string): void {
    const dest = document.getElementById("stats-clients");
    if (topic == EventContribution.topic_stats + "/connected")
      if (dest !== null) dest.innerHTML = txt;
  }

  sendComment(evt: Event | KeyboardEvent): void {
    let target = evt.target as HTMLElement | null | undefined
    if (
      (evt instanceof KeyboardEvent &&
        evt.type == "keypress" &&
        evt.key == "Enter" &&
        target instanceof HTMLInputElement &&
        target.value) ||
      (evt.type == "click" &&
        target instanceof HTMLElement &&
        (target = this.findClosestInput(target)) !== null &&
        target instanceof HTMLInputElement &&
        target.value)
    ) {
      if (this.send(EventContribution.topic_comment + "/" + EventContribution.random_id(), target.value, true)) {
        target.value = "";
      }
    }
  }

  receiveComment(id: string, txt: string): void {
    if (txt) {
      this.storage.comments[id] = { text: txt };
      const data = {
        id: id,
        text: this.escapeHTML(txt),
        date: new Date().toLocaleString(),
      };
      this.addFromTemplate("template-comment", "comment-stream", data);
    } else {
      delete this.storage.comments[id];
      this.removeById("comment-" + id);
    }
  }

  takeComment(evt: UIEvent): void {
    const target = evt.target as HTMLElement | null
    const id = target?.dataset.id;
    if (!id) return;
    //if (confirm("Diesen Kommentar wirklich übernehmen?")) {
    this.send(EventContribution.topic_comment + "/" + id, "", true);
    this.sendMessage(id, this.storage.comments[id].text);
    //}
  }

  deleteComment(evt: UIEvent): void {
    const target = evt.target as HTMLElement | null
    const id = target?.dataset.id;
    if (id && confirm("Diesen Kommentar wirklich löschen?")) {
      this.send(EventContribution.topic_comment + "/" + id, "", true);
    }
  }

  sendNote(evt: UIEvent): void {
    let target = evt.target as HTMLElement | null | undefined;
    if (
      (evt instanceof KeyboardEvent &&
        target instanceof HTMLInputElement &&
        evt.type == "keypress" &&
        evt.key == "Enter") ||
      (
        target instanceof HTMLElement && evt.type == "click" && (target = this.findClosestInput(target)) !== null) && target instanceof HTMLElement
    ) {
      if (target instanceof HTMLInputElement && this.send(EventContribution.topic_note, target.value, true)) {
        target.value = "";
      }
    }
  }

  receiveNote(txt: string): void {
    if (txt) {
      const data = { text: this.escapeHTML(txt) };
      this.addFromTemplate("template-note", "note-stream", data);
    } else {
      this.removeById("note-top");
    }
  }

  sendMessage(id: string, txt: string, likes: number = 0): boolean {
    const data = JSON.stringify({ text: txt, likes: likes });
    return this.send(EventContribution.topic_message + "/" + id, data, true);
  }

  receiveMessage(id: string, input: string): void {
    if (input) {
      const json = JSON.parse(input);
      this.storage.messages[id] = {
        text: json.text,
        likes: json.likes,
      };
      const data = {
        id: id,
        text: this.escapeHTML(json.text),
        likes: this.escapeHTML(json.likes),
      };
      this.addFromTemplate("template-message", "message-stream", data);
    } else {
      delete this.storage.messages[id];
      this.removeById("message-" + id);
    }
  }

  highlightMessage(evt: UIEvent): boolean {
    const target = evt.target as HTMLElement | null
    const id = target?.dataset.id;
    if (id && this.storage.messages[id]) {
      const data = JSON.stringify(this.storage.messages[id]);
      return this.send(EventContribution.topic_highlight, data);
    } return false
  }

  likeMessage(evt: UIEvent): void {
    const target = evt.target as HTMLElement | null
    const id = target?.dataset.id;
    if (!id) return
    // cookie
    let liked: string[] = [];
    try {
      const value = "; " + document.cookie;
      const parts = value.split("; liked=");
      if (parts.length == 2) {
        liked = JSON.parse(parts.pop()?.split(";").shift() || "");
      }
    } catch (err) { }
    // like if unliked
    if (liked.indexOf(id) == -1) {
      liked.push(id);
      document.cookie = "liked=" + JSON.stringify(liked);
      document.cookie = "max-age=" + 6 * 60 * 60;
      if (this.send(EventContribution.topic_like + "/" + id + "/" + this.host_client, "like", true)) {
        const data = { id: id };
        this.addFromTemplate("template-likes-loading", "likes-" + id, data);
      }
    }
  }

  deleteMessage(evt: UIEvent): void {
    const target = evt.target as HTMLElement | null
    if (confirm("Diese Nachricht wirklich löschen?")) {
      if (target?.dataset.id) {
        this.send(EventContribution.topic_message + "/" + target.dataset.id, "", true);
      }
    }
  }

  receiveLike(id: string, client: string, txt: string): void {
    if (txt && this.storage.messages[id]) {
      this.sendMessage(id, this.storage.messages[id].text, this.storage.messages[id].likes + 1);
      this.send(EventContribution.topic_like + "/" + id + "/" + client, "", true);
    }
  }

  receiveHighlight(txt: string): void {
    const data = JSON.parse(txt);
    if (!data) return
    this.addFromTemplate("template-highlight", "highlight-stream", data);
  }
}

document.addEventListener("DOMContentLoaded", () => new EventContribution());