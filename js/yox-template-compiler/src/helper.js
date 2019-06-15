import * as env from '../../yox-common/src/util/env';
import * as nodeType from './nodeType';
// 特殊标签
export const specialTags = {};
// 特殊属性
export const specialAttrs = {};
// 名称 -> 类型的映射
export const name2Type = {};
specialTags[env.RAW_SLOT] =
    specialTags[env.RAW_TEMPLATE] =
        specialAttrs[env.RAW_KEY] =
            specialAttrs[env.RAW_REF] =
                specialAttrs[env.RAW_SLOT] = env.TRUE;
name2Type['if'] = nodeType.IF;
name2Type['each'] = nodeType.EACH;
name2Type['partial'] = nodeType.PARTIAL;
