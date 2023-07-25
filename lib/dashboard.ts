import { contrastColour } from './colour/contrast.ts';
import { ColourScale } from './colour/colour-scale.ts';
import { getBackgroundColour, Colour } from "./colour/colour.ts";
import { replaceNamedColours, parseColourString } from './colour/parse-colour-string.ts';
import { getAssetPath } from './util/paths.ts';

const defaultbg = getBackgroundColour();

export type DashboardOptions = {
  /** The data holding the values to be presented in the panels */
  data: { [key: string]: unknown }[];
  /** The configuration of panels */
  panels: {
    name: string,
    class: string,
    colour: string,
    scale: string,
    'scale-value': string;
    min: unknown;
    max: unknown;
    precision: number;
  }[];
  /** The property in the data holding the panel name */
  title: string;
  /** The property in the data set holding the value */
  value: string;
  /** The property to contain the additional note */
  note: string;
  /** */
  width: string;
  /** */
  units: {
    prefix: string;
    postfix: string;
  };
  /** */
  class: string; 
}

// TODO Work out how to do this...
// This component uses "/assets/js/dashboard.js" to make things interactive in the browser.
// It will only get included in pages that need it by using the "data-dependencies" attribute.

export function dashboard(config: DashboardOptions){
  const {
    title,
    value,
    panels,
    data,
    note,
    width,
    units,
    class: className,
  } = config;

  // Check what keys are in the records
  const columns = Array.from(new Set(data.map(Object.keys).flat()));

  // Do some sense checking early on and fail builds
  if (!(title && columns.includes(title)))
    throw `Invalid title: No property named "${title}" in the data.`
  if (!(value && columns.includes(value)))
    throw `Invalid value: No property named "${value}" in the data`;
  
  // Set asset path based on module config
  const html = ['<div class="oi-viz oi-dashboard" data-dependencies="' + getAssetPath('/js/dashboard.js') + '"'+(width ? ' style="--auto-dashboard-min-size:'+width+';"' : '')+'>'];

  // Loop over the user-specified panels
  for(let p = 0 ; p < panels.length; p++){

    // Find the matching row
    let idx = -1;
    for(let r = 0; r < data.length; r++){
      if(data[r][title]==panels[p].name){
        idx = r;
      }
    }

    if (idx === -1) {
      console.warn('Unable to find matching row for panel '+p+' "'+panels[p].name + '"');
      break;
    }

    // Build classes
    let cls = className||'';
    cls += (cls ? " ":"")+(panels[p].class||'');
    let col = (panels[p].colour||'');

	try {
		col = replaceNamedColours(col);
	}catch(error){
		console.error('Bad colour',col);
		col = defaultbg;
	}

    let c;
    if(col) c = contrastColour(col);
    let v = "";

    // Get the value for this panel
    if(value && data[idx][value]) v = data[idx][value];

    // If we haven't set a colour explicitly but we have set a colour scale
    if(!panels[p].colour && panels[p].scale){
      // If a scale value has been given, use that instead of the value of the panel
      if(typeof panels[p]['scale-value']==="number") v = panels[p]['scale-value'];
      // Find the colour from the colour scale
	  let cs = ColourScale(panels[p].scale||'Viridis');
      let min = panels[p].min||0;
	  let max = panels[p].max||100
	  col = cs((v-min)/(max-min));
      // Process the colour so we can get the 
      c = contrastColour(col);
    }
    let panel = '<div class="panel'+(cls ? ' '+cls : '')+'" tabindex="0" '+(col ? ' style="background-color:'+col+';color:'+c+';"' : '')+'>';
    panel += '<h3>'+panels[p].name+'</h3>';

    panel += '<span class="bignum" data="'+data[idx][value]+'"';
    if(units){
      if(units.prefix && data[idx][units.prefix]) panel += ' data-prefix="'+data[idx][units.prefix]+'"';
      if(units.postfix && data[idx][units.postfix]) panel += ' data-postfix="'+data[idx][units.postfix]+'"';
    }
    if(typeof panels[p].precision==="number") panel += ' data-precision="'+panels[p].precision+'"';
    panel += '>';
    panel += units?.prefix ? data[idx][units.prefix] || '' : ''
    panel += (data[idx][value] as string).toLocaleString();
    panel += units?.postfix ? data[idx][units.postfix] || '' : ''
    panel += '</span>';

    if(note && data[idx][note])
      panel += '<span class="footnote">'+data[idx][note]+'</span>';

    panel += '</div>';

    html.push(panel);
  }
  html.push('</div>');

  return html.join('');
}