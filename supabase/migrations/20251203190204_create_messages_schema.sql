/*
  # Create Messages Schema for Chat Functionality
  
  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references sessions)
      - `surfer_id` (uuid, references users)
      - `photographer_id` (uuid, references users)
      - `last_message_at` (timestamptz)
      - `created_at` (timestamptz)
    
    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references conversations)
      - `sender_id` (uuid, references users)
      - `message` (text)
      - `is_read` (boolean)
      - `created_at` (timestamptz)
  
  2. Indexes
    - Index on conversation_id for fast message retrieval
    - Index on created_at for ordering
  
  3. Security
    - RLS disabled for development (will be enabled in production)
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  surfer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  photographer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id, surfer_id, photographer_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_surfer_id ON conversations(surfer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_photographer_id ON conversations(photographer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- Disable RLS for development
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
