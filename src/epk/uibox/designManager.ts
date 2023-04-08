import { fabric } from "fabric";
import { Template } from "../common/interfaces";
import objectToFabric from "./objectToFabric";
import "./objects";

class DesignManager {
  public canvas: fabric.StaticCanvas;

  constructor() {
    this.initializeCanvas();
  }
  initializeCanvas() {
    this.canvas = new fabric.StaticCanvas(null);
  }

  setDimensions({ width, height }: { width: number; height: number }) {
    this.canvas.setWidth(width).setHeight(height);
  }

  setBackground(background: { type: string; value: string }) {
    if (!background) {
      return;
    }
    this.canvas.setBackgroundColor(background.type === "color" ? background.value : "#ffffff", () => {
      this.canvas.renderAll();
    });
  }

  async loadTemplate(template: Template) {
    this.canvas.clear();
    this.setDimensions(template.frame);
    this.setBackground(template.background);
    for (const object of template.objects) {
      const element = await objectToFabric.run(object);
      if (element) {
        // this.canvas.add(element)
        this.canvas.add(element);
      } else {
        console.log("UNABLE TO LOAD OBJECT: ", object);
      }
    }
  }

  async downloadTemplate() {
    const data = this.canvas.toDataURL({
      multiplier: 3,
      top: 0,
      left: 0,
      height: this.canvas.getHeight(),
      width: this.canvas.getWidth(),
    });
    return data;
  }

  loadFonts() {}
}

export default new DesignManager();
