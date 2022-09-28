import { colourScales, contrastColour } from './colour.js';

// TODO Work out how to do this...
// This component uses "/assets/js/dashboard.js" to make things interactive in the browser.
// It will only get included in pages that need it by using the "data-dependencies" attribute.

const ns = 'http://www.w3.org/2000/svg';

export function Dashboard(config,csv){

	this.getHTML = function(){
		var html,i,panel,r,cls,p,idx,col,v,c;
		
		html = ['<div class="dashboard" data-dependencies="/assets/js/dashboard.js" style="grid-template-columns: repeat(auto-fill, minmax(min(100%, '+(config.width||'250px')+'), 1fr));">'];

		// Loop over the user-specified panels
		for(p = 0 ; p < config.panels.length; p++){

			// Find the matching row
			idx = -1;
			if(config.title && csv.columns[config.title]){
				for(r = 0; r < csv.rows.length; r++){
					if(csv.rows[r][config.title]==config.panels[p].name){
						idx = r;
					}
				}
			}
			if(idx >= 0){
				// Build classes
				cls = config.class||'';
				cls += (cls ? " ":"")+(config.panels[p].class||'');
				col = (config.panels[p].colour||'');
				if(col) c = contrastColour(col);
				v = "";

				// Get the value for this panel
				if(config.value && csv.columns[config.value]) v = csv.rows[idx][config.value];

				// If we haven't set a colour explicitly but we have set a colour scale
				if(!config.panels[p].colour && config.panels[p].scale){
					// If a scale value has been given, use that instead of the value of the panel
					if(typeof config.panels[p]['scale-value']==="number") v = config.panels[p]['scale-value'];
					// Find the colour from the colour scale
					col = colourScales.getColourFromScale(config.panels[p].scale||'Viridis',v,config.panels[p].min||0,config.panels[p].max||100);
					// Process the colour so we can get the 
					c = contrastColour(col);
				}
				panel = '<div class="panel'+(cls ? ' '+cls : '')+'"'+(col ? ' style="background-color:'+col+';color:'+c+'"' : '')+'>';
				panel += '<h3>'+config.panels[p].name+'</h3>';
				if(config.value && csv.columns[config.value]){
					panel += '<span class="bignum" data="'+csv.rows[idx][config.value]+'"';
					if(config.units){
						if(config.units.prefix && csv.rows[idx][config.units.prefix]) panel += ' data-prefix="'+csv.rows[idx][config.units.prefix]+'"';
						if(config.units.postfix && csv.rows[idx][config.units.postfix]) panel += ' data-postfix="'+csv.rows[idx][config.units.postfix]+'"';
					}
					panel += '>';
					panel += csv.rows[idx][config.value].toLocaleString();
					panel += '</span>';
				}else{
					console.error('WARNING: No column named "'+config.value+'" in panel '+p+' ('+config.file+')');
				}

				if(config.note && csv.columns[config.note]) panel += '<span class="footnote">'+csv.rows[idx][config.note]+'</span>';
				panel += '</div>';

				html.push(panel);
				
			}else{
				console.error('WARNING: Unable to find matching row for panel '+p+' "'+config.panels[p].name+'" ('+config.file+').');
			}
		}
		html.push('</div>');

		return html.join('');
	};
	return this;
}