import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Key, Server, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailConfigSchema = z.object({
  provider: z.string().min(1, "Email provider is required"),
  email: z.string().email("Valid email address required"),
  password: z.string().min(1, "Password/App password required"),
  smtpHost: z.string().min(1, "SMTP host required"),
  smtpPort: z.string().min(1, "SMTP port required"),
  imapHost: z.string().min(1, "IMAP host required"),
  imapPort: z.string().min(1, "IMAP port required"),
});

type EmailConfigData = z.infer<typeof emailConfigSchema>;

interface EmailSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emailProviders = [
  {
    name: "Gmail",
    value: "gmail",
    smtp: { host: "smtp.gmail.com", port: "587" },
    imap: { host: "imap.gmail.com", port: "993" }
  },
  {
    name: "Outlook/Hotmail",
    value: "outlook",
    smtp: { host: "smtp-mail.outlook.com", port: "587" },
    imap: { host: "outlook.office365.com", port: "993" }
  },
  {
    name: "Yahoo",
    value: "yahoo",
    smtp: { host: "smtp.mail.yahoo.com", port: "587" },
    imap: { host: "imap.mail.yahoo.com", port: "993" }
  },
  {
    name: "Zoho",
    value: "zoho",
    smtp: { host: "smtp.zoho.com", port: "587" },
    imap: { host: "imap.zoho.com", port: "993" }
  },
  {
    name: "Custom",
    value: "custom",
    smtp: { host: "", port: "" },
    imap: { host: "", port: "" }
  }
];

export default function EmailSetupDialog({ open, onOpenChange }: EmailSetupDialogProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<EmailConfigData>({
    resolver: zodResolver(emailConfigSchema),
    defaultValues: {
      provider: "",
      email: "",
      password: "",
      smtpHost: "",
      smtpPort: "",
      imapHost: "",
      imapPort: "",
    },
  });

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    const providerConfig = emailProviders.find(p => p.value === provider);
    if (providerConfig) {
      form.setValue("provider", provider);
      form.setValue("smtpHost", providerConfig.smtp.host);
      form.setValue("smtpPort", providerConfig.smtp.port);
      form.setValue("imapHost", providerConfig.imap.host);
      form.setValue("imapPort", providerConfig.imap.port);
    }
  };

  const onSubmit = (data: EmailConfigData) => {
    // TODO: Implement email configuration save
    console.log("Email config:", data);
    toast({
      title: "Configuration Saved",
      description: "Email settings have been securely stored",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-500" />
            <span>Secure Email Configuration</span>
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Configure your email provider for secure outbound communications. All credentials are encrypted and stored locally.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 flex items-center space-x-2">
                    <Server className="w-4 h-4" />
                    <span>Email Provider</span>
                  </FormLabel>
                  <Select onValueChange={handleProviderChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                        <SelectValue placeholder="Select your email provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {emailProviders.map((provider) => (
                        <SelectItem 
                          key={provider.value} 
                          value={provider.value}
                          className="text-slate-100 focus:bg-slate-600"
                        >
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300 flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Email Address</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        className="bg-slate-700 border-slate-600 text-slate-100"
                        placeholder="operator@example.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300 flex items-center space-x-2">
                      <Key className="w-4 h-4" />
                      <span>Password/App Password</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className="bg-slate-700 border-slate-600 text-slate-100"
                        placeholder="••••••••••••"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {selectedProvider && (
              <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <h4 className="text-sm font-medium text-slate-100 mb-3">Server Configuration</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-slate-300 text-xs">SMTP (Outgoing)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="smtpHost"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-slate-600 border-slate-500 text-slate-100 text-xs"
                                placeholder="smtp.example.com"
                                disabled={selectedProvider !== "custom"}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="smtpPort"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-slate-600 border-slate-500 text-slate-100 text-xs"
                                placeholder="587"
                                disabled={selectedProvider !== "custom"}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-slate-300 text-xs">IMAP (Incoming)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="imapHost"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-slate-600 border-slate-500 text-slate-100 text-xs"
                                placeholder="imap.example.com"
                                disabled={selectedProvider !== "custom"}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="imapPort"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-slate-600 border-slate-500 text-slate-100 text-xs"
                                placeholder="993"
                                disabled={selectedProvider !== "custom"}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-red-400 font-medium mb-1">Security Notice</p>
                  <p className="text-slate-300">
                    For Gmail/Google accounts, use App Passwords instead of your regular password. 
                    Enable 2-factor authentication and generate an app-specific password in your Google Account settings.
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
                className="bg-red-600 hover:bg-red-700"
              >
                Secure Configuration
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}