import db from "../db/sqlite"

export interface PlayerCreateDTO {
    username: string;
    user_id: number | null;
    tournament_id: number;
    seed?: number;
    is_ai?: boolean;
}

export class PlayerRepository {
    static getByTournamentId(tournamentId: number) {
        const stmt = db.prepare(`SELECT * FROM players WHERE tournament_id = ? ORDER BY seed ASC`);
        return stmt.all(tournamentId);
    }

    static countByTournamentId(tournamentId: number): number {
        const stmt = db.prepare(`SELECT COUNT(*) as count FROM players WHERE tournament_id = ?`);
        const row = stmt.get(tournamentId);
        return row?.count || 0;
    }

    static getByUserAndTournament(userId: number, tournamentId: number) {
        const stmt = db.prepare(`SELECT * FROM players WHERE user_id = ? AND tournament_id = ?`);
        return stmt.get(userId, tournamentId);
    }

    static create(data: PlayerCreateDTO) {
        const stmt = db.prepare(`
            INSERT INTO players (username, user_id, tournament_id, seed, is_ai)
            VALUES (?, ?, ?, ?, ?)`);
        
        const result = stmt.run(
            data.username,
            data.user_id,
            data.tournament_id,
            data.seed ?? null,
            data.is_ai ? 1 : 0
        );
        return result.lastInsertRowid as number;
    }

    static removeByUserAndTournament(userId: number, tournamentId: number): void {
        const stmt = db.prepare(`DELETE FROM players WHERE user_id = ? AND tournament_id = ?`);
        stmt.run(userId, tournamentId);
    }
}