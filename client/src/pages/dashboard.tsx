import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Zap, Mail, MessageCircle, BarChart3, User } from "lucide-react";
import type { DashboardMetrics } from "@shared/schema";

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: activity, isLoading: activityLoading } = useQuery<any[]>({
    queryKey: ["/api/dashboard/activity"],
  });

  const { data: campaigns, isLoading: campaignsLoading } = useQuery<any[]>({
    queryKey: ["/api/campaigns"],
  });

  if (metricsLoading || activityLoading || campaignsLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-slate-700 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="p-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Target Database</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">
                  {metrics?.totalContacts.toLocaleString() || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <span className="text-green-400 text-sm font-medium">+12%</span>
              <span className="text-slate-400 text-sm ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Active Operations</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">
                  {metrics?.activeCampaigns || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <span className="text-green-400 text-sm font-medium">+2</span>
              <span className="text-slate-400 text-sm ml-2">this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Engagement Rate</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">
                  {metrics ? formatPercentage(metrics.openRate) : "0.0%"}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <span className="text-green-400 text-sm font-medium">+5.2%</span>
              <span className="text-slate-400 text-sm ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Response Rate</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">
                  {metrics ? formatPercentage(metrics.replyRate) : "0.0%"}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <span className="text-green-400 text-sm font-medium">+1.8%</span>
              <span className="text-slate-400 text-sm ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Campaigns */}
        <Card className="bg-slate-800 border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-slate-100">Recent Campaigns</h3>
          </div>
          <CardContent className="p-6">
            {campaigns && campaigns.length > 0 ? (
              <div className="space-y-4">
                {campaigns.slice(0, 3).map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        campaign.status === 'active' ? 'bg-green-500' : 
                        campaign.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-slate-100">{campaign.name}</p>
                        <p className="text-xs text-slate-400">
                          Started {new Date(campaign.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-100">{campaign.sentEmails} sent</p>
                      <p className="text-xs text-green-400">{campaign.repliedEmails} replies</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-slate-600" />
                <p className="mt-2 text-sm text-slate-400">No campaigns yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-slate-800 border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-slate-100">Recent Activity</h3>
          </div>
          <CardContent className="p-6">
            {activity && activity.length > 0 ? (
              <div className="space-y-4">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 py-3 border-b border-slate-700 last:border-b-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.type === 'reply' ? 'bg-green-500/20' :
                      item.type === 'sent' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                    }`}>
                      {item.type === 'reply' ? (
                        <MessageCircle className="w-4 h-4 text-green-500" />
                      ) : item.type === 'sent' ? (
                        <Mail className="w-4 h-4 text-blue-500" />
                      ) : (
                        <User className="w-4 h-4 text-purple-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-100">{item.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="mx-auto h-12 w-12 text-slate-600" />
                <p className="mt-2 text-sm text-slate-400">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
