import Game from 'ui/Game';
import Protocol from 'net/Protocol';
import ResourceManager from 'ResourceManager';
import Loading from 'ui/Loading';
import Jukebox from 'Jukebox';

export default class Application {
  private protocol_ : Protocol;
  private resourceManager_ : ResourceManager;
  private settings_ : any;
  private mapData_ : any;
  private mapProperties_ : any;
  private game_ : Game | undefined;
  private loadingView_ : Loading;
  private jukebox_ : Jukebox | null;

  constructor(settings : any, url : string) {
    this.protocol_ = new Protocol(url);
    this.resourceManager_ = new ResourceManager();
    this.settings_ = settings;
    this.mapData_ = {};
    this.mapProperties_ = {};
    this.loadingView_ = new Loading(this.resourceManager_, this.onLoadComplete_.bind(this));
    this.jukebox_ = null;

    let loginData = {
      'strategy': settings.strategy,
      'accessToken': settings.accessToken
    };

    this.protocol_.registerPacketHandler(Protocol.S2CPacketType.LOGIN_REPLY, this.startGame_.bind(this));
    this.protocol_.login(loginData);
  }

  private startGame_(packet : Array<any>) {
    if (packet[0] == 1) {
      const resources = packet[1];
      const settings = packet[2];
      const mapData = packet[3];
      const mapProperties = packet[4];

      this.settings_ = settings;
      this.mapData_ = mapData;
      this.mapProperties_ = mapProperties;

      this.loadingView_.load(resources);
      this.jukebox_ = new Jukebox(resources['music']);
    } else {
      alert('Login failure: ' + packet[1]);
    }
  }

  private onLoadComplete_() {
    this.game_ = new Game(this.protocol_, this.resourceManager_, this.settings_, this.mapData_, this.mapProperties_);
    if (this.jukebox_ != null) {
      this.jukebox_.play();
    }
  }
}
const startGame: EventListener = (event: Event) => {
  // window.location.host is the website
  let socketUri = 'ws://' + window.location.host + '/dotproduct/v1/' + 'trench';
  if (window.location.protocol === 'https:') {
    socketUri = socketUri.replace('ws:', 'wss:');
  }

  // Use a type assertion to ensure event.target is not null.
  const target = event.target as EventTarget;
  target.removeEventListener('click', startGame);

  // Here you might also need a type assertion or type guard
  // if Application expects the first parameter to be of a specific type.
  new Application({ strategy: 'anonymous', accessToken: '' }, socketUri);
};


  event.target.removeEventListener('click', startGame);
  new Application({ strategy: 'anonymous', accessToken: '' }, socketUri);
};

(window as any)._main = () => {
  const anonymousDiv = document.getElementById('anonymous') as HTMLDivElement;
  anonymousDiv.addEventListener('click', startGame);
};

