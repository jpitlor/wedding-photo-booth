import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import "@awesome.me/webawesome/dist/components/card/card.js";
import "@awesome.me/webawesome/dist/components/button/button.js";
import { appSlice, store } from "./store.ts";

@customElement("pba-landing-page")
export class LandingPage extends LitElement {
  handleStart() {
    store.dispatch(appSlice.actions.setPage("taking-photo"));
  }

  handleAdmin() {
    store.dispatch(appSlice.actions.setPage("admin"));
  }

  render() {
    return html`
      <div class="container">
        <div id="hiddenAdminTrigger" @click=${this.handleAdmin}></div>
        <wa-card>
          <h3 slot="header" class="card-title">Photo Booth</h3>
          Welcome to Cassie and Jordan's wedding!
          <wa-button
            slot="header-actions"
            variant="brand"
            @click=${this.handleStart}
          >
            <wa-icon slot="start" name="camera"></wa-icon>
            Start
          </wa-button>
        </wa-card>
      </div>
    `;
  }

  static styles = css`
    @keyframes animatedBackground {
      from {
        background-position: 0 100%;
      }
      to {
        background-position: 800px calc(100% - 600px);
      }
    }

    .container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100vw;
      height: 100vh;
      background-image: url(/collage.png);
      background-repeat: repeat;
      animation: animatedBackground 20s linear infinite;
    }

    #hiddenAdminTrigger {
      position: absolute;
      left: 0;
      top: 0;
      width: 100px;
      height: 100px;
      z-index: 999;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "pba-landing-page": LandingPage;
  }
}
