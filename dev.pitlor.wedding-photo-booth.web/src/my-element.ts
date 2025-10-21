import { LitElement, css, html, type PropertyValues, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'

@customElement('my-element')
export class MyElement extends LitElement {
  @state()
  littlePictures = [] as string[]
  
  protected update(changedProperties: PropertyValues) {
    super.update(changedProperties);
    
    if (this.littlePictures.length > 0) {
      return;
    }
    
    fetch("http://localhost:5000/images")
      .then(res => res.json())
      .then(data => {
        this.littlePictures = data.images;
        console.log(data.images);
      })
  }

  render() {
    if (this.littlePictures.length === 0) {
      return nothing;
    }

    return html`
      <div id="container">
        <img src="http://localhost:5000/big-image" alt="" id="big" />
        <div class="grid">
          ${this.littlePictures.map((_, i) => html`
              <img class="small" src="http://localhost:5000/tinted-image/${i}" alt="" />
          `)}
        </div>
        <div class="grid">
          ${this.littlePictures.map((_, i) => html`
              <img class="small" src="http://localhost:5000/little-image/${i}" alt="" />
          `)}
        </div>
        <div class="grid">
          ${this.littlePictures.map((_, i) => html`
              <img class="small" src="http://localhost:5000/tile/${i}" alt="" />
          `)}
        </div>
      </div>
    `
  }

  static styles = css`
    #big {
        width: 400px;
        height: 600px;
    }
      
    .grid {
        display: grid;
        grid-template-columns: repeat(10, 1fr);
    }
      
    .small {
        width: 40px;
        height: 40px;
    }
      
    #container {
        display: flex;
        flex-direction: row;
        gap: 10px;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}
