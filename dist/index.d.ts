import { type Context, MoonPlugin, type MoonPluginConstructorProps, type MoonPluginSettings, type PluginSettingsDescription } from '@moonjot/moon';
interface ReflectPluginSettingsDescription extends PluginSettingsDescription {
    token: {
        type: 'string';
        required: boolean;
        label: string;
        description: string;
    };
    graphId: {
        type: 'string';
        required: boolean;
        label: string;
        description: string;
    };
    template: {
        type: 'text';
        required: boolean;
        label: string;
        description: string;
        default: string;
    };
}
interface ReflectPluginSettings extends MoonPluginSettings {
    token: string;
    template: string;
}
export default class extends MoonPlugin {
    name: string;
    logo: string;
    settingsDescription: ReflectPluginSettingsDescription;
    settings: ReflectPluginSettings;
    log: ((log: string) => void) | undefined;
    constructor(props?: MoonPluginConstructorProps<ReflectPluginSettings>);
    integration: {
        callback: ({ context, markdown }: {
            html: string;
            markdown: string;
            context: Context;
        }) => Promise<boolean | {
            url: string;
        }>;
        buttonIconUrl: string;
    };
}
export {};
