import { Client } from "paho-mqtt";
import { renderTemplate } from "../vanillaTemplates/core/renderTemplate";
import "./bootstrap.cyborg.min.css";
import "./styles.css";

type TemplateData = {
  elId: string;
  [_: string]: any;
};

type Comment = {
  text: string;
};

type Message = Comment & {
  likes: number;
  loading?: boolean;
};

function renderFromTemplate(
  tmplId: string,
  destId: string | HTMLElement,
  data: TemplateData,
) {
  const shadow = document.createElement("div");
  const tmpl = document.getElementById(tmplId) as HTMLTemplateElement;
  const dest =
    destId instanceof HTMLElement ? destId : document.getElementById(destId);
  const id = "#" + data.elId;
  const prev = dest?.querySelector(id) as HTMLElement;

  if (tmpl === null || dest === null) return;

  renderTemplate(tmpl, data, shadow).then(() => {
    registerEventListeners(shadow, data);
    if (prev) {
      prev.replaceWith(...shadow.childNodes);
    } else {
      dest.append(...shadow.childNodes);
    }
  });

  return;

  // sort
  const children = tmp2.parentNode?.querySelectorAll("[data-orderid]");
  if (children?.length) {
    Array.from(children)
      .sort((elem1, elem2) => {
        if (
          !(elem1 instanceof HTMLElement) ||
          !elem1.dataset.orderid ||
          !(elem2 instanceof HTMLElement) ||
          !elem2.dataset.orderid
        )
          return 0;
        return (
          Number.parseInt(elem2.dataset.orderid) -
          Number.parseInt(elem1.dataset.orderid)
        );
      })
      .forEach((elem) => elem.parentNode?.appendChild(elem));
  }
  return tmp2;
}

function registerEventListeners(fragment: HTMLElement, data: Dict<Function>) {
  [...fragment.querySelectorAll("[data-event]")]
    .filter((elem) => elem instanceof HTMLElement)
    .forEach((elem) => {
      elem.dataset.event?.split("|").forEach((pair) => {
        const [event, func] = pair.split(":");
        elem.addEventListener(event, data[func]);
      });
      elem.removeAttribute("data-event");
    });
}

class EventContribution {
  static topic_base =
    EventContribution.simpleHash(window.location.hostname || "localhost") +
    "/event/contribution/";
  static topic_comment = this.topic_base + "comment";
  static topic_note = this.topic_base + "note";
  static topic_message = this.topic_base + "message";
  static topic_like = this.topic_base + "like";
  static topic_highlight = this.topic_base + "highlight";
  static topic_stats = "$SYS/broker/clients";

  private host_client = "client-" + EventContribution.random_id();
  // @ts-ignore: 2 parameter call handled internally
  private mqtt = new Client(
    EventContribution.mqttUrl(),
    this.host_client,
  ) as any;

  constructor() {
    this.connect();
  }

  private _store = new Proxy(
    {
      note: undefined as string | undefined,
      highlight: undefined as string | undefined,
      comments: new Proxy<Dict<Comment>>(
        {},
        {
          deleteProperty: (target, symbol: string) => {
            document
              .getElementById("comment-stream")
              ?.querySelector("#comment-" + symbol)
              ?.remove();
            delete target[symbol];
            return true;
          },
          set: (target, symbol: string, newValue: Comment) => {
            const root = document.getElementById("comment-stream");
            const data = {
              date: new Date().toLocaleString(),
              elId: "comment-" + symbol,
              id: symbol,
              text: newValue.text,
              onDeleteComment: this.onDeleteComment.bind(this),
              onTakeComment: this.onTakeComment.bind(this),
            };
            renderFromTemplate("template-comment", root, data);
            target[symbol] = newValue;
            return true;
          },
        },
      ),
      messages: new Proxy<Dict<Message>>(
        {},
        {
          deleteProperty: (target, symbol: string) => {
            document
              .getElementById("message-stream")
              ?.querySelector("#message-" + symbol)
              ?.remove();
            delete target[symbol];
            return true;
          },
          set: (target, symbol: string, newValue: Message) => {
            const root = document.getElementById("message-stream");
            const data = {
              elId: "message-" + symbol,
              id: symbol,
              likes: newValue.likes,
              loading: newValue.loading,
              text: newValue.text,
              onDeleteMessage: this.onDeleteMessage.bind(this),
              onHighlightMessage: this.onHighlightMessage.bind(this),
              onLikeMessage: this.onLikeMessage.bind(this),
            };
            renderFromTemplate("template-message", root, data);
            target[symbol] = newValue;
            if (this._store.highlight === symbol) {
              this._store.highlight = symbol;
            }
            return true;
          },
        },
      ),
    },
    {
      set(target, symbol, newValue) {
        if (symbol === "note") {
          if (newValue) {
            const data = { elId: "note-top", text: newValue };
            renderFromTemplate("template-note", "note-stream", data);
          } else {
            document.getElementById("note-top")?.remove();
          }
        } else if (symbol === "highlight") {
          if (newValue) {
            renderFromTemplate("template-highlight", "highlight-stream", {
              ...newValue,
              elId: "current-highlight",
            });
          } else {
            document
              .getElementById("highlight-stream")
              ?.querySelector("#current-highlight")
              ?.remove();
          }
        } else {
          return false;
        }

        target[symbol] = newValue;

        return true;
      },
    },
  );

