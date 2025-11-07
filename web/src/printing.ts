import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import * as KioskBoard from "kioskboard";

import "@awesome.me/webawesome/dist/components/switch/switch.js";
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/card/card.js";
import "@awesome.me/webawesome/dist/components/input/input.js";
import type WaSwitch from "@awesome.me/webawesome/dist/components/switch/switch.d.ts";
import "kioskboard/dist/kioskboard-2.3.0.min.css";

@customElement("pba-printing")
export class Printing extends LitElement {
  @property()
  picture: string = "";

  @state()
  emailToMe = false;

  @query("form")
  form!: HTMLFormElement;

  @query("wa-switch[name=emailToMe]")
  emailToMeSwitch!: WaSwitch;

  async handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const response = await fetch("/api/print", {
      method: "POST",
      body: new FormData(this.form),
    });
    const body = await response.json();
    console.log(body);
    return false;
  }

  handleCancel() {
    this.dispatchEvent(new CustomEvent("cancel"));
  }

  handleSendToMeUpdate(_: Event) {
    this.emailToMe = this.emailToMeSwitch.checked;

    // Ideally, we'd like to do this on the first update, but the inner
    // shadow root hasn't rendered at that point. Perhaps there's an event
    // we can attach this to that I don't know about.
    const deepInput = this.renderRoot
      .querySelector("wa-input")
      ?.shadowRoot?.querySelector("input");
    if (!deepInput) {
      return;
    }

    KioskBoard.run(deepInput, {
      keysArrayOfObjects: [
        { "0": "@", "1": "." }, //"2": "@gmail.com", "3": "@yahoo.com" },
      ],
      theme: "light",
    });
  }

  // I don't like using snake_case, but I don't feel like figuring out why
  // Django can't convert between snake and camel case.
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
            <input name="image" .value=${this.picture} />
            <h2>Yes!</h2>
            <wa-switch checked disabled>Send to Cassie and Jordan</wa-switch>
            <br />
            <wa-switch name="email_to_me" @change=${this.handleSendToMeUpdate}>
              Email to me
            </wa-switch>
            <br />
            <wa-input
              name="email"
              label="My Email"
              class=${this.emailToMe ? "visible" : ""}
              data-kioskboard-type="keyboard"
              data-kioskboard-placement="bottom"
              data-kioskboard-specialcharacters="false"
            ></wa-input>
            <wa-switch name="print">Print as a sticker</wa-switch>
            <br />
            <wa-switch name="print_in_mosaic">Print as a tile in the mosaic</wa-switch>
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

    input[name="image"] {
      display: none;
    }

    wa-input {
      margin-top: 1rem;
      margin-bottom: 1rem;
      display: none;
    }

    wa-input.visible {
      display: block;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "pba-printing": Printing;
  }
}
