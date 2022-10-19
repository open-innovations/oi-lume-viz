import { dashboard, DashboardOptions } from '../lib/dashboard.ts';

export const css = `
.dashboard {
	--auto-dashboard-min-size: 200px;
	width: 100%;
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--auto-dashboard-min-size)), 1fr));
	grid-gap: 1em;
}
.dashboard .panel h3 { color: inherit!important; font-weight: normal; font-size: 1em; }
.panel { background: #efefef; padding: 1em; }
.dashboard .bignum { font-size: 4em; line-height: 1.25em; font-weight: bold; text-align: center; display: block; margin-top: 0; }
.dashboard .footnote { font-size: 0.7em; text-align: center; display: block; }
@media screen and (max-width: 1200px) {
	.dashboard { grid-gap: 1.5vw; }
	.dashboard .panel { font-size: max(10px, 1.5vw); }
	.dashboard .footnote { font-size: max(10px, 0.7em); }
}
`;

export default function (config: DashboardOptions) {
  if (!config.data) throw "No data source provided";
  const html = dashboard(config);
  return html;
}