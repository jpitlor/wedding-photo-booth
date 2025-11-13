import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import * as KioskBoard from "kioskboard";
import { api, appSlice, store } from "./store.ts";

import "@awesome.me/webawesome/dist/components/switch/switch.js";
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/card/card.js";
import "@awesome.me/webawesome/dist/components/input/input.js";
import "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import type WaSwitch from "@awesome.me/webawesome/dist/components/switch/switch.d.ts";
import "kioskboard/dist/kioskboard-2.3.0.min.css";

@customElement("pba-printing")
export class Printing extends LitElement {
  @property()
  image = store.getState().app.image;

  @state()
  emailToMe = false;

  @state()
  formState: "open" | "loading" | "error" | "finished" = "open";

  @state()
  unsubscribe: (() => void) | null = null;

  @query("form")
  form!: HTMLFormElement;

  @query("wa-switch[name=email_to_me]")
  emailToMeSwitch!: WaSwitch;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = store.subscribe(() => {
      this.image = store.getState().app.image;
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  async handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const body = new FormData(this.form);
    const result = await store.dispatch(api.endpoints.print.initiate(body));
    this.formState = result.error ? "error" : "finished";
    return false;
  }

  handleCancel() {
    store.dispatch(appSlice.actions.setPage("taking-photo"));
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
      <wa-dialog label="Photo Printing" .open=${this.formState === "finished"}>
        Success! The printers take a while to print, so please be patient if you
        are printing your photo.
        <br />
        If you are adding your photo to the mosaic, the tile number will be at
        the bottom of the photo.
      </wa-dialog>
      <wa-dialog label="Error Printing Photo" .open=${this.formState === "error"}>
        There was an error printing or emailing your photo. If there are no more
        spots in the mosaic left, that is the cause. Otherwise, please find 
        Jordan.
      </wa-dialog>
      <div class="container">
        <img src=${this.image} alt="" />
        <div class="options">
          <wa-card>
            <h2 slot="header">I hate it!</h2>
            <wa-button type="button" variant="danger" @click=${this.handleCancel}>
              Take another picture
            </wa-button>
          </wa-card>
          <wa-card>
            <h2 slot="header">I love it!</h2>
            <form @submit=${this.handleSubmit}>
              <input name="image" .value=${this.image} />
              <wa-switch checked disabled>Send to Cassie and Jordan</wa-switch>
              <br />
              <wa-switch name="email_to_me" @change=${this.handleSendToMeUpdate}>
                Email to me
              </wa-switch>
              <wa-input
                name="email"
                label="My Email"
                data-kioskboard-type="keyboard"
                data-kioskboard-placement="bottom"
                data-kioskboard-specialcharacters="false"
                class=${this.emailToMe ? "" : "invisible"}
              ></wa-input>
              <br />
              <wa-switch name="print">Print as a sticker</wa-switch>
              <br />
              <wa-switch name="print_in_mosaic">Print as a tile in the mosaic</wa-switch>
              <br />
              <br />
              <wa-button type="submit" variant="brand">
                Print and/or send
              </wa-button>
            </form>
          </wa-card>
        </div>
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
      flex-direction: column;
      gap: 2rem;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }

    img {
      max-height: 40vh;
    }

    wa-card {
      display: flex;
      flex-direction: column;
    }

    [name="image"] {
      display: none;
    }

    .invisible {
      display: none;
    }

    wa-input {
      margin-top: 1rem;
    }

    .options {
      display: flex;
      flex-direction: row;
      gap: 4rem;
      align-items: flex-start;
      justify-content: center;
    }

    h1 {
      margin: 0;
      padding: 0;
    }

    .columns {
      display: flex;
      flex-direction: row;
      gap: 1rem;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "pba-printing": Printing;
  }
}
