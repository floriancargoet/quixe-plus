/* eslint-env browser */
/* global $ */

export class SVGMap {
  url = "./map.svg";
  mapSelector = "#map";
  debug = false;
  onReady = () => {};

  constructor(options) {
    Object.assign(this, options);
    this.log("map options", options);
    this.ready = this.initAsync();
  }

  log(...args) {
    if (this.debug) {
      console.log(...args);
    }
  }

  async initAsync() {
    // Load SVG file
    const [svgText] = await Promise.all([
      this.load(this.url),
      new Promise($), // doc ready
    ]);
    // Insert SVG in HTML
    this.$map = $(this.mapSelector);
    this.$map.html(svgText);
    this.$svg = this.$map.find("svg");
    this.log("Map ready.");
    this.onReady();
  }

  async load(url) {
    const resp = await fetch(url);
    return await resp.text();
  }

  $get(type, name) {
    let query;
    if (name) {
      query = `[data-${type}="${name}"]`;
    } else {
      query = `[data-${type}]`;
    }
    const result = this.$svg.find(query);
    if (result.length === 0) {
      this.log(
        `$get(${type}, ${name}) returned nothing. Check the data-* attributes in you SVG.`
      );
    }
    return result;
  }
}
