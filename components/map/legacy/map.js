import { document } from '../../../lib/document.ts';
import { mergeDeep } from '../../../lib/util/merge-deep.ts';
import { Colour, ColourScale } from "../../../lib/colour/colours.ts";
import { replaceNamedColours } from '../../../lib/colour/parse-colour-string.ts';
import { Legend } from '../../../lib/chart-parts/legend.js';
import { getBackgroundColour } from "../../../lib/colour/colour.ts";

const defaultbg = getBackgroundColour();

var places = [{"Name":"London","Latitude":51.50853,"Longitude":-0.12574,"Population":7556900},{"Name":"Birmingham","Latitude":52.48142,"Longitude":-1.89983,"Population":984333},{"Name":"Liverpool","Latitude":53.41058,"Longitude":-2.97794,"Population":864122},{"Name":"Nottingham","Latitude":52.9536,"Longitude":-1.15047,"Population":729977},{"Name":"Sheffield","Latitude":53.38297,"Longitude":-1.4659,"Population":685368},{"Name":"Bristol","Latitude":51.45523,"Longitude":-2.59665,"Population":617280},{"Name":"Glasgow","Latitude":55.86515,"Longitude":-4.25763,"Population":591620},{"Name":"Leicester","Latitude":52.6386,"Longitude":-1.13169,"Population":508916},{"Name":"Edinburgh","Latitude":55.95206,"Longitude":-3.19648,"Population":464990},{"Name":"Leeds","Latitude":53.79648,"Longitude":-1.54785,"Population":455123},{"Name":"Cardiff","Latitude":51.48,"Longitude":-3.18,"Population":447287},{"Name":"Manchester","Latitude":53.48095,"Longitude":-2.23743,"Population":395515},{"Name":"Stoke-on-Trent","Latitude":53.00415,"Longitude":-2.18538,"Population":372775},{"Name":"Coventry","Latitude":52.40656,"Longitude":-1.51217,"Population":359262},{"Name":"Sunderland","Latitude":54.90465,"Longitude":-1.38222,"Population":335415},{"Name":"Birkenhead","Latitude":53.39337,"Longitude":-3.01479,"Population":325264},{"Name":"Islington","Latitude":51.53622,"Longitude":-0.10304,"Population":319143},{"Name":"Reading","Latitude":51.45625,"Longitude":-0.97113,"Population":318014},{"Name":"Kingston upon Hull","Latitude":53.7446,"Longitude":-0.33525,"Population":314018},{"Name":"Preston","Latitude":53.76282,"Longitude":-2.70452,"Population":313332},{"Name":"Newport","Latitude":51.58774,"Longitude":-2.99835,"Population":306844},{"Name":"Swansea","Latitude":51.62079,"Longitude":-3.94323,"Population":300352},{"Name":"Bradford","Latitude":53.79391,"Longitude":-1.75206,"Population":299310},{"Name":"Southend-on-Sea","Latitude":51.53782,"Longitude":0.71433,"Population":295310},{"Name":"Belfast","Latitude":54.59682,"Longitude":-5.92541,"Population":274770},{"Name":"Derby","Latitude":52.92277,"Longitude":-1.47663,"Population":270468},{"Name":"Plymouth","Latitude":50.37153,"Longitude":-4.14305,"Population":260203},{"Name":"Luton","Latitude":51.87967,"Longitude":-0.41748,"Population":258018},{"Name":"Wolverhampton","Latitude":52.58547,"Longitude":-2.12296,"Population":252791},{"Name":"City of Westminster","Latitude":51.5,"Longitude":-0.11667,"Population":247614},{"Name":"Southampton","Latitude":50.90395,"Longitude":-1.40428,"Population":246201},{"Name":"Blackpool","Latitude":53.81667,"Longitude":-3.05,"Population":239409},{"Name":"Milton Keynes","Latitude":52.04172,"Longitude":-0.75583,"Population":229941},{"Name":"Bexley","Latitude":51.44162,"Longitude":0.14866,"Population":228000},{"Name":"Northampton","Latitude":52.25,"Longitude":-0.88333,"Population":215963},{"Name":"Archway","Latitude":51.56733,"Longitude":-0.13415,"Population":215667},{"Name":"Norwich","Latitude":52.62783,"Longitude":1.29834,"Population":213166},{"Name":"Dudley","Latitude":52.5,"Longitude":-2.08333,"Population":199059},{"Name":"Aberdeen","Latitude":57.14369,"Longitude":-2.09814,"Population":196670},{"Name":"Portsmouth","Latitude":50.79899,"Longitude":-1.09125,"Population":194150},{"Name":"Newcastle upon Tyne","Latitude":54.97328,"Longitude":-1.61396,"Population":192382},{"Name":"Sutton","Latitude":51.35,"Longitude":-0.2,"Population":187600},{"Name":"Swindon","Latitude":51.55797,"Longitude":-1.78116,"Population":185609},{"Name":"Crawley","Latitude":51.11303,"Longitude":-0.18312,"Population":180508},{"Name":"Ipswich","Latitude":52.05917,"Longitude":1.15545,"Population":178835},{"Name":"Wigan","Latitude":53.54296,"Longitude":-2.63706,"Population":175405},{"Name":"Croydon","Latitude":51.38333,"Longitude":-0.1,"Population":173314},{"Name":"Walsall","Latitude":52.58528,"Longitude":-1.98396,"Population":172141},{"Name":"Mansfield","Latitude":53.13333,"Longitude":-1.2,"Population":171958},{"Name":"Oxford","Latitude":51.75222,"Longitude":-1.25596,"Population":171380},{"Name":"Warrington","Latitude":53.39254,"Longitude":-2.58024,"Population":165456},{"Name":"Slough","Latitude":51.50949,"Longitude":-0.59541,"Population":163777},{"Name":"Bournemouth","Latitude":50.72048,"Longitude":-1.8795,"Population":163600},{"Name":"Peterborough","Latitude":52.57364,"Longitude":-0.24777,"Population":163379},{"Name":"Cambridge","Latitude":52.2,"Longitude":0.11667,"Population":158434},{"Name":"Doncaster","Latitude":53.52285,"Longitude":-1.13116,"Population":158141},{"Name":"York","Latitude":53.95763,"Longitude":-1.08271,"Population":153717},{"Name":"Poole","Latitude":50.71429,"Longitude":-1.98458,"Population":150092},{"Name":"Gloucester","Latitude":51.86568,"Longitude":-2.2431,"Population":150053},{"Name":"Burnley","Latitude":53.8,"Longitude":-2.23333,"Population":149422},{"Name":"Huddersfield","Latitude":53.64904,"Longitude":-1.78416,"Population":149017},{"Name":"Telford","Latitude":52.67659,"Longitude":-2.44926,"Population":147980},{"Name":"Dundee","Latitude":56.46913,"Longitude":-2.97489,"Population":147710},{"Name":"Blackburn","Latitude":53.75,"Longitude":-2.48333,"Population":146521},{"Name":"Basildon","Latitude":51.56844,"Longitude":0.45782,"Population":144859},{"Name":"Middlesbrough","Latitude":54.57623,"Longitude":-1.23483,"Population":142707},{"Name":"Bolton","Latitude":53.58333,"Longitude":-2.43333,"Population":141331},{"Name":"Stockport","Latitude":53.40979,"Longitude":-2.15761,"Population":139052},{"Name":"Brighton","Latitude":50.82838,"Longitude":-0.13947,"Population":139001},{"Name":"West Bromwich","Latitude":52.51868,"Longitude":-1.9945,"Population":135618},{"Name":"Grimsby","Latitude":53.56539,"Longitude":-0.07553,"Population":134160},{"Name":"Hastings","Latitude":50.85519,"Longitude":0.57292,"Population":133422},{"Name":"High Wycombe","Latitude":51.62907,"Longitude":-0.74934,"Population":133204},{"Name":"Watford","Latitude":51.65531,"Longitude":-0.39602,"Population":125707},{"Name":"Saint Peters","Latitude":51.36667,"Longitude":1.41667,"Population":125370},{"Name":"Burton upon Trent","Latitude":52.80728,"Longitude":-1.64263,"Population":122199},{"Name":"Colchester","Latitude":51.88921,"Longitude":0.90421,"Population":121859},{"Name":"Eastbourne","Latitude":50.76871,"Longitude":0.28453,"Population":118219},{"Name":"Exeter","Latitude":50.7236,"Longitude":-3.52751,"Population":117763},{"Name":"Rotherham","Latitude":53.43012,"Longitude":-1.35678,"Population":117618},{"Name":"Cheltenham","Latitude":51.90006,"Longitude":-2.07972,"Population":116447},{"Name":"Lincoln","Latitude":53.22683,"Longitude":-0.53792,"Population":114879},{"Name":"Chesterfield","Latitude":53.25,"Longitude":-1.41667,"Population":113057},{"Name":"Chelmsford","Latitude":51.73575,"Longitude":0.46958,"Population":111511},{"Name":"Mendip","Latitude":51.2372,"Longitude":-2.6266,"Population":110000},{"Name":"Dagenham","Latitude":51.55,"Longitude":0.16667,"Population":108368},{"Name":"Basingstoke","Latitude":51.26249,"Longitude":-1.08708,"Population":107642},{"Name":"Maidstone","Latitude":51.26667,"Longitude":0.51667,"Population":107627},{"Name":"Sutton Coldfield","Latitude":52.56667,"Longitude":-1.81667,"Population":107030},{"Name":"Bedford","Latitude":52.13459,"Longitude":-0.46632,"Population":106940},{"Name":"Oldham","Latitude":53.54051,"Longitude":-2.1183,"Population":104782},{"Name":"Enfield Town","Latitude":51.65147,"Longitude":-0.08497,"Population":103970},{"Name":"Woking","Latitude":51.31903,"Longitude":-0.55893,"Population":103932},{"Name":"St Helens","Latitude":53.45,"Longitude":-2.73333,"Population":102555},{"Name":"Worcester","Latitude":52.18935,"Longitude":-2.22001,"Population":101659},{"Name":"Gillingham","Latitude":51.38914,"Longitude":0.54863,"Population":101187},{"Name":"Becontree","Latitude":51.5529,"Longitude":0.129,"Population":100000},{"Name":"Worthing","Latitude":50.81795,"Longitude":-0.37538,"Population":99110},{"Name":"Rochdale","Latitude":53.61766,"Longitude":-2.1552,"Population":97550},{"Name":"Solihull","Latitude":52.41426,"Longitude":-1.78094,"Population":96267},{"Name":"Royal Leamington Spa","Latitude":52.2852,"Longitude":-1.52,"Population":95172},{"Name":"Romford","Latitude":51.57515,"Longitude":0.18582,"Population":95000},{"Name":"Bath","Latitude":51.3751,"Longitude":-2.36172,"Population":94782},{"Name":"Harlow","Latitude":51.77655,"Longitude":0.11158,"Population":94365},{"Name":"Nuneaton","Latitude":52.52323,"Longitude":-1.46523,"Population":92698},{"Name":"High Peak","Latitude":53.36797,"Longitude":-1.84536,"Population":92600},{"Name":"Darlington","Latitude":54.52429,"Longitude":-1.55039,"Population":92363},{"Name":"Southport","Latitude":53.64581,"Longitude":-3.01008,"Population":91703},{"Name":"Chester","Latitude":53.1905,"Longitude":-2.89189,"Population":90524},{"Name":"Stevenage","Latitude":51.90224,"Longitude":-0.20256,"Population":90232},{"Name":"Wembley","Latitude":51.55242,"Longitude":-0.29686,"Population":90045},{"Name":"Grays","Latitude":51.47566,"Longitude":0.32521,"Population":89755},{"Name":"Harrogate","Latitude":53.99078,"Longitude":-1.5373,"Population":89060},{"Name":"Hartlepool","Latitude":54.68554,"Longitude":-1.21028,"Population":88855},{"Name":"Londonderry County Borough","Latitude":54.99721,"Longitude":-7.30917,"Population":87153},{"Name":"Cannock","Latitude":52.69045,"Longitude":-2.03085,"Population":86121},{"Name":"Hemel Hempstead","Latitude":51.75368,"Longitude":-0.44975,"Population":85629},{"Name":"St Albans","Latitude":51.75,"Longitude":-0.33333,"Population":84561},{"Name":"South Shields","Latitude":54.99859,"Longitude":-1.4323,"Population":83655},{"Name":"Derry","Latitude":54.9981,"Longitude":-7.30934,"Population":83652},{"Name":"Weston-super-Mare","Latitude":51.34603,"Longitude":-2.97665,"Population":82903},{"Name":"Halifax","Latitude":53.71667,"Longitude":-1.85,"Population":82624},{"Name":"Redditch","Latitude":52.3065,"Longitude":-1.94569,"Population":82253},{"Name":"Beckenham","Latitude":51.40878,"Longitude":-0.02526,"Population":82000},{"Name":"Tamworth","Latitude":52.63399,"Longitude":-1.69587,"Population":81964},{"Name":"Scunthorpe","Latitude":53.57905,"Longitude":-0.65437,"Population":79977},{"Name":"Stockton-on-Tees","Latitude":54.56848,"Longitude":-1.3187,"Population":79957},{"Name":"Wakefield","Latitude":53.68331,"Longitude":-1.49768,"Population":78978},{"Name":"Carlisle","Latitude":54.8951,"Longitude":-2.9382,"Population":78470},{"Name":"Gateshead","Latitude":54.96209,"Longitude":-1.60168,"Population":77649},{"Name":"Lisburn","Latitude":54.52337,"Longitude":-6.03527,"Population":77506},{"Name":"Fylde","Latitude":53.83333,"Longitude":-2.91667,"Population":76500},{"Name":"Paisley","Latitude":55.83173,"Longitude":-4.43254,"Population":76220},{"Name":"Bracknell","Latitude":51.41363,"Longitude":-0.75054,"Population":76103},{"Name":"Newcastle under Lyme","Latitude":53,"Longitude":-2.23333,"Population":75794},{"Name":"Battersea","Latitude":51.47475,"Longitude":-0.15547,"Population":75651},{"Name":"Crewe","Latitude":53.09787,"Longitude":-2.44161,"Population":75556},{"Name":"Chatham","Latitude":51.37891,"Longitude":0.52786,"Population":75509},{"Name":"Hove","Latitude":50.83088,"Longitude":-0.1672,"Population":75174},{"Name":"Aylesbury","Latitude":51.81665,"Longitude":-0.81458,"Population":74748},{"Name":"East Kilbride","Latitude":55.76412,"Longitude":-4.17669,"Population":74740},{"Name":"Canary Wharf","Latitude":51.50519,"Longitude":-0.02085,"Population":73390},{"Name":"Rugby","Latitude":52.37092,"Longitude":-1.26417,"Population":73150},{"Name":"Salford","Latitude":53.48771,"Longitude":-2.29042,"Population":72750},{"Name":"Purley","Latitude":51.33678,"Longitude":-0.11201,"Population":72000},{"Name":"Guildford","Latitude":51.23536,"Longitude":-0.57427,"Population":71873},{"Name":"Shrewsbury","Latitude":52.71009,"Longitude":-2.75208,"Population":71715},{"Name":"Peckham","Latitude":51.47403,"Longitude":-0.06969,"Population":71552},{"Name":"Barnsley","Latitude":53.55,"Longitude":-1.48333,"Population":71447},{"Name":"Lowestoft","Latitude":52.47523,"Longitude":1.75167,"Population":70945},{"Name":"Gosport","Latitude":50.79509,"Longitude":-1.12902,"Population":70793},{"Name":"Southall","Latitude":51.50896,"Longitude":-0.3713,"Population":70000},{"Name":"Stafford","Latitude":52.80521,"Longitude":-2.11636,"Population":69217},{"Name":"Royal Tunbridge Wells","Latitude":51.13321,"Longitude":0.26256,"Population":68910},{"Name":"Ellesmere Port","Latitude":53.27875,"Longitude":-2.90134,"Population":67768},{"Name":"Rossendale","Latitude":53.68456,"Longitude":-2.2769,"Population":67400},{"Name":"Folkestone","Latitude":51.08169,"Longitude":1.16734,"Population":66429},{"Name":"Brixton","Latitude":51.46593,"Longitude":-0.10652,"Population":66300},{"Name":"Wrexham","Latitude":53.04664,"Longitude":-2.99132,"Population":65692},{"Name":"Torquay","Latitude":50.46198,"Longitude":-3.52522,"Population":65388},{"Name":"Maidenhead","Latitude":51.52279,"Longitude":-0.71986,"Population":64831},{"Name":"Kingswood","Latitude":51.45278,"Longitude":-2.50833,"Population":64793},{"Name":"Taunton","Latitude":51.01494,"Longitude":-3.10293,"Population":64621},{"Name":"Waterlooville","Latitude":50.88067,"Longitude":-1.0304,"Population":64350},{"Name":"Macclesfield","Latitude":53.26023,"Longitude":-2.12564,"Population":63954},{"Name":"Bognor Regis","Latitude":50.78206,"Longitude":-0.67978,"Population":63885},{"Name":"Newtownabbey","Latitude":54.65983,"Longitude":-5.90858,"Population":63860},{"Name":"Kettering","Latitude":52.39836,"Longitude":-0.72571,"Population":63675},{"Name":"Buckley","Latitude":53.16667,"Longitude":-3.08333,"Population":63576},{"Name":"Great Yarmouth","Latitude":52.60831,"Longitude":1.73052,"Population":63434},{"Name":"Runcorn","Latitude":53.34174,"Longitude":-2.73124,"Population":62872},{"Name":"Ashford","Latitude":51.14648,"Longitude":0.87376,"Population":62787},{"Name":"Tonypandy","Latitude":51.62202,"Longitude":-3.45544,"Population":62545},{"Name":"Scarborough","Latitude":54.27966,"Longitude":-0.40443,"Population":61749},{"Name":"Widnes","Latitude":53.3618,"Longitude":-2.73406,"Population":61464},{"Name":"Aldershot","Latitude":51.24827,"Longitude":-0.76389,"Population":61339},{"Name":"Bury","Latitude":53.6,"Longitude":-2.3,"Population":61044},{"Name":"Barking","Latitude":51.53333,"Longitude":0.08333,"Population":61000},{"Name":"Castleford","Latitude":53.72587,"Longitude":-1.36256,"Population":60509},{"Name":"Hereford","Latitude":52.05684,"Longitude":-2.71482,"Population":60415},{"Name":"Bangor","Latitude":54.65338,"Longitude":-5.66895,"Population":60385},{"Name":"Stroud","Latitude":51.75,"Longitude":-2.2,"Population":60155},{"Name":"Margate","Latitude":51.38132,"Longitude":1.38617,"Population":60134},{"Name":"Chelsea","Latitude":51.48755,"Longitude":-0.16936,"Population":60000},{"Name":"Loughborough","Latitude":52.76667,"Longitude":-1.2,"Population":59932},{"Name":"Welwyn Garden City","Latitude":51.80174,"Longitude":-0.20691,"Population":59910},{"Name":"Farnborough","Latitude":51.29424,"Longitude":-0.75565,"Population":59902},{"Name":"Rhondda","Latitude":51.65896,"Longitude":-3.44885,"Population":59450},{"Name":"Craigavon","Latitude":54.44709,"Longitude":-6.387,"Population":59236},{"Name":"Wallasey","Latitude":53.42324,"Longitude":-3.06497,"Population":58794},{"Name":"Littlehampton","Latitude":50.81137,"Longitude":-0.54078,"Population":58714},{"Name":"Bridgend","Latitude":51.50583,"Longitude":-3.57722,"Population":58380},{"Name":"Bootle","Latitude":53.46667,"Longitude":-3.01667,"Population":57791},{"Name":"Weymouth","Latitude":50.61448,"Longitude":-2.45991,"Population":57691},{"Name":"Fareham","Latitude":50.85162,"Longitude":-1.17929,"Population":57390},{"Name":"Morley","Latitude":53.74013,"Longitude":-1.59877,"Population":57385},{"Name":"Cheshunt","Latitude":51.7002,"Longitude":-0.03026,"Population":57374},{"Name":"Kidderminster","Latitude":52.38819,"Longitude":-2.25,"Population":57059},{"Name":"Corby","Latitude":52.49637,"Longitude":-0.68939,"Population":56810},{"Name":"Dartford","Latitude":51.44657,"Longitude":0.21423,"Population":56694},{"Name":"Castlereagh","Latitude":54.5735,"Longitude":-5.88472,"Population":56679},{"Name":"Dewsbury","Latitude":53.69076,"Longitude":-1.62907,"Population":56640},{"Name":"Livingston","Latitude":55.90288,"Longitude":-3.52261,"Population":56570},{"Name":"Stourbridge","Latitude":52.45608,"Longitude":-2.14317,"Population":56284},{"Name":"Sale","Latitude":53.42519,"Longitude":-2.32443,"Population":55689},{"Name":"Halesowen","Latitude":52.44859,"Longitude":-2.04938,"Population":55265},{"Name":"Canterbury","Latitude":51.27904,"Longitude":1.07992,"Population":55240},{"Name":"South Croydon","Latitude":51.36217,"Longitude":-0.09421,"Population":55198},{"Name":"Huyton","Latitude":53.4115,"Longitude":-2.83935,"Population":54738},{"Name":"Barry","Latitude":51.39979,"Longitude":-3.2838,"Population":54673},{"Name":"Gravesend","Latitude":51.44206,"Longitude":0.37106,"Population":54263},{"Name":"Eastleigh","Latitude":50.96667,"Longitude":-1.35,"Population":54225},{"Name":"Acton","Latitude":51.50901,"Longitude":-0.2762,"Population":53689},{"Name":"Washington","Latitude":54.9,"Longitude":-1.51667,"Population":53526},{"Name":"Braintree","Latitude":51.87819,"Longitude":0.55292,"Population":53477},{"Name":"Hamilton","Latitude":55.76667,"Longitude":-4.03333,"Population":53200},{"Name":"Brentwood","Latitude":51.62127,"Longitude":0.30556,"Population":52586},{"Name":"Esher","Latitude":51.36969,"Longitude":-0.36693,"Population":52392},{"Name":"Crosby","Latitude":53.47778,"Longitude":-3.03333,"Population":52140},{"Name":"Reigate","Latitude":51.23736,"Longitude":-0.20582,"Population":52123},{"Name":"Dunstable","Latitude":51.88571,"Longitude":-0.52288,"Population":51973},{"Name":"Morecambe","Latitude":54.06835,"Longitude":-2.86108,"Population":51644},{"Name":"Cumbernauld","Latitude":55.94685,"Longitude":-3.99051,"Population":51610},{"Name":"Redhill","Latitude":51.24048,"Longitude":-0.17044,"Population":51559},{"Name":"Horsham","Latitude":51.06314,"Longitude":-0.32757,"Population":51472},{"Name":"Staines","Latitude":51.43092,"Longitude":-0.50606,"Population":51040},{"Name":"Batley","Latitude":53.70291,"Longitude":-1.6337,"Population":50807},{"Name":"Wellingborough","Latitude":52.30273,"Longitude":-0.69446,"Population":50577},{"Name":"Clacton-on-Sea","Latitude":51.78967,"Longitude":1.15597,"Population":50548},{"Name":"Dunfermline","Latitude":56.07156,"Longitude":-3.45887,"Population":50380},{"Name":"Bletchley","Latitude":51.99334,"Longitude":-0.73471,"Population":50193},{"Name":"Keighley","Latitude":53.86791,"Longitude":-1.90664,"Population":50171},{"Name":"Hayes","Latitude":51.51579,"Longitude":-0.4234,"Population":50000}];

