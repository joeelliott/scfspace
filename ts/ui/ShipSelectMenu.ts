import Game from 'ui/Game';
import Image from 'graphics/Image';
import Listener from 'Listener';
import LocalPlayer from 'model/player/LocalPlayer';
import Menu from 'ui/Menu';
import MenuBar from 'ui/MenuBar';
import ResourceManager from 'ResourceManager';

// Define an interface for the game settings that include ship configurations
interface GameSettings {
  ships: any[]; // Adjust the type according to your ship settings structure
}

export default class ShipSelectMenu implements Menu {
  private readonly menuBar_: MenuBar;
  private readonly rootNode_: HTMLDivElement;
  private readonly resourceManager_: ResourceManager;
  private readonly player_: LocalPlayer;

  constructor(menuBar: MenuBar, game: Game) {
    this.menuBar_ = menuBar;
    this.rootNode_ = document.getElementById('ss') as HTMLDivElement;
    this.resourceManager_ = game.getResourceManager();
    this.player_ = game.simulation.playerList.localPlayer;

    // Use type assertion for game settings to access ships array safely
    const settings = game.simulation.settings as GameSettings;
    settings.ships.forEach((ship, index) => this.addShip_(index, ship));

    Listener.add(this.player_, 'shipchange', this.shipChange_.bind(this));
    this.shipChange_(this.player_, this.player_.ship);
  }

  public get rootNode(): HTMLDivElement {
    return this.rootNode_;
  }

  private shipChange_(target: LocalPlayer, ship: number): void {
    let containers = this.rootNode_.getElementsByClassName('ss-c');
    for (let x = 0; x < containers.length; ++x) {
      containers[x].classList.remove('ss-cur');
    }
    if (containers[ship]) {
      containers[ship].classList.add('ss-cur');
    }
  }

  private addShip_(ship: number, shipSettings: any): void {
    const image = this.resourceManager_.getImage('ship' + ship);
    const container = document.createElement('div');
    const canvas = document.createElement('canvas');

    container.classList.add('ss-c');

    canvas.width = image.tileWidth * window.devicePixelRatio;
    canvas.height = image.tileHeight * window.devicePixelRatio;
    canvas.style.width = image.tileWidth + 'px';
    canvas.style.height = image.tileHeight + 'px';

    let context = canvas.getContext('2d')!;
    context.imageSmoothingEnabled = false;
    if (context.hasOwnProperty('webkitImageSmoothingEnabled')) {
      (context as any).webkitImageSmoothingEnabled = false; // Use with caution; non-standard
    }
    context.scale(window.devicePixelRatio, window.devicePixelRatio);

    image.render(context, 0, 0, 0);
    container.appendChild(canvas);
    container.addEventListener('click', () => this.selectShip_(ship));
    this.rootNode_.appendChild(container);
  }

  private selectShip_(ship: number): void {
    if (this.player_.requestShipChange(ship)) {
      this.menuBar_.dismiss(this);
    }
  }
}
