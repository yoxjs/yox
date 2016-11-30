
import * as is from '../util/is'

export default function (fn, context, args) {
  if (is.func(fn)) {
    if (is.array(args)) {
      fn.apply(context, args)
    }
    else {
      fn.call(context, args)
    }
  }
}