var icons = {
	'default': {'svg':'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" class="bi bi-geo-alt-fill" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" fill="currentColor" /></svg>'},
	'geo': {'svg':'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" class="bi bi-geo-fill" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4 4a4 4 0 1 1 4.5 3.969V13.5a.5.5 0 0 1-1 0V7.97A4 4 0 0 1 4 3.999zm2.493 8.574a.5.5 0 0 1-.411.575c-.712.118-1.28.295-1.655.493a1.319 1.319 0 0 0-.37.265.301.301 0 0 0-.057.09V14l.002.008a.147.147 0 0 0 .016.033.617.617 0 0 0 .145.15c.165.13.435.27.813.395.751.25 1.82.414 3.024.414s2.273-.163 3.024-.414c.378-.126.648-.265.813-.395a.619.619 0 0 0 .146-.15.148.148 0 0 0 .015-.033L12 14v-.004a.301.301 0 0 0-.057-.09 1.318 1.318 0 0 0-.37-.264c-.376-.198-.943-.375-1.655-.493a.5.5 0 1 1 .164-.986c.77.127 1.452.328 1.957.594C12.5 13 13 13.4 13 14c0 .426-.26.752-.544.977-.29.228-.68.413-1.116.558-.878.293-2.059.465-3.34.465-1.281 0-2.462-.172-3.34-.465-.436-.145-.826-.33-1.116-.558C3.26 14.752 3 14.426 3 14c0-.599.5-1 .961-1.243.505-.266 1.187-.467 1.957-.594a.5.5 0 0 1 .575.411z" fill="currentColor" /></svg>'},
	'geo-alt': {'svg':'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" class="bi bi-geo-alt-fill" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" fill="currentColor" /></svg>'},
	'asterisk': {'anchor':[20,20],'svg':'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" class="bi bi-asterisk" viewBox="0 0 16 16"><path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1z" fill="currentColor" /></svg>'},
	'pin': {'svg':'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" class="bi bi-pin-fill" viewBox="0 0 16 16"><path d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.342 1.174-.646 1.479-.126.125-.25.224-.354.298v4.431l.078.048c.203.127.476.314.751.555C12.36 7.775 13 8.527 13 9.5a.5.5 0 0 1-.5.5h-4v4.5c0 .276-.224 1.5-.5 1.5s-.5-1.224-.5-1.5V10h-4a.5.5 0 0 1-.5-.5c0-.973.64-1.725 1.17-2.189A5.921 5.921 0 0 1 5 6.708V2.277a2.77 2.77 0 0 1-.354-.298C4.342 1.674 4 1.179 4 .5a.5.5 0 0 1 .146-.354z" fill="currentColor" /></svg>'},
	'balloon': {'svg':'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" class="bi bi-balloon-fill" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8.48 10.901C11.211 10.227 13 7.837 13 5A5 5 0 0 0 3 5c0 2.837 1.789 5.227 4.52 5.901l-.244.487a.25.25 0 1 0 .448.224l.04-.08c.009.17.024.315.051.45.068.344.208.622.448 1.102l.013.028c.212.422.182.85.05 1.246-.135.402-.366.751-.534 1.003a.25.25 0 0 0 .416.278l.004-.007c.166-.248.431-.646.588-1.115.16-.479.212-1.051-.076-1.629-.258-.515-.365-.732-.419-1.004a2.376 2.376 0 0 1-.037-.289l.008.017a.25.25 0 1 0 .448-.224l-.244-.487ZM4.352 3.356a4.004 4.004 0 0 1 3.15-2.325C7.774.997 8 1.224 8 1.5c0 .276-.226.496-.498.542-.95.162-1.749.78-2.173 1.617a.595.595 0 0 1-.52.341c-.346 0-.599-.329-.457-.644Z" fill="currentColor" /></svg>'},
	'balloon-heart': {'svg':'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" class="bi bi-balloon-heart-fill" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8.49 10.92C19.412 3.382 11.28-2.387 8 .986 4.719-2.387-3.413 3.382 7.51 10.92l-.234.468a.25.25 0 1 0 .448.224l.04-.08c.009.17.024.315.051.45.068.344.208.622.448 1.102l.013.028c.212.422.182.85.05 1.246-.135.402-.366.751-.534 1.003a.25.25 0 0 0 .416.278l.004-.007c.166-.248.431-.646.588-1.115.16-.479.212-1.051-.076-1.629-.258-.515-.365-.732-.419-1.004a2.376 2.376 0 0 1-.037-.289l.008.017a.25.25 0 1 0 .448-.224l-.235-.468ZM6.726 1.269c-1.167-.61-2.8-.142-3.454 1.135-.237.463-.36 1.08-.202 1.85.055.27.467.197.527-.071.285-1.256 1.177-2.462 2.989-2.528.234-.008.348-.278.14-.386Z" fill="currentColor" /></svg>'},
	'chat-square': {'svg':'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" class="bi bi-chat-square-fill" viewBox="0 0 16 16"><path d="M2 0a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2.5a1 1 0 0 1 .8.4l1.9 2.533a1 1 0 0 0 1.6 0l1.9-2.533a1 1 0 0 1 .8-.4H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" fill="currentColor" /></svg>'},
	'circle': {'svg':'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-circle-fill" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8"/></svg>','size':[20,20],'anchor':[10,10]},
	'pentagon': {'svg':'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pentagon-fill" viewBox="0 0 16 16"><path d="M7.685.256a.5.5 0 0 1 .63 0l7.421 6.03a.5.5 0 0 1 .162.538l-2.788 8.827a.5.5 0 0 1-.476.349H3.366a.5.5 0 0 1-.476-.35L.102 6.825a.5.5 0 0 1 .162-.538l7.42-6.03Z"/></svg>','size': [20,20],'anchor': [10,10]},
	'star': {'svg':'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star-fill" viewBox="0 0 16 16"><path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/></svg>','size': [20,20],'anchor': [10,10]},
}

