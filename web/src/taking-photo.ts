import { customElement, query, state } from "lit/decorators.js";
import { css, html, LitElement } from "lit";
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/callout/callout.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";

@customElement("pba-taking-photo")
export class TakingPhoto extends LitElement {
  @query("video")
  video!: HTMLVideoElement;

  @query("canvas")
  canvas!: HTMLCanvasElement;

  @state()
  interval: number | null = null;

  @state()
  secondsLeft = 1; // TODO: For testing. Change back to 10.

  @state()
  width = 0;

  @state()
  height = 0;

  connectedCallback() {
    super.connectedCallback();
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        this.video.addEventListener("canplay", (_) => {
          this.width = this.video.videoWidth;
          this.height = this.video.videoHeight;
          // const height = this.video.videoHeight / (this.video.videoWidth / width);
        });

        this.video.srcObject = stream;
        // noinspection JSIgnoredPromiseFromCall
        this.video.play();
      })
      .catch((err) => {
        console.error(`An error occurred: ${err}`);
      });
  }

  takePicture() {
    const context = this.canvas.getContext("2d");
    if (!(this.width && this.height && context && this.interval)) {
      return;
    }

    this.canvas.width = this.width;
    this.canvas.height = this.height;
    context.drawImage(this.video, 0, 0, this.width, this.height);
    const data = this.canvas.toDataURL("image/png");
    this.dispatchEvent(new CustomEvent("picture", { detail: data }));
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
          <video></video>
          <canvas></canvas>
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
                Take Photo (10s timer)
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
    }

    .viewfinder {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    canvas {
      position: absolute;
      opacity: 0;
    }

    video {
      height: 100%;
      //aspect-ratio: 2 / 3;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "pba-taking-photo": TakingPhoto;
  }
}
