'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, ExternalLinkIcon, BookmarkIcon } from 'lucide-react';
import PieChart from '../../components/PieChart';

interface JobDetailsPageProps {
  params: {
    id: string;
  };
}

interface JobDetails {
  id: string;
  company: string;
  title: string;
  location: string;
  salary: string;
  jobType: string;
  postedDate: string;
  originalLink: string;
  fullDescription: string;
  clusterId: string;
  clusterSize: number;
  userMatchPercentage: number;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  requiredExperience: string;
  education: string;
  softSkills: string[];
}

// Mock job data - replace with actual API call
const MOCK_JOB: JobDetails = {
  id: '1',
  company: 'TechCorp Ireland',
  title: 'Senior Backend Engineer',
  location: 'Dublin, Ireland',
  salary: '$120k - $160k',
  jobType: 'Full-time',
  postedDate: '2 days ago',
  originalLink: 'https://example.com/job/1',
  clusterId: 'C-001',
  clusterSize: 3,
  userMatchPercentage: 92,
  fullDescription: `We are looking for an experienced Senior Backend Engineer to join our growing team. You will be responsible for designing, developing, and maintaining our microservices architecture.

Key Responsibilities:
- Design and implement scalable backend systems
- Lead technical discussions and code reviews
- Mentor junior engineers
- Collaborate with product and frontend teams
- Optimize database performance and queries
- Implement CI/CD pipelines and monitoring

Requirements:
- 5+ years of backend development experience
- Strong knowledge of distributed systems
- Experience with cloud platforms (AWS, GCP, Azure)
- Excellent problem-solving skills
- Strong communication abilities`,
  requiredSkills: ['Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker', 'REST APIs'],
  niceToHaveSkills: ['GraphQL', 'Kubernetes', 'System Design', 'Golang', 'Redis'],
  requiredExperience: '5+ years',
  education: "Bachelor's Degree in Computer Science",
  softSkills: ['Leadership', 'Communication', 'Problem-solving', 'Teamwork'],
};

export default function JobDetailsPage({ params }: JobDetailsPageProps) {
  const job = MOCK_JOB; // In real app, fetch based on params.id
  const [isSaved, setIsSaved] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const handleSaveJob = () => {
    setIsSaved(!isSaved);
  };

  const handleApply = () => {
    setIsApplying(true);
    // Open original job link
    window.open(job.originalLink, '_blank');
    setTimeout(() => setIsApplying(false), 1000);
  };

  const userSkills = ['Node.js', 'TypeScript', 'AWS', 'Docker', 'REST APIs']; // Mock user skills
  const matchedSkills = job.requiredSkills.filter(skill =>
    userSkills.includes(skill)
  );
  const missingSkills = job.requiredSkills.filter(skill =>
    !userSkills.includes(skill)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/search"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-8"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          Back to Results
        </Link>

        {/* Job Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-lg text-gray-600 mt-2">{job.company}</p>
            </div>
            <button
              onClick={handleSaveJob}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                isSaved
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <BookmarkIcon className="w-5 h-5" />
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Location</p>
              <p className="text-gray-900 font-medium mt-1">{job.location}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Salary</p>
              <p className="text-gray-900 font-medium mt-1">{job.salary}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Type</p>
              <p className="text-gray-900 font-medium mt-1">{job.jobType}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Posted</p>
              <p className="text-gray-900 font-medium mt-1">{job.postedDate}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Full JD */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
              <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                {job.fullDescription}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Requirements</h2>

              <div className="space-y-6">
                {/* Required Skills */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map(skill => (
                      <span
                        key={skill}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          userSkills.includes(skill)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Nice-to-Have Skills */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Nice-to-Have Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.niceToHaveSkills.map(skill => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Experience Level
                    </h4>
                    <p className="text-gray-700">{job.requiredExperience}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Education
                    </h4>
                    <p className="text-gray-700">{job.education}</p>
                  </div>
                </div>

                {/* Soft Skills */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Soft Skills
                  </h3>
                  <ul className="space-y-2">
                    {job.softSkills.map(skill => (
                      <li
                        key={skill}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Cluster Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-8 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">∞</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Cluster Optimization</h3>
                  <p className="text-gray-700 mt-2">
                    This job is in cluster <span className="font-semibold">{job.clusterId}</span> with{' '}
                    <span className="font-semibold">{job.clusterSize}</span> similar roles. Use a single CV for all jobs
                    in this cluster to save time!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Match Chart */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                Your Match
              </h3>
              <PieChart
                matchPercentage={job.userMatchPercentage}
                missingSkills={missingSkills.length}
              />
            </div>

            {/* Match Breakdown */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Match Breakdown
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">Skills Match</span>
                    <span className="font-semibold text-gray-900">
                      {matchedSkills.length}/{job.requiredSkills.length}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{
                        width: `${(matchedSkills.length / job.requiredSkills.length) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">You have:</span> {matchedSkills.length} required skills
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">You&apos;re missing:</span> {missingSkills.length} skills
                  </p>
                </div>

                {missingSkills.length > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Missing Skills
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {missingSkills.map(skill => (
                        <span
                          key={skill}
                          className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isApplying ? 'Opening...' : 'Apply Now'}
              </button>
              <button className="w-full border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <ExternalLinkIcon className="w-4 h-4" />
                View Original
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
