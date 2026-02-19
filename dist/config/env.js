"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envFilePath = void 0;
exports.envFilePath = (() => {
    var _a;
    const nodeEnv = (_a = process.env.NODE_ENV) !== null && _a !== void 0 ? _a : 'development';
    if (nodeEnv === 'production') {
        return '.env.production';
    }
    return '.env.development';
})();
//# sourceMappingURL=env.js.map