import { customElement, query, state } from "lit/decorators.js";
import { css, html, LitElement, nothing } from "lit";
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/callout/callout.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";
import "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import { styleMap } from "lit/directives/style-map.js";
import type { Metadata } from "./types.ts";
import { api, appSlice, type PrintWorthinessResponse, store } from "./store.ts";

interface Size {
  left: number;
  top: number;
  width: number;
  height: number;
}

@customElement("pba-taking-photo")
export class TakingPhoto extends LitElement {
  @query("video")
  video!: HTMLVideoElement;

  @query("canvas")
  canvas!: HTMLCanvasElement;

  @state()
  subscription: (() => void) | null = null;

  @state()
  videoHeight = 0;

  @state()
  metadata: Metadata | undefined = undefined;

  @state()
  interval: number | null = null;

  @state()
  secondsLeft = 5;

  @state()
  printerWorthiness: PrintWorthinessResponse = { personal: true, mosaic: true };

  _getRenderedVideoSize(): Size {
    const naturalWidth = this.video.videoWidth;
    const naturalHeight = this.video.videoHeight;
    const computedStyle = getComputedStyle(this.video);
    const computedWidth = parseInt(
      computedStyle.width.substring(0, computedStyle.width.length - 2),
    );
    const computedHeight = parseInt(
      computedStyle.height.substring(0, computedStyle.height.length - 2),
    );

    const actualAspectRatio = computedWidth / computedHeight;
    const naturalAspectRatio = naturalWidth / naturalHeight;

    const width =
      actualAspectRatio > naturalAspectRatio
        ? naturalWidth
        : naturalHeight * actualAspectRatio;
    const height =
      actualAspectRatio > naturalAspectRatio
        ? naturalWidth / actualAspectRatio
        : naturalHeight;
    const left =
      actualAspectRatio > naturalAspectRatio ? 0 : (naturalWidth - width) / 2;
    const top =
      actualAspectRatio > naturalAspectRatio ? (naturalHeight - height) / 2 : 0;

    return { left, top, width, height };
  }

  connectedCallback() {
    super.connectedCallback();
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        this.video.srcObject = stream;
        // noinspection JSIgnoredPromiseFromCall
        this.video.play();
      })
      .catch((err) => {
        console.error(`An error occurred: ${err}`);
      });
    const getMetadata = store.dispatch(api.endpoints.getMetadata.initiate());
    getMetadata.then((result) => {
      this.metadata = result.data;
    });
    this.subscription = getMetadata.unsubscribe;

    this.checkPrintWorthiness();
  }

  async checkPrintWorthiness() {
    const result = await store.dispatch(
      api.endpoints.checkPrintWorthiness.initiate(),
    );

    if (result.isSuccess) {
      this.printerWorthiness = result.data!;
    }
  }

  preventClose(e: Event) {
    if (!this.printerWorthiness.mosaic) {
      e.preventDefault();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.subscription?.();
  }

  takePicture() {
    const context = this.canvas.getContext("2d");
    if (!context || !this.interval || !this.metadata) {
      return;
    }

    const renderedSize = this._getRenderedVideoSize();
    context.drawImage(
      this.video,
      renderedSize.left,
      renderedSize.top,
      renderedSize.width,
      renderedSize.height,
      0,
      0,
      this.metadata.tile_width,
      this.metadata.tile_height,
    );
    const image = this.canvas.toDataURL("image/png");

    store.dispatch(appSlice.actions.setImage(image));
    store.dispatch(appSlice.actions.setPage("printing"));
    clearInterval(this.interval);
  }

  decrementTimer() {
    this.secondsLeft -= 1;
    if (this.secondsLeft <= 0) {
      this.takePicture();
    }
  }

  startTimer() {
    this.interval = setInterval(this.decrementTimer.bind(this), 1000);
  }

  dismiss() {
    this.printerWorthiness = { personal: true, mosaic: true };
  }

  render() {
    let message = "";
    if (!this.printerWorthiness.mosaic && !this.printerWorthiness.personal) {
      message =
        'Both printers are out of paper. Please at least refill the printer labelled "For the Mosaic".';
    } else if (
      this.printerWorthiness.mosaic &&
      !this.printerWorthiness.personal
    ) {
      message =
        "The printer labelled \"For You\" is out of paper. You don't have to refill it, but you won't get a copy for yourself.";
    } else if (
      !this.printerWorthiness.mosaic &&
      this.printerWorthiness.personal
    ) {
      message =
        'The printer labelled "For the Mosaic" is out of paper. Please refill it.';
    }

    const popupIsOptional =
      this.printerWorthiness.mosaic && !this.printerWorthiness.personal;

    return html`
      <wa-dialog
        label="Printer Out of Paper"
        .open=${!this.printerWorthiness.mosaic ||
        !this.printerWorthiness.personal}
        @wa-hide=${this.preventClose}
      >
        ${message} To refill:
        <ol>
          <li>Push down on the top and slide in the direction of the arrow</li>
          <li>Put 10 more sheets inside, white side up</li>
          <li>Put the top back on, sliding the opposite direction of step 1</li>
        </ol>
        <wa-button
          slot="footer"
          variant="brand"
          @click=${this.checkPrintWorthiness}
        >
          Retry
        </wa-button>
        ${popupIsOptional
          ? html`<wa-button slot="footer" @click=${this.dismiss}>
              Okay
            </wa-button>`
          : nothing}
      </wa-dialog>
      <div class="container">
        <div class="viewfinder">
          <video
            style=${styleMap({
              aspectRatio: `${this.metadata?.tile_width} / ${this.metadata?.tile_height}`,
            })}
          ></video>
          <canvas
            width=${this.metadata?.tile_width}
            height=${this.metadata?.tile_height}
          ></canvas>
        </div>
        <div class="actions" style=${`padding: ${this.interval ? 1.5 : 2}rem`}>
          ${this.interval
            ? html` <wa-callout variant="neutral">
                <wa-icon
                  slot="icon"
                  name="hourglass"
                  variant="regular"
                ></wa-icon>
                <strong>Timer Started</strong>&nbsp; ${this.secondsLeft} seconds
                left
              </wa-callout>`
            : html`<wa-button variant="brand" @click=${this.startTimer}>
                <wa-icon slot="start" name="camera"></wa-icon>
                Take Photo (${this.secondsLeft}s timer)
              </wa-button>`}
        </div>
      </div>
    `;
  }

  static styles = css`
    .container {
      background: #000000;
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .actions {
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999;
    }

    .viewfinder {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }

    canvas {
      position: absolute;
      opacity: 0;
      z-index: -1;
    }

    video {
      width: 100%;
      object-fit: cover;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "pba-taking-photo": TakingPhoto;
  }
}
