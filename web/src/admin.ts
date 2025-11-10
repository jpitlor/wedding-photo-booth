import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import "@awesome.me/webawesome/dist/components/button/button.js";
import { map } from "lit/directives/map.js";
import { range } from "lit/directives/range.js";
import { appSlice, store } from "./store.ts";

@customElement("pba-admin")
export class Admin extends LitElement {
  @state()
  tile: number | null = null;

  @state()
  gridColumns = 10;

  @state()
  gridRows = 15;

  handleExitAdminMode(_: Event) {
    store.dispatch(appSlice.actions.setPage("landing-page"));
  }

  makeHandleTileClick(i: number) {
    return (_: Event) => {
      this.tile = i;
    };
  }

  handleTileClose(_: Event) {
    this.tile = null;
  }

  render() {
    return html`
      <wa-dialog label="Tile Actions" .open=${!!this.tile}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        <wa-button
          slot="footer"
          variant="brand"
          data-dialog="close"
          @click=${this.handleTileClose}
        >
          Close
        </wa-button>
      </wa-dialog>
      <div class="container">
        <div class="actions">
          <wa-button @click=${this.handleExitAdminMode}>
            Exit Admin Mode
          </wa-button>
          <wa-button>Reset Whole Mosaic</wa-button>
        </div>
        <div class="images">
          ${map(
            range(this.gridRows * this.gridColumns),
            (i) =>
              html`<img
                .src=${`/api/tile/${i}`}
                @click=${this.makeHandleTileClick(i)}
              />`,
          )}
        </div>
      </div>
    `;
  }

  static styles = css`
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100vw;
      height: 100vh;
    }

    .actions {
      padding: 2rem;
    }

    .images {
      display: grid;
      position: relative;
      flex: 1;
      grid-template-columns: repeat(10, 1fr);
      gap: 5px;
      padding: 2rem;
      overflow-y: auto;
    }

    .images > img {
      max-width: 100%;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "pba-admin": Admin;
  }
}
