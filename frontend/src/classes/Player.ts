import MessageChain, {
  MessageChainHash,
  ServerMessageChain,
  ServerMessageChainHash,
} from './MessageChain';

function fromServerMessageChainHash(
  messageChainHashFromServer: ServerMessageChainHash,
): MessageChainHash {
  const translatedMessageChainHash: MessageChainHash = {};
  Object.keys(messageChainHashFromServer).forEach(directMessageId => {
    translatedMessageChainHash[directMessageId] = MessageChain.fromServerMessageChain(
      messageChainHashFromServer[directMessageId],
    );
  });
  return translatedMessageChainHash;
}

export default class Player {
  public location?: UserLocation;

  private readonly _id: string;

  private readonly _userName: string;

  private _townMessageChain: MessageChain;

  private _proximityMessageChain: MessageChain;

  private _directMessageChains: MessageChainHash;

  public sprite?: Phaser.GameObjects.Sprite;

  public label?: Phaser.GameObjects.Text;

  constructor(
    id: string,
    userName: string,
    location: UserLocation,
    townMessageChain?: ServerMessageChain,
  ) {
    this._id = id;
    this._userName = userName;
    this.location = location;
    this._townMessageChain = townMessageChain
      ? MessageChain.fromServerMessageChain(townMessageChain)
      : new MessageChain();
    this._proximityMessageChain = new MessageChain();
    this._directMessageChains = {};
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  get townMessageChain(): MessageChain {
    return this._townMessageChain;
  }

  get proximityMessageChain(): MessageChain {
    return this._proximityMessageChain;
  }

  get directMessageChains(): MessageChainHash {
    return this._directMessageChains;
  }

  static fromServerPlayer(playerFromServer: ServerPlayer): Player {
    return new Player(
      playerFromServer._id,
      playerFromServer._userName,
      playerFromServer.location,
      playerFromServer._townMessageChain,
    );
  }
}
export type ServerPlayer = {
  _id: string;
  _userName: string;
  location: UserLocation;
  _townMessageChain: ServerMessageChain;
  _proximityMessageChain: ServerMessageChain;
  _directMessageChains: ServerMessageChainHash;
};

export type Direction = 'front' | 'back' | 'left' | 'right';

export type UserLocation = {
  x: number;
  y: number;
  rotation: Direction;
  moving: boolean;
};
