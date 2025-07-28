
import { createClient } from '@supabase/supabase-js';
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
import { IStorage } from "./storage";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

export class SupabaseStorage implements IStorage {
  private supabase = createClient(supabaseUrl, supabaseKey);

  // Contacts
  async getContacts(): Promise<ContactWithEngagement[]> {
    const { data, error } = await this.supabase
      .from('contacts')
      .select(`
        *,
        campaign_contacts(count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(contact => ({
      ...contact,
      campaignCount: contact.campaign_contacts?.length || 0,
      lastCampaign: "Q4 Product Launch" // Will be replaced with actual data
    }));
  }

  async getContact(id: string): Promise<Contact | undefined> {
    const { data, error } = await this.supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return undefined;
    return data;
  }

  async getContactByEmail(email: string): Promise<Contact | undefined> {
    const { data, error } = await this.supabase
      .from('contacts')
      .select('*')
      .eq('email', email)
      .single();

    if (error) return undefined;
    return data;
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const { data, error } = await this.supabase
      .from('contacts')
      .insert(contact)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateContact(id: string, contact: Partial<InsertContact>): Promise<Contact | undefined> {
    const { data, error } = await this.supabase
      .from('contacts')
      .update(contact)
      .eq('id', id)
      .select()
      .single();

    if (error) return undefined;
    return data;
  }

  async deleteContact(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    return !error;
  }

  async createContactsBulk(contacts: InsertContact[]): Promise<Contact[]> {
    const { data, error } = await this.supabase
      .from('contacts')
      .insert(contacts)
      .select();

    if (error) throw error;
    return data;
  }

  // Templates
  async getTemplates(): Promise<Template[]> {
    const { data, error } = await this.supabase
      .from('templates')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const { data, error } = await this.supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return undefined;
    return data;
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const { data, error } = await this.supabase
      .from('templates')
      .insert(template)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTemplate(id: string, template: Partial<InsertTemplate>): Promise<Template | undefined> {
    const { data, error } = await this.supabase
      .from('templates')
      .update(template)
      .eq('id', id)
      .select()
      .single();

    if (error) return undefined;
    return data;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('templates')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Sequences
  async getSequences(): Promise<Sequence[]> {
    const { data, error } = await this.supabase
      .from('sequences')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getSequence(id: string): Promise<Sequence | undefined> {
    const { data, error } = await this.supabase
      .from('sequences')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return undefined;
    return data;
  }

  async createSequence(sequence: InsertSequence): Promise<Sequence> {
    const { data, error } = await this.supabase
      .from('sequences')
      .insert(sequence)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSequence(id: string, sequence: Partial<InsertSequence>): Promise<Sequence | undefined> {
    const { data, error } = await this.supabase
      .from('sequences')
      .update(sequence)
      .eq('id', id)
      .select()
      .single();

    if (error) return undefined;
    return data;
  }

  async deleteSequence(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('sequences')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Campaigns
  async getCampaigns(): Promise<CampaignWithSequence[]> {
    const { data, error } = await this.supabase
      .from('campaigns')
      .select(`
        *,
        sequences(*)
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return data.map(campaign => ({
      ...campaign,
      sequence: campaign.sequences
    }));
  }

  async getCampaign(id: string): Promise<CampaignWithSequence | undefined> {
    const { data, error } = await this.supabase
      .from('campaigns')
      .select(`
        *,
        sequences(*)
      `)
      .eq('id', id)
      .single();

    if (error) return undefined;

    return {
      ...data,
      sequence: data.sequences
    };
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const { data, error } = await this.supabase
      .from('campaigns')
      .insert(campaign)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCampaign(id: string, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const { data, error } = await this.supabase
      .from('campaigns')
      .update(campaign)
      .eq('id', id)
      .select()
      .single();

    if (error) return undefined;
    return data;
  }

  async deleteCampaign(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Campaign Contacts
  async getCampaignContacts(campaignId: string): Promise<CampaignContact[]> {
    const { data, error } = await this.supabase
      .from('campaign_contacts')
      .select('*')
      .eq('campaign_id', campaignId);

    if (error) throw error;
    return data;
  }

  async createCampaignContact(campaignContact: InsertCampaignContact): Promise<CampaignContact> {
    const { data, error } = await this.supabase
      .from('campaign_contacts')
      .insert(campaignContact)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCampaignContact(id: string, campaignContact: Partial<InsertCampaignContact>): Promise<CampaignContact | undefined> {
    const { data, error } = await this.supabase
      .from('campaign_contacts')
      .update(campaignContact)
      .eq('id', id)
      .select()
      .single();

    if (error) return undefined;
    return data;
  }

  // Dashboard
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const { count: totalContacts } = await this.supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true });

    const { count: activeCampaigns } = await this.supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { data: campaigns } = await this.supabase
      .from('campaigns')
      .select('sent_emails, opened_emails, replied_emails');

    const totalSent = campaigns?.reduce((sum, c) => sum + (c.sent_emails || 0), 0) || 0;
    const totalOpened = campaigns?.reduce((sum, c) => sum + (c.opened_emails || 0), 0) || 0;
    const totalReplied = campaigns?.reduce((sum, c) => sum + (c.replied_emails || 0), 0) || 0;

    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const replyRate = totalSent > 0 ? (totalReplied / totalSent) * 100 : 0;

    return {
      totalContacts: totalContacts || 0,
      activeCampaigns: activeCampaigns || 0,
      openRate: Math.round(openRate * 10) / 10,
      replyRate: Math.round(replyRate * 10) / 10,
    };
  }

  async getRecentActivity(): Promise<any[]> {
    // This would be implemented with actual activity tracking
    return [
      {
        id: "1",
        type: "reply",
        message: "Sarah Johnson replied to 'Q4 Product Launch'",
        time: "2 minutes ago",
        icon: "reply"
      }
    ];
  }
}
