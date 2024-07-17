import { Legend } from './chart-parts/legend.js';
import { getAssetPath } from "./util/paths.ts"

export function VisualisationHolder(config,attr){

	if(!attr) attr = {};

	var dependencies = attr.dependencies || [];
	var classes = attr.classes || [];
	var legend = (new Legend(config));
	const myUUID = attr.id||("zoomable-"+crypto.randomUUID().substr(0,8));

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
	this.getID = function(){ return myUUID; };
	this.wrap = function(inner){

		let deps = ['/css/holder.css'];
		deps = deps.concat(dependencies);
		deps = deps.concat(legend.getDependencies());

		let leg = (legend.exists() ? legend.outer("html") : "");
		let legpos = legend.getPosition();

		let html = ['<div class="oi-viz'+(classes ? ' '+classes.join(" ") : '')+'" data-dependencies="'+makeDependencies(deps)+'">'];

		html.push('<a id="pre-'+myUUID+'" href="#viz-'+myUUID+'" class="skip-link button">Skip '+(attr.name||'the visualisation')+'</a>');
		html.push('<div class="oi-top">');
			if(leg && legpos.top && !legpos.left && !legpos.right) html.push(leg);
			html.push('<div class="oi-left">');
				if(leg && legpos.top && legpos.left && !legpos.right) html.push(leg);
			html.push('</div>');
			html.push('<div class="oi-right">');
				if(leg && legpos.top && !legpos.left && legpos.right) html.push(leg);
			html.push('</div>');
		html.push('</div>');

		html.push(inner);

		html.push('<div class="oi-bottom">');
			html.push('<div class="oi-bottom oi-left">');
				if(leg && legpos.bottom && legpos.left && !legpos.right) html.push(leg);
			html.push('</div>');
			html.push('<div class="oi-bottom oi-right">');
				if(leg && legpos.bottom && !legpos.left && legpos.right) html.push(leg);
			html.push('</div>');
			if(leg && legpos.bottom && !legpos.left && !legpos.right) html.push(leg);
		html.push('</div>');
		if(config.attribution){
			html.push('<div class="oi-attribution">'+config.attribution+'</div>');
		}
		html.push('<a id="viz-'+myUUID+'" href="#pre-'+myUUID+'" class="skip-link skip-link-bottom button">Go to the start of '+(attr.name||'the visualisation')+'</a>');


		html.push('</div>\n');

		return html.join('');
	};
	return this;
}