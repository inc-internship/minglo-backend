export enum ConversationType {
  DIRECT = 'DIRECT', // Direct Message (2 participants)
  CHANNEL = 'CHANNEL', // Group chat (future enh)
}

export enum ParticipantRole {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN', // for channels (future enh)
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE', // (future enh)
  VOICE = 'VOICE', // (future enh)
}
