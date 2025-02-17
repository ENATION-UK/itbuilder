import { reactive } from 'vue';
import {ElectronAPI} from "./electron-api.ts";

const fileName = 'user-settings.json';

export interface ModelSettings {
    supplierSelected: string | null;
    apiKey: string;
    apiUrl: string;
    modelName: string | null;
    maxToken: string;
}

const defaultSettings: ModelSettings = {
    supplierSelected: null,
    apiKey: '',
    apiUrl: '',
    modelName: null,
    maxToken: '',
};

export const settings = reactive<ModelSettings>({ ...defaultSettings });

export async function loadSettings() {
    try {
        const exists = await ElectronAPI.userFileExists(fileName);
        if (!exists) {
            await ElectronAPI.writeUserFile(fileName, JSON.stringify(defaultSettings, null, 2));
            Object.assign(settings, defaultSettings);
            return;
        }
        const content = await ElectronAPI.readUserFile(fileName);
        const parsed = JSON.parse(content);
        Object.assign(settings, parsed);
    } catch (error) {
        console.warn('Failed to load settings:', error);
    }
}

export async function saveSettings() {
    try {
        await ElectronAPI.writeUserFile(fileName, JSON.stringify(settings, null, 2));
    } catch (error) {
        console.error('Failed to save settings:', error);
    }
}
