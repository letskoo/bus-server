"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsProvider = void 0;
const axios_1 = __importDefault(require("axios"));
class SmsProvider {
    async send(phone, message) {
        var _a, _b;
        const url = (_a = process.env.SMS_API_URL) !== null && _a !== void 0 ? _a : '';
        const apiKey = (_b = process.env.SMS_API_KEY) !== null && _b !== void 0 ? _b : '';
        if (!url || !apiKey)
            return false;
        try {
            const response = await axios_1.default.post(url, { phone, message }, { headers: { Authorization: `Bearer ${apiKey}` } });
            return response.status >= 200 && response.status < 300;
        }
        catch {
            return false;
        }
    }
}
exports.SmsProvider = SmsProvider;
//# sourceMappingURL=sms.provider.js.map