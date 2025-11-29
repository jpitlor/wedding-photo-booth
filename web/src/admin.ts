import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import "@awesome.me/webawesome/dist/components/button/button.js";
import { map } from "lit/directives/map.js";
import { range } from "lit/directives/range.js";
import { api, appSlice, store } from "./store.ts";
import type { Metadata } from "./types.ts";
import { styleMap } from "lit/directives/style-map.js";

@customElement("pba-admin")
export class Admin extends LitElement {
  @state()
  tile: number | null = null;

  @state()
  metadata: Metadata | undefined = undefined;

  @state()
  unsubscribe: (() => void) | null = null;

  @state()
  logs: string | undefined = undefined;

  connectedCallback() {
    super.connectedCallback();
    const getMetadata = store.dispatch(api.endpoints.getMetadata.initiate());
    getMetadata.then((result) => {
      this.metadata = result.data;
    });
    this.unsubscribe = getMetadata.unsubscribe;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

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

  handleResetMosaic() {
    if (!confirm("Are you sure?")) {
      return;
    }

    store.dispatch(api.endpoints.resetMosaic.initiate());
  }

  async handleSeeLogs() {
    const result = await store.dispatch(api.endpoints.getLogs.initiate());
    this.logs = result.data?.logs;
  }

  handleLogsClose() {
    this.logs = undefined;
  }

  handleResetTile() {}

  handleReprintTile() {}

  render() {
    if (!this.metadata) {
      return nothing;
    }

    return html`
      <wa-dialog
        light-dismiss
        label="Tile Actions"
        .open=${this.tile != null}
        @wa-after-hide=${this.handleTileClose}
      >
        ${this.tile != null
          ? html`<img src=${`/api/tile/${this.tile}`} alt="" />`
          : nothing}
        <wa-button slot="footer" @click=${this.handleReprintTile}>
          Reprint
        </wa-button>
        <wa-button slot="footer" @click=${this.handleResetTile}>
          Reset
        </wa-button>
        <wa-button
          slot="footer"
          variant="brand"
          data-dialog="close"
          @click=${this.handleTileClose}
        >
          Close
        </wa-button>
      </wa-dialog>
      <wa-dialog
        light-dismiss
        label="Logs"
        .open=${!!this.logs}
        @wa-after-hide=${this.handleLogsClose}
      >
        <pre>${this.logs}</pre>
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
          <wa-button @click=${this.handleResetMosaic}>
            Reset Whole Mosaic
          </wa-button>
          <wa-button @click=${this.handleSeeLogs}>See Logs</wa-button>
        </div>
        <div
          class="images"
          style=${styleMap({
            "grid-template-columns": `repeat(${this.metadata?.column_count}, 1fr)`,
          })}
        >
          ${map(
            range(this.metadata.row_count * this.metadata.column_count),
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

    wa-dialog {
      --width: 75vw;
    }

    wa-dialog img {
      width: 100%;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "pba-admin": Admin;
  }
}
