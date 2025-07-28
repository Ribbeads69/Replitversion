import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Copy, Zap, Plus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SequenceBuilder from "@/components/sequence-builder";
import type { Sequence } from "@shared/schema";

export default function Sequences() {
  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const { toast } = useToast();

  const { data: sequences, isLoading } = useQuery<Sequence[]>({
    queryKey: ["/api/sequences"],
  });

  const deleteSequenceMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/sequences/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sequences"] });
      toast({
        title: "Success",
        description: "Sequence deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete sequence",
        variant: "destructive",
      });
    },
  });

  const handleEditSequence = (sequence: Sequence) => {
    setSelectedSequence(sequence);
    setShowBuilder(true);
  };

  const handleNewSequence = () => {
    setSelectedSequence(null);
    setShowBuilder(true);
  };

  const handleCloseBuilder = () => {
    setShowBuilder(false);
    setSelectedSequence(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="h-96 bg-slate-800 rounded"></div>
            <div className="lg:col-span-2 h-96 bg-slate-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sequence List */}
        <Card className="bg-slate-800 border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100">Email Sequences</h3>
              <Button 
                size="sm"
                onClick={handleNewSequence}
                className="bg-primary-500 hover:bg-primary-600"
              >
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
            </div>
          </div>
          <CardContent className="p-6">
            {sequences && sequences.length > 0 ? (
              <div className="space-y-4">
                {sequences.map((sequence) => (
                  <div 
                    key={sequence.id} 
                    className="p-4 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors cursor-pointer"
                    onClick={() => handleEditSequence(sequence)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-slate-100">{sequence.name}</h4>
                      <span className="text-xs text-slate-400">
                        {Array.isArray(sequence.steps) ? sequence.steps.length : 0} steps
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">
                      {sequence.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-400">Active</span>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-slate-200 p-1 h-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSequence(sequence);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-slate-200 p-1 h-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement sequence duplication
                            toast({
                              title: "Coming Soon",
                              description: "Sequence duplication will be available soon",
                            });
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Zap className="mx-auto h-12 w-12 text-slate-600" />
                <h3 className="mt-2 text-sm font-medium text-slate-100">No sequences yet</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Create your first email sequence to automate outreach
                </p>
                <Button 
                  onClick={handleNewSequence}
                  className="mt-4 bg-primary-500 hover:bg-primary-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Sequence
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sequence Builder */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800 border-slate-700">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">Sequence Overview</h3>
                {selectedSequence && (
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline"
                      className="bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600"
                    >
                      Save Draft
                    </Button>
                    <Button 
                      onClick={() => setShowBuilder(true)}
                      className="bg-primary-500 hover:bg-primary-600"
                    >
                      Edit Sequence
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <CardContent className="p-6">
              {selectedSequence ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Sequence Name</h4>
                    <p className="text-slate-100">{selectedSequence.name}</p>
                  </div>
                  
                  {selectedSequence.description && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-2">Description</h4>
                      <p className="text-slate-400 text-sm">{selectedSequence.description}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-4">Sequence Steps</h4>
                    {Array.isArray(selectedSequence.steps) && selectedSequence.steps.length > 0 ? (
                      <div className="space-y-4">
                        {selectedSequence.steps.map((step: any, index: number) => (
                          <div key={index} className="sequence-step">
                            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-medium text-sm">{index + 1}</span>
                                </div>
                                <h4 className="text-sm font-medium text-slate-100">
                                  Step {index + 1}
                                </h4>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-slate-400">Template:</span>
                                  <span className="text-slate-300 ml-2">
                                    {step.templateId || "Not selected"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-400">Wait Time:</span>
                                  <span className="text-slate-300 ml-2">
                                    {step.waitDays === 0 ? "Send immediately" : `Wait ${step.waitDays} days`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-slate-400">No steps configured</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Zap className="mx-auto h-12 w-12 text-slate-600" />
                  <h3 className="mt-2 text-sm font-medium text-slate-100">Select a sequence</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Choose a sequence from the list to view details or create a new one
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <SequenceBuilder
        sequence={selectedSequence}
        open={showBuilder}
        onOpenChange={setShowBuilder}
        onClose={handleCloseBuilder}
      />
    </div>
  );
}
