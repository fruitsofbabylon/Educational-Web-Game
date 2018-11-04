import Phaser from 'phaser'

export default class CameraScene extends Phaser.Scene {
  constructor(config) {
    super(config)
    this.x = config.x
    this.y = config.y
    this.width = config.width
    this.height = config.height
  }

  preload() {
    const graphics = this.add.graphics()
    graphics.fillStyle(0xFFFFFF, 1.0)
    graphics.fillRect(this.x, this.y, this.width, this.height)
  }
}
