
import Scanner from '../../../src/compiler/helper/Scanner'

describe('compiler/helper/Scanner', function () {
  it('Scanner', function () {
    let scanner = new Scanner(`
      1
      <img>
      1
      <img src="">
      1
      <img src="http://baidu.com">
      1
    `)
    let imagePattern = /<img[^>]*?>/
    let images = []
    while (scanner.hasNext()) {
      scanner.nextBefore(imagePattern)
      let match = scanner.nextAfter(imagePattern)
      if (match && match.startsWith('<img')) {
        images.push(match)
      }
    }
    expect(images.length).toBe(3)
  })
})
