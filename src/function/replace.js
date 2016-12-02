
export default function (str, from, to) {
  from = from.replace(/[$.]/g, '\\$&')
  return str.replace(
    new RegExp(`(?:^|\\b)${from}(?:$|\\b)`, 'g'),
    to
  )
}
