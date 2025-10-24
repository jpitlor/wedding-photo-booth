import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./landing-page.ts";
import "./taking-photo.ts";

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
    this.picture = e.detail.value;
  }

  render() {
    switch (this.state) {
      case "taking-photo":
        return html`<pba-taking-photo
          @picture=${this.handlePicture}
        ></pba-taking-photo>`;
      case "printing":
        return html`<img src=${this.picture} alt="" />`;
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
