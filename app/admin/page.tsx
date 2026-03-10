"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/contexts/admin-auth-context";
import { EditableCVProvider, useEditableCV } from "@/contexts/editable-cv-context";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  LogOut,
  Save,
  RotateCcw,
  ArrowLeft,
  Check,
  AlertCircle,
  Upload,
  Download,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CVForm } from "./components/cv-form";
import { cvDataVI, cvDataEN, cvDataCN, CVData } from "@/data/cv-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

function AdminDashboardContent() {
  const { logout } = useAdminAuth();
  const { allCVData, updateCVData, removeCVData, resetToDefault } = useEditableCV();
  const { languages, addLanguage, removeLanguage } = useLanguage();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>("vi");
  const [jsonContent, setJsonContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAddLanguageOpen, setIsAddLanguageOpen] = useState(false);
  const [newLangCode, setNewLangCode] = useState("");
  const [newLangLabel, setNewLangLabel] = useState("");
  const [newLangFullName, setNewLangFullName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pushToDatabase = async (newLanguages: any[], newAllCVData: Record<string, CVData>) => {
    try {
      await fetch('/api/cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ languages: newLanguages, allCVData: newAllCVData })
      });
    } catch (err) {
      console.error('Failed to sync to database', err);
    }
  };

  const handleExport = () => {
    try {
      // Export a complete backup containing both language configs and all data
      const exportPayload = {
        languages,
        allCVData,
        _version: 1 // For future backwards compatibility
      };
      
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cv-backup-complete.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess("Complete backup exported successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to export data.");
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        // Detect if this is a legacy format (just one language's CV data)
        // or the new complete backup format
        if (parsed.languages && parsed.allCVData) {
          // New format: Restore everything
          
          // 1. Restore languages
          parsed.languages.forEach((langConfig: any) => {
            if (!languages.some(l => l.code === langConfig.code)) {
              addLanguage(langConfig);
            }
          });
          
          // 2. Restore all data
          Object.entries(parsed.allCVData).forEach(([langCode, data]) => {
            updateCVData(langCode, data as CVData);
          });
          
          // 3. Navigate back to VI
          setActiveTab("vi");
          setJsonContent(JSON.stringify(parsed.allCVData["vi"] || cvDataVI, null, 2));
          
          pushToDatabase(parsed.languages, parsed.allCVData);
          setSuccess("Complete backup imported successfully!");
        } else {
          // Legacy format: Import just to current tab
          setJsonContent(JSON.stringify(parsed, null, 2));
          setSuccess("Legacy single-language data imported. Don't forget to push Save!");
        }
        
        setError("");
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError("Invalid JSON backup file uploaded.");
        setSuccess("");
      }
      
      // Reset input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const currentJSONValid = () => {
    try {
      JSON.parse(jsonContent);
      return true;
    } catch {
      return false;
    }
  };

  const handleFormChange = (newData: CVData) => {
    setJsonContent(JSON.stringify(newData, null, 2));
  };

  useEffect(() => {
    // If the active tab data doesn't exist, fallback to vi data structure so the editor works
    const data = allCVData[activeTab] || cvDataVI;
    setJsonContent(JSON.stringify(data, null, 2));
    setError("");
    setSuccess("");
  }, [activeTab, allCVData]);

  const handleSave = async () => {
    try {
      const parsed = JSON.parse(jsonContent);
      const newAllData = { ...allCVData, [activeTab]: parsed };
      updateCVData(activeTab, parsed);
      
      await pushToDatabase(languages, newAllData);
      
      setSuccess("Saved successfully!");
      setError("");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Invalid JSON format. Please check your input.");
      setSuccess("");
    }
  };

  const handleReset = async () => {
    if (confirm("Are you sure you want to reset all data to default? This will not remove custom languages, but reset core translations.")) {
      resetToDefault();
      
      const defaultData = {
        vi: cvDataVI,
        en: cvDataEN,
        cn: cvDataCN,
      };
      await pushToDatabase(languages, defaultData);
      
      setSuccess("Data reset to default!");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleDeleteLanguage = async () => {
    if (["vi", "en", "cn"].includes(activeTab)) {
      setError("Cannot delete core languages.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    if (confirm(`Are you sure you want to delete this language? This action cannot be undone.`)) {
      const newLanguages = languages.filter(l => l.code !== activeTab);
      removeLanguage(activeTab);
      
      const newAllData = { ...allCVData };
      delete newAllData[activeTab];
      removeCVData(activeTab);
      
      setActiveTab("vi");
      
      await pushToDatabase(newLanguages, newAllData);
      
      setSuccess("Language deleted successfully.");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const handleAddLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLangCode || !newLangLabel || !newLangFullName) {
      setError("Please fill out all fields for the new language.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    const code = newLangCode.toLowerCase().trim();
    if (languages.some(l => l.code === code)) {
      setError("Language code already exists.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const newLang = { code, label: newLangLabel, fullName: newLangFullName };
    const newLanguages = [...languages, newLang];
    
    // Register language in context
    addLanguage(newLang);
    
    const newAllData = { ...allCVData, [code]: cvDataVI };
    // Initialize data to vi defaults and save to trigger storage event
    updateCVData(code, cvDataVI);
    
    await pushToDatabase(newLanguages, newAllData);
    
    // Close modal and switch to new tab
    setIsAddLanguageOpen(false);
    setActiveTab(code);
    setNewLangCode("");
    setNewLangLabel("");
    setNewLangFullName("");
    setSuccess(`Language ${newLangFullName} added successfully!`);
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                View CV
              </Link>
              <h1 className="text-xl font-bold text-foreground">
                Admin Dashboard
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Tab Navigation & Add Language */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {languages.map((tab) => (
              <button
                key={tab.code}
                onClick={() => setActiveTab(tab.code)}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all",
                  activeTab === tab.code
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.fullName} ({tab.label})
              </button>
            ))}
            <Button 
              variant="outline" 
              className="px-4 py-2 border-dashed border-2 ml-auto"
              onClick={() => setIsAddLanguageOpen(true)}
            >
              + Add Language
            </Button>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-accent/20 text-accent-foreground text-sm">
              <Check className="w-4 h-4 shrink-0" />
              {success}
            </div>
          )}

          {/* JSON Editor */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
              <span className="text-sm font-medium text-foreground">
                CV Data ({activeTab.toUpperCase()})
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImport}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Import JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export JSON
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset All
                </Button>
                {!["vi", "en", "cn"].includes(activeTab) && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteLanguage}
                    className="gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Delete Language
                  </Button>
                )}
                <Button size="sm" onClick={handleSave} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save
                </Button>
              </div>
            </div>

            <Tabs defaultValue="form" className="w-full">
              <div className="px-4 py-2 border-b border-border bg-secondary/10">
                <TabsList>
                  <TabsTrigger value="form">Form View</TabsTrigger>
                  <TabsTrigger value="json">JSON View</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="form" className="p-4 m-0 border-none bg-card">
                {!currentJSONValid() ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mb-4 text-destructive/50" />
                    <p className="text-lg font-medium text-foreground mb-2">Invalid JSON</p>
                    <p className="max-w-[400px]">
                      The current CV data contains invalid JSON syntax. Please switch to the JSON View and fix any errors before using the Form View.
                    </p>
                  </div>
                ) : (
                  <CVForm 
                    data={JSON.parse(jsonContent)} 
                    onChange={handleFormChange} 
                  />
                )}
              </TabsContent>

              <TabsContent value="json" className="p-0 m-0 border-none">
                <Textarea
                  value={jsonContent}
                  onChange={(e) => setJsonContent(e.target.value)}
                  className="min-h-[600px] font-mono text-sm border-0 rounded-none focus-visible:ring-0 resize-none bg-card"
                  placeholder="Enter JSON data..."
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
            <h3 className="text-sm font-medium text-foreground mb-2">
              JSON Structure Guide
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                <strong>personal:</strong> name, title, birthday, phone, email,
                github, location
              </li>
              <li>
                <strong>objective:</strong> Your career objective text
              </li>
              <li>
                <strong>skills:</strong> technical (array), soft (array)
              </li>
              <li>
                <strong>experience:</strong> Array of {`{title, company, period, descriptions[]}`}
              </li>
              <li>
                <strong>projects:</strong> Array of {`{name, period, description?, link?, details[]}`}
              </li>
              <li>
                <strong>education:</strong> {`{degree, school, year, grade}`}
              </li>
            </ul>
          </div>
        </div>

        {/* Add Language Modal */}
        <Dialog open={isAddLanguageOpen} onOpenChange={setIsAddLanguageOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Language</DialogTitle>
              <DialogDescription>
                Provide details for the new language. It will be initialized with Vietnamese data which you can edit alongside the form.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddLanguage}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Language Code (e.g., 'fr', 'de')</Label>
                  <Input 
                    id="code" 
                    value={newLangCode} 
                    onChange={e => setNewLangCode(e.target.value)} 
                    placeholder="fr"
                    maxLength={5}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label">Short Label (e.g., 'FR', 'DE')</Label>
                  <Input 
                    id="label" 
                    value={newLangLabel} 
                    onChange={e => setNewLangLabel(e.target.value)} 
                    placeholder="FR"
                    maxLength={5}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullname">Full Name (e.g., 'Français')</Label>
                  <Input 
                    id="fullname" 
                    value={newLangFullName} 
                    onChange={e => setNewLangFullName(e.target.value)} 
                    placeholder="Français"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddLanguageOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Language</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

import { LanguageProvider } from "@/contexts/language-context";

export default function AdminDashboardPage() {
  const { isAuthenticated } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <EditableCVProvider>
        <AdminDashboardContent />
      </EditableCVProvider>
    </LanguageProvider>
  );
}
