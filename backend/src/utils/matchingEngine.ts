import { UserProfile, Job, MatchResult } from '../types/index';

export const calculateMatchScore = (
  userProfile: UserProfile,
  job: Job,
): MatchResult => {
  // Skills Match (40%)
  const skillsMatch = calculateSkillsMatch(
    userProfile.skills,
    job.extracted_skills_required || [],
  );

  // Experience Match (30%)
  const experienceMatch = calculateExperienceMatch(
    userProfile.experience_years,
    job.experience_level,
  );

  // Salary Match (15%)
  const salaryMatch = calculateSalaryMatch(
    userProfile.salary_min || 0,
    userProfile.salary_max || 999999,
    job.salary_min,
    job.salary_max,
  );

  // Location Match (10%)
  const locationMatch = calculateLocationMatch(
    userProfile.target_countries,
    job.country,
  );

  // Education Match (5%)
  const educationMatch = calculateEducationMatch(
    userProfile.education,
    job.degree_required,
  );

  const totalScore =
    (skillsMatch * 40 + experienceMatch * 30 + salaryMatch * 15 + locationMatch * 10 + educationMatch * 5) / 100;

  return {
    skillsMatch: skillsMatch * 40,
    experienceMatch: experienceMatch * 30,
    salaryMatch: salaryMatch * 15,
    locationMatch: locationMatch * 10,
    educationMatch: educationMatch * 5,
    totalScore: Math.round(totalScore * 100) / 100,
  };
};

function calculateSkillsMatch(userSkills: string[], requiredSkills: string[]): number {
  if (requiredSkills.length === 0) return 1;

  const userSkillsLower = userSkills.map((s) => s.toLowerCase());
  const requiredSkillsLower = requiredSkills.map((s) => s.toLowerCase());

  // Count matching skills
  const matchedCount = requiredSkillsLower.filter((skill) =>
    userSkillsLower.some((uSkill) => uSkill.includes(skill) || skill.includes(uSkill)),
  ).length;

  return Math.min(1, matchedCount / requiredSkillsLower.length);
}

function calculateExperienceMatch(userExp: number, jobExpLevel: string | null | undefined): number {
  if (!jobExpLevel) return 0.5; // Neutral if not specified

  const jobExpMatch = jobExpLevel.toLowerCase();

  // Extract years from job experience level
  const yearsMatch = jobExpMatch.match(/(\d+)\+?\s*(?:to|\-)\s*(\d+)/);
  const singleYearMatch = jobExpMatch.match(/(\d+)\+?\s*years?/);

  if (yearsMatch) {
    const minReq = parseInt(yearsMatch[1], 10);
    const maxReq = parseInt(yearsMatch[2], 10);

    if (userExp >= minReq && userExp <= maxReq) {
      return 1;
    }
    if (userExp >= minReq) {
      return 0.8; // Overqualified but acceptable
    }
    return Math.max(0, userExp / minReq);
  }

  if (singleYearMatch) {
    const reqYears = parseInt(singleYearMatch[1], 10);
    if (userExp >= reqYears) {
      return 1;
    }
    return Math.max(0, userExp / reqYears);
  }

  // Check for seniority levels
  if (jobExpMatch.includes('junior') || jobExpMatch.includes('entry')) {
    return userExp <= 2 ? 1 : 0.7;
  }
  if (jobExpMatch.includes('mid') || jobExpMatch.includes('mid-level')) {
    return userExp >= 2 && userExp <= 5 ? 1 : 0.7;
  }
  if (jobExpMatch.includes('senior')) {
    return userExp >= 5 ? 1 : Math.max(0, userExp / 5);
  }

  return 0.5; // Default neutral
}

function calculateSalaryMatch(
  userMin: number,
  userMax: number,
  jobMin: number | null | undefined,
  jobMax: number | null | undefined,
): number {
  if (!jobMin && !jobMax) return 0.5; // Neutral if not specified

  const jobMinVal = jobMin || 0;
  const jobMaxVal = jobMax || userMax + 10000;

  // Check if job salary overlaps with user's range
  if (jobMaxVal < userMin) return 0; // Job pays too little
  if (jobMinVal > userMax) return 0; // Job pays too much
  if (jobMinVal >= userMin && jobMaxVal <= userMax) return 1; // Perfect fit
  if ((jobMinVal >= userMin && jobMinVal <= userMax) || (jobMaxVal >= userMin && jobMaxVal <= userMax)) {
    return 0.8; // Partial overlap
  }

  return 0.5;
}

function calculateLocationMatch(userCountries: string[], jobCountry: string): number {
  if (!jobCountry) return 0.5;
  return userCountries.some((c) => c.toLowerCase() === jobCountry.toLowerCase()) ? 1 : 0;
}

function calculateEducationMatch(userEducation: string | null | undefined, jobDegree: string | null | undefined): number {
  if (!jobDegree) return 1; // No requirement
  if (!userEducation) return 0.5; // Unknown

  const userEdu = (userEducation || '').toLowerCase();
  const jobEdu = (jobDegree || '').toLowerCase();

  // Check if user's education meets job requirement
  if (userEdu.includes('master') || userEdu.includes('ms')) {
    return 1; // Overqualified
  }
  if (userEdu.includes('bachelor') || userEdu.includes('bs')) {
    if (jobEdu.includes('master')) return 0.7;
    return 1;
  }
  if (userEdu.includes('diploma')) {
    return 0.5;
  }

  return 0.5;
}

// Calculate skill vector for clustering
export const getSkillVector = (skills: string[]): Record<string, number> => {
  const vector: Record<string, number> = {};
  for (const skill of skills) {
    vector[skill.toLowerCase()] = (vector[skill.toLowerCase()] || 0) + 1;
  }
  return vector;
};

// Cosine similarity between two skill vectors
export const cosineSimilarity = (
  vector1: Record<string, number>,
  vector2: Record<string, number>,
): number => {
  const allSkills = new Set([...Object.keys(vector1), ...Object.keys(vector2)]);

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (const skill of allSkills) {
    const val1 = vector1[skill] || 0;
    const val2 = vector2[skill] || 0;

    dotProduct += val1 * val2;
    magnitude1 += val1 * val1;
    magnitude2 += val2 * val2;
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) return 0;

  return dotProduct / (magnitude1 * magnitude2);
};
