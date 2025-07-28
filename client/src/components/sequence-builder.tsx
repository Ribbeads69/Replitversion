import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trash2, Plus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertSequenceSchema, type Sequence, type Template } from "@shared/schema";
import { z } from "zod";

const sequenceFormSchema = insertSequenceSchema.extend({
  name: z.string().min(1, "Sequence name is required"),
  steps: z.array(z.object({
    templateId: z.string().min(1, "Template is required"),
    waitDays: z.number().min(0, "Wait days must be 0 or greater"),
  })).min(1, "At least one step is required"),
});

type SequenceFormData = z.infer<typeof sequenceFormSchema>;

interface SequenceStep {
  templateId: string;
  waitDays: number;
}

interface SequenceBuilderProps {
  sequence?: Sequence | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export default function SequenceBuilder({ sequence, open, onOpenChange, onClose }: SequenceBuilderProps) {
  const [steps, setSteps] = useState<SequenceStep[]>([]);
  const { toast } = useToast();

  const { data: templates } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const form = useForm<SequenceFormData>({
    resolver: zodResolver(sequenceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      steps: [],
      isActive: true,
    },
  });

  useEffect(() => {
    if (sequence) {
      const sequenceSteps = Array.isArray(sequence.steps) ? sequence.steps : [];
      setSteps(sequenceSteps);
      form.reset({
        name: sequence.name,
        description: sequence.description || "",
        steps: sequenceSteps,
        isActive: sequence.isActive,
      });
    } else {
      setSteps([{ templateId: "", waitDays: 0 }]);
      form.reset({
        name: "",
        description: "",
        steps: [{ templateId: "", waitDays: 0 }],
        isActive: true,
      });
    }
  }, [sequence, form]);

  const createSequenceMutation = useMutation({
    mutationFn: (data: SequenceFormData) => apiRequest("POST", "/api/sequences", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sequences"] });
      toast({
        title: "Success",
        description: "Sequence created successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create sequence",
        variant: "destructive",
      });
    },
  });

  const updateSequenceMutation = useMutation({
    mutationFn: (data: SequenceFormData) => 
      apiRequest("PUT", `/api/sequences/${sequence?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sequences"] });
      toast({
        title: "Success",
        description: "Sequence updated successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update sequence",
        variant: "destructive",
      });
    },
  });

  const addStep = () => {
    const newSteps = [...steps, { templateId: "", waitDays: 3 }];
    setSteps(newSteps);
    form.setValue("steps", newSteps);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      const newSteps = steps.filter((_, i) => i !== index);
      setSteps(newSteps);
      form.setValue("steps", newSteps);
    }
  };

  const updateStep = (index: number, field: keyof SequenceStep, value: string | number) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
    form.setValue("steps", newSteps);
  };

  const onSubmit = (data: SequenceFormData) => {
    const formData = { ...data, steps };
    if (sequence) {
      updateSequenceMutation.mutate(formData);
    } else {
      createSequenceMutation.mutate(formData);
    }
  };

  const getTemplateName = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    return template?.name || "Select template";
  };

  const isPending = createSequenceMutation.isPending || updateSequenceMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {sequence ? "Edit Sequence" : "Create New Sequence"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Sequence Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-slate-700 border-slate-600 text-slate-100"
                        placeholder="e.g., Cold Outreach Flow"
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
                        placeholder="Brief description of this sequence"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-slate-100">Sequence Steps</h4>
                <Button
                  type="button"
                  onClick={addStep}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Step
                </Button>
              </div>

              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={index} className="sequence-step">
                    <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">{index + 1}</span>
                          </div>
                          <h4 className="text-sm font-medium text-slate-100">
                            Step {index + 1}
                          </h4>
                        </div>
                        {steps.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-red-400"
                            onClick={() => removeStep(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-2">
                            Email Template
                          </label>
                          <Select
                            value={step.templateId}
                            onValueChange={(value) => updateStep(index, "templateId", value)}
                          >
                            <SelectTrigger className="bg-slate-600 border-slate-500 text-slate-100">
                              <SelectValue placeholder="Select template">
                                {getTemplateName(step.templateId)}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              {templates?.map((template) => (
                                <SelectItem 
                                  key={template.id} 
                                  value={template.id}
                                  className="text-slate-100 focus:bg-slate-600"
                                >
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-2">
                            Wait Time
                          </label>
                          <Select
                            value={step.waitDays.toString()}
                            onValueChange={(value) => updateStep(index, "waitDays", parseInt(value))}
                          >
                            <SelectTrigger className="bg-slate-600 border-slate-500 text-slate-100">
                              <SelectValue>
                                {step.waitDays === 0 ? "Send immediately" : `Wait ${step.waitDays} days`}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              <SelectItem value="0" className="text-slate-100 focus:bg-slate-600">
                                Send immediately
                              </SelectItem>
                              <SelectItem value="1" className="text-slate-100 focus:bg-slate-600">
                                Wait 1 day
                              </SelectItem>
                              <SelectItem value="3" className="text-slate-100 focus:bg-slate-600">
                                Wait 3 days
                              </SelectItem>
                              <SelectItem value="7" className="text-slate-100 focus:bg-slate-600">
                                Wait 1 week
                              </SelectItem>
                              <SelectItem value="14" className="text-slate-100 focus:bg-slate-600">
                                Wait 2 weeks
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                type="button"
                variant="outline"
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600"
              >
                Save Draft
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-primary-500 hover:bg-primary-600"
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {sequence ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  sequence ? "Update Sequence" : "Create Sequence"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
