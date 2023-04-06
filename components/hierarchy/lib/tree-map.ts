import { Colour } from "../../../lib/colour/colour.ts";
import { d3 } from "../../../lib/external/d3.ts";

import {
  HierarchyVisualisation,
  HierarchyVisualisationOptions,
  UsefulFunction,
} from "./hierarchy-visualisation.ts";

export type TreeMapOptions = HierarchyVisualisationOptions & {
  width: number;
  height: number;
  padding: number;
  ratio?: number;
  value?: string;
  description: UsefulFunction;
  colourMapper: UsefulFunction;
};

export class TreeMap extends HierarchyVisualisation {
  width: number;
  height: number;
  padding: number;
  valueKey?: string;
  titleMapper: UsefulFunction;
  colourMapper: UsefulFunction;
  ratio: number;

  constructor(options: TreeMapOptions) {
    super({
      data: options.data,
      reduce: options.reduce,
      grouping: options.grouping,
      dataMapper: options.dataMapper,
    });
    if (!options.width) {
      throw new Error("TreeMap options must include a numeric width");
    }
    if (!options.height) {
      throw new Error("TreeMap options must include a numeric height");
    }
    this.width = options.width;
    this.height = options.height;
    this.padding = options.padding || 0;
    this.valueKey = options.value || "value";
    this.titleMapper = options.description;
    this.colourMapper = options.colourMapper;
    this.ratio = options.ratio || 1;
  }
  /**
   * Prepare the hierarchy in this.root for treemapping
   *
   * @returns void
   */
  prepareTreemap() {
    this.root.sum((d) => {
      return d[this.valueKey] || 0;
    });
    /**
     * Sort the `root`
     */
    this.root.sort(function (a, b) {
      return b.height - a.height || b.value - a.value;
    });

    this.root.each((node) => {
      for (const child of node.children || []) {
        child.x0 /= this.ratio;
        child.x1 /= this.ratio;
      }
    });

    return d3.treemap()
      .size([
        this.width / this.ratio,
        this.height,
      ])
      .paddingInner(this.padding);
  }
  render() {
    const treemap = this.prepareTreemap();
    treemap(this.root);

    // Create the base svg
    const svg = d3.create("svg")
      .classed("oi-viz treemap", true)
      .attr("viewBox", [0, 0, this.width, this.height])
	  .attr("data-type","tree-map");

    svg.append("style").text(`
      .treemap foreignObject div {
        color: white;
        font-size:10px;
        padding:5px;
        border:none;
      }
    `);

    // Create a group to hold the cells
    const treeCells = svg.append("g")
      .attr("stroke-width", 1);

    // Don't make interim levels
    // TODO(@gilesdring) maybe make this configurable?
    const nodes = this.root.leaves();

    // Attach the nodes to the top level group
    const node = treeCells.selectAll("g")
      .data(nodes);

    const treeCell = node.enter().append("g")
      .attr("data-depth", (d) => d.depth)
      .attr("data-height", (d) => d.height)
      .classed("series", true)
      .attr("transform", (d) => `translate(${d.x0 * this.ratio} ${d.y0})`);

    treeCell.append("rect")
      .attr("x", 0).attr("y", 0)
      .attr("width", (d) => (d.x1 - d.x0) * this.ratio)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", this.colourMapper)
      .append("title")
      .text(this.titleMapper);

    // Add labels to the leaf nodes
    treeCell.append("foreignObject")
      .attr("x", 0).attr("y", 0)
      .attr("width", (d) => (d.x1 - d.x0) * this.ratio)
      .attr("height", (d) => d.y1 - d.y0)
      .append("div")
      .style("color", (d) => Colour(this.colourMapper(d)).contrast)
      .text((d) => d.data.name);

    return svg.node()!.outerHTML;
  }
}
