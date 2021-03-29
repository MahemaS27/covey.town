import { UserLocation } from './Player';

export enum MessageType {
  DirectMessage,
  ProximityMessage,
  TownMessage,
}

export type Message = {
  userId: string;
  userName: string;
  location: UserLocation; 
  messageContent: string;
  timestamp: number;
  type: MessageType;
  // null for cases of Proximity and Town Message
  directMessageId: string | undefined;
};

export interface MessageChainHash {
  [directMessageId: string]: MessageChain;
}

export default class MessageChain {
  private _messages: Message[] = [];

  private _isActive: boolean;

  private readonly _directMessageId: string | undefined;

  private readonly _participants: string[] | undefined;

  // how many messages have not been viewed by the curret users;
  private _numberUnviewed: number;

  constructor(message?: Message) {
    this._isActive = true;
    if (message && message.directMessageId) {
      this._directMessageId = message.directMessageId;
      this._participants = message.directMessageId?.split(':');
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

  get participants(): string[] | undefined {
    return this._participants;
  }

  get numberUnviewed(): number {
    return this._numberUnviewed;
  }

  /**
   * Adds new message to this message chain.
   * @param newMessage The new message to add to this chain
   */
  addMessage(newMessage: Message): MessageChain {
    if (this._isActive) {
      this._messages.push(newMessage);
      this._numberUnviewed += 1;
    }

    return this;
  }

  /**
   * sets number of unviewed messages to zero
   */
  resetNumberUnviewed(): MessageChain {
    this._numberUnviewed = 0;
    return this;
  }
}
