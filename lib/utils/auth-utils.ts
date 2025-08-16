import { randomBytes, createHash } from 'crypto';

const SALT_LENGTH = 16; // 16 bytes = 128 bits

export async function hashPassword(password: string): Promise<string> {
    // Generate a random salt
    const salt = randomBytes(SALT_LENGTH).toString('hex');

    // Create a hash using SHA-256
    const hash = createHash('sha256')
        .update(password + salt)
        .digest('hex');

    // Store both the hash and salt in the format: algorithm$salt$hash
    return `sha256$${salt}$${hash}`;
}

export async function verifyPassword(
    password: string,
    storedPassword: string
): Promise<boolean> {
    try {
        // Split the stored password into its components
        const [algorithm, salt, storedHash] = storedPassword.split('$');

        if (algorithm !== 'sha256' || !salt || !storedHash) {
            return false;
        }

        // Hash the provided password with the stored salt
        const hash = createHash('sha256')
            .update(password + salt)
            .digest('hex');

        return hash === storedHash;
    } catch (error) {
        console.error('Error verifying password:', error);
        return false;
    }
}
