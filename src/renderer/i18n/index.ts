// src/i18n/index.ts
import { createI18n } from 'vue-i18n'

// 动态加载语言包
const loadMessages = async () => {
    const messages = {
        en: await import('./locales/en/translation.json'),
        zhHans: await import('./locales/zh-Hans/translation.json'),
    }
    return messages
}

// 创建 i18n 实例
const i18n = createI18n({
    legacy: false, // 启用 Composition API 风格
    locale: 'zhHans',  // 默认语言
    messages: await loadMessages(), // 语言包
})

export default i18n