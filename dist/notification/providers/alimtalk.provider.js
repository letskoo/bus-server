"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlimtalkProvider = void 0;
const axios_1 = __importDefault(require("axios"));
class AlimtalkProvider {
    async send(phone, message) {
        var _a, _b;
        const url = (_a = process.env.ALIMTALK_API_URL) !== null && _a !== void 0 ? _a : '';
        const apiKey = (_b = process.env.ALIMTALK_API_KEY) !== null && _b !== void 0 ? _b : '';
        if (!url || !apiKey) {
            return { ok: false, reason: 'NO_CONFIG' };
        }
        try {
            const response = await axios_1.default.post(url, { phone, message }, { headers: { Authorization: `Bearer ${apiKey}` } });
            if (response.status < 200 || response.status >= 300) {
                return { ok: false, reason: 'HTTP_ERROR' };
            }
            const data = response.data;
            if ((data === null || data === void 0 ? void 0 : data.fallback) === 'SMS' || (data === null || data === void 0 ? void 0 : data.reason) === 'NO_KAKAO') {
                return { ok: false, reason: 'NO_KAKAO' };
            }
            return { ok: true };
        }
        catch {
            return { ok: false, reason: 'HTTP_ERROR' };
        }
    }
}
exports.AlimtalkProvider = AlimtalkProvider;
//# sourceMappingURL=alimtalk.provider.js.map