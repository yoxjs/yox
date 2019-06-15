import * as env from '../util/env';
export default function (target) {
    return target !== env.UNDEFINED;
}
