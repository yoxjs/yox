
import * as env from 'yox-common/util/env'

import * as modern from './nativeModern'
import * as oldie from './nativeOldie'

let native = env.doc.addEventListener ? modern : oldie

export let addListener = native.addListener
export let removeListener = native.removeListener
export let createEvent = native.createEvent
export let findElement = native.findElement
