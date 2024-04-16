import { recursiveLookup } from '../../../lib/util.js';
import { svgEl, newEl, setAttr } from '../../../lib/util/dom.ts';
import { mergeDeep } from '../../../lib/util/merge-deep.ts';
import { applyReplacementFilters } from "../../../lib/util.js";
import { Colour, ColourScale, Colours } from "../../../lib/colour/colours.ts";
import { VisualisationHolder } from '../../../lib/holder.js';
import { getBackgroundColour } from "../../../lib/colour/colour.ts";
import { getFontFamily, getFontWeight, getFontSize } from '../../../lib/font/fonts.ts';
import { getTileLayer } from '../../../lib/tiles/layers.ts';
import { getIcons } from '../../../lib/icon/icons.ts';
import { d3, d3geo } from "../../../lib/external/d3.ts";
import { parseColourString } from '../../../lib/colour/parse-colour-string.ts';
import { Layer } from './layers.ts';

const defaultbg = getBackgroundColour();
const fontFamily = getFontFamily();
const fontWeight = getFontWeight();
const fontSize = getFontSize();
const icons = getIcons();

var places = [{"Name":"London","Latitude":51.50853,"Longitude":-0.12574,"Population":7556900},{"Name":"Birmingham","Latitude":52.48142,"Longitude":-1.89983,"Population":984333},{"Name":"Liverpool","Latitude":53.41058,"Longitude":-2.97794,"Population":864122},{"Name":"Nottingham","Latitude":52.9536,"Longitude":-1.15047,"Population":729977},{"Name":"Sheffield","Latitude":53.38297,"Longitude":-1.4659,"Population":685368},{"Name":"Bristol","Latitude":51.45523,"Longitude":-2.59665,"Population":617280},{"Name":"Glasgow","Latitude":55.86515,"Longitude":-4.25763,"Population":591620},{"Name":"Leicester","Latitude":52.6386,"Longitude":-1.13169,"Population":508916},{"Name":"Edinburgh","Latitude":55.95206,"Longitude":-3.19648,"Population":464990},{"Name":"Leeds","Latitude":53.79648,"Longitude":-1.54785,"Population":455123},{"Name":"Cardiff","Latitude":51.48,"Longitude":-3.18,"Population":447287},{"Name":"Manchester","Latitude":53.48095,"Longitude":-2.23743,"Population":395515},{"Name":"Stoke-on-Trent","Latitude":53.00415,"Longitude":-2.18538,"Population":372775},{"Name":"Coventry","Latitude":52.40656,"Longitude":-1.51217,"Population":359262},{"Name":"Sunderland","Latitude":54.90465,"Longitude":-1.38222,"Population":335415},{"Name":"Birkenhead","Latitude":53.39337,"Longitude":-3.01479,"Population":325264},{"Name":"Islington","Latitude":51.53622,"Longitude":-0.10304,"Population":319143},{"Name":"Reading","Latitude":51.45625,"Longitude":-0.97113,"Population":318014},{"Name":"Kingston upon Hull","Latitude":53.7446,"Longitude":-0.33525,"Population":314018},{"Name":"Preston","Latitude":53.76282,"Longitude":-2.70452,"Population":313332},{"Name":"Newport","Latitude":51.58774,"Longitude":-2.99835,"Population":306844},{"Name":"Swansea","Latitude":51.62079,"Longitude":-3.94323,"Population":300352},{"Name":"Bradford","Latitude":53.79391,"Longitude":-1.75206,"Population":299310},{"Name":"Southend-on-Sea","Latitude":51.53782,"Longitude":0.71433,"Population":295310},{"Name":"Belfast","Latitude":54.59682,"Longitude":-5.92541,"Population":274770},{"Name":"Derby","Latitude":52.92277,"Longitude":-1.47663,"Population":270468},{"Name":"Plymouth","Latitude":50.37153,"Longitude":-4.14305,"Population":260203},{"Name":"Luton","Latitude":51.87967,"Longitude":-0.41748,"Population":258018},{"Name":"Wolverhampton","Latitude":52.58547,"Longitude":-2.12296,"Population":252791},{"Name":"City of Westminster","Latitude":51.5,"Longitude":-0.11667,"Population":247614},{"Name":"Southampton","Latitude":50.90395,"Longitude":-1.40428,"Population":246201},{"Name":"Blackpool","Latitude":53.81667,"Longitude":-3.05,"Population":239409},{"Name":"Milton Keynes","Latitude":52.04172,"Longitude":-0.75583,"Population":229941},{"Name":"Bexley","Latitude":51.44162,"Longitude":0.14866,"Population":228000},{"Name":"Northampton","Latitude":52.25,"Longitude":-0.88333,"Population":215963},{"Name":"Archway","Latitude":51.56733,"Longitude":-0.13415,"Population":215667},{"Name":"Norwich","Latitude":52.62783,"Longitude":1.29834,"Population":213166},{"Name":"Dudley","Latitude":52.5,"Longitude":-2.08333,"Population":199059},{"Name":"Aberdeen","Latitude":57.14369,"Longitude":-2.09814,"Population":196670},{"Name":"Portsmouth","Latitude":50.79899,"Longitude":-1.09125,"Population":194150},{"Name":"Newcastle upon Tyne","Latitude":54.97328,"Longitude":-1.61396,"Population":192382},{"Name":"Sutton","Latitude":51.35,"Longitude":-0.2,"Population":187600},{"Name":"Swindon","Latitude":51.55797,"Longitude":-1.78116,"Population":185609},{"Name":"Crawley","Latitude":51.11303,"Longitude":-0.18312,"Population":180508},{"Name":"Ipswich","Latitude":52.05917,"Longitude":1.15545,"Population":178835},{"Name":"Wigan","Latitude":53.54296,"Longitude":-2.63706,"Population":175405},{"Name":"Croydon","Latitude":51.38333,"Longitude":-0.1,"Population":173314},{"Name":"Walsall","Latitude":52.58528,"Longitude":-1.98396,"Population":172141},{"Name":"Mansfield","Latitude":53.13333,"Longitude":-1.2,"Population":171958},{"Name":"Oxford","Latitude":51.75222,"Longitude":-1.25596,"Population":171380},{"Name":"Warrington","Latitude":53.39254,"Longitude":-2.58024,"Population":165456},{"Name":"Slough","Latitude":51.50949,"Longitude":-0.59541,"Population":163777},{"Name":"Bournemouth","Latitude":50.72048,"Longitude":-1.8795,"Population":163600},{"Name":"Peterborough","Latitude":52.57364,"Longitude":-0.24777,"Population":163379},{"Name":"Cambridge","Latitude":52.2,"Longitude":0.11667,"Population":158434},{"Name":"Doncaster","Latitude":53.52285,"Longitude":-1.13116,"Population":158141},{"Name":"York","Latitude":53.95763,"Longitude":-1.08271,"Population":153717},{"Name":"Poole","Latitude":50.71429,"Longitude":-1.98458,"Population":150092},{"Name":"Gloucester","Latitude":51.86568,"Longitude":-2.2431,"Population":150053},{"Name":"Burnley","Latitude":53.8,"Longitude":-2.23333,"Population":149422},{"Name":"Huddersfield","Latitude":53.64904,"Longitude":-1.78416,"Population":149017},{"Name":"Telford","Latitude":52.67659,"Longitude":-2.44926,"Population":147980},{"Name":"Dundee","Latitude":56.46913,"Longitude":-2.97489,"Population":147710},{"Name":"Blackburn","Latitude":53.75,"Longitude":-2.48333,"Population":146521},{"Name":"Basildon","Latitude":51.56844,"Longitude":0.45782,"Population":144859},{"Name":"Middlesbrough","Latitude":54.57623,"Longitude":-1.23483,"Population":142707},{"Name":"Bolton","Latitude":53.58333,"Longitude":-2.43333,"Population":141331},{"Name":"Stockport","Latitude":53.40979,"Longitude":-2.15761,"Population":139052},{"Name":"Brighton","Latitude":50.82838,"Longitude":-0.13947,"Population":139001},{"Name":"West Bromwich","Latitude":52.51868,"Longitude":-1.9945,"Population":135618},{"Name":"Grimsby","Latitude":53.56539,"Longitude":-0.07553,"Population":134160},{"Name":"Hastings","Latitude":50.85519,"Longitude":0.57292,"Population":133422},{"Name":"High Wycombe","Latitude":51.62907,"Longitude":-0.74934,"Population":133204},{"Name":"Watford","Latitude":51.65531,"Longitude":-0.39602,"Population":125707},{"Name":"Saint Peters","Latitude":51.36667,"Longitude":1.41667,"Population":125370},{"Name":"Burton upon Trent","Latitude":52.80728,"Longitude":-1.64263,"Population":122199},{"Name":"Colchester","Latitude":51.88921,"Longitude":0.90421,"Population":121859},{"Name":"Eastbourne","Latitude":50.76871,"Longitude":0.28453,"Population":118219},{"Name":"Exeter","Latitude":50.7236,"Longitude":-3.52751,"Population":117763},{"Name":"Rotherham","Latitude":53.43012,"Longitude":-1.35678,"Population":117618},{"Name":"Cheltenham","Latitude":51.90006,"Longitude":-2.07972,"Population":116447},{"Name":"Lincoln","Latitude":53.22683,"Longitude":-0.53792,"Population":114879},{"Name":"Chesterfield","Latitude":53.25,"Longitude":-1.41667,"Population":113057},{"Name":"Chelmsford","Latitude":51.73575,"Longitude":0.46958,"Population":111511},{"Name":"Mendip","Latitude":51.2372,"Longitude":-2.6266,"Population":110000},{"Name":"Dagenham","Latitude":51.55,"Longitude":0.16667,"Population":108368},{"Name":"Basingstoke","Latitude":51.26249,"Longitude":-1.08708,"Population":107642},{"Name":"Maidstone","Latitude":51.26667,"Longitude":0.51667,"Population":107627},{"Name":"Sutton Coldfield","Latitude":52.56667,"Longitude":-1.81667,"Population":107030},{"Name":"Bedford","Latitude":52.13459,"Longitude":-0.46632,"Population":106940},{"Name":"Oldham","Latitude":53.54051,"Longitude":-2.1183,"Population":104782},{"Name":"Enfield Town","Latitude":51.65147,"Longitude":-0.08497,"Population":103970},{"Name":"Woking","Latitude":51.31903,"Longitude":-0.55893,"Population":103932},{"Name":"St Helens","Latitude":53.45,"Longitude":-2.73333,"Population":102555},{"Name":"Worcester","Latitude":52.18935,"Longitude":-2.22001,"Population":101659},{"Name":"Gillingham","Latitude":51.38914,"Longitude":0.54863,"Population":101187},{"Name":"Becontree","Latitude":51.5529,"Longitude":0.129,"Population":100000},{"Name":"Worthing","Latitude":50.81795,"Longitude":-0.37538,"Population":99110},{"Name":"Rochdale","Latitude":53.61766,"Longitude":-2.1552,"Population":97550},{"Name":"Solihull","Latitude":52.41426,"Longitude":-1.78094,"Population":96267},{"Name":"Royal Leamington Spa","Latitude":52.2852,"Longitude":-1.52,"Population":95172},{"Name":"Romford","Latitude":51.57515,"Longitude":0.18582,"Population":95000},{"Name":"Bath","Latitude":51.3751,"Longitude":-2.36172,"Population":94782},{"Name":"Harlow","Latitude":51.77655,"Longitude":0.11158,"Population":94365},{"Name":"Nuneaton","Latitude":52.52323,"Longitude":-1.46523,"Population":92698},{"Name":"High Peak","Latitude":53.36797,"Longitude":-1.84536,"Population":92600},{"Name":"Darlington","Latitude":54.52429,"Longitude":-1.55039,"Population":92363},{"Name":"Southport","Latitude":53.64581,"Longitude":-3.01008,"Population":91703},{"Name":"Chester","Latitude":53.1905,"Longitude":-2.89189,"Population":90524},{"Name":"Stevenage","Latitude":51.90224,"Longitude":-0.20256,"Population":90232},{"Name":"Wembley","Latitude":51.55242,"Longitude":-0.29686,"Population":90045},{"Name":"Grays","Latitude":51.47566,"Longitude":0.32521,"Population":89755},{"Name":"Harrogate","Latitude":53.99078,"Longitude":-1.5373,"Population":89060},{"Name":"Hartlepool","Latitude":54.68554,"Longitude":-1.21028,"Population":88855},{"Name":"Londonderry County Borough","Latitude":54.99721,"Longitude":-7.30917,"Population":87153},{"Name":"Cannock","Latitude":52.69045,"Longitude":-2.03085,"Population":86121},{"Name":"Hemel Hempstead","Latitude":51.75368,"Longitude":-0.44975,"Population":85629},{"Name":"St Albans","Latitude":51.75,"Longitude":-0.33333,"Population":84561},{"Name":"South Shields","Latitude":54.99859,"Longitude":-1.4323,"Population":83655},{"Name":"Derry","Latitude":54.9981,"Longitude":-7.30934,"Population":83652},{"Name":"Weston-super-Mare","Latitude":51.34603,"Longitude":-2.97665,"Population":82903},{"Name":"Halifax","Latitude":53.71667,"Longitude":-1.85,"Population":82624},{"Name":"Redditch","Latitude":52.3065,"Longitude":-1.94569,"Population":82253},{"Name":"Beckenham","Latitude":51.40878,"Longitude":-0.02526,"Population":82000},{"Name":"Tamworth","Latitude":52.63399,"Longitude":-1.69587,"Population":81964},{"Name":"Scunthorpe","Latitude":53.57905,"Longitude":-0.65437,"Population":79977},{"Name":"Stockton-on-Tees","Latitude":54.56848,"Longitude":-1.3187,"Population":79957},{"Name":"Wakefield","Latitude":53.68331,"Longitude":-1.49768,"Population":78978},{"Name":"Carlisle","Latitude":54.8951,"Longitude":-2.9382,"Population":78470},{"Name":"Gateshead","Latitude":54.96209,"Longitude":-1.60168,"Population":77649},{"Name":"Lisburn","Latitude":54.52337,"Longitude":-6.03527,"Population":77506},{"Name":"Fylde","Latitude":53.83333,"Longitude":-2.91667,"Population":76500},{"Name":"Paisley","Latitude":55.83173,"Longitude":-4.43254,"Population":76220},{"Name":"Bracknell","Latitude":51.41363,"Longitude":-0.75054,"Population":76103},{"Name":"Newcastle under Lyme","Latitude":53,"Longitude":-2.23333,"Population":75794},{"Name":"Battersea","Latitude":51.47475,"Longitude":-0.15547,"Population":75651},{"Name":"Crewe","Latitude":53.09787,"Longitude":-2.44161,"Population":75556},{"Name":"Chatham","Latitude":51.37891,"Longitude":0.52786,"Population":75509},{"Name":"Hove","Latitude":50.83088,"Longitude":-0.1672,"Population":75174},{"Name":"Aylesbury","Latitude":51.81665,"Longitude":-0.81458,"Population":74748},{"Name":"East Kilbride","Latitude":55.76412,"Longitude":-4.17669,"Population":74740},{"Name":"Canary Wharf","Latitude":51.50519,"Longitude":-0.02085,"Population":73390},{"Name":"Rugby","Latitude":52.37092,"Longitude":-1.26417,"Population":73150},{"Name":"Salford","Latitude":53.48771,"Longitude":-2.29042,"Population":72750},{"Name":"Purley","Latitude":51.33678,"Longitude":-0.11201,"Population":72000},{"Name":"Guildford","Latitude":51.23536,"Longitude":-0.57427,"Population":71873},{"Name":"Shrewsbury","Latitude":52.71009,"Longitude":-2.75208,"Population":71715},{"Name":"Peckham","Latitude":51.47403,"Longitude":-0.06969,"Population":71552},{"Name":"Barnsley","Latitude":53.55,"Longitude":-1.48333,"Population":71447},{"Name":"Lowestoft","Latitude":52.47523,"Longitude":1.75167,"Population":70945},{"Name":"Gosport","Latitude":50.79509,"Longitude":-1.12902,"Population":70793},{"Name":"Southall","Latitude":51.50896,"Longitude":-0.3713,"Population":70000},{"Name":"Stafford","Latitude":52.80521,"Longitude":-2.11636,"Population":69217},{"Name":"Royal Tunbridge Wells","Latitude":51.13321,"Longitude":0.26256,"Population":68910},{"Name":"Ellesmere Port","Latitude":53.27875,"Longitude":-2.90134,"Population":67768},{"Name":"Rossendale","Latitude":53.68456,"Longitude":-2.2769,"Population":67400},{"Name":"Folkestone","Latitude":51.08169,"Longitude":1.16734,"Population":66429},{"Name":"Brixton","Latitude":51.46593,"Longitude":-0.10652,"Population":66300},{"Name":"Wrexham","Latitude":53.04664,"Longitude":-2.99132,"Population":65692},{"Name":"Torquay","Latitude":50.46198,"Longitude":-3.52522,"Population":65388},{"Name":"Maidenhead","Latitude":51.52279,"Longitude":-0.71986,"Population":64831},{"Name":"Kingswood","Latitude":51.45278,"Longitude":-2.50833,"Population":64793},{"Name":"Taunton","Latitude":51.01494,"Longitude":-3.10293,"Population":64621},{"Name":"Waterlooville","Latitude":50.88067,"Longitude":-1.0304,"Population":64350},{"Name":"Macclesfield","Latitude":53.26023,"Longitude":-2.12564,"Population":63954},{"Name":"Bognor Regis","Latitude":50.78206,"Longitude":-0.67978,"Population":63885},{"Name":"Newtownabbey","Latitude":54.65983,"Longitude":-5.90858,"Population":63860},{"Name":"Kettering","Latitude":52.39836,"Longitude":-0.72571,"Population":63675},{"Name":"Buckley","Latitude":53.16667,"Longitude":-3.08333,"Population":63576},{"Name":"Great Yarmouth","Latitude":52.60831,"Longitude":1.73052,"Population":63434},{"Name":"Runcorn","Latitude":53.34174,"Longitude":-2.73124,"Population":62872},{"Name":"Ashford","Latitude":51.14648,"Longitude":0.87376,"Population":62787},{"Name":"Tonypandy","Latitude":51.62202,"Longitude":-3.45544,"Population":62545},{"Name":"Scarborough","Latitude":54.27966,"Longitude":-0.40443,"Population":61749},{"Name":"Widnes","Latitude":53.3618,"Longitude":-2.73406,"Population":61464},{"Name":"Aldershot","Latitude":51.24827,"Longitude":-0.76389,"Population":61339},{"Name":"Bury","Latitude":53.6,"Longitude":-2.3,"Population":61044},{"Name":"Barking","Latitude":51.53333,"Longitude":0.08333,"Population":61000},{"Name":"Castleford","Latitude":53.72587,"Longitude":-1.36256,"Population":60509},{"Name":"Hereford","Latitude":52.05684,"Longitude":-2.71482,"Population":60415},{"Name":"Bangor","Latitude":54.65338,"Longitude":-5.66895,"Population":60385},{"Name":"Stroud","Latitude":51.75,"Longitude":-2.2,"Population":60155},{"Name":"Margate","Latitude":51.38132,"Longitude":1.38617,"Population":60134},{"Name":"Chelsea","Latitude":51.48755,"Longitude":-0.16936,"Population":60000},{"Name":"Loughborough","Latitude":52.76667,"Longitude":-1.2,"Population":59932},{"Name":"Welwyn Garden City","Latitude":51.80174,"Longitude":-0.20691,"Population":59910},{"Name":"Farnborough","Latitude":51.29424,"Longitude":-0.75565,"Population":59902},{"Name":"Rhondda","Latitude":51.65896,"Longitude":-3.44885,"Population":59450},{"Name":"Craigavon","Latitude":54.44709,"Longitude":-6.387,"Population":59236},{"Name":"Wallasey","Latitude":53.42324,"Longitude":-3.06497,"Population":58794},{"Name":"Littlehampton","Latitude":50.81137,"Longitude":-0.54078,"Population":58714},{"Name":"Bridgend","Latitude":51.50583,"Longitude":-3.57722,"Population":58380},{"Name":"Bootle","Latitude":53.46667,"Longitude":-3.01667,"Population":57791},{"Name":"Weymouth","Latitude":50.61448,"Longitude":-2.45991,"Population":57691},{"Name":"Fareham","Latitude":50.85162,"Longitude":-1.17929,"Population":57390},{"Name":"Morley","Latitude":53.74013,"Longitude":-1.59877,"Population":57385},{"Name":"Cheshunt","Latitude":51.7002,"Longitude":-0.03026,"Population":57374},{"Name":"Kidderminster","Latitude":52.38819,"Longitude":-2.25,"Population":57059},{"Name":"Corby","Latitude":52.49637,"Longitude":-0.68939,"Population":56810},{"Name":"Dartford","Latitude":51.44657,"Longitude":0.21423,"Population":56694},{"Name":"Castlereagh","Latitude":54.5735,"Longitude":-5.88472,"Population":56679},{"Name":"Dewsbury","Latitude":53.69076,"Longitude":-1.62907,"Population":56640},{"Name":"Livingston","Latitude":55.90288,"Longitude":-3.52261,"Population":56570},{"Name":"Stourbridge","Latitude":52.45608,"Longitude":-2.14317,"Population":56284},{"Name":"Sale","Latitude":53.42519,"Longitude":-2.32443,"Population":55689},{"Name":"Halesowen","Latitude":52.44859,"Longitude":-2.04938,"Population":55265},{"Name":"Canterbury","Latitude":51.27904,"Longitude":1.07992,"Population":55240},{"Name":"South Croydon","Latitude":51.36217,"Longitude":-0.09421,"Population":55198},{"Name":"Huyton","Latitude":53.4115,"Longitude":-2.83935,"Population":54738},{"Name":"Barry","Latitude":51.39979,"Longitude":-3.2838,"Population":54673},{"Name":"Gravesend","Latitude":51.44206,"Longitude":0.37106,"Population":54263},{"Name":"Eastleigh","Latitude":50.96667,"Longitude":-1.35,"Population":54225},{"Name":"Acton","Latitude":51.50901,"Longitude":-0.2762,"Population":53689},{"Name":"Washington","Latitude":54.9,"Longitude":-1.51667,"Population":53526},{"Name":"Braintree","Latitude":51.87819,"Longitude":0.55292,"Population":53477},{"Name":"Hamilton","Latitude":55.76667,"Longitude":-4.03333,"Population":53200},{"Name":"Brentwood","Latitude":51.62127,"Longitude":0.30556,"Population":52586},{"Name":"Esher","Latitude":51.36969,"Longitude":-0.36693,"Population":52392},{"Name":"Crosby","Latitude":53.47778,"Longitude":-3.03333,"Population":52140},{"Name":"Reigate","Latitude":51.23736,"Longitude":-0.20582,"Population":52123},{"Name":"Dunstable","Latitude":51.88571,"Longitude":-0.52288,"Population":51973},{"Name":"Morecambe","Latitude":54.06835,"Longitude":-2.86108,"Population":51644},{"Name":"Cumbernauld","Latitude":55.94685,"Longitude":-3.99051,"Population":51610},{"Name":"Redhill","Latitude":51.24048,"Longitude":-0.17044,"Population":51559},{"Name":"Horsham","Latitude":51.06314,"Longitude":-0.32757,"Population":51472},{"Name":"Staines","Latitude":51.43092,"Longitude":-0.50606,"Population":51040},{"Name":"Batley","Latitude":53.70291,"Longitude":-1.6337,"Population":50807},{"Name":"Wellingborough","Latitude":52.30273,"Longitude":-0.69446,"Population":50577},{"Name":"Clacton-on-Sea","Latitude":51.78967,"Longitude":1.15597,"Population":50548},{"Name":"Dunfermline","Latitude":56.07156,"Longitude":-3.45887,"Population":50380},{"Name":"Bletchley","Latitude":51.99334,"Longitude":-0.73471,"Population":50193},{"Name":"Keighley","Latitude":53.86791,"Longitude":-1.90664,"Population":50171},{"Name":"Hayes","Latitude":51.51579,"Longitude":-0.4234,"Population":50000}];