  static random_id(): string {
    return (
      Number(String(Math.random()).slice(2)) +
      Date.now() +
      Math.round(performance.now())
    ).toString(36);
  }

  static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return (hash >>> 0).toString(36);
  }

  static mqttUrl(): string {
    if (
      window.location.hostname == "localhost" ||
      window.location.hostname.endsWith(".vercel.app")
    ) {
      return "wss://broker.emqx.io:8084/mqtt";
    } else if (window.location.protocol == "https:") {
      return `wss://${window.location.hostname}:${window.location.port}/mqtt`;
    } else {
      return `ws://${window.location.hostname}:${window.location.port}/mqtt`;
    }
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

  send(topic: string, payload: string, retain: boolean = false): boolean {
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
      renderFromTemplate("template-toast", "toast-host", { text: txt });
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
      registerEventListeners(document.body, {
        onSendComment: this.onSendComment.bind(this),
        onSendNote: this.onSendNote.bind(this),
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
        this.onReceiveStats(msg.destinationName, msg.payloadString);
      }
      // comment
      else if (
        msg.destinationName.startsWith(EventContribution.topic_comment + "/")
      ) {
        const subtopic = msg.destinationName.substr(
          EventContribution.topic_comment.length + 1,
        );
        this.onReceiveComment(subtopic, msg.payloadString);
      }
      // note
      else if (msg.destinationName == EventContribution.topic_note) {
        this.onReceiveNote(msg.payloadString);
      }
      // message
      else if (
        msg.destinationName.startsWith(EventContribution.topic_message + "/")
      ) {
        const subtopic = msg.destinationName.substr(
          EventContribution.topic_message.length + 1,
        );
        this.onReceiveMessage(subtopic, msg.payloadString);
      }
      // like
      else if (
        msg.destinationName.startsWith(EventContribution.topic_like + "/")
      ) {
        const subtopic = msg.destinationName.substr(
          EventContribution.topic_like.length + 1,
        );
        const paths = subtopic.split("/");
        this.onReceiveLike(paths[0], paths[1], msg.payloadString);
      }
      // highlight
      else if (msg.destinationName == EventContribution.topic_highlight) {
        this.onReceiveHighlight(msg.payloadString);
      }
      // unknown
      else {
        console.log(msg.destinationName, msg.payloadString);
      }
    } catch (err) {
      console.log("failed to hande message", err);
    }
  }

  findClosestInput(elem: HTMLElement): HTMLInputElement | null | undefined {
    return elem.closest(".input-group")?.querySelector("input");
  }

  onReceiveStats(topic: string, txt: string): void {
    const dest = document.getElementById("stats-clients");
    if (topic == EventContribution.topic_stats + "/connected")
      if (dest !== null) dest.innerHTML = txt;
  }

  onSendComment(evt: Event | KeyboardEvent): void {
    let target = evt.target as HTMLElement | null | undefined;
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
      if (
        this.send(
          EventContribution.topic_comment + "/" + EventContribution.random_id(),
          target.value,
          true,
        )
      ) {
        target.value = "";
      }
    }
  }

  onReceiveComment(id: string, txt: string): void {
    if (txt) {
      this._store.comments[id] = { text: txt };
    } else {
      delete this._store.comments[id];
    }
  }

  onTakeComment(evt: UIEvent): void {
    const target = evt.target as HTMLElement | null;
    const id = target?.dataset.id;
    if (!id) return;

    // remove comment
    this.send(EventContribution.topic_comment + "/" + id, "", true);

    // add message
    const data = JSON.stringify({
      text: this._store.comments[id]?.text,
      likes: 0,
    });
    this.send(EventContribution.topic_message + "/" + id, data, true);
  }

  onDeleteComment(evt: UIEvent): void {
    const target = evt.target as HTMLElement | null;
    const id = target?.dataset.id;
    if (id && confirm("Diesen Kommentar wirklich löschen?")) {
      this.send(EventContribution.topic_comment + "/" + id, "", true);
    }
  }

  onSendNote(evt: UIEvent): void {
    let target = evt.target as HTMLElement | null | undefined;
    if (
      (evt instanceof KeyboardEvent &&
        target instanceof HTMLInputElement &&
        evt.type == "keypress" &&
        evt.key == "Enter") ||
      (target instanceof HTMLElement &&
        evt.type == "click" &&
        (target = this.findClosestInput(target)) !== null &&
        target instanceof HTMLElement)
    ) {
      if (
        target instanceof HTMLInputElement &&
        this.send(EventContribution.topic_note, target.value, true)
      ) {
        target.value = "";
      }
    }
  }

  onReceiveNote(txt: string): void {
    this._store.note = txt;
  }

  onReceiveMessage(id: string, input: string): void {
    if (input) {
      const json = JSON.parse(input);
      this._store.messages[id] = {
        text: json.text,
        likes: json.likes,
      };
    } else {
      delete this._store.messages[id];
    }
  }

  onHighlightMessage(evt: UIEvent): boolean {
    const target = evt.target as HTMLElement | null;
    const id = target?.dataset.id;
    if (id && this._store.messages[id]) {
      const data = JSON.stringify(this._store.messages[id]);
      return this.send(EventContribution.topic_highlight, data);
    }
    return false;
  }

  onLikeMessage(evt: UIEvent): void {
    const target = evt.target as HTMLElement | null;
    const id = target?.dataset.id;
    if (!id) return;
    // cookie
    let liked: string[] = [];
    try {
      const value = "; " + document.cookie;
      const parts = value.split("; liked=");
      if (parts.length == 2) {
        liked = JSON.parse(parts.pop()?.split(";").shift() || "");
      }
    } catch (err) {}
    // like if unliked
    if (liked.indexOf(id) == -1) {
      liked.push(id);
      document.cookie = "liked=" + JSON.stringify(liked);
      document.cookie = "max-age=" + 6 * 60 * 60;
      if (
        this.send(
          EventContribution.topic_like + "/" + id + "/" + this.host_client,
          "like",
          true,
        )
      ) {
        this._store.messages[id] = {
          ...this._store.messages[id],
          loading: true,
        };
      }
    }
  }

  onDeleteMessage(evt: UIEvent): void {
    const target = evt.target as HTMLElement | null;
    if (confirm("Diese Nachricht wirklich löschen?")) {
      if (target?.dataset.id) {
        this.send(
          EventContribution.topic_message + "/" + target.dataset.id,
          "",
          true,
        );
      }
    }
  }

  onReceiveLike(id: string, client: string, txt: string): void {
    if (!txt || !this._store.messages[id]) return;

    // update message
    const data = JSON.stringify({
      text: this._store.messages[id]?.text,
      likes: this._store.messages[id].likes + 1,
    });
    this.send(EventContribution.topic_message + "/" + id, data, true);

    // clear like
    this.send(EventContribution.topic_like + "/" + id + "/" + client, "", true);
  }

  onReceiveHighlight(txt: string): void {
    const data = JSON.parse(txt);
    this._store.highlight = data;
  }
}

document.addEventListener("DOMContentLoaded", () => new EventContribution());
