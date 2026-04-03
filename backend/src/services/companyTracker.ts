import { query } from '../config/database';

interface CompanyInput {
  name: string;
  sector: string;
  careers_url: string;
  grad_programme_url: string;
}

export interface Company {
  id: number;
  name: string;
  sector: string;
  careers_url: string;
  grad_programme_url: string;
  has_grad_programme: boolean;
  last_checked: Date;
  created_at: Date;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  company_id: number | null;
  location: string;
  url: string;
  description: string | null;
  salary: string | null;
  job_type: string | null;
  source: string;
  created_at: Date;
  updated_at: Date;
}

const IRISH_COMPANIES: CompanyInput[] = [
  // Banking/Finance
  { name: 'AIB', sector: 'Banking', careers_url: 'https://jobs.aib.ie', grad_programme_url: 'https://jobs.aib.ie/aib/go/Graduate/9605400/' },
  { name: 'Bank of Ireland', sector: 'Banking', careers_url: 'https://careers.bankofireland.com', grad_programme_url: 'https://careers.bankofireland.com/early-careers' },
  { name: 'Central Bank of Ireland', sector: 'Banking', careers_url: 'https://www.centralbank.ie/careers', grad_programme_url: 'https://www.centralbank.ie/careers/graduate-programme' },
  { name: 'Allianz Ireland', sector: 'Insurance', careers_url: 'https://www.allianz.ie/about/careers/', grad_programme_url: 'https://www.allianz.ie/about/careers/graduate-programme/' },
  { name: 'Zurich Ireland', sector: 'Insurance', careers_url: 'https://www.zurich.ie/careers/', grad_programme_url: 'https://www.zurich.ie/careers/graduate-programme/' },
  // Consulting
  { name: 'Accenture Ireland', sector: 'Consulting', careers_url: 'https://www.accenture.com/ie-en/careers', grad_programme_url: 'https://www.accenture.com/ie-en/careers/local/graduate-programme' },
  { name: 'Deloitte Ireland', sector: 'Consulting', careers_url: 'https://www2.deloitte.com/ie/en/careers.html', grad_programme_url: 'https://www2.deloitte.com/ie/en/pages/careers/articles/graduate-programmes.html' },
  { name: 'KPMG Ireland', sector: 'Consulting', careers_url: 'https://www.kpmg.com/ie/en/home/careers.html', grad_programme_url: 'https://www.kpmg.com/ie/en/home/careers/graduate.html' },
  { name: 'PwC Ireland', sector: 'Consulting', careers_url: 'https://www.pwc.ie/careers.html', grad_programme_url: 'https://www.pwc.ie/careers/student-careers.html' },
  { name: 'EY Ireland', sector: 'Consulting', careers_url: 'https://www.ey.com/en_ie/careers', grad_programme_url: 'https://www.ey.com/en_ie/careers/students' },
  { name: 'BDO Ireland', sector: 'Consulting', careers_url: 'https://www.bdo.ie/en-gb/careers', grad_programme_url: 'https://www.bdo.ie/en-gb/careers/early-careers' },
  { name: 'RSM Ireland', sector: 'Consulting', careers_url: 'https://www.rsm.global/ireland/careers', grad_programme_url: 'https://www.rsm.global/ireland/careers/graduates' },
  { name: 'Forvis Mazars Ireland', sector: 'Consulting', careers_url: 'https://www.forvismazars.com/ie/en/careers', grad_programme_url: 'https://www.forvismazars.com/ie/en/careers/graduates' },
  // Big Tech
  { name: 'Amazon Ireland', sector: 'Technology', careers_url: 'https://www.amazon.jobs/en/locations/dublin-ireland', grad_programme_url: 'https://www.amazon.jobs/en/teams/internships-for-students' },
  { name: 'Google Ireland', sector: 'Technology', careers_url: 'https://careers.google.com/locations/dublin/', grad_programme_url: 'https://careers.google.com/students/' },
  { name: 'Apple Ireland', sector: 'Technology', careers_url: 'https://jobs.apple.com/en-ie', grad_programme_url: 'https://jobs.apple.com/en-ie/search?team=internships-STDNT-INTRN' },
  { name: 'Salesforce Ireland', sector: 'Technology', careers_url: 'https://www.salesforce.com/company/careers/university-recruiting/', grad_programme_url: 'https://www.salesforce.com/company/careers/university-recruiting/' },
  { name: 'Microsoft Ireland', sector: 'Technology', careers_url: 'https://careers.microsoft.com/v2/global/en/locations/dublin', grad_programme_url: 'https://careers.microsoft.com/v2/global/en/aspire-program' },
  { name: 'IBM Ireland', sector: 'Technology', careers_url: 'https://www.ibm.com/careers/ie-en', grad_programme_url: 'https://www.ibm.com/careers/ie-en/early-career/' },
  { name: 'Intel Ireland', sector: 'Semiconductor', careers_url: 'https://jobs.intel.com/en/search-jobs/Ireland', grad_programme_url: 'https://jobs.intel.com/en/students' },
  { name: 'Ericsson Ireland', sector: 'Telecom', careers_url: 'https://www.ericsson.com/en/careers', grad_programme_url: 'https://www.ericsson.com/en/careers/programs' },
  { name: 'SAP Ireland', sector: 'Technology', careers_url: 'https://jobs.sap.com/search/?q=&locationsearch=Ireland', grad_programme_url: 'https://jobs.sap.com/content/Students-and-Early-Talent/' },
  { name: 'Meta Ireland', sector: 'Technology', careers_url: 'https://www.metacareers.com/locations/dublin/', grad_programme_url: 'https://www.metacareers.com/areas-of-work/university/' },
  { name: 'TikTok Ireland', sector: 'Technology', careers_url: 'https://careers.tiktok.com/position?keywords=&category=&location=CT_51&project=&type=2', grad_programme_url: 'https://careers.tiktok.com/position?type=2' },
  { name: 'HubSpot Ireland', sector: 'Technology', careers_url: 'https://www.hubspot.com/careers/dublin', grad_programme_url: 'https://www.hubspot.com/careers/emerging-talent' },
  { name: 'Oracle Ireland', sector: 'Technology', careers_url: 'https://www.oracle.com/careers/students-and-graduates/', grad_programme_url: 'https://www.oracle.com/careers/students-and-graduates/' },
  { name: 'Workday Ireland', sector: 'Technology', careers_url: 'https://www.workday.com/en-ie/company/careers/early-career.html', grad_programme_url: 'https://www.workday.com/en-ie/company/careers/early-career.html' },
  { name: 'Stripe Ireland', sector: 'FinTech', careers_url: 'https://stripe.com/jobs/search?office_locations=Dublin', grad_programme_url: 'https://stripe.com/jobs/university' },
  // Public Sector
  { name: 'Enterprise Ireland', sector: 'Public Sector', careers_url: 'https://www.enterprise-ireland.com/en/careers/', grad_programme_url: 'https://www.enterprise-ireland.com/en/careers/graduate-programme/' },
  { name: 'Public Appointments Service', sector: 'Public Sector', careers_url: 'https://www.publicjobs.ie', grad_programme_url: 'https://www.publicjobs.ie/en/' },
  { name: 'ESB', sector: 'Energy', careers_url: 'https://www.esb.ie/careers', grad_programme_url: 'https://www.esb.ie/careers/graduates' },
  { name: 'EirGrid', sector: 'Energy', careers_url: 'https://www.eirgrid.ie/about/careers', grad_programme_url: 'https://www.eirgrid.ie/about/careers' },
  { name: 'An Post', sector: 'Public Sector', careers_url: 'https://www.anpost.com/About/Careers', grad_programme_url: 'https://www.anpost.com/About/Careers' },
  { name: 'daa', sector: 'Aviation', careers_url: 'https://www.daa.ie/careers/', grad_programme_url: 'https://www.daa.ie/careers/graduates/' },
  // Pharma
  { name: 'Pfizer Ireland', sector: 'Pharma', careers_url: 'https://www.pfizer.ie/careers', grad_programme_url: 'https://www.pfizer.com/about/careers/students-and-new-graduates' },
  { name: 'AbbVie Ireland', sector: 'Pharma', careers_url: 'https://careers.abbvie.com/en/search-jobs/Ireland', grad_programme_url: 'https://careers.abbvie.com/en/students' },
  { name: 'Boston Scientific', sector: 'MedTech', careers_url: 'https://jobs.bostonscientific.com/search-jobs/Ireland', grad_programme_url: 'https://jobs.bostonscientific.com/students-and-graduates' },
  // Construction/Energy
  { name: 'CRH', sector: 'Construction', careers_url: 'https://www.crh.com/careers', grad_programme_url: 'https://www.crh.com/careers/graduate-programme' },
  { name: 'Kingspan', sector: 'Construction', careers_url: 'https://www.kingspan.com/group/careers', grad_programme_url: 'https://www.kingspan.com/group/careers/graduate-programme' },
  // FMCG/Food
  { name: 'Diageo Ireland', sector: 'FMCG', careers_url: 'https://www.diageo.com/en/careers/', grad_programme_url: 'https://www.diageo.com/en/careers/early-careers/' },
  { name: 'Kerry Group', sector: 'Food', careers_url: 'https://www.kerry.com/careers', grad_programme_url: 'https://www.kerry.com/careers/early-careers' },
  { name: 'Glanbia', sector: 'Food', careers_url: 'https://careers.glanbia.com', grad_programme_url: 'https://careers.glanbia.com/students-and-early-careers' },
  { name: 'Tirlán', sector: 'Food', careers_url: 'https://www.tirlan.com/careers', grad_programme_url: 'https://www.tirlan.com/careers/graduate-programme' },
  // Aviation
  { name: 'Ryanair', sector: 'Aviation', careers_url: 'https://careers.ryanair.com', grad_programme_url: 'https://careers.ryanair.com/graduates/' },
  // Retail
  { name: 'Tesco Ireland', sector: 'Retail', careers_url: 'https://www.tesco-careers.com/search-and-apply/', grad_programme_url: 'https://www.tesco-careers.com/early-careers/' },
  { name: 'Lidl Ireland', sector: 'Retail', careers_url: 'https://careers.lidl.ie', grad_programme_url: 'https://careers.lidl.ie/students-graduates' },
  { name: 'ALDI Ireland', sector: 'Retail', careers_url: 'https://www.aldirecruitment.ie', grad_programme_url: 'https://www.aldirecruitment.ie/graduate-area-manager-programme/' },
  { name: 'Musgrave', sector: 'Retail', careers_url: 'https://www.musgravegroup.com/careers/', grad_programme_url: 'https://www.musgraveearlycareers.com' },
];

