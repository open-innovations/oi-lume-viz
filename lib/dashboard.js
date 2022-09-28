import { colourScales, contrastColour } from './colour.js';

// TODO Work out how to do this...
// This component uses "/assets/js/dashboard.js" to make things interactive in the browser.
// It will only get included in pages that need it by using the "data-dependencies" attribute.

export function Dashboard({
  title,
  panels,
  data: data,
  width,
}){

	this.getHTML = function(){
		var html,i,panel,r,cls,p,idx,col,v,c;
		
		html = ['<div class="dashboard" data-dependencies="/assets/js/dashboard.js" style="grid-template-columns: repeat(auto-fill, minmax(min(100%, '+(width||'250px')+'), 1fr));">'];

		// Loop over the user-specified panels
		for(p = 0 ; p < panels.length; p++){

			// Find the matching row
			idx = -1;
			if(title && data.columns[title]){
				for(r = 0; r < data.rows.length; r++){
					if(data.rows[r][title]==panels[p].name){
						idx = r;
					}
				}
			}
			if(idx >= 0){
				// Build classes
				cls = config.class||'';
				cls += (cls ? " ":"")+(panels[p].class||'');
				col = (panels[p].colour||'');
				if(col) c = contrastColour(col);
				v = "";

				// Get the value for this panel
				if(config.value && data.columns[config.value]) v = data.rows[idx][config.value];

				// If we haven't set a colour explicitly but we have set a colour scale
				if(!panels[p].colour && panels[p].scale){
					// If a scale value has been given, use that instead of the value of the panel
					if(typeof panels[p]['scale-value']==="number") v = panels[p]['scale-value'];
					// Find the colour from the colour scale
					col = colourScales.getColourFromScale(panels[p].scale||'Viridis',v,panels[p].min||0,panels[p].max||100);
					// Process the colour so we can get the 
					c = contrastColour(col);
				}
				panel = '<div class="panel'+(cls ? ' '+cls : '')+'"'+(col ? ' style="background-color:'+col+';color:'+c+'"' : '')+'>';
				panel += '<h3>'+panels[p].name+'</h3>';
				if(config.value && data.columns[config.value]){
					panel += '<span class="bignum" data="'+data.rows[idx][config.value]+'"';
					if(config.units){
						if(config.units.prefix && data.rows[idx][config.units.prefix]) panel += ' data-prefix="'+data.rows[idx][config.units.prefix]+'"';
						if(config.units.postfix && data.rows[idx][config.units.postfix]) panel += ' data-postfix="'+data.rows[idx][config.units.postfix]+'"';
					}
					panel += '>';
					panel += data.rows[idx][config.value].toLocaleString();
					panel += '</span>';
				}else{
					console.error('WARNING: No column named "'+config.value+'" in panel '+p+' ('+config.file+')');
				}

				if(config.note && data.columns[config.note]) panel += '<span class="footnote">'+data.rows[idx][config.note]+'</span>';
				panel += '</div>';

				html.push(panel);
				
			}else{
				console.error('WARNING: Unable to find matching row for panel '+p+' "'+panels[p].name+'" ('+config.file+').');
			}
		}
		html.push('</div>');

		return html.join('');
	};
	return this;
}