import { counter } from "../../lib/util/counter.ts";
import { clone } from "../../lib/util/clone.ts";
import { isEven } from "../../lib/util/is-even.ts";
import { ColourScale, getColourScale } from "../../lib/colour/scales.ts";

/**
 * Hexmap styles
 */
export const css = `
  .hexmap {
    --hex-bg: none;
    --hex-fill: #aaaaaa;
    background: var(--hex-bg);
    vector-effect: non-scaling-stroke;
  }
  .hexmap .hex path {
    fill: var(--hex-fill);
  }
}
`;

type HexDefinition = {
  q: number;
  r: number;
  n: string;
  [key: string]: unknown;
};

type HexmapOptions = {
  bgColour: string;
  colourScale: ColourScale;
  data?: Record<string, unknown>[];
  hexjson: { layout: string; hexes: Record<string, HexDefinition> };
  hexScale: number;
  labelProcessor: (label: string) => string;
  margin: number;
  matchKey?: string;
  popup: (params: Record<string, string | number>) => string;
  title?: string;
  titleProp: string;
  valueProp: string;
};

// TODO set hex to something close to rems
/**
 * Function to render a hexmap
 * 
 * @param options HexmapOptions object
 */
export default function ({
  bgColour = 'none',
  data,
  hexjson,
  hexScale = 1,
  labelProcessor = (label) => label.slice(0, 3),
  margin: marginScale = 0.25,
  matchKey,
  popup = ({ label, value }) => `${label}: ${value}`,
  title = 'Hexmap',
  titleProp = 'n',
  colourScale = 'mapColour',
  valueProp = 'colour',
}: HexmapOptions) {
  // Capture the layout and hexes from the hexjson
  const layout = hexjson.layout;
  const hexes = clone(hexjson.hexes);

  // Calculate hexCadence - the narrowest dimension of the hex
  const hexCadence = hexScale * 75;
  // The margin is a multiple of the hexSize
  const margin = marginScale * hexCadence;

  // Generate a UUID to identify the hexes
  const uuid = crypto.randomUUID();

  // Merge data into hexes
  // If the matchKey and data are defined
  if (matchKey && data) {
    // Iterate over the data, accessing each entry as `record`
    data.forEach((record) => {
      // Get the key from the key field from the record
      const key = record[matchKey] as string;
      // If the key field is not one of the entries in the hexes, finish
      if (!(key in hexes)) return;
      // Otherwise update the relevant hex data with the entries in the record, but the hexes win - to avoid overwriting the critical fields
      hexes[key] = { ...record, ...hexes[key] };
    });
  }

  // Find the biggest value in the hex map
  // TODO Check if this works when the valueProp is a number
  const maxValue = Object.values(hexes)
    .map((h) => parseFloat(<string>h[valueProp]) || 0)
    .reduce((result, current) => Math.max(result, current), 0);

  // Calculate the colour scale
  const fillColour = getColourScale(colourScale)(maxValue);

  // Function to calculate if a given row should be shifted to the right
  const isShiftedRow = (r: number) => {
    if (layout === 'even-r' && isEven(r)) return true;
    if (layout === 'odd-r' && !isEven(r)) return true;
    return false;
  }

  // Calculate the left, right, top and bottom
  const dimensions = Object.values(hexes)
    .map(({ q, r }) => ({ q, r }))
    .reduce(
      ({ left, right, top, bottom }, { q, r }) => ({
        left: Math.min(q, left),
        right: Math.max(q, right),
        top: Math.min(r, top),
        bottom: Math.max(r, bottom),
      }),
      {
        left: Infinity,
        right: -Infinity,
        top: Infinity,
        bottom: -Infinity,
      }
    );

  // Length of side = width * tan(30deg)
  const hexSide = hexCadence * Math.tan(Math.PI / 6);

  // Calculate row height and quolum width
  let rHeight: number;
  let qWidth: number;
  switch (layout) {
    case 'odd-r':
    case 'even-r':
      // Row height is 1 and a half - there is a half a side length overlap
      rHeight = 1.5 * hexSide;
      // Column width is set by the hexWidth for point top hexes
      qWidth = hexCadence;
      break;
    case 'odd-q':
    case 'even-q':
      rHeight = hexCadence;
      qWidth = 1.5 * hexSide;
      break;
    default:
      throw 'Unsupported layout';
  }

  const getShim = () => {
    // Amount to shift the whole hexmap by in a horizontal direction
    let x = 0;
    // Amount to shift the whole hexmap by in a vertical direction
    let y = 0;
    // Amount to adjust the width of the hexmap plot area
    let width = 0;

    if (layout === 'odd-r' || layout === 'even-r') {
      // Work out if the left-hand column has only shifted rows. i.e. Left Outy Shift
      // If so, move left by half a quoloum
      const unshiftedRowsInTheLeftColumn = Object.values(hexes).filter(({ q, r }) => (q === dimensions.left) && !isShiftedRow(r));
      if (unshiftedRowsInTheLeftColumn.length === 0) {
        x = -0.5;
        // Work out if the right-hand column has only unshifted rows. i.e. Right Inny Shift
        // If so, adjust width to account for extra
        const shiftedRowsInTheRightColumn = Object.values(hexes).filter(({ q, r }) => (q === dimensions.right) && isShiftedRow(r));
        if (shiftedRowsInTheRightColumn.length === 0) {
          width = -0.5;
        }
      }
    }

    if (
      (isEven(dimensions.top) && layout === 'even-q') ||
      (!isEven(dimensions.left) && layout === 'odd-q')
    ) y = 0.5

    return { x, y, width };
  }
  const shim = getShim();

  // Overall width of svg (from centre of left-most to centre of right-most)
  const width = (dimensions.right - dimensions.left + shim.width) * qWidth;

  // Overall height of svg (from centre of top-most to centre of bottom-most)
  const height = (dimensions.bottom - dimensions.top) * rHeight;

  /**
   * Calculate the row offset given the prevailing layout
   * 
   * @param r row to calculate offset for
   * @returns 
   */
  const rOffset = (r: number) => {
    if (isShiftedRow(r)) return 0.5;
    return 0;
  };

  /**
   * Calculate the quolom offset given the prevailing layout
   * 
   * @param q row to calculate offset for
   * @returns 
   */
  const qOffset = (q: number) => {
    if (layout === 'odd-q') return isEven(q) ? 0 : 0.5;
    if (layout === 'even-q') return isEven(q) ? 0.5 : 0;
    return 0;
  };

  /**
   * Calculate the centre of a hex given a q and r value.
   * 
   * Uses rOffset formula to decide which to shift
   * 
   * @param hexConfig - { q: number, r: number }
   * @returns 
   */
  function getCentre({ q, r }: HexDefinition) {
    const x = (q - dimensions.left + rOffset(r) + shim.x) * qWidth;
    const y = height - (r - dimensions.top + qOffset(q) + shim.y) * rHeight;
    return { x, y };
  }

  const hexCounter = counter();

  const drawHex = (config: HexDefinition) => {
    const hexId = hexCounter();
    const { x, y } = getCentre(config);
    const label = <string>config[titleProp];
    const value = <number>config[valueProp] || 0;
    const fill = fillColour(config, valueProp);

    // Calculate the path based on the layout
    let hexPath: string | undefined = undefined;
    switch (layout) {
      case 'odd-r':
      case 'even-r':
        hexPath = `
          M ${hexCadence / 2},${-hexSide / 2}
          v ${hexSide}
          l ${-hexCadence / 2},${hexSide / 2}
          l ${-hexCadence / 2},${-hexSide / 2}
          v ${-hexSide}
          l ${hexCadence / 2},${-hexSide / 2}
          Z
        `;
        break;
      case 'odd-q':
      case 'even-q':
        hexPath = `
          M ${-hexSide / 2},${-hexCadence / 2}
          h ${hexSide}
          l ${hexSide / 2},${hexCadence / 2}
          l ${-hexSide / 2},${hexCadence / 2}
          h ${-hexSide}
          l ${-hexSide / 2},${-hexCadence / 2}
          Z
        `;
        break;
      default:
        throw 'Unsupported layout';
    }

    // TODO this only supports pointy-top hexes at the moment
    return `<g
          id="${uuid}-hex-${hexId}"
          class="hex"
          transform="translate(${x} ${y})"
          data-auto-popup="${popup({ label, value })}"
          data-value="${value}"
          role="listitem"
          aria-label="${label} value ${value}"
        >
        <path
          style="${ fill !== undefined ? `--hex-fill: ${fill}` : '' }"
          d="${hexPath}"
        />
        <text
          text-anchor="middle"
          dominant-baseline="middle"
          aria-hidden="true"
          >${labelProcessor(label)}</text>
      </g>`;
  };

  return `<svg
      id="hexes-${uuid}"
      class="hexmap"
      viewBox="
        ${- margin - qWidth / 2} ${- margin - hexSide}
        ${width + qWidth + 2 * margin} ${height + 2 * hexSide + 2 * margin}
      "
      style="${bgColour ? `--hex-bg: ${bgColour}` : ''}"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      data-dependencies="/assets/js/auto-popup.js"
      role="list"
      aria-labelledby="title-${uuid}"
    >
      <title id="title-${uuid}">${title}.</title>
      ${Object.values(hexes).map(drawHex).join('')}
    </svg>
  `;
}
