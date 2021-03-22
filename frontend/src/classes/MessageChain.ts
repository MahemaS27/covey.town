export enum MessageType {
  DirectMessage,
  ProximityMessage,
  TownMessage,
}

export type PlayerData = {
  location: SenderUserLocation;
  userName: string;
  id: string;
};

export type SenderDirection = 'front' | 'back' | 'left' | 'right';

export type SenderUserLocation = {
  x: number;
  y: number;
  rotation: SenderDirection;
  moving: boolean;
};

export type Message = {
  // user who sent the message
  user: PlayerData;
  messageContent: string;
  timestamp: string;
  type: MessageType;
  // null for cases of Proximity and Town Message
  directMessageId: string | undefined;
};

export default class MessageChain {
  private _messages: Message[] = [];

  private _isActive: boolean;

  private readonly _directMessageId: string | undefined;

  private readonly _participants: string[] | undefined;

  private _numberUnviewed: number;

  constructor(
    messages?: Message[],
    isActive?: boolean | undefined,
    directMessageId?: string | undefined,
    participants?: string[] | undefined,
  ) {
    if (!messages) {
      // just create if there's no messages already;
      this._isActive = true;
      this._numberUnviewed = 0;
      return;
    }
    this._messages = messages;
    this._numberUnviewed = messages.length;
    this._isActive = isActive || true;
    this._directMessageId = directMessageId;
    this._participants = participants;
    this._numberUnviewed = 0;
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

  /**
   * Adds new message to this message chain.
   * @param newMessage The new message to add to this chain
   */
  addMessage(newMessage: Message): MessageChain {
    this._messages.push(newMessage);
    this._numberUnviewed += 1;
    return this;
  }

  /**
   * sets number of unviewed messages to zero
   */
  resetNumberUnviewed() {
    this._numberUnviewed = 0;
  }

  static fromServerMessageChain(messageChainFromServer: ServerMessageChain): MessageChain {
    return new MessageChain(
      messageChainFromServer._messages,
      messageChainFromServer._isActive,
      messageChainFromServer._directMessageId,
      messageChainFromServer._participants,
    );
  }
}

export type ServerMessageChain = {
  _messages: Message[];
  _isActive: boolean;
  _directMessageId: string | undefined;
  _participants: string[] | undefined;
};

export interface ServerMessageChainHash {
  [directMessageId: string]: ServerMessageChain;
}

export interface MessageChainHash {
  [directMessageId: string]: MessageChain;
}