function clone(a){ return JSON.parse(JSON.stringify(a)); }

function updateBounds(config){
	if(config.bounds){
		// If "bounds" have been sent as a GeoJSON object we'll find the bounds of it
		if("type" in config.bounds && config.bounds.type === "FeatureCollection"){
			let b = d3.geoBounds(config.bounds);
			config.bounds = {'lat':{'min':b[0][1],'max':b[1][1]},'lon':{'min':b[0][0],'max':b[1][0]}};
		}
		// If it doesn't look like a valid object, quit
		if(!("lat" in config.bounds) || !("lon" in config.bounds)){
			console.error(config);
			throw new Error("No valid bounds in config. Should be in the form: { lat: { min:, max: }, lon: { min: , max: } }");
		}
	}
	return config;
}

// This component uses "/assets/leaflet/leaflet.js" and "/assets/leaflet/leaflet.css" to make things interactive in the browser.
// It will only get included in pages that need it by using the "data-dependencies" attribute.
export function ZoomableMap(opts){

	var fs = fontSize;
	let i,l,min,max,v,cs,col;

	var config = {
		'scale': 'Viridis',
		'places': [],
		'markers': [],
		'data-type': 'zoomable-map',
		'attribution': '',
		'layers': []
	};
	mergeDeep(config,opts);

	// Define some colours
	const namedColours = Colours(config.colours);

	cs = ColourScale(config.scale);

	config = updateBounds(config);

	for(l = 0; l < config.layers.length; l++){

		if(config.layers[l].data){

			// Work out default max/min from data
			min = 1e100;
			max = -1e100;

			if(config.layers[l].value){
				for(i = 0; i < config.layers[l].data.length; i++){
					v = recursiveLookup(config.layers[l].value,config.layers[l].data[i]);
					if(typeof v==="number"){
						min = Math.min(min,v);
						max = Math.max(max,v);
					}
				}
			}
			
			
			// Override defaults for min/max if set
			if(typeof config.layers[l].min=="number") min = config.layers[l].min;
			if(typeof config.layers[l].max=="number") max = config.layers[l].max;

			// Update values of min/max
			config.layers[l].max = max;
			config.layers[l].min = min;


			// Update the colours for the CSV rows
			for(i = 0; i < config.layers[l].data.length; i++){
				if(config.layers[l].value && config.layers[l].data[i][config.layers[l].value]){
					v = recursiveLookup(config.layers[l].value,config.layers[l].data[i]);
					// Find the colour by passing the fractional value within the range
					if(typeof v==="number") config.layers[l].data[i].colour = cs((v - config.layers[l].min)/(config.layers[l].max - config.layers[l].min));
					else if(typeof v==="string"){
						if(namedColours.get(v)) config.layers[l].data[i].colour = namedColours.get(v);
						else config.layers[l].data[i].colour = defaultbg;
					}
				}
				// Set a default colour if we don't have one
				if(config.layers[l].data[i].colour === undefined) config.layers[l].data[i].colour = defaultbg;
			}

		}
	}


	this.getHTML = function(){
		var html,i,l,props,zIndex,attrib;

		attrib = "";
		if(typeof config.mapAttribution==="string") attrib = config.mapAttribution||"";

		html = [];
		html.push('(function(root){\n');
		html.push('	var p = document.currentScript.parentNode;\n');
		html.push('	var map = new OI.ZoomableMap(p.querySelector(".leaflet"),{"attribution":'+(attrib ? JSON.stringify(attrib) : '""')+'});\n');

		if(config.bounds){
			// Create the bounds object required by Leaflet
			html.push('	map.fitBounds([['+config.bounds.lat.min+','+config.bounds.lon.min+'],['+config.bounds.lat.max+','+config.bounds.lon.max+']]);\n');
		}

		// Check if a background layer is provided.
		var needsTiles = true;
		for(l = 0; l < config.layers.length; l++){
			if(config.layers[l].type=="background" || config.layers[l].type=="tile") needsTiles = false;
		}
		
		// If there is no background layer or tile layer we add some by default
		if(needsTiles) html.push('	map.setTiles(-1,' + JSON.stringify(getTileLayer(config.tileLayer)) + ');\n');

		var datalayerindex = -1;

		for(l = 0; l < config.layers.length; l++){

			if(!config.layers[l].options) config.layers[l].options = {};
			if(typeof config.layers[l].options.fillOpacity!=="number") config.layers[l].options.fillOpacity = 1;

			if(config.layers[l].type=="tile"){

				zIndex = undefined;
				if(datalayerindex >= 0 && l > datalayerindex){
					zIndex = 650 - ((config.layers.length-1-l)/(config.layers.length-1-datalayerindex))*(650-400);
				}
				html.push('	map.setTiles(' + l + ', ' + JSON.stringify(getTileLayer(config.layers[l].props)) + ', ' + (zIndex) + ');\n');

			}else if(config.layers[l].type=="background"){

				var colour = Colour(config.layers[l].colour||"#fafaf8");
				var sty = clone(config.layers[l].options);
				sty.color = colour.hex;
				html.push('	map.addLayer({\n');
				html.push('		layer: L.geoJSON(' + JSON.stringify(config.layers[l].geojson.data) +',{"style":'+JSON.stringify(sty)+'})\n');
				html.push('	});\n');

			}else if(config.layers[l].type=="data"){

				if(config.layers[l].data && config.layers[l].geojson){

					datalayerindex = l;

					html.push('	map.addLayer({\n');
					html.push('		"key": "' + (config.layers[l].key||"") + '",\n');
					html.push('		"toolkey": "' + (config.layers[l].tooltip||"") + '",\n');
					html.push('		"defaultmarker": ' + JSON.stringify(icons["default"]) + ',\n');
					html.push('		"options": ' + JSON.stringify(config.layers[l].options) + ',\n');
					html.push('		"data": ' + JSON.stringify(config.layers[l].data) + ',\n');
					if(config.layers[l].geojson){
						html.push('		"geo": {\n');
						html.push('			"key": "' + (config.layers[l].geojson.key || "") + '",\n');
						html.push('			"json": ' + JSON.stringify(config.layers[l].geojson.data) + '\n');
						html.push('		}\n');
					}
					html.push('	});\n');
				}

			}else if(config.layers[l].type=="markers"){
				
				if(config.layers[l].markers && config.layers[l].markers.length > 0){
					var icon,svg;
					for(var m = 0; m < config.layers[l].markers.length; m++){
						icon;
						if(typeof config.layers[l].markers[m].icon==="undefined") config.layers[l].markers[m].icon = "default";
						if(icons[config.layers[l].markers[m].icon]) icon = clone(icons[config.layers[l].markers[m].icon]);
						else{ icon = config.layers[l].markers[m].icon; }
						if(!icon.svg){
							throw("No SVG within marker "+m);
						}
						if(!icon.size) icon.size = [40,40];
						if(!icon.anchor) icon.anchor = [20,0];
						if(icon.svg){
							// Clean up tags to make sure we have explicit closing tags
							icon.svg = icon.svg.replace(/<([^\s]+)\s([^\>]+)\s*\/\s*>/g,function(m,p1,p2){ return "<"+p1+" "+p2+"></"+p1+">"; });
						}else{
							icon.svg = '?';
						}
						icon.color = 'black';
						if(config.layers[l].markers[m].color) icon.color = config.layers[l].markers[m].color;
						if(config.layers[l].markers[m].colour) icon.color = config.layers[l].markers[m].colour;

						icon.bgPos = [icon.anchor[0],icon.size[1]-icon.anchor[1]];
						icon.html = '<div style="color:'+icon.color+';width:'+icon.size[0]+'px;height:'+icon.size[1]+'px;">'+icon.svg.replace(/(<svg[^\>]+) width="([^\"]+)"/g,function(m,p1,p2){ return p1; }).replace(/(<svg[^\>]+) height="([^\"]+)"/g,function(m,p1,p2){ return p1; })+'</div>';
						delete icon.svg;
						delete config.layers[l].markers[m].svg;
						config.layers[l].markers[m].icon = icon;
					}
					html.push('	map.addLayer({\n');
					html.push('		"markers": '+JSON.stringify(config.layers[l].markers)+',\n');
					html.push('	})\n');
				}

				
			}else if(config.layers[l].type=="labels"){

				if(config.layers[l].labels){
					html.push('	var labels = [];\n');
					for(i = 0; i < config.layers[l].labels.length; i++){
						var place = -1;
						for(var p = 0; p < places.length; p++){
							if(places[p].Name==config.layers[l].labels[i].name){
								place = p;
								continue;
							}
						}
						var f = fs*0.75;
						if(place >= 0){
							p = clone(places[place]);
							if(typeof config.layers[l].labels[i].latitude!=="number") config.layers[l].labels[i].latitude = p.Latitude;
							if(typeof config.layers[l].labels[i].longitude!=="number") config.layers[l].labels[i].longitude = p.Longitude;
							if(p.Population){
								if(p.Population > 100000) f += fs*0.125;
								if(p.Population > 250000) f += fs*0.125;
								if(p.Population > 750000) config.layers[l].labels[i].name = config.layers[l].labels[i].name.toUpperCase();
							}
						}
						config.layers[l].labels[i] = mergeDeep({'font-size':f,'font-weight':fontWeight,'font-family':fontFamily.replace(/[\"\']/g,''),'colour':'black','border':'white'},config.layers[l].labels[i]);
					}
					html.push('	map.addLayer({\n');
					html.push('		"labels": '+JSON.stringify(config.layers[l].labels) + ',\n');
					html.push('	})\n');
				}

			}
		}

		if(!config.bounds) html.push('	map.fitBounds("data");\n');

		html.push('})(window || this);\n');

		var holder = new VisualisationHolder(config,{'name':'map'});
		holder.addDependencies(['/leaflet/leaflet.js','/leaflet/leaflet.css','/css/maps.css','/css/legend.css','/js/tooltip.js','/js/zoomable.js']);
		holder.addClasses(['oi-map','oi-zoomable-map']);
		return holder.wrap('<div class="leaflet"></div><script>'+html.join('')+'</script>');
	};
	return this;
}


// This component uses "/assets/js/map.js" to make things interactive in the browser.
// That will only get included in pages that need it by using the "data-dependencies" attribute.
export function SVGMap(opts){

	let csv = clone(opts.data);
	let fs = getFontSize();
	let config = {
		'scale': 'Viridis',
		'data-type':'svg-map',
		'layers': []
	};
	mergeDeep(config,opts);

	// Define some colours
	const namedColours = Colours(config.colours);

	let cs = ColourScale(config.scale);
	let layerlist = [];
	let min,max,v,i,l;
	
	
	let tooltipProcessor = function(props,key){
		var txt = key;
		// See if this is just a straightforward key
		if(typeof props[key]==="string") txt = props[key];

		// Keep a dummy version of the value key
		props._value = config.value;

		if(config.tooltip){
			// Process replacement filters 
			txt = applyReplacementFilters(txt,props);
		}else{
			// The label is empty so keep it that way
			txt = "";
		}
		return txt;
	}


	// If "bounds" have been sent as a GeoJSON object we'll find the bounds of it
	config = updateBounds(config);

	for(l = 0; l < config.layers.length; l++){

		if(config.layers[l].type=="background"){

			layerlist.push({
				'id': 'background',
				'class': 'background',
				'data': config.layers[l].data,
				'geojson': config.layers[l].geojson,
				'options': mergeDeep({ 'color': Colour(config.layers[l].colour||"#fafaf8").hex },config.layers[l].options||{})
			});
			
		}else if(config.layers[l].type=="data"){

			// Work out max/min for this layer
			min = 1e100;
			max = -1e100;
			v;

			if(config.layers[l].scale){
				config.scale = config.layers[l].scale;
				cs = ColourScale(config.scale);
			}
			if(config.layers[l].value){
				for(i = 0; i < config.layers[l].data.length; i++){
					v = recursiveLookup(config.layers[l].value,config.layers[l].data[i]);
					if(typeof v==="number"){
						min = Math.min(min,v);
						max = Math.max(max,v);
					}
				}
			}

			// Override defaults if set
			if(typeof config.layers[l].min=="number"){
				config.min = config.layers[l].min;
				min = config.min;
			}
			if(typeof config.layers[l].max=="number"){
				config.max = config.layers[l].max;
				max = config.max;
			}
			// Set some global values from the layer
			if(typeof config.layers[l].value && typeof config.value==="undefined"){
				config.value = config.layers[l].value;
			}
			if(typeof config.layers[l].key && typeof config.key==="undefined"){
				config.key = config.layers[l].key;
			}
			if(config.layers[l].tooltip && typeof config.tooltip==="undefined"){
				config.tooltip = config.layers[l].tooltip;
			}

			layerlist.push({
				'id': 'data',
				'class': 'data-layer',
				'role':'table',
				'data': config.layers[l].data,
				'geojson': config.layers[l].geojson,
				'options': mergeDeep({ 'color': '#b2b2b2' },config.layers[l].options||{}),
				'values': { 'key': config.layers[l].key, 'geokey': config.layers[l].geojson.key||"", 'value': config.layers[l].value, 'label':config.layers[l].tooltip, 'min':min, 'max': max, 'data': config.layers[l].data, 'colour': 'red' },
				'style': function(feature,el,type){
					var v,code,i,title,row,val,valuecol,k;
					v = this.attr.values;
					valuecol = -1;
					code = feature.properties[v.geokey];
					row = {};

					for(i = 0; i < v.data.length; i++){
						if(v.data[i][v.key] == code) valuecol = i;
					}
					if(valuecol >= 0){
						row = clone(v.data[valuecol]);
						// Add geojson properties
						row.geojson = {'properties':feature.properties||{}};
					}


					if(typeof v.value==="string"){
						val = recursiveLookup(v.value,row);

						// Add a colour-scale colour to each row based on the "value" column
						if(typeof val==="number"){
							row.colour = cs((val-v.min)/(v.max-v.min));
						}else{
							if(namedColours.get(v.value)) row.colour = namedColours.get(v.value);
						}
					}

					if(typeof row.colour === "string"){
						if(namedColours.get(row.colour)) row.colour = namedColours.get(row.colour);
					}

					// Set a default colour if we don't have one
					if(row.colour === undefined) row.colour = defaultbg;

					if(row){
						if(valuecol >= 0){
							let tooltipText = tooltipProcessor(row, v.label);
							if(typeof tooltipText!=="string") tooltipText = "";
							if(tooltipText){
								// Add a text label 
								title = newEl('title');
								title.innerHTML = tooltipText;
								el.appendChild(title);
							}
						}
						el.setAttribute('fill-opacity',(type == "line" ? 0 : (typeof this.options.fillOpacity==="number" ? this.options.fillOpacity : 1)));
						el.setAttribute('fill',row.colour);
						el.setAttribute('stroke',(type == "line" ? row.colour : 'white'));
						el.setAttribute('stroke-width',2);
						el.setAttribute('stroke-opacity',(type == "line" ? 1 : 0.1));
					}else{
						el.setAttribute('style','display:none');
					}
				}
			});

		}else if(config.layers[l].type=="graticule"){

			var step = (typeof config.layers[l].step==="object" ? config.layers[l].step : [2, 2]);
			var grid = d3.geoGraticule().step(step).precision(step[0]/20);
			if(config.bounds){
				var dlat = Math.abs(config.bounds.lat.max-config.bounds.lat.min)*0.1;
				var dlon = Math.abs(config.bounds.lon.max-config.bounds.lon.min)*0.1;
				grid.extent([[config.bounds.lon.min-dlon,config.bounds.lat.max+dlat],[config.bounds.lon.max+dlon,config.bounds.lat.min-dlat]]);
			}
			layerlist.push({
				'id': 'grid',
				'class': 'graticule',
				'geojson': { 'data': { 'type':'FeatureCollection', 'features': [ {"type": "Feature", "properties": {}, "geometry": grid() }] }},
				'options': mergeDeep({ 'color': '#000000' },config.layers[l].options||{})
			});

		}else if(config.layers[l].type=="labels"){

			layerlist.push({
				'id': 'labels',
				'class': 'labels',
				'options': mergeDeep({ 'fill': '#4c5862', 'stroke': 'white', 'stroke-width': '0.7%', 'stroke-linejoin': 'round'	},config.layers[l].options||{}),
				'type': 'text',
				'values': {'data':clone(places||[]),'places':config.layers[l].labels},
				'process': function(d,map){
					var i,c,locations,f,loc,threshold,place,p;

					locations = [];
					threshold = 0;

					for(p = 0; p < this.attr.values.places.length; p++){

						place = -1;
						for(i = 0; i < this.attr.values.data.length; i++){
							if(this.attr.values.places[p].name==this.attr.values.data[i].Name) place = i;
						}

						if(place < 0){
							this.attr.values.data.push({'Name':this.attr.values.places[p].name,'Population':this.attr.values.places[p].population||0,'Latitude':this.attr.values.places[p].latitude,'Longitude':this.attr.values.places[p].longitude});
							place = this.attr.values.data.length-1;
						}

						if(place >= 0){
							loc = {'type':'Feature','properties':{},'style':{},'geometry':{'type':'Point','coordinates':[]}};

							for(c in this.attr.values.data[place]) loc.properties[c] = this.attr.values.data[place][c];
							for(c in this.attr.values.places[p]) loc.style[c] = this.attr.values.places[p][c];
							loc.name = loc.properties.Name;

							if(!loc.style['font-size']){
								f = fs*0.75;
								if(loc.properties.Population){
									if(loc.properties.Population > 100000) f += fs*0.125;
									if(loc.properties.Population > 250000) f += fs*0.125;
									if(loc.properties.Population > 750000) loc.name = loc.name.toUpperCase();
								}
								loc.style['font-size'] = f;
							}
							loc.geometry.coordinates = [loc.properties.Longitude,loc.properties.Latitude];

							if(typeof loc.properties.Population==="undefined") loc.properties.Population = 0;
							if(typeof this.attr.values.places[p].longitude==="number") loc.geometry.coordinates[0] = this.attr.values.places[p].longitude;
							if(typeof this.attr.values.places[p].latitude==="number") loc.geometry.coordinates[1] = this.attr.values.places[p].latitude;
							if(loc.properties.Population >= threshold) locations.push(loc);
						}
					}
					this.geojson = { 'data': {'type':'FeatureCollection','features':locations} };
				}
			});

		}else if(config.layers[l].type=="markers"){

			layerlist.push({
				'id': 'markers',
				'class': 'markers',
				'options': mergeDeep({ 'fill': '#4c5862', 'stroke': 'white', 'stroke-width': '0.7%', 'stroke-linejoin': 'round'	},config.layers[l].options||{}),
				'type': 'text',
				'values': {'markers':config.layers[l].markers||[]},
				'process': function(d,map){
					var i,pin,markers = [];

					for(i = 0; i < this.attr.values.markers.length; i++){
						if(typeof this.attr.values.markers[i].longitude==="number" && typeof this.attr.values.markers[i].latitude==="number"){
							pin = {'type':'Feature','properties':this.attr.values.markers[i],'style':{},'geometry':{'type':'Point','coordinates':[this.attr.values.markers[i].longitude,this.attr.values.markers[i].latitude]}};
							markers.push(pin);
						}
					}
					this.geojson = { 'data': {'type':'FeatureCollection','features':markers} };
				}
			});

		}else{

			throw "Unknown layer type '"+config.layers[l].type+"' for map";

		}
		
	}

	var map = new BasicMap(config,{
		'background': 'transparent',
		'classes': 'oi-map-svg',
		'dependencies': ['/js/map.js','/css/maps.css','/js/tooltip.js'],
		'layers': layerlist,
		'complete': function(){
			if(config.bounds){
				if(typeof config.bounds==="string") return this.zoomToData(config.bounds);
				else if(typeof config.bounds.lat==="object" && typeof config.bounds.lon==="object") return this.setBounds(config.bounds);
			}else{
				if(this.getLayerPos('data') >= 0) this.zoomToData('data');
				else this.zoomToData('background');
			}
		}
	});

	return map;

}


function BasicMap(config,attr){
	if(!attr) attr = {};
	var el = newEl('div');
	this.container = el;
	el.innerHTML = "";
	setAttr(this.container,{'style':'overflow:hidden'});

	this.attr = attr;
	this.projection = new Projection(config.projection||null,(config.width || attr.w),(config.height || attr.h),(config.padding || 0));
	this.w = this.projection.w;
	this.h = this.projection.h;

	// Add the SVG
	this.svg = svgEl('svg');
	setAttr(this.svg,{'class':'oi-map-map','xmlns':'http://www.w3.org/2000/svg','version':'1.1','width':this.w,'height':this.h,'viewBox':'-180 0 360 180','overflow':'hidden','style':'width:'+(config.width ? config.width+"px" : "100%")+';max-width:100%;max-height:100%;margin:auto;height:auto;background:'+(attr.background||"white")+';aspect-ratio:'+this.w+' / '+this.h+';','preserveAspectRatio':'xMidYMin meet'});
	if(config['data-type']) setAttr(this.svg,{'data-type':config['data-type']});
	el.appendChild(this.svg);

	this.layers = [];
	this.zoom = 12;
	this.places = (attr.places||[]);
	this.place = (attr.place||"");

	this.getHTML = function(){

		var holder = new VisualisationHolder(config,{'name':'map'});
		holder.addDependencies(attr.dependencies||['/css/legend.css','/css/maps.css','/js/tooltip.js']);
		holder.addClasses('oi-map');
		holder.addClasses(attr.classes);

		var html = this.svg.outerHTML;
		var l,filterdata,i,datum,id,filter;

		if(config.tools && config.tools.filter){
			holder.addDependencies(['/js/map-filter.js','/js/colours.js']);

			filter = config.tools.filter;
			filterdata = {};
			for(l = 0; l < config.layers.length; l++){
				if(config.layers[l].type=="data"){
					for(i = 0; i < config.layers[l].data.length; i++){
						datum = config.layers[l].data[i];
						if(config.key in datum){
							id = datum[config.key];
							filterdata[id] = (filter.label && filter.label in datum ? datum[filter.label] : filter.label);
						}
					}
				}
			}
			
			html += '\n<script>(function(root){ OI.FilterMap('+JSON.stringify(filter)+','+JSON.stringify(filterdata)+'); })(window || this);</script>\n';
		}
		return holder.wrap('<div class="oi-map-holder"><div class="oi-map-inner">'+html+'</div></div>');
	};

	this.insertLayer = function(l,i){
		if(typeof l!=="object" || typeof l.id!=="string"){
			console.warn('Layer does not appear to contain a key',l);
			return {};
		}
		l = new Layer(l,this,i);
		if(l.id){
			if(typeof i==="number") this.layers.splice(Math.max(i,0),0,l);
			else this.layers.push(l);
			l.load();
		}
		return l;
	};

	this.addLayers = function(ls,cb,i){
		if(typeof ls.length!=="number") ls = [ls];

		function isFinished(){
			if(typeof cb==="function") cb.call(this);
		}
		for(var l = 0; l < ls.length; l++){
			ls[l].callback = isFinished;
			this.insertLayer(ls[l],i);
		}
		return this;
	};

	this.addLayersAfter = function(name,ls){
		var i = this.getLayerPos(name)+1;
		return this.addLayers(ls,this.attr.complete,i);
	};

	this.addLayersBefore = function(name,ls){
		var i = this.getLayerPos(name)||0;
		return this.addLayers(ls,this.attr.complete,i);
	};

	this.getLayerPos = function(l){
		if(typeof l==="string"){
			for(var i = 0; i < this.layers.length; i++){
				if(this.layers[i].id==l) return i;
			}
			return -1;	// No matches
		}
		return l;
	};

	this.removeLayer = function(l){
		// Get the index of the layer
		var i = this.getLayerPos(l);
		if(i >= 0 && i < this.layers.length){
			// Remove SVG content for this layer
			this.layers[i].clear();
			// Remove layer from array
			return this.layers.splice(i,1)[0];
		}else{
			return false;
		}
	};

	// Set the bounds of the map
	this.setBounds = function(bounds){
		var geojson = new GeoJSON();
		geojson.addFeature({ "type": "Feature", "geometry": { "type": "Polygon", "coordinates": [ [ [ bounds.lon.min, bounds.lat.min ], [ bounds.lon.min, bounds.lat.max ], [ bounds.lon.max, bounds.lat.max ], [ bounds.lon.min, bounds.lat.min ]]]}});
		return this.updateView(geojson);
	};

	this.clear = function(){
		// TODO: clear SVG
		this.layers = [];
		return this;
	};

	this.zoomToData = function(id){
		// Get bounding box range from all layers
		var geojson = new GeoJSON();
		for(var l = 0; l < this.layers.length; l++){
			if(this.layers[l].geojson && (!id || id == this.layers[l].id)){
				geojson.addFeatures(this.layers[l].geojson.data.features);
			}
		}
		return this.updateView(geojson);
	};

	this.updateView = function(geojson){
		geojson = new GeoJSON(geojson);

		// Set the view box
		if(geojson.getData().features.length > 0){
			this.projection.fitData(geojson);
		}

		var sty = this.svg.getAttribute('style');
		sty = sty.replace(/aspect-ratio:([^\;\n]+)/,"aspect-ratio:"+this.projection.metrics.aspectRatio);

		setAttr(this.svg,{'viewBox': this.projection.metrics.viewBox,'height':Math.round(this.projection.metrics.height),'style':sty});

		// Update layer paths
		for(var l = 0; l < this.layers.length; l++) this.layers[l].update();

		// Scale text labels
		var tspans = this.svg.querySelectorAll('tspan');
		var svgLabels = this.svg.querySelectorAll('text');
		if(svgLabels.length > 0){
			var pc = 100;
			pc = 100;//*(tileBox.x.range > tileBox.y.range ? tileBox.x.range/this.w : tileBox.y.range/this.h);
			var i;
			for(i = 0; i < tspans.length; i++){
				tspans[i].setAttribute('style','font-size:'+pc.toFixed(3)+'%;');
			}
		}

		return this;
	};

	if(attr.layers) this.addLayers(attr.layers,attr.complete);

	return this;
}

function Projection(p,w,h,defaultpadding){

	if(!p) p = {};
	if(typeof p.name!=="string") p.name = "none";

	let defaultwidth = 1080;
	let defaultheight = 720;
	let lat_0 = (typeof p.latitude==="number" ? p.latitude : (typeof p.lat==="number" ? p.lat : 0));
	let lon_0 = (typeof p.longitude==="number" ? p.longitude : (typeof p.lon==="number" ? p.lon : 0));
	var proj,path,wide,tall;

	wide = w;
	tall = h;

	// Make sure defaultpadding is formatted in the form: [top, right, bottom, left] padding
	if(typeof defaultpadding==="number" && defaultpadding > 0) defaultpadding = [defaultpadding];
	if(typeof defaultpadding==="object"){
		if(defaultpadding.length==1) defaultpadding = [defaultpadding[0],defaultpadding[0],defaultpadding[0],defaultpadding[0]];
		if(defaultpadding.length==2) defaultpadding = [defaultpadding[0],defaultpadding[1],defaultpadding[0],defaultpadding[1]];
	}

	if(p.name=="aitoff"){

		proj = d3geo.geoAitoff();
		if(typeof w!=="number") wide = defaultwidth;
		if(typeof h!=="number") tall = wide/2;

	}else if(p.name=="albers"){

		proj = d3.geoAlbers();
		if(typeof w!=="number") wide = defaultwidth;
		if(typeof h!=="number") tall = wide/1.5;

	}else if(p.name=="equirectangular"){

		proj = d3.geoEquirectangular();
		if(typeof w!=="number") wide = defaultwidth;
		if(typeof h!=="number") tall = wide/2;

	}else if(p.name=="gall-peters"){

		proj = d3geo.geoCylindricalEqualArea();
		if(typeof w!=="number") wide = defaultwidth;
		if(typeof h!=="number") tall = Math.round(wide * 2/Math.PI);
		proj.parallel(45);

	}else if(p.name=="mollweide"){

		proj = d3geo.geoMollweide();
		if(typeof w!=="number") wide = defaultwidth;
		if(typeof h!=="number") tall = wide/2;

	}else if(p.name=="orthographic"){

		proj = d3.geoOrthographic();
		if(typeof w!=="number") wide = defaultwidth;
		if(typeof h!=="number") tall = wide;

	}else if(p.name=="osgb"){

		proj = d3.geoTransverseMercator();
		// Explicitly set the centre coordinates
		lat_0 = 49;
		lon_0 = -2;
		if(typeof w!=="number") wide = defaultwidth;
		if(typeof h!=="number") tall = wide;

	}else{

		proj = d3.geoMercator();
		if(typeof w!=="number") wide = defaultwidth;
		if(typeof h!=="number") tall = wide;

	}

	this.w = wide;
	this.h = tall;
	this.metrics = {};

	if(!proj){
		throw "No projection "+p.name+" has been defined.";
	}

	proj.rotate([-lon_0,-lat_0]);
	proj.translate([wide/2,tall/2]);

	path = d3.geoPath().projection(proj).digits(1);

	this.toPath = function(feature){
		return path(feature);
	};

	this.getBounds = function(geojson){
		geojson = new GeoJSON(geojson);
		return path.bounds(geojson.getData());
	};

	this.fitData = function(geojson){
		geojson = new GeoJSON(geojson);
		if(geojson.getData().features.length == 0) geojson.addFeature({ "type": "Feature", "geometry": { "type": "Polygon", "coordinates": [ [ [ -180.0, -90 ], [ -180.0, 90 ], [ 180, 90 ], [ -180, 90 ]]]} });

		var p = [0,0,0,0];
		if(typeof defaultpadding==="object") p = defaultpadding;

		// Fit the projection to the bounds
		if(typeof w==="number" && typeof h==="number"){
			proj.fitExtent([[0, 0],[this.w, this.h]],geojson.getData());
		}else if(typeof w!=="number" && typeof h==="number"){
			proj.fitExtent([[0, 0],[this.w, h]],geojson.getData());
		}else if(typeof w==="number" && typeof h!=="number"){
			proj.fitExtent([[0, 0],[w, this.h]],geojson.getData());
		}else{
			proj.fitWidth(this.w,geojson.getData());
		}

		this.metrics.bounds = this.getBounds(geojson);

		// Update bounds with padding
		this.metrics.bounds[0][1] -= p[0];	// top
		this.metrics.bounds[1][0] += p[1];	// right
		this.metrics.bounds[1][1] += p[2];	// bottom
		this.metrics.bounds[0][0] -= p[3];	// left

		this.metrics.width = this.metrics.bounds[1][0] - this.metrics.bounds[0][0];
		this.metrics.height = this.metrics.bounds[1][1] - this.metrics.bounds[0][1];
		this.metrics.viewBox = Math.round(this.metrics.bounds[0][0]) + " " + Math.round(this.metrics.bounds[0][1]) + " " + Math.round(this.metrics.width) + " " + Math.round(this.metrics.height);
		this.metrics.aspectRatio = Math.round(Math.max(this.w,this.metrics.width))+' / '+Math.round(this.metrics.height);

		// Clip GeoJSON to the bounds to avoid lots of unseen polygons
		proj.clipExtent(this.metrics.bounds);

		path = d3.geoPath().projection(proj).digits(1);
		return this;
	};

	// Default to just using input coordinates
	this.latlon2xy = function(lat,lon,zoom){
		var xy = proj([lon,lat]);
		return {'x':xy[0],'y':xy[1]};
	};


	return this;
}


function GeoJSON(geo){
	if(!geo) geo = {};
	if(typeof geo.getData==="function") return geo;
	if(!geo.type) geo.type = "FeatureCollection";
	if(!geo.features) geo.features = [];
	this.getData = function(){
		return geo;
	};
	this.addFeature = function(f){
		geo.features.push(f);
		return this;
	};
	this.addFeatures = function(fs){
		geo.features = geo.features.concat(fs);
		return this;
	};
	this.getBounds = function(){
		return d3.geoBounds(geo);
	};
	this.getCentroid = function(){
		return d3.geoCentroid(geo);
	};
	return this;
}
