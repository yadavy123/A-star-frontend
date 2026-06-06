declare module '../api/api/teacherApi' {
    export function getPublicTeachers(...args: unknown[]): Promise<{ id: string; name: string; photoUrl?: string; image?: string; subject?: string; category?: string; bio?: string; status?: string }[]>;
}
