// src/i18n/index.ts
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
    legacy: false,
    locale: 'zhHans',  // 默认语言
    messages: {} // 先创建一个空对象，稍后再加载语言包
})

// 动态加载语言包
const loadMessages = async () => {
    const messages = {
        en: (await import('./locales/en/translation.json')).default,
        zhHans: (await import('./locales/zh-Hans/translation.json')).default,
    }
    Object.keys(messages).forEach(lang => {
        i18n.global.setLocaleMessage(lang, messages[lang])
    })
}

loadMessages() // 异步加载语言包

export default i18n