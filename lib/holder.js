import { Legend } from './chart-parts/legend.js';
import { getAssetPath } from "./util/paths.ts"

export function VisualisationHolder(config,attr){

	if(!attr) attr = {};

	let dependencies = attr.dependencies || [];
	let classes = attr.classes || [];
	const legend = (new Legend(config));
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
		let str = '';
		for(let d = 0; d < deps.length; d++) str += (str ? ',':'')+getAssetPath(deps[d]);
		return str;
	}
	this.getID = function(){ return myUUID; };
	this.wrap = function(inner){

		let deps = ['/css/holder.css'];
		deps = deps.concat(dependencies);
		deps = deps.concat(legend.getDependencies());

		const leg = (legend.exists() ? legend.outer("html") : "");
		const legpos = legend.getPosition();

		let html = '<div class="oi-viz'+(classes ? ' '+classes.join(" ") : '')+'" data-dependencies="'+makeDependencies(deps)+'">';

		html += '<a id="pre-'+myUUID+'" href="#viz-'+myUUID+'" class="skip-link button">Skip '+(attr.name||'the visualisation')+'</a>';

		html += '<div class="oi-control-container">';
		html += '<div class="oi-top">' + (leg && legpos.top && !legpos.left && !legpos.right ? leg : '') + '</div>';
		html += '<div class="oi-top oi-left">' + (leg && legpos.top && legpos.left && !legpos.right ? leg : '') + '</div>';
		html += '<div class="oi-top oi-right">' + (leg && legpos.top && !legpos.left && legpos.right ? leg : '') + '</div>';
		html += '<div class="oi-bottom oi-left">' + (leg && legpos.bottom && legpos.left && !legpos.right ? leg : '') + '</div>';
		html += '<div class="oi-bottom oi-right">' + (leg && legpos.bottom && !legpos.left && legpos.right ? leg : '') + '</div>';
		html += '<div class="oi-bottom">' + (leg && legpos.bottom && !legpos.left && !legpos.right ? leg : '') + '</div>';
		html += '</div>';

		html += inner;

		if(config.attribution){
			html += '<div class="oi-attribution">'+config.attribution+'</div>';
		}
		html += '<a id="viz-'+myUUID+'" href="#pre-'+myUUID+'" class="skip-link skip-link-bottom button">Go to the start of '+(attr.name||'the visualisation')+'</a>';
		html += '</div>\n';

		return html;
	};
	return this;
}