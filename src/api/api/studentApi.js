const STORAGE_KEY = 'icfy_admin_students';

const loadFromLocal = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && saved.length > 0) return saved;
    const registered = JSON.parse(localStorage.getItem('icfy_users') || '[]');
    const mapped = registered
      .filter(u => u.role !== 'admin')
      .map(u => ({
        id: u.studentId || u.id,
        name: u.fullName || u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        status: u.status || 'active',
        enrollmentDate: u.enrollmentDate || new Date().toISOString().split('T')[0],
      }));
    if (mapped.length > 0) {
      saveToLocal(mapped);
      return mapped;
    }
    return [];
  } catch {
    return [];
  }
};

const saveToLocal = (students) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch { /* quota */ }
};

export const getStudents = async () => {
  return { success: true, data: loadFromLocal() };
};

export const createStudent = async (student) => {
  const students = loadFromLocal();
  const exists = students.some(s => s.email === student.email);
  if (exists) return { success: false, error: 'Email already exists' };
  students.push(student);
  saveToLocal(students);
  const users = JSON.parse(localStorage.getItem('icfy_users') || '[]');
  users.push({
    fullName: student.name, email: student.email,
    phone: student.phone, studentId: student.id, id: student.id,
    password: '123456',
    role: 'student', enrollmentDate: student.enrollmentDate, status: 'active',
  });
  localStorage.setItem('icfy_users', JSON.stringify(users));
  return { success: true, data: student };
};

export const deleteStudent = async (id) => {
  const students = loadFromLocal();
  saveToLocal(students.filter(s => s.id !== id));
  const users = JSON.parse(localStorage.getItem('icfy_users') || '[]');
  localStorage.setItem('icfy_users', JSON.stringify(users.filter(u => u.id !== id && u.studentId !== id)));
  return { success: true };
};

export const updateStudentStatus = async (id, status) => {
  const students = loadFromLocal();
  saveToLocal(students.map(s => s.id === id ? { ...s, status } : s));
  return { success: true };
};
