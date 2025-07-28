import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ContactImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContactImportDialog({ open, onOpenChange }: ContactImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/contacts/import', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Import failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Import Successful",
        description: data.message,
      });
      setFile(null);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleImport = () => {
    if (file) {
      importMutation.mutate(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle>Import Contacts from CSV</DialogTitle>
          <DialogDescription className="text-slate-400">
            Upload a CSV file to import your contacts. The file should include columns for first_name, last_name, email, company, and position.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-slate-300">CSV File</Label>
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragOver
                  ? "border-primary-500 bg-primary-500/10"
                  : "border-slate-600 hover:border-slate-500"
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    handleFileSelect(selectedFile);
                  }
                }}
              />
              
              {file ? (
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-slate-100 font-medium">{file.name}</p>
                    <p className="text-slate-400 text-sm">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto h-12 w-12 text-slate-400" />
                  <p className="mt-2 text-slate-300">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-slate-400 text-sm">CSV files only, up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-100 mb-2">CSV Format Example:</h4>
            <div className="text-xs text-slate-300 font-mono bg-slate-800 p-3 rounded border">
              first_name,last_name,email,company,position<br />
              John,Doe,john@example.com,Acme Corp,CEO<br />
              Jane,Smith,jane@company.com,Tech Inc,CTO
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || importMutation.isPending}
              className="bg-primary-500 hover:bg-primary-600"
            >
              {importMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Contacts
                </>
              )}
            </Button>
          </div>

          {importMutation.isError && (
            <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">Import failed. Please check your file format and try again.</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