function clone(a){ return JSON.parse(JSON.stringify(a)); }


// This component uses "/assets/leaflet/leaflet.js" and "/assets/leaflet/leaflet.css" to make things interactive in the browser.
// It will only get included in pages that need it by using the "data-dependencies" attribute.
export function ZoomableMap(opts){

	var fs = 16;

	var config = {
		'scale': 'Viridis',
		'places': [],
		'markers': [],
		'data-type': 'zoomable-map',
		'attribution': '',
		'tileLayer': {
			'url': 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
			'maxZoom': 19,
			'attribution': "Tiles: &copy; OpenStreetMap/CartoDB",
			'subdomains': "abcd"
		},
		'labelLayer': {
			'url': 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
			'attribution': "",
			'pane': "labels"
		}
	}
	mergeDeep(config,opts);
	
	var cs = ColourScale(config.scale);

	if(opts.data){

		var csv = clone(opts.data);

		// Work out default max/min from data
		var min = 1e100;
		var max = -1e100;
		
		if(config.value){
			for(var i = 0; i < csv.length; i++){
				if(csv[i][config.value] && typeof csv[i][config.value]==="number"){
					min = Math.min(min,csv[i][config.value]);
					max = Math.max(max,csv[i][config.value]);
				}
			}
		}

		// Override defaults if set
		if(typeof config.min=="number") min = config.min;
		if(typeof config.max=="number") max = config.max;

		config.max = max;
		config.min = min;

		var v,i;
		// Update the colours for the CSV rows
		for(i = 0; i < csv.length; i++){
			if(config.value && csv[i][config.value]){
				v = csv[i][config.value];
				if(typeof v==="number") csv[i].colour = cs((csv[i][config.value]-config.min)/(config.max-config.min));
			}
			// Set a default colour if we don't have one
			if(csv[i].colour === undefined) csv[i].colour = defaultbg;
		}
		

	}

	this.getHTML = function(){
		var html,i,r,file;

		html = ['<div class="oi-map oi-zoomable-map" data-dependencies="/assets/leaflet/leaflet.js,/assets/leaflet/leaflet.css,/assets/js/tooltip.js">'];
		
		html.push('<script>');
		html.push('(function(root){');
		html.push('	var p = document.currentScript.parentNode;');
		html.push('	var el = document.createElement("div");');
		html.push('	el.classList.add("leaflet");');
		html.push('	p.appendChild(el);');
		html.push('	var map = L.map(el);');

		// Store the map in an array for the page
		html.push('	if(!root.OI) root.OI = {};\n');
		html.push('	if(!root.OI.maps) root.OI.maps = [];\n');
		
		html.push('	var id = root.OI.maps.length;\n');
		html.push('	root.OI.maps.push({"map":map});\n');

		if(config.bounds){
			// Create the bounds object required by Leaflet
			var bstr = '[['+config.bounds.lat.min+','+config.bounds.lon.min+'],['+config.bounds.lat.max+','+config.bounds.lon.max+']]';
			html.push(' OI.maps[id].bounds = '+bstr+';\n');
			html.push('	map.fitBounds('+bstr+');\n');
		}
		
		if(config.background){
			var colour = Colour(config.background.colour||"#fafaf8");
			html.push(' var bggeo = '+JSON.stringify(config.background.data)+';\n');
			html.push('	var bg = L.geoJSON(bggeo,{"style":{"color":"'+colour.hex+'","weight":0,"fillOpacity":1}});\n');
			html.push('	bg.addTo(map);\n');
		}else{
			html.push('	L.tileLayer("'+config.tileLayer.url+'", '+JSON.stringify(config.tileLayer)+').addTo(map);\n');
		}

		html.push('	map.attributionControl.setPrefix("'+config.attribution+'");\n');

		if(config.data){
			html.push('	var csv = '+JSON.stringify(csv)+';\n');
			html.push('	var key = "'+config.key+'";\n');
		}
		html.push('	var toolkey = "'+config.tooltip+'";\n');
		
		let bounds = {};

		// Add the GeoJSON
		if(config.geojson){
			html.push('	var geojson = '+JSON.stringify(config.geojson.data)+';\n');
			html.push('	var geokey = "'+config.geojson.key+'";\n');
			// A function to style each GeoJSON feature
			html.push('	function style(feature){\n');
			html.push('		var d = getData(feature.properties[geokey]);\n');
			html.push('		return {\n');
			html.push('			weight: 0.5,\n');
			html.push('			opacity: 0.5,\n');
			html.push('			color: "#ffffff",\n');
			html.push('			fillOpacity: 1,\n');
			html.push('			fillColor: d.colour||"transparent"\n');
			html.push('		};\n');
			html.push('	}\n');

			// A function to return the row for a given key
			html.push('	function getData(k){\n');
			if(config.data){
				html.push('		for(var i = 0; i < csv.length; i++){\n');
				html.push('			if(csv[i][key] == k) return csv[i];\n');
				html.push('		}\n');
			}
			html.push('		return {};\n');
			html.push('	}\n');

			// Add the GeoJSON to the map
			html.push('	var geoattrs = { "style": style };\n');
			html.push('	geoattrs.onEachFeature = function(feature, layer){\n');
			html.push('		var d = getData(feature.properties[geokey]);\n');
			html.push('		layer.bindPopup(d["Label"]||d[toolkey]||feature.properties[geokey]).on("popupopen",function(ev){\n');
			html.push('			var ps = ev.popup._container;\n');
			// Set the background colour of the popup
			html.push('			ps.querySelector(".leaflet-popup-content-wrapper").style["background-color"] = d.colour;\n');
			html.push('			ps.querySelector(".leaflet-popup-tip").style["background-color"] = d.colour;\n');
			// Set the text colour of the popup
			html.push('			ps.querySelector(".leaflet-popup-content-wrapper").style["color"] = OI.contrastColour(d.colour);\n');
			html.push('			ps.style["color"] = OI.contrastColour(d.colour);\n');
			html.push('		});\n');
			html.push('	};\n');
						
			html.push('	var geo = L.geoJSON(geojson,geoattrs);\n');
			html.push('	geo.addTo(map);\n');

			html.push('	OI.maps[id].bounds = geo.getBounds();\n');
			if(!config.bounds) html.push('	map.fitBounds(geo.getBounds());\n');
		}else{
			html.push('	map.setView([0, 0], 2);\n');
		}

		if(config.markers && config.markers.length > 0){
			var icon;
			for(var m = 0; m < config.markers.length; m++){
				icon;
				if(typeof config.markers[m].icon==="undefined") config.markers[m].icon = "default";
				if(icons[config.markers[m].icon]) icon = clone(icons[config.markers[m].icon]);
				else{ icon = config.markers[m].icon; }
				if(!icon.svg){
					throw("No SVG within marker "+m);
				}
				if(!icon.size) icon.size = [40,40];
				if(!icon.anchor) icon.anchor = [20,0];
				if(icon.svg){
					// Clean up tags to make sure we have explicit closing tags
					icon.svg = icon.svg.replace(/<([^\s]+)\s([^\>]+)\s*\/\s*>/g,function(m,p1,p2){ return "<"+p1+" "+p2+"></"+p1+">"});
				}else{
					icon.svg = '?';
				}
				icon.color = 'black';
				if(config.markers[m].color) icon.color = config.markers[m].color;
				if(config.markers[m].colour) icon.color = config.markers[m].colour;

				icon.bgPos = [icon.anchor[0],icon.size[1]-icon.anchor[1]];
				icon.html = '<div style="color:'+icon.color+'">'+icon.svg+'</div>';
				delete config.markers[m].svg;
				config.markers[m].icon = icon;
			}
			html.push('	var markers = '+JSON.stringify(config.markers)+';\n');
			html.push('	var mark;\n');
			html.push('	for(var m = 0; m < markers.length; m++){\n');
			html.push('		icon = L.divIcon({"html":markers[m].icon.html,"iconSize":markers[m].icon.size,"iconAnchor":markers[m].icon.bgPos});\n');
			html.push('		mark = L.marker([markers[m].latitude,markers[m].longitude], {icon: icon})\n');
			html.push('		mark.addTo(map);\n');
			html.push('		if(markers[m].tooltip) mark.bindPopup(markers[m].tooltip,{"className":"popup"});\n');
			html.push('	}\n');
			html.push('	function wrap(el,colour) { const wrappingElement = document.createElement("div"); el.replaceWith(wrappingElement); wrappingElement.appendChild(el); }');

			html.push('	map.on("popupopen", function (e) {\n');
			html.push('		var colour = "";\n');
			html.push('		if(e.popup._source._path){\n');
			html.push('			colour = window.getComputedStyle(e.popup._source._path).fill;\n');
			html.push('		}else{\n');
			html.push('			colour = window.getComputedStyle(e.popup._source._icon.querySelector("div")).color;\n');
			html.push('		}\n');
			html.push('		el = e.popup._container;\n');
			html.push('		var style = "background-color:"+colour+"!important;color:"+OI.contrastColour(colour)+"!important;";\n');
			html.push('		el.querySelector(".leaflet-popup-content-wrapper").setAttribute("style",style);\n');
			html.push('		el.querySelector(".leaflet-popup-tip").setAttribute("style",style);\n');
			html.push('		el.querySelector(".leaflet-popup-close-button").setAttribute("style",style);\n');
			html.push('	})\n');
		}

		if(config.legend){
			config.legend = mergeDeep({'position':'bottom right'},config.legend);
			var legend = new Legend(config);

			// Create the legend and add it to the map
			html.push('	var legend = L.control({position: "'+((config.legend.position).replace(/ /g,""))+'"});\n');
			html.push('	legend.onAdd = function (map){\n');
			html.push('		var div = L.DomUtil.create("div", "info oi-legend");\n');
			html.push('		div.innerHTML = \''+legend.inner("html")+'\';\n');
			html.push('		return div;\n');
			html.push('	}\n');
			html.push('	legend.addTo(map);\n');
		}

		if(config.places){
			for(var i = 0; i < config.places.length; i++){
				var place = -1;
				for(var p = 0; p < places.length; p++){
					if(places[p].Name==config.places[i].name){
						place = p;
						continue;
					}
				}
				var f = fs*0.75;
				if(place >= 0){
					var p = clone(places[place]);
					if(typeof config.places[i].latitude!=="number") config.places[i].latitude = p.Latitude
					if(typeof config.places[i].longitude!=="number") config.places[i].longitude = p.Longitude
					if(p.Population){
						if(p.Population > 100000) f += fs*0.125;
						if(p.Population > 250000) f += fs*0.125;
						if(p.Population > 750000) config.places[i].name = config.places[i].name.toUpperCase();
					}
				}
				config.places[i] = mergeDeep({'font-size':f,'font-weight':'bold','font-family':'Poppins,CenturyGothicStd,Arial','colour':'black','border':'white'},config.places[i]);
				if(typeof config.places[i].latitude==="number" && typeof config.places[i].longitude==="number"){
					html.push('	new L.Marker(['+config.places[i].latitude+', '+config.places[i].longitude+'], { icon: new L.DivIcon({className: "place-name", html: "<svg xmlns=\'http://www.w3.org/2000/svg\' version=\'1.1\' preserveAspectRatio=\'xMidYMin meet\' overflow=\'visible\'><text fill=\''+config.places[i]['colour']+'\' stroke=\''+config.places[i]['border']+'\' stroke-width=\'7%\' paint-order=\'stroke\'><tspan style=\'font-size:'+(config.places[i]['font-size'])+'px;font-weight:'+config.places[i]['font-weight']+';font-family:'+config.places[i]['font-family']+';\'>'+(config.places[i].name||"")+'</tspan></text></svg>"}) }).addTo(map);\n');
				}
			}
			html.push('	function fitSvgTextElements() {\n');
			html.push('		const elements = document.querySelectorAll(".place-name svg");\n');
			html.push('		for( const el of elements ) {\n');
			html.push('			const box = el.querySelector("text").getBBox();\n');
			html.push('			el.setAttribute("viewBox", `${box.x} ${box.y} ${box.width} ${box.height}`);\n');
			html.push('			el.setAttribute("width", box.width);\n');
			html.push('		}\n');
			html.push('	}\n');
			html.push('	fitSvgTextElements();\n');
		}else{
			// Create a map label pane so labels can sit above polygons
			html.push('	map.createPane("labels");\n');
			html.push('	map.getPane("labels").style.zIndex = 650;\n');
			html.push('	map.getPane("labels").style.pointerEvents = "none";\n');
			html.push('	L.tileLayer("'+config.labelLayer.url+'", '+JSON.stringify(config.labelLayer)+').addTo(map);\n');
		}

		html.push('})(window || this);\n');
		html.push('</script>\n');

		html.push('</div>\n');

		return html.join('');
	};
	return this;
}


