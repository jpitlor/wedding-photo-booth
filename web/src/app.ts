import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./landing-page.ts";
import "./taking-photo.ts";
import "./printing.ts";

@customElement("pba-app")
export class App extends LitElement {
  @state()
  state: "landing-page" | "taking-photo" | "printing" = "landing-page";

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
        ></pba-printing>`;
      case "landing-page":
      default:
        return html`
          <pba-landing-page @start=${this.handleStart}></pba-landing-page>
        `;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pba-app": App;
  }
}
