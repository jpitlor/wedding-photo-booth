import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./landing-page.ts";
import "./taking-photo.ts";
import "./printing.ts";
import "./admin.ts";

@customElement("pba-app")
export class App extends LitElement {
  @state()
  state: "landing-page" | "taking-photo" | "printing" | "admin" = "admin";

  @state()
  picture = "";

  handleStart() {
    this.state = "taking-photo";
  }

  handlePicture(e: CustomEvent) {
    this.state = "printing";
    this.picture = e.detail;
  }

  handleRestart() {
    this.state = "landing-page";
  }

  handleAdmin() {
    this.state = "admin";
  }

  render() {
    switch (this.state) {
      case "taking-photo":
        return html`<pba-taking-photo
          @picture=${this.handlePicture}
          @restart=${this.handleRestart}
        ></pba-taking-photo>`;
      case "printing":
        return html`<pba-printing
          .picture=${this.picture}
          @restart=${this.handleRestart}
          @cancel=${this.handleStart}
        ></pba-printing>`;
      case "admin":
        return html`<pba-admin @restart=${this.handleRestart}></pba-admin>`;
      case "landing-page":
      default:
        return html`
          <pba-landing-page
            @start=${this.handleStart}
            @admin=${this.handleAdmin}
          ></pba-landing-page>
        `;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pba-app": App;
  }
}
