"use client";

import { useEffect, useState } from "react";
import { CVData } from "@/data/cv-data";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CVFormProps {
  data: CVData;
  onChange: (data: CVData) => void;
}

export function CVForm({ data, onChange }: CVFormProps) {
  // Use local state to avoid firing onChange on every single keystroke if needed,
  // but to keep it simple and synchronized, we'll just fire onChange directly.
  
  const handleChange = (
    section: keyof CVData,
    field: string,
    value: string | string[]
  ) => {
    onChange({
      ...data,
      [section]: {
        ...(data[section] as Record<string, any>),
        [field]: value,
      },
    });
  };

  const handlePersonalChange = (field: keyof CVData["personal"], value: string) => {
    handleChange("personal", field, value);
  };

  const handleEducationChange = (field: keyof CVData["education"], value: string) => {
    handleChange("education", field, value);
  };

  const handleSkillsChange = (type: "technical" | "soft", value: string) => {
    const list = value.split(",").map((s) => s.trim()).filter(Boolean);
    onChange({
      ...data,
      skills: {
        ...data.skills,
        [type]: list,
      },
    });
  };

  // Experience Handlers
  const addExperience = () => {
    onChange({
      ...data,
      experience: [
        ...data.experience,
        { title: "", company: "", period: "", descriptions: [] },
      ],
    });
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const newExp = [...data.experience];
    newExp[index] = { ...newExp[index], [field]: value };
    onChange({ ...data, experience: newExp });
  };

  const removeExperience = (index: number) => {
    const newExp = data.experience.filter((_, i) => i !== index);
    onChange({ ...data, experience: newExp });
  };

  const updateExperienceDescription = (
    expIndex: number,
    value: string
  ) => {
    const descriptions = value.split("\n").filter((s) => s.trim());
    updateExperience(expIndex, "descriptions", descriptions);
  };

  const addProject = () => {
    onChange({
      ...data,
      projects: [...data.projects, { name: "", period: "", description: "", link: "", details: [] }],
    });
  };

  const updateProject = (index: number, field: string, value: any) => {
    const newProj = [...data.projects];
    newProj[index] = { ...newProj[index], [field]: value };
    onChange({ ...data, projects: newProj });
  };

  const updateProjectDetails = (
    projIndex: number,
    value: string
  ) => {
    const details = value.split("\n").filter((s) => s.trim());
    updateProject(projIndex, "details", details);
  };

  const removeProject = (index: number) => {
    const newProj = data.projects.filter((_, i) => i !== index);
    onChange({ ...data, projects: newProj });
  };

  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={["personal", "objective", "skills", "experience", "projects", "education"]} className="w-full">
        
        {/* Personal Info */}
        <AccordionItem value="personal">
          <AccordionTrigger className="text-lg font-semibold">Personal Information</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={data.personal?.name || ""} onChange={(e) => handlePersonalChange("name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={data.personal?.title || ""} onChange={(e) => handlePersonalChange("title", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Birthday</Label>
                <Input value={data.personal?.birthday || ""} onChange={(e) => handlePersonalChange("birthday", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={data.personal?.phone || ""} onChange={(e) => handlePersonalChange("phone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={data.personal?.email || ""} onChange={(e) => handlePersonalChange("email", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>GitHub URL</Label>
                <Input value={data.personal?.github || ""} onChange={(e) => handlePersonalChange("github", e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Location</Label>
                <Input value={data.personal?.location || ""} onChange={(e) => handlePersonalChange("location", e.target.value)} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Objective */}
        <AccordionItem value="objective">
          <AccordionTrigger className="text-lg font-semibold">Objective</AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 space-y-2">
              <Label>Career Objective</Label>
              <Textarea 
                value={data.objective || ""} 
                onChange={(e) => onChange({ ...data, objective: e.target.value })} 
                className="min-h-[100px]"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Skills */}
        <AccordionItem value="skills">
          <AccordionTrigger className="text-lg font-semibold">Skills</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <Label>Technical Skills (comma-separated)</Label>
                <Textarea 
                  value={(data.skills?.technical || []).join(", ")} 
                  onChange={(e) => handleSkillsChange("technical", e.target.value)} 
                  className="min-h-[120px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Soft Skills (comma-separated)</Label>
                <Textarea 
                  value={(data.skills?.soft || []).join(", ")} 
                  onChange={(e) => handleSkillsChange("soft", e.target.value)} 
                  className="min-h-[120px]"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Experience */}
        <AccordionItem value="experience">
          <AccordionTrigger className="text-lg font-semibold">Experience</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-4">
              {data.experience?.map((exp, index) => (
                <div key={index} className="p-4 border border-border rounded-lg relative space-y-4 bg-secondary/10">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeExperience(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-8">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={exp.title || ""} onChange={(e) => updateExperience(index, "title", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input value={exp.company || ""} onChange={(e) => updateExperience(index, "company", e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Period</Label>
                      <Input value={exp.period || ""} onChange={(e) => updateExperience(index, "period", e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Descriptions (One per line)</Label>
                      <Textarea 
                        value={(exp.descriptions || []).join("\n")} 
                        onChange={(e) => updateExperienceDescription(index, e.target.value)} 
                        className="min-h-[120px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addExperience} className="w-full gap-2">
                <Plus className="w-4 h-4" /> Add Experience
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Projects */}
        <AccordionItem value="projects">
          <AccordionTrigger className="text-lg font-semibold">Projects</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-4">
              {data.projects?.map((proj, index) => (
                <div key={index} className="p-4 border border-border rounded-lg relative space-y-4 bg-secondary/10">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeProject(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-8">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={proj.name || ""} onChange={(e) => updateProject(index, "name", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Period</Label>
                      <Input value={proj.period || ""} onChange={(e) => updateProject(index, "period", e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Link (Optional)</Label>
                      <Input value={proj.link || ""} onChange={(e) => updateProject(index, "link", e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Description (Optional/Summary)</Label>
                      <Textarea 
                        value={proj.description || ""} 
                        onChange={(e) => updateProject(index, "description", e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Details (One point per line - Expandable part)</Label>
                      <Textarea 
                        value={(proj.details || []).join("\n")} 
                        onChange={(e) => updateProjectDetails(index, e.target.value)} 
                        className="min-h-[120px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addProject} className="w-full gap-2">
                <Plus className="w-4 h-4" /> Add Project
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Education */}
        <AccordionItem value="education">
          <AccordionTrigger className="text-lg font-semibold">Education</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <Label>Degree</Label>
                <Input value={data.education?.degree || ""} onChange={(e) => handleEducationChange("degree", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>School</Label>
                <Input value={data.education?.school || ""} onChange={(e) => handleEducationChange("school", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input value={data.education?.year || ""} onChange={(e) => handleEducationChange("year", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Grade</Label>
                <Input value={data.education?.grade || ""} onChange={(e) => handleEducationChange("grade", e.target.value)} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
}
