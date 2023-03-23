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
  nameMapper: UsefulFunction;
  colourMapper: UsefulFunction;
};

export class TreeMap extends HierarchyVisualisation {
  width: number;
  height: number;
  padding: number;
  nameMapper: UsefulFunction;
  colourMapper: UsefulFunction;

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
    this.nameMapper = options.nameMapper;
    this.colourMapper = options.colourMapper;
  }
  prepareTreemap() {
    // TODO Deal with trees with a value
    this.root.count().sort(function (a, b) {
      return b.height - a.height || b.value - a.value;
    });
    return d3.treemap()
      .size([
        this.width,
        this.height,
      ])
      .padding(this.padding);
  }
  render() {
    const treemap = this.prepareTreemap();
    treemap(this.root);

    // Create the base svg
    const svg = d3.create("svg")
      .attr("viewBox", [0, 0, this.width, this.height]);

    svg.append('style').text(`
      div {
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
      .attr("transform", d => `translate(${d.x0} ${d.y0})`);

    treeCell.append("rect")
      .attr("x", 0).attr("y", 0)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", this.colourMapper)
      .append('title')
      .text(this.nameMapper);

    // Add labels to the leaf nodes
    treeCell.append('foreignObject')
      .attr('x', 0).attr('y', 0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .append('div')
      .text(d => d.data.title);

    return svg.node();
  }
}
