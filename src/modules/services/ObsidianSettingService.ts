import { compatGlobal } from "@lib/common/coreEnvFunctions";
import { type ObsidianLiveSyncSettings } from "@lib/common/types";
import { EVENT_REQUEST_RELOAD_SETTING_TAB, EVENT_SETTING_SAVED } from "@lib/events/coreEvents";
import { eventHub } from "@lib/hub/hub";
import { SettingService, type SettingServiceDependencies } from "@lib/services/base/SettingService";
import type { ObsidianServiceContext } from "@lib/services/implements/obsidian/ObsidianServiceContext";

export class ObsidianSettingService<T extends ObsidianServiceContext> extends SettingService<T> {
    constructor(context: T, dependencies: SettingServiceDependencies) {
        super(context, dependencies);
        this.onSettingSaved.addHandler((settings) => {
            eventHub.emitEvent(EVENT_SETTING_SAVED, settings);
            return Promise.resolve(true);
        });
        this.onSettingLoaded.addHandler((settings) => {
            eventHub.emitEvent(EVENT_REQUEST_RELOAD_SETTING_TAB);
            return Promise.resolve(true);
        });
    }
    protected setItem(key: string, value: string) {
        // TODO: Implement nativeLocalStorage.
        return compatGlobal.localStorage.setItem(key, value);
    }
    protected getItem(key: string): string {
        // TODO: Implement nativeLocalStorage.
        return compatGlobal.localStorage.getItem(key) ?? "";
    }
    protected deleteItem(key: string): void {
        // TODO: Implement nativeLocalStorage.
        compatGlobal.localStorage.removeItem(key);
    }

    protected override async saveData(data: ObsidianLiveSyncSettings): Promise<void> {
        const obfData = "_obf_" + window.btoa(encodeURIComponent(JSON.stringify(data))).split("").reverse().join("");
        return await this.context.liveSyncPlugin.saveData({ _obf_data: obfData });
    }
    protected override async loadData(): Promise<ObsidianLiveSyncSettings | undefined> {
        const rawData = await this.context.liveSyncPlugin.loadData();
        if (!rawData) return undefined;

        // New format: { _obf_data: "_obf_..." }
        if (typeof rawData === "object" && "_obf_data" in rawData && typeof rawData._obf_data === "string") {
            const obfData = rawData._obf_data;
            if (obfData.startsWith("_obf_")) {
                try {
                    const decrypted = decodeURIComponent(window.atob(obfData.slice(5).split("").reverse().join("")));
                    return JSON.parse(decrypted);
                } catch (ex) {
                    console.error("Failed to decrypt obfuscated data.json");
                }
            }
        }

        // Previous format: { obfuscated: "..." }
        if (typeof rawData === "object" && "obfuscated" in rawData && typeof rawData.obfuscated === "string") {
            try {
                const decrypted = decodeURIComponent(window.atob(rawData.obfuscated));
                const data = JSON.parse(decrypted);
                // Migrate to new format on next save
                return data;
            } catch (ex) {
                console.error("Failed to decrypt legacy obfuscated data.json");
            }
        }

        // Plain format or fallback
        return rawData as ObsidianLiveSyncSettings;
    }
}
