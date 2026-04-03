// Last updated: April 2026 — 108 companies, 16 portals

export interface Company {
  name: string;
  sector: string;
  url: string;
  howToApply: string;
  logo: string;
}

export interface Portal {
  name: string;
  desc: string;
  url: string;
  tip: string;
  niche?: boolean;
}

export const COMPANIES: Company[] = [
  // ── Banking ──────────────────────────────────────────────────────────────
  { name: 'AIB', sector: 'Banking', url: 'https://jobs.aib.ie/aib/go/Graduate/9605400/', howToApply: 'Apply online on the AIB careers site → "Graduate" → choose a programme and submit application.', logo: '🏦' },
  { name: 'Bank of Ireland', sector: 'Banking', url: 'https://careers.bankofireland.com/graduates', howToApply: 'Apply via Bank of Ireland careers → Graduates → pick programme. Sign up for 2027 alerts if 2026 is closed.', logo: '🏦' },
  { name: 'Central Bank of Ireland', sector: 'Banking', url: 'https://www.centralbank.ie/careers/graduate-entry-level-candidates', howToApply: '3-year Graduate Programme. Online application + assessments. Applications open April 2026.', logo: '🏛️' },
  { name: 'Permanent TSB', sector: 'Banking', url: 'https://www.permanenttsb.ie/about-us/careers/', howToApply: 'Apply via PTSB careers portal. Graduate programme in banking and financial services.', logo: '🏦' },
  { name: 'Ulster Bank', sector: 'Banking', url: 'https://jobs.ulsterbank.ie/', howToApply: 'Apply via Ulster Bank careers. Graduate roles in Dublin and Belfast.', logo: '🏦' },

  // ── Professional Services ─────────────────────────────────────────────────
  { name: 'Deloitte Ireland', sector: 'Professional Services', url: 'https://www.deloitte.com/ie/en/careers/explore-your-fit/early-careers.html', howToApply: 'Apply via Deloitte jobs site. Follow their graduate application steps — Future Leaders Academy 2026.', logo: '💼' },
  { name: 'KPMG Ireland', sector: 'Professional Services', url: 'https://kpmg.com/ie/en/careers/graduate.html', howToApply: 'Apply online via KPMG Graduate/Student pages. 400+ grads hired annually across multiple streams.', logo: '💼' },
  { name: 'PwC Ireland', sector: 'Professional Services', url: 'https://www.pwc.ie/careers-ie/graduate-programme.html', howToApply: "Apply through PwC students site. Check graduate programme listing and timelines — Ireland's largest accounting firm.", logo: '💼' },
  { name: 'EY Ireland', sector: 'Professional Services', url: 'https://www.ey.com/en_ie/careers/what-you-can-do-here/student-programmes', howToApply: 'Apply via EY "Apply Now" and filter for Ireland. Graduate Programme 2026 listed across multiple streams.', logo: '💼' },
  { name: 'BDO Ireland', sector: 'Professional Services', url: 'https://www.bdo.ie/en-gb/careers/early-careers', howToApply: 'Apply via BDO careers → Graduate Programme / internships → submit application online.', logo: '💼' },
  { name: 'RSM Ireland', sector: 'Professional Services', url: 'https://www.rsm.global/ireland/careers', howToApply: 'Apply using the "Apply" page for the RSM graduate programme online.', logo: '💼' },
  { name: 'Forvis Mazars Ireland', sector: 'Professional Services', url: 'https://www.forvismazars.com/ie/en/careers', howToApply: 'Apply via their graduate programme / internships pages. Openings vary by intake.', logo: '💼' },
  { name: 'Accenture Ireland', sector: 'Professional Services', url: 'https://www.accenture.com/ie-en/careers/life-at-accenture/entry-level', howToApply: '2026/27 graduate programme applications open. AI, data analytics, cloud, strategy roles. Apply via Accenture careers.', logo: '💼' },
  { name: 'Grant Thornton Ireland', sector: 'Professional Services', url: 'https://www.grantthornton.ie/careers/early-careers/gradcareers/', howToApply: 'Graduate Programme 2026: Audit & Assurance or Advisory Services. 3,000 people across 9 offices. Apply online.', logo: '💼' },
  { name: 'BearingPoint Ireland', sector: 'Professional Services', url: 'https://www.bearingpoint.com/en-ie/careers/graduate-programme/', howToApply: 'Apply via BearingPoint graduate programme page. Global firm with boutique consultancy feel.', logo: '💼' },

  // ── Public Sector ─────────────────────────────────────────────────────────
  { name: 'Enterprise Ireland', sector: 'Public Sector', url: 'https://www.enterprise-ireland.com/en/careers-at-enterprise-ireland/international-graduate-programme', howToApply: 'International Graduate Programme 2026–2028. Apply when programmes open. National programme also available.', logo: '🏛️' },
  { name: 'Public Appointments Service', sector: 'Public Sector', url: 'https://www.publicjobs.ie', howToApply: 'Apply via publicjobs.ie competitions. Graduate/entry streams listed — set up email alerts for new competitions.', logo: '🏛️' },
  { name: 'IDA Ireland', sector: 'Public Sector', url: 'https://www.idaireland.com/careers-at-ida-ireland/graduate-programme', howToApply: '3-year programme: corporate support, international posting, client-facing and regional rotations. Apply when open.', logo: '🏛️' },
  { name: 'OPW (Office of Public Works)', sector: 'Public Sector', url: 'https://www.publicjobs.ie', howToApply: 'Architecture, engineering, conservation graduate roles. Apply via publicjobs.ie competitions.', logo: '🏛️' },
  { name: 'Revenue Commissioners', sector: 'Public Sector', url: 'https://www.revenue.ie/en/corporate/careers/index.aspx', howToApply: 'Clerical Officer, Tax Officer, Inspector of Taxes graduate entry. Apply via publicjobs.ie.', logo: '🏛️' },
  { name: 'Teagasc', sector: 'Public Sector', url: 'https://www.teagasc.ie/about/careers/', howToApply: 'Graduate programme in agricultural science, food science, rural development. Apply via careers page.', logo: '🌾' },

  // ── Energy / Utilities ────────────────────────────────────────────────────
  { name: 'ESB', sector: 'Energy', url: 'https://esb.ie/careers/esb-early-careers', howToApply: 'Engineering, IT, Commercial, Finance, HR streams. 70+ graduates per year. Track via ESB Early Careers page.', logo: '⚡' },
  { name: 'EirGrid', sector: 'Energy', url: 'https://www.eirgridgroup.com/about/careers/', howToApply: '2-year programme with 3 rotations across all disciplines. Watch for next recruitment cycle on EirGrid jobs page.', logo: '⚡' },
  { name: 'Uisce Éireann', sector: 'Energy', url: 'https://www.water.ie/careers/', howToApply: 'Apply via their careers portal ("Explore open roles"). Graduate engineering and operations roles.', logo: '💧' },
  { name: 'Met Éireann', sector: 'Energy', url: 'https://www.met.ie/about-us/vacancies', howToApply: 'Follow the instructions listed on vacancies page. Application form + submit to the provided email.', logo: '🌤️' },

  // ── Tech Giants ───────────────────────────────────────────────────────────
  { name: 'Google Ireland', sector: 'Tech', url: 'https://careers.google.com/students/', howToApply: 'Apply via Google Careers. Search by location (Dublin) and role type (intern/graduate). STEP internship for underrepresented groups.', logo: '🔍' },
  { name: 'Microsoft Ireland', sector: 'Tech', url: 'https://careers.microsoft.com/v2/global/en/programs/students.html', howToApply: 'Apply via Microsoft Aspire/early-in-career programmes. Filter by Ireland (Dublin). MACH graduate programme for recent grads.', logo: '🪟' },
  { name: 'Amazon Ireland', sector: 'Tech', url: 'https://www.amazon.jobs/en/teams/internships-for-students', howToApply: 'Apply via Amazon "Jobs for Grads" portal. Filter location to Ireland/Dublin. 2026 SDE Intern Ireland posted.', logo: '📦' },
  { name: 'Apple Ireland', sector: 'Tech', url: 'https://jobs.apple.com/en-ie/search?team=internships-STDNT-INTRN', howToApply: 'Apply via Apple Jobs. Filter by Ireland and student/graduate roles. Offices in Cork (European HQ) and Dublin.', logo: '🍎' },
  { name: 'Meta Ireland', sector: 'Tech', url: 'https://www.metacareers.com/students-and-grads/', howToApply: 'Apply via Meta student programmes. Filter office/location to Ireland/Dublin. Meta Summer Academy 2026 ran Dec–Feb.', logo: '📱' },
  { name: 'TikTok Ireland', sector: 'Tech', url: 'https://careers.tiktok.com/position?type=3', howToApply: 'Apply via TikTok early careers (internships for students; graduate roles for early talent) and filter Dublin/Ireland.', logo: '🎵' },
  { name: 'Salesforce Ireland', sector: 'Tech', url: 'https://www.salesforce.com/company/careers/university/', howToApply: 'Apply via Salesforce University. EMEA Graduate Rotation Program 2026 in Dublin. Filter by Ireland/Dublin roles.', logo: '☁️' },
  { name: 'Oracle Ireland', sector: 'Tech', url: 'https://www.oracle.com/ie/careers/students-grads/', howToApply: 'Apply via Oracle Students & Grads / internship programmes. Filter for Ireland-based roles.', logo: '🗃️' },
  { name: 'SAP Ireland', sector: 'Tech', url: 'https://jobs.sap.com/content/Students-and-Graduates/', howToApply: 'Apply via SAP STAR (Student Training and Rotation) programme. Filter location to Ireland. 477+ SAP grad jobs on IrishJobs.', logo: '💼' },
  { name: 'HubSpot Ireland', sector: 'Tech', url: 'https://www.hubspot.com/careers/emerging-talent', howToApply: 'Apply via HubSpot Emerging Talent page. Filter location to Ireland/Dublin. Graduate and internship roles listed seasonally.', logo: '🧲' },
  { name: 'Workday Ireland', sector: 'Tech', url: 'https://www.workday.com/en-us/pages/careers-dublin.html', howToApply: 'Apply through Workday early career programmes. Dublin office roles appear seasonally on their careers page.', logo: '💼' },
  { name: 'IBM Ireland', sector: 'Tech', url: 'https://www.ibm.com/careers/search?field_of_work=Intern&country=IE', howToApply: 'Apply via IBM internships/early career portals. Filter roles by location (Ireland/Dublin).', logo: '💻' },
  { name: 'Intel Ireland', sector: 'Tech', url: 'https://jobs.intel.com/en/search-jobs?k=intern&l=Ireland', howToApply: 'Apply via Intel student/graduate listings. Leixlip campus — welcomes grads from chemistry, electronics, and engineering.', logo: '💻' },

  // ── Tech (Scale-ups & Emerging) ───────────────────────────────────────────
  { name: 'Stripe Ireland', sector: 'FinTech', url: 'https://stripe.com/jobs/university', howToApply: 'Apply via Stripe university page. Dublin HQ — SWE interns earn €1,015/week. Grad engineering roles available.', logo: '💳' },
  { name: 'Intercom', sector: 'Tech', url: 'https://www.intercom.com/careers/dublin', howToApply: 'Apply via Greenhouse on Intercom careers. Graduate Product Engineer 2026. Hybrid (3 days in-office Dublin).', logo: '💬' },
  { name: 'Databricks', sector: 'Tech', url: 'https://www.databricks.com/company/careers/university-recruiting', howToApply: 'Software Engineer New Grad 2026. Partner with 40+ UK/Ireland universities including UCD. Apply via university recruiting page.', logo: '🔥' },
  { name: 'ServiceNow', sector: 'Tech', url: 'https://careers.servicenow.com/locations/emea/ireland/', howToApply: '600+ employees in Dublin from 45+ nationalities. Apply via careers portal for early-career roles.', logo: '☁️' },
  { name: 'Zendesk', sector: 'Tech', url: 'https://jobs.zendesk.com/', howToApply: '500 people in Dublin including 150 engineers. Check careers page and apply for graduate openings.', logo: '💬' },
  { name: 'Twilio', sector: 'Tech', url: 'https://www.twilio.com/en-us/company/jobs', howToApply: 'Dublin office. Software Engineering Graduate roles posted periodically. Apply via careers portal.', logo: '📲' },
  { name: 'Cisco', sector: 'Tech', url: 'https://www.cisco.com/site/us/en/about/careers.html', howToApply: 'Dublin presence. Apply for graduate roles via Cisco careers portal. Filter by Ireland/EMEA.', logo: '🌐' },
  { name: 'Dell Technologies', sector: 'Tech', url: 'https://jobs.dell.com/en/graduates', howToApply: 'ITDP (2-year) and SLDP (18-month) rotational programmes. Dublin, Limerick, Cork offices. Apply at jobs.dell.com.', logo: '💻' },
  { name: 'Flutter Entertainment', sector: 'Tech', url: 'https://www.flutter.com/responsibility/our-people/early-careers/', howToApply: 'Graduate programme in tech, data, product, finance at Dublin HQ (Paddy Power Betfair parent company). Apply online.', logo: '🎮' },
  { name: 'Riot Games Dublin', sector: 'Tech', url: 'https://www.riotgames.com/en/work-with-us', howToApply: 'Dublin office (legal/ops hub). Internship and new grad roles. Apply via Riot Games careers portal.', logo: '🎮' },

  // ── Telecoms ──────────────────────────────────────────────────────────────
  { name: 'Vodafone Ireland', sector: 'Telecoms', url: 'https://www.vodafone.ie/about-us/careers/graduate-programme', howToApply: 'Discover Graduate Programme: 7 streams, 21-month programme starting Sep 2026. Apply online via Vodafone careers.', logo: '📶' },
  { name: 'Three Ireland', sector: 'Telecoms', url: 'https://www.three.ie/careers.html', howToApply: '2-year grad programme (3 years for Finance/CIMA). Sep 2026 intake. Apply online via Three careers.', logo: '📶' },
  { name: 'Ericsson Ireland', sector: 'Telecoms', url: 'https://www.ericsson.com/en/careers/job-opportunities', howToApply: 'Apply through Ericsson early careers pages (graduate programs / internships). Choose relevant openings for Ireland.', logo: '📡' },

  // ── Financial Services ────────────────────────────────────────────────────
  { name: 'Mastercard Ireland', sector: 'Financial Services', url: 'https://careers.mastercard.com/us/en', howToApply: 'Launch Graduate Program 2026 in Dublin (18-month, Product Management). European Tech Hub. Apply via Workday portal.', logo: '💳' },
  { name: 'Susquehanna (SIG)', sector: 'Financial Services', url: 'https://careers.sig.com/europe-campus', howToApply: '2026 grad roles in Dublin: Software Dev, Quant Researcher, Quant Trader, Trading Ops Analyst. Apply via SIG campus careers.', logo: '📈' },
  { name: 'BNY Ireland', sector: 'Financial Services', url: 'https://www.bny.com/corporate/ie/en/inside-bny-mellon-graduate-opportunities.html', howToApply: '24-month Analyst Programme across audit, engineering, client management. Offices in Cork, Dublin, Wexford. Apply via BNY careers.', logo: '🏦' },
  { name: 'Citco', sector: 'Financial Services', url: 'https://www.citco.com/careers', howToApply: 'IFSC/Dublin based. Fund administration graduate roles. Check Oracle-based career portal for openings.', logo: '💼' },
  { name: 'Northern Trust Ireland', sector: 'Financial Services', url: 'https://www.northerntrust.com/united-states/about-us/careers/students-and-graduates', howToApply: '8-month Ireland Co-Op programme. Graduate roles in Limerick and Dublin. Apply via Northern Trust careers.', logo: '🏦' },
  { name: 'Fidelity Investments Ireland', sector: 'Financial Services', url: 'https://jobs.fidelity.com/ie/early-career/', howToApply: 'LEAP programme (tech, Jan/Aug starts) and Fidelity YOU (operations, Sep start, 21 months). Apply online.', logo: '💰' },
  { name: 'Irish Life', sector: 'Financial Services', url: 'https://gradireland.com/jobs/irish-life-group-graduate-programme-2026-192366', howToApply: '30-month fixed-term graduate programme starting Sep 2026 in Dublin. Apply via GradIreland listing.', logo: '🛡️' },
  { name: 'Revolut Ireland', sector: 'FinTech', url: 'https://www.revolut.com/graduate-programme/', howToApply: 'Rev-celerator: 12-month programme across engineering, product, IT, ops. Dublin-based. Apply directly online.', logo: '💳' },
  { name: 'Allianz Ireland', sector: 'Financial Services', url: 'https://www.allianz.ie/about/careers/', howToApply: 'Apply on Allianz Ireland graduate programme page when intake opens. Online application form.', logo: '🛡️' },
  { name: 'Zurich Ireland', sector: 'Financial Services', url: 'https://www.zurich.ie/about-us/careers/', howToApply: '2-year Graduate Development Programme starting Sep 2026. Permanent contract. Apply via Zurich Ireland careers.', logo: '🛡️' },

  // ── Pharma / MedTech / Life Sciences ─────────────────────────────────────
  { name: 'Pfizer Ireland', sector: 'Pharma / MedTech', url: 'https://www.pfizer.ie/career/early-careers-at-pfizer-in-ireland', howToApply: '2026 grad programmes in Cork, Dublin, Kildare. Apply online and select the relevant Pfizer site/programme.', logo: '💊' },
  { name: 'AbbVie Ireland', sector: 'Pharma / MedTech', url: 'https://www.abbvie.ie/careers.html', howToApply: 'Apply via AbbVie student opportunities / graduate development postings on their Ireland careers page.', logo: '💊' },
  { name: 'Johnson & Johnson Ireland', sector: 'Pharma / MedTech', url: 'https://www.careers.jnj.com/', howToApply: 'Graduate roles in Ringaskiddy, Cork. Apply via J&J careers portal — search for Ireland-based graduate positions.', logo: '💊' },
  { name: 'Boston Scientific Ireland', sector: 'Pharma / MedTech', url: 'https://www.bostonscientific.com/en-EU/careers/early-talent-careers--boston-scientific-clonmel/graduate-programme.html', howToApply: '23-month programme in Galway, Cork, Clonmel. Manufacturing & Quality Engineering. STEM degree required.', logo: '🏥' },
  { name: 'Stryker Ireland', sector: 'Pharma / MedTech', url: 'https://careers.stryker.com/students-and-graduates', howToApply: 'R&D Graduate Programme (24 months, 6-month rotations) starting Sep 2026 in Cork/Limerick. Permanent contract from day 1.', logo: '🏥' },
  { name: 'Medtronic Ireland', sector: 'Pharma / MedTech', url: 'https://www.medtronic.com/en-ie/our-company/careers/early-careers.html', howToApply: 'Galway-based. Graduate quality engineer and early career roles. Apply via Medtronic careers portal.', logo: '🏥' },
  { name: 'MSD Ireland', sector: 'Pharma / MedTech', url: 'https://jobs.msd.com/ireland', howToApply: '3-year Graduate Development Programme with interdepartmental rotations. Applications open Sep for following year intake.', logo: '💊' },
  { name: 'Abbott Ireland', sector: 'Pharma / MedTech', url: 'https://www.abbott.com/careers.html', howToApply: 'Major employer in Donegal, Longford, Clonmel. Apply via Abbott careers site — search for Ireland graduate roles.', logo: '🏥' },
  { name: 'Lilly (Eli Lilly) Ireland', sector: 'Pharma / MedTech', url: 'https://www.lilly.com/careers/ireland', howToApply: 'Major pharma employer in Cork (Kinsale/Dunderrow). Graduate engineering and science roles. Apply via Lilly careers.', logo: '💊' },
  { name: 'Takeda Ireland', sector: 'Pharma / MedTech', url: 'https://www.takeda.com/en-ie/careers/', howToApply: 'Graduate roles in Bray, Wicklow and Grange Castle, Dublin. Apply via Takeda careers portal.', logo: '💊' },
  { name: 'Novartis Ireland', sector: 'Pharma / MedTech', url: 'https://www.novartis.com/careers/career-search', howToApply: 'Dublin office. Graduate and intern roles in finance, commercial, and regulatory affairs. Apply via Novartis careers.', logo: '💊' },
  { name: 'Regeneron Ireland', sector: 'Pharma / MedTech', url: 'https://careers.regeneron.com/', howToApply: 'Limerick manufacturing facility. Graduate engineering roles. Apply via Regeneron careers portal.', logo: '🔬' },
  { name: 'ICON plc', sector: 'Pharma / MedTech', url: 'https://www.iconplc.com/careers/students-and-graduates/', howToApply: 'CRO with 4,000+ employees in Ireland. Graduate programme for clinical operations, data management, biostatistics.', logo: '🔬' },
  { name: 'Optum / UnitedHealth Ireland', sector: 'Pharma / MedTech', url: 'https://careers.unitedhealthgroup.com/optum-ireland/', howToApply: 'Technology Development Program (TDP) in Letterkenny and Dublin. Apply in autumn for following year intake.', logo: '💻' },

  // ── Engineering & Infrastructure ──────────────────────────────────────────
  { name: 'Analog Devices Ireland', sector: 'Engineering', url: 'https://www.analog.com/en/careers/student-resources.html', howToApply: '70+ student placements/year in Limerick. 60% convert to full-time roles. Apply via ADI careers student page.', logo: '💻' },
  { name: 'Arup Ireland', sector: 'Engineering', url: 'https://jobs.arup.com/page/graduate-roles-in-ireland-254', howToApply: '700+ staff in Dublin, Cork, Galway, Limerick. Graduate programme with buddy, mentor and chartership pathway. Apply online.', logo: '🏗️' },
  { name: 'Mott MacDonald Ireland', sector: 'Engineering', url: 'https://www.mottmac.com/en/careers/early-careers/', howToApply: 'Multiple 2026 Ireland grad roles: civil, electrical, project management. "Accelerating your Future" 3-year programme.', logo: '🏗️' },
  { name: 'John Sisk & Son', sector: 'Engineering', url: 'https://www.siskconstruction.com/careers/early-careers/', howToApply: '27-month Early Careers Programme starting Sep 2026 with rotations. Civil/construction engineering. Apply online.', logo: '🏗️' },
  { name: 'PM Group', sector: 'Engineering', url: 'https://www.pmgroup-global.com/careers/graduates/', howToApply: 'Graduate Engineer/Architect roles in Dublin, Cork, Limerick. Apply via PM Group graduate page.', logo: '🏗️' },
  { name: 'An Post', sector: 'Engineering', url: 'https://www.anpost.com/About/Careers', howToApply: 'Apply via An Post graduate programme page (GradPosts) when roles open. IT and operations streams available.', logo: '📮' },
  { name: 'CRH', sector: 'Engineering', url: 'https://www.crh.com/careers', howToApply: 'Apply via CRH graduate programme postings on their careers site. Engineering and commercial streams.', logo: '🏗️' },
  { name: 'Kingspan Group', sector: 'Engineering', url: 'https://www.kingspangroup.com/en/careers/graduate-programme/', howToApply: 'Multiple 2026 roles: Finance, Engineering, Procurement, Commercial. Permanent contract from day 1. Apply online.', logo: '🏗️' },
  { name: 'daa (Dublin Airport Authority)', sector: 'Engineering', url: 'https://www.daa.ie/careers/graduates/', howToApply: 'Apply via daa careers → Graduates. Streams across engineering, IT, commercial, operations when intake opens.', logo: '✈️' },

  // ── Food, Agri & FMCG ────────────────────────────────────────────────────
  { name: 'Kerry Group', sector: 'Food & Agri', url: 'https://www.kerry.com/careers/graduates', howToApply: '40 roles across 12 graduate programmes. €39,200 starting salary. 2-year rotational. Apply via Kerry early careers portal.', logo: '🌿' },
  { name: 'Glanbia', sector: 'Food & Agri', url: 'https://careers.glanbia.com/go/Students-Early-Careers/8657500/', howToApply: 'Apply via Glanbia "Students/Early Careers" roles. Contact earlycareers@glanbia.com. Create job alerts for openings.', logo: '🥛' },
  { name: 'Tirlán', sector: 'Food & Agri', url: 'https://www.tirlan.com/careers', howToApply: 'Apply when recruitment opens (typically autumn). Graduate intake starts the following September.', logo: '🌾' },
  { name: 'Diageo Ireland', sector: 'Food & Agri', url: 'https://www.diageo.com/en/careers/early-careers', howToApply: 'Use "Search and apply" on Diageo Early Careers. Apply to the relevant graduate stream (Supply, Commercial, Finance, HR).', logo: '🍺' },
  { name: 'Irish Distillers (Jameson)', sector: 'Food & Agri', url: 'https://www.irishdistillers.ie/careers/early-careers/', howToApply: 'Graduate Programme + Jameson International Brand Ambassador Programme (3 years, international postings). Recruitment in Oct/Nov.', logo: '🥃' },
  { name: 'Tesco Ireland', sector: 'Retail', url: 'https://www.tesco-careers.com/explore-our-early-careers/', howToApply: 'Apply via Tesco early careers/graduate scheme pages. Ireland intake varies by year — set up job alerts.', logo: '🛒' },
  { name: 'Lidl Ireland', sector: 'Retail', url: 'https://jobs.lidl.ie/students-graduates/graduate-management-programme', howToApply: 'Apply online via Lidl "Students/Graduates". Graduate Mgmt Programme — only 10 places/year. Applications open Sep each year.', logo: '🛒' },
  { name: 'ALDI Ireland', sector: 'Retail', url: 'https://www.aldirecruitment.ie/early-careers/graduate-area-manager-programme', howToApply: 'Graduate Area Manager: €71,375 starting salary rising to €118,100. 12-month programme. Full driving licence required.', logo: '🛒' },
  { name: 'Musgrave', sector: 'Retail', url: 'https://www.musgraveearlycareers.com/', howToApply: 'Apply via Musgrave Early Careers "Apply now" page. Digital Product and Finance streams for 2026. Award-winning programme.', logo: '🛒' },
  { name: 'Smurfit Westrock', sector: 'Food & Agri', url: 'https://www.smurfitwestrock.com/careers', howToApply: '2-year Graduate Management Programme starting Oct 2026. Mobility required (Ireland/UK). Apply online.', logo: '📦' },

  // ── Aviation & Transport ──────────────────────────────────────────────────
  { name: 'Ryanair', sector: 'Aviation', url: 'https://careers.ryanair.com/graduate-programmes/', howToApply: 'Apply on Ryanair Careers → Graduate Programmes. Select Corporate, Operations, IT, Finance or International stream.', logo: '✈️' },
  { name: 'Aer Lingus', sector: 'Aviation', url: 'https://www.aerlingus.com/careers/emerging-talent/graduate-benefits/', howToApply: '2-year programme: Revenue Mgmt, Finance, Marketing, Ops. All grads join IMI programme. September intake.', logo: '✈️' },
  { name: 'CIÉ / Irish Rail', sector: 'Aviation', url: 'https://www.irishrail.ie/en-ie/about-iarnrod-eireann/careers', howToApply: 'Graduate engineering and operations roles. Apply via Irish Rail careers when intake opens.', logo: '🚂' },
  { name: 'Dublin Bus', sector: 'Aviation', url: 'https://www.dublinbus.ie/about-us/careers', howToApply: 'Graduate management and engineering roles. Apply via Dublin Bus careers portal.', logo: '🚌' },

  // ── Law ───────────────────────────────────────────────────────────────────
  { name: 'A&L Goodbody', sector: 'Law', url: 'https://www.algoodbody.com/careers/trainees-interns/dublin-programmes/trainee-solicitor-programme/', howToApply: '40–50 trainee solicitors/year. €47–50K salary. All Law Society fees paid. Apply online via AG careers.', logo: '⚖️' },
  { name: 'Matheson', sector: 'Law', url: 'https://www.matheson.com/careers', howToApply: 'Trainee solicitor programme. €45–50K salary. Apply via Matheson careers portal.', logo: '⚖️' },
  { name: 'Arthur Cox', sector: 'Law', url: 'https://www.arthurcox.com/careers/', howToApply: 'Trainee solicitor programme. €44–48K salary. Apply via Arthur Cox careers.', logo: '⚖️' },
  { name: 'William Fry', sector: 'Law', url: 'https://www.williamfry.com/careers', howToApply: 'Trainee solicitor programme. €45–46K salary. Apply via William Fry careers.', logo: '⚖️' },

  // ── Science Foundation & Research ─────────────────────────────────────────
  { name: 'Science Foundation Ireland', sector: 'Public Sector', url: 'https://www.sfi.ie/careers/', howToApply: 'Postgraduate and policy roles. Apply when programmes open on SFI careers page.', logo: '🔬' },
];

