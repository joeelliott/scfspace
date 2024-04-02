export default class Jukebox {
  private audio_: HTMLAudioElement;
  private tracks_: Array<any>;
  private shouldPlay_: boolean;
  private index_: number;

  constructor(tracks: Array<any>) {
    this.audio_ = document.getElementById('jukebox') as HTMLAudioElement;
    this.tracks_ = tracks;
    this.index_ = 0;
    this.shouldPlay_ = false;  // Initialize shouldPlay_ here

    this.audio_.addEventListener('canplay', this.onPlayReady_.bind(this));
    this.audio_.addEventListener('ended', this.nextTrack_.bind(this));

    this.nextTrack_();
  }

  public play() {
    this.audio_.play();
    this.shouldPlay_ = true;
  }

  public stop() {
    this.shouldPlay_ = false;
    this.audio_.pause();
  }

  private nextTrack_() {
    this.audio_.src = this.tracks_[this.index_]['url'];
    this.index_ = (this.index_ + 1) % this.tracks_.length;
    // Consider setting shouldPlay_ to true here if you want playback to start immediately
    // upon calling nextTrack_ for the first time
  }

  private onPlayReady_() {
    if (this.shouldPlay_) {
      this.audio_.play();
    }
  }
}
