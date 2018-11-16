import * as PIXI from 'pixi.js'
import { BaseScene } from './baseScene';
import { levels, currentLevel, modes } from '../levels';

const resources = PIXI.loader.resources

const MODES = {
  camera: modes[0],
  action: modes[1]
}

export default class OutputScene extends BaseScene {
  constructor(config) {
    super(config)

    this.init()
  }

  init() {
    this.bg = this.getChildAt(0)
  }

  onModeUpdate(newMode) {
    this.mode = newMode
    this.clear()

    if (this.mode == MODES.camera) {
      this.actions = levels[currentLevel].actionsOrder.slice(0) // Copy to prevent changing original
      this.showHint(5000)
    }
  }

  onAction(actions) {
    if (actions.length == 0) return

    this.clear()

    this.sprites = actions.map(action => {
      const actionSprite = new PIXI.Sprite(resources[action].texture)
      actionSprite.width = 64
      actionSprite.height = 64
      actionSprite.name = "currentSprite"

      actionSprite.position = new PIXI.Point(
        this.sceneConfig.width / 2 - actionSprite.width / 2,
        this.sceneConfig.height /2 - actionSprite.height / 2
      )

      return [action, actionSprite, 1000]
    })

    if (this.mode == MODES.camera) {
      this.scheduleCamera()
    } else if (this.mode == MODES.action) {
      this.actions = levels[currentLevel].actionsOrder.slice(0) // Copy to prevent changing original
      this.scheduleSequence(0)
    }
  }

  scheduleSequence(millis) {
    this.sequenceTimeout = setTimeout(() => {
      const [id, sprite, duration] = this.sprites.shift()
      const correctId = this.actions.shift()

      this.removeChild(this.getChildByName("currentSprite"))
      this.addChild(sprite)

      if (this.actions.length == 0 && this.sprites.length == 0) {
        this.showSuccess()
      } else if (this.sprites.length == 0 || correctId != id) {
        this.showError()
      } else if (this.sprites.length > 0) {
        this.scheduleSequence(duration)
      }
    }, millis)
  }

  scheduleCamera() {
    const [id, sprite, duration] = this.sprites.shift()
    const correctId = this.actions.shift()

    console.log(id, correctId)

    this.removeChild(this.getChildByName("currentSprite"))
    this.addChild(sprite)

    if (this.actions.length == 0 && this.sprites.length == 0) {
      this.showSuccess()
      return
    } else if (correctId != id) {
      this.showError()
      this.actions.unshift(correctId)
      this.showHint(0)
    } else {
      this.showHint(duration + 2000)
    }
  }

  showError() {
    this.bg.clear()
      .beginFill(0xFF0000, 1.0)
      .drawRect(0, 0, this.sceneConfig.width, this.sceneConfig.height)
      .endFill()
  }

  clear() {
    this.removeChildren()
    this.addChild(this.bg)

    clearTimeout(this.sequenceTimeout)
    clearTimeout(this.hintTimeout)

    this.bg.clear()
      .beginFill(0x000000, 1.0)
      .drawRect(0, 0, this.sceneConfig.width, this.sceneConfig.height)
      .endFill()
  }

  showSuccess() {
    this.bg.clear()
      .beginFill(0x00FF00, 1.0)
      .drawRect(0, 0, this.sceneConfig.width, this.sceneConfig.height)
      .endFill()
  }

  showHint(delay) {
    this.removeChild(this.getChildByName('hint'))
    if (this.actions.length == 0) return

    const hintSprite = new PIXI.Sprite(resources[this.actions[0]].texture)
    hintSprite.width = 64
    hintSprite.height = 64
    hintSprite.position = new PIXI.Point(32, 32)
    const hint = new PIXI.Container()
    hint.name = "hint"
    hint.addChild(
      new PIXI.Graphics()
        .beginFill(0xFFFFFF, 1.0)
        .drawRoundedRect(0, 0, 128, 128, 32)
        .endFill(),
       hintSprite
    )

    hint.position = new PIXI.Point(
      this.sceneConfig.width / 2 - hint.width / 2,
      this.sceneConfig.height /2 - hint.height / 2
    )

    clearTimeout(this.hintTimeout)
    this.hintTimeout = setTimeout(() => {
      this.addChild(hint)
    }, delay)
  }
}