function loadFromSources(path,sources){

	var name,bits,data;
	name = path.replace(/\//g, '.').replace(/^.*data/, 'sources').replace(/\.[^\.]*$/, '');
	bits = name.split(".");
	data = {};
	if(bits[0]=="sources"){
		data = clone(sources);
		for(var b = 1; b < bits.length; b++){
			if(data[bits[b]]) data = data[bits[b]];
			else return {};
		}
	}
	return data;
}


// This component uses "/assets/js/svg-map.js" to make things interactive in the browser.
// That will only get included in pages that need it by using the "data-dependencies" attribute.
export function SVGMap(opts){
	
	var csv = clone(opts.data);
	var fs = 16;

	var config = {
		'scale': 'Viridis',
		'places': [],
		'markers': [],
		'data-type':'svg-map'
	}
	mergeDeep(config,opts);
	
	let geo = config.geojson.data;

	var cs = ColourScale(config.scale);

	// Work out default max/min from data
	var min = 1e100;
	var max = -1e100;
	
	if(config.value){
		for(var i = 0; i < csv.length; i++){
			if(csv[i][config.value] && typeof csv[i][config.value]==="number"){
				min = Math.min(min,csv[i][config.value]);
				max = Math.max(max,csv[i][config.value]);
			}
		}
	}

	// Override defaults if set
	if(typeof config.min=="number") min = config.min;
	if(typeof config.max=="number") max = config.max;

	config.max = max;
	config.min = min;
	var layerlist = [];
	
	if(config.background){
		var colour = Colour(config.background.colour||"#fafaf8");
		layerlist.push({
			'id': 'background',
			'data': config.background.data,
			'options': { 'color': colour.hex }
		})
	}
	layerlist.push({
		'id': 'data-layer',
		'data': geo,
		'options': { 'color': '#b2b2b2' },
		'values': { 'key': config.key, 'geokey': config.geojson.key, 'value': config.value, 'label':config.tooltip, 'min':min, 'max': max, 'data': csv, 'colour': 'red' },
		'style': function(feature,el){
			var v,code,r,i,title,colour,row;
			v = this.attr.values;
			code = feature.properties[v.geokey];

			row = {};
			for(var i = 0; i < v.data.length; i++){
				if(v.data[i][v.key] == code) row = v.data[i];
			}
			
			// Add a colour-scale colour to each row based on the "value" column
			if(v.value && typeof row[v.value]==="number"){
				row.colour = cs((row[v.value]-v.min)/(v.max-v.min));
			}
			// Set a default colour if we don't have one
			if(row.colour === undefined) row.colour = defaultbg;

			if(row){
				if(v.label && row[v.label]){
					// Add a text label 
					title = document.createElement('title');
					title.innerHTML = row[v.label];
					el.appendChild(title);
				}
				el.setAttribute('fill-opacity',1);
				el.setAttribute('fill',row.colour);
				el.setAttribute('stroke','white');
				el.setAttribute('stroke-width',2);
				el.setAttribute('stroke-opacity',0.1);
			}else{
				el.setAttribute('style','display:none');
			}
		}
	});
	layerlist.push({
		'id': 'labels',
		'options': { 'fill': '#4c5862', 'stroke': 'white', 'stroke-width': '0.7%', 'stroke-linejoin': 'round'	},
		'type': 'text',
		'values': {'data':clone(places),'places':config.places},
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
			this.data = {'type':'FeatureCollection','features':locations};
		}
	});

	// Add a "markers" layer if needed
	if(config.markers.length > 0){
		layerlist.push({
			'id': 'markers',
			'options': { 'fill': '#4c5862', 'stroke': 'white', 'stroke-width': '0.7%', 'stroke-linejoin': 'round'	},
			'type': 'text',
			'values': {'markers':config.markers},
			'process': function(d,map){
				var i,c,pin,markers = [];

				for(i = 0; i < this.attr.values.markers.length; i++){
					if(typeof this.attr.values.markers[i].longitude==="number" && typeof this.attr.values.markers[i].latitude==="number"){
						pin = {'type':'Feature','properties':this.attr.values.markers[i],'style':{},'geometry':{'type':'Point','coordinates':[this.attr.values.markers[i].longitude,this.attr.values.markers[i].latitude]}};
						markers.push(pin);
					}
				}
				this.data = {'type':'FeatureCollection','features':markers};
			}
		});
	}

	var map = new BasicMap(config,{
		'background': 'transparent',
		'layers': layerlist,
		'complete': function(){
			if(config.bounds){
				if(typeof config.bounds==="string") return this.zoomToData(config.bounds);
				else if(config.bounds.lat && config.bounds.lon) return this.setBounds(new BBox(config.bounds.lat,config.bounds.lon));
			}
			if(this.getLayerPos('data-layer') >= 0) this.zoomToData('data-layer');
			else this.zoomToData('background');
		}
	});

	return map;

}


