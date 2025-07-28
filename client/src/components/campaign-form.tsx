import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertCampaignSchema, type Sequence, type ContactWithEngagement } from "@shared/schema";
import { z } from "zod";

const campaignFormSchema = insertCampaignSchema.extend({
  name: z.string().min(1, "Campaign name is required"),
  sequenceId: z.string().min(1, "Sequence is required"),
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

interface CampaignFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CampaignForm({ open, onOpenChange }: CampaignFormProps) {
  const { toast } = useToast();

  const { data: sequences } = useQuery<Sequence[]>({
    queryKey: ["/api/sequences"],
  });

  const { data: contacts } = useQuery<ContactWithEngagement[]>({
    queryKey: ["/api/contacts"],
  });

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: "",
      sequenceId: "",
      status: "draft",
      totalContacts: 0,
      sentEmails: 0,
      openedEmails: 0,
      repliedEmails: 0,
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: (data: CampaignFormData) => apiRequest("POST", "/api/campaigns", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Campaign created successfully",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CampaignFormData) => {
    // Set total contacts based on available contacts
    const totalContacts = contacts?.length || 0;
    createCampaignMutation.mutate({
      ...data,
      totalContacts,
    });
  };

  const selectedSequence = sequences?.find(s => s.id === form.watch("sequenceId"));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 max-w-2xl">
        <DialogHeader>
          <DialogTitle>Launch New Campaign</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Campaign Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                      placeholder="e.g., Q1 2024 Product Launch"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sequenceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Email Sequence</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                        <SelectValue placeholder="Select a sequence" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {sequences?.map((sequence) => (
                        <SelectItem 
                          key={sequence.id} 
                          value={sequence.id}
                          className="text-slate-100 focus:bg-slate-600"
                        >
                          {sequence.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedSequence && (
              <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <h4 className="text-sm font-medium text-slate-100 mb-2">Sequence Preview</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Name:</span>
                    <span className="text-slate-300">{selectedSequence.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Steps:</span>
                    <span className="text-slate-300">
                      {Array.isArray(selectedSequence.steps) ? selectedSequence.steps.length : 0}
                    </span>
                  </div>
                  {selectedSequence.description && (
                    <div className="text-sm">
                      <span className="text-slate-400">Description:</span>
                      <p className="text-slate-300 mt-1">{selectedSequence.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <h4 className="text-sm font-medium text-slate-100 mb-2">Campaign Settings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Contacts:</span>
                  <span className="text-slate-300">{contacts?.length || 0} contacts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-slate-300">Draft (will be activated upon launch)</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center">
                  <span className="text-white text-xs">i</span>
                </div>
                <div className="text-sm">
                  <p className="text-blue-400 font-medium mb-1">Campaign Launch</p>
                  <p className="text-slate-300">
                    This campaign will be created as a draft. You can review and activate it from the campaigns page.
                    All contacts in your database will be added to this campaign.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCampaignMutation.isPending}
                className="bg-primary-500 hover:bg-primary-600"
              >
                {createCampaignMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  "Create Campaign"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
