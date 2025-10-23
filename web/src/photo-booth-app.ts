import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import "@awesome.me/webawesome/dist/components/card/card.js";
import "@awesome.me/webawesome/dist/components/button/button.js";

@customElement("photo-booth-app")
export class PhotoBoothApp extends LitElement {
  render() {
    return html`
      <div class="container">
        <wa-card>
          <h3 slot="header" class="card-title">Photo Booth</h3>
          Welcome to Cassie and Jordan's wedding!
          <wa-button slot="header-actions" variant="brand">Start</wa-button>
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
      animation: animatedBackground 10s linear infinite;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "photo-booth-app": PhotoBoothApp;
  }
}
