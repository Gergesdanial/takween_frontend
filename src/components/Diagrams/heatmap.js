// components/Diagrams/heatmap.js
import h337 from 'heatmap.js';

class Heatmap {
  constructor(container) {
    this.heatmapInstance = h337.create({
      container: document.querySelector(container),
      radius: 15,
      maxOpacity: 0.5,
      minOpacity: 0,
      blur: 0.75
    });
  }

  updateData(data) {
    this.heatmapInstance.setData(data);
  }
}

export default Heatmap;
