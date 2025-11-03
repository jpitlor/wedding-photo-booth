import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@awesome.me/webawesome/dist/components/switch/switch.js";
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/card/card.js";

@customElement("pba-printing")
export class Printing extends LitElement {
  @property()
  picture: string = "";

  @state()
  sendToMe = false;

  handleSubmit(event: SubmitEvent) {
    this.dispatchEvent(new CustomEvent("restart"));
    console.log(event);
  }

  handleCancel() {
    this.dispatchEvent(new CustomEvent("cancel"));
  }

  handleSendToMeUpdate() {}

  render() {
    return html`
      <div class="container">
        <img src=${this.picture} alt="" />
        <wa-card>
          <h1 slot="header">Do you like it?</h1>
          <h2>No!</h2>
          <div>
            <wa-button type="button" variant="danger" @click=${this.handleCancel}>
              Take another picture
            </wa-button>
          </div>
          <div class="divider-container">
            <hr />
            <span>or</span>
          </div>
          <form @submit=${this.handleSubmit}>
            <h2>Yes!</h2>
            <wa-switch checked disabled>Send to Cassie and Jordan</wa-switch>
            <br />
            <wa-switch name="emailToMe" @change=${this.handleSendToMeUpdate}>
              Email to me
            </wa-switch>
            <br />
            ${
              this.sendToMe
                ? html`
                    <wa-input name="email" label="My Email"></wa-input>
                    <br />
                  `
                : nothing
            }
            <wa-switch name="print">Print as a sticker</wa-switch>
            <br />
            <wa-switch name="printInMosaic">Print as a tile in the mosaic</wa-switch>
            <br />
            <br />
            <wa-button type="submit" variant="brand">
              Print and/or send
            </wa-button>
          </form>
        </div>
      </div>
    `;
  }

  static styles = css`
    h1 {
      text-align: center;
      font-size: xx-large;
    }

    h2 {
      margin-top: 0;
    }

    .container {
      background-color: #eeeeee;
      display: flex;
      flex-direction: row;
      gap: 2rem;
      align-items: center;
      padding: 2rem;
      width: calc(100vw - 4rem);
      height: calc(100vh - 4rem);
    }

    img {
      width: 50%;
    }

    wa-card {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .divider-container span {
      position: absolute;
      top: -0.75rem;
      left: calc(50% - 1rem);
      padding: 0 0.5rem;
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
