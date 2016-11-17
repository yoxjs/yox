
import * as env from '../../config/env'

import * as modern from './modern'
import * as oldie from './oldie'

let native = env.doc.addEventListener ? modern : oldie

export let addListener = native.addListener
export let removeListener = native.removeListener
export let createEvent = native.createEvent
export let findElement = native.findElement
