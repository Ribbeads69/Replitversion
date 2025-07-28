
import express from 'express';
import { storage } from '../server/storage.js';
import { insertContactSchema, insertTemplateSchema, insertSequenceSchema, insertCampaignSchema } from '../shared/schema.js';
import multer from 'multer';
import { z } from 'zod';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Dashboard routes
app.get("/api/dashboard/metrics", async (req, res) => {
  try {
    const metrics = await storage.getDashboardMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard metrics" });
  }
});

app.get("/api/dashboard/activity", async (req, res) => {
  try {
    const activity = await storage.getRecentActivity();
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recent activity" });
  }
});

// Contact routes
app.get("/api/contacts", async (req, res) => {
  try {
    const contacts = await storage.getContacts();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch contacts" });
  }
});

app.get("/api/contacts/:id", async (req, res) => {
  try {
    const contact = await storage.getContact(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch contact" });
  }
});

app.post("/api/contacts", async (req, res) => {
  try {
    const validatedData = insertContactSchema.parse(req.body);
    
    // Check if email already exists
    const existing = await storage.getContactByEmail(validatedData.email);
    if (existing) {
      return res.status(400).json({ message: "Contact with this email already exists" });
    }

    const contact = await storage.createContact(validatedData);
    res.status(201).json(contact);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create contact" });
  }
});

app.put("/api/contacts/:id", async (req, res) => {
  try {
    const validatedData = insertContactSchema.partial().parse(req.body);
    const contact = await storage.updateContact(req.params.id, validatedData);
    
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    
    res.json(contact);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to update contact" });
  }
});

app.delete("/api/contacts/:id", async (req, res) => {
  try {
    const deleted = await storage.deleteContact(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete contact" });
  }
});

// CSV import endpoint
app.post("/api/contacts/import", upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return res.status(400).json({ message: "CSV file must have headers and at least one row" });
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const contacts = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const contact = {
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        position: "",
        phone: "",
        status: "new",
        tags: [],
        customFields: {}
      };

      headers.forEach((header, index) => {
        const value = values[index] || "";
        const cleanHeader = header.replace(/"/g, '').toLowerCase();
        switch (cleanHeader) {
          case 'first_name':
          case 'firstname':
          case 'first name':
            contact.firstName = value.replace(/"/g, '');
            break;
          case 'last_name':
          case 'lastname':
          case 'last name':
            contact.lastName = value.replace(/"/g, '');
            break;
          case 'email':
          case 'email_address':
            contact.email = value.replace(/"/g, '');
            break;
          case 'company':
          case 'organization':
            contact.company = value.replace(/"/g, '');
            break;
          case 'position':
          case 'title':
          case 'job_title':
            contact.position = value.replace(/"/g, '');
            break;
          case 'phone':
          case 'phone_number':
            contact.phone = value.replace(/"/g, '');
            break;
        }
      });

      if (contact.email && contact.firstName && contact.lastName) {
        contacts.push(contact);
      }
    }

    const validatedContacts = contacts.map(c => insertContactSchema.parse(c));
    const createdContacts = await storage.createContactsBulk(validatedContacts);
    
    res.json({ 
      message: `Successfully imported ${createdContacts.length} contacts`,
      contacts: createdContacts
    });
  } catch (error) {
    console.error('CSV import error:', error);
    res.status(500).json({ message: "Failed to import contacts from CSV" });
  }
});

// Template routes
app.get("/api/templates", async (req, res) => {
  try {
    const templates = await storage.getTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch templates" });
  }
});

app.get("/api/templates/:id", async (req, res) => {
  try {
    const template = await storage.getTemplate(req.params.id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch template" });
  }
});

app.post("/api/templates", async (req, res) => {
  try {
    const validatedData = insertTemplateSchema.parse(req.body);
    const template = await storage.createTemplate(validatedData);
    res.status(201).json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create template" });
  }
});

app.put("/api/templates/:id", async (req, res) => {
  try {
    const validatedData = insertTemplateSchema.partial().parse(req.body);
    const template = await storage.updateTemplate(req.params.id, validatedData);
    
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    res.json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to update template" });
  }
});

app.delete("/api/templates/:id", async (req, res) => {
  try {
    const deleted = await storage.deleteTemplate(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete template" });
  }
});

// Sequence routes
app.get("/api/sequences", async (req, res) => {
  try {
    const sequences = await storage.getSequences();
    res.json(sequences);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sequences" });
  }
});

app.get("/api/sequences/:id", async (req, res) => {
  try {
    const sequence = await storage.getSequence(req.params.id);
    if (!sequence) {
      return res.status(404).json({ message: "Sequence not found" });
    }
    res.json(sequence);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sequence" });
  }
});

app.post("/api/sequences", async (req, res) => {
  try {
    const validatedData = insertSequenceSchema.parse(req.body);
    const sequence = await storage.createSequence(validatedData);
    res.status(201).json(sequence);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create sequence" });
  }
});

app.put("/api/sequences/:id", async (req, res) => {
  try {
    const validatedData = insertSequenceSchema.partial().parse(req.body);
    const sequence = await storage.updateSequence(req.params.id, validatedData);
    
    if (!sequence) {
      return res.status(404).json({ message: "Sequence not found" });
    }
    
    res.json(sequence);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to update sequence" });
  }
});

app.delete("/api/sequences/:id", async (req, res) => {
  try {
    const deleted = await storage.deleteSequence(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Sequence not found" });
    }
    res.json({ message: "Sequence deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete sequence" });
  }
});

// Campaign routes
app.get("/api/campaigns", async (req, res) => {
  try {
    const campaigns = await storage.getCampaigns();
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch campaigns" });
  }
});

app.get("/api/campaigns/:id", async (req, res) => {
  try {
    const campaign = await storage.getCampaign(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch campaign" });
  }
});

app.post("/api/campaigns", async (req, res) => {
  try {
    const validatedData = insertCampaignSchema.parse(req.body);
    const campaign = await storage.createCampaign(validatedData);
    res.status(201).json(campaign);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create campaign" });
  }
});

app.put("/api/campaigns/:id", async (req, res) => {
  try {
    const validatedData = insertCampaignSchema.partial().parse(req.body);
    const campaign = await storage.updateCampaign(req.params.id, validatedData);
    
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    res.json(campaign);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to update campaign" });
  }
});

app.delete("/api/campaigns/:id", async (req, res) => {
  try {
    const deleted = await storage.deleteCampaign(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    res.json({ message: "Campaign deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete campaign" });
  }
});

export default app;