function BasicMap(config,attr){
	if(!attr) attr = {};
	var el = document.createElement('div');
	this.container = el;
	el.innerHTML = "";
	setAttr(this.container,{'style':'overflow:hidden'});

	var o = {'width':1200,'height':675};
	this.w = (attr.w || o.width);
	this.h = (attr.h || o.height);
	this.attr = attr;

	// Add the SVG
	this.svg = svgEl('svg');
	setAttr(this.svg,{'class':'oi-map-inner','xmlns':'http://www.w3.org/2000/svg','version':'1.1','width':this.w,'height':this.h,'viewBox':'-180 0 360 180','overflow':'hidden','style':'max-width:100%;max-height:100%;height:auto;background:'+(attr.background||"white")+';aspect-ratio:'+this.w+' / '+this.h+';','preserveAspectRatio':'xMidYMin meet'});
	if(config['data-type']) setAttr(this.svg,{'data-type':config['data-type']});
	el.appendChild(this.svg);

	this.layers = [];
	this.zoom = 12;
	this.bounds = new BBox();
	this.places = (attr.places||[]);
	this.place = (attr.place||"");

	this.getHTML = function(){
		var html = ['<div class="oi-map oi-svg-map" data-dependencies="/assets/js/svg-map.js,/assets/js/tooltip.js">'];

		html.push(this.svg.outerHTML);

		// Create the legend
		if(config.legend) html.push((new Legend(config)).outer("html"));

		html.push('</div>\n');

		return html.join('');
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
	this.setBounds = function(bbox){
		this.bounds = bbox;
		var tileBox = bbox.asTile(this.zoom);

		// Set the view box
		setAttr(this.svg,{'viewBox': (tileBox.x.min)+' '+(tileBox.y.max)+' '+(tileBox.x.range)+' '+(tileBox.y.range)});

		// Scale text labels
		var tspans = this.svg.querySelectorAll('tspan');
		var svgLabels = this.svg.querySelectorAll('text');
		if(svgLabels.length > 0){
			var pc = 100;
			pc = 100*(tileBox.x.range > tileBox.y.range ? tileBox.x.range/this.w : tileBox.y.range/this.h);
			var i;
			for(i = 0; i < tspans.length; i++){
				tspans[i].setAttribute('style','font-size:'+pc.toFixed(3)+'%;');
			}
		}

		return this;
	};

	this.getBounds = function(){ return this.bounds; };

	this.clear = function(){
		// TODO: clear SVG
		this.layers = [];
		return this;
	};

	this.zoomToData = function(id){

		// Get bounding box range from all layers
		var bbox = new BBox();
		for(var l = 0; l < this.layers.length; l++){
			if(this.layers[l].bbox){
				if(!id || id == this.layers[l].id){
					bbox.expand(this.layers[l].bbox);
				}
			}
		}
		return this.setBounds(bbox);
	};

	if(attr.layers) this.addLayers(attr.layers,attr.complete);

	return this;

}

function Layer(attr,map,i){
	if(!attr.id){
		console.error('Layer does not have an ID set');
		return {};
	}
	this.id = attr.id;

	if(typeof attr.data==="string"){
		this._url = attr.data;
		this.data = null;
	}else{
		this.data = attr.data||{};
	}
	this.attr = (attr || {});
	this.options = (this.attr.options || {});
	if(!this.options.fillOpacity) this.options.fillOpacity = 1;
	if(!this.options.opacity) this.options.opacity = 1;
	if(!this.options.color) this.options.color = '#000000';
	if(typeof this.options.useforboundscalc==="undefined") this.options.useforboundscalc = true;

	var g = svgEl('g');
	var gs;
	setAttr(g,{'class':this.class||this.id});

	if(map && map.svg){
		if(typeof i==="number"){
			gs = map.svg.querySelectorAll('g');
			gs[i].insertAdjacentElement('beforebegin', g);
		}else{
			map.svg.appendChild(g);
		}
	}

	this.clear = function(){ g.innerHTML = ''; return this; };

	function addToPath(path,xy){
		xy = {'x':xy.x.toFixed(2),'y':xy.y.toFixed(2),'t':xy.t};
		if(path.length == 0) path.push(xy);
		else{
			if(path[path.length-1].x!=xy.x || path[path.length-1].y!=xy.y || path[path.length-1].t!=xy.t) path.push(xy); 
		}
		return path;
	}
	function formatPath(path){
		var p = "";
		var t = "";
		for(var i = 0; i < path.length; i++){
			if(path[i].t!=t) p += path[i].t;
			else p += ', ';
			p += path[i].x+' '+path[i].y;
		}
		return p+'Z';
	}

	// Function to draw it on the map
	this.update = function(){
		// Clear existing layer
		this.clear();
		// Find the map bounds and work out the scale
		var f,i,j,k,dlat,dlon,feature,w,h,b,p,c,d,xy,tspan,path;
		w = map.w;
		h = map.h;
		b = map.getBounds();
		dlat = (b.lat.max - b.lat.min);
		dlon = (b.lon.max - b.lon.min);
		this.bbox = new BBox();
		
		if(this.data && this.data.features){

			for(f = 0; f < this.data.features.length; f++){
				if(this.data.features[f]){
					feature = this.data.features[f];
					c = feature.geometry.coordinates;

					if(feature.geometry.type == "MultiPolygon"){
						p = svgEl('path');
						setAttr(p,{
							'stroke': this.options.color||this.options.stroke,
							'stroke-opacity':this.options.opacity,
							'stroke-width': this.options['stroke-width']
						});
						path = [];
						for(i = 0; i < c.length; i++){
							for(j = 0; j < c[i].length; j++){
								for(k = 0; k < c[i][j].length; k++){
									this.bbox.expand(c[i][j][k]);
									xy = latlon2xy(c[i][j][k][1],c[i][j][k][0],map.zoom);
									xy.t = (k==0 ? 'M':'L');
									addToPath(path,xy);
								}
							}
						}
						d = formatPath(path);
						setAttr(p,{
							'd':d,
							'fill': this.options.color||this.options.fill,
							'fill-opacity': this.options.fillOpacity,
							'vector-effect':'non-scaling-stroke',
							'stroke': this.options.stroke||this.options.color,
							'stroke-width': this.options['stroke-width']||'0.4%',
							'stroke-opacity': this.options['stroke-opacity']||1
						});
						if(typeof attr.style==="function") attr.style.call(this,feature,p);
					}else if(feature.geometry.type == "Polygon"){
						p = svgEl('path');
						setAttr(p,{
							'stroke': this.options.color||this.options.stroke,
							'stroke-opacity':this.options.opacity,
							'stroke-width': this.options['stroke-width']
						});
						path = [];
						for(i = 0; i < c.length; i++){
							for(j = 0; j < c[i].length; j++){
								this.bbox.expand(c[i][j]);
								xy = latlon2xy(c[i][j][1],c[i][j][0],map.zoom);
								xy.t = (j==0 ? 'M':'L');
								addToPath(path,xy);
							}
						}
						d = formatPath(path);
						setAttr(p,{
							'd':d,
							'fill': this.options.color||this.options.fill,
							'fill-opacity': this.options.fillOpacity,
							'vector-effect':'non-scaling-stroke',
							'stroke': this.options.stroke||this.options.color,
							'stroke-width': this.options['stroke-width']||'0.4%',
							'stroke-opacity': this.options['stroke-opacity']||1
						});
						if(typeof attr.style==="function") attr.style.call(this,feature,p);
					}else if(feature.geometry.type == "MultiLineString"){
						p = svgEl('path');
						setAttr(p,{
							'stroke': this.options.color||this.options.stroke,
							'stroke-opacity':this.options.opacity,
							'stroke-width': this.options['stroke-width']
						});
						path = [];
						for(i = 0; i < c.length; i++){
							for(j = 0; j < c[i].length; j++){
								this.bbox.expand(c[i][j]);
								xy = latlon2xy(c[i][j][1],c[i][j][0],map.zoom);
								xy.t = (j==0 ? 'M':'L');
								addToPath(path,xy);
								//lat = (90 - c[i][j][1]).toFixed(5);
								//lon = (c[i][j][0]).toFixed(5);
								//if(j==0) d += 'M'+xy.x.toFixed(2)+' '+xy.y.toFixed(2);
								//else d += (j==1 ? 'L':', ')+xy.x.toFixed(2)+' '+xy.y.toFixed(2);
							}
						}
						d = formatPath(path);
						setAttr(p,{
							'd':d,
							'fill':'transparent',
							'vector-effect':'non-scaling-stroke'
						});
						if(typeof attr.style==="function") attr.style.call(this,feature,p);
					}else if(feature.geometry.type == "Point"){

						this.bbox.expand(c);
						xy = latlon2xy(c[1],c[0],map.zoom);

						var opt = {};

						// If there is no icon and no name label, create a default icon
						if(!feature.properties.icon && !feature.name) feature.properties.icon = "default";

						if(feature.properties.icon){
							var icon = {'size':[40,40]};

							if(typeof feature.properties.icon==="string"){
								if(!icons[feature.properties.icon]){
									throw("No icon known with name \""+feature.properties.icon+"\"");
									return;
								}
								icon = mergeDeep(icon,icons[feature.properties.icon]);
							}else{
								icon = mergeDeep(icon,feature.properties.icon);
							}

							if(!icon.svg){
								throw("No SVG provided for icon");
								return;
							}
							// Set default anchor position
							if(!icon.anchor) icon.anchor = [icon.size[0]/2,0];
							var txt = icon.svg;
							var style = {'icon':icon,'color':'black'};
							if(feature.properties.colour) style.color = feature.properties.colour;
							mergeDeep(style,feature.properties);

							if(txt){
								// We want to get the contents of the SVG and the attributes
								txt = txt.replace(/<svg([^>]*)>/,function(m,attrs){
									attrs.replace(/([^\s]+)\=[\"\']([^\"\']+)[\"\']/g,function(m,key,value){
										opt[key] = value;
										return "";
									})
									return "";
								}).replace(/<\/svg>/,"");

								// Clean up tags to make sure we have explicit closing tags
								txt = txt.replace(/<([^\s]+)\s([^\>]+)\s*\/\s*>/g,function(m,p1,p2){ return "<"+p1+" "+p2+"></"+p1+">"});

								var tileBox = map.bounds.asTile(map.zoom);
								var scale = Math.max(tileBox.x.range/map.w,tileBox.y.range/map.h);

								p = svgEl('svg');
								p.setAttribute('vector-effect','non-scaling-stroke');
								p.innerHTML = txt;
								mergeDeep(opt,{
									'viewBox': '0 0 16 16',
									// Shift the x/y values to adjust for iconAnchor and iconSize
									'x': (xy.x + (-(icon.size[0] - icon.anchor[0])*scale)).toFixed(2),
									'y': (xy.y + (-(icon.size[1] - icon.anchor[1])*scale)).toFixed(2)
								});
								setAttr(p,opt);
								p.setAttribute('width',icon.size[0]*scale);
								p.setAttribute('height',icon.size[1]*scale);

								// Add title to the SVG
								if(feature.properties.tooltip){
									var t = svgEl('title');
									t.innerHTML = feature.properties.tooltip;
									p.appendChild(t);
									p.classList.add('marker');
								}
							}else{
								console.error(feature);
								throw('Bad icon');
							}
							if(p){
								if(typeof attr.style==="function") attr.style.call(this,feature,p);
								p.setAttribute('style','color:'+(style.color)+';');
							}

						}else{
							p = svgEl('text');
							tspan = svgEl('tspan');
							tspan.innerHTML = feature.name;
							p.appendChild(tspan);
							mergeDeep(opt,{
								'fill': feature.style['colour']||this.options.fill||this.options.color,
								'fill-opacity': this.options.fillOpacity,
								'font-weight': feature.style['font-weight']||this.options['font-weight']||'',
								'stroke': feature.style['border']||this.options.stroke||this.options.color,
								'stroke-width': this.options['stroke-width']||'0.4%',
								'stroke-linejoin': this.options['stroke-linejoin'],
								'text-anchor': feature.style['text-anchor']||this.options.textAnchor||'middle',
								'font-family': feature.style['font-family']||'Poppins,CenturyGothicStd,Arial',
								'font-size': (feature.style['font-size'] ? feature.style['font-size'] : 1),
								'paint-order': 'stroke',
								'x': xy.x.toFixed(2),
								'y': xy.y.toFixed(2)
							});
							setAttr(p,opt);

							if(p && typeof attr.style==="function") attr.style.call(this,feature,p);
						}
					}
					if(p) g.appendChild(p);
				}
			}
		}else{
			console.warn('No data features',this.data);
		}
		return this;
	};
	
	this.load = function(){
		if(!this.data){
			console.error('No data structure given',this);
		}else{
			if(typeof attr.process==="function") attr.process.call(this,this.data||{},map);
			this.update();
			// Final callback
			if(typeof attr.callback==="function") attr.callback.call(map);
		}
	};

	return this;
}

function BBox(lat,lon){
	this.lat = lat||{'min':90,'max':-90};
	this.lon = lon||{'max':-180,'min':180};
	this.expand = function(c){
		if(c.length == 2){
			this.lat.max = Math.max(this.lat.max,c[1]);
			this.lat.min = Math.min(this.lat.min,c[1]);
			this.lon.max = Math.max(this.lon.max,c[0]);
			this.lon.min = Math.min(this.lon.min,c[0]);
		}else if(c.lat && c.lon){
			this.lat.max = Math.max(this.lat.max,c.lat.max);
			this.lat.min = Math.min(this.lat.min,c.lat.min);
			this.lon.max = Math.max(this.lon.max,c.lon.max);
			this.lon.min = Math.min(this.lon.min,c.lon.min);
		}else{
			console.warn('updateBBox wrong shape',c);
		}
		return this;
	};
	this.asTile = function(zoom){
		var x = {'min':lon2tile(this.lon.min,zoom),'max':lon2tile(this.lon.max,zoom)};
		var y = {'min':lat2tile(this.lat.min,zoom),'max':lat2tile(this.lat.max,zoom)};
		x.range = Math.abs(x.max-x.min);
		y.range = Math.abs(y.max-y.min);
		return {'x':x,'y':y };
	};
	return this;
}

function add(el,to){ return to.appendChild(el); }
function setAttr(el,prop){
	for(var p in prop){
		if(prop[p]) el.setAttribute(p,prop[p]);
	}
	return el;
}
function svgEl(t){ return document.createElement(t);/*return document.createElementNS(ns,t);*/ }

// Map maths for the Web Mercator projection (like Open Street Map) e.g. https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
var d2r = Math.PI/180;
function lon2tile(lon,zoom){ return ((lon+180)/360)*Math.pow(2,zoom); }
function lat2tile(lat,zoom){ return ((1-Math.log(Math.tan(lat*d2r) + 1/Math.cos(lat*d2r))/Math.PI)/2)*Math.pow(2,zoom); }
function latlon2xy(lat,lon,zoom){ return {'x':lon2tile(lon,zoom),'y':lat2tile(lat,zoom)}; }

