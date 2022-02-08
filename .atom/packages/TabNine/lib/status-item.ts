// import { configuration } from "./binary/requests/requests";
import { configuration } from "./binary/requests/requests";
import { BRAND_NAME, LOGO_PATH } from "./consts";

export class StatusItem extends HTMLElement {
  static initialize() {
    customElements.define("tabnine-status-item", this);
    console.log("this:", this);
    return this;
  }
  constructor() {
    super();
    this.classList.add("inline-block");

    const logo = document.createElement("span");
    logo.classList.add("tabnine-logo");

    const img = document.createElement("img");
    img.classList.add("tabnine-logo-img");
    img.src = LOGO_PATH;

    const text = document.createElement("span");
    text.classList.add("tabnine-logo-text");
    text.textContent = BRAND_NAME;

    logo.appendChild(img);
    logo.appendChild(text);
    logo.onclick = () => {
      configuration({ source: "status" });
    };
    this.appendChild(logo);
  }
  destroy() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }
}

StatusItem.initialize();
