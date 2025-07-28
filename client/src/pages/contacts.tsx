import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, Upload, UserPlus, Search, Users } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ContactImportDialog from "@/components/contact-import-dialog";
import type { ContactWithEngagement } from "@shared/schema";

export default function Contacts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const { toast } = useToast();

  const { data: contacts, isLoading } = useQuery<ContactWithEngagement[]>({
    queryKey: ["/api/contacts"],
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/contacts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Target Eliminated",
        description: "Contact removed from database",
      });
    },
    onError: () => {
      toast({
        title: "Operation Failed",
        description: "Failed to eliminate contact",
        variant: "destructive",
      });
    },
  });

  const filteredContacts = contacts?.filter(contact => {
    const matchesSearch = 
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || contact.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(filteredContacts.map(c => c.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (contactId: string, checked: boolean) => {
    if (checked) {
      setSelectedContacts(prev => [...prev, contactId]);
    } else {
      setSelectedContacts(prev => prev.filter(id => id !== contactId));
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      new: "bg-blue-500/20 text-blue-400",
      contacted: "bg-yellow-500/20 text-yellow-400", 
      replied: "bg-green-500/20 text-green-400",
      unsubscribed: "bg-red-500/20 text-red-400"
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.new}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/4"></div>
          <div className="h-32 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="bg-slate-800 border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">Contact Management</h3>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-600"
                onClick={() => setShowImportDialog(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button className="bg-primary-500 hover:bg-primary-600">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-slate-100">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all">All Contacts</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredContacts.length > 0 ? (
            <>
              <div className="rounded-md border border-slate-700">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-700/50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedContacts.length === filteredContacts.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="text-slate-400">Name</TableHead>
                      <TableHead className="text-slate-400">Email</TableHead>
                      <TableHead className="text-slate-400">Company</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-400">Last Contact</TableHead>
                      <TableHead className="text-slate-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact) => (
                      <TableRow key={contact.id} className="border-slate-700 hover:bg-slate-700/50">
                        <TableCell>
                          <Checkbox
                            checked={selectedContacts.includes(contact.id)}
                            onCheckedChange={(checked) => handleSelectContact(contact.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">
                                {getInitials(contact.firstName, contact.lastName)}
                              </span>
                            </div>
                            <span className="text-slate-100 font-medium">
                              {contact.firstName} {contact.lastName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">{contact.email}</TableCell>
                        <TableCell className="text-slate-300">{contact.company || "—"}</TableCell>
                        <TableCell>{getStatusBadge(contact.status)}</TableCell>
                        <TableCell className="text-slate-400">
                          {contact.lastContactedAt 
                            ? new Date(contact.lastContactedAt).toLocaleDateString()
                            : "Never"
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-400 hover:text-blue-400"
                              onClick={() => {
                                // TODO: Implement edit contact
                                toast({
                                  title: "Coming Soon",
                                  description: "Contact editing will be available soon",
                                });
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-400 hover:text-red-400"
                              onClick={() => deleteContactMutation.mutate(contact.id)}
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

              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-slate-400">
                  Showing {filteredContacts.length} of {contacts?.length || 0} contacts
                </p>
                {selectedContacts.length > 0 && (
                  <p className="text-sm text-slate-400">
                    {selectedContacts.length} contacts selected
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-slate-600" />
              <h3 className="mt-2 text-sm font-medium text-slate-100">No contacts found</h3>
              <p className="mt-1 text-sm text-slate-400">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Get started by importing contacts or adding them manually"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <ContactImportDialog 
        open={showImportDialog} 
        onOpenChange={setShowImportDialog}
      />
    </div>
  );
}
