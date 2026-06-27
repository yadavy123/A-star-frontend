export type LocalGrade = {
    id: string;
    name: string;
    order: number;
};

export type LocalSubject = {
    id: string;
    name: string;
    gradeId: string;
    order: number;
};

export const LOCAL_GRADES: LocalGrade[] = [
    { id: 'primary', name: 'Primary (Grades 1-5)', order: 1 },
    { id: 'lower-secondary', name: 'Lower Secondary (Grades 6-8)', order: 2 },
    { id: 'igcse', name: 'IGCSE (Grades 9-10)', order: 3 },
    { id: 'as-level', name: 'AS Level (Grade 11)', order: 4 },
    { id: 'a-level', name: 'A Level (Grade 12)', order: 5 },
];

export const LOCAL_SUBJECTS: LocalSubject[] = [
    { id: 'maths', name: 'Mathematics', gradeId: 'primary', order: 1 },
    { id: 'science', name: 'Science / Environmental Studies', gradeId: 'primary', order: 2 },
    { id: 'languages', name: 'Languages', gradeId: 'primary', order: 3 },
    { id: 'social-studies', name: 'Social Studies', gradeId: 'primary', order: 4 },
    { id: 'cs', name: 'Computer Science', gradeId: 'primary', order: 5 },

    { id: 'maths-ls', name: 'Mathematics', gradeId: 'lower-secondary', order: 1 },
    { id: 'science-ls', name: 'Science / Environmental Studies', gradeId: 'lower-secondary', order: 2 },
    { id: 'languages-ls', name: 'Languages', gradeId: 'lower-secondary', order: 3 },
    { id: 'social-studies-ls', name: 'Social Studies', gradeId: 'lower-secondary', order: 4 },
    { id: 'cs-ls', name: 'Computer Science', gradeId: 'lower-secondary', order: 5 },

    { id: 'maths-ig', name: 'Mathematics (Core or Extended)', gradeId: 'igcse', order: 1 },
    { id: 'physics-ig', name: 'Physics', gradeId: 'igcse', order: 2 },
    { id: 'chemistry-ig', name: 'Chemistry', gradeId: 'igcse', order: 3 },
    { id: 'biology-ig', name: 'Biology', gradeId: 'igcse', order: 4 },
    { id: 'languages-ig', name: 'Languages', gradeId: 'igcse', order: 5 },
    { id: 'humanities-ig', name: 'Humanities and Social Studies', gradeId: 'igcse', order: 6 },
    { id: 'cs-ig', name: 'Computer Science', gradeId: 'igcse', order: 7 },

    { id: 'physics-as', name: 'Physics', gradeId: 'as-level', order: 1 },
    { id: 'chemistry-as', name: 'Chemistry', gradeId: 'as-level', order: 2 },
    { id: 'economics-as', name: 'Economics', gradeId: 'as-level', order: 3 },
    { id: 'maths-as', name: 'Mathematics', gradeId: 'as-level', order: 4 },
    { id: 'further-maths-as', name: 'Further Mathematics', gradeId: 'as-level', order: 5 },
    { id: 'languages-as', name: 'Languages', gradeId: 'as-level', order: 6 },
    { id: 'biology-as', name: 'Biology', gradeId: 'as-level', order: 7 },

    { id: 'physics-al', name: 'Physics', gradeId: 'a-level', order: 1 },
    { id: 'chemistry-al', name: 'Chemistry', gradeId: 'a-level', order: 2 },
    { id: 'economics-al', name: 'Economics', gradeId: 'a-level', order: 3 },
    { id: 'maths-al', name: 'Mathematics', gradeId: 'a-level', order: 4 },
    { id: 'further-maths-al', name: 'Further Mathematics', gradeId: 'a-level', order: 5 },
    { id: 'languages-al', name: 'Languages', gradeId: 'a-level', order: 6 },
    { id: 'biology-al', name: 'Biology', gradeId: 'a-level', order: 7 },
];

export function getLocalGradeName(gradeId: string): string | undefined {
    return LOCAL_GRADES.find(g => g.id === gradeId)?.name;
}

export function getLocalSubjectName(subjectId: string): string | undefined {
    return LOCAL_SUBJECTS.find(s => s.id === subjectId)?.name;
}
