import { Legend } from './chart-parts/legend.js';
import { getAssetPath } from "./util/paths.ts"

export function VisualisationHolder(config,attr){

	if(!attr) attr = {};

	var dependencies = attr.dependencies || [];
	var classes = attr.classes || [];
	var legend = (new Legend(config));

	this.addClasses = function(cls){
		classes = classes.concat(cls);
		return this;
	};
	this.addDependencies = function(deps){
		dependencies = dependencies.concat(deps);
		return this;
	};
	this.getDependencies = function(){
		return dependencies;
	};

	function makeDependencies(deps){
		var str = '';
		for(var d = 0; d < deps.length; d++) str += (str ? ',':'')+getAssetPath(deps[d]);
		return str;
	}

	this.wrap = function(inner){

		const myUUID = crypto.randomUUID().substr(0,8);

		var html = ['<div class="oi-viz'+(classes ? ' '+classes.join(" ") : '')+'" data-dependencies="'+makeDependencies(dependencies.concat(legend.getDependencies()).concat('/css/holder.css'))+'">'];

		html.push('<a id="pre-'+myUUID+'" href="#viz-'+myUUID+'" class="skip-link button">Skip '+(config.title||'the visualisation')+'</a>');

		if(legend.exists() && legend.isAbove()) html.push(legend.outer("html"));

		html.push(inner);

		if(legend.exists() && legend.isBelow()) html.push(legend.outer("html"));

		html.push('<a id="viz-'+myUUID+'" href="#pre-'+myUUID+'" class="skip-link skip-link-bottom button">Go to the start of '+(config.title||'the visualisation')+'</a>');

		html.push('</div>\n');

		return html.join('');
	};
	return this;
}