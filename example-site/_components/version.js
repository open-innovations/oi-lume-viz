export default function ({version,package_version}) {
	if(typeof version==="undefined") return "";
	let i,v,p,live = true;
	v = version.split(/\./);
	p = package_version.split(/\./);
	for(i=0;i<v.length;i++) v[i] = parseInt(v[i]);
	for(i=0;i<p.length;i++) p[i] = parseInt(p[i]);
	if(v[0]>p[0]) live = false;
	else if(v[0]==p[0]){
		if(v[1]>p[1]) live = false;
		else if(v[1]==p[1]){
			if(v[2]>p[2]) live = false;
		}
	}
	let str = "Coming in";
	if(live) str = "Since";
	return ' <span class="version">' + str + ' ' + version + '</span>';
}
