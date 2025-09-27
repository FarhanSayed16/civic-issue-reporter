// Obfuscated Encryption Key Implementation for Frontend
// This file contains obfuscated functions to hide the encryption key and AAD

function getEncryptionData() {
    // Obfuscated encryption key data
    const chars = [46, 58, 65, 50, 15, 13, 75, 78, 65, 40, 44, 61, 46, 10, 60, 78, 44, 83, 30, 60, 26, 87, 30, 43, 53, 78, 75, 40, 87, 15, 23, 75, 77, 1, 76, 79, 53, 16, 11, 29, 41, 59, 11, 69];
    const xorKey = 120;
    return { chars, xorKey };
}

export function getEncryptionKey() {
    // Returns the decrypted encryption key
    const { chars, xorKey } = getEncryptionData();
    return chars.map(c => String.fromCharCode(c ^ xorKey)).join('');
}

function getAADData() {
    // Obfuscated AAD data
    const chars = [249, 249, 178, 214, 250, 211, 180, 244, 231, 211, 204, 242, 234, 194, 228, 178, 238, 183, 219, 193, 182, 244, 190, 190];
    const xorKey = 131;
    return { chars, xorKey };
}

export function getAADString() {
    // Returns the decrypted AAD string
    const { chars, xorKey } = getAADData();
    return chars.map(c => String.fromCharCode(c ^ xorKey)).join('');
}

// Dummy functions to confuse reverse engineering
export function getDummyKey1() {
    return "dummy_key_1_not_real";
}

export function getDummyKey2() {
    return "dummy_key_2_not_real";
}

export function getDummyKey3() {
    return "dummy_key_3_not_real";
}

export function calculateHash() {
    return "hash_not_real";
}

export function validateKey() {
    return true;
}

// Additional obfuscation methods
export function getKeyPart1() {
    return "VB9Jwu36";
}

export function getKeyPart2() {
    return "9PTEVrD6";
}

export function getKeyPart3() {
    return "T+fDb/fS";
}

export function getKeyPart4() {
    return "M63P/wo3";
}

export function getKeyPart5() {
    return "5y47Mhse";
}

export function getKeyPart6() {
    return "QCs=";
}

export function getFullKeyFromParts() {
    return getKeyPart1() + getKeyPart2() + getKeyPart3() + getKeyPart4() + getKeyPart5() + getKeyPart6();
}
