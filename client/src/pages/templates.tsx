import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, FileText, Plus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TemplateEditor from "@/components/template-editor";
import type { Template } from "@shared/schema";

export default function Templates() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const { toast } = useToast();

  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    },
  });

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowEditor(true);
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setSelectedTemplate(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-slate-800 rounded"></div>
            <div className="h-96 bg-slate-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Template List */}
        <Card className="bg-slate-800 border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100">Email Templates</h3>
              <Button 
                onClick={handleNewTemplate}
                className="bg-primary-500 hover:bg-primary-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </div>
          </div>
          <CardContent className="p-6">
            {templates && templates.length > 0 ? (
              <div className="space-y-4">
                {templates.map((template) => (
                  <div 
                    key={template.id} 
                    className="p-4 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors cursor-pointer"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-slate-100">{template.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          {template.description || "No description"}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          Subject: {template.subject}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-slate-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTemplate(template);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTemplateMutation.mutate(template.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-slate-400">
                      <span>Last modified {new Date(template.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-slate-600" />
                <h3 className="mt-2 text-sm font-medium text-slate-100">No templates yet</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Create your first email template to get started
                </p>
                <Button 
                  onClick={handleNewTemplate}
                  className="mt-4 bg-primary-500 hover:bg-primary-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Template Preview/Editor */}
        <Card className="bg-slate-800 border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-slate-100">Template Preview</h3>
          </div>
          <CardContent className="p-6">
            {selectedTemplate ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Template Name</Label>
                  <div className="mt-1 text-slate-100 font-medium">{selectedTemplate.name}</div>
                </div>
                
                <div>
                  <Label className="text-slate-300">Subject Line</Label>
                  <div className="mt-1 text-slate-100">{selectedTemplate.subject}</div>
                </div>
                
                <div>
                  <Label className="text-slate-300">Email Body</Label>
                  <div className="mt-1 p-4 bg-slate-700 rounded-lg border border-slate-600">
                    <pre className="text-slate-100 text-sm whitespace-pre-wrap font-sans">
                      {selectedTemplate.body}
                    </pre>
                  </div>
                </div>

                {selectedTemplate.description && (
                  <div>
                    <Label className="text-slate-300">Description</Label>
                    <div className="mt-1 text-slate-400 text-sm">{selectedTemplate.description}</div>
                  </div>
                )}

                <Button 
                  onClick={() => setShowEditor(true)}
                  className="w-full bg-primary-500 hover:bg-primary-600"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Template
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-slate-600" />
                <h3 className="mt-2 text-sm font-medium text-slate-100">Select a template</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Choose a template from the list to preview or create a new one
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TemplateEditor
        template={selectedTemplate}
        open={showEditor}
        onOpenChange={setShowEditor}
        onClose={handleCloseEditor}
      />
    </div>
  );
}
