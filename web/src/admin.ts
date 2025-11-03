import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import "@awesome.me/webawesome/dist/components/button/button.js";

@customElement("pba-admin")
export class Admin extends LitElement {
  @state()
  tile: number | null = null;

  @state()
  gridColumns = 5;

  @state()
  gridRows = 10;

  handleEditAdminMode() {
    this.dispatchEvent(new CustomEvent("reset"));
  }

  render() {
    return html`
      <wa-dialog label="Tile Actions" .open=${!!this.tile}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        <wa-button slot="footer" variant="brand" data-dialog="close">
          Close
        </wa-button>
      </wa-dialog>
      <div class="container">
        <div class="actions">
          <wa-button @click=${this.handleEditAdminMode}>
            Exit Admin Mode
          </wa-button>
          <wa-button>Reset Whole Mosaic</wa-button>
        </div>
        <div class="images">
          ${new Array(this.gridColumns * this.gridRows).map(
            (_, i) => html`<img .src=${`/api/tile/${i}`} alt="" />`,
          )}
        </div>
      </div>
    `;
  }

  static styles = css`
    .container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100vw;
      height: 100vh;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "pba-admin": Admin;
  }
}
