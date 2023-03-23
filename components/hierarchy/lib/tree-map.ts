import d3 from "../../../lib/external/d3.ts";

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
  valueKey?: string;
  nameMapper: UsefulFunction;
  colourMapper: UsefulFunction;
};

export class TreeMap extends HierarchyVisualisation {
  width: number;
  height: number;
  padding: number;
  valueKey?: string;
  nameMapper: UsefulFunction;
  colourMapper: UsefulFunction;
  ratio: number;

  constructor(options: TreeMapOptions) {
    super({
      table: options.table,
      reduce: options.reduce,
      grouping: options.grouping,
      dataMapper: options.dataMapper,
    });
    if (!options.width) throw new Error('TreeMap options must include a numeric width');
    if (!options.height) throw new Error('TreeMap options must include a numeric height');
    this.width = options.width;
    this.height = options.height;
    this.padding = options.padding || 0;
    this.valueKey = options.valueKey;
    this.nameMapper = options.nameMapper;
    this.colourMapper = options.colourMapper;
    this.ratio = options.ratio || 1;
  }
  /**
   * Prepare the hierarchy in this.root for treemapping
   * 
   * @returns void
   */
  prepareTreemap() {
    if (this.valueKey) {
      /**
       * If the object was instantiated with a `valueKey`, then it calls the `sum` method of the `root`.
       */
      this.root.sum((d) => {
        return d[this.valueKey] || 0;
      });
    } else {
      /**
       * Otherwise, it uses the `count` method of `root`.
       */
      this.root.count()
    }
    /**
     * Sort the `root`
     */
    this.root.sort(function (a, b) {
      return b.height - a.height || b.value - a.value;
    });

    this.root.each(node => {
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
      .padding(this.padding);
  }
  render() {
    const treemap = this.prepareTreemap();
    treemap(this.root);

    // Create the base svg
    const svg = d3.create("svg")
      .classed('treemap', true)
      .attr("viewBox", [0, 0, this.width, this.height]);

    svg.append('style').text(`
      .treemap foreignObject div {
        color: white;
        font-size:10px;
        padding:5px;
        border:none;
      }
    `);
    
    // Create a group to hold the cells
    const treeCells = svg.append("g")
      .attr("fill", "#aaa")
      .attr("stroke", "#555")
      .attr("stroke-width", 1);

    const nodes = this.root;

    // Attach the nodes to the top level group
    const node = treeCells.selectAll("g")
      .data(nodes);

    const treeCell = node.enter().append("g")
      .attr('data-height', d => d.height)
      .classed('series', true)
      .attr("transform", d => `translate(${d.x0 * this.ratio} ${d.y0})`);

    treeCell.append("rect")
      .attr("x", 0).attr("y", 0)
      .attr("width", d => (d.x1 - d.x0) * this.ratio)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", this.colourMapper)
      .append('title')
      .text(this.nameMapper);

    // Add labels to the leaf nodes
    treeCell.append('foreignObject')
      .attr('x', 0).attr('y', 0)
      .attr("width", d => (d.x1 - d.x0) * this.ratio)
      .attr('height', d => d.y1 - d.y0)
      .append('div')
      .text(d => d.data.title);

    return svg.node();
  }
}
