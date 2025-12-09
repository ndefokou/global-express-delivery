-- Migration: 002_add_contact_fields
-- Created: 2025-12-09

-- Add contact fields to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS livraison_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS expedition_contact_name TEXT,
ADD COLUMN IF NOT EXISTS expedition_contact_phone TEXT;
