"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const moon_1 = require("@moonjot/moon");
const moon_utils_1 = require("@moonjot/moon-utils");
const template_1 = require("./template");
class default_1 extends moon_1.MoonPlugin {
    constructor(props) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        super(props);
        this.name = 'Reflect';
        this.logo = 'https://reflect.app/_next/image?url=%2Fsite%2Ficons%2F1024x1024.png&w=1080&q=75';
        this.settingsDescription = {
            token: {
                type: 'string',
                required: true,
                label: 'Token',
                description: 'Reflect API token. Go to [https://reflect.app/developer/oauth](https://reflect.app/developer/oauth)'
            },
            graphId: {
                type: 'string',
                required: true,
                label: 'Graph Id',
                description: 'Check in the reflect.app URL https://reflect.app/g/GRAPH_ID_WILL_BE_HERE/RANDOM_NUMBER'
            },
            template: {
                type: 'text',
                required: true,
                label: 'Template of capture',
                description: 'Format your note result inside Reflect. [Documentation](https://github.com/castroCrea/moon-reflect-plugin/blob/main/README.md)',
                default: template_1.DEFAULT_TEMPLATE
            }
        };
        this.settings = {
            token: '',
            graphId: '',
            template: template_1.DEFAULT_TEMPLATE
        };
        this.integration = {
            callback: ({ context, markdown }) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                const handleDateContent = (0, moon_utils_1.turnDate)({ content: this.settings.template });
                const searchObj = Object.assign({ content: markdown }, context);
                const handlePropertiesContent = (_a = (0, moon_utils_1.handleReplacingProperties)({ content: handleDateContent, searchObj })) !== null && _a !== void 0 ? _a : '';
                let handleConditionContent = (_c = (_b = (0, moon_utils_1.handleConditions)({ content: handlePropertiesContent, searchObj })) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : '';
                const title = (0, moon_utils_1.extractTitleFromMarkdown)(handleConditionContent);
                if (title)
                    handleConditionContent = handleConditionContent.split('\n').slice(1).join('\n');
                if (title) {
                    const response = yield fetch(`https://reflect.app/api/graphs/${this.settings.graphId}/notes`, {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${this.settings.token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            subject: title,
                            content_markdown: handleConditionContent
                        })
                    }).then((r) => __awaiter(this, void 0, void 0, function* () { return yield r.json(); }));
                    return response.id ? { url: `https://reflect.app/g/${this.settings.graphId}/${response.id}` } : false;
                }
                else {
                    const response = yield fetch(`https://reflect.app/api/graphs/${this.settings.graphId}/daily-notes`, {
                        method: 'PUT',
                        headers: {
                            Authorization: `Bearer ${this.settings.token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            text: handleConditionContent,
                            transform_type: 'list-append'
                        })
                    }).then((r) => __awaiter(this, void 0, void 0, function* () { return yield r.json(); }));
                    (_d = this.log) === null || _d === void 0 ? void 0 : _d.call(this, JSON.stringify({ response }));
                    return response.success === true;
                }
            }),
            buttonIconUrl: 'https://reflect.app/_next/image?url=%2Fsite%2Ficons%2F1024x1024.png&w=1080&q=75'
        };
        if (!props)
            return;
        if (props.settings)
            this.settings = Object.assign(Object.assign({}, this.settings), props.settings);
        this.log = props.helpers.moonLog;
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map