export class CompanyTracker {
  async seedCompanies(): Promise<void> {
    console.log(`Seeding ${IRISH_COMPANIES.length} Irish companies...`);

    let upserted = 0;
    let failed = 0;

    for (const company of IRISH_COMPANIES) {
      try {
        await query(
          `INSERT INTO companies (name, sector, careers_url, grad_programme_url, has_grad_programme, last_checked)
           VALUES ($1, $2, $3, $4, true, NOW())
           ON CONFLICT (name) DO UPDATE SET last_checked = NOW(), careers_url = EXCLUDED.careers_url`,
          [company.name, company.sector, company.careers_url, company.grad_programme_url]
        );
        upserted++;
      } catch (error) {
        console.error(`Failed to seed company "${company.name}":`, error);
        failed++;
      }
    }

    console.log(`Company seeding complete: ${upserted} upserted, ${failed} failed.`);
  }

  async linkJobsToCompanies(): Promise<number> {
    console.log('Linking unlinked jobs to companies...');

    try {
      const result = await query(
        `UPDATE jobs SET company_id = c.id FROM companies c
         WHERE jobs.company_id IS NULL AND LOWER(jobs.company) LIKE '%' || LOWER(c.name) || '%'`
      );

      const linked = result.rowCount ?? 0;
      console.log(`Linked ${linked} jobs to companies.`);
      return linked;
    } catch (error) {
      console.error('Failed to link jobs to companies:', error);
      throw error;
    }
  }

  async getCompanies(): Promise<Company[]> {
    try {
      const result = await query(
        `SELECT id, name, sector, careers_url, grad_programme_url, has_grad_programme, last_checked, created_at
         FROM companies
         ORDER BY sector ASC, name ASC`
      );

      return result.rows as Company[];
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      throw error;
    }
  }

  async getCompanyJobs(companyId: number): Promise<Job[]> {
    try {
      const result = await query(
        `SELECT id, title, company, company_id, location, url, description, salary, job_type, source, created_at, updated_at
         FROM jobs
         WHERE company_id = $1
         ORDER BY created_at DESC`,
        [companyId]
      );

      return result.rows as Job[];
    } catch (error) {
      console.error(`Failed to fetch jobs for company ${companyId}:`, error);
      throw error;
    }
  }
}

export function createCompanyTracker(): CompanyTracker {
  return new CompanyTracker();
}
