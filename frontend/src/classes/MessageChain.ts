import { UserLocation } from './Player';

export enum MessageType {
  DirectMessage = 'DirectMessage',
  ProximityMessage = 'ProximityMessage',
  TownMessage = 'TownMessage',
}

function createParticipants(
  directMessageId: string,
  fromId: string,
  fromUserName: string,
  toUserName: string,
): DirectMessageParticipant[] {
  const participantIds = directMessageId.split(':');
  const toId = participantIds.filter(id => id !== fromId)[0];
  const fromParticipant = { userName: fromUserName, userId: fromId };
  const toParticipant = { userName: toUserName, userId: toId };
  return [fromParticipant, toParticipant];
}

export type Message = {
  userId: string;
  fromUserName: string; // matches the user Id
  toUserName: string | null;
  location: UserLocation;
  messageContent: string;
  timestamp: number;
  type: MessageType;
  // null for cases of Proximity and Town Message
  directMessageId: string | null;
};

export interface MessageChainHash {
  [directMessageId: string]: MessageChain;
}

export type DirectMessageParticipant = {
  userName: string;
  userId: string;
};

export default class MessageChain {
  private _messages: Message[] = [];

  private _isActive: boolean;

  private readonly _directMessageId: string | undefined;

  private readonly _participants: DirectMessageParticipant[] | undefined;

  // how many messages have not been viewed by the curret users;
  private _numberUnviewed: number;

  constructor(message?: Message) {
    this._isActive = true;
    if (message && message.directMessageId && message.toUserName) {
      this._directMessageId = message.directMessageId;
      this._participants = createParticipants(
        message.directMessageId,
        message.userId,
        message.fromUserName,
        message.toUserName,
      );
      this._messages.push(message);
      this._numberUnviewed = 1;
    } else {
      this._numberUnviewed = 0;
    }
  }

  get messages(): Message[] {
    return this._messages;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  set isActive(value: boolean) {
    this._isActive = value;
  }

  get directMessageId(): string | undefined {
    return this._directMessageId;
  }

  get participants(): DirectMessageParticipant[] | undefined {
    return this._participants;
  }

  get numberUnviewed(): number {
    return this._numberUnviewed;
  }

  /**
   * Adds new message to this message chain.
   * @param newMessage The new message to add to this chain
   */
  addMessage(newMessage: Message):MessageChain {
    if (this._isActive && !this.isDuplicateMessage(newMessage)) {
      this._messages.push(newMessage);
      this._numberUnviewed += 1;
    }
    return this;
  }

  isDuplicateMessage(newMessage: Message): boolean {
    for (let i = this._messages.length - 1; i >= 0; i -= 1) {
      const messageToCheck = this._messages[i];
      if (messageToCheck.timestamp < newMessage.timestamp) {
        return false;
      }
      if (
        newMessage.timestamp === messageToCheck.timestamp &&
        messageToCheck.fromUserName === newMessage.fromUserName
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * sets number of unviewed messages to zero
   */
  resetNumberUnviewed(): MessageChain {
    this._numberUnviewed = 0;
    return this;
  }
}
