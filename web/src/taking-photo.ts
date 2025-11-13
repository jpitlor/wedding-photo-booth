import { customElement, query, state } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/callout/callout.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";
import { styleMap } from "lit/directives/style-map.js";
import type { Metadata } from "./types.ts";
import { api, appSlice, store } from "./store.ts";

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
  secondsLeft = 1; // TODO: For testing. Change back to 10.

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
    console.log(
      naturalWidth,
      naturalHeight,
      computedStyle,
      computedWidth,
      computedHeight,
    );

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
    console.log(renderedSize);
    context.drawImage(
      this.video,
      renderedSize.left,
      renderedSize.top,
      renderedSize.width,
      renderedSize.height,
      0,
      0,
      this.metadata.tile_height,
      this.metadata.tile_width,
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

  render() {
    return html`
      <div class="container">
        <div class="viewfinder">
          <video
            style=${styleMap({
              aspectRatio: `${this.metadata?.tile_height} / ${this.metadata?.tile_width}`,
            })}
          ></video>
          <canvas
            width=${this.metadata?.tile_height}
            height=${this.metadata?.tile_width}
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
