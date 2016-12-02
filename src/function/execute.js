
import * as is from '../util/is'

export default function (fn, context, args) {
  if (is.func(fn)) {
    if (is.array(args)) {
      return fn.apply(context, args)
    }
    else {
      return fn.call(context, args)
    }
  }
}
