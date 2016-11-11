
import * as env from '../config/env'

import * as is from './is'

export default class Event {

  constructor(event) {
    if (event.type) {
      this.type = event.type
      this.originalEvent = event
    }
    else {
      this.type = event
    }
  }

  prevent() {
    if (!this.isPrevented) {
      let { originalEvent } = this
      if (originalEvent && is.func(originalEvent.preventDefault)) {
        originalEvent.preventDefault()
      }
      this.isPrevented = env.TRUE
    }
  }

  stop() {
    if (!this.isStoped) {
      let { originalEvent } = this
      if (originalEvent && is.func(originalEvent.stopPropagation)) {
        originalEvent.stopPropagation()
      }
      this.isStoped = env.TRUE
    }
  }

}


