import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Bold, Italic, Underline, Type, Eye } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertTemplateSchema, type Template } from "@shared/schema";
import { z } from "zod";

const templateFormSchema = insertTemplateSchema.extend({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Subject line is required"),
  body: z.string().min(1, "Email body is required"),
});

type TemplateFormData = z.infer<typeof templateFormSchema>;

interface TemplateEditorProps {
  template?: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export default function TemplateEditor({ template, open, onOpenChange, onClose }: TemplateEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "",
      subject: "",
      body: "",
      description: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (template) {
      form.reset({
        name: template.name,
        subject: template.subject,
        body: template.body,
        description: template.description || "",
        isActive: template.isActive,
      });
    } else {
      form.reset({
        name: "",
        subject: "",
        body: "",
        description: "",
        isActive: true,
      });
    }
  }, [template, form]);

  const createTemplateMutation = useMutation({
    mutationFn: (data: TemplateFormData) => apiRequest("POST", "/api/templates", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Success",
        description: "Template created successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: (data: TemplateFormData) => 
      apiRequest("PUT", `/api/templates/${template?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Success",
        description: "Template updated successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TemplateFormData) => {
    if (template) {
      updateTemplateMutation.mutate(data);
    } else {
      createTemplateMutation.mutate(data);
    }
  };

  const insertVariable = (variable: string) => {
    const bodyValue = form.getValues("body");
    const newBody = bodyValue + `{{${variable}}}`;
    form.setValue("body", newBody);
  };

  const previewBody = form.watch("body")
    .replace(/{{first_name}}/g, "John")
    .replace(/{{last_name}}/g, "Doe")
    .replace(/{{company_name}}/g, "Acme Corp")
    .replace(/{{sender_name}}/g, "Your Name");

  const isPending = createTemplateMutation.isPending || updateTemplateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit Template" : "Create New Template"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Template Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-slate-700 border-slate-600 text-slate-100"
                          placeholder="e.g., Cold Outreach - Product Demo"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Description (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-slate-700 border-slate-600 text-slate-100"
                          placeholder="Brief description of this template"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Subject Line</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-slate-700 border-slate-600 text-slate-100"
                          placeholder="Quick question about {{company_name}}"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Label className="text-slate-300 text-sm font-medium">Variables</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["first_name", "last_name", "company_name", "sender_name"].map((variable) => (
                      <Button
                        key={variable}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600"
                        onClick={() => insertVariable(variable)}
                      >
                        {variable}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">Email Body</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {showPreview ? "Edit" : "Preview"}
                  </Button>
                </div>

                {showPreview ? (
                  <div className="border border-slate-600 rounded-lg overflow-hidden">
                    <div className="bg-slate-700 p-3 border-b border-slate-600">
                      <p className="text-sm text-slate-300">Preview</p>
                    </div>
                    <div className="p-4 bg-slate-700 min-h-[200px]">
                      <pre className="text-slate-100 text-sm whitespace-pre-wrap font-sans">
                        {previewBody}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="border border-slate-600 rounded-lg overflow-hidden">
                            <div className="editor-toolbar bg-slate-700 p-3 flex space-x-2 border-b border-slate-600">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-slate-300 hover:bg-slate-600 p-2 h-auto"
                              >
                                <Bold className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-slate-300 hover:bg-slate-600 p-2 h-auto"
                              >
                                <Italic className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-slate-300 hover:bg-slate-600 p-2 h-auto"
                              >
                                <Underline className="w-4 h-4" />
                              </Button>
                              <div className="w-px bg-slate-600"></div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-slate-300 hover:bg-slate-600 p-2 h-auto"
                              >
                                <Type className="w-4 h-4" />
                              </Button>
                            </div>
                            <Textarea
                              {...field}
                              className="w-full min-h-[200px] bg-slate-700 text-slate-100 border-0 resize-none focus:ring-0 focus:outline-none"
                              placeholder="Hi {{first_name}},

I noticed {{company_name}} is working on some exciting projects. I'd love to show you how our platform has helped similar companies increase their conversion rates by 25%.

Would you be interested in a quick 15-minute demo this week?

Best regards,
{{sender_name}}"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-primary-500 hover:bg-primary-600"
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {template ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  template ? "Update Template" : "Create Template"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
