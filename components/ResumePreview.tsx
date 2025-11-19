import React from 'react';
import { ProfessionalResume } from '../types';

interface ResumePreviewProps {
  data: ProfessionalResume;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ data }) => {
  if (!data) return null;

  const { personalInfo, experience, education, skills, projects, certifications, languages } = data;

  return (
    <div className="w-full flex justify-center items-start py-8 print:p-0 print:block overflow-x-auto">
      {/* 
        SPOTLIGHT EFFECT: 
        The wrapper is dark to match the app, but the resume is white (A4 style) 
        so it looks like a real document sitting on a dark desk.
      */}
      <div className="w-full max-w-[210mm] min-w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-sm p-[20mm] print:shadow-none print:w-full print:max-w-none print:min-w-0 print:p-[15mm] print:m-0 transform origin-top scale-100">
        
        {/* Header - Serif Font for Executive Look */}
        <header className="border-b-2 border-slate-900 pb-6 mb-6">
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-2 text-slate-900 font-serif">{personalInfo?.name || "Your Name"}</h1>
          <div className="text-sm text-slate-600 font-medium flex flex-wrap gap-3 print:text-black">
            {personalInfo?.email && <span>{personalInfo.email}</span>}
            {personalInfo?.phone && <span>• {personalInfo.phone}</span>}
            {personalInfo?.location && <span>• {personalInfo.location}</span>}
            {personalInfo?.linkedin && <span>• {personalInfo.linkedin}</span>}
            {personalInfo?.portfolio && <span>• {personalInfo.portfolio}</span>}
          </div>
        </header>

        {/* Summary */}
        {data.summary && (
          <section className="mb-6 break-inside-avoid">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 mb-3 pb-1 font-serif">Professional Summary</h2>
            <p className="text-sm leading-relaxed text-slate-700 text-justify print:text-black font-sans">
              {data.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 mb-4 pb-1 font-serif">Experience</h2>
          <div className="space-y-5">
            {experience?.map((job, index) => (
              <div key={index} className="break-inside-avoid">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-slate-800 text-base print:text-black font-serif">{job.position}</h3>
                  <span className="text-xs font-medium text-slate-500 whitespace-nowrap print:text-black">{job.duration}</span>
                </div>
                <div className="text-sm font-semibold text-slate-700 mb-2 print:text-black italic">{job.company}</div>
                <ul className="list-disc list-outside ml-4 space-y-1">
                  {job.achievements?.map((detail, idx) => (
                    <li key={idx} className="text-sm text-slate-600 leading-relaxed pl-1 print:text-black font-sans">
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            )) || <p className="text-sm text-slate-400 italic">No experience listed.</p>}
          </div>
        </section>

        {/* Projects - Highlighting Impact */}
        {projects && projects.length > 0 && (
          <section className="mb-6 break-inside-avoid">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 mb-4 pb-1 font-serif">Key Projects</h2>
            <div className="space-y-4">
              {projects.map((project, index) => (
                <div key={index} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-slate-800 text-sm print:text-black font-serif">{project.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mt-1 print:text-black font-sans">{project.description}</p>
                  {project.impact && (
                     <p className="text-sm font-medium text-slate-800 mt-1 bg-slate-50 p-1 rounded border-l-2 border-slate-400 print:border-l-2 print:border-black print:bg-transparent print:p-0 print:pl-2 print:text-black">
                        Impact: <span className="font-normal text-slate-600 print:text-black font-sans">{project.impact}</span>
                     </p>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.technologies.map((tech, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200 print:border-slate-400 print:text-black font-mono">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills & Education Grid - Forced 2 Columns on Print for Compactness */}
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-8 mb-6">
          {/* Skills */}
          <section className="break-inside-avoid">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 mb-3 pb-1 font-serif">Skills</h2>
            
            <div className="mb-3">
               <h3 className="text-xs font-bold text-slate-700 mb-2 uppercase print:text-black">Technical</h3>
               <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {skills?.technical?.map((skill, index) => (
                     <span key={index} className="text-sm text-slate-700 font-medium bg-slate-50 px-2 py-1 rounded border border-slate-100 print:bg-white print:border-0 print:p-0 print:after:content-[','] print:last:after:content-[''] print:text-black">
                        {skill}
                     </span>
                  )) || <span className="text-xs text-slate-400">None listed</span>}
               </div>
            </div>

            <div>
               <h3 className="text-xs font-bold text-slate-700 mb-2 uppercase print:text-black">Soft Skills</h3>
               <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {skills?.soft?.map((skill, index) => (
                     <span key={index} className="text-sm text-slate-700 font-medium bg-slate-50 px-2 py-1 rounded border border-slate-100 print:bg-white print:border-0 print:p-0 print:after:content-[','] print:last:after:content-[''] print:text-black">
                        {skill}
                     </span>
                  )) || <span className="text-xs text-slate-400">None listed</span>}
               </div>
            </div>

          </section>

          {/* Education */}
          <section className="break-inside-avoid">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 mb-3 pb-1 font-serif">Education</h2>
            <div className="space-y-3">
              {education?.map((edu, index) => (
                <div key={index} className="break-inside-avoid">
                  <div className="font-bold text-slate-800 text-sm print:text-black font-serif">{edu.degree}</div>
                  <div className="text-sm text-slate-600 print:text-black">{edu.institution}</div>
                  <div className="text-xs text-slate-500 print:text-black">{edu.year}</div>
                </div>
              )) || <p className="text-sm text-slate-400 italic">No education listed.</p>}
            </div>
          </section>
        </div>

        {/* Certifications & Languages */}
        {(certifications?.length > 0 || languages?.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-8">
            {certifications && certifications.length > 0 && (
              <section className="break-inside-avoid">
                 <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 mb-3 pb-1 font-serif">Certifications</h2>
                 <ul className="space-y-1">
                    {certifications.map((cert, idx) => (
                       <li key={idx} className="text-sm text-slate-700 print:text-black">• {cert}</li>
                    ))}
                 </ul>
              </section>
            )}
            {languages && languages.length > 0 && (
              <section className="break-inside-avoid">
                 <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 mb-3 pb-1 font-serif">Languages</h2>
                 <ul className="flex flex-wrap gap-4">
                    {languages.map((lang, idx) => (
                       <li key={idx} className="text-sm text-slate-700 font-medium bg-slate-50 px-2 py-1 rounded border border-slate-100 print:bg-white print:border-0 print:p-0 print:after:content-[','] print:last:after:content-[''] print:text-black">{lang}</li>
                    ))}
                 </ul>
              </section>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
};

export default ResumePreview;