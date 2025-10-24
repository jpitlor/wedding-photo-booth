import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@awesome.me/webawesome/dist/components/switch/switch.js";
import "@awesome.me/webawesome/dist/components/button/button.js";

@customElement("pba-printing")
export class Printing extends LitElement {
  @property()
  picture: string = "";

  @state()
  sendToMe = false;

  handleSubmit(event: SubmitEvent) {
    this.dispatchEvent(new CustomEvent("restart"));
  }

  render() {
    return html`
      <div class="container">
        <img src=${this.picture} alt="" />
        <div class="content">
          <wa-button type="button" variant="danger">
            Take another picture
          </wa-button>
          <div class="divider-container">
            <hr />
            <span>or</span>
          </div>
          <form @submit=${this.handleSubmit}>
            <wa-switch checked disabled>Send to Cassie and Jordan</wa-switch>
            <wa-switch>Email to me</wa-switch>
            <wa-switch>Print as a sticker</wa-switch>
            <wa-switch>Print as a tile in the mosaic</wa-switch>
            <wa-button type="submit" variant="brand">
              Print and/or send
            </wa-button>
          </form>
        </div>
      </div>
    `;
  }

  static styles = css`
    .container {
      display: flex;
      flex-direction: row;
      width: 100vw;
      height: 100vh;
    }

    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .divider-container span {
      position: absolute;
      top: -0.5rem;
      left: calc(50% - 1rem);
      background: #ffffff;
    }

    .divider-container {
      margin: 2rem 0;
      position: relative;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "pba-printing": Printing;
  }
}
