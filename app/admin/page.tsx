"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/contexts/admin-auth-context";
import { EditableCVProvider, useEditableCV } from "@/contexts/editable-cv-context";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  LogOut, Save, RotateCcw, ArrowLeft, Check, AlertCircle,
  Upload, Download, RefreshCw, Monitor, PanelLeftClose, PanelLeft,
  Smartphone, Tablet, ExternalLink
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

  // Split-screen state
  const [showPreview, setShowPreview] = useState(true);
  const [deviceView, setDeviceView] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const postMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isIframeReady, setIsIframeReady] = useState(false);

  // ── postMessage sender ──────────────────────────────────────────────────
  const sendPreviewMessage = useCallback(
    (langCode: string, updatedAllCVData: Record<string, CVData>) => {
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) return;
      iframe.contentWindow.postMessage(
        {
          type: "CV_PREVIEW_UPDATE",
          lang: langCode,
          allCVData: updatedAllCVData,
          languages,
        },
        window.location.origin
      );
    },
    [languages]
  );

  // Listen for iframe "ready" signal
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "CV_PREVIEW_READY") {
        setIsIframeReady(true);
        // Send current state right away so preview is not blank
        const currentData = { ...allCVData };
        sendPreviewMessage(activeTab, currentData);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [allCVData, activeTab, sendPreviewMessage]);

  // Debounced postMessage on jsonContent change
  useEffect(() => {
    if (!isIframeReady) return;
    if (postMessageTimerRef.current) clearTimeout(postMessageTimerRef.current);
    postMessageTimerRef.current = setTimeout(() => {
      try {
        const parsed = JSON.parse(jsonContent);
        const updatedAll = { ...allCVData, [activeTab]: parsed };
        sendPreviewMessage(activeTab, updatedAll);
      } catch {
        // Invalid JSON — don't send
      }
    }, 400);
    return () => {
      if (postMessageTimerRef.current) clearTimeout(postMessageTimerRef.current);
    };
  }, [jsonContent, activeTab, allCVData, isIframeReady, sendPreviewMessage]);

  // Reset iframe ready state when lang changes (iframe reloads)
  useEffect(() => {
    setIsIframeReady(false);
  }, [activeTab]);

  const refreshIframe = () => {
    setIsIframeReady(false);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const pushToDatabase = async (newLanguages: any[], newAllCVData: Record<string, CVData>) => {
    try {
      await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ languages: newLanguages, allCVData: newAllCVData }),
      });
      // Clear draft store after real save
      await fetch("/api/cv/preview", { method: "DELETE" });
    } catch (err) {
      console.error("Failed to sync to database", err);
    }
  };

  const handleExport = () => {
    try {
      const exportPayload = { languages, allCVData, _version: 1 };
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
    } catch {
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
        if (parsed.languages && parsed.allCVData) {
          parsed.languages.forEach((langConfig: any) => {
            if (!languages.some((l) => l.code === langConfig.code)) addLanguage(langConfig);
          });
          Object.entries(parsed.allCVData).forEach(([langCode, data]) => {
            updateCVData(langCode, data as CVData);
          });
          setActiveTab("vi");
          setJsonContent(JSON.stringify(parsed.allCVData["vi"] || cvDataVI, null, 2));
          pushToDatabase(parsed.languages, parsed.allCVData);
          setSuccess("Complete backup imported successfully!");
        } else {
          setJsonContent(JSON.stringify(parsed, null, 2));
          setSuccess("Legacy single-language data imported. Don't forget to push Save!");
        }
        setError("");
        setTimeout(() => setSuccess(""), 3000);
      } catch {
        setError("Invalid JSON backup file uploaded.");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const currentJSONValid = () => {
    try { JSON.parse(jsonContent); return true; } catch { return false; }
  };

  const handleFormChange = (newData: CVData) => {
    setJsonContent(JSON.stringify(newData, null, 2));
  };

  useEffect(() => {
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
    }
  };

  const handleReset = async () => {
    if (confirm("Are you sure you want to reset all data to default?")) {
      resetToDefault();
      const defaultData = { vi: cvDataVI, en: cvDataEN, cn: cvDataCN };
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
    if (confirm("Are you sure you want to delete this language?")) {
      const newLanguages = languages.filter((l) => l.code !== activeTab);
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

  const handleLogout = () => { logout(); router.push("/admin/login"); };

  const handleAddLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLangCode || !newLangLabel || !newLangFullName) {
      setError("Please fill out all fields for the new language.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    const code = newLangCode.toLowerCase().trim();
    if (languages.some((l) => l.code === code)) {
      setError("Language code already exists.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    const newLang = { code, label: newLangLabel, fullName: newLangFullName };
    const newLanguages = [...languages, newLang];
    addLanguage(newLang);
    const newAllData = { ...allCVData, [code]: cvDataVI };
    updateCVData(code, cvDataVI);
    await pushToDatabase(newLanguages, newAllData);
    setIsAddLanguageOpen(false);
    setActiveTab(code);
    setNewLangCode(""); setNewLangLabel(""); setNewLangFullName("");
    setSuccess(`Language ${newLangFullName} added successfully!`);
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* ── Header ── */}
      <header className="shrink-0 bg-card/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Left: back + title */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">View CV</span>
            </Link>
            <div className="w-px h-5 bg-border" />
            <h1 className="text-base font-bold text-foreground">Admin Dashboard</h1>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            {/* Preview toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview((p) => !p)}
              className="gap-1.5"
              title={showPreview ? "Hide preview" : "Show preview"}
            >
              {showPreview ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
              <span className="hidden sm:inline">{showPreview ? "Hide" : "Preview"}</span>
            </Button>

            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main split-screen area ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT: Editor panel ── */}
        <div
          className={cn(
            "flex flex-col border-r border-border overflow-hidden transition-all duration-300",
            showPreview ? "w-full lg:w-[30%]" : "w-full"
          )}
        >
          {/* Language tabs */}
          <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/20 flex-wrap">
            {languages.map((tab) => (
              <button
                key={tab.code}
                onClick={() => setActiveTab(tab.code)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  activeTab === tab.code
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="px-3 py-1.5 border-dashed border-2 text-xs ml-auto"
              onClick={() => setIsAddLanguageOpen(true)}
            >
              + Add Language
            </Button>
          </div>

          {/* Status messages */}
          {(error || success) && (
            <div className="shrink-0 px-4 pt-3">
              {error && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-accent/20 text-accent-foreground text-sm">
                  <Check className="w-4 h-4 shrink-0" />
                  {success}
                </div>
              )}
            </div>
          )}

          {/* Editor toolbar */}
          <div className="shrink-0 flex items-center gap-2 px-4 py-2 border-b border-border bg-secondary/10 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground">
              CV Data ({activeTab.toUpperCase()})
            </span>
            <div className="flex-1" />
            <input
              type="file"
              accept=".json"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImport}
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1 h-7 text-xs">
              <Upload className="w-3 h-3" /> Import
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1 h-7 text-xs">
              <Download className="w-3 h-3" /> Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-1 h-7 text-xs">
              <RotateCcw className="w-3 h-3" /> Reset
            </Button>
            {!["vi", "en", "cn"].includes(activeTab) && (
              <Button variant="destructive" size="sm" onClick={handleDeleteLanguage} className="gap-1 h-7 text-xs">
                <AlertCircle className="w-3 h-3" /> Delete
              </Button>
            )}
            <Button size="sm" onClick={handleSave} className="gap-1 h-7 text-xs">
              <Save className="w-3 h-3" /> Save
            </Button>
          </div>

          {/* Editor content — scrollable */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="form" className="h-full flex flex-col">
              <div className="shrink-0 px-4 py-2 border-b border-border bg-secondary/10">
                <TabsList className="h-7">
                  <TabsTrigger value="form" className="text-xs h-6">Form View</TabsTrigger>
                  <TabsTrigger value="json" className="text-xs h-6">JSON View</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="form" className="flex-1 overflow-y-auto p-4 m-0 border-none bg-card">
                {!currentJSONValid() ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mb-4 text-destructive/50" />
                    <p className="text-lg font-medium text-foreground mb-2">Invalid JSON</p>
                    <p className="max-w-[400px]">Switch to JSON View and fix errors first.</p>
                  </div>
                ) : (
                  <CVForm data={JSON.parse(jsonContent)} onChange={handleFormChange} />
                )}
              </TabsContent>

              <TabsContent value="json" className="flex-1 overflow-hidden p-0 m-0 border-none">
                <Textarea
                  value={jsonContent}
                  onChange={(e) => setJsonContent(e.target.value)}
                  className="h-full w-full font-mono text-sm border-0 rounded-none focus-visible:ring-0 resize-none bg-card"
                  placeholder="Enter JSON data..."
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* ── RIGHT: Preview panel ── */}
        {showPreview && (
          <div className="hidden lg:flex flex-col w-[70%] overflow-hidden bg-muted/20">
            {/* Preview toolbar */}
            <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/20">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground mr-2">Live Preview</span>

                {/* Lang selector for preview */}
                <div className="flex items-center gap-1 border-l border-border pl-4">
                  <Link
                    href={`/${activeTab}`}
                    target="_blank"
                    className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
                    title="Open live CV in a new tab"
                  >
                    Open Live
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Center: Device toggles */}
              <div className="flex items-center gap-1 bg-background border border-border rounded-md p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("w-7 h-7 rounded-sm", deviceView === "desktop" && "bg-muted shadow-sm")}
                  onClick={() => setDeviceView("desktop")}
                  title="Desktop view"
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("w-7 h-7 rounded-sm", deviceView === "tablet" && "bg-muted shadow-sm")}
                  onClick={() => setDeviceView("tablet")}
                  title="Tablet view"
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("w-7 h-7 rounded-sm", deviceView === "mobile" && "bg-muted shadow-sm")}
                  onClick={() => setDeviceView("mobile")}
                  title="Mobile view"
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-4">
                {/* Draft indicator */}
                <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Draft
                </div>

                {/* Refresh button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshIframe}
                  className="gap-1.5 h-8 text-xs"
                  title="Force reload preview"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reload
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto flex justify-center bg-zinc-100 dark:bg-zinc-950/50 p-4">
              <div
                className={cn(
                  "relative bg-background overflow-hidden transition-all duration-500 rounded-md shadow-xl border border-border/50",
                  deviceView === "desktop" ? "w-full h-full" : 
                  deviceView === "tablet" ? "w-[768px] h-full" : 
                  "w-[375px] h-full"
                )}
              >
                {!isIframeReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                      <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                      Loading preview...
                    </div>
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  src={`/${activeTab}/preview`}
                  className="w-full h-full border-0"
                  title="CV Live Preview"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Language Modal */}
      <Dialog open={isAddLanguageOpen} onOpenChange={setIsAddLanguageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Language</DialogTitle>
            <DialogDescription>
              Provide details for the new language. Initialized with Vietnamese data.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddLanguage}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Language Code (e.g., 'fr')</Label>
                <Input id="code" value={newLangCode} onChange={(e) => setNewLangCode(e.target.value)} placeholder="fr" maxLength={5} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="label">Short Label (e.g., 'FR')</Label>
                <Input id="label" value={newLangLabel} onChange={(e) => setNewLangLabel(e.target.value)} placeholder="FR" maxLength={5} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullname">Full Name (e.g., 'Français')</Label>
                <Input id="fullname" value={newLangFullName} onChange={(e) => setNewLangFullName(e.target.value)} placeholder="Français" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddLanguageOpen(false)}>Cancel</Button>
              <Button type="submit">Add Language</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { LanguageProvider } from "@/contexts/language-context";

export default function AdminDashboardPage() {
  const { isAuthenticated } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push("/admin/login");
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