export const PORTALS: Portal[] = [
  { name: 'gradireland', desc: 'Graduate programmes, internships, employer hubs', url: 'https://gradireland.com/', tip: 'Use "Organisation A–Z" + set alerts for internships/graduate programmes.' },
  { name: 'CareersPortal.ie', desc: 'Graduate programme directory + guidance', url: 'https://careersportal.ie/', tip: 'Browse graduate recruitment & training programmes A–Z.' },
  { name: 'LinkedIn Jobs Ireland', desc: 'Internships + graduate roles + networking', url: 'https://ie.linkedin.com/jobs/', tip: 'Follow target companies + set "Internship/Entry level" job alerts. 34,000+ jobs in Ireland.' },
  { name: 'Indeed Ireland', desc: 'Massive cross-sector listings', url: 'https://ie.indeed.com/', tip: 'Use filters: "Internship", "Graduate", and location radius. 41,000+ jobs listed.' },
  { name: 'IrishJobs.ie', desc: 'Ireland-wide jobs (strong across sectors)', url: 'https://www.irishjobs.ie/', tip: 'Use the built-in "Graduate" searches to find entry routes. 168+ internships listed.' },
  { name: 'Jobs.ie', desc: 'Broad job board — many Irish employers', url: 'https://www.jobs.ie/', tip: 'Good for broad searches + location-based browsing. 3,850+ jobs.' },
  { name: 'JobAlert.ie', desc: 'Regional roles + quick browsing', url: 'https://www.jobalert.ie/', tip: '#1 Irish-owned jobs site. Handy for county-based searches + entry-level filters. 400k+ followers.' },
  { name: 'RecruitIreland', desc: 'Roles posted by employers + agencies', url: 'https://www.recruitireland.com/', tip: 'Good additional coverage alongside IrishJobs/Jobs.ie. 2,301 employers listed.' },
  { name: 'Recruit.ie', desc: 'General job listings across Ireland', url: 'https://www.recruit.ie/', tip: 'Useful for quick keyword/location searches. 2,128 jobs listed.' },
  { name: 'publicjobs.ie', desc: 'Civil & public service competitions (grad/entry)', url: 'https://www.publicjobs.ie/', tip: 'Essential for public sector — set alerts and track competitions. Active civil service recruitment 2026.' },
  { name: 'JobsIreland.ie', desc: 'State-supported vacancies + programmes', url: 'https://jobsireland.ie/', tip: 'Also lists work placement / programme-type vacancies. Dept. of Social Protection service.' },
  { name: 'StudentJob Ireland', desc: 'Part-time, internships, summer jobs', url: 'https://www.studentjob.ie/', tip: "Europe's biggest student job portal. Great for flexible work + internships." },
  { name: 'Glassdoor Ireland', desc: 'Job listings + employer reviews/salaries', url: 'https://www.glassdoor.ie/Job/ireland-jobs-SRCH_IL.0,7_IN70.htm', tip: 'Research before applying — reviews & salary ranges. 55,771 open jobs in Ireland.' },
  { name: 'EURES', desc: 'Jobs across EU/EEA (including Ireland)', url: 'https://eures.europa.eu/', tip: 'Best if open to Europe-wide opportunities. EU employment services, Ireland section active.' },
  { name: 'HSE Jobs', desc: 'Healthcare roles (public health system)', url: 'https://about.hse.ie/jobs/job-search/', tip: 'For healthcare students, this is the primary official search. Graduate social care, nursing, medical jobs.' },
  { name: 'DoneDealJobs (deal.ie)', desc: 'Trades, construction, manufacturing, HGV/driver roles', url: 'https://deal.ie/', tip: 'Niche board for trades & blue-collar roles in Dublin, Cork, Belfast. Not a typical graduate portal.', niche: true },
];
