import Yox from './Yox'

type YoxClass = typeof Yox

export default interface Plugin {
  install(Yox: YoxClass): void
}