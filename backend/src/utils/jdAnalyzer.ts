// JD Analysis Engine - Extract skills, requirements from job descriptions

export interface ExtractedJDData {
  requiredSkills: string[];
  niceToHaveSkills: string[];
  experienceLevel: string | null;
  degreeRequired: string | null;
  softSkills: string[];
  jobType: string | null;
  salaryRange: { min: number | null; max: number | null };
}

// Common tech skills database
const TECH_SKILLS = [
  // Languages
  'python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go', 'rust',
  'php', 'ruby', 'kotlin', 'swift', 'scala', 'r', 'matlab',
  // Frontend
  'react', 'vue', 'angular', 'svelte', 'nextjs', 'html', 'css', 'tailwind',
  // Backend
  'nodejs', 'express', 'django', 'flask', 'fastapi', 'spring', 'rails', 'laravel',
  // Databases
  'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb',
  // Cloud
  'aws', 'gcp', 'azure', 'heroku', 'vercel', 'docker', 'kubernetes', 'terraform',
  // DevOps
  'jenkins', 'gitlab', 'github', 'circleci', 'travis', 'ansible', 'puppet',
  // Tools
  'git', 'jira', 'slack', 'datadog', 'grafana', 'prometheus', 'figma',
  // Data
  'spark', 'hadoop', 'airflow', 'looker', 'tableau', 'power bi', 'sql',
  // Mobile
  'react native', 'flutter', 'ios', 'android', 'swift', 'kotlin',
];

const SOFT_SKILLS = [
  'communication', 'teamwork', 'leadership', 'problem solving', 'critical thinking',
  'time management', 'project management', 'collaboration', 'adaptability',
  'attention to detail', 'analytical', 'creative', 'customer service',
];

const DEGREE_KEYWORDS = [
  'bachelor', 'master', 'phd', 'bs', 'ms', 'ma', 'mba', 'computer science',
  'engineering', 'mathematics', 'physics', 'degree', 'diploma',
];

const SOFT_SKILL_KEYWORDS = [
  'communication', 'teamwork', 'leadership', 'problem solving', 'analytical',
  'critical thinking', 'attention to detail', 'collaborative', 'self-motivated',
  'creative', 'innovative', 'proactive', 'organized', 'flexible', 'adaptable',
];

export const analyzeJD = (jdText: string): ExtractedJDData => {
  const lowerText = jdText.toLowerCase();

  // Extract skills
  const requiredSkills = extractSkills(lowerText, true);
  const niceToHaveSkills = extractSkills(lowerText, false);

  // Extract experience level
  const experienceLevel = extractExperienceLevel(lowerText);

  // Extract degree
  const degreeRequired = extractDegreeRequired(lowerText);

  // Extract soft skills
  const softSkills = extractSoftSkills(lowerText);

  // Extract job type
  const jobType = extractJobType(lowerText);

  // Extract salary
  const salaryRange = extractSalaryRange(jdText);

  return {
    requiredSkills,
    niceToHaveSkills,
    experienceLevel,
    degreeRequired,
    softSkills,
    jobType,
    salaryRange,
  };
};

function extractSkills(text: string, isRequired: boolean): string[] {
  const skills: Set<string> = new Set();

  // Keywords for required skills
  const requiredKeywords = [
    'required skills', 'must have', 'required', 'mandatory', 'essential',
  ];
  const niceKeywords = [
    'nice to have', 'preferred', 'desired', 'bonus', 'additional',
  ];

  // Split by sections
  const sections = text.split(/\n\n|\r\n\r\n/);

  for (const section of sections) {
    const sectionLower = section.toLowerCase();

    // Check if this section is about required or nice-to-have skills
    const isSkillSection = isRequired
      ? requiredKeywords.some((kw) => sectionLower.includes(kw))
      : niceKeywords.some((kw) => sectionLower.includes(kw));

    if (!isSkillSection && isRequired) {
      // For required skills, search the whole document but prioritize skill sections
      continue;
    }

    // Search for skills in this section
    for (const skill of TECH_SKILLS) {
      const regex = new RegExp(`\\b${skill}\\b`, 'gi');
      if (regex.test(sectionLower)) {
        skills.add(skill.toLowerCase());
      }
    }
  }

  // If no skills found in specific section, search entire document
  if (skills.size === 0 || !isRequired) {
    for (const skill of TECH_SKILLS) {
      const regex = new RegExp(`\\b${skill}\\b`, 'gi');
      if (regex.test(text)) {
        skills.add(skill.toLowerCase());
      }
    }
  }

  return Array.from(skills);
}

function extractExperienceLevel(text: string): string | null {
  const patterns = [
    /(\d+)\+?\s*years?\s*(?:of\s+)?(?:experience|exp)/gi,
    /(?:junior|mid-level|senior|lead|staff|principal)/gi,
    /(\d+)\s*-\s*(\d+)\s*years?\s*experience/gi,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return null;
}

function extractDegreeRequired(text: string): string | null {
  for (const degree of DEGREE_KEYWORDS) {
    const regex = new RegExp(`(?:require|need|prefer|prefer).*?${degree}`, 'i');
    if (regex.test(text)) {
      return degree;
    }
  }
  return null;
}

function extractSoftSkills(text: string): string[] {
  const skills: Set<string> = new Set();
  const lowerText = text.toLowerCase();

  for (const skill of SOFT_SKILL_KEYWORDS) {
    const regex = new RegExp(`\\b${skill}\\b`, 'gi');
    if (regex.test(lowerText)) {
      skills.add(skill.toLowerCase());
    }
  }

  return Array.from(skills);
}

function extractJobType(text: string): string | null {
  const types = ['full-time', 'part-time', 'contract', 'freelance', 'temporary'];
  const lowerText = text.toLowerCase();

  for (const type of types) {
    if (lowerText.includes(type)) {
      return type;
    }
  }

  return null;
}

function extractSalaryRange(
  text: string,
): { min: number | null; max: number | null } {
  // Match salary patterns like "$60,000 - $90,000" or "€50k - €75k"
  const salaryPatterns = [
    /[$€£₹]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:-|to)\s*[$€£₹]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
    /(\d{2,3})k\s*[-–]\s*(\d{2,3})k/gi,
  ];

  for (const pattern of salaryPatterns) {
    const match = pattern.exec(text);
    if (match) {
      const min = parseInt(match[1].replace(/,/g, ''), 10);
      const max = parseInt(match[2].replace(/,/g, ''), 10);
      return { min: !Number.isNaN(min) ? min : null, max: !Number.isNaN(max) ? max : null };
    }
  }

  return { min: null, max: null };
}
