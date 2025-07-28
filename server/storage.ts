import { 
  type Contact, 
  type InsertContact,
  type Template,
  type InsertTemplate,
  type Sequence,
  type InsertSequence,
  type Campaign,
  type InsertCampaign,
  type CampaignContact,
  type InsertCampaignContact,
  type DashboardMetrics,
  type CampaignWithSequence,
  type ContactWithEngagement
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Contacts
  getContacts(): Promise<ContactWithEngagement[]>;
  getContact(id: string): Promise<Contact | undefined>;
  getContactByEmail(email: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: string, contact: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: string): Promise<boolean>;
  createContactsBulk(contacts: InsertContact[]): Promise<Contact[]>;

  // Templates
  getTemplates(): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: string, template: Partial<InsertTemplate>): Promise<Template | undefined>;
  deleteTemplate(id: string): Promise<boolean>;

  // Sequences
  getSequences(): Promise<Sequence[]>;
  getSequence(id: string): Promise<Sequence | undefined>;
  createSequence(sequence: InsertSequence): Promise<Sequence>;
  updateSequence(id: string, sequence: Partial<InsertSequence>): Promise<Sequence | undefined>;
  deleteSequence(id: string): Promise<boolean>;

  // Campaigns
  getCampaigns(): Promise<CampaignWithSequence[]>;
  getCampaign(id: string): Promise<CampaignWithSequence | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: string): Promise<boolean>;

  // Campaign Contacts
  getCampaignContacts(campaignId: string): Promise<CampaignContact[]>;
  createCampaignContact(campaignContact: InsertCampaignContact): Promise<CampaignContact>;
  updateCampaignContact(id: string, campaignContact: Partial<InsertCampaignContact>): Promise<CampaignContact | undefined>;

  // Dashboard
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getRecentActivity(): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private contacts: Map<string, Contact>;
  private templates: Map<string, Template>;
  private sequences: Map<string, Sequence>;
  private campaigns: Map<string, Campaign>;
  private campaignContacts: Map<string, CampaignContact>;

  constructor() {
    this.contacts = new Map();
    this.templates = new Map();
    this.sequences = new Map();
    this.campaigns = new Map();
    this.campaignContacts = new Map();
    this.seedData();
  }

  private seedData() {
    // Sample contacts
    const sampleContacts: Contact[] = [
      {
        id: randomUUID(),
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah@techcorp.com",
        company: "TechCorp",
        position: "CTO",
        phone: "+1-555-0123",
        status: "replied",
        tags: ["enterprise", "decision-maker"],
        customFields: {},
        lastContactedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        firstName: "Mike",
        lastName: "Rogers",
        email: "mike@startup.io",
        company: "Startup Inc",
        position: "CEO",
        phone: "+1-555-0124",
        status: "contacted",
        tags: ["startup", "founder"],
        customFields: {},
        lastContactedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      }
    ];

    sampleContacts.forEach(contact => this.contacts.set(contact.id, contact));

    // Sample templates
    const sampleTemplates: Template[] = [
      {
        id: randomUUID(),
        name: "Cold Outreach - Product Demo",
        subject: "Quick question about {{company_name}}",
        body: `Hi {{first_name}},

I noticed {{company_name}} is working on some exciting projects. I'd love to show you how our platform has helped similar companies increase their conversion rates by 25%.

Would you be interested in a quick 15-minute demo this week?

Best regards,
{{sender_name}}`,
        description: "Initial contact for product demonstration",
        isActive: true,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        name: "Follow-up #1",
        subject: "Re: Quick question about {{company_name}}",
        body: `Hi {{first_name}},

I wanted to follow up on my previous email about how we can help {{company_name}} improve conversion rates.

I understand you're busy, but I'd love to share a quick case study of how we helped a similar company achieve great results.

Would you have 10 minutes this week for a brief call?

Best,
{{sender_name}}`,
        description: "First follow-up for non-responders",
        isActive: true,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      }
    ];

    sampleTemplates.forEach(template => this.templates.set(template.id, template));

    // Sample sequences
    const sampleSequences: Sequence[] = [
      {
        id: randomUUID(),
        name: "Cold Outreach Flow",
        description: "Complete cold outreach sequence with follow-ups",
        steps: [
          { templateId: Array.from(this.templates.keys())[0], waitDays: 0 },
          { templateId: Array.from(this.templates.keys())[1], waitDays: 3 },
        ],
        isActive: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      }
    ];

    sampleSequences.forEach(sequence => this.sequences.set(sequence.id, sequence));

    // Sample campaigns
    const sampleCampaigns: Campaign[] = [
      {
        id: randomUUID(),
        name: "Q4 Product Launch",
        sequenceId: Array.from(this.sequences.keys())[0],
        status: "active",
        totalContacts: 500,
        sentEmails: 342,
        openedEmails: 118,
        repliedEmails: 23,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      }
    ];

    sampleCampaigns.forEach(campaign => this.campaigns.set(campaign.id, campaign));
  }

  // Contacts
  async getContacts(): Promise<ContactWithEngagement[]> {
    const contactsArray = Array.from(this.contacts.values());
    return contactsArray.map(contact => ({
      ...contact,
      campaignCount: Array.from(this.campaignContacts.values()).filter(cc => cc.contactId === contact.id).length,
      lastCampaign: "Q4 Product Launch" // Mock data
    }));
  }

  async getContact(id: string): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async getContactByEmail(email: string): Promise<Contact | undefined> {
    return Array.from(this.contacts.values()).find(contact => contact.email === email);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = {
      ...insertContact,
      id,
      createdAt: new Date(),
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async updateContact(id: string, updates: Partial<InsertContact>): Promise<Contact | undefined> {
    const existing = this.contacts.get(id);
    if (!existing) return undefined;

    const updated: Contact = { ...existing, ...updates };
    this.contacts.set(id, updated);
    return updated;
  }

  async deleteContact(id: string): Promise<boolean> {
    return this.contacts.delete(id);
  }

  async createContactsBulk(contacts: InsertContact[]): Promise<Contact[]> {
    const created: Contact[] = [];
    for (const contact of contacts) {
      const newContact = await this.createContact(contact);
      created.push(newContact);
    }
    return created;
  }

  // Templates
  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const now = new Date();
    const template: Template = {
      ...insertTemplate,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.templates.set(id, template);
    return template;
  }

  async updateTemplate(id: string, updates: Partial<InsertTemplate>): Promise<Template | undefined> {
    const existing = this.templates.get(id);
    if (!existing) return undefined;

    const updated: Template = { 
      ...existing, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.templates.set(id, updated);
    return updated;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return this.templates.delete(id);
  }

  // Sequences
  async getSequences(): Promise<Sequence[]> {
    return Array.from(this.sequences.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getSequence(id: string): Promise<Sequence | undefined> {
    return this.sequences.get(id);
  }

  async createSequence(insertSequence: InsertSequence): Promise<Sequence> {
    const id = randomUUID();
    const now = new Date();
    const sequence: Sequence = {
      ...insertSequence,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.sequences.set(id, sequence);
    return sequence;
  }

  async updateSequence(id: string, updates: Partial<InsertSequence>): Promise<Sequence | undefined> {
    const existing = this.sequences.get(id);
    if (!existing) return undefined;

    const updated: Sequence = { 
      ...existing, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.sequences.set(id, updated);
    return updated;
  }

  async deleteSequence(id: string): Promise<boolean> {
    return this.sequences.delete(id);
  }

  // Campaigns
  async getCampaigns(): Promise<CampaignWithSequence[]> {
    const campaignArray = Array.from(this.campaigns.values());
    return campaignArray.map(campaign => ({
      ...campaign,
      sequence: campaign.sequenceId ? this.sequences.get(campaign.sequenceId) : undefined
    })).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getCampaign(id: string): Promise<CampaignWithSequence | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;
    
    return {
      ...campaign,
      sequence: campaign.sequenceId ? this.sequences.get(campaign.sequenceId) : undefined
    };
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = randomUUID();
    const now = new Date();
    const campaign: Campaign = {
      ...insertCampaign,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: string, updates: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const existing = this.campaigns.get(id);
    if (!existing) return undefined;

    const updated: Campaign = { 
      ...existing, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.campaigns.set(id, updated);
    return updated;
  }

  async deleteCampaign(id: string): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  // Campaign Contacts
  async getCampaignContacts(campaignId: string): Promise<CampaignContact[]> {
    return Array.from(this.campaignContacts.values()).filter(cc => cc.campaignId === campaignId);
  }

  async createCampaignContact(insertCampaignContact: InsertCampaignContact): Promise<CampaignContact> {
    const id = randomUUID();
    const campaignContact: CampaignContact = {
      ...insertCampaignContact,
      id,
      createdAt: new Date(),
    };
    this.campaignContacts.set(id, campaignContact);
    return campaignContact;
  }

  async updateCampaignContact(id: string, updates: Partial<InsertCampaignContact>): Promise<CampaignContact | undefined> {
    const existing = this.campaignContacts.get(id);
    if (!existing) return undefined;

    const updated: CampaignContact = { ...existing, ...updates };
    this.campaignContacts.set(id, updated);
    return updated;
  }

  // Dashboard
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const totalContacts = this.contacts.size;
    const activeCampaigns = Array.from(this.campaigns.values()).filter(c => c.status === 'active').length;
    
    const allCampaigns = Array.from(this.campaigns.values());
    const totalSent = allCampaigns.reduce((sum, c) => sum + c.sentEmails, 0);
    const totalOpened = allCampaigns.reduce((sum, c) => sum + c.openedEmails, 0);
    const totalReplied = allCampaigns.reduce((sum, c) => sum + c.repliedEmails, 0);
    
    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const replyRate = totalSent > 0 ? (totalReplied / totalSent) * 100 : 0;

    return {
      totalContacts,
      activeCampaigns,
      openRate: Math.round(openRate * 10) / 10,
      replyRate: Math.round(replyRate * 10) / 10,
    };
  }

  async getRecentActivity(): Promise<any[]> {
    return [
      {
        id: "1",
        type: "reply",
        message: "Sarah Johnson replied to 'Q4 Product Launch'",
        time: "2 minutes ago",
        icon: "reply"
      },
      {
        id: "2", 
        type: "sent",
        message: "Email sent to 15 contacts in 'Holiday Promotion'",
        time: "15 minutes ago",
        icon: "mail"
      },
      {
        id: "3",
        type: "import",
        message: "147 new contacts imported from CSV",
        time: "1 hour ago",
        icon: "users"
      }
    ];
  }
}

export const storage = new MemStorage();
