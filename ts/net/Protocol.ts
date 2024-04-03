// Importing required modules and types
import Vector from 'math/Vector';
import Projectile from 'model/projectile/Projectile'; // Note: This import seems unused
import Timer from 'time/Timer';
import Simulation from 'model/Simulation';
import Player from 'model/player/Player';

// Type definition for packet handlers
type PacketHandler = (packet: Array<any>) => void;

// Enum for client-to-server packet types
enum C2SPacketType {
  LOGIN = 1,
  START_GAME,
  POSITION,
  CLOCK_SYNC,
  PLAYER_DIED,
  CHAT_MESSAGE,
  SHIP_CHANGE,
  PRIZE_COLLECTED,
  SET_PRESENCE,
  TUTORIAL_COMPLETED,
  FLAG_CAPTURED,
}

// Protocol class definition
class Protocol {
  private static readonly PROTOCOL_VERSION: string = 'dotproduct.v1';
  private static readonly CLOCK_SYNC_PERIOD: number = 2000;

  private socket: WebSocket;
  private packetQueue: Array<string> = [];
  private eventHandler: VoidFunction = () => {};
  private handlers: Map<number, Array<PacketHandler>> = new Map();
  private syncTimer: number = 0;
  private serverTimeDelta: number = 0;
  private roundTripTime: number = 0;
  private simulation: Simulation | null = null;

  constructor(url: string) {
    this.socket = new WebSocket(url, Protocol.PROTOCOL_VERSION);
    this.socket.addEventListener('open', this.onOpen);
    this.socket.addEventListener('error', this.onClose);
    this.socket.addEventListener('close', this.onClose);
    this.socket.addEventListener('message', this.onMessage);

    this.initializePacketHandlers();
  }

  public getMillisSinceServerTime(timestamp: number): number {
    if (!this.simulation) return 0;

    let diff = timestamp - this.serverTimeDelta;
    if (diff < 0) diff += 0x100000000;

    diff = this.asInt32(this.simulation.getTimeMillis()) - diff;
    if (diff < 0) diff += 0x100000000;

    return diff;
  }

  public getRoundTripTime(): number {
    return this.roundTripTime;
  }

  public registerEventHandler(cb: VoidFunction): void {
    this.eventHandler = cb;
  }

  public registerPacketHandler(packetType: number, cb: PacketHandler): void {
    if (!this.handlers.has(packetType)) {
      this.handlers.set(packetType, []);
    }
    this.handlers.get(packetType)?.push(cb);
  }

  public login(loginData: Object): void {
    this.send([C2SPacketType.LOGIN, loginData]);
  }

  public startGame(simulation: Simulation, ship: number): void {
    this.simulation = simulation;
    this.send([C2SPacketType.START_GAME, ship, this.asInt32(Date.now())]);
    this.syncTimer = Timer.setInterval(this.syncClocks, Protocol.CLOCK_SYNC_PERIOD);
  }

  public sendPosition = (direction: number, position: Vector, velocity: Vector, isSafe: boolean, weaponData?: Object) => {
    const packet = [C2SPacketType.POSITION, this.remoteTime(), direction, position.x, position.y, velocity.x, velocity.y, isSafe];
    if (weaponData) packet.push(weaponData);
    this.send(packet);
  };

  public sendDeath(position: Vector, killer: Player): void {
    this.send([C2SPacketType.PLAYER_DIED, position.x, position.y, killer.id]);
  }

  public sendChat(message: string): void {
    this.send([C2SPacketType.CHAT_MESSAGE, message]);
  }

  public sendShipChange(ship: number): void {
    this.send([C2SPacketType.SHIP_CHANGE, ship]);
  }

  public sendPrizeCollected(type: number, x: number, y: number): void {
    this.send([C2SPacketType.PRIZE_COLLECTED, type, x, y]);
  }

  public sendSetPresence(presence: Player.Presence): void {
    this.send([C2SPacketType.SET_PRESENCE, presence]);
  }

  public sendFlagCaptured(id: number): void {
    this.send([C2SPacketType.FLAG_CAPTURED, this.remoteTime(), id]);
  }

  private onOpen = () => {
    this.packetQueue.forEach((packet) => this.socket.send(packet));
    this.packetQueue = [];
  };

  private onClose = () => {
    Timer.clearInterval(this.syncTimer);
    this.syncTimer = 0;
    this.packetQueue = [];
    this.eventHandler();
  };

  private onMessage = (event: MessageEvent) => {
    let obj;
    try {
      obj = JSON.parse(event.data);
    } catch (e) {
      console.error(`Error parsing JSON: ${event.data}\n${e}`);
      return;
    }

    const packetHandlers = this.handlers.get(obj[0]);
    if (packetHandlers) {
      const slicedObj = obj.slice(1);
      packetHandlers.forEach((handler) => handler(slicedObj));
    } else {
      console.warn(`Invalid packet from server: ${obj}`);
    }
  };

  private send = (data: Object) => {
    const packet = JSON.stringify(data);
    if (this.socket.readyState !== WebSocket.OPEN) {
      this.packetQueue.push(packet);
    } else {
      this.socket.send(packet);
    }
  };

  private asInt32 = (num: number): number => num | 0;

  private remoteTime = (): number => this.simulation ? this.asInt32(this.simulation.getTimeMillis() + this.serverTimeDelta) : 0;

  private syncClocks = () => {
    this.send([C2SPacketType.CLOCK_SYNC, this.asInt32(Date.now())]);
  };

  private initializePacketHandlers() {
    this.registerPacketHandler(Protocol.S2CPacketType.CLOCK_SYNC_REPLY, this.onClockSyncReply);
  }

  private onClockSyncReply = (packet: Array<any>) => {
    const clientTime0 = packet[0];
    const serverTime = packet[1];
    let rtt = this.asInt32(Date.now()) - clientTime0;
    if (rtt < 0) rtt += 0x100000000;

    this.roundTripTime = rtt;
    this.serverTimeDelta = Math.floor(serverTime - clientTime0 - 0.6 * rtt);
    if (this.serverTimeDelta < 0) this.serverTimeDelta += 0x100000000;
  };
}

// S2CPacketType enum defined within Protocol namespace for server-to-client packet types
namespace Protocol {
  export enum S2CPacketType {
    LOGIN_REPLY = 1,
    PLAYER_ENTERED,
    PLAYER_LEFT,
    PLAYER_POSITION,
    CLOCK_SYNC_REPLY,
    PLAYER_DIED,
    CHAT_MESSAGE,
    SHIP_CHANGE,
    SCORE_UPDATE,
    PRIZE_SEED_UPDATE,
    PRIZE_COLLECTED,
    SET_PRESENCE,
    FLAG_UPDATE,
  }
}

// Exporting the Protocol class as default
export default Protocol;
