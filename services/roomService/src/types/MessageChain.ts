import { Message, MessageType } from "../CoveyTypes";

/**
 * Each set of messages that a player has is represented by a MessageChain
 */
export default class MessageChain {
    private _messages: Message[] = [];
    private _isActive: boolean;
    private readonly _directMessageId: string | undefined;
    private readonly _participants: string[] | undefined;
    
    constructor(message : Message) {
        this._isActive = true;
        this._messages.push(message);
        if (message.type == MessageType.DirectMessage) {
            this._directMessageId = message.directMessageId;
            
            // split directMessageID into two player IDs
            this._participants = message.directMessageId?.split(':');
        }
        else {
            this._directMessageId = undefined;
            this._participants = undefined;
        }
    }

    get messages(): Message[] {
        return this._messages;
    }
    get isActive(): boolean {
        return this._isActive;
    }
    get directMessageId(): string | undefined {
        return this._directMessageId;
    }
    get participants(): string[] | undefined {
        return this._participants;
    }

}