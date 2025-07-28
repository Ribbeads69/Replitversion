import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Pause, Trash2, Play, BarChart3, Zap, Mail, MessageCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CampaignForm from "@/components/campaign-form";
import type { CampaignWithSequence } from "@shared/schema";

export default function Campaigns() {
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const { toast } = useToast();

  const { data: campaigns, isLoading } = useQuery<CampaignWithSequence[]>({
    queryKey: ["/api/campaigns"],
  });

  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest("PUT", `/api/campaigns/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Success",
        description: "Campaign updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update campaign",
        variant: "destructive",
      });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/campaigns/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Success",
        description: "Campaign deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
    },
  });

  const handleToggleCampaign = (campaign: CampaignWithSequence) => {
    const newStatus = campaign.status === "active" ? "paused" : "active";
    updateCampaignMutation.mutate({
      id: campaign.id,
      data: { status: newStatus }
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-500/20 text-green-400",
      paused: "bg-yellow-500/20 text-yellow-400",
      draft: "bg-gray-500/20 text-gray-400",
      completed: "bg-blue-500/20 text-blue-400"
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.draft}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const calculateStats = () => {
    if (!campaigns) return { active: 0, sentToday: 0, repliesToday: 0 };
    
    const active = campaigns.filter(c => c.status === "active").length;
    const sentToday = campaigns.reduce((sum, c) => sum + Math.floor(c.sentEmails * 0.1), 0); // Mock daily sends
    const repliesToday = campaigns.reduce((sum, c) => sum + Math.floor(c.repliedEmails * 0.05), 0); // Mock daily replies
    
    return { active, sentToday, repliesToday };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-800 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Campaign Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-100">Campaign Management</h2>
          <p className="text-slate-400 mt-1">Create and monitor your email campaigns</p>
        </div>
        <Button 
          onClick={() => setShowCampaignForm(true)}
          className="bg-primary-500 hover:bg-primary-600"
        >
          Launch New Campaign
        </Button>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Active Campaigns</p>
                <p className="text-3xl font-bold text-slate-100 mt-2">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Emails Sent Today</p>
                <p className="text-3xl font-bold text-slate-100 mt-2">{stats.sentToday}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Replies Today</p>
                <p className="text-3xl font-bold text-slate-100 mt-2">{stats.repliesToday}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign List */}
      <Card className="bg-slate-800 border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100">Active Campaigns</h3>
        </div>
        <CardContent className="p-0">
          {campaigns && campaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-400">Campaign</TableHead>
                    <TableHead className="text-slate-400">Sequence</TableHead>
                    <TableHead className="text-slate-400">Contacts</TableHead>
                    <TableHead className="text-slate-400">Sent</TableHead>
                    <TableHead className="text-slate-400">Opened</TableHead>
                    <TableHead className="text-slate-400">Replied</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell>
                        <div>
                          <p className="text-slate-100 font-medium">{campaign.name}</p>
                          <p className="text-slate-400 text-sm">
                            Started {new Date(campaign.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {campaign.sequence?.name || "No sequence"}
                      </TableCell>
                      <TableCell className="text-slate-300">{campaign.totalContacts}</TableCell>
                      <TableCell className="text-slate-300">{campaign.sentEmails}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-300">{campaign.openedEmails}</span>
                          <span className="text-green-400 text-sm">
                            ({campaign.sentEmails > 0 ? 
                              ((campaign.openedEmails / campaign.sentEmails) * 100).toFixed(1)
                              : 0}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-300">{campaign.repliedEmails}</span>
                          <span className="text-green-400 text-sm">
                            ({campaign.sentEmails > 0 ? 
                              ((campaign.repliedEmails / campaign.sentEmails) * 100).toFixed(1)
                              : 0}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-slate-200"
                            onClick={() => {
                              // TODO: Implement campaign editing
                              toast({
                                title: "Coming Soon",
                                description: "Campaign editing will be available soon",
                              });
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-yellow-400"
                            onClick={() => handleToggleCampaign(campaign)}
                          >
                            {campaign.status === "active" ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-red-400"
                            onClick={() => deleteCampaignMutation.mutate(campaign.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-slate-600" />
              <h3 className="mt-2 text-sm font-medium text-slate-100">No campaigns yet</h3>
              <p className="mt-1 text-sm text-slate-400">
                Create your first campaign to start reaching out to prospects
              </p>
              <Button 
                onClick={() => setShowCampaignForm(true)}
                className="mt-4 bg-primary-500 hover:bg-primary-600"
              >
                Launch New Campaign
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CampaignForm 
        open={showCampaignForm}
        onOpenChange={setShowCampaignForm}
      />
    </div>
  );
}
