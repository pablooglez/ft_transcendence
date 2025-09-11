import db from "../db/sqlite"

export interface RefreshToken {
    id: number;
    user_id: number;
    token: string;
    created_at: string;
}

export class RefreshTokenRepository {
    add(userId: number, token: string): void {
        db.prepare("INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)").run(userId, token);
    }

    findByToken(token: string): RefreshToken | undefined {
        return db.prepare("SELECT * FROM refresh_tokens WHERE token = ?").get(token);
    }

    delete(token: string): void {
        db.prepare("DELETE FROM refresh_tokens WHERE token = ?").run(token);
    }

    deleteAllForUser(userId: number): void {
        db.prepare("DELETE FROM refresh_tokens WHERE user_id = ?").run(userId);
    }

    updateGracePeriod(token: string, graceUntil: number) {
        db.prepare("UPDATE refresh_tokens SET grace_until = ? WHERE token = ?").run(new Date(graceUntil).toISOString(), token);
    }

    isValid(token: string) {
        const stmt = db.prepare("SELECT * FROM refresh_tokens WHERE token = ?");
        const row = stmt.get(token);
        if (!row)
            return (false);

        if (!row.grace_until)
            return (true);

        const graceUntil = new Date(row.grace_until).getTime();
        return Date.now() <= graceUntil;
    }

    cleanupOldTokens() {
        const now = new Date().toISOString();
        db.prepare("DELETE FROM refresh_tokens WHERE grace_until IS NOT NULL AND grace_until <= ?").run(now);
    }
}