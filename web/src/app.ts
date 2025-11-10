import { LitElement, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./landing-page.ts";
import "./taking-photo.ts";
import "./printing.ts";
import "./admin.ts";
import { store } from "./store.ts";

@customElement("pba-app")
export class App extends LitElement {
  @state()
  page = store.getState().app.page;

  @state()
  unsubscribe: (() => void) | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = store.subscribe(() => {
      this.page = store.getState().app.page;
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  render() {
    if (!this.page) {
      return nothing;
    }

    switch (this.page) {
      case "taking-photo":
        return html`<pba-taking-photo></pba-taking-photo>`;
      case "printing":
        return html`<pba-printing></pba-printing>`;
      case "admin":
        return html`<pba-admin></pba-admin>`;
      case "landing-page":
      default:
        return html` <pba-landing-page></pba-landing-page> `;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pba-app": App;
  }
}
