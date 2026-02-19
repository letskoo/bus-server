"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.haversineKm = haversineKm;
exports.estimateEtaMinutes = estimateEtaMinutes;
function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371; // km
    const dLat = deg2rad(lat2 - lat1);
    const dLng = deg2rad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
function estimateEtaMinutes(distanceKm, speedKmh = 25) {
    if (speedKmh <= 0)
        return null;
    return Math.max(0, Math.round((distanceKm / speedKmh) * 60));
}
//# sourceMappingURL=geo.util.js.map