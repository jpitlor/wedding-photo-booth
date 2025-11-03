import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import "@awesome.me/webawesome/dist/components/card/card.js";
import "@awesome.me/webawesome/dist/components/button/button.js";

@customElement("pba-landing-page")
export class LandingPage extends LitElement {
  handleStart() {
    this.dispatchEvent(new CustomEvent("start"));
  }

  handleAdmin() {
    this.dispatchEvent(new CustomEvent("admin"));
  }

  render() {
    return html`
      <div id="hiddenAdminTrigger" @click=${this.handleAdmin} />
      <div class="container">
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
