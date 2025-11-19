import React, { useState } from 'react';
import { ProfessionalResume } from '../types';
import { LayoutTemplate, Columns, FileText, UserSquare2 } from 'lucide-react';

interface ResumePreviewProps {
  data: ProfessionalResume;
}

type TemplateType = 'classic' | 'modern' | 'executive' | 'minimal';

// ==========================================
// TEMPLATE 1: CLASSIC (Serif, Traditional)
// ==========================================
const TemplateClassic: React.FC<{ data: ProfessionalResume }> = ({ data }) => (
  <div className="p-[20mm] font-serif text-slate-900 h-full min-h-[297mm]">
    {/* Header */}
    <header className="border-b-2 border-slate-900 pb-6 mb-6">
      <h1 className="text-4xl font-bold uppercase tracking-tight mb-2 text-slate-900">{data.personalInfo?.name || "Your Name"}</h1>
      <div className="text-sm text-slate-600 font-medium flex flex-wrap gap-3 print:text-black font-sans">
        {data.personalInfo?.email && <span>{data.personalInfo.email}</span>}
        {data.personalInfo?.phone && <span>• {data.personalInfo.phone}</span>}
        {data.personalInfo?.location && <span>• {data.personalInfo.location}</span>}
        {data.personalInfo?.linkedin && <span>• {data.personalInfo.linkedin}</span>}
        {data.personalInfo?.portfolio && <span>• {data.personalInfo.portfolio}</span>}
      </div>
    </header>

    {/* Summary */}
    {data.summary && (
      <section className="mb-6 break-inside-avoid">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 mb-3 pb-1">Professional Summary</h2>
        <p className="text-sm leading-relaxed text-slate-700 text-justify print:text-black font-sans">
          {data.summary}
        </p>
      </section>
    )}

    {/* Experience */}
    <section className="mb-6">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 mb-4 pb-1">Experience</h2>
      <div className="space-y-5">
        {data.experience?.map((job, index) => (
          <div key={index} className="break-inside-avoid">
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="font-bold text-slate-800 text-base print:text-black">{job.position}</h3>
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap print:text-black font-sans">{job.duration}</span>
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

    {/* Projects */}
    {data.projects && data.projects.length > 0 && (
      <section className="mb-6 break-inside-avoid">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 mb-4 pb-1">Key Projects</h2>
        <div className="space-y-4">
          {data.projects.map((project, index) => (
            <div key={index} className="break-inside-avoid">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-slate-800 text-sm print:text-black">{project.title}</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mt-1 print:text-black font-sans">{project.description}</p>
              {project.impact && (
                  <p className="text-sm font-medium text-slate-800 mt-1 bg-slate-50 p-1 rounded border-l-2 border-slate-400 print:border-l-2 print:border-black print:bg-transparent print:p-0 print:pl-2 print:text-black font-sans">
                    Impact: <span className="font-normal text-slate-600 print:text-black">{project.impact}</span>
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

    {/* Skills & Education Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
      <section className="break-inside-avoid">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 mb-3 pb-1">Skills</h2>
        <div className="mb-3">
            <h3 className="text-xs font-bold text-slate-700 mb-2 uppercase print:text-black font-sans">Technical</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {data.skills?.technical?.map((skill, index) => (
                  <span key={index} className="text-sm text-slate-700 font-medium bg-slate-50 px-2 py-1 rounded border border-slate-100 print:bg-white print:border-0 print:p-0 print:after:content-[','] print:last:after:content-[''] print:text-black font-sans">
                    {skill}
                  </span>
              )) || <span className="text-xs text-slate-400">None listed</span>}
            </div>
        </div>
        <div>
            <h3 className="text-xs font-bold text-slate-700 mb-2 uppercase print:text-black font-sans">Soft Skills</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {data.skills?.soft?.map((skill, index) => (
                  <span key={index} className="text-sm text-slate-700 font-medium bg-slate-50 px-2 py-1 rounded border border-slate-100 print:bg-white print:border-0 print:p-0 print:after:content-[','] print:last:after:content-[''] print:text-black font-sans">
                    {skill}
                  </span>
              )) || <span className="text-xs text-slate-400">None listed</span>}
            </div>
        </div>
      </section>

      <section className="break-inside-avoid">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 mb-3 pb-1">Education</h2>
        <div className="space-y-3">
          {data.education?.map((edu, index) => (
            <div key={index} className="break-inside-avoid">
              <div className="font-bold text-slate-800 text-sm print:text-black">{edu.degree}</div>
              <div className="text-sm text-slate-600 print:text-black font-sans">{edu.institution}</div>
              <div className="text-xs text-slate-500 print:text-black font-sans">{edu.year}</div>
            </div>
          )) || <p className="text-sm text-slate-400 italic">No education listed.</p>}
        </div>
      </section>
    </div>

    {(data.certifications?.length > 0 || data.languages?.length > 0) && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {data.certifications && data.certifications.length > 0 && (
          <section className="break-inside-avoid">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 mb-3 pb-1">Certifications</h2>
              <ul className="space-y-1 font-sans">
                {data.certifications.map((cert, idx) => (
                    <li key={idx} className="text-sm text-slate-700 print:text-black">• {cert}</li>
                ))}
              </ul>
          </section>
        )}
        {data.languages && data.languages.length > 0 && (
          <section className="break-inside-avoid">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 mb-3 pb-1">Languages</h2>
              <ul className="flex flex-wrap gap-4 font-sans">
                {data.languages.map((lang, idx) => (
                    <li key={idx} className="text-sm text-slate-700 font-medium bg-slate-50 px-2 py-1 rounded border border-slate-100 print:bg-white print:border-0 print:p-0 print:after:content-[','] print:last:after:content-[''] print:text-black">{lang}</li>
                ))}
              </ul>
          </section>
        )}
      </div>
    )}
  </div>
);

// ==========================================
// TEMPLATE 2: MODERN (Sidebar, Sans-Serif)
// ==========================================
const TemplateModern: React.FC<{ data: ProfessionalResume }> = ({ data }) => (
  <div className="flex h-full min-h-[297mm] font-sans text-slate-800">
    {/* Left Sidebar */}
    <div className="w-[30%] bg-slate-100 p-6 pt-8 print:bg-slate-100 print:print-color-adjust-exact border-r border-slate-200">
      <div className="mb-8 break-inside-avoid">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-300 pb-1">Contact</h3>
        <div className="flex flex-col gap-2 text-xs font-medium">
           {data.personalInfo?.email && <span className="break-all">{data.personalInfo.email}</span>}
           {data.personalInfo?.phone && <span>{data.personalInfo.phone}</span>}
           {data.personalInfo?.location && <span>{data.personalInfo.location}</span>}
           {data.personalInfo?.linkedin && <span className="break-all text-indigo-600 print:text-black">{data.personalInfo.linkedin}</span>}
           {data.personalInfo?.portfolio && <span className="break-all text-indigo-600 print:text-black">{data.personalInfo.portfolio}</span>}
        </div>
      </div>

      <div className="mb-8 break-inside-avoid">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-300 pb-1">Education</h3>
        <div className="space-y-4">
          {data.education?.map((edu, idx) => (
            <div key={idx}>
               <div className="font-bold text-sm text-slate-800">{edu.degree}</div>
               <div className="text-xs text-slate-600 mb-1">{edu.institution}</div>
               <div className="text-xs text-slate-400">{edu.year}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8 break-inside-avoid">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-300 pb-1">Skills</h3>
        <div className="flex flex-col gap-3">
           <div>
             <span className="text-xs font-bold text-slate-700 block mb-1">Technical</span>
             <div className="flex flex-wrap gap-1">
               {data.skills?.technical?.map((s, i) => <span key={i} className="text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200 print:border-slate-400">{s}</span>)}
             </div>
           </div>
           <div>
             <span className="text-xs font-bold text-slate-700 block mb-1">Soft Skills</span>
             <div className="flex flex-wrap gap-1">
               {data.skills?.soft?.map((s, i) => <span key={i} className="text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200 print:border-slate-400">{s}</span>)}
             </div>
           </div>
        </div>
      </div>
      
      {data.languages && (
         <div className="break-inside-avoid">
           <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-300 pb-1">Languages</h3>
           <ul className="text-xs space-y-1">
             {data.languages.map((l, i) => <li key={i}>• {l}</li>)}
           </ul>
         </div>
      )}
    </div>

    {/* Right Main Content */}
    <div className="w-[70%] p-8 pt-10">
      <div className="mb-8 border-b-2 border-indigo-600 pb-4 print:border-black">
         <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight uppercase">{data.personalInfo?.name}</h1>
      </div>
      
      {data.summary && (
         <div className="mb-8">
            <h2 className="text-lg font-bold text-indigo-600 mb-2 uppercase tracking-wide print:text-black">Profile</h2>
            <p className="text-sm text-slate-700 leading-relaxed text-justify">{data.summary}</p>
         </div>
      )}

      <div className="mb-8">
         <h2 className="text-lg font-bold text-indigo-600 mb-4 uppercase tracking-wide print:text-black">Experience</h2>
         <div className="space-y-6">
            {data.experience?.map((exp, idx) => (
               <div key={idx} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline mb-1">
                     <h3 className="text-base font-bold text-slate-900">{exp.position}</h3>
                     <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded print:bg-transparent print:text-black">{exp.duration}</span>
                  </div>
                  <div className="text-sm font-semibold text-indigo-600 mb-2 print:text-black">{exp.company}</div>
                  <ul className="list-disc ml-4 space-y-1">
                     {exp.achievements?.map((ach, i) => (
                        <li key={i} className="text-sm text-slate-600 leading-relaxed">{ach}</li>
                     ))}
                  </ul>
               </div>
            ))}
         </div>
      </div>

      {data.projects && data.projects.length > 0 && (
         <div>
            <h2 className="text-lg font-bold text-indigo-600 mb-4 uppercase tracking-wide print:text-black">Projects</h2>
            <div className="space-y-4">
               {data.projects.map((proj, idx) => (
                  <div key={idx} className="break-inside-avoid">
                     <h3 className="font-bold text-slate-900 text-sm">{proj.title}</h3>
                     <p className="text-sm text-slate-600 mb-1">{proj.description}</p>
                     {proj.impact && <p className="text-xs font-medium text-slate-800 italic">Impact: {proj.impact}</p>}
                  </div>
               ))}
            </div>
         </div>
      )}
    </div>
  </div>
);

// ==========================================
// TEMPLATE 3: EXECUTIVE (Bold Header, High Contrast)
// ==========================================
const TemplateExecutive: React.FC<{ data: ProfessionalResume }> = ({ data }) => (
  <div className="h-full min-h-[297mm] font-serif text-slate-900">
     {/* Header Block */}
     <div className="bg-slate-900 text-white p-10 print:bg-black print:text-white print:print-color-adjust-exact">
        <h1 className="text-4xl font-bold tracking-wider uppercase mb-4 text-center">{data.personalInfo?.name}</h1>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-300 font-sans">
           {data.personalInfo?.email && <span>{data.personalInfo.email}</span>}
           {data.personalInfo?.phone && <span>{data.personalInfo.phone}</span>}
           {data.personalInfo?.location && <span>{data.personalInfo.location}</span>}
           {data.personalInfo?.linkedin && <span>LinkedIn</span>}
        </div>
     </div>

     <div className="p-10">
        {data.summary && (
           <section className="mb-8 text-center max-w-3xl mx-auto">
              <p className="text-base leading-relaxed italic text-slate-700">{data.summary}</p>
           </section>
        )}

        {/* Two Column Core Skills */}
        <section className="mb-8 border-y-2 border-slate-900 py-4 grid grid-cols-2 gap-8">
           <div>
              <h3 className="font-bold uppercase text-sm mb-2 tracking-widest text-center">Core Competencies</h3>
              <div className="text-sm text-center text-slate-700 leading-relaxed">
                 {data.skills?.technical?.join(" • ")}
              </div>
           </div>
           <div>
              <h3 className="font-bold uppercase text-sm mb-2 tracking-widest text-center">Professional Skills</h3>
              <div className="text-sm text-center text-slate-700 leading-relaxed">
                 {data.skills?.soft?.join(" • ")}
              </div>
           </div>
        </section>

        <section className="mb-8">
           <h2 className="text-xl font-bold uppercase border-b-2 border-slate-300 mb-6 pb-2 tracking-widest">Professional Experience</h2>
           <div className="space-y-8">
              {data.experience?.map((exp, idx) => (
                 <div key={idx} className="break-inside-avoid">
                    <div className="flex justify-between items-end mb-2">
                       <div>
                          <h3 className="text-lg font-bold text-slate-900">{exp.position}</h3>
                          <div className="text-base font-semibold text-slate-700 italic">{exp.company}</div>
                       </div>
                       <span className="font-sans font-medium text-sm bg-slate-100 px-3 py-1 rounded-full print:bg-transparent print:p-0">{exp.duration}</span>
                    </div>
                    <ul className="list-square ml-5 space-y-1.5">
                       {exp.achievements?.map((ach, i) => (
                          <li key={i} className="text-sm text-slate-700 leading-relaxed pl-2">{ach}</li>
                       ))}
                    </ul>
                 </div>
              ))}
           </div>
        </section>

        <div className="grid grid-cols-2 gap-10">
           <section>
              <h2 className="text-lg font-bold uppercase border-b-2 border-slate-300 mb-4 pb-2 tracking-widest">Education</h2>
              <div className="space-y-4">
                 {data.education?.map((edu, idx) => (
                    <div key={idx} className="break-inside-avoid">
                       <div className="font-bold text-slate-900">{edu.degree}</div>
                       <div className="text-sm text-slate-700 italic">{edu.institution}</div>
                       <div className="text-xs font-sans text-slate-500">{edu.year}</div>
                    </div>
                 ))}
              </div>
           </section>
           {data.projects && data.projects.length > 0 && (
             <section>
                <h2 className="text-lg font-bold uppercase border-b-2 border-slate-300 mb-4 pb-2 tracking-widest">Major Projects</h2>
                <div className="space-y-4">
                   {data.projects.map((proj, idx) => (
                      <div key={idx} className="break-inside-avoid">
                         <div className="font-bold text-slate-900">{proj.title}</div>
                         <div className="text-xs text-slate-600">{proj.description}</div>
                         {proj.impact && <div className="text-xs font-medium mt-1">Impact: {proj.impact}</div>}
                      </div>
                   ))}
                </div>
             </section>
           )}
        </div>
     </div>
  </div>
);

// ==========================================
// TEMPLATE 4: MINIMALIST (Clean, Centered, Sans)
// ==========================================
const TemplateMinimal: React.FC<{ data: ProfessionalResume }> = ({ data }) => (
  <div className="p-[20mm] h-full min-h-[297mm] font-sans text-slate-800">
     <header className="text-center mb-10">
        <h1 className="text-3xl font-light tracking-[0.2em] uppercase mb-4 text-slate-900">{data.personalInfo?.name}</h1>
        <div className="flex justify-center gap-4 text-xs uppercase tracking-widest text-slate-500">
           {data.personalInfo?.email && <span>{data.personalInfo.email}</span>}
           {data.personalInfo?.phone && <span>{data.personalInfo.phone}</span>}
           {data.personalInfo?.location && <span>{data.personalInfo.location}</span>}
        </div>
     </header>

     <div className="max-w-2xl mx-auto space-y-10">
        {data.summary && (
           <section className="text-center">
              <p className="text-sm leading-loose text-slate-600">{data.summary}</p>
           </section>
        )}

        {/* Skills Grid */}
        <section>
           <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-center text-slate-400 mb-6">Expertise</h2>
           <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {[...(data.skills?.technical || []), ...(data.skills?.soft || [])].map((skill, i) => (
                 <span key={i} className="text-sm text-slate-800">{skill}</span>
              ))}
           </div>
        </section>

        <section>
           <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-center text-slate-400 mb-8">Experience</h2>
           <div className="space-y-8 border-l border-slate-200 pl-8 ml-4">
              {data.experience?.map((exp, idx) => (
                 <div key={idx} className="relative break-inside-avoid">
                    <span className="absolute -left-[37px] top-1.5 w-3 h-3 bg-slate-200 rounded-full border-2 border-white"></span>
                    <div className="flex justify-between items-baseline mb-2">
                       <h3 className="font-medium text-slate-900">{exp.position}</h3>
                       <span className="text-xs text-slate-400">{exp.duration}</span>
                    </div>
                    <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">{exp.company}</div>
                    <ul className="space-y-1">
                       {exp.achievements?.map((ach, i) => (
                          <li key={i} className="text-sm text-slate-600 font-light">{ach}</li>
                       ))}
                    </ul>
                 </div>
              ))}
           </div>
        </section>

        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-100">
           <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-slate-400">Education</h2>
              <div className="space-y-4">
                 {data.education?.map((edu, idx) => (
                    <div key={idx}>
                       <div className="text-sm font-medium text-slate-900">{edu.degree}</div>
                       <div className="text-xs text-slate-500">{edu.institution}</div>
                    </div>
                 ))}
              </div>
           </section>
           <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-slate-400">Projects</h2>
              <div className="space-y-4">
                 {data.projects?.map((proj, idx) => (
                    <div key={idx}>
                       <div className="text-sm font-medium text-slate-900">{proj.title}</div>
                       <div className="text-xs text-slate-500">{proj.description}</div>
                    </div>
                 ))}
              </div>
           </section>
        </div>
     </div>
  </div>
);

// ==========================================
// MAIN COMPONENT
// ==========================================
const ResumePreview: React.FC<ResumePreviewProps> = ({ data }) => {
  const [activeTemplate, setActiveTemplate] = useState<TemplateType>('classic');

  if (!data) return null;

  const TemplateWrapper = {
    classic: TemplateClassic,
    modern: TemplateModern,
    executive: TemplateExecutive,
    minimal: TemplateMinimal,
  }[activeTemplate];

  return (
    <div className="w-full flex flex-col items-center pb-8">
      {/* Template Toolbar - Hidden in Print */}
      <div className="sticky top-0 z-30 my-6 bg-slate-800/90 backdrop-blur-md p-2 rounded-2xl border border-slate-700 shadow-xl flex gap-2 print:hidden animate-in slide-in-from-top-4 fade-in">
         {[
            { id: 'classic', icon: FileText, label: 'Classic' },
            { id: 'modern', icon: Columns, label: 'Modern' },
            { id: 'executive', icon: UserSquare2, label: 'Executive' },
            { id: 'minimal', icon: LayoutTemplate, label: 'Minimal' },
         ].map((t) => (
            <button
               key={t.id}
               onClick={() => setActiveTemplate(t.id as TemplateType)}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTemplate === t.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
               }`}
            >
               <t.icon className="w-4 h-4" />
               {t.label}
            </button>
         ))}
      </div>

      {/* Resume Wrapper - A4 Dimensions */}
      <div className="w-full flex justify-center items-start overflow-x-auto p-4 print:p-0">
         {/* The A4 Paper */}
         <div className="w-full max-w-[210mm] min-w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-sm print:shadow-none print:w-full print:max-w-none print:min-w-0 print:p-0 print:m-0 transform origin-top scale-100">
            <TemplateWrapper data={data} />
         </div>
      </div>
    </div>
  );
};

export default ResumePreview;