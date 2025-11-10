import { customElement, query, state } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/callout/callout.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";
import { styleMap } from "lit/directives/style-map.js";
import type { Metadata } from "./types.ts";
import { api, appSlice, store } from "./store.ts";

const PrinterWidth = parseInt(import.meta.env.VITE_PHOTO_PRINTER_WIDTH);
const PrinterHeight = parseInt(import.meta.env.VITE_PHOTO_PRINTER_HEIGHT);

@customElement("pba-taking-photo")
export class TakingPhoto extends LitElement {
  @query("video")
  video!: HTMLVideoElement;

  @query("canvas")
  canvas!: HTMLCanvasElement;

  @state()
  subscription: (() => void) | null = null;

  @state()
  metadata: Metadata | undefined = undefined;

  @state()
  interval: number | null = null;

  @state()
  secondsLeft = 1; // TODO: For testing. Change back to 10.

  connectedCallback() {
    super.connectedCallback();
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        this.video.addEventListener("canplay", (_) => {
          this.video.style.maxHeight = `${this.video.videoHeight}px`;
        });

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

    // First we'll get the full image
    context.drawImage(this.video, 0, 0, PrinterWidth, PrinterHeight);
    const fullImage = this.canvas.toDataURL("image/png");

    // Then we'll get the cropped mosaic image
    const x = (PrinterWidth - this.metadata.tile_width) / 2;
    const y = (PrinterHeight - this.metadata.tile_height) / 2;
    context.reset();
    context.drawImage(
      this.video,
      x,
      y,
      this.metadata.tile_width,
      this.metadata.tile_height,
    );
    const mosaicImage = this.canvas.toDataURL("image/png");

    store.dispatch(appSlice.actions.setPersonalImage(fullImage));
    store.dispatch(appSlice.actions.setMosaicImage(mosaicImage));
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

  render() {
    return html`
      <div class="container">
        <div class="viewfinder">
          <video
            style=${styleMap({
              aspectRatio: `${PrinterWidth} / ${PrinterHeight}`,
            })}
          ></video>
          <canvas width=${PrinterWidth} height=${PrinterHeight}></canvas>
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
    }

    canvas {
      position: absolute;
      opacity: 0;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "pba-taking-photo": TakingPhoto;
  }
}
