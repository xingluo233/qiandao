import crypto from "crypto";

export function digest(data, type) {
    return crypto.createHash(type).update(data, 'utf8').digest('hex');
}

export function hmac(data, key, type) {
    return crypto.createHmac(type, key).update(data, 'utf8').digest('hex');
}

export function base64Encode(data) {
    return Buffer.from(data, "utf-8").toString('base64');
}

export function base64Decode(data) {
    return Buffer.from(data, 'base64').toString('utf-8');
}

export function hexEncode(data) {
    return Buffer.from(data, "utf-8").toString('hex');
}

export function hexDecode(data) {
    return Buffer.from(data, 'hex').toString('utf-8');
}

export function uuid() {
    let buf = crypto.randomBytes(16);
    buf[6] = (buf[6] & 0x0f) | 0x40;
    buf[8] = (buf[8] & 0x3f) | 0x80;
    let hex = buf.toString('hex').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
    hex.shift();
    return `${hex[0]}-${hex[1]}-${hex[2]}-${hex[3]}-${hex[4]}`;
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}