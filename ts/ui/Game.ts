import Flag from 'model/Flag';
import Painter from 'graphics/Painter';
import Keyboard from 'input/Keyboard';
import Mouse from 'input/Mouse';
import HudLayer from 'layers/HudLayer';
import NotificationLayer from 'layers/NotificationLayer';
import MapLayer from 'layers/MapLayer';
import RadarLayer from 'layers/RadarLayer';
import Starfield from 'layers/Starfield';
import WeaponIndicators from 'layers/WeaponIndicators';
import GraphicalModelObjectFactory from 'model/impl/GraphicalModelObjectFactory';
import Player from 'model/player/Player';
import Prize from 'model/Prize';
import Simulation from 'model/Simulation';
import Notifications from 'Notifications';
import Protocol from 'net/Protocol';
import Timer from 'time/Timer';
import Viewport from 'Viewport';
import Chat from 'ui/Chat';
import Debug from 'ui/Debug';
import Disconnected from 'ui/Disconnected';
import ResourceManager from 'ResourceManager';
import { PrizeType } from 'types';
import Vector from 'math/Vector';
import Listener from 'Listener';
import RemotePlayer from 'model/player/RemotePlayer';
import MenuBar from 'ui/MenuBar';

export default class Game {
    private protocol_: Protocol;
    private resourceManager_: ResourceManager;
    private simulation_: Simulation;
    private painter_: Painter;
    private keyboard_: Keyboard;
    private mouse_: Mouse;
    private canvas_: HTMLCanvasElement;
    private viewport_: Viewport;
    private notifications_: Notifications;
    private chatView_: Chat;
    private menuBar_: MenuBar;
    private debugView_: Debug;
    private disconnectedView_: Disconnected;
    private lastTime_: number;
    private tickResidue_: number;
    private animationId_: number;

    constructor(protocol: Protocol, resourceManager: ResourceManager, settings: Object, mapData: any, tileProperties: Array<Object>) {
        this.protocol_ = protocol;
        this.resourceManager_ = resourceManager;
        this.keyboard_ = new Keyboard();
        this.mouse_ = new Mouse();
        this.painter_ = new Painter();
        this.simulation_ = new Simulation(new GraphicalModelObjectFactory(this), protocol, settings, mapData, tileProperties);
        this.canvas_ = document.getElementById('gv-canvas') as HTMLCanvasElement;
        this.viewport_ = new Viewport(this, this.canvas_.getContext('2d') as CanvasRenderingContext2D);

        const localPlayer = this.simulation_.playerList.localPlayer;
        this.notifications_ = new Notifications(localPlayer);

        this.chatView_ = new Chat(this);
        this.chatView_.addSystemMessage('Welcome to dotproduct! Press ? for help.');
        this.menuBar_ = new MenuBar(this);
        this.debugView_ = new Debug(this, protocol);
        this.disconnectedView_ = new Disconnected();
        this.lastTime_ = Date.now();
        this.tickResidue_ = 0;
        this.animationId_ = 0;

        new Starfield(this);
        new MapLayer(this);
        new NotificationLayer(this, this.notifications_);
        new RadarLayer(this);
        new HudLayer(this);
        new WeaponIndicators(this);

        this.protocol_.registerEventHandler(this.onConnectionLost_.bind(this));
        this.protocol_.registerPacketHandler(Protocol.S2CPacketType.PLAYER_ENTERED, this.onPlayerEntered_.bind(this));
        this.protocol_.registerPacketHandler(Protocol.S2CPacketType.PLAYER_LEFT, this.onPlayerLeft_.bind(this));
        this.protocol_.registerPacketHandler(Protocol.S2CPacketType.PLAYER_DIED, this.onPlayerDied_.bind(this));
        this.protocol_.registerPacketHandler(Protocol.S2CPacketType.CHAT_MESSAGE, this.onChatMessage_.bind(this));
        this.protocol_.startGame(this.simulation_, localPlayer.ship);

        this.viewport_.followPlayer(localPlayer);

        // Correcting type incompatibility by using a more generic type or ensuring type compatibility
        Listener.add(localPlayer, 'collect_prize', (listener: Listener, prize?: Prize) => this.onLocalPlayerCollectedPrize_(listener as Player, prize));
        Listener.add(localPlayer, 'death', (listener: Listener, killer: Player) => this.onLocalPlayerDied_(listener as Player, killer));
        Listener.add(localPlayer, 'usernotify', (listener: Listener, message: string) => this.onLocalPlayerUserNotify_(listener as Player, message));
        Listener.add(this.chatView_, 'onmessage', (listener: Listener, message: string) => this.onSendChatMessage_(listener as Chat, message));

        window.addEventListener('resize', this.onResize_.bind(this));
        window.addEventListener('focus', () => localPlayer.clearPresence(Player.Presence.AWAY));
        window.addEventListener('blur', () => localPlayer.setPresence(Player.Presence.AWAY));

        Timer.setInterval(this.heartbeat_.bind(this), 100);
        Notification.requestPermission();

        document.getElementById('game')!.classList.add('in-game');
        this.onResize_();
        this.renderingLoop_();
    }

    // Other methods remain unchanged

    private onResize_() {
        const width = window.innerWidth - (this.canvas_.parentNode as HTMLElement).offsetLeft;
        const height = window.innerHeight - (this.canvas_.parentNode as HTMLElement).offsetTop;

        const ratio = this.viewport_.getHdpiRatio();

        this.canvas_.width = width * ratio;
        this.canvas_.height = height * ratio;

        this.canvas_.style.width = `${width}px`;
        this.canvas_.style.height = `${height}px`;

        const context = this.canvas_.getContext('2d')!;
        context.imageSmoothingEnabled = false;
        (context as any).webkitImageSmoothingEnabled = false;
        context.scale(ratio, ratio);

        const size = RadarLayer.sizeForViewport(this.viewport_);
        this.chatView_.setRightPosition(size.width);
    }

    // Other methods remain unchanged
}
